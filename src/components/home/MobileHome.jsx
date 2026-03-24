'use client';

import './MobileHome.css';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import Footer from '@/components/layout/footer/Footer';
import { useViewTransition } from '@/hooks/useViewTransition';
import soundManager from '@/lib/soundManager';

const FEATURED_WORK = [
    {
        src: '/mhomework/mhomework_1.jpg',
        num: '01',
        title: 'Sacred fiery ritual',
    },
    {
        src: '/mhomework/mhomework_2.jpg',
        num: '02',
        title: 'Calm intense gaze',
    },
    {
        src: '/mhomework/mhomework_3.jpg',
        num: '03',
        title: 'Majestic architecture',
    },
    {
        src: '/mhomework/mhomework_4.jpg',
        num: '04',
        title: 'Childhood festive focus',
    },
    {
        src: '/mhomework/mhomework_5.jpg',
        num: '05',
        title: 'Serene coastal solitude',
    },
];

const EXPERTISE = [
    {
        num: '01',
        name: 'Portrait',
        desc: 'Sculpting character, mood, and narrative through controlled light and intimate framing.',
    },
    {
        num: '02',
        name: 'Street',
        desc: 'Capturing the raw, unscripted pulse of the city — where chaos meets composition.',
    },
    {
        num: '03',
        name: 'Travel',
        desc: 'Documenting journeys that blend cultural immersion with visual storytelling.',
    },
    {
        num: '04',
        name: 'Nature',
        desc: 'Where the wild speaks — blending untamed landscapes with refined composition.',
    },
    {
        num: '05',
        name: 'Indoor',
        desc: 'Transforming spaces into experiences through light, shadow, and perspective.',
    },
    {
        num: '06',
        name: 'Others',
        desc: 'Beyond the frame — exploring the spaces between moments and genres.',
    },
];

const BLOG_POSTS = [
    {
        slug: 'strings-of-the-desert',
        title: 'Strings of the Desert',
        excerpt:
            'Strings of the Desert: My Encounter with a Rajasthani Folk Musician in Pushkar',
        date: 'Feb 2026',
        tag: 'Potrait',
        img: '/mhomeblog/mhomeblog_1.jpg',
    },
    {
        slug: 'a-moment-i-couldn-t-forget',
        title: 'A Moment I Couldn&apos;t Forget',
        excerpt:
            'There are moments you capture with your camera — and then there are moments that capture you. This was one of them.',
        date: 'Jan 2026',
        tag: 'Street',
        img: '/mhomeblog/mhomeblog_2.webp',
    },
    {
        slug: 'smoke-silence-and-shiva',
        title: 'Smoke, Silence, and Shiva',
        excerpt:
            'Smoke, Silence, and Shiva: A Shivratri at Bhootnath Temple, Kolkata',
        date: 'Dec 2025',
        tag: 'Travel',
        img: '/mhomeblog/mhomeblog_3.jpg',
    },
];

const STATS = [
    { num: '06', label: 'Years Active' },
    { num: '340+', label: 'Sessions Shot' },
    { num: '18', label: 'Cities Covered' },
];

export default function MobileHome() {
    const rootRef = useRef(null);
    const { navigateWithTransition } = useViewTransition();

    const handleNav = (e, href) => {
        e.preventDefault();
        e.stopPropagation();
        soundManager.play('link-click');
        navigateWithTransition(href);
    };

    useGSAP(
        () => {
            const loadTl = gsap.timeline({ delay: 0.3 });

            loadTl
                .fromTo(
                    '.mh-hero-reveal-line',
                    { scaleX: 0 },
                    { scaleX: 1, duration: 0.8, ease: 'power4.inOut' },
                    0
                )
                .to(
                    '.mh-hero-reveal-line',
                    { opacity: 0, duration: 0.4, ease: 'power2.out' },
                    0.7
                )

                .fromTo(
                    '.mh-hero-gradient',
                    { opacity: 0 },
                    { opacity: 1, duration: 1.2, ease: 'power2.out' },
                    0.3
                )

                .fromTo(
                    '.mh-hero-particles',
                    { opacity: 0 },
                    { opacity: 1, duration: 1.5, ease: 'power1.out' },
                    0.5
                )

                .to(
                    '.mh-hero-ring-wrap',
                    {
                        scale: 1,
                        opacity: 1,
                        duration: 2.0,
                        ease: 'expo.out',
                    },
                    0.5
                )
                .fromTo(
                    '.mh-hero-ring',
                    { rotation: -180 },
                    { rotation: 0, duration: 2.0, ease: 'expo.out' },
                    0.5
                )

                .to(
                    '.mh-hero-orb',
                    {
                        scale: 1,
                        opacity: 0.5,
                        duration: 0.6,
                        ease: 'power3.out',
                    },
                    1.0
                )
                .fromTo(
                    '.mh-hero-orb-flash',
                    { opacity: 0, scale: 0.5 },
                    {
                        opacity: 0.8,
                        scale: 2.5,
                        duration: 0.4,
                        ease: 'power2.out',
                    },
                    1.0
                )
                .to(
                    '.mh-hero-orb-flash',
                    { opacity: 0, scale: 3, duration: 0.6, ease: 'power2.out' },
                    1.3
                )

                .to(
                    '.mh-hero-ring-glow',
                    {
                        opacity: 0.35,
                        duration: 1.2,
                        ease: 'power2.out',
                    },
                    1.2
                )

                .fromTo(
                    '.mh-hero-index',
                    { opacity: 0, x: -20 },
                    { opacity: 0.4, x: 0, duration: 0.5, ease: 'power3.out' },
                    1.4
                )
                .fromTo(
                    '.mh-hero-name-line',
                    { opacity: 0, y: 60, skewY: 3 },
                    {
                        opacity: 1,
                        y: 0,
                        skewY: 0,
                        duration: 0.9,
                        stagger: 0.15,
                        ease: 'power4.out',
                    },
                    1.5
                )
                .fromTo(
                    '.mh-hero-tagline',
                    { opacity: 0, y: 16 },
                    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
                    1.9
                )

                .fromTo(
                    '.mh-hero-scroll',
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
                    2.2
                )

                .fromTo(
                    '.mh-hero-scanlines',
                    { opacity: 0 },
                    { opacity: 1, duration: 1.0, ease: 'power1.out' },
                    1.5
                );

            gsap.to('.mh-hero-ring', {
                rotation: 360,
                duration: 50,
                repeat: -1,
                ease: 'none',
            });

            gsap.to('.mh-hero-ring-glow', {
                opacity: 0.5,
                scale: 1.05,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 2,
            });

            gsap.to('.mh-hero-orb', {
                scale: 1.3,
                opacity: 0.7,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 2,
            });

            gsap.fromTo(
                '.mh-work-item',
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.12,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.mh-work',
                        start: 'top 85%',
                        once: true,
                    },
                }
            );

            gsap.fromTo(
                '.mh-work-gallery-cta',
                { opacity: 0, y: 16 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.mh-work-gallery-cta',
                        start: 'top 92%',
                        once: true,
                    },
                }
            );

            gsap.fromTo(
                '.mh-expertise-item',
                { opacity: 0, y: 24 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.08,
                    duration: 0.7,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.mh-expertise',
                        start: 'top 85%',
                        once: true,
                    },
                }
            );

            gsap.fromTo(
                '.mh-blog-card',
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.mh-blog',
                        start: 'top 85%',
                        once: true,
                    },
                }
            );

            gsap.fromTo(
                '.mh-blog-cta',
                { opacity: 0, y: 16 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.mh-blog-cta',
                        start: 'top 92%',
                        once: true,
                    },
                }
            );
        },
        { scope: rootRef }
    );

    return (
        <div className="mh" ref={rootRef}>
            {}
            <section className="mh-hero">
                {}
                <div className="mh-hero-reveal-line" aria-hidden="true" />

                {}
                <div className="mh-hero-gradient" />

                {}
                <div className="mh-hero-particles">
                    <span className="mh-particle mh-particle--1" />
                    <span className="mh-particle mh-particle--2" />
                    <span className="mh-particle mh-particle--3" />
                    <span className="mh-particle mh-particle--4" />
                    <span className="mh-particle mh-particle--5" />
                    <span className="mh-particle mh-particle--6" />
                    <span className="mh-particle mh-particle--7" />
                    <span className="mh-particle mh-particle--8" />
                    <span className="mh-particle mh-particle--9" />
                    <span className="mh-particle mh-particle--10" />
                    <span className="mh-particle mh-particle--11" />
                    <span className="mh-particle mh-particle--12" />
                </div>

                {}
                <div className="mh-hero-ring-wrap" aria-hidden="true">
                    {}
                    <div className="mh-hero-ring-glow" />
                    <div className="mh-hero-ring">
                        <svg viewBox="0 0 400 400" fill="none">
                            {}
                            <circle
                                cx="200"
                                cy="200"
                                r="195"
                                stroke="rgba(255,110,20,0.03)"
                                strokeWidth="0.5"
                            />
                            <circle
                                cx="200"
                                cy="200"
                                r="185"
                                stroke="rgba(255,110,20,0.06)"
                                strokeWidth="0.5"
                            />
                            <circle
                                cx="200"
                                cy="200"
                                r="170"
                                stroke="rgba(255,110,20,0.18)"
                                strokeWidth="0.8"
                            />

                            {}
                            {[...Array(72)].map((_, i) => {
                                const angle = i * 5 * (Math.PI / 180);
                                const isLong = i % 6 === 0;
                                const innerR = isLong ? 163 : 166;
                                const x1 = 200 + innerR * Math.cos(angle);
                                const y1 = 200 + innerR * Math.sin(angle);
                                const x2 = 200 + 170 * Math.cos(angle);
                                const y2 = 200 + 170 * Math.sin(angle);
                                return (
                                    <line
                                        key={`tick-${i}`}
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke={
                                            isLong
                                                ? 'rgba(255,110,20,0.3)'
                                                : 'rgba(255,110,20,0.10)'
                                        }
                                        strokeWidth={isLong ? '0.8' : '0.4'}
                                    />
                                );
                            })}

                            {}
                            <circle
                                cx="200"
                                cy="200"
                                r="155"
                                stroke="rgba(255,110,20,0.10)"
                                strokeWidth="0.5"
                                strokeDasharray="8 6"
                            />

                            {}
                            <circle
                                cx="200"
                                cy="200"
                                r="140"
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="0.6"
                            />
                            <circle
                                cx="200"
                                cy="200"
                                r="120"
                                stroke="rgba(255,110,20,0.10)"
                                strokeWidth="0.4"
                            />
                            <circle
                                cx="200"
                                cy="200"
                                r="100"
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth="0.5"
                            />

                            {}
                            {[...Array(8)].map((_, i) => {
                                const angle = i * 45 * (Math.PI / 180);
                                const nextAngle =
                                    (i * 45 + 45) * (Math.PI / 180);
                                const outerR = 80;
                                const innerR = 38;

                                const ox1 =
                                    200 + outerR * Math.cos(angle - 0.12);
                                const oy1 =
                                    200 + outerR * Math.sin(angle - 0.12);
                                const ox2 =
                                    200 + outerR * Math.cos(angle + 0.32);
                                const oy2 =
                                    200 + outerR * Math.sin(angle + 0.32);
                                const ix1 =
                                    200 + innerR * Math.cos(angle + 0.15);
                                const iy1 =
                                    200 + innerR * Math.sin(angle + 0.15);
                                const ix2 =
                                    200 + innerR * Math.cos(angle + 0.45);
                                const iy2 =
                                    200 + innerR * Math.sin(angle + 0.45);
                                return (
                                    <polygon
                                        key={`blade-${i}`}
                                        points={`${ox1},${oy1} ${ox2},${oy2} ${ix2},${iy2} ${ix1},${iy1}`}
                                        fill="rgba(255,110,20,0.04)"
                                        stroke="rgba(255,110,20,0.12)"
                                        strokeWidth="0.4"
                                    />
                                );
                            })}

                            {}
                            <circle
                                cx="200"
                                cy="200"
                                r="38"
                                fill="rgba(255,110,20,0.03)"
                                stroke="rgba(255,110,20,0.15)"
                                strokeWidth="0.6"
                            />
                            <circle
                                cx="200"
                                cy="200"
                                r="28"
                                fill="rgba(255,110,20,0.02)"
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth="0.4"
                            />
                            <circle
                                cx="200"
                                cy="200"
                                r="16"
                                fill="rgba(255,110,20,0.05)"
                                stroke="rgba(255,110,20,0.10)"
                                strokeWidth="0.3"
                            />
                            {}
                            <circle
                                cx="200"
                                cy="200"
                                r="4"
                                fill="rgba(255,110,20,0.35)"
                            />

                            {}
                            <path
                                d="M 145 130 Q 170 115 200 112"
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth="0.8"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 240 280 Q 260 270 270 250"
                                stroke="rgba(255,255,255,0.04)"
                                strokeWidth="0.6"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 130 220 Q 125 200 130 180"
                                stroke="rgba(255,110,20,0.05)"
                                strokeWidth="0.5"
                                strokeLinecap="round"
                            />

                            {}
                            {[
                                0, 30, 60, 90, 120, 150, 180, 210, 240, 270,
                                300, 330,
                            ].map((deg) => {
                                const angle = deg * (Math.PI / 180);
                                const x1 = 200 + 140 * Math.cos(angle);
                                const y1 = 200 + 140 * Math.sin(angle);
                                const x2 = 200 + 145 * Math.cos(angle);
                                const y2 = 200 + 145 * Math.sin(angle);
                                return (
                                    <line
                                        key={`focus-${deg}`}
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke="rgba(255,255,255,0.12)"
                                        strokeWidth="0.5"
                                    />
                                );
                            })}

                            {}
                            {[0, 90, 180, 270].map((deg) => {
                                const angle = deg * (Math.PI / 180);
                                const cx = 200 + 170 * Math.cos(angle);
                                const cy = 200 + 170 * Math.sin(angle);
                                return (
                                    <circle
                                        key={`card-${deg}`}
                                        cx={cx}
                                        cy={cy}
                                        r="2.5"
                                        fill="rgba(255,110,20,0.5)"
                                    />
                                );
                            })}

                            {}
                            <text
                                x="200"
                                y="96"
                                textAnchor="middle"
                                fill="rgba(255,110,20,0.12)"
                                fontSize="5"
                                fontFamily="monospace"
                                letterSpacing="0.15em"
                            >
                                50MM
                            </text>
                            <text
                                x="200"
                                y="310"
                                textAnchor="middle"
                                fill="rgba(255,255,255,0.06)"
                                fontSize="4.5"
                                fontFamily="monospace"
                                letterSpacing="0.15em"
                            >
                                F/1.4
                            </text>
                        </svg>
                    </div>
                </div>

                {}
                <div className="mh-hero-orb" aria-hidden="true" />
                {}
                <div className="mh-hero-orb-flash" aria-hidden="true" />

                {}
                <div className="mh-hero-scanlines" aria-hidden="true" />

                {}
                <div className="mh-hero-content">
                    <span className="mh-hero-index">01 — Storyfinder</span>
                    <h1 className="mh-hero-name">
                        <span className="mh-hero-name-line">Supratik</span>
                        <span className="mh-hero-name-line">
                            Sahis<em>.</em>
                        </span>
                    </h1>
                    <p className="mh-hero-tagline">
                        Photographer &amp; visual storyteller based in Kolkata,
                        capturing moments that refuse to repeat themselves.
                    </p>
                    <div className="mh-hero-scroll">
                        <span>Scroll to explore</span>
                        <div className="mh-hero-scroll-line" />
                    </div>
                </div>

                {}
                <div className="mh-hero-edge" aria-hidden="true" />
            </section>

            {}
            <div className="mh-section-header">
                <span className="mh-section-index">02 — Selected Work</span>
                <span className="mh-section-label">Portfolio</span>
            </div>
            <section className="mh-work">
                <div className="mh-work-grid">
                    {FEATURED_WORK.map((item) => (
                        <div key={item.num} className="mh-work-item">
                            <Image
                                src={item.src}
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 50vw, 33vw"
                                quality={75}
                            />
                            <div className="mh-work-caption">
                                <span className="mh-work-caption-num">
                                    {item.num}
                                </span>
                                <span className="mh-work-caption-title">
                                    {item.title}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {}
                <Link
                    href="/gallery"
                    className="mh-work-gallery-cta"
                    onClick={(e) => handleNav(e, '/gallery')}
                >
                    <span className="mh-work-gallery-cta-label">
                        Explore Full Gallery
                    </span>
                    <span className="mh-work-gallery-cta-line" />
                    <svg
                        className="mh-work-gallery-cta-arrow"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                    >
                        <path
                            d="M5 13L13 5M13 5H6M13 5v7"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </Link>
            </section>

            {}
            <div className="mh-section-header">
                <span className="mh-section-index">03 — Expertise</span>
                <span className="mh-section-label">Specialities</span>
            </div>
            <section className="mh-expertise">
                {EXPERTISE.map((item) => (
                    <div key={item.num} className="mh-expertise-item">
                        <span className="mh-expertise-num">{item.num}</span>
                        <div className="mh-expertise-body">
                            <h4 className="mh-expertise-name">{item.name}</h4>
                            <p className="mh-expertise-desc">{item.desc}</p>
                        </div>
                        <svg
                            className="mh-expertise-arrow"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                        >
                            <path
                                d="M4 12L12 4M12 4H5M12 4v7"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                ))}
            </section>

            {}
            <div className="mh-section-header">
                <span className="mh-section-index">04 — Journal</span>
                <span className="mh-section-label">From the Blog</span>
            </div>
            <section className="mh-blog">
                {BLOG_POSTS.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="mh-blog-card"
                        onClick={(e) => handleNav(e, `/blog/${post.slug}`)}
                    >
                        <div className="mh-blog-card-img">
                            <Image
                                src={post.img}
                                alt={post.title}
                                fill
                                sizes="(max-width: 768px) 30vw, 20vw"
                                quality={70}
                            />
                        </div>
                        <div className="mh-blog-card-body">
                            <div className="mh-blog-card-meta">
                                <span className="mh-blog-card-tag">
                                    {post.tag}
                                </span>
                                <span className="mh-blog-card-date">
                                    {post.date}
                                </span>
                            </div>
                            <h4 className="mh-blog-card-title">{post.title}</h4>
                            <p className="mh-blog-card-excerpt">
                                {post.excerpt}
                            </p>
                        </div>
                        <svg
                            className="mh-blog-card-arrow"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                        >
                            <path
                                d="M4 12L12 4M12 4H6M12 4v6"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Link>
                ))}
                <Link
                    href="/blog"
                    className="mh-blog-cta"
                    onClick={(e) => handleNav(e, '/blog')}
                >
                    <span className="mh-blog-cta-label">Read All Posts</span>
                    <span className="mh-blog-cta-line" />
                    <svg
                        className="mh-blog-cta-arrow"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                    >
                        <path
                            d="M5 13L13 5M13 5H6M13 5v7"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </Link>
            </section>

            {}
            <Footer />
        </div>
    );
}
