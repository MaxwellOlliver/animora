import { NextResponse } from "next/server";

import { refreshIfNeeded } from "@/lib/refresh-mutex";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session.accessToken || !session.profileId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await refreshIfNeeded(session);
  } catch {
    return NextResponse.json({ message: "Session expired" }, { status: 401 });
  }

  return NextResponse.json({
    token: session.accessToken,
    profileId: session.profileId,
  });
}
