import sharp from "sharp";
import { client } from "@/lib/sanityClient"
import { WATERMARK_QUERY } from "../../../../../sanity/lib/queries";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const imgUrl = searchParams.get("img");

  if (!imgUrl) {
    return new Response("Missing image", { status: 400 });
  }

  // 1. Fetch watermark settings
  const wm = await client.fetch(WATERMARK_QUERY);

  // 2. Download base image + watermark PNG
  const [baseRes, wmRes] = await Promise.all([
    fetch(imgUrl),
    fetch(wm.image.asset.url),
  ]);

  const baseBuffer = Buffer.from(await baseRes.arrayBuffer());
  const wmBuffer = Buffer.from(await wmRes.arrayBuffer());

  const base = sharp(baseBuffer);
  const { width, height } = await base.metadata();

  // 3. Resize watermark based on scale
  const wmWidth = Math.floor(width * wm.size);
  const watermark = await sharp(wmBuffer)
    .resize(wmWidth)
    .png()
    .toBuffer();

  // 4. Position logic
  const gravityMap = {
    center: "center",
    "bottom-right": "southeast",
    "bottom-left": "southwest",
    "top-right": "northeast",
    "top-left": "northwest",
  };

  // 5. Composite watermark
  const output = await base
    .composite([
      {
        input: watermark,
        gravity: gravityMap[wm.position] || "southeast",
        blend: "over",
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();

  return new Response(output, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}