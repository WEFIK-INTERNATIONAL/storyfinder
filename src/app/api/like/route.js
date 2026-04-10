import { client } from '@/lib/sanityClient';
import { checkRateLimit } from '@/lib/rateLimiter';

export async function POST(req) {
    try {
        const body = await req.json();
        const { documentId, action } = body;

        if (!documentId) {
            return new Response('Missing documentId', { status: 400 });
        }

        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

        if (!checkRateLimit(ip)) {
            return new Response('Too many requests', { status: 429 });
        }

        const incrementValue = action === 'unlike' ? -1 : 1;

        await client
            .patch(documentId)
            .setIfMissing({ likes: 0 })
            .inc({ likes: incrementValue })
            .commit();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Like API Error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
