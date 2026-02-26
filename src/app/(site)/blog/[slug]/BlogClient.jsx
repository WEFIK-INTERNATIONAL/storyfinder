'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { portableTextComponents } from '@/components/PortableTextComponents';
import { urlFor } from '@/lib/image';
import { gsap } from 'gsap';

export default function BlogClient({ post }) {
    const [toc, setToc] = useState([]);

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
        return () => cancelAnimationFrame(raf);
    }, []);

    /* ================= GSAP Animations ================= */
    useEffect(() => {
        gsap.from('.blog-title', {
            y: 40,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
        });

        gsap.from('.reveal', {
            y: 25,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power2.out',
            delay: 0.2,
        });
    }, []);

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

    return (
        <article className="bg-white text-gray-900 font-mono">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
                <div
                    id="reading-bar"
                    className="h-full bg-black w-0 transition-all duration-150"
                />
            </div>

            {/* ================= HERO ================= */}
            {post.mainImage && (
                <div className="relative h-[80vh] w-full overflow-hidden">
                    <Image
                        src={urlFor(post.mainImage)
                            .width(2000)
                            .quality(90)
                            .url()}
                        alt={post.mainImage.alt || post.title}
                        fill
                        priority
                        className="object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Overlapping Title */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6">
                        <h1 className="blog-title text-white text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg">
                            {post.title}
                        </h1>
                    </div>
                </div>
            )}

            {/* ================= CONTENT ================= */}
            <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-[1fr_260px] gap-10">
                {/* MAIN CONTENT */}
                <div>
                    {post.categories?.[0] && (
                        <span className="inline-block mb-4 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                            {post.categories[0].title}
                        </span>
                    )}

                    <div className="text-gray-500 mb-6 text-sm">
                        {new Date(post.publishedAt).toLocaleDateString('en-IN')}
                    </div>

                    {post.excerpt && (
                        <p className="text-xl text-gray-600 mb-10 reveal">
                            {post.excerpt}
                        </p>
                    )}

                    <div className="prose prose-lg max-w-none">
                        <PortableText
                            value={post.body}
                            components={portableTextComponents}
                        />
                    </div>
                </div>

                {/* ================= TOC ================= */}
                {toc.length > 0 && (
                    <aside className="hidden md:block sticky top-24 h-fit">
                        <div className="border-l pl-4">
                            <h4 className="text-sm font-semibold mb-3 text-gray-500 uppercase">
                                On this page
                            </h4>
                            <div className="flex flex-col gap-2 text-sm">
                                {toc.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className="text-gray-600 hover:text-black transition"
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
