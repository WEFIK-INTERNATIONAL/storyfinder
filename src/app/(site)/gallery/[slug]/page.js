import React from 'react';
import Minimap from '@/components/ui/minimap/Minimap';

import { client } from '@/lib/sanityClient';
import { GALLERY_QUERY } from '../../../../../sanity/lib/queries';
import { getWatermarkedUrl } from '@/lib/watermarkHelper';

const Gallery = async ({ params }) => {
    const { slug } = await params;

    const data = await client.fetch(GALLERY_QUERY, { slug });

    const images =
        data?.photos?.map((photo) => ({
            src: getWatermarkedUrl(photo.image?.asset?.url),
            alt: photo.title,
            slug: photo.slug,
            isPaid: photo.isPaid,
            price: photo.price,
        })) || [];

    return (
        <div>
            <Minimap images={images} category={data?.title || 'Gallery'} />
        </div>
    );
};

export default Gallery;
