import { notFound } from 'next/navigation';
import { client } from '@/lib/sanityClient';
import BlogClient from './BlogClient';
import { POST_QUERY } from '../../../../../sanity/lib/queries';

export default async function BlogPost({ params }) {
    const { slug } = await params;

    const post = await client.fetch(POST_QUERY, { slug });

    if (!post) return notFound();

    return <BlogClient post={post} />;
}
