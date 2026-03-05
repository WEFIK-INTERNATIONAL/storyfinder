import { client } from '@/lib/sanityClient';
import { FEATURED_PHOTOS_QUERY } from '../../../sanity/lib/queries';
import HomeClient from '../../components/home/HomeClient';

export const metadata = {
    title: 'Supratik Sahis — Photography Portfolio | Storyfinder',
    description:
        'Explore the photography portfolio of Supratik Sahis — a visual storyteller based in Kolkata, specializing in portrait, documentary, editorial, fine art, and wildlife photography. Browse the interactive gallery of featured work.',
    keywords: [
        'Supratik Sahis',
        'photography portfolio',
        'Kolkata photographer',
        'portrait photography',
        'documentary photography',
        'editorial photography',
        'fine art photography',
        'wildlife photography',
        'visual storytelling',
        'Storyfinder',
    ],
    openGraph: {
        title: 'Supratik Sahis — Photography Portfolio',
        description:
            'Visual storyteller based in Kolkata. Explore an immersive, interactive gallery of portrait, documentary, editorial, and fine art photography.',
        type: 'website',
        siteName: 'Storyfinder',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Supratik Sahis — Photography Portfolio',
        description:
            'Visual storyteller based in Kolkata. Explore an immersive, interactive gallery of featured photography.',
    },
    alternates: {
        canonical: '/',
    },
};

function generateJsonLd(images) {
    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Person',
                name: 'Supratik Sahis',
                jobTitle: 'Photographer & Visual Storyteller',
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Kolkata',
                    addressCountry: 'IN',
                },
                description:
                    'Award-winning photographer and visual storyteller based in Kolkata, capturing moments that refuse to repeat themselves.',
                knowsAbout: [
                    'Portrait Photography',
                    'Documentary Photography',
                    'Editorial Photography',
                    'Fine Art Photography',
                    'Wildlife Photography',
                    'Photo Retouching',
                ],
            },
            {
                '@type': 'ImageGallery',
                name: 'Featured Photography by Supratik Sahis',
                description:
                    'An interactive gallery showcasing featured works across portrait, documentary, editorial, fine art, and wildlife photography.',
                numberOfItems: images?.length || 0,
                image: images?.slice(0, 10).map((img) => ({
                    '@type': 'ImageObject',
                    name: img.title,
                    contentUrl: img.imageUrl,
                })),
            },
            {
                '@type': 'WebSite',
                name: 'Storyfinder',
                description:
                    'An interactive photography portfolio that tells a story through images.',
            },
        ],
    };
}

export default async function Home() {
    const data = await client.fetch(FEATURED_PHOTOS_QUERY);
    const jsonLd = generateJsonLd(data);

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* SR-Only Semantic Content — crawlable but visually hidden */}
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
                    Award-winning photographer based in Kolkata, specializing in
                    portrait, documentary, editorial, fine art, and wildlife
                    photography. Capturing moments that refuse to repeat
                    themselves.
                </p>
                <h2>Featured Photography</h2>
                <ul>
                    {data?.map((photo) => (
                        <li key={photo._id}>
                            <a href={`/gallery/${photo.slug}`}>{photo.title}</a>
                        </li>
                    ))}
                </ul>
                <nav aria-label="Main sections">
                    <a href="/gallery">Explore Full Gallery</a>
                    <a href="/about">About the Photographer</a>
                    <a href="/before-after">Retouching Portfolio</a>
                    <a href="/blog">Photography Blog</a>
                    <a href="/contact">Contact</a>
                </nav>
            </div>

            {/* Interactive Gallery — the main experience */}
            <HomeClient images={data} />
        </>
    );
}
