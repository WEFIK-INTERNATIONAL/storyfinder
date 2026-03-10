import ContactClient from './ContactClient';

export const metadata = {
    title: 'Contact — Book a Session or Collaborate',
    description:
        'Get in touch with Supratik Sahis, a photographer from Bankura currently based in Kolkata. Available for portrait, documentary, editorial, and wildlife photography commissions and collaborations.',
    keywords: [
        'contact Supratik Sahis',
        'Kolkata photographer contact',
        'Bankura photographer contact',
        'book photographer Kolkata',
        'photography commissions India',
        'photography collaborations West Bengal',
        'Storyfinder contact',
        'hire photographer India',
    ],
    openGraph: {
        title: 'Contact Supratik Sahis | Photographer & Visual Storyteller',
        description:
            'Available for photography commissions and creative collaborations. Based in Kolkata, originally from Bankura, working globally.',
        url: 'https://storyfinder.me/contact',
        type: 'website',
        siteName: 'Storyfinder',
        locale: 'en_IN',
        images: [
            {
                url: 'https://storyfinder.me/fallback/fallback-image-profile.png',
                width: 1200,
                height: 630,
                alt: 'Contact Supratik Sahis — Photographer',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Contact Supratik Sahis — Photography',
        description:
            'Available for commissions. Based in Kolkata and Bankura, working globally.',
        images: ['https://storyfinder.me/fallback/fallback-image-profile.png'],
    },
    alternates: {
        canonical: 'https://storyfinder.me/contact',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': 'https://storyfinder.me/contact#webpage',
    name: 'Contact Supratik Sahis',
    url: 'https://storyfinder.me/contact',
    description:
        'Contact page for Supratik Sahis, a professional photographer based in Kolkata, originally from Bankura.',
    mainEntity: {
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
        email: 'supratiksahis459@gmail.com',
        telephone: '+91-8167084856',
        url: 'https://storyfinder.me',
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'supratiksahis459@gmail.com',
            telephone: '+91-8167084856',
            availableLanguage: ['English', 'Bengali', 'Hindi'],
        },
    },
};

export default function ContactPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ContactClient />
        </>
    );
}
