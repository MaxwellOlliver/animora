import { NextResponse, type NextRequest } from "next/server";

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

  const accessToken = request.cookies.get("access_token")?.value;
  const profileId = request.cookies.get("profile_id")?.value;

  const isAuthRoute = isMatch(pathname, AUTH_ROUTES);
  const isProfileRoute = isMatch(pathname, PROFILE_ROUTES);
  const isPublicRoute = isMatch(pathname, PUBLIC_ROUTES);

  // Not logged in → allow auth routes, block everything else
  if (!accessToken) {
    if (isPublicRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Logged in → redirect away from auth pages
  if (isAuthRoute) {
    const destination = profileId ? "/home" : "/profile-selection?from=auth";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Logged in, on profile routes → always allow
  if (isProfileRoute) return NextResponse.next();

  // Logged in, no profile selected → redirect to profile selection
  if (!profileId) {
    return NextResponse.redirect(
      new URL("/profile-selection?from=auth", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - images, favicon (static assets)
     * - api/image (image proxy)
     */
    "/((?!_next/static|_next/image|images|favicon\\.ico|api/image).*)",
  ],
};
