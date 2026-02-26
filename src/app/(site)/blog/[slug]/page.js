import { client } from '@/lib/sanityClient';
import { notFound } from 'next/navigation';
import { POST_QUERY } from '../../../../../sanity/lib/queries';

export default async function BlogPost({ params }) {
  const { slug } = await params;
  if (!slug) return notFound();

  const post = await client.fetch(POST_QUERY, { slug });  
  if (!post) return notFound();

  return (
    <h1>{post.title}</h1>
  );
}