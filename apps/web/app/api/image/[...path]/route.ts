import { NextRequest, NextResponse } from "next/server";

import { serverEnv } from "@/lib/server-env";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/api/image/[...path]">,
) {
  const path = (await params).path.join("/");

  const res = await fetch(`${serverEnv.NEXT_PUBLIC_S3_ENDPOINT}/${path}`);

  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
