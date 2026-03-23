import { client } from '@/lib/sanityClient';
import GalleryClient from './GalleryClient';
import { GALLERIES_QUERY } from '../../../../sanity/lib/queries';

export const revalidate = 60;

export const metadata = {
    title: 'Photography Portfolios & Galleries',
    description:
        'Browse curated photography collections by Supratik Sahis — featuring portrait, documentary, editorial, wildlife, and fine art photography from Kolkata and beyond.',
    keywords: [
        'photography galleries',
        'Supratik Sahis portfolios',
        'visual storytelling collections',
        'Kolkata photography gallery',
        'portrait photography gallery India',
        'documentary photography gallery',
        'wildlife photography gallery India',
        'fine art photography India',
    ],
    openGraph: {
        title: 'Photography Galleries | Storyfinder — Supratik Sahis',
        description:
            'Browse curated collections of powerful imagery by Supratik Sahis. Portrait, documentary, editorial, and wildlife photography.',
        url: 'https://storyfinder.me/gallery',
        type: 'website',
        siteName: 'Storyfinder',
        locale: 'en_IN',
        images: [
            {
                url: 'https://storyfinder.me/fallback/fallback-image-profile.png',
                width: 1200,
                height: 630,
                alt: 'Photography Galleries — Storyfinder by Supratik Sahis',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Photography Galleries | Storyfinder',
        description:
            'Browse curated photography collections by Supratik Sahis.',
        images: ['https://storyfinder.me/fallback/fallback-image-profile.png'],
    },
    alternates: {
        canonical: 'https://storyfinder.me/gallery',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://storyfinder.me/gallery#webpage',
    name: 'Photography Galleries — Supratik Sahis',
    url: 'https://storyfinder.me/gallery',
    description:
        'A collection of photography portfolios by Supratik Sahis, covering portrait, documentary, editorial, wildlife, and fine art photography.',
    publisher: {
        '@type': 'Person',
        '@id': 'https://storyfinder.me/#person',
        name: 'Supratik Sahis',
    },
};

export default async function Page() {
    const data = await client.fetch(GALLERIES_QUERY);

    const galleries = data.map((item, i) => ({
        index: String(i + 1).padStart(2, '0'),
        name: item.title,
        href: `/gallery/${item.slug}`,
        variant: ['variant-1', 'variant-2', 'variant-3'][i % 3],
        images: (item.photos || [])
            .filter((p) => Boolean(p?.imageUrl))
            .map((p) => ({
                src: p.imageUrl,
                lqip: p.lqip,
                title: p.title || 'Gallery Preview',
            })),
    }));

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div>
                <GalleryClient galleries={galleries} />
            </div>
        </>
    );
}
