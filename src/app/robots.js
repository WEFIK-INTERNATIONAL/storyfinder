export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/'],
            },
        ],
        sitemap: 'https://storyfinder.me/sitemap.xml',
        host: 'https://storyfinder.me',
    };
}
