import Preloader from '@/components/ui/Preloader';
import GalleryCanvas from '@/components/home/GalleryCanvas';
import MobileHome from '@/components/home/MobileHome';
import GalleryErrorBoundary from '@/components/errors/GalleryErrorBoundary';

import { client } from '@/lib/sanityClient';
import { FEATURED_PHOTOS_QUERY } from '../../../sanity/lib/queries';

export default async function Home() {
    const data = await client.fetch(FEATURED_PHOTOS_QUERY);

    return (
        <>
            <Preloader />
            <GalleryErrorBoundary>
                <main className="absolute top-0 left-0 inset-0 overflow-hidden">
                    <GalleryCanvas images={data} />
                </main>
                <div
                    className="fixed inset-0 pointer-events-none z-7"
                    aria-hidden="true"
                >
                    <div className="absolute inset-0 mix-blend-overlay bg-linear-to-b from-black/90 via-black/50 to-transparent from-0% via-20% to-40% pointer-events-none" />
                </div>
            </GalleryErrorBoundary>
        </>
    );
}
