import { type TenantRole } from "./tenant";

export type Permission =
  | "customers:read"
  | "customers:write"
  | "customers:delete"
  | "invoices:read"
  | "invoices:write"
  | "invoices:delete"
  | "invoices:send"
  | "subscriptions:read"
  | "subscriptions:write"
  | "subscriptions:delete"
  | "subscriptions:cancel"
  | "collections:read"
  | "collections:write"
  | "collections:execute"
  | "analytics:read"
  | "reports:read"
  | "reports:export"
  | "settings:read"
  | "settings:write"
  | "settings:billing"
  | "users:read"
  | "users:invite"
  | "users:remove"
  | "api_keys:read"
  | "api_keys:write"
  | "api_keys:delete";

export type Resource = "customers" | "invoices" | "subscriptions" | "collections" | "analytics" | "reports" | "settings" | "users" | "api_keys";

export type Action = "read" | "write" | "delete" | "send" | "cancel" | "execute" | "export" | "invite" | "remove" | "billing";

const ROLE_HIERARCHY: Record<TenantRole, number> = {
  viewer: 0,
  manager: 1,
  admin: 2,
  owner: 3,
};

const ROLE_PERMISSIONS: Record<TenantRole, Permission[]> = {
  owner: [
    "customers:read",
    "customers:write",
    "customers:delete",
    "invoices:read",
    "invoices:write",
    "invoices:delete",
    "invoices:send",
    "subscriptions:read",
    "subscriptions:write",
    "subscriptions:delete",
    "subscriptions:cancel",
    "collections:read",
    "collections:write",
    "collections:execute",
    "analytics:read",
    "reports:read",
    "reports:export",
    "settings:read",
    "settings:write",
    "settings:billing",
    "users:read",
    "users:invite",
    "users:remove",
    "api_keys:read",
    "api_keys:write",
    "api_keys:delete",
  ],
  admin: [
    "customers:read",
    "customers:write",
    "customers:delete",
    "invoices:read",
    "invoices:write",
    "invoices:delete",
    "invoices:send",
    "subscriptions:read",
    "subscriptions:write",
    "subscriptions:delete",
    "subscriptions:cancel",
    "collections:read",
    "collections:write",
    "collections:execute",
    "analytics:read",
    "reports:read",
    "reports:export",
    "settings:read",
    "settings:write",
    "users:read",
    "users:invite",
    "users:remove",
    "api_keys:read",
    "api_keys:write",
    "api_keys:delete",
  ],
  manager: [
    "customers:read",
    "customers:write",
    "invoices:read",
    "invoices:write",
    "invoices:send",
    "subscriptions:read",
    "subscriptions:write",
    "collections:read",
    "collections:write",
    "analytics:read",
    "reports:read",
    "reports:export",
    "settings:read",
    "users:read",
    "api_keys:read",
  ],
  viewer: [
    "customers:read",
    "invoices:read",
    "subscriptions:read",
    "collections:read",
    "analytics:read",
    "reports:read",
    "settings:read",
  ],
};

export function getRoleLevel(role: TenantRole): number {
  return ROLE_HIERARCHY[role] ?? 0;
}

export function hasPermission(role: TenantRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] ?? [];
  return permissions.includes(permission);
}

export function hasAllPermissions(role: TenantRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function hasAnyPermission(role: TenantRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function getPermissionsForRole(role: TenantRole): Permission[] {
  return [...(ROLE_PERMISSIONS[role] ?? [])];
}

export function canAccessResource(
  role: TenantRole,
  resource: Resource,
  action: Action
): boolean {
  const permission: Permission = `${resource}:${action}` as Permission;
  return hasPermission(role, permission);
}

export function getMinimumRole(permission: Permission): TenantRole {
  const roles: TenantRole[] = ["viewer", "manager", "admin", "owner"];
  for (const role of roles) {
    if (hasPermission(role, permission)) {
      return role;
    }
  }
  return "owner";
}

export class RBACError extends Error {
  constructor(
    message: string,
    public readonly requiredPermission: Permission,
    public readonly currentRole: TenantRole
  ) {
    super(message);
    this.name = "RBACError";
  }
}

export function requirePermission(role: TenantRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new RBACError(
      `Insufficient permissions: requires ${permission}, current role is ${role}`,
      permission,
      role
    );
  }
}

export function requireAnyPermission(role: TenantRole, permissions: Permission[]): void {
  if (!hasAnyPermission(role, permissions)) {
    throw new RBACError(
      `Insufficient permissions: requires one of [${permissions.join(", ")}], current role is ${role}`,
      permissions[0],
      role
    );
  }
}
