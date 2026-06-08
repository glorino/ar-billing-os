import { db } from '@/lib/db';
import { tenants, type Tenant, type NewTenant } from '@/lib/db/schema';
import { eq, and, desc, ilike, sql } from 'drizzle-orm';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export class TenantService {
  static async create(
    data: Omit<NewTenant, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Tenant> {
    const existing = await db.query.tenants.findFirst({
      where: eq(tenants.slug, data.slug),
    });
    if (existing) {
      throw new AppError('Tenant slug already exists', 'TENANT_SLUG_EXISTS', 409);
    }

    const [created] = await db.insert(tenants).values(data).returning();
    return created;
  }

  static async getById(tenantId: string): Promise<Tenant> {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });
    if (!tenant) {
      throw new AppError('Tenant not found', 'TENANT_NOT_FOUND', 404);
    }
    return tenant;
  }

  static async list(
    params: PaginationParams & { status?: Tenant['status']; search?: string } = {},
  ): Promise<PaginatedResult<Tenant>> {
    const { limit = 20, offset = 0, status, search } = params;
    const conditions = [];
    if (status) conditions.push(eq(tenants.status, status));
    if (search) conditions.push(ilike(tenants.name, `%${search}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult, data] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tenants)
        .where(where),
      db
        .select()
        .from(tenants)
        .where(where)
        .orderBy(desc(tenants.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = countResult[0]?.count ?? 0;
    return {
      data,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  static async update(
    tenantId: string,
    data: Partial<Omit<NewTenant, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Tenant> {
    await this.getById(tenantId);
    const [updated] = await db
      .update(tenants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId))
      .returning();
    return updated;
  }

  static async updateStatus(
    tenantId: string,
    status: Tenant['status'],
  ): Promise<Tenant> {
    return this.update(tenantId, { status });
  }

  static async updateSettings(
    tenantId: string,
    settings: NonNullable<Tenant['settings']>,
  ): Promise<Tenant> {
    const tenant = await this.getById(tenantId);
    const merged = { ...tenant.settings, ...settings };
    return this.update(tenantId, { settings: merged });
  }

  static async getBySlug(slug: string): Promise<Tenant> {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });
    if (!tenant) {
      throw new AppError('Tenant not found', 'TENANT_NOT_FOUND', 404);
    }
    return tenant;
  }

  static async count(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tenants);
    return result?.count ?? 0;
  }
}
