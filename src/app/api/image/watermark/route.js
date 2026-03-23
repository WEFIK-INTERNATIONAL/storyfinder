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
        const height = metadata.height || 800;

        // Calculate based on the shortest dimension so portrait/landscape scale consistently
        const shortSide = Math.min(width, height);

        // Resize watermark based on scale and add proportional padding
        const calculatedWmWidth = Math.floor(shortSide * (wm.size || 0.05));
        const wmWidth = Math.max(1, calculatedWmWidth); // Prevent sharp crash if width rounds to 0
        const padding = Math.max(1, Math.floor(wmWidth * 0.25)); // 25% edge padding

        const watermark = await sharp(wmBuffer)
            .resize(wmWidth)
            .ensureAlpha()
            .modulate({ opacity: wm.opacity ?? 0.15 })
            .extend({
                top: padding,
                bottom: padding,
                left: padding,
                right: padding,
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
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
