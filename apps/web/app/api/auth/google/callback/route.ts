import { NextResponse, type NextRequest } from "next/server";
import { setTokens } from "@/lib/session";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(
      new URL("/sign-in?error=oauth_failed", request.url),
    );
  }

  await setTokens(accessToken, refreshToken);

  return NextResponse.redirect(
    new URL("/profile-selection?from=auth", request.url),
  );
}
