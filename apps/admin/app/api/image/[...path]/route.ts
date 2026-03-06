export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path.slice(1).join("/");
  const res = await fetch(`${process.env.NEXT_PUBLIC_S3_ENDPOINT}/${path}`);
  console.log(res.body);
  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "image/webp",
    },
  });
}
