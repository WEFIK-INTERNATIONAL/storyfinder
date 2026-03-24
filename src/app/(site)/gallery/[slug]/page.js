import React from 'react';
import Minimap from '@/components/ui/minimap/Minimap';

import { client } from '@/lib/sanityClient';
import { GALLERY_QUERY } from '../../../../../sanity/lib/queries';
import { getWatermarkedUrl } from '@/lib/watermarkHelper';

export const revalidate = 60;

export async function generateMetadata({ params, searchParams }) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const data = await client.fetch(GALLERY_QUERY, { slug });

    if (!data) {
        return {
            title: 'Gallery Not Found | Storyfinder',
        };
    }

    const imageIndex = parseInt(resolvedSearchParams?.img, 10);
    const selectedImage =
        !isNaN(imageIndex) && data.photos?.[imageIndex]
            ? data.photos[imageIndex]
            : data.photos?.[0];

    const ogImage =
        selectedImage?.image?.url ||
        'https://storyfinder.me/fallback/fallback-image-profile.png';
    const specificUrl = !isNaN(imageIndex)
        ? `https://storyfinder.me/gallery/${slug}?img=${imageIndex}`
        : `https://storyfinder.me/gallery/${slug}`;

    return {
        title: `${data.title} | Photography Gallery`,
        description:
            data.description ||
            `Explore the ${data.title} photography gallery by Supratik Sahis — visual storyteller based in Kolkata.`,
        keywords: [
            data.title,
            'Supratik Sahis',
            'photography gallery',
            'Kolkata photographer',
            'Storyfinder',
            'visual storytelling',
        ],
        openGraph: {
            title: `${data.title} | Storyfinder — Supratik Sahis`,
            description:
                data.description ||
                `Explore the ${data.title} photography gallery by Supratik Sahis.`,
            url: specificUrl,
            type: 'website',
            siteName: 'Storyfinder',
            locale: 'en_IN',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${data.title} — Photography by Supratik Sahis`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${data.title} | Storyfinder`,
            description:
                data.description || `Photography gallery by Supratik Sahis.`,
            images: [ogImage],
        },
        alternates: {
            canonical: `https://storyfinder.me/gallery/${slug}`,
        },
    };
}

function generateJsonLd(data, slug) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        '@id': `https://storyfinder.me/gallery/${slug}#gallery`,
        name: data.title,
        description: data.description,
        url: `https://storyfinder.me/gallery/${slug}`,
        author: {
            '@type': 'Person',
            '@id': 'https://storyfinder.me/#person',
            name: 'Supratik Sahis',
        },
        image: data.photos
            ?.slice(0, 5)
            .map((photo) => ({
                '@type': 'ImageObject',
                contentUrl: photo.image?.url,
                name: photo.title || data.title,
                author: {
                    '@id': 'https://storyfinder.me/#person',
                },
            }))
            .filter((img) => Boolean(img.contentUrl)),
    };
}

const Gallery = async ({ params }) => {
    const { slug } = await params;

    const data = await client.fetch(GALLERY_QUERY, { slug });

    if (!data) return null;

    const jsonLd = generateJsonLd(data, slug);

    const images =
        data?.photos
            ?.map((photo) => ({
                src: getWatermarkedUrl(photo.image?.url),
                lqip: photo.image?.metadata?.lqip,
                aspect: photo.image?.metadata?.dimensions?.aspectRatio || 3 / 2,
                alt: photo.title,
                slug: photo.slug,
                isPaid: photo.isPaid,
                price: photo.price,
            }))
            .filter((img) => Boolean(img.src)) || [];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div>
                <Minimap images={images} category={data?.title || 'Gallery'} />
            </div>
        </>
    );
};

export default Gallery;
