import RetouchGallery from '@/components/retouch/RetouchGallery';
import React from 'react';
import { client } from '@/lib/sanityClient';
import { RETOUCH_PHOTOS_QUERY } from '../../../../sanity/lib/queries';

export const revalidate = 60;

export const metadata = {
    title: 'Retouching Portfolio — Before & After',
    description:
        'Explore the before and after transformations of raw photography by Supratik Sahis. Professional photo retouching, colour grading, and editing portfolio from Kolkata.',
    keywords: [
        'photo retouching portfolio',
        'before and after photography',
        'Supratik Sahis retouching',
        'professional photo editing India',
        'photo retouching Kolkata',
        'colour grading photography India',
        'image editing portfolio',
        'Storyfinder retouching',
    ],
    openGraph: {
        title: 'Before & After Retouching Portfolio | Storyfinder',
        description:
            'Explore professional retouching and colour grading transformations by Supratik Sahis — photographer based in Kolkata.',
        url: 'https://storyfinder.me/before-after',
        type: 'website',
        siteName: 'Storyfinder',
        locale: 'en_IN',
        images: [
            {
                url: 'https://storyfinder.me/fallback/fallback-image-profile.png',
                width: 1200,
                height: 630,
                alt: 'Before & After Retouching Portfolio — Supratik Sahis',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Before & After Retouching | Storyfinder',
        description:
            'Professional retouching transformations by Supratik Sahis.',
        images: ['https://storyfinder.me/fallback/fallback-image-profile.png'],
    },
    alternates: {
        canonical: 'https://storyfinder.me/before-after',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://storyfinder.me/before-after#webpage',
    name: 'Photo Retouching Portfolio — Before & After',
    url: 'https://storyfinder.me/before-after',
    description:
        'Before and after transformations of photography by Supratik Sahis. Professional retouching and colour grading work.',
    author: {
        '@type': 'Person',
        '@id': 'https://storyfinder.me/#person',
        name: 'Supratik Sahis',
    },
};

async function BeforeAfter() {
    const retouchPhotos = await client.fetch(RETOUCH_PHOTOS_QUERY);

    const works = retouchPhotos.map((photo) => ({
        id: photo._id,
        title: photo.title,
        category: photo.category || 'Uncategorized',
        before: photo.rawImageUrl,
        beforeLqip: photo.rawImageLqip,
        after: photo.editedImageUrl,
        afterLqip: photo.editedImageLqip,
        aspectRatio: photo.rawImageDimensions?.aspectRatio || 3 / 4,
    }));

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div>
                <RetouchGallery works={works} />
            </div>
        </>
    );
}

export default BeforeAfter;
