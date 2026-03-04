import { client } from '@/lib/sanityClient';
import { WATERMARK_QUERY } from '../../sanity/lib/queries';

let cachedWatermark = null;
let lastVersion = null;

export async function getWatermark() {
    const fresh = await client.fetch(WATERMARK_QUERY);

    if (!cachedWatermark || fresh?._updatedAt !== lastVersion) {
        cachedWatermark = fresh;
        lastVersion = fresh?._updatedAt;
    }

    return cachedWatermark;
}

export function getWatermarkedUrl(imageUrl, version = '') {
    if (!imageUrl) return '';

    const encoded = encodeURIComponent(imageUrl);

    return `/api/image/watermark?img=${encoded}${
        version ? `&v=${version}` : ''
    }`;
}
