import Footer from '@/components/layout/footer/Footer';
import React from 'react';
import AboutDissolveHero from '@/components/about/dissolvecanvas/AboutDissolveHero';
import AboutPhotographer from '@/components/about/aboutphotographer/AboutPhotographer';
import Spotlight from '@/components/about/spotlight/Spotlight';
import AboutRetouch from '@/components/about/aboutretouch/AboutRetouch';
import AboutFeatured from '@/components/about/aboutfeatured/AboutFeatured';

export const revalidate = 60;

export const metadata = {
    title: 'About Supratik Sahis — Photographer & Visual Storyteller',
    description:
        'Discover the vision and craft of Supratik Sahis, a photographer from Bankura currently based in Kolkata. Specializing in portrait, documentary, wildlife, and editorial photography.',
    keywords: [
        'Supratik Sahis',
        'about photographer',
        'Kolkata photographer',
        'Bankura photographer',
        'West Bengal photographer',
        'visual storyteller India',
        'documentary photographer India',
        'Storyfinder about',
        'professional photo retouching India',
        'portrait photographer West Bengal',
    ],
    openGraph: {
        title: 'About Supratik Sahis | Photographer & Visual Storyteller',
        description:
            'Discover the vision and craft behind the lens of Supratik Sahis, based in Kolkata, originally from Bankura, West Bengal.',
        url: 'https://storyfinder.me/about',
        type: 'profile',
        siteName: 'Storyfinder',
        locale: 'en_IN',
        images: [
            {
                url: 'https://storyfinder.me/stock/supratik_img.jpg',
                width: 1200,
                height: 630,
                alt: 'Supratik Sahis — Photographer based in Kolkata',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Supratik Sahis | Photographer',
        description:
            'Discover the vision and craft behind the lens of Supratik Sahis, visual storyteller from Bankura, based in Kolkata.',
        images: ['https://storyfinder.me/stock/supratik_img.jpg'],
    },
    alternates: {
        canonical: 'https://storyfinder.me/about',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'AboutPage',
            '@id': 'https://storyfinder.me/about#webpage',
            name: 'About Supratik Sahis',
            url: 'https://storyfinder.me/about',
            description:
                'About page for Supratik Sahis, a professional photographer and visual storyteller from Bankura, now based in Kolkata, India.',
            mainEntity: {
                '@type': 'Person',
                '@id': 'https://storyfinder.me/#person',
                name: 'Supratik Sahis',
                jobTitle: 'Photographer & Visual Storyteller',
                image: 'https://storyfinder.me/stock/supratik_img.jpg',
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
                email: 'supratiksahis459@gmail.com',
                telephone: '+91-8167084856',
                knowsAbout: [
                    'Portrait Photography',
                    'Documentary Photography',
                    'Editorial Photography',
                    'Wildlife Photography',
                    'Fine Art Photography',
                    'Photo Retouching',
                ],
                url: 'https://storyfinder.me/about',
            },
        },
    ],
};

export default function About() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AboutDissolveHero />
            <AboutPhotographer />
            <Spotlight />
            <AboutRetouch />
            <AboutFeatured />
            <Footer />
        </>
    );
}
