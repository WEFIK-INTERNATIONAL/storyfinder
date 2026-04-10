'use client';

import './AboutRetouch.css';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useViewTransition } from '@/hooks/useViewTransition';
import { usePathname } from 'next/navigation';
import Copy from '@/components/ui/copy/Copy';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function AboutRetouch() {
    const sectionRef = useRef(null);
    const compareRef = useRef(null);
    const dragging = useRef(false);

    const pathname = usePathname();
    const { navigateWithTransition } = useViewTransition();

    useGSAP(
        () => {
            gsap.from('.rt-header-rule', {
                scaleX: 0,
                transformOrigin: 'left',
                duration: 1.5,
                ease: 'expo.inOut',
                scrollTrigger: {
                    trigger: '.rt-intro',
                    start: 'top 90%',
                    once: true,
                },
            });
            gsap.from('.rt-index, .rt-tag', {
                y: 15,
                opacity: 0,
                stagger: 0.1,
                duration: 1,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: '.rt-intro',
                    start: 'top 90%',
                    once: true,
                },
            });

            gsap.from('.rt-title-line', {
                yPercent: 120,
                skewY: 5,
                stagger: 0.2,
                duration: 1.6,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: '.rt-title',
                    start: 'top 85%',
                    once: true,
                },
            });

            gsap.from('.rt-compare-wrap', {
                opacity: 0,
                scale: 0.98,
                clipPath: 'inset(10% 0% 10% 0%)',
                duration: 1.8,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: '.rt-immersive',
                    start: 'top 80%',
                    once: true,
                },
            });

            gsap.from('.rt-cta-wrap', {
                y: 20,
                opacity: 0,
                duration: 1.2,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: '.rt-cta-wrap',
                    start: 'top 95%',
                    once: true,
                },
            });

            gsap.from('.rt-stat', {
                y: 50,
                opacity: 0,
                stagger: 0.2,
                duration: 1.4,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: '.rt-stats',
                    start: 'top 95%',
                    once: true,
                },
            });

            const moveGlow = (e) => {
                const { clientX, clientY } = e;
                gsap.to('.rt-glow', {
                    x: (clientX / window.innerWidth - 0.5) * 50,
                    y: (clientY / window.innerHeight - 0.5) * 50,
                    duration: 3,
                    ease: 'power2.out',
                });
            };
            window.addEventListener('mousemove', moveGlow);
            return () => window.removeEventListener('mousemove', moveGlow);
        },
        { scope: sectionRef }
    );

    const setSplit = useCallback((clientX) => {
        const el = compareRef.current;
        if (!el) return;
        const { left, width } = el.getBoundingClientRect();
        const pct = Math.min(94, Math.max(6, ((clientX - left) / width) * 100));
        el.style.setProperty('--split', `${pct}%`);
        el.classList.add('rt--touched');
    }, []);

    const onMouseDown = useCallback(
        (e) => {
            dragging.current = true;
            compareRef.current?.classList.add('rt--drag');
            setSplit(e.clientX);
            const onMove = (e) => {
                if (dragging.current) setSplit(e.clientX);
            };
            const onUp = () => {
                dragging.current = false;
                compareRef.current?.classList.remove('rt--drag');
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        },
        [setSplit]
    );

    const onTouchStart = useCallback(
        (e) => {
            dragging.current = true;
            setSplit(e.touches[0].clientX);
        },
        [setSplit]
    );
    const onTouchMove = useCallback(
        (e) => {
            if (!dragging.current) return;
            e.preventDefault();
            setSplit(e.touches[0].clientX);
        },
        [setSplit]
    );
    const onTouchEnd = useCallback(() => {
        dragging.current = false;
    }, []);

    return (
        <section className="rt" ref={sectionRef}>
            <div className="rt-glow" aria-hidden="true" />

            <div className="rt-intro">
                <div className="rt-intro-band">
                    <span className="rt-index">05 — RETOUCH</span>
                    <div className="rt-tags">
                        <span className="rt-tag">EDITS</span>
                        <span className="rt-tag">COLOUR</span>
                        <span className="rt-tag">CRAFT</span>
                    </div>
                </div>
                <div className="rt-header-rule" />
            </div>

            <div className="rt-immersive">
                <div className="rt-immersive-slider">
                    <div
                        ref={compareRef}
                        className="rt-compare-wrap"
                        onMouseDown={onMouseDown}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <div className="rt-drag-label" aria-hidden="true">
                            [DRAG]
                        </div>

                        <div className="rt-after">
                            <Image
                                src="/stock/aboutretouch_after.jpg"
                                alt="After retouch"
                                fill
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                draggable={false}
                                style={{
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                }}
                            />
                        </div>

                        <div className="rt-before">
                            <div className="rt-before-img">
                                <Image
                                    src="/stock/aboutretouch_before.jpg"
                                    alt="Before retouch"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 60vw"
                                    priority
                                    draggable={false}
                                    style={{
                                        objectFit: 'cover',
                                        objectPosition: 'center',
                                    }}
                                />
                            </div>
                        </div>

                        <div className="rt-slider-grain" aria-hidden="true" />

                        <div className="rt-handle" aria-hidden="true">
                            <div className="rt-knob">
                                <span className="rt-knob-dot" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rt-immersive-content">
                    <h2 className="rt-title">
                        <span className="rt-title-line rt-title-outline">
                            Cinematic
                        </span>
                        <span className="rt-title-line rt-title-filled">
                            Retouching<em>.</em>
                        </span>
                    </h2>

                    <Copy animateOnScroll={true}>
                        <p className="rt-subtitle">
                            Light sculpted. Skin respected.{' '}
                            <em>Colour decided</em> — not discovered. Every
                            frame receives a bespoke post-production workflow.
                        </p>
                    </Copy>

                    <div className="rt-cta-wrap">
                        <Link
                            href="/before-after"
                            className="rt-cta-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                if (pathname === '/before-after') return;
                                navigateWithTransition('/before-after');
                            }}
                        >
                            <span>VIEW RETOUCH</span>
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                            >
                                <path
                                    d="M2 7h10M7 2l5 5-5 5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Link>
                    </div>

                    <div className="rt-stats">
                        <div className="rt-stat">
                            <span className="rt-stat-num">340+</span>
                            <span className="rt-stat-label">Sessions</span>
                        </div>
                        <div className="rt-stat">
                            <span className="rt-stat-num">06</span>
                            <span className="rt-stat-label">Years</span>
                        </div>
                        <div className="rt-stat">
                            <span className="rt-stat-num">RAW</span>
                            <span className="rt-stat-label">Delivery</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
