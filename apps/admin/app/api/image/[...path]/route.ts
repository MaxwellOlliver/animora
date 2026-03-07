export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path.join("/");
  console.log(`${process.env.NEXT_PUBLIC_S3_ENDPOINT}/${path}`);
  const res = await fetch(`${process.env.NEXT_PUBLIC_S3_ENDPOINT}/${path}`);

  if (!res.ok) {
    console.log(res.body);
    return new Response(null, { status: res.status });
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
