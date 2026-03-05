import React from 'react';

import { client } from '@/lib/sanityClient';
import { POSTS_QUERY } from '../../../../sanity/lib/queries';
import BlogList from '@/components/blog/BlogList';

async function Blog() {
    const posts = await client.fetch(POSTS_QUERY);

    return (
        <BlogList posts={posts} />
    );
}

export default Blog;
