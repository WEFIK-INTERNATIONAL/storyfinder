'use client';

import { useState, useEffect, useRef } from 'react';
import { useMobile } from '@/hooks/useMobile';
import Preloader from '@/components/ui/Preloader';
import GalleryCanvas from '@/components/home/GalleryCanvas';
import MobileHome from '@/components/home/MobileHome';
import GalleryErrorBoundary from '@/components/errors/GalleryErrorBoundary';
import './HomeOverlay.css';

export default function HomeClient({ images }) {
    const { isMobileOrTablet } = useMobile();
    const [mounted, setMounted] = useState(false);
    const overlayRef = useRef(null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted || isMobileOrTablet) return;

        const revealOverlay = () => {
            const el = overlayRef.current;
            if (!el) return;
            el.classList.add('home-overlay--visible');
        };

        // Listen for preloader completion, then delay to let gallery intro finish
        const onPreloaderDone = () => {
            window.removeEventListener('preloader:complete', onPreloaderDone);
            setTimeout(revealOverlay, 2800);
        };

        window.addEventListener('preloader:complete', onPreloaderDone);
        // Fallback if preloader already fired
        const fallback = setTimeout(revealOverlay, 5000);

        return () => {
            window.removeEventListener('preloader:complete', onPreloaderDone);
            clearTimeout(fallback);
        };
    }, [mounted, isMobileOrTablet]);

    if (!mounted) {
        return <Preloader />;
    }

    if (isMobileOrTablet) {
        return (
            <>
                <Preloader />
                <MobileHome />
            </>
        );
    }

    return (
        <>
            <Preloader />
            <GalleryErrorBoundary>
                <main className="absolute top-0 left-0 inset-0 overflow-hidden">
                    <GalleryCanvas images={images} />
                </main>
                <div
                    className="fixed inset-0 pointer-events-none z-7"
                    aria-hidden="true"
                >
                    <div className="absolute inset-0 mix-blend-overlay bg-linear-to-b from-black/90 via-black/50 to-transparent from-0% via-20% to-40% pointer-events-none" />
                </div>

                {/* Subtle branded overlay — navbar aligned */}
                <div
                    ref={overlayRef}
                    className="home-overlay home-overlay--visible pointer-events-auto"
                    aria-label="Homepage secondary navigation and controls"
                >
                    <div className="home-overlay__item hidden lg:flex">
                        <span className="home-overlay__label tracking-widest">DRAG</span>
                        <span className="home-overlay__value text-white/50 tracking-widest">[EXPLORE]</span>
                    </div>

                    <div className="home-overlay__item home-overlay__tagline !hidden xl:!block">
                        SUPRATIK SAHIS IS A VISUAL STORYTELLER<br/>
                        CRAFTING EXPERIENCES THROUGH PHOTOGRAPHY.
                    </div>
                </div>
            </GalleryErrorBoundary>
        </>
    );
}
