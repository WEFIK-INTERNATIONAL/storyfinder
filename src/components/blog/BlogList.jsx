'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useViewTransition } from '@/hooks/useViewTransition';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { format, parseISO, differenceInDays } from 'date-fns';
import { FiShare2 } from 'react-icons/fi';
import './BlogList.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BlogList = ({ posts }) => {
    const pathname = usePathname();
    const { navigateWithTransition } = useViewTransition();

    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const featuredRef = useRef(null);
    const cardRefs = useRef([]);

    useGSAP(
        () => {
            // Hero animations
            const tl = gsap.timeline();

            if (titleRef.current) {
                tl.from(titleRef.current, {
                    y: 80,
                    opacity: 0,
                    duration: 1.2,
                    ease: 'power4.out',
                });
            }

            if (subtitleRef.current) {
                tl.from(
                    subtitleRef.current,
                    {
                        y: 30,
                        opacity: 0,
                        duration: 1,
                        ease: 'power3.out',
                    },
                    '-=0.8'
                );
            }

            // Featured Card Animation
            if (featuredRef.current) {
                const imageWrapper = featuredRef.current.querySelector(
                    '.blog-featured-image-wrapper'
                );

                gsap.from(featuredRef.current, {
                    y: 60,
                    opacity: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: featuredRef.current,
                        start: 'top 85%',
                    },
                });

                if (imageWrapper) {
                    gsap.from(imageWrapper, {
                        clipPath: 'inset(100% 0% 0% 0%)',
                        duration: 1.1,
                        ease: 'expo.out',
                        scrollTrigger: {
                            trigger: featuredRef.current,
                            start: 'top 85%',
                        },
                    });

                    gsap.from(imageWrapper.querySelector('img'), {
                        scale: 1.2,
                        duration: 1.5,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: featuredRef.current,
                            start: 'top 85%',
                        },
                    });
                }
            }

            // Stagger grid cards on scroll
            if (cardRefs.current.length > 0) {
                cardRefs.current.forEach((card, index) => {
                    if (!card) return;

                    const imageWrapper = card.querySelector(
                        '.blog-card-image-wrapper'
                    );

                    gsap.from(card, {
                        y: 60,
                        opacity: 0,
                        duration: 0.9,
                        ease: 'power3.out',
                        scrollTrigger: { trigger: card, start: 'top 85%' },
                    });

                    if (imageWrapper) {
                        gsap.from(imageWrapper, {
                            clipPath: 'inset(100% 0% 0% 0%)',
                            duration: 1.1,
                            ease: 'expo.out',
                            scrollTrigger: { trigger: card, start: 'top 85%' },
                        });

                        gsap.from(imageWrapper.querySelector('img'), {
                            scale: 1.2,
                            duration: 1.5,
                            ease: 'power2.out',
                            scrollTrigger: { trigger: card, start: 'top 85%' },
                        });
                    }
                });
            }
        },
        { scope: containerRef }
    );

    const handleShare = (e, url, title) => {
        e.preventDefault();
        e.stopPropagation();
        const fullUrl = `${window.location.origin}${url}`;

        if (navigator.share) {
            navigator
                .share({
                    title: title,
                    url: fullUrl,
                })
                .catch(console.error);
        } else {
            navigator.clipboard.writeText(fullUrl);
            alert('Link copied to clipboard!');
        }
    };

    const isFeaturedNew =
        posts?.[0]?.publishedAt &&
        differenceInDays(new Date(), parseISO(posts[0].publishedAt)) <= 7;
    const featuredPost = posts?.[0];
    const gridPosts = posts?.slice(1) || [];

    return (
        <main className="blog-page" ref={containerRef}>
            {/* HERO SECTION */}
            <header className="blog-header" ref={headerRef}>
                <div className="container">
                    <h1 className="blog-title" ref={titleRef}>
                        The <span className="blog-title-ghost">Journal</span>
                    </h1>
                    <p className="blog-subtitle" ref={subtitleRef}>
                        Essays, field notes, and thoughts on visual
                        storytelling, light, and the art of photography.
                    </p>
                </div>
            </header>

            <section className="blog-content-section">
                <div className="container blog-content-wrapper">
                    {/* FEATURED LATEST POST */}
                    {featuredPost && (
                        <Link
                            href={`/blog/${featuredPost.slug}`}
                            onClick={(e) => {
                                e.preventDefault();
                                if (pathname === `/blog/${featuredPost.slug}`)
                                    return;
                                navigateWithTransition(
                                    `/blog/${featuredPost.slug}`
                                );
                            }}
                            className="blog-featured-card"
                            ref={featuredRef}
                            aria-label={`Read featured post: ${featuredPost.title}`}
                        >
                            <div className="blog-featured-image-wrapper">
                                <Image
                                    src={
                                        featuredPost.mainImage?.asset?.url ||
                                        '/fallback/fallback-image-profile.png'
                                    }
                                    alt={
                                        featuredPost.title ||
                                        'Featured Post Image'
                                    }
                                    fill
                                    className="blog-card-image"
                                    sizes="(max-width: 1024px) 100vw, 60vw"
                                    priority
                                    placeholder={
                                        featuredPost.mainImage?.asset?.metadata
                                            ?.lqip
                                            ? 'blur'
                                            : 'empty'
                                    }
                                    blurDataURL={
                                        featuredPost.mainImage?.asset?.metadata
                                            ?.lqip || undefined
                                    }
                                />
                                <div className="blog-card-grain"></div>
                            </div>

                            <div className="blog-featured-content">
                                <div className="blog-card-meta">
                                    {isFeaturedNew && (
                                        <span className="blog-badge-new">
                                            NEW
                                        </span>
                                    )}
                                    <span className="blog-card-date">
                                        {featuredPost.publishedAt
                                            ? format(
                                                  parseISO(
                                                      featuredPost.publishedAt
                                                  ),
                                                  'MMM d, yyyy'
                                              )
                                            : 'Recent'}
                                    </span>
                                    <span className="blog-spacer">•</span>
                                    <span className="blog-card-read-time">
                                        5 min read
                                    </span>
                                </div>
                                <h2 className="blog-featured-title">
                                    {featuredPost.title}
                                </h2>
                                {featuredPost.excerpt && (
                                    <p className="blog-featured-excerpt">
                                        {featuredPost.excerpt}
                                    </p>
                                )}

                                <div className="blog-card-footer">
                                    <button
                                        className="blog-share-btn"
                                        onClick={(e) =>
                                            handleShare(
                                                e,
                                                `/blog/${featuredPost.slug}`,
                                                featuredPost.title
                                            )
                                        }
                                        aria-label="Share post"
                                    >
                                        <FiShare2 /> Share
                                    </button>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* BLOG GRID */}
                    {gridPosts.length > 0 ? (
                        <div className="blog-grid">
                            {gridPosts.map((post, index) => {
                                const isNew =
                                    post.publishedAt &&
                                    differenceInDays(
                                        new Date(),
                                        parseISO(post.publishedAt)
                                    ) <= 7;

                                return (
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (
                                                pathname ===
                                                `/blog/${post.slug}`
                                            )
                                                return;
                                            navigateWithTransition(
                                                `/blog/${post.slug}`
                                            );
                                        }}
                                        className="blog-card"
                                        key={post._id}
                                        ref={(el) =>
                                            (cardRefs.current[index] = el)
                                        }
                                    >
                                        <div className="blog-card-image-wrapper">
                                            <Image
                                                src={
                                                    post.mainImage?.asset
                                                        ?.url ||
                                                    '/fallback/fallback-image-profile.png'
                                                }
                                                alt={
                                                    post.title ||
                                                    'Blog post image'
                                                }
                                                fill
                                                className="blog-card-image"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                placeholder={
                                                    post.mainImage?.asset
                                                        ?.metadata?.lqip
                                                        ? 'blur'
                                                        : 'empty'
                                                }
                                                blurDataURL={
                                                    post.mainImage?.asset
                                                        ?.metadata?.lqip ||
                                                    undefined
                                                }
                                            />
                                            <div className="blog-card-grain"></div>
                                        </div>

                                        <div className="blog-card-content">
                                            <h3 className="blog-card-title">
                                                {post.title}
                                            </h3>

                                            <div className="blog-card-footer mt-auto pt-4">
                                                <div className="blog-card-meta">
                                                    {isNew && (
                                                        <span className="blog-badge-new">
                                                            NEW
                                                        </span>
                                                    )}
                                                    <span className="blog-card-date">
                                                        {post.publishedAt
                                                            ? format(
                                                                  parseISO(
                                                                      post.publishedAt
                                                                  ),
                                                                  'MMM d, yyyy'
                                                              )
                                                            : 'Recent'}
                                                    </span>
                                                </div>
                                                <button
                                                    className="blog-share-btn"
                                                    onClick={(e) =>
                                                        handleShare(
                                                            e,
                                                            `/blog/${post.slug}`,
                                                            post.title
                                                        )
                                                    }
                                                    aria-label="Share post"
                                                >
                                                    <FiShare2 />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        !featuredPost && (
                            <div className="blog-empty-state">
                                <p>No posts available at the moment.</p>
                            </div>
                        )
                    )}
                </div>
            </section>
        </main>
    );
};

export default BlogList;
