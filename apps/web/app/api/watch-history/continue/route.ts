import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { getProfileId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const profileId = await getProfileId();
  if (!profileId) {
    return NextResponse.json({ items: [], nextCursor: null });
  }

  const cursor = req.nextUrl.searchParams.get("cursor");
  const path = `/profiles/${profileId}/watch-history/continue${cursor ? `?cursor=${cursor}` : ""}`;

  const data = await api(path);
  return NextResponse.json(data);
}
