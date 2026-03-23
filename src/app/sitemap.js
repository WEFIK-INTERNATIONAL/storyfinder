import { client } from '@/lib/sanityClient';
import { GALLERIES_QUERY, POSTS_QUERY } from '../../sanity/lib/queries';

export default async function sitemap() {
    const baseUrl = 'https://storyfinder.me';

    // Fetch dynamic routes
    const [galleries, posts] = await Promise.all([
        client.fetch(GALLERIES_QUERY),
        client.fetch(POSTS_QUERY),
    ]);

    const galleryUrls = galleries.map((gallery) => ({
        url: `${baseUrl}/gallery/${gallery.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const blogUrls = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt || new Date()),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    const staticPages = [
        { route: '', changeFrequency: 'daily', priority: 1.0 },
        { route: '/about', changeFrequency: 'monthly', priority: 0.9 },
        { route: '/gallery', changeFrequency: 'weekly', priority: 0.9 },
        { route: '/blog', changeFrequency: 'weekly', priority: 0.8 },
        { route: '/contact', changeFrequency: 'monthly', priority: 0.8 },
        { route: '/before-after', changeFrequency: 'weekly', priority: 0.7 },
        { route: '/featured', changeFrequency: 'monthly', priority: 0.7 },
    ].map(({ route, changeFrequency, priority }) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }));

    return [...staticPages, ...galleryUrls, ...blogUrls];
}
