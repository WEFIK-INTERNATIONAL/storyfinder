'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { ReactLenis } from 'lenis/react';
import Menu from '@/components/layout/menu/Menu';

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

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 1000);

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
