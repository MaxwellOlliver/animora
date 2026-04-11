import { NextResponse } from "next/server";

import { apiInternal } from "@/lib/api-internal";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();

  if (session.accessToken) {
    try {
      await apiInternal("/auth/logout", {
        method: "POST",
        token: session.accessToken,
      });
    } catch {
      // Best-effort: destroy session even if API call fails
    }
  }

  session.destroy();

  return new NextResponse(null, { status: 204 });
}
