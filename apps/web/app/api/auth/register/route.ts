import { NextRequest, NextResponse } from "next/server";

import { ApiError,apiInternal } from "@/lib/api-internal";
import { decodeTokenExpiry,getSession } from "@/lib/session";

type AuthResponse = { accessToken: string; refreshToken: string };

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const data = await apiInternal<AuthResponse>("/auth/register", {
      method: "POST",
      body,
    });

    const session = await getSession();
    session.accessToken = data.accessToken;
    session.refreshToken = data.refreshToken;
    session.expiresAt = decodeTokenExpiry(data.accessToken);
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
