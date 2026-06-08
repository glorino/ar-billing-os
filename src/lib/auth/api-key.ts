import crypto from "crypto";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export interface ApiKeyRecord {
  id: string;
  tenantId: string;
  name: string;
  keyHash: string;
  prefix: string;
  scopes: string[];
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
}

export interface ApiKeyValidation {
  valid: boolean;
  tenantId?: string;
  keyId?: string;
  scopes?: string[];
  error?: string;
}

export interface CreateApiKeyInput {
  tenantId: string;
  name: string;
  scopes?: string[];
  expiresInDays?: number;
}

export interface CreateApiKeyResult {
  id: string;
  key: string;
  prefix: string;
  name: string;
  scopes: string[];
  expiresAt: Date | null;
  createdAt: Date;
}

const API_KEY_PREFIX = "arb_";
const KEY_LENGTH = 48;

function generateApiKeyString(): string {
  const bytes = new Uint8Array(KEY_LENGTH);
  crypto.getRandomValues(bytes);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function hashKey(key: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(key, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyKey(key: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  const computedHash = crypto.scryptSync(key, salt, 64).toString('hex');
  return computedHash === hash;
}

function extractPrefix(key: string): string {
  return key.substring(0, 12);
}

export async function createApiKey(
  input: CreateApiKeyInput
): Promise<CreateApiKeyResult> {
  const rawKey = API_KEY_PREFIX + generateApiKeyString();
  const keyHash = hashKey(rawKey);
  const prefix = extractPrefix(rawKey);

  const expiresAt = input.expiresInDays
    ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const [record] = await db
    .insert(apiKeys)
    .values({
      tenantId: input.tenantId,
      name: input.name,
      keyHash,
      prefix,
      scopes: input.scopes ?? ["*"],
      expiresAt,
    })
    .returning();

  return {
    id: record.id,
    key: rawKey,
    prefix,
    name: input.name,
    scopes: record.scopes ?? [],
    expiresAt,
    createdAt: record.createdAt,
  };
}

export async function validateApiKey(
  rawKey: string
): Promise<ApiKeyValidation> {
  if (!rawKey.startsWith(API_KEY_PREFIX)) {
    return { valid: false, error: "Invalid key format" };
  }

  const prefix = extractPrefix(rawKey);

  const keys = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.prefix, prefix))
    .limit(1);

  const keyRecord = keys[0];

  if (!keyRecord) {
    return { valid: false, error: "Key not found" };
  }

  if (keyRecord.revokedAt) {
    return { valid: false, error: "Key has been revoked" };
  }

  if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
    return { valid: false, error: "Key has expired" };
  }

  const valid = verifyKey(rawKey, keyRecord.keyHash);

  if (!valid) {
    return { valid: false, error: "Invalid key" };
  }

  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyRecord.id));

  return {
    valid: true,
    tenantId: keyRecord.tenantId,
    keyId: keyRecord.id,
    scopes: keyRecord.scopes ?? [],
  };
}

export async function revokeApiKey(
  keyId: string,
  tenantId: string
): Promise<boolean> {
  const result = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.tenantId, tenantId)));

  return result.rowCount > 0;
}

export async function listApiKeys(
  tenantId: string
): Promise<Omit<ApiKeyRecord, "keyHash">[]> {
  const keys = await db
    .select({
      id: apiKeys.id,
      tenantId: apiKeys.tenantId,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
      scopes: apiKeys.scopes,
      expiresAt: apiKeys.expiresAt,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.tenantId, tenantId));

  return keys.map((key) => ({
    ...key,
    scopes: key.scopes ?? [],
  }));
}

export async function deleteApiKey(
  keyId: string,
  tenantId: string
): Promise<boolean> {
  const result = await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.tenantId, tenantId)));

  return result.rowCount > 0;
}

export function hasScope(scopes: string[], requiredScope: string): boolean {
  if (scopes.includes("*")) return true;
  return scopes.includes(requiredScope);
}
