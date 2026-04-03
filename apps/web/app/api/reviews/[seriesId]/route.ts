import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { getProfileId } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> },
) {
  const { seriesId } = await params;
  const cursor = req.nextUrl.searchParams.get("cursor");
  const limit = req.nextUrl.searchParams.get("limit");

  const qs = new URLSearchParams();
  if (cursor) qs.set("cursor", cursor);
  if (limit) qs.set("limit", limit);
  const query = qs.toString();

  const data = await api(`/catalog/series/${seriesId}/reviews${query ? `?${query}` : ""}`, { auth: false });
  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> },
) {
  const { seriesId } = await params;
  const profileId = await getProfileId();
  if (!profileId) {
    return NextResponse.json({ error: "No profile selected" }, { status: 401 });
  }

  const body = await req.json();
  const data = await api(`/profiles/${profileId}/series/${seriesId}/review`, {
    method: "POST",
    body,
  });
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> },
) {
  const { seriesId } = await params;
  const profileId = await getProfileId();
  if (!profileId) {
    return NextResponse.json({ error: "No profile selected" }, { status: 401 });
  }

  const body = await req.json();
  const data = await api(`/profiles/${profileId}/series/${seriesId}/review`, {
    method: "PATCH",
    body,
  });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> },
) {
  const { seriesId } = await params;
  const profileId = await getProfileId();
  if (!profileId) {
    return NextResponse.json({ error: "No profile selected" }, { status: 401 });
  }

  await api(`/profiles/${profileId}/series/${seriesId}/review`, {
    method: "DELETE",
  });
  return new NextResponse(null, { status: 204 });
}
