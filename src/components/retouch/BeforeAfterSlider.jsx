'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';

const BeforeAfterSlider = memo(function BeforeAfterSlider({
    before,
    after,
    beforeLqip,
    afterLqip,
    aspectRatio,
}) {
    const [pos, setPos] = useState(50);
    const [moved, setMoved] = useState(false);
    const [width, setWidth] = useState(0);
    const wrapRef = useRef(null);
    const isDrag = useRef(false);

    useEffect(() => {
        if (!wrapRef.current) return;
        const updateWidth = () => setWidth(wrapRef.current.offsetWidth);
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setPos(50);
            setMoved(false);
        }, 0);
    }, [before, after]);

    const calcPos = useCallback((clientX) => {
        const el = wrapRef.current;
        if (!el) return;
        const { left, width } = el.getBoundingClientRect();
        setPos(Math.min(98, Math.max(2, ((clientX - left) / width) * 100)));
        setMoved(true);
    }, []);

    const onMouseDown = useCallback(
        (e) => {
            isDrag.current = true;
            calcPos(e.clientX);

            const wrap = wrapRef.current;

            wrap._onMove = (e) => {
                if (isDrag.current) calcPos(e.clientX);
            };
            wrap._onUp = () => {
                isDrag.current = false;
                window.removeEventListener('mousemove', wrap._onMove);
                window.removeEventListener('mouseup', wrap._onUp);
            };

            window.addEventListener('mousemove', wrap._onMove);
            window.addEventListener('mouseup', wrap._onUp);
        },
        [calcPos]
    );

    useEffect(() => {
        const wrap = wrapRef.current;
        return () => {
            if (wrap) {
                if (wrap._onMove)
                    window.removeEventListener('mousemove', wrap._onMove);
                if (wrap._onUp)
                    window.removeEventListener('mouseup', wrap._onUp);
            }
        };
    }, []);

    const onTouchStart = useCallback(
        (e) => {
            isDrag.current = true;
            calcPos(e.touches[0].clientX);
        },
        [calcPos]
    );
    const onTouchMove = useCallback(
        (e) => {
            if (isDrag.current) {
                e.preventDefault();
                calcPos(e.touches[0].clientX);
            }
        },
        [calcPos]
    );
    const onTouchEnd = useCallback(() => {
        isDrag.current = false;
    }, []);

    return (
        <div
            ref={wrapRef}
            role="img"
            aria-label="Before and after comparison — drag to reveal"
            className="relative w-full h-full overflow-hidden select-none cursor-ew-resize touch-none"
            style={{ aspectRatio: aspectRatio || 'auto' }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {}
            <Image
                src={before}
                alt="Before retouch"
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                priority
                placeholder={beforeLqip ? 'blur' : 'empty'}
                blurDataURL={beforeLqip}
                className="rt-before-img object-cover pointer-events-none"
            />

            {}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${pos}%` }}
                aria-hidden="true"
            >
                {}
                <div
                    className="absolute inset-0"
                    style={{ width: width ? `${width}px` : '100%' }}
                >
                    <Image
                        src={after}
                        alt="After retouch"
                        fill
                        sizes="(max-width: 768px) 100vw, 80vw"
                        priority
                        placeholder={afterLqip ? 'blur' : 'empty'}
                        blurDataURL={afterLqip}
                        className="object-cover pointer-events-none"
                    />
                </div>
            </div>

            {}
            <div
                className="rt-divider-line"
                style={{ left: `${pos}%` }}
                aria-hidden="true"
            >
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
                    style={{
                        background: 'rgba(255,255,255,0.95)',
                        boxShadow:
                            '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <svg width="16" height="10" viewBox="0 0 20 11" fill="none">
                        <path
                            d="M0 5.5h20M5 1L0 5.5 5 10M15 1l5 4.5L15 10"
                            stroke="#141210"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>

            {}
            <span
                className="absolute bottom-4 left-4 z-20 font-display text-[0.58rem] tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full pointer-events-none"
                style={{
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(12px)',
                    color: 'rgba(227,227,219,0.75)',
                    border: '1px solid rgba(227,227,219,0.08)',
                }}
            >
                Before
            </span>
            <span
                className="absolute bottom-4 right-4 z-20 font-display text-[0.58rem] tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full pointer-events-none"
                style={{
                    background: '#c0501a',
                    color: '#fff',
                    boxShadow: '0 2px 12px rgba(192,80,26,0.35)',
                }}
            >
                After
            </span>

            {}
            {!moved && (
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    aria-hidden="true"
                >
                    <div
                        className="flex items-center gap-2.5 px-5 py-3 rounded-full"
                        style={{
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        <svg
                            width="14"
                            height="8"
                            viewBox="0 0 16 9"
                            fill="none"
                        >
                            <path
                                d="M0 4.5h16M4 1L0 4.5 4 8M12 1l4 3.5L12 8"
                                stroke="rgba(255,255,255,0.5)"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span className="font-display text-[0.6rem] tracking-[0.22em] uppercase text-white/45">
                            Drag to compare
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
});

export default BeforeAfterSlider;
