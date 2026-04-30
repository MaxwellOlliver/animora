import { getIronSession } from "iron-session";
import { type NextRequest,NextResponse } from "next/server";

import { getSessionOptions, type SessionData } from "@/lib/session";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];
const PROFILE_ROUTES = ["/profile-selection", "/profile-create", "/profile-edit"];
const PUBLIC_ROUTES = [...AUTH_ROUTES, "/api/auth"];

function isMatch(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();
  const session = getIronSession<SessionData>(
    request,
    response,
    getSessionOptions(),
  );

  return session.then((s) => {
    const isLoggedIn = !!s.accessToken;
    const hasProfile = !!s.profileId;

    const isAuthRoute = isMatch(pathname, AUTH_ROUTES);
    const isProfileRoute = isMatch(pathname, PROFILE_ROUTES);
    const isPublicRoute = isMatch(pathname, PUBLIC_ROUTES);

    // Not logged in - allow auth routes, block everything else
    if (!isLoggedIn) {
      if (isPublicRoute) return NextResponse.next();
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Logged in - redirect away from auth pages
    if (isAuthRoute) {
      const destination = hasProfile ? "/home" : "/profile-selection?from=auth";
      return NextResponse.redirect(new URL(destination, request.url));
    }

    // Logged in, on profile routes - always allow
    if (isProfileRoute) return NextResponse.next();

    // Logged in, no profile selected - redirect to profile selection
    if (!hasProfile) {
      return NextResponse.redirect(
        new URL("/profile-selection?from=auth", request.url),
      );
    }

    return NextResponse.next();
  });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - images, favicon (static assets)
     * - api/image (image proxy)
     * - api/proxy (BFF proxy)
     */
    "/((?!_next/static|_next/image|images|favicon\\.ico|api/image|api/proxy).*)",
  ],
};
