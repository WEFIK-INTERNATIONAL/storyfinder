import React from 'react';
import StorySlides from '@/components/ui/StorySlides/StorySlides';
import Footer from '@/components/layout/footer/Footer';

import { client } from '@/lib/sanityClient';
import { STORIES_QUERY } from '../../../../sanity/lib/queries';

export const revalidate = 60;

export const metadata = {
    title: 'Featured Stories & Press',
    description:
        'Explore featured photography stories, editorial covers, and press mentions by Supratik Sahis — published across global platforms.',
    keywords: [
        'Supratik Sahis featured',
        'photography press covers',
        'editorial photography stories',
        'published photographer India',
        'Storyfinder featured',
        'photography publications India',
        'magazine cover photographer',
    ],
    openGraph: {
        title: 'Featured Stories & Press | Supratik Sahis — Storyfinder',
        description:
            'A curation of published stories and editorial work by photographer Supratik Sahis.',
        url: 'https://storyfinder.me/featured',
        type: 'website',
        siteName: 'Storyfinder',
        locale: 'en_IN',
        images: [
            {
                url: 'https://storyfinder.me/fallback/fallback-image-profile.png',
                width: 1200,
                height: 630,
                alt: 'Featured Stories & Press — Supratik Sahis',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Featured Stories & Press | Supratik Sahis',
        description: 'Published stories and editorial work by Supratik Sahis.',
        images: ['https://storyfinder.me/fallback/fallback-image-profile.png'],
    },
    alternates: {
        canonical: 'https://storyfinder.me/featured',
    },
};

function generateJsonLd(stories) {
    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': 'https://storyfinder.me/featured#webpage',
                name: 'Featured Stories & Press Covers',
                url: 'https://storyfinder.me/featured',
                description:
                    'A collection of published photography stories and press mentions by Supratik Sahis.',
                mainEntity: {
                    '@type': 'ItemList',
                    itemListElement: stories.map((story, index) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        item: {
                            '@type': 'CreativeWork',
                            name: story.title.join(' '),
                            publisher: {
                                '@type': 'Organization',
                                name: story.profileName,
                            },
                            image: story.storyImg,
                            url: story.linkSrc,
                        },
                    })),
                },
                author: {
                    '@type': 'Person',
                    '@id': 'https://storyfinder.me/#person',
                    name: 'Supratik Sahis',
                },
            },
        ],
    };
}

async function Featured() {
    const data = await client.fetch(STORIES_QUERY);

    const stories = data.map((item) => ({
        profileName: item.organization,
        profileImg: item.profileImg,
        profileImgLqip: item.profileImgLqip,
        title: item.title.split(' '),
        storyImg: item.storyImg,
        storyImgLqip: item.storyImgLqip,
        linkSrc: item.link,
        linkLabel: 'Read More',
    }));

    const jsonLd = generateJsonLd(stories);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <StorySlides stories={stories} />
            <Footer />
        </>
    );
}

export default Featured;
