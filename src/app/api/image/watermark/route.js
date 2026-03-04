import sharp from 'sharp';
import { getWatermark } from '@/lib/watermarkHelper';
import { checkRateLimit } from '@/lib/rateLimiter';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const imgUrl = searchParams.get('img');

        if (!imgUrl) {
            return new Response('Missing image', { status: 400 });
        }

        // 🔒 Rate Limit
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

        if (!checkRateLimit(ip)) {
            return new Response('Too many requests', { status: 429 });
        }

        // 🔥 Get cached watermark
        const wm = await getWatermark();

        // If disabled → just proxy original
        if (!wm || !wm.enabled || !wm.image?.asset?.url) {
            const original = await fetch(imgUrl);
            return new Response(await original.arrayBuffer(), {
                headers: {
                    'Content-Type':
                        original.headers.get('Content-Type') || 'image/webp',
                },
            });
        }

        // Download images
        const [baseRes, wmRes] = await Promise.all([
            fetch(imgUrl),
            fetch(wm.image.asset.url),
        ]);

        if (!baseRes.ok || !wmRes.ok) {
            return new Response('Image fetch failed', { status: 500 });
        }

        const baseBuffer = Buffer.from(await baseRes.arrayBuffer());
        const wmBuffer = Buffer.from(await wmRes.arrayBuffer());

        const base = sharp(baseBuffer);
        const metadata = await base.metadata();
        const width = metadata.width || 1200;

        // Resize watermark based on scale
        const wmWidth = Math.floor(width * (wm.size || 0.4));

        const watermark = await sharp(wmBuffer)
            .resize(wmWidth)
            .ensureAlpha()
            .modulate({ opacity: wm.opacity ?? 0.25 })
            .png()
            .toBuffer();

        const gravityMap = {
            center: 'center',
            'bottom-right': 'southeast',
            'bottom-left': 'southwest',
            'top-right': 'northeast',
            'top-left': 'northwest',
        };

        const output = await base
            .composite([
                {
                    input: watermark,
                    gravity: gravityMap[wm.position] || 'southeast',
                },
            ])
            .webp({ quality: 85 }) // 🚀 WebP optimized
            .toBuffer();

        return new Response(output, {
            headers: {
                'Content-Type': 'image/webp',
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error(error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
