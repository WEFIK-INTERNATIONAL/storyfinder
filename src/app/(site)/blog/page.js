import React from 'react';
import Minimap from '@/components/ui/minimap/Minimap';

import { client } from '@/lib/sanityClient';
import { POSTS_QUERY } from '../../../../sanity/lib/queries';

async function Blog() {
    const posts = await client.fetch(POSTS_QUERY);

    const images = posts.map((post) => ({
        src: post.mainImage?.asset?.url,
        alt: post.title,
        slug: post.slug,
    }));

    return (
        <div>
            <Minimap images={images} category="Potrait" />
        </div>
    );
}

export default Blog;
