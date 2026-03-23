import { useState, useEffect } from 'react';

const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
};

function getWindowWidth() {
    if (typeof window === 'undefined') return undefined;
    return window.innerWidth;
}

export function useMobile() {
    const [windowWidth, setWindowWidth] = useState(getWindowWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile =
        windowWidth !== undefined
            ? windowWidth < BREAKPOINTS.mobile
            : undefined;
    const isTablet =
        windowWidth !== undefined
            ? windowWidth >= BREAKPOINTS.mobile &&
              windowWidth < BREAKPOINTS.tablet
            : undefined;
    const isMobileOrTablet =
        windowWidth !== undefined
            ? windowWidth < BREAKPOINTS.tablet
            : undefined;

    return { isMobile, isTablet, isMobileOrTablet };
}
