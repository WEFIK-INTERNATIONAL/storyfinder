import React from 'react';

import { client } from '@/lib/sanityClient';
import { POSTS_QUERY } from '../../../../sanity/lib/queries';
import BlogList from '@/components/blog/BlogList';
import Footer from '@/components/layout/footer/Footer';

export const revalidate = 60;

export const metadata = {
    title: 'Photography Journal — Essays & Field Notes',
    description:
        'A collection of essays, field notes, and thoughts on visual storytelling, light, and the craft of photography by Supratik Sahis — based in Kolkata.',
    keywords: [
        'photography blog',
        'visual storytelling essays',
        'field notes photography',
        'Supratik Sahis blog',
        'photography journal',
        'Storyfinder journal',
        'photography tips India',
        'photography behind the scenes',
    ],
    openGraph: {
        title: 'Photography Journal | Supratik Sahis — Storyfinder',
        description:
            'Essays and field notes on the craft of visual storytelling by Supratik Sahis.',
        url: 'https://storyfinder.me/blog',
        type: 'website',
        siteName: 'Storyfinder',
        locale: 'en_IN',
        images: [
            {
                url: 'https://storyfinder.me/fallback/fallback-image-profile.png',
                width: 1200,
                height: 630,
                alt: 'Storyfinder Photography Journal',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Photography Journal | Supratik Sahis',
        description:
            'Essays and field notes on the craft of visual storytelling.',
        images: ['https://storyfinder.me/fallback/fallback-image-profile.png'],
    },
    alternates: {
        canonical: 'https://storyfinder.me/blog',
    },
};

function generateJsonLd(posts) {
    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Blog',
                '@id': 'https://storyfinder.me/blog#blog',
                name: 'Storyfinder Journal',
                url: 'https://storyfinder.me/blog',
                description:
                    'A photography journal — essays and field notes on visual storytelling by Supratik Sahis.',
                inLanguage: 'en-IN',
                publisher: {
                    '@type': 'Person',
                    '@id': 'https://storyfinder.me/#person',
                    name: 'Supratik Sahis',
                },
                blogPost: posts.map((post) => ({
                    '@type': 'BlogPosting',
                    headline: post.title,
                    description: post.excerpt,
                    url: `https://storyfinder.me/blog/${post.slug}`,
                    datePublished: post.publishedAt,
                    image: post.mainImage?.asset?.url,
                    author: {
                        '@id': 'https://storyfinder.me/#person',
                    },
                })),
            },
        ],
    };
}

async function Blog() {
    const posts = await client.fetch(POSTS_QUERY);
    const jsonLd = generateJsonLd(posts);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogList posts={posts} />
            <Footer />
        </>
    );
}

export default Blog;
