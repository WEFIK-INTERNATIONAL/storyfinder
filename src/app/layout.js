import {
    ppNeueMontreal,
    goodMonolith,
    bigShouldersDisplay,
    pangramSans,
} from './fonts';
import PageTransition from '@/components/transitions/PageTransition';
import { ViewTransitions } from 'next-view-transitions';
import ClientLayout from './client-layout';
import './globals.css';

export const metadata = {
    metadataBase: new URL('https://storyfinder.me'),
    title: {
        default: 'Storyfinder | Supratik Sahis',
        template: '%s | Storyfinder',
    },
    description:
        'An interactive photography portfolio that tells a story through images by Supratik Sahis — visual storyteller from Bankura, based in Kolkata. Explore portrait, documentary, editorial, and wildlife photography.',
    keywords: [
        'Supratik Sahis',
        'Storyfinder',
        'photography portfolio',
        'Kolkata photographer',
        'Bankura photographer',
        'West Bengal photographer',
        'visual storytelling',
        'professional photographer India',
        'portrait photographer Kolkata',
        'documentary photographer India',
        'wildlife photographer India',
        'editorial photographer',
        'photo retouching India',
        'storyfinder.me',
    ],
    authors: [{ name: 'Supratik Sahis', url: 'https://storyfinder.me' }],
    creator: 'Supratik Sahis',
    publisher: 'Supratik Sahis',
    applicationName: 'Storyfinder',
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },

    verification: {
        google: 'xmK4rWYGRahBy1EXgTAM3nNci4H0HNZARWZvyfKFqNA',
        other: {
            'msvalidate.01': 'EC8F0229F6BF89675E873BBB7827A2A7',
        },
    },

    openGraph: {
        title: 'Storyfinder | Supratik Sahis — Photographer & Visual Storyteller',
        description:
            'An interactive photography portfolio that tells a story through images by Supratik Sahis. Based in Kolkata, originally from Bankura.',
        url: 'https://storyfinder.me',
        siteName: 'Storyfinder',
        images: [
            {
                url: 'https://storyfinder.me/fallback/fallback-image-profile.png',
                width: 1200,
                height: 630,
                alt: 'Storyfinder Portfolio — Supratik Sahis, Photographer based in Kolkata',
            },
        ],
        locale: 'en_IN',
        type: 'website',
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Storyfinder | Supratik Sahis — Photographer & Visual Storyteller',
        description:
            'An interactive photography portfolio that tells a story through images. Based in Kolkata, originally from Bankura.',
        images: ['https://storyfinder.me/fallback/fallback-image-profile.png'],
    },

    appleWebApp: {
        title: 'Storyfinder',
        statusBarStyle: 'black-translucent',
        capable: true,
    },

    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },

    alternates: {
        canonical: 'https://storyfinder.me',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {}
                <meta name="geo.region" content="IN-WB" />
                <meta
                    name="geo.placename"
                    content="Kolkata, West Bengal, India"
                />
                <meta name="geo.position" content="22.5726;88.3639" />
                <meta name="ICBM" content="22.5726, 88.3639" />
                {}
                <meta name="theme-color" content="#0a0a0a" />
                <meta name="color-scheme" content="dark" />
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body
                className={`${goodMonolith.variable} ${ppNeueMontreal.variable} ${bigShouldersDisplay.variable} ${pangramSans.variable} antialiased`}
            >
                <ViewTransitions>
                    <PageTransition />
                    <ClientLayout>{children}</ClientLayout>
                </ViewTransitions>
            </body>
        </html>
    );
}
