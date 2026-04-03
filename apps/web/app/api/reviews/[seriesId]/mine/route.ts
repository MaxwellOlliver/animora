import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { getProfileId } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> },
) {
  const { seriesId } = await params;
  const profileId = await getProfileId();
  if (!profileId) {
    return NextResponse.json(null);
  }

  const data = await api(`/profiles/${profileId}/series/${seriesId}/review`);
  return NextResponse.json(data);
}
