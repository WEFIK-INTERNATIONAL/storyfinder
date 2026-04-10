'use client';

import {
    useEffect,
    useRef,
    useCallback,
    useReducer,
    useMemo,
    useState,
} from 'react';
import Image from 'next/image';
import soundManager from '@/lib/soundManager';
import { useSoundStore } from '@/store/useSoundStore';
import { useGalleryStore } from '@/store/useGalleryStore';
import { isInitialLoad } from '@/components/ui/Preloader';
import { gsap, Draggable, Flip, customEase, centerEase } from '@/lib/gsap';
import { GRID_CONFIG } from '@/lib/galleryData';
import { urlFor } from '@/lib/image';
import './GalleryCanvas.css';

function hexToRgbParts(hex) {
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ];
}

function interpolateHex(rgb1, rgb2, factor) {
    const r = Math.round(rgb1[0] + factor * (rgb2[0] - rgb1[0]));
    const g = Math.round(rgb1[1] + factor * (rgb2[1] - rgb1[1]));
    const b = Math.round(rgb1[2] + factor * (rgb2[2] - rgb1[2]));
    return `rgb(${r},${g},${b})`;
}

const WAVE_COLORS = {
    primary: hexToRgbParts('#2C1B14'),
    accent: hexToRgbParts('#A64B23'),
    mute: hexToRgbParts('#D9C4AA'),
};

function calculateGapForZoom(zoomLevel) {
    if (zoomLevel >= 1.0) return 16;
    if (zoomLevel >= 0.6) return 32;
    return 64;
}

function calculateGridDimensions(zoom, gap) {
    const { cols, rows, itemSize } = GRID_CONFIG;
    const width = cols * (itemSize + gap) - gap;
    const height = rows * (itemSize + gap) - gap;
    return {
        width,
        height,
        scaledWidth: width * zoom,
        scaledHeight: height * zoom,
        gap,
    };
}

function calculateFitZoom() {
    const vw = window.innerWidth;
    const vh = window.innerHeight - 80;
    const gap = calculateGapForZoom(1.0);
    const { cols, rows, itemSize } = GRID_CONFIG;
    const gridW = cols * (itemSize + gap) - gap;
    const gridH = rows * (itemSize + gap) - gap;
    const margin = 40;
    const fit = Math.min((vw - margin * 2) / gridW, (vh - margin * 2) / gridH);
    return Math.max(0.1, Math.min(2.0, fit));
}

const descriptionCache = new Map();

function splitTextIntoLines(element, text) {
    if (descriptionCache.has(text)) {
        element.innerHTML = '';
        descriptionCache.get(text).forEach((lineText) => {
            const span = document.createElement('span');
            span.className = 'description-line';
            span.textContent = lineText;
            element.appendChild(span);
        });
        return element.querySelectorAll('.description-line');
    }

    element.innerHTML = '';
    const containerWidth = element.offsetWidth || 400;
    const lines = [];

    const temp = document.createElement('div');
    temp.style.cssText = [
        'position:absolute',
        'visibility:hidden',
        'pointer-events:none',
        `width:${containerWidth}px`,
        "font-family:'PPNeueMontreal',sans-serif",
        'font-size:16px',
        'font-weight:300',
        'line-height:1.4',
        'white-space:nowrap',
    ].join(';');
    document.body.appendChild(temp);

    let currentLine = '';
    text.split(' ').forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        temp.textContent = testLine;
        if (temp.scrollWidth > containerWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });
    if (currentLine) lines.push(currentLine);
    document.body.removeChild(temp);

    descriptionCache.set(text, lines);

    lines.forEach((lineText) => {
        const span = document.createElement('span');
        span.className = 'description-line';
        span.textContent = lineText;
        element.appendChild(span);
    });

    return element.querySelectorAll('.description-line');
}

const initialGalleryState = {
    currentZoom: GRID_CONFIG.initialZoom,
    currentGap: calculateGapForZoom(GRID_CONFIG.initialZoom),
    isZoomActive: false,
    selectedIndex: null,
};

function galleryReducer(state, action) {
    switch (action.type) {
        case 'SET_ZOOM':
            return {
                ...state,
                currentZoom: action.zoom,
                currentGap: action.gap,
            };
        case 'OPEN_IMAGE':
            return {
                ...state,
                isZoomActive: true,
                selectedIndex: action.index,
            };
        case 'CLOSE_IMAGE':
            return { ...state, isZoomActive: false, selectedIndex: null };
        default:
            return state;
    }
}

export default function GalleryCanvas({ images = [] }) {
    const toggleSoundStore = useSoundStore((s) => s.toggleSound);
    const openImageStore = useGalleryStore((s) => s.openImage);
    const closeImageStore = useGalleryStore((s) => s.closeImage);
    const setZoomStore = useGalleryStore((s) => s.setZoom);
    const setCurrentGapStore = useGalleryStore((s) => s.setCurrentGap);

    const [loadedCount, setLoadedCount] = useState(0);
    const loadedCountRef = useRef(0);

    const handleImageLoad = useCallback(() => {
        loadedCountRef.current += 1;
        const count = loadedCountRef.current;
        if (count === 12 || count === 24 || count === 48 || count >= 96) {
            setLoadedCount(count);
        }
    }, []);

    const GRID_ITEMS = useMemo(() => {
        const gap = calculateGapForZoom(GRID_CONFIG.initialZoom);
        const { cols, itemSize } = GRID_CONFIG;

        const validImages = images.filter((img) => img?.imageUrl || img?.image);
        let sourceImages = [...validImages];

        if (sourceImages.length > 0 && sourceImages.length < 96) {
            while (sourceImages.length < 96) {
                const randomImage =
                    validImages[Math.floor(Math.random() * validImages.length)];
                sourceImages.push(randomImage);
            }
        }

        return sourceImages.map((img, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;

            const thumb = img.image
                ? urlFor(img.image).width(400).auto('format').quality(65).url()
                : img.imageUrl;

            const full = img.image
                ? urlFor(img.image).width(2000).auto('format').quality(80).url()
                : img.imageUrl;

            return {
                index: i,
                row,
                col,
                baseX: col * (itemSize + gap),
                baseY: row * (itemSize + gap),
                imageUrl: full,
                thumbnailUrl: thumb,
                lqip: img.lqip,
                imageData: {
                    title: img.title,
                    number: String(i + 1).padStart(2, '0'),
                    description: img.title || '',
                    fullResUrl: full,
                },
            };
        });
    }, [images]);

    const [state, localDispatch] = useReducer(
        galleryReducer,
        initialGalleryState
    );
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const viewportRef = useRef(null);
    const canvasWrapperRef = useRef(null);
    const gridContainerRef = useRef(null);
    const splitScreenRef = useRef(null);
    const splitLeftRef = useRef(null);
    const splitRightRef = useRef(null);
    const zoomTargetRef = useRef(null);
    const imageTitleOverlayRef = useRef(null);
    const slideNumberRef = useRef(null);
    const slideTitleRef = useRef(null);
    const slideDescRef = useRef(null);
    const closeButtonRef = useRef(null);
    const controlsRef = useRef(null);
    const percentageRef = useRef(null);
    const soundToggleRef = useRef(null);
    const soundWaveCanvasRef = useRef(null);
    const itemRefs = useRef([]);

    const draggableRef = useRef(null);
    const observerRef = useRef(null);
    const quickOpacityMap = useRef(new Map());
    const zoomStateRef = useRef({
        isActive: false,
        selectedIndex: null,
        scalingOverlay: null,
        flipAnimation: null,
    });
    const lastValidPosRef = useRef({ x: 0, y: 0 });
    const descriptionLinesRef = useRef([]);
    const resizeTimerRef = useRef(null);
    const failsafeTimerRef = useRef(null);
    const preloaderListenerRef = useRef(null);
    const soundWaveRafRef = useRef(null);
    const focusTrapRef = useRef({ handler: null, previous: null });

    const initSoundWave = useCallback(() => {
        const canvas = soundWaveCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = 32;
        const height = 16;
        const centerY = Math.floor(height / 2);
        const startTime = Date.now();
        let currentAmplitude = soundManager.enabled ? 1 : 0;

        const animate = () => {
            const target = soundManager.enabled ? 1 : 0;
            currentAmplitude += (target - currentAmplitude) * 0.08;

            ctx.clearRect(0, 0, width, height);
            const time = (Date.now() - startTime) / 1000;
            const mute = 1 - currentAmplitude;

            if (!soundManager.enabled && currentAmplitude < 0.01) {
                ctx.fillStyle = `rgb(${WAVE_COLORS.mute.join(',')})`;
                ctx.fillRect(0, centerY, width, 2);
            } else {
                ctx.fillStyle = interpolateHex(
                    WAVE_COLORS.primary,
                    WAVE_COLORS.mute,
                    mute
                );
                for (let i = 0; i < width; i++) {
                    const x = i - width / 2;
                    const e = Math.exp((-x * x) / 50);
                    const y =
                        centerY +
                        Math.cos(x * 0.4 - time * 8) *
                            e *
                            height *
                            0.35 *
                            currentAmplitude;
                    ctx.fillRect(i, Math.round(y), 1, 2);
                }
                ctx.fillStyle = interpolateHex(
                    WAVE_COLORS.accent,
                    WAVE_COLORS.mute,
                    mute
                );
                for (let i = 0; i < width; i++) {
                    const x = i - width / 2;
                    const e = Math.exp((-x * x) / 80);
                    const y =
                        centerY +
                        Math.cos(x * 0.3 - time * 5) *
                            e *
                            height *
                            0.25 *
                            currentAmplitude;
                    ctx.fillRect(i, Math.round(y), 1, 2);
                }
            }
            soundWaveRafRef.current = requestAnimationFrame(animate);
        };
        animate();
    }, []);

    const trapFocus = useCallback((container) => {
        const sel = [
            'button:not([disabled])',
            '[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
        ].join(',');
        const focusable = Array.from(container.querySelectorAll(sel));
        if (!focusable.length) return;

        focusTrapRef.current.previous = document.activeElement;
        focusable[0].focus();

        const handler = (e) => {
            if (e.key !== 'Tab') return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        focusTrapRef.current.handler = handler;
        container.addEventListener('keydown', handler);
    }, []);

    const releaseFocusTrap = useCallback((container) => {
        if (focusTrapRef.current.handler) {
            container.removeEventListener(
                'keydown',
                focusTrapRef.current.handler
            );
            focusTrapRef.current.handler = null;
        }
        focusTrapRef.current.previous?.focus();
        focusTrapRef.current.previous = null;
    }, []);

    const calculateBounds = useCallback((zoom, gap) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const { scaledWidth, scaledHeight } = calculateGridDimensions(
            zoom,
            gap
        );
        const marginX = gap * zoom;
        const marginY = gap * zoom;
        return {
            minX:
                scaledWidth <= vw
                    ? (vw - scaledWidth) / 2
                    : vw - scaledWidth - marginX,
            maxX: scaledWidth <= vw ? (vw - scaledWidth) / 2 : marginX,
            minY:
                scaledHeight <= vh
                    ? (vh - scaledHeight) / 2
                    : vh - scaledHeight - marginY,
            maxY: scaledHeight <= vh ? (vh - scaledHeight) / 2 : marginY,
        };
    }, []);

    const initDraggable = useCallback(
        (zoom, gap) => {
            draggableRef.current?.kill();
            const bounds = calculateBounds(zoom, gap);

            draggableRef.current = Draggable.create(canvasWrapperRef.current, {
                type: 'x,y',
                bounds,
                edgeResistance: 0.8,
                inertia: true,
                throwProps: {
                    x: {
                        velocity: 'auto',
                        resistance: 300,
                        end: (v) => Math.round(v),
                    },
                    y: {
                        velocity: 'auto',
                        resistance: 300,
                        end: (v) => Math.round(v),
                    },
                },
                onDragStart() {
                    document.body.classList.add('dragging');
                    soundManager.play('drag-start');
                    lastValidPosRef.current.x = this.x;
                    lastValidPosRef.current.y = this.y;
                },
                onDrag() {
                    lastValidPosRef.current.x = this.x;
                    lastValidPosRef.current.y = this.y;
                },
                onDragEnd() {
                    document.body.classList.remove('dragging');
                    soundManager.play('drag-end');
                },
            })[0];
        },
        [calculateBounds]
    );

    const animateZoomTransition = useCallback(
        (targetZoom, newGap, animDuration = 1.2) => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const { currentGap } = stateRef.current;

            if (newGap !== currentGap) {
                const targets = GRID_ITEMS.map(
                    (_, i) => itemRefs.current[i]?.wrapper
                ).filter(Boolean);

                gsap.to(targets, {
                    duration: animDuration,
                    left: (i) =>
                        GRID_ITEMS[i].col * (GRID_CONFIG.itemSize + newGap),
                    top: (i) =>
                        GRID_ITEMS[i].row * (GRID_CONFIG.itemSize + newGap),
                    ease: customEase,
                    stagger: { amount: 0.08, from: 'center' },
                });

                gsap.to(canvasWrapperRef.current, {
                    duration: animDuration,
                    width:
                        GRID_CONFIG.cols * (GRID_CONFIG.itemSize + newGap) -
                        newGap,
                    height:
                        GRID_CONFIG.rows * (GRID_CONFIG.itemSize + newGap) -
                        newGap,
                    ease: customEase,
                });
                setCurrentGapStore(newGap);
            }

            const dims = calculateGridDimensions(targetZoom, newGap);
            const finalX = (vw - dims.scaledWidth) / 2;
            const finalY = (vh - dims.scaledHeight) / 2;

            gsap.to(canvasWrapperRef.current, {
                duration: animDuration,
                scale: targetZoom,
                x: finalX,
                y: finalY,
                ease: customEase,
                onComplete: () => {
                    lastValidPosRef.current = { x: finalX, y: finalY };
                    initDraggable(targetZoom, newGap);
                },
            });
        },
        [setCurrentGapStore, initDraggable, GRID_ITEMS]
    );

    const updateZoomButtons = useCallback((activeEl, zoomLevel) => {
        controlsRef.current
            ?.querySelectorAll('.switch-button')
            .forEach((btn) => {
                btn.classList.remove('switch-button-current');
            });
        if (activeEl) {
            activeEl.classList.add('switch-button-current');
            return;
        }
        if (zoomLevel !== null) {
            const map = { 0.3: 0, 0.6: 1, 1.0: 2 };
            const idx = map[zoomLevel];
            if (idx !== undefined) {
                controlsRef.current
                    ?.querySelectorAll('.switch-button')
                    [idx]?.classList.add('switch-button-current');
            }
        }
    }, []);

    const exitZoomMode = useCallback(() => {
        const zs = zoomStateRef.current;
        if (!zs.isActive || zs.selectedIndex === null || !zs.scalingOverlay)
            return;

        soundManager.play('close');
        closeImageStore();

        const splitEl = splitScreenRef.current;
        const wrapperEl = itemRefs.current[zs.selectedIndex]?.wrapper;
        const imgEl = itemRefs.current[zs.selectedIndex]?.img;

        releaseFocusTrap(splitEl);
        document.removeEventListener(
            'keydown',
            zoomStateRef.current._keyHandler
        );
        if (zs.flipAnimation) zs.flipAnimation.kill();

        gsap.to(imageTitleOverlayRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out',
        });
        gsap.to(slideNumberRef.current, {
            duration: 0.4,
            y: -20,
            opacity: 0,
            ease: 'power2.out',
        });
        gsap.to(slideTitleRef.current, {
            duration: 0.4,
            y: -60,
            opacity: 0,
            ease: 'power2.out',
        });

        if (descriptionLinesRef.current?.length) {
            gsap.to(descriptionLinesRef.current, {
                duration: 0.4,
                y: -80,
                opacity: 0,
                ease: 'power2.out',
                stagger: -0.05,
                onComplete: () => {
                    imageTitleOverlayRef.current?.classList.remove('active');
                    gsap.set(slideNumberRef.current, { y: 20, opacity: 0 });
                    gsap.set(slideTitleRef.current, { y: 60, opacity: 0 });
                    gsap.set(descriptionLinesRef.current, {
                        y: 80,
                        opacity: 0,
                    });
                },
            });
        }

        gsap.to(closeButtonRef.current, {
            duration: 0.3,
            opacity: 0,
            x: 40,
            ease: 'power2.in',
            onComplete: () =>
                closeButtonRef.current?.setAttribute('aria-hidden', 'true'),
        });

        splitEl.classList.remove('active');
        controlsRef.current?.classList.remove('split-mode');

        if (window.innerWidth < 768) {
            gsap.to(controlsRef.current, {
                y: 0,
                duration: 0.6,
                ease: 'expo.out',
                delay: 0.4,
            });
        }

        gsap.to(splitEl, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => splitEl.setAttribute('aria-hidden', 'true'),
        });

        if (zs.scalingOverlay) {
            gsap.to(zs.scalingOverlay, {
                opacity: 0.4,
                duration: 0.8,
                ease: 'power2.out',
            });
        }

        Flip.fit(zs.scalingOverlay, wrapperEl, {
            duration: 1.2,
            ease: customEase,
            absolute: true,
            onComplete: () => {
                if (imgEl) gsap.set(imgEl, { opacity: 1 });
                if (zs.scalingOverlay) {
                    document.body.removeChild(zs.scalingOverlay);
                    zs.scalingOverlay = null;
                }
                splitEl.classList.remove('active');
                document.body.classList.remove('zoom-mode');
                closeButtonRef.current?.classList.remove('active');
                draggableRef.current?.enable();
                wrapperEl?.focus();

                zoomStateRef.current.isActive = false;
                zoomStateRef.current.selectedIndex = null;
                zoomStateRef.current.flipAnimation = null;
                localDispatch({ type: 'CLOSE_IMAGE' });
            },
        });
    }, [closeImageStore, releaseFocusTrap]);

    const setZoom = useCallback(
        (zoomLevel, buttonEl = null) => {
            if (zoomStateRef.current.isActive) {
                exitZoomMode();
                return;
            }

            const newGap = calculateGapForZoom(zoomLevel);
            const oldZoom = stateRef.current.currentZoom;
            soundManager.play(zoomLevel < oldZoom ? 'zoom-out' : 'zoom-in');

            localDispatch({ type: 'SET_ZOOM', zoom: zoomLevel, gap: newGap });
            setZoomStore(zoomLevel);
            animateZoomTransition(zoomLevel, newGap);
            if (percentageRef.current)
                percentageRef.current.textContent = `${Math.round(zoomLevel * 100)}%`;
            updateZoomButtons(buttonEl, zoomLevel);
        },
        [animateZoomTransition, setZoomStore, updateZoomButtons, exitZoomMode]
    );

    const autoFitZoom = useCallback(
        (buttonEl = null) => {
            if (zoomStateRef.current.isActive) {
                exitZoomMode();
                return;
            }

            const fitZoom = calculateFitZoom();
            const newGap = calculateGapForZoom(fitZoom);
            const oldZoom = stateRef.current.currentZoom;
            soundManager.play(fitZoom < oldZoom ? 'zoom-out' : 'zoom-in');

            localDispatch({ type: 'SET_ZOOM', zoom: fitZoom, gap: newGap });
            setZoomStore(fitZoom);
            animateZoomTransition(fitZoom, newGap, 1.0);
            if (percentageRef.current)
                percentageRef.current.textContent = `${Math.round(fitZoom * 100)}%`;
            updateZoomButtons(buttonEl, null);
        },
        [animateZoomTransition, setZoomStore, updateZoomButtons, exitZoomMode]
    );

    const resetPosition = useCallback(() => {
        if (zoomStateRef.current.isActive) {
            exitZoomMode();
            return;
        }
        const { currentZoom, currentGap } = stateRef.current;
        const dims = calculateGridDimensions(currentZoom, currentGap);
        const x = (window.innerWidth - dims.scaledWidth) / 2;
        const y = (window.innerHeight - dims.scaledHeight) / 2;
        gsap.to(canvasWrapperRef.current, {
            duration: 1.0,
            x,
            y,
            ease: centerEase,
            onComplete: () => {
                lastValidPosRef.current = { x, y };
                initDraggable(currentZoom, currentGap);
            },
        });
    }, [initDraggable, exitZoomMode]);

    const enterZoomMode = useCallback(
        (index) => {
            if (zoomStateRef.current.isActive) return;

            zoomStateRef.current.isActive = true;
            zoomStateRef.current.selectedIndex = index;

            openImageStore(index);
            localDispatch({ type: 'OPEN_IMAGE', index });
            soundManager.play('open');

            draggableRef.current?.disable();
            document.body.classList.add('zoom-mode');

            const splitEl = splitScreenRef.current;
            const wrapperEl = itemRefs.current[index]?.wrapper;
            const imgEl = itemRefs.current[index]?.img;
            const sourceImg = imgEl || wrapperEl?.querySelector('img');
            if (!sourceImg || !wrapperEl) return;

            const overlay = document.createElement('div');
            overlay.className = 'scaling-image-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            const clonedImg = document.createElement('img');
            clonedImg.src = sourceImg.src || sourceImg.currentSrc;
            clonedImg.alt = sourceImg.alt;
            overlay.appendChild(clonedImg);
            document.body.appendChild(overlay);

            const rect = sourceImg.getBoundingClientRect();
            gsap.set(overlay, {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                opacity: 1,
            });
            zoomStateRef.current.scalingOverlay = overlay;
            gsap.set(sourceImg, { opacity: 0 });

            splitEl.removeAttribute('aria-hidden');
            splitEl.classList.add('active');
            gsap.to(splitEl, { opacity: 1, duration: 1.2, ease: customEase });

            const flip = Flip.fit(overlay, zoomTargetRef.current, {
                duration: 1.2,
                ease: customEase,
                absolute: true,
                onComplete: () => {
                    const data = GRID_ITEMS[index].imageData;
                    if (slideNumberRef.current)
                        slideNumberRef.current.textContent = data.number;
                    if (slideTitleRef.current)
                        slideTitleRef.current.textContent = data.title;
                    if (slideDescRef.current) {
                        descriptionLinesRef.current = splitTextIntoLines(
                            slideDescRef.current,
                            data.description
                        );
                    }

                    gsap.set(slideNumberRef.current, { y: 20, opacity: 0 });
                    gsap.set(slideTitleRef.current, { y: 60, opacity: 0 });
                    gsap.set(descriptionLinesRef.current, {
                        y: 80,
                        opacity: 0,
                    });

                    imageTitleOverlayRef.current?.classList.add('active');
                    gsap.to(imageTitleOverlayRef.current, {
                        opacity: 1,
                        duration: 0.3,
                        ease: 'power2.out',
                    });
                    gsap.to(slideNumberRef.current, {
                        duration: 0.8,
                        y: 0,
                        opacity: 1,
                        ease: customEase,
                        delay: 0.1,
                    });
                    gsap.to(slideTitleRef.current, {
                        duration: 0.8,
                        y: 0,
                        opacity: 1,
                        ease: customEase,
                        delay: 0.15,
                    });
                    gsap.to(descriptionLinesRef.current, {
                        duration: 0.8,
                        y: 0,
                        opacity: 1,
                        ease: customEase,
                        delay: 0.2,
                        stagger: 0.15,
                        onComplete: () => {
                            trapFocus(splitEl);
                            if (clonedImg && data.fullResUrl) {
                                clonedImg.src = data.fullResUrl;
                            }
                        },
                    });
                },
            });
            zoomStateRef.current.flipAnimation = flip;

            controlsRef.current?.classList.add('split-mode');

            if (window.innerWidth < 768) {
                gsap.to(controlsRef.current, {
                    y: 120,
                    duration: 0.5,
                    ease: 'power3.in',
                });
            }

            gsap.fromTo(
                closeButtonRef.current,
                { x: 40, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: 'power2.out',
                    delay: 0.9,
                }
            );
            closeButtonRef.current?.classList.add('active');
            closeButtonRef.current?.removeAttribute('aria-hidden');

            const keyHandler = (e) => {
                if (e.key === 'Escape') exitZoomMode();
            };
            zoomStateRef.current._keyHandler = keyHandler;
            document.addEventListener('keydown', keyHandler);
        },
        [openImageStore, exitZoomMode, trapFocus, GRID_ITEMS]
    );

    const showControls = useCallback(() => {
        const container = controlsRef.current;
        if (!container) return;
        const percentageEl = container.querySelector('.percentage-indicator');
        const switchEl = container.querySelector('.switch');
        const soundToggle = container.querySelector('.sound-toggle');

        gsap.set(container, { opacity: 0 });
        gsap.set(percentageEl, { x: '-3em' });
        gsap.set(switchEl, { y: '2em' });
        gsap.set(soundToggle, { x: '3em' });

        const tl = gsap.timeline();
        tl.to(container, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0);
        tl.to(percentageEl, { x: 0, duration: 0.2, ease: 'power2.out' }, 0.25);
        tl.to(switchEl, { y: 0, duration: 0.2, ease: 'power2.out' }, 0.3);
        tl.to(soundToggle, { x: 0, duration: 0.2, ease: 'power2.out' }, 0.35);
        container.classList.add('visible');
    }, []);

    const playIntroAnimation = useCallback(() => {
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        if (reducedMotion) {
            GRID_ITEMS.forEach((item, i) => {
                const el = itemRefs.current[i]?.wrapper;
                if (el)
                    gsap.set(el, {
                        left: item.baseX,
                        top: item.baseY,
                        scale: 1,
                        opacity: 1,
                    });
            });
            showControls();
            return;
        }

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const matrix = new DOMMatrix(
            getComputedStyle(canvasWrapperRef.current).transform
        );
        const centerX =
            (vw / 2 - matrix.m41) / matrix.a - GRID_CONFIG.itemSize / 2;
        const centerY =
            (vh / 2 - matrix.m42) / matrix.a - GRID_CONFIG.itemSize / 2;

        const els = GRID_ITEMS.map(
            (_, i) => itemRefs.current[i]?.wrapper
        ).filter(Boolean);

        els.forEach((el, i) => {
            gsap.set(el, {
                left: centerX,
                top: centerY,
                scale: 0.8,
                zIndex: els.length - i,
                opacity: 0,
            });
        });

        gsap.to(els, {
            duration: 0.3,
            left: (i) => GRID_ITEMS[i].baseX,
            top: (i) => GRID_ITEMS[i].baseY,
            scale: 1,
            opacity: 1,
            ease: 'power2.out',
            stagger: {
                amount: 2.0,
                from: 'start',
                grid: [GRID_CONFIG.rows, GRID_CONFIG.cols],
                ease: 'power1.in',
            },
            onComplete: () => {
                els.forEach((el) => {
                    gsap.set(el, { zIndex: 1 });
                });
                showControls();
            },
        });
    }, [showControls, GRID_ITEMS]);

    const setupViewportObserver = useCallback(() => {
        observerRef.current?.disconnect();
        quickOpacityMap.current.clear();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const idx = zoomStateRef.current.selectedIndex;
                    if (
                        idx !== null &&
                        entry.target === itemRefs.current[idx]?.wrapper
                    )
                        return;

                    const setter = quickOpacityMap.current.get(entry.target);
                    if (setter) {
                        setter(entry.isIntersecting ? 1 : 0.1);
                    }

                    if (entry.isIntersecting) {
                        entry.target.classList.remove('out-of-view');
                    } else {
                        entry.target.classList.add('out-of-view');
                    }
                });
            },
            { root: null, threshold: 0.15, rootMargin: '10%' }
        );

        GRID_ITEMS.forEach((_, i) => {
            const el = itemRefs.current[i]?.wrapper;
            if (el) {
                quickOpacityMap.current.set(
                    el,
                    gsap.quickTo(el, 'opacity', {
                        duration: 0.5,
                        ease: 'power2.out',
                    })
                );
                observerRef.current.observe(el);
            }
        });
    }, [GRID_ITEMS]);

    useEffect(() => {
        const wrapper = canvasWrapperRef.current;
        const viewport = viewportRef.current;
        if (!wrapper || !viewport) return;

        const { currentZoom, currentGap } = stateRef.current;
        const dims = calculateGridDimensions(currentZoom, currentGap);
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const startX = (vw - dims.scaledWidth) / 2;
        const startY = (vh - dims.scaledHeight) / 2;

        wrapper.style.width = `${dims.width}px`;
        wrapper.style.height = `${dims.height}px`;

        gsap.set(viewport, { opacity: 0 });
        gsap.set(wrapper, { scale: currentZoom, x: startX, y: startY });
        lastValidPosRef.current = { x: startX, y: startY };

        if (percentageRef.current)
            percentageRef.current.textContent = `${Math.round(currentZoom * 100)}%`;

        splitScreenRef.current?.setAttribute('aria-hidden', 'true');
        closeButtonRef.current?.setAttribute('aria-hidden', 'true');

        GRID_ITEMS.forEach((item, i) => {
            const el = itemRefs.current[i]?.wrapper;
            if (el) {
                el.style.left = `${item.baseX}px`;
                el.style.top = `${item.baseY}px`;
            }
        });

        initSoundWave();

        const startGallery = () => {
            playIntroAnimation();
            setTimeout(() => {
                initDraggable(currentZoom, currentGap);
                setupViewportObserver();
            }, 1500);
        };

        gsap.to(viewport, {
            duration: 0.6,
            opacity: 1,
            ease: 'power2.inOut',
            onComplete: () => {
                if (isInitialLoad) {
                    const onPreloaderDone = () => {
                        window.removeEventListener(
                            'preloader:complete',
                            onPreloaderDone
                        );
                        clearTimeout(failsafeTimerRef.current);

                        const checkImages = () => {
                            if (loadedCountRef.current >= 24) {
                                gsap.delayedCall(0.15, startGallery);
                            } else {
                                setTimeout(checkImages, 100);
                            }
                        };
                        checkImages();
                    };

                    preloaderListenerRef.current = onPreloaderDone;
                    window.addEventListener(
                        'preloader:complete',
                        onPreloaderDone
                    );

                    failsafeTimerRef.current = setTimeout(() => {
                        window.removeEventListener(
                            'preloader:complete',
                            onPreloaderDone
                        );
                        startGallery();
                    }, 15000);
                } else {
                    startGallery();
                }
            },
        });

        const zs = zoomStateRef.current;
        const items = itemRefs.current;
        const opacityMap = quickOpacityMap.current;
        const splitEl = splitScreenRef.current;

        return () => {
            if (preloaderListenerRef.current) {
                window.removeEventListener(
                    'preloader:complete',
                    preloaderListenerRef.current
                );
                preloaderListenerRef.current = null;
            }
            clearTimeout(failsafeTimerRef.current);
            cancelAnimationFrame(soundWaveRafRef.current);
            clearTimeout(resizeTimerRef.current);
            gsap.killTweensOf(wrapper);
            GRID_ITEMS.forEach((_, i) => {
                const el = items[i]?.wrapper;
                if (el) gsap.killTweensOf(el);
            });
            opacityMap.clear();
            observerRef.current?.disconnect();
            draggableRef.current?.kill();
            zs.scalingOverlay?.remove();

            // Fix memory leak: Release focus trap before unmounting
            if (splitEl) {
                releaseFocusTrap(splitEl);
            }

            document.body.classList.remove('dragging', 'zoom-mode');
        };
    }, [
        GRID_ITEMS,
        initDraggable,
        initSoundWave,
        playIntroAnimation,
        setupViewportObserver,
        releaseFocusTrap,
    ]);

    useEffect(() => {
        const handleResize = () => {
            clearTimeout(resizeTimerRef.current);
            resizeTimerRef.current = setTimeout(() => {
                resetPosition();
                const { currentZoom, currentGap } = stateRef.current;
                initDraggable(currentZoom, currentGap);
            }, 150);
        };

        const handleMouseLeave = () => {
            if (!document.body.classList.contains('dragging')) return;
            document.body.classList.remove('dragging');
            gsap.to(canvasWrapperRef.current, {
                duration: 0.6,
                x: lastValidPosRef.current.x,
                y: lastValidPosRef.current.y,
                ease: 'power2.out',
            });
            draggableRef.current?.endDrag();
        };

        const handleKeydown = (e) => {
            if (zoomStateRef.current.isActive) return;
            const actions = {
                1: () => setZoom(0.3),
                2: () => setZoom(0.6),
                3: () => setZoom(1.0),
                f: () => autoFitZoom(),
                F: () => autoFitZoom(),
            };
            actions[e.key]?.();
        };

        const vRef = viewportRef.current;
        window.addEventListener('resize', handleResize);
        document.addEventListener('mouseleave', handleMouseLeave);
        vRef?.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mouseleave', handleMouseLeave);
            vRef?.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('keydown', handleKeydown);
        };
    }, [setZoom, autoFitZoom, resetPosition, initDraggable]);

    const handleZoomButtonClick = useCallback(
        (e) => {
            const btn = e.currentTarget;
            const zoom = btn.getAttribute('data-zoom');
            zoom === 'fit' ? autoFitZoom(btn) : setZoom(parseFloat(zoom), btn);
        },
        [setZoom, autoFitZoom]
    );

    const handleSoundToggle = useCallback(() => {
        toggleSoundStore();
        const newEnabled = !soundManager.enabled;
        soundToggleRef.current?.classList.toggle('active', newEnabled);
    }, [toggleSoundStore]);

    return (
        <>
            {loadedCount < 24 && (
                <div
                    className="gallery-loader fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-500"
                    style={{ opacity: 1 }}
                >
                    <div className="mb-8 relative">
                        <div className="text-white font-display text-6xl md:text-8xl flex items-baseline gap-2">
                            <span>
                                {Math.round(
                                    (loadedCountRef.current /
                                        GRID_ITEMS.length) *
                                        100
                                )}
                            </span>
                            <span className="text-[0.4em] opacity-40">%</span>
                        </div>
                    </div>

                    <div className="w-48 h-px bg-white/10 relative overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-[#ff6e14] transition-all duration-300 ease-out"
                            style={{
                                width: `${(loadedCountRef.current / GRID_ITEMS.length) * 100}%`,
                            }}
                        />
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-2">
                        <div className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
                            Synchronizing Assets
                        </div>
                        <div className="text-white/20 font-mono text-[9px] uppercase tracking-widest">
                            {loadedCount} / {GRID_ITEMS.length} Images Verified
                        </div>
                    </div>

                    {loadedCount > 12 && (
                        <button
                            onClick={() => setLoadedCount(GRID_ITEMS.length)}
                            className="mt-12 px-6 py-2 border border-white/10 text-white/40 font-mono text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                        >
                            Skip Visual Optimization
                        </button>
                    )}
                </div>
            )}

            {/* Viewport */}
            <div
                className="viewport fixed top-0 left-0 w-screen h-screen overflow-hidden z-1 opacity-0"
                ref={viewportRef}
                aria-label="Photography gallery — drag to explore"
            >
                <div
                    className="canvas-wrapper absolute top-0 left-0 origin-top-left isolate"
                    ref={canvasWrapperRef}
                >
                    <div
                        className="grid-container relative w-full h-full"
                        ref={gridContainerRef}
                        role="grid"
                        aria-label="Photography grid"
                    >
                        {GRID_ITEMS.map((item, i) => (
                            <div
                                key={i}
                                ref={(el) => {
                                    if (!itemRefs.current[i])
                                        itemRefs.current[i] = {};
                                    itemRefs.current[i].wrapper = el;
                                }}
                                className="grid-item"
                                role="button"
                                tabIndex={0}
                                aria-label={`View image ${i + 1}: ${item.imageData.title}`}
                                style={{
                                    position: 'absolute',
                                    left: item.baseX,
                                    top: item.baseY,
                                    opacity: 0,
                                }}
                                onClick={() => {
                                    if (!zoomStateRef.current.isActive)
                                        enterZoomMode(i);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        if (!zoomStateRef.current.isActive)
                                            enterZoomMode(i);
                                    }
                                }}
                            >
                                <Image
                                    ref={(el) => {
                                        if (!itemRefs.current[i])
                                            itemRefs.current[i] = {};
                                        itemRefs.current[i].img = el;
                                    }}
                                    src={item.thumbnailUrl}
                                    placeholder={item.lqip ? 'blur' : 'empty'}
                                    blurDataURL={item.lqip || undefined}
                                    alt={item.imageData.title}
                                    fill
                                    sizes="(max-width: 768px) 160px, 320px"
                                    quality={65}
                                    loading={i < 12 ? 'eager' : 'lazy'}
                                    priority={i < 6}
                                    onLoad={handleImageLoad}
                                    onError={handleImageLoad}
                                    style={{
                                        objectFit: 'cover',
                                        userSelect: 'none',
                                        pointerEvents: 'none',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Split screen detail view */}
            <div
                className="split-screen-container fixed inset-0 flex opacity-0 pointer-events-none"
                style={{ zIndex: 'var(--z-split)' }}
                ref={splitScreenRef}
                aria-modal="true"
                role="dialog"
                aria-label="Image detail view"
                aria-hidden="true"
            >
                <div
                    className="split-left relative w-[50vw] h-screen bg-black/60 flex justify-center items-center z-1 cursor-pointer"
                    ref={splitLeftRef}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) exitZoomMode();
                    }}
                >
                    <div
                        className="zoom-target w-full h-full relative flex items-center justify-center z-1"
                        ref={zoomTargetRef}
                    />
                </div>
                <div
                    className="split-right relative w-[50vw] h-screen bg-black/60 flex justify-center items-center z-1 cursor-pointer"
                    ref={splitRightRef}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) exitZoomMode();
                    }}
                />
            </div>

            {/* Image title overlay */}
            <div
                className="image-title-overlay absolute bottom-10 left-10 text-white opacity-0 pointer-events-none"
                style={{ zIndex: 'var(--z-title)' }}
                ref={imageTitleOverlayRef}
                aria-live="polite"
            >
                <div className="image-slide-number relative w-100 h-5 mb-2 overflow-hidden [clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%)]">
                    <span
                        ref={slideNumberRef}
                        className="absolute top-0 left-0 text-white font-display text-[12px] font-normal leading-normal uppercase tracking-widest"
                    >
                        01
                    </span>
                </div>
                <div className="image-slide-title relative w-100 h-15 mb-4 overflow-hidden [clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%)]">
                    <h1
                        ref={slideTitleRef}
                        className="absolute top-0 left-0 text-white font-body text-[48px] font-medium tracking-[-0.02em] leading-[1.2] m-0 p-0"
                    >
                        Portrait
                    </h1>
                </div>
                <div
                    className="image-slide-description relative w-100 min-h-20 overflow-hidden [clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%)]"
                    ref={slideDescRef}
                />
            </div>

            {/* Controls dock */}
            <div
                className="controls-container fixed bottom-5 left-1/2 -translate-x-1/2 flex opacity-0"
                style={{
                    transition: 'left 1.2s cubic-bezier(0.87,0,0.13,1)',
                    zIndex: 'var(--z-controls)',
                }}
                ref={controlsRef}
                role="toolbar"
                aria-label="Gallery controls"
            >
                <div
                    className="percentage-indicator bg-[#ff6e14] px-3 md:px-5 py-[0.625em] rounded-[0.25em] flex items-center justify-center font-display text-[0.85em] font-normal uppercase text-rt-cream min-w-[3em] md:min-w-[5em] whitespace-nowrap"
                    ref={percentageRef}
                    aria-live="polite"
                    aria-label="Current zoom level"
                >
                    60%
                </div>

                <div
                    className="switch flex gap-0.5 md:gap-5 bg-[#222] px-3 md:px-5 py-[0.625em] rounded-[0.25em]"
                    role="group"
                    aria-label="Zoom level"
                >
                    {[
                        { zoom: '0.3', label: 'Zoom out', text: 'ZOOM OUT' },
                        {
                            zoom: '0.6',
                            label: 'Normal zoom',
                            text: 'NORMAL',
                            current: true,
                        },
                        { zoom: '1.0', label: 'Zoom in', text: 'ZOOM IN' },
                        {
                            zoom: 'fit',
                            label: 'Fit all images in view',
                            text: 'FIT',
                        },
                    ].map(({ zoom, label, text, current }) => (
                        <button
                            key={zoom}
                            className={`switch-button bg-none border-none cursor-pointer font-display text-[0.75em] md:text-[0.85em] font-normal uppercase px-2.5 py-1.5 relative text-[#666] whitespace-nowrap${current ? ' switch-button-current' : ''}`}
                            data-zoom={zoom}
                            type="button"
                            aria-label={label}
                            aria-pressed={current ? 'true' : undefined}
                            onClick={handleZoomButtonClick}
                        >
                            <span
                                className="indicator-dot absolute w-1.25 h-1.25 bg-[#ff6e14] rounded-full opacity-0 top-1/2 -translate-y-1/2 -left-1 md:-left-2 transition-opacity duration-300"
                                aria-hidden="true"
                            />
                            {text}
                        </button>
                    ))}
                </div>

                <button
                    className="sound-toggle bg-[#f0f0f0] px-3 py-2 rounded-[0.25em] flex items-center justify-center cursor-pointer min-w-[3.75em] relative border-none"
                    ref={soundToggleRef}
                    type="button"
                    aria-label="Toggle sound"
                    onClick={handleSoundToggle}
                >
                    <canvas
                        ref={soundWaveCanvasRef}
                        className="sound-wave-canvas w-8 h-4 block"
                        width="32"
                        height="16"
                        aria-hidden="true"
                    />
                </button>
            </div>
        </>
    );
}
