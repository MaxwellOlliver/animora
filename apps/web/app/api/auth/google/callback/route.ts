import { type NextRequest,NextResponse } from "next/server";

import { decodeTokenExpiry,getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(
      new URL("/sign-in?error=oauth_failed", request.url),
    );
  }

  const session = await getSession();
  session.accessToken = accessToken;
  session.refreshToken = refreshToken;
  session.expiresAt = decodeTokenExpiry(accessToken);
  await session.save();

  return NextResponse.redirect(
    new URL("/profile-selection?from=auth", request.url),
  );
}
