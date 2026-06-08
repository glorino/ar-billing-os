import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const hasValidKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

  if (!hasValidKey) {
    const response = NextResponse.next();
    response.headers.set("x-tenant-id", "dev-tenant");
    response.headers.set("x-user-id", "dev-user");
    return response;
  }

  const mod = await import("@clerk/nextjs/server");
  const clerkMiddleware = mod.clerkMiddleware;
  const createRouteMatcher = mod.createRouteMatcher;

  const publicRoutes = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/v1/webhooks(.*)",
  ]);

  const ignoredRoutes = createRouteMatcher([
    "/_next(.*)",
    "/favicon.ico",
    "/images(.*)",
  ]);

  return (clerkMiddleware as any)(async (auth: any, req: NextRequest) => {
    if (ignoredRoutes(req)) {
      return NextResponse.next();
    }
    if (publicRoutes(req)) {
      return NextResponse.next();
    }

    const { userId, orgId } = await auth();

    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    if (!orgId && !req.nextUrl.pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    const response = NextResponse.next();
    if (orgId) {
      response.headers.set("x-tenant-id", orgId);
    }
    response.headers.set("x-user-id", userId);
    return response;
  })(request, {} as any);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
