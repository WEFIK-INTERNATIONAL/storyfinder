import { client } from '@/lib/sanityClient';
import GalleryClient from './GalleryClient';
import { GALLERIES_QUERY } from '../../../../sanity/lib/queries';

export default async function Page() {
    const data = await client.fetch(GALLERIES_QUERY);

    const galleries = data.map((item, i) => ({
        index: String(i + 1).padStart(2, '0'),
        name: item.title,
        href: `/gallery/${item.slug}`,
        variant: ['variant-1', 'variant-2', 'variant-3'][i % 3],
        images: item.photos?.map((p) => p.imageUrl) ?? [],
    }));

    return (
        <div>
            <GalleryClient galleries={galleries} />
        </div>
    );
}
