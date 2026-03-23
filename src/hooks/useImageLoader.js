'use client';

import { useState, useEffect } from 'react';

export function useImageLoader(src) {
    const [state, setState] = useState({
        loaded: false,
        error: false,
        currentSrc: src,
    });

    if (state.currentSrc !== src) {
        setState({ loaded: false, error: false, currentSrc: src });
    }

    useEffect(() => {
        if (!src) return;
        let cancelled = false;
        const img = new Image();
        img.onload = () => {
            if (!cancelled) setState((prev) => ({ ...prev, loaded: true }));
        };
        img.onerror = () => {
            if (!cancelled) setState((prev) => ({ ...prev, error: true }));
        };
        img.src = src;
        return () => {
            cancelled = true;
        };
    }, [src]);

    return { loaded: state.loaded, error: state.error };
}
