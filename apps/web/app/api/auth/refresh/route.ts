import { NextRequest, NextResponse } from "next/server";
import { refreshIfNeeded } from "@/lib/refresh-mutex";
import { getSession } from "@/lib/session";

function getReturnTo(request: NextRequest): string {
  const value = request.nextUrl.searchParams.get("returnTo");

  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/home";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  const returnTo = getReturnTo(request);

  if (!session.accessToken || !session.refreshToken) {
    session.destroy();
    return NextResponse.redirect(
      new URL("/sign-in?error=session_expired", request.url),
    );
  }

  try {
    await refreshIfNeeded(session);
    return NextResponse.redirect(new URL(returnTo, request.url));
  } catch {
    session.destroy();
    return NextResponse.redirect(
      new URL("/sign-in?error=session_expired", request.url),
    );
  }
}
