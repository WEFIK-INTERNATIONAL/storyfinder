'use client';

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import './minimap.css';

const ACTIVE_OPACITY = 0.3;
const LERP_NORMAL = 0.075;
const LERP_CLICK = 0.05;
const ITEM_SIZE = 66;
const DRAG_THRESHOLD = 5;

export default function Minimap({
    images = [],
    category = '',
    className = '',
}) {
    const stripRef = useRef(null);
    const itemsRef = useRef(null);
    const itemRefs = useRef([]);
    const router = useRouter();

    const state = useRef({
        maxTranslate: 0,
        currentTranslate: 0,
        targetTranslate: 0,
        isClickMove: false,
        currentIndex: 0,
    });

    const drag = useRef({
        active: false,
        startPos: 0,
        lastPos: 0,
        velocity: 0,
        didDrag: false,
    });

    const [previewSrc, setPreviewSrc] = useState(images[0]?.src ?? '');
    const [previewReady, setPreviewReady] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHorizontal, setIsHorizontal] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth <= 900;
    });

    const imageKeys = useMemo(
        () => images.map((img, i) => img.id ?? img.src ?? String(i)),
        [images]
    );

    const lerp = (s, e, f) => s + (e - s) * f;
    const getPos = useCallback(
        (e) => {
            const touch = e.touches?.[0] ?? e.changedTouches?.[0];
            return isHorizontal
                ? (touch?.clientX ?? e.clientX)
                : (touch?.clientY ?? e.clientY);
        },
        [isHorizontal]
    );

    const clamp = useCallback((value) => {
        const st = state.current;
        return Math.max(-st.maxTranslate, Math.min(0, value));
    }, []);

    const translateToIndex = useCallback(
        (translate) => {
            const raw = Math.round(-translate / ITEM_SIZE);
            return Math.max(0, Math.min(raw, images.length - 1));
        },
        [images.length]
    );

    const indexToTranslate = useCallback((index) => -index * ITEM_SIZE, []);

    const computeMaxTranslate = useCallback(
        () => (images.length - 1) * ITEM_SIZE,
        [images.length]
    );

    const applyTransform = useCallback(
        (value) => {
            if (!itemsRef.current) return;
            itemsRef.current.style.transform = isHorizontal
                ? `translateX(${value}px)`
                : `translateY(${value}px)`;
        },
        [isHorizontal]
    );

    const syncOpacity = useCallback((idx) => {
        itemRefs.current.forEach((el, i) => {
            if (el) el.style.opacity = i === idx ? String(ACTIVE_OPACITY) : '1';
        });
    }, []);

    const syncPreview = useCallback(
        (idx) => {
            const st = state.current;
            if (st.currentIndex === idx) return;
            st.currentIndex = idx;
            setPreviewReady(false);
            setPreviewSrc(images[idx]?.src ?? '');
            setActiveIndex(idx);
        },
        [images]
    );

    const startLoop = useCallback(() => {
        const tick = () => {
            const st = state.current;
            const factor = st.isClickMove ? LERP_CLICK : LERP_NORMAL;

            st.currentTranslate = lerp(
                st.currentTranslate,
                st.targetTranslate,
                factor
            );

            if (Math.abs(st.currentTranslate - st.targetTranslate) > 0.1) {
                applyTransform(st.currentTranslate);
                const idx = translateToIndex(st.currentTranslate);
                syncOpacity(idx);
                syncPreview(idx);
            } else {
                st.isClickMove = false;
                const snapped = indexToTranslate(
                    translateToIndex(st.currentTranslate)
                );
                if (Math.abs(snapped - st.targetTranslate) > 0.5) {
                    st.targetTranslate = snapped;
                }
            }
        };

        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
    }, [
        applyTransform,
        translateToIndex,
        indexToTranslate,
        syncOpacity,
        syncPreview,
    ]);

    const handleWheel = useCallback(
        (e) => {
            e.preventDefault();
            const st = state.current;
            st.isClickMove = false;
            const v = Math.min(Math.max(e.deltaY * 0.5, -20), 20);
            st.targetTranslate = clamp(st.targetTranslate - v);
        },
        [clamp]
    );

    const handleMouseMove = useRef(null);
    const handleMouseUp = useRef(null);

    const handleDragStart = useCallback(
        (e) => {
            if (e.button === 2) return;
            const pos = getPos(e);
            drag.current = {
                active: true,
                startPos: pos,
                lastPos: pos,
                velocity: 0,
                didDrag: false,
            };
        },
        [getPos]
    );

    const handleDragMove = useCallback(
        (e) => {
            const d = drag.current;
            const st = state.current;
            if (!d.active) return;

            const pos = getPos(e);
            const delta = pos - d.lastPos;

            if (!d.didDrag && Math.abs(pos - d.startPos) < DRAG_THRESHOLD)
                return;
            d.didDrag = true;
            e.preventDefault?.();

            d.velocity = delta;
            d.lastPos = pos;

            st.currentTranslate = clamp(st.currentTranslate + delta);
            st.targetTranslate = st.currentTranslate;
            applyTransform(st.currentTranslate);

            const idx = translateToIndex(st.currentTranslate);
            syncOpacity(idx);
            syncPreview(idx);
        },
        [
            getPos,
            clamp,
            applyTransform,
            translateToIndex,
            syncOpacity,
            syncPreview,
        ]
    );

    const handleDragEnd = useCallback(() => {
        const d = drag.current;
        const st = state.current;
        if (!d.active) return;
        d.active = false;
        const momentum = d.velocity * 3;
        st.targetTranslate = indexToTranslate(
            translateToIndex(clamp(st.currentTranslate + momentum))
        );
        st.isClickMove = true;
        window.removeEventListener('mousemove', handleMouseMove.current);
        window.removeEventListener('mouseup', handleMouseUp.current);
    }, [indexToTranslate, translateToIndex, clamp]);

    const handleItemClick = useCallback(
        (index) => {
            if (drag.current.didDrag) return;
            const st = state.current;
            st.isClickMove = true;
            st.targetTranslate = clamp(indexToTranslate(index));
        },
        [clamp, indexToTranslate]
    );

    const handleResize = useCallback(() => {
        const st = state.current;
        const horizontal = window.innerWidth <= 900;
        setIsHorizontal(horizontal);
        st.maxTranslate = computeMaxTranslate();
        const clamped = clamp(st.targetTranslate);
        st.targetTranslate = clamped;
        st.currentTranslate = clamped;
        applyTransform(clamped);
    }, [computeMaxTranslate, clamp, applyTransform]);

    const handleDownload = useCallback(async () => {
        if (!previewSrc) return;

        try {
            // Fetch the image as a blob to force the browser to download it
            // instead of just opening the CDN link in a new tab.
            const response = await fetch(previewSrc);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const filename =
                `${category || 'gallery'}-${state.current.currentIndex + 1}.jpg`
                    .toLowerCase()
                    .replace(/\s+/g, '-');

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Failed to download image:', err);
            // Fallback opens in new tab
            window.open(previewSrc, '_blank');
        }
    }, [previewSrc, category]);

    const handleShare = useCallback(async () => {
        // Construct a URL to the webpage, appending the current image index
        // so that the server can generate a dynamic Open Graph meta image if supported.
        const originUrl = window.location.origin + window.location.pathname;
        const url = `${originUrl}?img=${activeIndex}`;

        const shareData = { title: category || 'Gallery', url };

        try {
            if (
                typeof navigator.share === 'function' &&
                navigator.canShare?.(shareData)
            ) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch {}
    }, [activeIndex, category]);

    useEffect(() => {
        if (!images.length) return;

        const st = state.current;
        const horizontal = window.innerWidth <= 900;
        setTimeout(() => setIsHorizontal(horizontal), 0);
        st.maxTranslate = computeMaxTranslate();
        st.currentTranslate = 0;
        st.targetTranslate = 0;
        applyTransform(0);
        syncOpacity(0);

        const stripEl = stripRef.current;
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('resize', handleResize);
        const onMouseMove = (e) => handleDragMove(e);
        const onMouseUp = () => handleDragEnd();
        handleMouseMove.current = onMouseMove;
        handleMouseUp.current = onMouseUp;

        const onMouseDown = (e) => {
            handleDragStart(e);
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        };

        stripEl.addEventListener('mousedown', onMouseDown);

        stripEl.addEventListener('touchstart', handleDragStart, {
            passive: true,
        });
        stripEl.addEventListener('touchmove', handleDragMove, {
            passive: false,
        });
        stripEl.addEventListener('touchend', handleDragEnd, { passive: true });
        stripEl.addEventListener('touchcancel', handleDragEnd, {
            passive: true,
        });

        const removeTick = startLoop();

        return () => {
            removeTick();
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            stripEl.removeEventListener('mousedown', onMouseDown);
            stripEl.removeEventListener('touchstart', handleDragStart);
            stripEl.removeEventListener('touchmove', handleDragMove);
            stripEl.removeEventListener('touchend', handleDragEnd);
            stripEl.removeEventListener('touchcancel', handleDragEnd);
        };
    }, [
        images,
        computeMaxTranslate,
        applyTransform,
        syncOpacity,
        handleWheel,
        handleResize,
        handleDragStart,
        handleDragMove,
        handleDragEnd,
        startLoop,
    ]);

    if (!images || images.length === 0) {
        return (
            <div className="minimap-root minimap-empty">
                <h1>No images to show</h1>
                <p>Please check back later.</p>
                <button
                    className="minimap-back-btn"
                    onClick={() => router.back()}
                >
                    ← Go Back
                </button>
            </div>
        );
    }

    return (
        <div className={`minimap-root ${className}`.trim()}>
            {/* ── Category label ── */}
            {category && (
                <div
                    className="minimap-site-info"
                    aria-label={`Category: ${category}`}
                >
                    <p>Category</p>
                    <p>
                        <span>{category}</span>
                    </p>
                </div>
            )}

            <div className="minimap-preview-wrapper">
                {previewSrc && (
                    <Image
                        key={previewSrc}
                        src={previewSrc}
                        alt={`${category} photo ${activeIndex + 1} of ${images.length}`}
                        fill
                        priority
                        className={`minimap-preview-img ${previewReady ? 'is-ready' : ''}`}
                        placeholder={
                            images[activeIndex]?.lqip ? 'blur' : 'empty'
                        }
                        blurDataURL={images[activeIndex]?.lqip}
                        onLoad={() => setPreviewReady(true)}
                        sizes="100vw"
                        unoptimized
                    />
                )}

                <div
                    className="minimap-preview-actions"
                    role="group"
                    aria-label="Image actions"
                >
                    <button
                        className="minimap-action-btn"
                        onClick={handleDownload}
                        aria-label="Download current image"
                        title="Download"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>Download</span>
                    </button>

                    <button
                        className="minimap-action-btn"
                        onClick={handleShare}
                        aria-label={
                            copied
                                ? 'Link copied to clipboard'
                                : 'Share current image'
                        }
                        title="Share"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        <span>{copied ? 'Copied!' : 'Share'}</span>
                    </button>
                </div>
            </div>

            <div
                ref={stripRef}
                className="minimap-strip"
                role="listbox"
                aria-label={`${category} image thumbnails`}
                aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
            >
                <div className="minimap-indicator" aria-hidden="true" />

                <div ref={itemsRef} className="minimap-items">
                    {images.map((img, i) => (
                        <div
                            key={imageKeys[i]}
                            ref={(el) => (itemRefs.current[i] = el)}
                            className="minimap-item"
                            role="option"
                            aria-selected={i === activeIndex}
                            aria-label={img.alt ?? `${category} image ${i + 1}`}
                            tabIndex={0}
                            onClick={() => handleItemClick(i)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleItemClick(i);
                                }
                            }}
                        >
                            <Image
                                src={img.src}
                                alt={img.alt ?? `${category} ${i + 1}`}
                                fill
                                className="minimap-item-img"
                                sizes="80px"
                                placeholder={img.lqip ? 'blur' : 'empty'}
                                blurDataURL={img.lqip}
                                unoptimized
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
