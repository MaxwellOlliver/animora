import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { refreshIfNeeded } from "@/lib/refresh-mutex";

const API_BASE_URL = process.env.API_URL ?? "http://localhost:8080/api";

async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const session = await getSession();

  const resolved: string[] = [];

  for (const segment of path) {
    if (segment === "@me") {
      if (!session.profileId) {
        return NextResponse.json(
          { message: "No profile selected" },
          { status: 401 },
        );
      }
      resolved.push(session.profileId);
    } else {
      resolved.push(segment);
    }
  }

  const target = `${API_BASE_URL}/${resolved.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (session.accessToken) {
    try {
      await refreshIfNeeded(session);
    } catch {
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined;

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body,
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("content-type");
  if (upstreamContentType) {
    responseHeaders.set("Content-Type", upstreamContentType);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
