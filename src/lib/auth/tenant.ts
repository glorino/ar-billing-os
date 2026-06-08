import { type Organization, type OrganizationMembership } from "@clerk/backend";

export interface TenantContext {
  tenantId: string;
  orgId: string;
  orgSlug: string;
  orgName: string;
  metadata: Record<string, unknown>;
}

export interface TenantMember {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: TenantRole;
  joinedAt: Date;
}

export type TenantRole = "owner" | "admin" | "manager" | "viewer";

export function extractTenantFromOrg(
  organization: Organization,
  membership: OrganizationMembership | null
): TenantContext {
  if (!membership) {
    throw new Error("User is not a member of this organization");
  }

  const metadata = (organization.publicMetadata ?? {}) as Record<string, unknown>;

  return {
    tenantId: organization.id,
    orgId: organization.id,
    orgSlug: organization.slug ?? "",
    orgName: organization.name,
    metadata,
  };
}

export function getTenantRoleFromMembership(
  membership: OrganizationMembership
): TenantRole {
  const roleMap: Record<string, TenantRole> = {
    org: "admin",
    admin: "admin",
    member: "manager",
    guest: "viewer",
  };

  const clerkRole = membership.role;
  const customRole = (membership.publicMetadata?.role as string) ?? undefined;

  if (customRole && ["owner", "admin", "manager", "viewer"].includes(customRole)) {
    return customRole as TenantRole;
  }

  return roleMap[clerkRole] ?? "viewer";
}

export function resolveTenantId(orgId: string | null | undefined): string {
  if (!orgId) {
    throw new Error("Tenant ID is required but was not provided");
  }
  return orgId;
}

export function isValidTenantContext(
  ctx: Partial<TenantContext>
): ctx is TenantContext {
  return Boolean(ctx.tenantId && ctx.orgId && ctx.orgSlug && ctx.orgName);
}
