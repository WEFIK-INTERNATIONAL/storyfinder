import { notFound } from 'next/navigation';
import { client } from '@/lib/sanityClient';
import BlogClient from './BlogClient';
import { POST_QUERY } from '../../../../../sanity/lib/queries';

export const revalidate = 60;

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await client.fetch(POST_QUERY, { slug });

    if (!post) {
        return {
            title: 'Post Not Found | Storyfinder Journal',
        };
    }

    const ogImage =
        post.mainImage?.asset?.url ||
        'https://storyfinder.me/fallback/fallback-image-profile.png';

    return {
        title: `${post.title} | Storyfinder Journal`,
        description: post.excerpt || 'A journal entry from photographer Supratik Sahis.',
        keywords: [
            ...(post.categories?.map((c) => c.title) || []),
            'photography blog',
            'visual storytelling',
            'Supratik Sahis',
            'Storyfinder journal',
            post.title,
        ],
        authors: [{ name: 'Supratik Sahis', url: 'https://storyfinder.me/about' }],
        openGraph: {
            title: `${post.title} | Storyfinder`,
            description: post.excerpt,
            url: `https://storyfinder.me/blog/${slug}`,
            type: 'article',
            siteName: 'Storyfinder',
            locale: 'en_IN',
            publishedTime: post.publishedAt,
            authors: ['https://storyfinder.me/about'],
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: post.mainImage?.alt || post.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [ogImage],
        },
        alternates: {
            canonical: `https://storyfinder.me/blog/${slug}`,
        },
    };
}

function generateJsonLd(post) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `https://storyfinder.me/blog/${post.slug}#article`,
        headline: post.title,
        description: post.excerpt,
        image: post.mainImage?.asset?.url,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        inLanguage: 'en-IN',
        author: {
            '@type': 'Person',
            '@id': 'https://storyfinder.me/#person',
            name: 'Supratik Sahis',
            url: 'https://storyfinder.me/about',
        },
        publisher: {
            '@type': 'Person',
            '@id': 'https://storyfinder.me/#person',
            name: 'Supratik Sahis',
            url: 'https://storyfinder.me',
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://storyfinder.me/blog/${post.slug}`,
        },
    };
}

export default async function BlogPost({ params }) {
    const { slug } = await params;

    const post = await client.fetch(POST_QUERY, { slug });

    if (!post) return notFound();

    const jsonLd = generateJsonLd(post);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogClient post={post} />
        </>
    );
}
