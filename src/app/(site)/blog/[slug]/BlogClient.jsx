'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { portableTextComponents } from '@/components/PortableTextComponents';
import { urlFor } from '@/lib/image';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { format, parseISO, differenceInDays } from 'date-fns';
import { FiShare2 } from 'react-icons/fi';
import './BlogPost.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function BlogClient({ post }) {
    const [toc, setToc] = useState([]);
    const containerRef = useRef(null);

    /* ================= Reading Progress ================= */
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

    /* ================= GSAP Animations ================= */
    useGSAP(() => {
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
        
        // Stagger basic content blocks appearing on scroll
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
                     }
                 });
             });
        }
    }, { scope: containerRef });

    /* ================= TOC ================= */
    useEffect(() => {
        const headings = document.querySelectorAll('h2[data-toc]');
        const items = Array.from(headings).map((h, i) => {
            const id = `section-${i}`;
            h.id = id;
            return { id, text: h.innerText };
        });
        setToc(items);
    }, [post.body]);

    const handleShare = (e) => {
        e.preventDefault();
        const fullUrl = window.location.href;

        if (navigator.share) {
            navigator.share({
                title: post.title,
                url: fullUrl
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(fullUrl);
            alert("Link copied to clipboard!");
        }
    };

    const isNew = post.publishedAt && differenceInDays(new Date(), parseISO(post.publishedAt)) <= 7;

    return (
        <article className="blog-post-page" ref={containerRef}>
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-progress-track z-50">
                <div
                    id="reading-bar"
                    className="h-full w-0 transition-all duration-150 ease-out"
                />
            </div>

            {/* ================= HERO ================= */}
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
                        placeholder={post.mainImage.asset?.metadata?.lqip ? "blur" : "empty"}
                        blurDataURL={post.mainImage.asset?.metadata?.lqip || undefined}
                    />

                    {/* Gradient Overlay & Grain */}
                    <div className="blog-post-hero-grain" />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0f0d0b] via-black/40 to-transparent" />

                    {/* Overlapping Title */}
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6">
                        <h1 className="blog-post-hero-title text-4xl sm:text-6xl md:text-7xl lg:text-[6rem]">
                            {post.title}
                        </h1>
                    </div>
                </div>
            )}

            {/* ================= CONTENT ================= */}
            <div className="max-w-5xl mx-auto px-6 py-16 grid lg:grid-cols-[1fr_260px] gap-12 lg:gap-16">
                
                {/* MATADATA & MAIN CONTENT */}
                <div className="w-full max-w-full overflow-hidden">
                    
                    <div className="flex flex-wrap items-center gap-4 mb-8 border-b border-white/10 pb-6 reveal-meta">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2">
                            {post.categories?.map((cat, idx) => (
                                <span key={idx} className="blog-post-category">
                                    {cat.title}
                                </span>
                            ))}
                        </div>

                        {/* Date & Tags */}
                        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-[#e3e3db]/60">
                            {isNew && (
                                <span className="bg-[#c0501a] text-white px-2 py-1 rounded-sm font-bold">
                                    NEW
                                </span>
                            )}
                            <time dateTime={post.publishedAt}>
                                {post.publishedAt ? format(parseISO(post.publishedAt), 'MMMM d, yyyy') : 'Recently'}
                            </time>
                            
                            <span className="text-white/20">•</span>
                            
                            {/* Native Share Button */}
                            <button 
                                onClick={handleShare}
                                className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
                                aria-label="Share this post"
                            >
                                <FiShare2 /> Share
                            </button>
                        </div>
                    </div>

                    {post.excerpt && (
                        <p className="text-xl md:text-2xl font-light text-[#e3e3db]/90 mb-12 leading-relaxed reveal-excerpt border-l-2 border-[#c0501a]/50 pl-6">
                            {post.excerpt}
                        </p>
                    )}

                    <div className="blog-prose w-full">
                        <PortableText
                            value={post.body}
                            components={portableTextComponents}
                        />
                    </div>
                </div>

                {/* ================= TOC ================= */}
                {toc.length > 0 && (
                    <aside className="hidden lg:block sticky top-32 h-fit reveal-meta">
                        <div className="border-l border-white/10 pl-6 py-2">
                            <h4 className="blog-post-toc-title mb-6">
                                Index
                            </h4>
                            <div className="flex flex-col gap-3">
                                {toc.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className="blog-post-toc-link"
                                    >
                                        {item.text}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </article>
    );
}
