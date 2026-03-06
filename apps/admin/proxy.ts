import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decodeJwt } from "jose"
import type { JwtPayload } from "@/features/auth/types"

const PUBLIC_PATHS = ["/login"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const accessToken = request.cookies.get("accessToken")?.value
  const refreshToken = request.cookies.get("refreshToken")?.value

  // No token → redirect to login (unless already there)
  if (!accessToken) {
    if (isPublicPath) return NextResponse.next()
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Decode and validate
  try {
    const payload = decodeJwt<JwtPayload>(accessToken)

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      // Let client-side refresh flow recover the session when refresh token exists.
      if (refreshToken) {
        return NextResponse.next()
      }

      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("accessToken")
      response.cookies.delete("refreshToken")
      return response
    }

    // Check admin role
    if (payload.role !== "ADMIN") {
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("accessToken")
      response.cookies.delete("refreshToken")
      return response
    }

    // Authenticated admin trying to access login → redirect to dashboard
    if (isPublicPath) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  } catch {
    // Invalid access token: allow client refresh when refresh token exists.
    if (refreshToken) {
      return NextResponse.next()
    }

    // Invalid token without refresh token → clear and redirect
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("accessToken")
    response.cookies.delete("refreshToken")
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
