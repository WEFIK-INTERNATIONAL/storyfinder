'use client';

import './AboutFeatured.css';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useViewTransition } from '@/hooks/useViewTransition';
import { usePathname } from 'next/navigation';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ── placeholder data — swap with real Sanity/CMS data later ── */
const FEATURED = [
    {
        id: 1,
        title: 'Golden Hour Portrait',
        publication: 'National Geographic',
        caption: 'Cover Story · Jan 2025',
        image: '/spotlight/spotlight-1.jpg',
    },
    {
        id: 2,
        title: 'Monsoon Whispers',
        publication: 'Vogue India',
        caption: 'Fashion Editorial · Mar 2025',
        image: '/spotlight/spotlight-5.jpg',
    },
    {
        id: 3,
        title: 'Silent Valley',
        publication: 'The Hindu',
        caption: 'Photo Essay · Jun 2025',
        image: '/spotlight/spotlight-9.jpg',
    },
];

const AboutFeatured = () => {
    const sectionRef = useRef(null);
    const cardsRef = useRef([]);
    const ruleRef = useRef(null);
    const headlineRef = useRef(null);
    const subtitleRef = useRef(null);
    const ctaRef = useRef(null);

    const pathname = usePathname();
    const { navigateWithTransition } = useViewTransition();

    useGSAP(
        () => {
            /* Animate the rule */
            if (ruleRef.current) {
                gsap.from(ruleRef.current, {
                    scaleX: 0,
                    transformOrigin: 'left',
                    duration: 1.4,
                    ease: 'expo.inOut',
                    scrollTrigger: {
                        trigger: ruleRef.current,
                        start: 'top 90%',
                    },
                });
            }

            /* Stagger cards in */
            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                gsap.from(card, {
                    y: 60,
                    opacity: 0,
                    duration: 0.9,
                    delay: i * 0.08,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: card, start: 'top 92%' },
                });
            });

            /* Headline slides up */
            if (headlineRef.current) {
                gsap.from(headlineRef.current, {
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: headlineRef.current,
                        start: 'top 90%',
                    },
                });
            }

            /* Subtitle fades in */
            if (subtitleRef.current) {
                gsap.from(subtitleRef.current, {
                    y: 30,
                    opacity: 0,
                    duration: 0.9,
                    delay: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: subtitleRef.current,
                        start: 'top 92%',
                    },
                });
            }

            /* CTA row slides up */
            if (ctaRef.current) {
                gsap.from(ctaRef.current, {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: ctaRef.current,
                        start: 'top 94%',
                    },
                });
            }
        },
        { scope: sectionRef }
    );

    return (
        <section ref={sectionRef} className="af">
            {/* ── HEADER ── */}
            <div className="af-header">
                <div className="af-intro-band">
                    <span className="af-index">06 — Featured</span>
                    <span className="af-label">As Seen In</span>
                </div>
                <div ref={ruleRef} className="af-rule" />
            </div>

            {/* ── HEADLINE ── */}
            <div className="af-headline">
                <h2 ref={headlineRef} className="af-title">
                    In The <span className="af-title-ghost">Press</span>
                </h2>
                <p ref={subtitleRef} className="af-subtitle">
                    Selected photographs featured in leading publications and
                    news articles around the world.
                </p>
            </div>

            {/* ── CARD GRID ── */}
            <div className="af-grid">
                {FEATURED.map((item, i) => (
                    <div
                        key={item.id}
                        ref={(el) => (cardsRef.current[i] = el)}
                        className="af-card"
                    >
                        <div className="af-card-img">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="(max-width: 600px) 100vw, (max-width: 1023px) 50vw, 33vw"
                            />
                            <div className="af-card-grain" />
                            <div className="af-card-overlay" />

                            {/* Publication badge */}
                            <span className="af-card-pub">
                                {item.publication}
                            </span>

                            {/* Bottom info */}
                            <div className="af-card-info">
                                <span className="af-card-title">
                                    {item.title}
                                </span>
                                <span className="af-card-caption">
                                    {item.caption}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── CTA ── */}
            <div ref={ctaRef} className="af-cta-row">
                <span className="af-cta-note">More features coming soon</span>
                <Link
                    href="/featured"
                    className="af-cta-btn"
                    onClick={(e) => {
                        e.preventDefault();
                        if (pathname === '/featured') return;
                        navigateWithTransition('/featured');
                    }}
                >
                    <span>View All Features</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
        </section>
    );
};

export default AboutFeatured;
