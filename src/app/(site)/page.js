import { client } from '@/lib/sanityClient';
import { FEATURED_PHOTOS_QUERY } from '../../../sanity/lib/queries';
import HomeClient from '../../components/home/HomeClient';
import Link from 'next/link';

export const revalidate = 60;

export const metadata = {
    title: 'Supratik Sahis — Photographer & Visual Storyteller',
    description:
        'Explore the photography portfolio of Supratik Sahis — a visual storyteller from Bankura, currently based in Kolkata. Specializing in portrait, documentary, editorial, and wildlife photography.',
    keywords: [
        'Supratik Sahis',
        'photography portfolio',
        'Kolkata photographer',
        'Bankura photographer',
        'West Bengal photographer',
        'portrait photography Kolkata',
        'documentary photography India',
        'wildlife photography India',
        'visual storytelling',
        'Storyfinder',
        'photographer for hire India',
    ],
    openGraph: {
        title: 'Supratik Sahis | Photography Portfolio — Storyfinder',
        description:
            'Visual storyteller based in Kolkata, originally from Bankura. Explore an immersive, interactive gallery of portrait, documentary, and wildlife photography.',
        url: 'https://storyfinder.me',
        type: 'website',
        siteName: 'Storyfinder',
        locale: 'en_IN',
        images: [
            {
                url: 'https://storyfinder.me/fallback/fallback-image-profile.png',
                width: 1200,
                height: 630,
                alt: 'Supratik Sahis — Photographer & Visual Storyteller',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Supratik Sahis | Photography Portfolio',
        description:
            'Visual storyteller based in Kolkata and Bankura. Explore an immersive gallery of featured photography.',
        images: ['https://storyfinder.me/fallback/fallback-image-profile.png'],
    },
    alternates: {
        canonical: 'https://storyfinder.me',
    },
};

function generateJsonLd(images) {
    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Person',
                '@id': 'https://storyfinder.me/#person',
                name: 'Supratik Sahis',
                jobTitle: 'Photographer & Visual Storyteller',
                homeLocation: {
                    '@type': 'Place',
                    name: 'Bankura, West Bengal, India',
                },
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Kolkata',
                    addressRegion: 'West Bengal',
                    addressCountry: 'IN',
                },
                description:
                    'Professional photographer and visual storyteller originally from Bankura, now based in Kolkata. Capturing moments that refuse to repeat themselves.',
                knowsAbout: [
                    'Portrait Photography',
                    'Documentary Photography',
                    'Editorial Photography',
                    'Fine Art Photography',
                    'Wildlife Photography',
                    'Photo Retouching',
                ],
                email: 'supratiksahis459@gmail.com',
                telephone: '+91-8167084856',
                url: 'https://storyfinder.me',
                image: 'https://storyfinder.me/stock/supratik_img.jpg',
            },
            {
                '@type': 'WebSite',
                '@id': 'https://storyfinder.me/#website',
                name: 'Storyfinder',
                url: 'https://storyfinder.me',
                description:
                    'An interactive photography portfolio that tells a story through images by Supratik Sahis.',
                publisher: {
                    '@id': 'https://storyfinder.me/#person',
                },
                potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                        '@type': 'EntryPoint',
                        urlTemplate:
                            'https://storyfinder.me/gallery?q={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                },
            },
            {
                '@type': 'ImageGallery',
                '@id': 'https://storyfinder.me/#gallery',
                name: 'Featured Photography by Supratik Sahis',
                description:
                    'An interactive gallery showcasing featured works across portrait, documentary, editorial, fine art, and wildlife photography.',
                numberOfItems: images?.length || 0,
                author: {
                    '@id': 'https://storyfinder.me/#person',
                },
                image: images?.slice(0, 10).map((img) => ({
                    '@type': 'ImageObject',
                    name: img.title,
                    contentUrl: img.imageUrl,
                    author: {
                        '@id': 'https://storyfinder.me/#person',
                    },
                })),
            },
        ],
    };
}

export default async function Home() {
    const data = await client.fetch(FEATURED_PHOTOS_QUERY);
    const jsonLd = generateJsonLd(data);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div
                className="sr-only"
                style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    padding: 0,
                    margin: '-1px',
                    overflow: 'hidden',
                    clip: 'rect(0, 0, 0, 0)',
                    whiteSpace: 'nowrap',
                    borderWidth: 0,
                }}
            >
                <h1>Supratik Sahis — Photographer &amp; Visual Storyteller</h1>
                <p>
                    Professional photographer based in Kolkata, originally from
                    Bankura, West Bengal. Specializing in portrait, documentary,
                    editorial, fine art, and wildlife photography. Capturing
                    moments that refuse to repeat themselves.
                </p>
                <h2>Featured Photography</h2>
                <ul>
                    {data?.map((photo) => (
                        <li key={photo._id}>
                            <Link href={`/gallery/${photo.slug}`}>
                                {photo.title}
                            </Link>
                        </li>
                    ))}
                </ul>
                <nav aria-label="Main sections">
                    <Link href="/gallery">Explore Full Gallery</Link>
                    <Link href="/about">About the Photographer</Link>
                    <Link href="/before-after">Retouching Portfolio</Link>
                    <Link href="/blog">Photography Blog</Link>
                    <Link href="/contact">Contact</Link>
                </nav>
            </div>

            <HomeClient images={data} />
        </>
    );
}
