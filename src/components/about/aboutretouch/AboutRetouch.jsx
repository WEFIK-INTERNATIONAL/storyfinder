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

gsap.registerPlugin(useGSAP, ScrollTrigger);

const PROCESS_STEPS = [
    { num: '01', label: 'RAW Import & Calibration' },
    { num: '02', label: 'Frequency Separation' },
    { num: '03', label: 'Dodge & Burn Sculpting' },
    { num: '04', label: 'Colour Grading' },
    { num: '05', label: 'Final Polish & Export' },
];

export default function AboutRetouch() {
    const sectionRef = useRef(null);
    const compareRef = useRef(null);
    const dragging   = useRef(false);

    const pathname = usePathname();
    const { navigateWithTransition } = useViewTransition();

    /* ─────────────────────────────────────────
       GSAP SCROLL ANIMATIONS
    ───────────────────────────────────────── */
    useGSAP(() => {

        /* 1. Band slides down */
        gsap.from('.rt-band', {
            y: -24, opacity: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
        });

        /* 2. Title — each line clips up */
        gsap.from('.rt-title-ghost', {
            yPercent: 120, duration: 1.1, ease: 'power4.out',
            scrollTrigger: { trigger: '.rt-title', start: 'top 88%', once: true },
        });
        gsap.from('.rt-title-solid', {
            yPercent: 120, duration: 1.1, delay: 0.14, ease: 'power4.out',
            scrollTrigger: { trigger: '.rt-title', start: 'top 88%', once: true },
        });

        /* 3. Orange divider draws */
        gsap.from('.rt-divider', {
            scaleX: 0, transformOrigin: 'center', duration: 0.9, ease: 'expo.out',
            scrollTrigger: { trigger: '.rt-divider', start: 'top 90%', once: true },
        });

        /* 4. Subtitle fades */
        gsap.from('.rt-subtitle', {
            y: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: '.rt-subtitle', start: 'top 90%', once: true },
        });

        /* 5. Slider wipes in */
        gsap.fromTo('.rt-compare-wrap',
            { clipPath: 'inset(0 100% 0 0)' },
            {
                clipPath: 'inset(0 0% 0 0)', duration: 1.3, ease: 'expo.inOut',
                scrollTrigger: { trigger: '.rt-feature', start: 'top 80%', once: true },
            }
        );

        /* 6. Process card slides up */
        gsap.from('.rt-process', {
            y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: '.rt-feature', start: 'top 78%', once: true },
        });

        /* 7. Process steps stagger in */
        gsap.from('.rt-step', {
            x: 20, opacity: 0, stagger: 0.1,
            duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: '.rt-steps', start: 'top 90%', once: true },
        });

        /* 8. CTA slides up */
        gsap.from('.rt-cta', {
            y: 20, opacity: 0, duration: 0.65, ease: 'power3.out',
            scrollTrigger: { trigger: '.rt-cta', start: 'top 94%', once: true },
        });

        /* 9. Stats slide up */
        gsap.from('.rt-stat', {
            y: 30, opacity: 0, stagger: 0.1, duration: 0.75, ease: 'power3.out',
            scrollTrigger: { trigger: '.rt-stats-row', start: 'top 92%', once: true },
        });

    }, { scope: sectionRef });

    /* ─────────────────────────────────────────
       DRAG SLIDER
    ───────────────────────────────────────── */
    const setSplit = useCallback((clientX) => {
        const el = compareRef.current;
        if (!el) return;
        const { left, width } = el.getBoundingClientRect();
        const pct = Math.min(94, Math.max(6, ((clientX - left) / width) * 100));
        el.style.setProperty('--split', `${pct}%`);
        el.classList.add('rt--touched');
    }, []);

    const onMouseDown = useCallback((e) => {
        dragging.current = true;
        compareRef.current?.classList.add('rt--drag');
        setSplit(e.clientX);
        const onMove = (e) => { if (dragging.current) setSplit(e.clientX); };
        const onUp   = () => {
            dragging.current = false;
            compareRef.current?.classList.remove('rt--drag');
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [setSplit]);

    const onTouchStart = useCallback((e) => { dragging.current = true; setSplit(e.touches[0].clientX); }, [setSplit]);
    const onTouchMove  = useCallback((e) => { if (!dragging.current) return; e.preventDefault(); setSplit(e.touches[0].clientX); }, [setSplit]);
    const onTouchEnd   = useCallback(() => { dragging.current = false; }, []);

    return (
        <section className="rt" ref={sectionRef}>

            {/* ── BACKGROUND GLOW ── */}
            <div className="rt-glow" aria-hidden="true" />

            {/* ── BAND ── */}
            <div className="rt-band">
                <span className="rt-index">
                    05 — Retouch
                    <span className="rt-diamond" aria-hidden="true">
                        <svg viewBox="0 0 12 12" fill="none">
                            <rect x="6" y="0" width="5.5" height="5.5" rx=".8" transform="rotate(45 6 0)" stroke="rgba(227,227,219,.18)" strokeWidth="1" fill="none" />
                        </svg>
                    </span>
                </span>
                <span className="rt-eyebrow">Before &amp; After</span>
            </div>

            {/* ── HERO TEXT — centered ── */}
            <div className="rt-hero">
                <h2 className="rt-title">
                    <span className="rt-title-line"><span className="rt-title-ghost">The</span></span>
                    <span className="rt-title-line"><span className="rt-title-solid">Edit.</span></span>
                </h2>

                <div className="rt-divider" />

                <p className="rt-subtitle">
                    Light sculpted. Skin respected. <em>Colour decided</em> —
                    not discovered. Every frame receives a bespoke post-production
                    workflow, never a preset.
                </p>
            </div>

            {/* ── FEATURE — two-column: slider + process card ── */}
            <div className="rt-feature">

                {/* LEFT — Slider */}
                <div className="rt-slider-col">
                    <div
                        ref={compareRef}
                        className="rt-compare-wrap"
                        onMouseDown={onMouseDown}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {/* Hint */}
                        <div className="rt-hint" aria-hidden="true">
                            <svg width="14" height="8" viewBox="0 0 16 9" fill="none">
                                <path d="M0 4.5h16M4 1L0 4.5 4 8M12 1l4 3.5L12 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Drag
                        </div>

                        {/* AFTER — base */}
                        <div className="rt-after">
                            <Image
                                src="/spotlight/spotlight-1.jpg"
                                alt="After retouch"
                                fill
                                sizes="(max-width: 600px) 100vw, (max-width: 1000px) 100vw, 60vw"
                                draggable={false}
                                style={{ objectFit: 'cover', objectPosition: 'center' }}
                            />
                            <span className="rt-chip rt-chip--after">After</span>
                        </div>

                        {/* BEFORE — clipped */}
                        <div className="rt-before">
                            <div className="rt-before-img">
                                <Image
                                    src="/spotlight/spotlight-2.jpg"
                                    alt="Before retouch"
                                    fill
                                    sizes="(max-width: 600px) 100vw, (max-width: 1000px) 100vw, 60vw"
                                    priority
                                    draggable={false}
                                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                                />
                            </div>
                            <span className="rt-chip rt-chip--before">Before</span>
                        </div>

                        {/* Film grain overlay */}
                        <div className="rt-slider-grain" aria-hidden="true" />

                        {/* Divider line */}
                        <div className="rt-handle" aria-hidden="true">
                            <div className="rt-knob">
                                <svg width="18" height="10" viewBox="0 0 20 11" fill="none">
                                    <path d="M0 5.5h20M5 1L0 5.5 5 10M15 1l5 4.5L15 10" stroke="#141210" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT — Process card */}
                <div className="rt-process-col">
                    <div className="rt-process">
                        <div>
                            <div className="rt-process-header">Workflow</div>
                            <div className="rt-steps">
                                {PROCESS_STEPS.map((step) => (
                                    <div key={step.num} className="rt-step">
                                        <span className="rt-step-num">{step.num}</span>
                                        <span className="rt-step-label">{step.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link 
                            href="/before-after" 
                            className="rt-cta"
                            onClick={(e) => {
                                e.preventDefault();
                                if (pathname === '/before-after') return;
                                navigateWithTransition('/before-after');
                            }}
                        >
                            <span>View All Retouches</span>
                            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Link>
                    </div>
                </div>

            </div>

            {/* ── BOTTOM — stats ── */}
            <div className="rt-bottom">
                <div className="rt-stats-row">
                    <div className="rt-stat">
                        <span className="rt-stat-num">340+</span>
                        <span className="rt-stat-label">Sessions<br/>Retouched</span>
                    </div>
                    <div className="rt-stat">
                        <span className="rt-stat-num">6yr</span>
                        <span className="rt-stat-label">Post<br/>Experience</span>
                    </div>
                    <div className="rt-stat">
                        <span className="rt-stat-num">RAW</span>
                        <span className="rt-stat-label">Always<br/>Delivered</span>
                    </div>
                </div>
            </div>

        </section>
    );
}