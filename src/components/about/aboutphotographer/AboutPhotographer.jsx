'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import Copy from '@/components/ui/copy/Copy';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useViewTransition } from '@/hooks/useViewTransition';
import { usePathname } from 'next/navigation';
import './Aboutphotograper.css';

const STATS = [
    { num: 6,   suffix: '',  label: 'Years\nActive',   display: '06',   pad: true  },
    { num: 340, suffix: '+', label: 'Sessions\nShot',  display: '340+', pad: false },
    { num: 18,  suffix: '',  label: 'Cities\nCovered', display: '18',   pad: false },
];

const TAGS = ['PORTRAIT', 'DOCUMENTARY', 'EDITORIAL', 'FINE ART', 'RETOUCH'];

export default function AboutPhotographer() {
    const outerRef   = useRef(null);   
    const trackRef   = useRef(null);   
    const sigRef     = useRef(null);
    const nibRef     = useRef(null);
    const statEls    = useRef([]);
    const tagEls     = useRef([]);
    const ruleRef    = useRef(null);
    const imageRef   = useRef(null);
    const hScrollRef = useRef(null);  

    const pathname = usePathname();
    const { navigateWithTransition } = useViewTransition();

    useGSAP(() => {
        const mm = gsap.matchMedia();
        mm.add('(min-width: 1024px)', () => {
            const track  = trackRef.current;
            const outer  = outerRef.current;
            const getScrollDist = () => track.scrollWidth - window.innerWidth;

            hScrollRef.current = ScrollTrigger.create({
                trigger: outer,
                start: 'top top',
                end: () => `+=${getScrollDist()}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate(self) {
                    gsap.set(track, { x: -self.progress * getScrollDist() });
                },
            });
            statEls.current.forEach((el) => {
                if (!el) return;
                const valEl  = el.querySelector('[data-count]');
                if (!valEl) return;
                const target = parseInt(valEl.dataset.count, 10);
                const suffix = valEl.dataset.suffix ?? '';
                const pad    = valEl.dataset.pad === 'true';
                if (isNaN(target)) return;

                const obj     = { val: 0 };
                let   started = false;
                ScrollTrigger.create({
                    trigger: outer,
                    start: 'top top',
                    end: () => `+=${getScrollDist()}`,
                    scrub: false,
                    onUpdate(self) {
                        if (!started && self.progress > 0.68) {
                            started = true;
                            gsap.to(obj, {
                                val: target,
                                duration: 2,
                                ease: 'power2.out',
                                onUpdate() {
                                    const v = Math.floor(obj.val);
                                    valEl.textContent = (pad ? String(v).padStart(2, '0') : v) + suffix;
                                },
                            });
                        }
                    },
                });
            });
            initSignature(0.88);

            return () => {
                hScrollRef.current?.kill();
                gsap.set(track, { x: 0 });
            };
        });
        mm.add('(max-width: 1023px)', () => {
            statEls.current.forEach((el) => {
                if (!el) return;
                const valEl  = el.querySelector('[data-count]');
                if (!valEl) return;
                const target = parseInt(valEl.dataset.count, 10);
                const suffix = valEl.dataset.suffix ?? '';
                const pad    = valEl.dataset.pad === 'true';
                if (isNaN(target)) return;
                const obj = { val: 0 };
                ScrollTrigger.create({
                    trigger: el, start: 'top 86%', once: true,
                    onEnter() {
                        gsap.to(obj, {
                            val: target, duration: 2, ease: 'power2.out',
                            onUpdate() {
                                const v = Math.floor(obj.val);
                                valEl.textContent = (pad ? String(v).padStart(2, '0') : v) + suffix;
                            },
                        });
                    },
                });
            });

            initSignature(0, true); 
        });
        gsap.from(ruleRef.current, {
            scaleX: 0, transformOrigin: 'left', duration: 1.6, ease: 'expo.inOut',
            scrollTrigger: { trigger: ruleRef.current, start: 'top 88%' },
        });

        gsap.from(tagEls.current, {
            opacity: 0, y: 14, stagger: 0.07, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: tagEls.current[0], start: 'top 90%' },
        });

        gsap.from(imageRef.current, {
            clipPath: 'inset(14% 0% 14% 0%)', opacity: 0, duration: 1.6, ease: 'expo.out',
            scrollTrigger: { trigger: imageRef.current, start: 'top 85%' },
        });
        function initSignature(progressThreshold, useNormalST = false) {
            if (!sigRef.current || !nibRef.current) return;

            const paths   = Array.from(sigRef.current.querySelectorAll('path[data-stroke]'));
            const lengths = paths.map(p => p.getTotalLength());
            const total   = lengths.reduce((a, b) => a + b, 0);

            paths.forEach((p, i) => {
                gsap.set(p, { strokeDasharray: lengths[i], strokeDashoffset: lengths[i] });
            });
            gsap.set(nibRef.current, { opacity: 0, scale: 0 });

            let fired = false;

            function runSignature() {
                if (fired) return;
                fired = true;

                const tl = gsap.timeline();
                tl.to(nibRef.current, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(2)' });

                paths.forEach((p, i) => {
                    const dur   = (lengths[i] / total) * 2.6;
                    const svgEl = sigRef.current;
                    const prog  = { t: 0 };

                    tl.call(() => {
                        const pt      = p.getPointAtLength(0);
                        const svgRect = svgEl.getBoundingClientRect();
                        const vb      = svgEl.viewBox.baseVal;
                        gsap.set(nibRef.current, {
                            x: pt.x * (svgRect.width  / vb.width),
                            y: pt.y * (svgRect.height / vb.height),
                            xPercent: -50, yPercent: -50,
                        });
                    });

                    tl.to(p, { strokeDashoffset: 0, duration: dur, ease: 'none' }, '<');

                    tl.to(prog, {
                        t: 1, duration: dur, ease: 'none',
                        onUpdate() {
                            const pt      = p.getPointAtLength(prog.t * lengths[i]);
                            const svgRect = svgEl.getBoundingClientRect();
                            const vb      = svgEl.viewBox.baseVal;
                            gsap.set(nibRef.current, {
                                x: pt.x * (svgRect.width  / vb.width),
                                y: pt.y * (svgRect.height / vb.height),
                                xPercent: -50, yPercent: -50,
                            });
                        },
                    }, '<');
                });

                tl.to(nibRef.current, { scale: 1.8, duration: 0.15, ease: 'power2.out' })
                  .to(nibRef.current, { scale: 0, opacity: 0, duration: 0.35, ease: 'power3.in' });
            }

            if (useNormalST) {
                ScrollTrigger.create({
                    trigger: sigRef.current, start: 'top 88%', once: true,
                    onEnter: runSignature,
                });
            } else {
                ScrollTrigger.create({
                    trigger: outerRef.current,
                    start: 'top top',
                    end: () => `+=${trackRef.current.scrollWidth - window.innerWidth}`,
                    onUpdate(self) { if (self.progress >= progressThreshold) runSignature(); },
                });
            }
        }

    }, { scope: outerRef });

    return (
        <section ref={outerRef} className="ap-outer">
            <div className="ap-header">
                <div className="ap-intro-band">
                    <span className="ap-index">03 — ABOUT</span>
                    <div className="ap-tags">
                        {TAGS.map((t, i) => (
                            <span key={t} ref={el => (tagEls.current[i] = el)} className="ap-tag">{t}</span>
                        ))}
                    </div>
                </div>
                <div ref={ruleRef} className="ap-rule" />
            </div>
            <div ref={trackRef} className="ap-track">
                <div className="ap-panel ap-panel--name">
                    <h2 className="ap-name">
                        <span className="ap-name-outline">Supratik</span>
                        <span className="ap-name-filled">Sahis<em>.</em></span>
                    </h2>
                    <div className="ap-name-meta">
                        <span className="ap-location-line">KOLKATA, INDIA</span>
                        <span className="ap-tagline">Photographer &amp; Visual Storyteller</span>
                        <div className="ap-scroll-hint">
                            <span>SCROLL TO EXPLORE</span>
                            <div className="ap-scroll-arrow">
                                <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
                                    <path d="M0 6h38M33 1l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ap-panel ap-panel--image">
                    <div ref={imageRef} className="ap-image-wrap">
                        <Image
                            src="/stock/supratik_img.jpg"
                            alt="Supratik Sahis"
                            fill
                            className="ap-img"
                        />
                        <div className="ap-img-grain" />
                        <div className="ap-img-footer">
                            <span>SUPRATIK SAHIS</span>
                            <span>© STORYFINDER</span>
                        </div>
                    </div>
                </div>
                <div className="ap-panel ap-panel--bio">
                    <span className="ap-eyebrow">THE MAN BEHIND THE LENS</span>
                    <div className="ap-bio-body">
                        <Copy animateOnScroll={true}>
                            <p className="lg">
                                I find stories where others see silence. Armed with a
                                camera and an obsession with light, I chase moments that
                                refuse to repeat themselves — the trembling second before
                                a laugh breaks, the shadow that bends just right.
                            </p>
                            <p className="lg">
                                Based in the electric chaos of Kolkata, I work across
                                portrait, documentary, and fine-art photography. Every
                                frame is a negotiation between what is and what could be.
                                I don't take photographs — I make them.
                            </p>
                        </Copy>
                    </div>
                </div>

                <div className="ap-panel ap-panel--data">

                    <div className="ap-stats-block">
                        {STATS.map((s, i) => (
                            <div key={s.label} className="ap-stat" ref={el => (statEls.current[i] = el)}>
                                <span
                                    className="ap-stat-num"
                                    data-count={s.num}
                                    data-suffix={s.suffix}
                                    data-pad={String(s.pad)}
                                >
                                    {s.display}
                                </span>
                                <span className="ap-stat-label">
                                    {s.label.split('\n').map((l, j) => (
                                        <React.Fragment key={j}>{l}<br /></React.Fragment>
                                    ))}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="ap-quote-block">
                        <Copy animateOnScroll={true}>
                            <p className="lg">
                                "Light is not what I photograph.<br />
                                Light is how I think.<br />
                                Every shadow is a decision."
                            </p>
                        </Copy>
                        <span className="ap-quote-attr">— Supratik Sahis</span>
                    </div>

                </div>
                <div className="ap-panel ap-panel--sig">

                    <div className="ap-sig-wrap">
                        <svg
                            ref={sigRef}
                            className="ap-sig-svg"
                            viewBox="0 0 300 110"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path data-stroke="1" d="M14 36 C14 24, 32 18, 42 28 C52 38, 44 50, 28 53 C12 56, 8 68, 18 76 C28 84, 48 80, 52 68" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path data-stroke="1" d="M62 44 C60 60, 62 72, 72 72 C82 72, 86 60, 84 46 L84 72" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path data-stroke="1" d="M96 44 L94 88 M94 44 C102 34, 118 34, 120 50 C122 64, 112 72, 100 66" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path data-stroke="1" d="M130 56 L130 72 M130 56 C136 46, 148 42, 152 52" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path data-stroke="1" d="M160 50 C160 38, 176 34, 180 46 C182 56, 174 72, 162 70 C170 70, 180 68, 182 72" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path data-stroke="1" d="M192 30 L192 72 M184 52 L202 52" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path data-stroke="1" d="M212 56 L212 72" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                            <path data-stroke="1" d="M222 36 L222 72 M236 54 L222 62 M226 58 L240 72" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path data-stroke="1" d="M10 90 C70 100, 180 86, 248 94" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                        </svg>

                        <div ref={nibRef} className="ap-nib">
                            <div className="ap-nib-inner" />
                            <div className="ap-nib-glow" />
                        </div>
                    </div>

                    <div className="ap-cta-row">
                        <a 
                            href="/contact" 
                            className="ap-cta-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                if (pathname === '/contact') return;
                                navigateWithTransition('/contact');
                            }}
                        >
                            <span>SAY HELLO</span>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </a>
                        <a href="mailto:storyfinder@gmail.com" className="ap-email">storyfinder@gmail.com</a>
                    </div>

                </div>

            </div>
        </section>
    );
}
