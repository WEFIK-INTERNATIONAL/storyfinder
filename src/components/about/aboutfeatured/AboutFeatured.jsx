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

const FEATURED = [
    {
        id: 1,
        title: 'Camel Keeper Portrait',
        publication: 'Z News',
        caption: 'Cover Story · 2025',
        image: '/aboutnews/aboutnews_1.jpg',
        link: 'https://zeenews.india.com/gujarati/web-stories/india/which-is-the-largest-and-smallest-state-of-india-430962',
    },
    {
        id: 2,
        title: 'Weathered Quiet Gaze',
        publication: 'India Today',
        caption: 'Editorial · 2025',
        image: '/aboutnews/aboutnews_2.jpg',
        link: 'https://www.indiatoday.in/information/story/how-to-check-ladli-behna-yojana-status-registration-process-and-new-updates-stmp-2678139-2025-02-11',
    },
    {
        id: 3,
        title: 'Desert Folk Musician',
        publication: 'ABP NEWS',
        caption: 'Cover Story · 2025',
        image: '/aboutnews/aboutnews_3.jpg',
        link: 'https://www.abplive.com/web-stories/rajasthan/total-population-of-hindus-in-ajmer-in-rajasthan-states-2905556',
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
            <div className="af-header">
                <div className="af-intro-band">
                    <span className="af-index">06 — Featured</span>
                    <span className="af-label">As Seen In</span>
                </div>
                <div ref={ruleRef} className="af-rule" />
            </div>

            <div className="af-headline">
                <h2 ref={headlineRef} className="af-title">
                    In The <span className="af-title-ghost">Press</span>
                </h2>
                <p ref={subtitleRef} className="af-subtitle">
                    Selected photographs featured in leading publications and
                    news articles around the world.
                </p>
            </div>

            <div className="af-grid">
                {FEATURED.map((item, i) => (
                    <a
                        key={item.id}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
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

                            <span className="af-card-pub">
                                {item.publication}
                            </span>

                            <div className="af-card-info">
                                <span className="af-card-title">
                                    {item.title}
                                </span>
                                <span className="af-card-caption">
                                    {item.caption}
                                </span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

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
