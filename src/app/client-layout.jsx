'use client';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { ReactLenis } from 'lenis/react';
import Menu from '@/components/layout/menu/Menu';
import { useSound } from '@/hooks/useSound';
import soundManager from '@/lib/soundManager';

const easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

const BASE_SCROLL_SETTINGS = {
    easing,
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    infinite: false,
    wheelMultiplier: 1,
    orientation: 'vertical',
    smoothWheel: true,
};

const MOBILE_SCROLL_SETTINGS = {
    ...BASE_SCROLL_SETTINGS,
    duration: 0.8,
    smoothTouch: true,
    touchMultiplier: 1.5,
    lerp: 0.09,
    syncTouch: true,
};

const DESKTOP_SCROLL_SETTINGS = {
    ...BASE_SCROLL_SETTINGS,
    duration: 1.2,
    smoothTouch: false,
    touchMultiplier: 2,
    lerp: 0.1,
    syncTouch: true,
};

export default function ClientLayout({ children }) {
    const pageRef = useRef();
    const [isMobile, setIsMobile] = useState(false);
    const musicStartedRef = useRef(false);
    const { enabled, isInitialized } = useSound();

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 1000);

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    /* ── Global click sound on all <a> and <button> elements ── */
    useEffect(() => {
        const handleGlobalClick = (e) => {
            // Walk up the DOM to find if clicked element is or is inside a link/button
            let target = e.target;
            let isClickable = false;

            while (target && target !== document.body) {
                const tag = target.tagName?.toLowerCase();
                if (tag === 'a' || tag === 'button') {
                    isClickable = true;
                    break;
                }
                target = target.parentElement;
            }

            if (!isClickable) return;

            // Exclude GalleryCanvas controls — they have their own sounds
            if (target.closest('.controls-container')) return;
            // Exclude the sound toggle in GalleryCanvas controls
            if (target.closest('.sound-toggle') && target.closest('.controls-container')) return;

            soundManager.play('click');
        };

        document.addEventListener('click', handleGlobalClick, true);
        return () => document.removeEventListener('click', handleGlobalClick, true);
    }, []);

    /* ── Background music: start after first interaction ── */
    useEffect(() => {
        if (!isInitialized || !enabled) return;

        const startMusic = () => {
            if (!musicStartedRef.current) {
                musicStartedRef.current = true;
                // Small delay to let the interaction unlock propagate
                setTimeout(() => {
                    soundManager.playLoop('background-music');
                }, 500);
            }
            document.removeEventListener('click', startMusic);
            document.removeEventListener('touchstart', startMusic);
        };

        // If already unlocked, start immediately
        if (soundManager._interactionUnlocked && !musicStartedRef.current) {
            musicStartedRef.current = true;
            soundManager.playLoop('background-music');
        } else {
            document.addEventListener('click', startMusic, { once: true });
            document.addEventListener('touchstart', startMusic, { once: true });
        }

        return () => {
            document.removeEventListener('click', startMusic);
            document.removeEventListener('touchstart', startMusic);
        };
    }, [isInitialized, enabled]);

    /* ── Pause/resume background music when sound is toggled ── */
    useEffect(() => {
        if (!musicStartedRef.current) return;

        if (enabled) {
            soundManager.playLoop('background-music');
        } else {
            soundManager.stopLoop();
        }
    }, [enabled]);

    const scrollSettings = useMemo(
        () => (isMobile ? MOBILE_SCROLL_SETTINGS : DESKTOP_SCROLL_SETTINGS),
        [isMobile]
    );

    return (
        <ReactLenis root options={scrollSettings}>
            <Menu pageRef={pageRef} />
            <div className="page" ref={pageRef}>
                {children}
            </div>
        </ReactLenis>
    );
}
