'use client';

import { useRef, useEffect, useCallback } from 'react';

export function useDragScroll() {
    const ref = useRef(null);
    const dragging = useRef(false);
    const startX = useRef(0);
    const scrollX = useRef(0);
    const moved = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const clientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

        const onDown = (e) => {
            dragging.current = true;
            moved.current = false;
            startX.current = clientX(e) - el.offsetLeft;
            scrollX.current = el.scrollLeft;
            el.style.cursor = 'grabbing';
        };
        const onMove = (e) => {
            if (!dragging.current) return;
            const walk = clientX(e) - el.offsetLeft - startX.current;
            if (Math.abs(walk) > 4) moved.current = true;
            el.scrollLeft = scrollX.current - walk;
        };
        const onUp = () => {
            dragging.current = false;
            el.style.cursor = 'grab';
        };

        el.style.cursor = 'grab';
        el.addEventListener('mousedown', onDown);
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseup', onUp);
        el.addEventListener('mouseleave', onUp);
        el.addEventListener('touchstart', onDown, { passive: true });
        el.addEventListener('touchmove', onMove, { passive: true });
        el.addEventListener('touchend', onUp);
        return () => {
            el.removeEventListener('mousedown', onDown);
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseup', onUp);
            el.removeEventListener('mouseleave', onUp);
            el.removeEventListener('touchstart', onDown);
            el.removeEventListener('touchmove', onMove);
            el.removeEventListener('touchend', onUp);
        };
    }, []);

    const onClick = useCallback((e) => {
        if (moved.current) e.stopPropagation();
    }, []);
    return { ref, onClick };
}
