'use client';

import Image from 'next/image';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { portableTextComponents } from '@/components/PortableTextComponents';
import { urlFor } from '@/lib/image';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { format, parseISO, differenceInDays } from 'date-fns';
import { FiShare2, FiArrowLeft, FiClock, FiCalendar } from 'react-icons/fi';
import './BlogPost.css';
import Footer from '@/components/layout/footer/Footer';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function BlogClient({ post }) {
    const [toc, setToc] = useState([]);
    const [activeSection, setActiveSection] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        const bar = document.getElementById('reading-bar');
        let raf;

        const update = () => {
            if (!bar) return;
            const scrollTop = window.scrollY;
            const height =
                document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / height) * 100;
            bar.style.width = progress + '%';
            raf = requestAnimationFrame(update);
        };

        raf = requestAnimationFrame(update);

        return () => {
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    useGSAP(
        () => {
            gsap.from('.blog-post-hero-title', {
                y: 40,
                opacity: 0,
                duration: 1.2,
                ease: 'power3.out',
            });

            gsap.from('.reveal-meta', {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
                delay: 0.2,
                stagger: 0.1,
            });

            gsap.from('.reveal-excerpt', {
                y: 30,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                delay: 0.4,
            });

            const contentBlocks = gsap.utils.toArray('.blog-prose > *');
            if (contentBlocks.length > 0) {
                contentBlocks.forEach((block) => {
                    gsap.from(block, {
                        y: 30,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: block,
                            start: 'top 95%',
                        },
                    });
                });
            }
        },
        { scope: containerRef }
    );

    useEffect(() => {
        const headings = document.querySelectorAll('h2[data-toc]');
        const items = Array.from(headings).map((h, i) => {
            const id = `section-${i}`;
            h.id = id;
            return { id, text: h.innerText };
        });

        const t = setTimeout(() => {
            setToc((prev) => {
                if (
                    prev.length === items.length &&
                    prev.every(
                        (item, idx) =>
                            item.id === items[idx].id &&
                            item.text === items[idx].text
                    )
                ) {
                    return prev;
                }
                return items;
            });
        }, 0);
        return () => clearTimeout(t);
    }, [post.body]);

    const handleScroll = useCallback(() => {
        const headings = document.querySelectorAll('h2[data-toc]');
        let current = '';
        headings.forEach((h) => {
            const rect = h.getBoundingClientRect();
            if (rect.top <= 180) {
                current = h.id;
            }
        });
        setActiveSection(current);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const handleShare = (e) => {
        e.preventDefault();
        const fullUrl = window.location.href;

        if (navigator.share) {
            navigator
                .share({
                    title: post.title,
                    url: fullUrl,
                })
                .catch(console.error);
        } else {
            navigator.clipboard.writeText(fullUrl);
            alert('Link copied to clipboard!');
        }
    };

    const isNew =
        post.publishedAt &&
        differenceInDays(new Date(), parseISO(post.publishedAt)) <= 7;

    const estimateReadingTime = () => {
        if (!post.body) return null;
        const text = post.body
            .filter((b) => b._type === 'block')
            .map((b) => b.children?.map((c) => c.text).join(' '))
            .join(' ');
        const words = text.split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    };
    const readTime = estimateReadingTime();

    return (
        <article className="blog-post-page" ref={containerRef}>
            {}
            <div className="fixed top-0 left-0 w-full h-1 bg-progress-track z-50">
                <div
                    id="reading-bar"
                    className="h-full w-0 transition-all duration-150 ease-out"
                />
            </div>

            {}
            {post.mainImage && (
                <div className="relative h-[80vh] min-h-[500px] w-full overflow-hidden bg-black">
                    <Image
                        src={urlFor(post.mainImage)
                            .width(2000)
                            .quality(90)
                            .url()}
                        alt={post.mainImage.alt || post.title}
                        fill
                        priority
                        className="object-cover opacity-80"
                        placeholder={
                            post.mainImage.asset?.metadata?.lqip
                                ? 'blur'
                                : 'empty'
                        }
                        blurDataURL={
                            post.mainImage.asset?.metadata?.lqip || undefined
                        }
                    />

                    {}
                    <div className="blog-post-hero-grain" />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0f0d0b] via-black/40 to-transparent" />

                    {}
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6">
                        <h1 className="blog-post-hero-title text-4xl sm:text-6xl md:text-7xl lg:text-[6rem]">
                            {post.title}
                        </h1>
                    </div>
                </div>
            )}

            {}
            <div className="blog-post-content-wrapper">
                {}
                <div className="blog-post-main-col">
                    {}
                    <div className="blog-post-meta-strip reveal-meta">
                        <div className="blog-post-meta-left">
                            {}
                            <div className="blog-post-categories">
                                {post.categories?.map((cat, idx) => (
                                    <span
                                        key={idx}
                                        className="blog-post-category"
                                    >
                                        {cat.title}
                                    </span>
                                ))}
                            </div>

                            {isNew && (
                                <span className="blog-post-new-badge">NEW</span>
                            )}
                        </div>

                        <div className="blog-post-meta-right">
                            <span className="blog-post-meta-item">
                                <FiCalendar size={13} />
                                <time dateTime={post.publishedAt}>
                                    {post.publishedAt
                                        ? format(
                                              parseISO(post.publishedAt),
                                              'MMM d, yyyy'
                                          )
                                        : 'Recently'}
                                </time>
                            </span>

                            {readTime && (
                                <span className="blog-post-meta-item">
                                    <FiClock size={13} />
                                    {readTime} min read
                                </span>
                            )}

                            <span className="blog-post-meta-divider" />

                            <button
                                onClick={handleShare}
                                className="blog-post-share-btn"
                                aria-label="Share this post"
                            >
                                <FiShare2 size={14} />
                                Share
                            </button>
                        </div>
                    </div>

                    {}
                    {post.excerpt && (
                        <div className="blog-post-excerpt-wrapper reveal-excerpt">
                            <p className="blog-post-excerpt">{post.excerpt}</p>
                        </div>
                    )}

                    {}
                    <div className="blog-prose w-full">
                        <PortableText
                            value={post.body}
                            components={portableTextComponents}
                        />
                    </div>

                    {}
                    <div className="blog-post-end-marker">
                        <span className="blog-post-end-diamond" />
                        <span className="blog-post-end-line" />
                        <span className="blog-post-end-diamond" />
                    </div>

                    {}
                    <Link href="/blog" className="blog-post-back-link">
                        <FiArrowLeft size={16} />
                        <span>Back to Journal</span>
                    </Link>
                </div>

                {}
                {toc.length > 0 && (
                    <aside className="blog-post-toc-aside">
                        <div className="blog-post-toc-container">
                            <h4 className="blog-post-toc-title">Index</h4>
                            <div className="blog-post-toc-nav">
                                {toc.map((item, idx) => (
                                    <Link
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className={`blog-post-toc-link ${activeSection === item.id ? 'active' : ''}`}
                                    >
                                        <span className="blog-post-toc-number">
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        {item.text}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                )}
            </div>
            <div>
                <Footer />
            </div>
        </article>
    );
}
