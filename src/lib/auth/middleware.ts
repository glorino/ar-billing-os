import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  extractTenantFromOrg,
  getTenantRoleFromMembership,
  type TenantContext,
  type TenantRole,
} from "./tenant";

const publicPaths = ["/sign-in", "/sign-up", "/api/v1/webhooks"];
const staticPaths = ["/_next", "/favicon.ico", "/images"];

function isPublicPath(pathname: string): boolean {
  return (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    staticPaths.some((p) => pathname.startsWith(p))
  );
}

export interface MiddlewareAuthResult {
  authenticated: boolean;
  userId: string | null;
  tenant: TenantContext | null;
  role: TenantRole | null;
  error?: string;
}

export async function resolveMiddlewareAuth(
  request: NextRequest
): Promise<MiddlewareAuthResult> {
  if (isPublicPath(request.nextUrl.pathname)) {
    return {
      authenticated: true,
      userId: null,
      tenant: null,
      role: null,
    };
  }

  const { userId, orgId } = await auth();

  if (!userId) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return {
      authenticated: false,
      userId: null,
      tenant: null,
      role: null,
      error: "Unauthenticated",
    };
  }

  if (!orgId) {
    return {
      authenticated: true,
      userId,
      tenant: null,
      role: null,
      error: "No organization selected",
    };
  }

  try {
    const client = await clerkClient();
    const organization = await client.organizations.getOrganization({
      organizationId: orgId,
    });

    const memberships = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
      userId: [userId],
    });

    const membership = memberships.data[0] ?? null;

    if (!membership) {
      return {
        authenticated: true,
        userId,
        tenant: null,
        role: null,
        error: "Not a member of this organization",
      };
    }

    const tenant = extractTenantFromOrg(organization, membership);
    const role = getTenantRoleFromMembership(membership);

    return {
      authenticated: true,
      userId,
      tenant,
      role,
    };
  } catch (error) {
    console.error("Middleware auth resolution failed:", error);
    return {
      authenticated: true,
      userId,
      tenant: null,
      role: null,
      error: "Failed to resolve tenant context",
    };
  }
}

export function createTenantHeaders(
  result: MiddlewareAuthResult
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (result.userId) {
    headers["x-user-id"] = result.userId;
  }
  if (result.tenant) {
    headers["x-tenant-id"] = result.tenant.tenantId;
    headers["x-org-id"] = result.tenant.orgId;
    headers["x-org-slug"] = result.tenant.orgSlug;
    headers["x-org-name"] = result.tenant.orgName;
  }
  if (result.role) {
    headers["x-user-role"] = result.role;
  }

  return headers;
}

export function handleAuthRedirect(
  request: NextRequest,
  result: MiddlewareAuthResult
): NextResponse | null {
  if (result.error === "Unauthenticated") {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  if (result.error === "No organization selected" && !request.nextUrl.pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return null;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|api/v1/webhooks).*)",
  ],
};
