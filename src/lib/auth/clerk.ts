import { ClerkClient, createClerkClient } from "@clerk/backend";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { type User, type Organization, type OrganizationMembership } from "@clerk/backend";

export type { User, Organization, OrganizationMembership };

export interface AuthContext {
  userId: string;
  orgId: string | null;
  orgSlug: string | null;
  user: User;
  organization: Organization | null;
  membership: OrganizationMembership | null;
}

let _clerkClient: ClerkClient | null = null;

export function getClerkClient(): ClerkClient {
  if (!_clerkClient) {
    _clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    });
  }
  return _clerkClient;
}

export async function getAuthContext(): Promise<AuthContext> {
  const { userId, orgId, orgSlug } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: No user ID found");
  }

  const client = getClerkClient();

  const user = await client.users.getUser(userId);

  let organization: Organization | null = null;
  let membership: OrganizationMembership | null = null;

  if (orgId) {
    organization = await client.organizations.getOrganization({ organizationId: orgId });
    const memberships = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
      userId: [userId],
    });
    membership = memberships.data[0] ?? null;
  }

  return {
    userId,
    orgId: orgId ?? null,
    orgSlug: orgSlug ?? null,
    user,
    organization,
    membership,
  };
}

export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx.orgId) {
    throw new Error("Forbidden: No organization context");
  }
  return ctx;
}

export async function getOrganizationMemberships(orgId: string) {
  const client = getClerkClient();
  return client.organizations.getOrganizationMembershipList({ organizationId: orgId });
}

export async function getOrganizationMembers(orgId: string) {
  const client = getClerkClient();
  const memberships = await client.organizations.getOrganizationMembershipList({
    organizationId: orgId,
  });

  const memberIds = memberships.data.map((m) => m.publicUserData?.userId).filter(Boolean);
  const users = await Promise.all(
    memberIds.map((id) => client.users.getUser(id!))
  );

  return memberships.data.map((m) => ({
    membership: m,
    user: users.find((u) => u.id === m.publicUserData?.userId) ?? null,
  }));
}
