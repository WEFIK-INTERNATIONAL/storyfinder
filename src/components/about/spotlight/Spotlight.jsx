'use client';
import './Spotlight.css';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Spotlight = () => {
    const spotlightRef = useRef(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add(
                {
                    isDesktop: '(min-width: 1001px)',
                    isMobile: '(max-width: 1000px)',
                },
                (context) => {
                    const { isMobile } = context.conditions;

                    const initSpotlight = () => {
                        new SplitType('.marquee-text-item h1', {
                            types: 'chars',
                        });

                        document
                            .querySelectorAll('.marquee-container')
                            .forEach((container, index) => {
                                const marquee =
                                    container.querySelector('.marquee');
                                const chars =
                                    container.querySelectorAll('.char');

                                gsap.to(marquee, {
                                    x: isMobile
                                        ? index % 2 === 0
                                            ? '10%'
                                            : '-60%'
                                        : index % 2 === 0
                                          ? '5%'
                                          : '-15%',
                                    scrollTrigger: {
                                        trigger: container,
                                        start: 'top bottom',
                                        end: isMobile ? '300% top' : '150% top',
                                        scrub: true,
                                    },
                                    force3D: true,
                                });

                                gsap.fromTo(
                                    chars,
                                    { fontWeight: 100 },
                                    {
                                        fontWeight: 900,
                                        duration: 1,
                                        ease: 'none',
                                        stagger: {
                                            each: 0.35,
                                            from:
                                                index % 2 === 0
                                                    ? 'end'
                                                    : 'start',
                                            ease: 'linear',
                                        },
                                        scrollTrigger: {
                                            trigger: container,
                                            start: isMobile
                                                ? 'top 90%'
                                                : '50% bottom',
                                            end: isMobile
                                                ? 'top 10%'
                                                : 'top top',
                                            scrub: true,
                                        },
                                    }
                                );
                            });

                        ScrollTrigger.refresh();
                    };

                    setTimeout(initSpotlight, 100);
                }
            );

            return () => {
                mm.revert();
            };
        },
        { scope: spotlightRef }
    );

    return (
        <section className="spotlight" ref={spotlightRef}>
            {}
            <div className="spotlight-header">
                <span className="spotlight-index">04 — Spotlight</span>
                <span className="spotlight-label">Selected Works</span>
            </div>

            {}
            <div className="marquees">
                <div className="marquee-container" id="marquee-1">
                    <div className="marquee">
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_1.jpg"
                                alt="Portrait 1"
                                fill
                                sizes="280px"
                            />
                        </div>
                        <div className="marquee-img-item marquee-text-item">
                            <h1>Portraits</h1>
                        </div>
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_2.jpg"
                                alt="Portrait 2"
                                fill
                                sizes="280px"
                            />
                        </div>
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_3.jpg"
                                alt="Portrait 3"
                                fill
                                sizes="280px"
                            />
                        </div>
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_4.jpg"
                                alt="Portrait 4"
                                fill
                                sizes="280px"
                            />
                        </div>
                    </div>
                </div>

                <div className="marquee-container" id="marquee-2">
                    <div className="marquee">
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_5.jpg"
                                alt="Wildlife 1"
                                fill
                                sizes="280px"
                            />
                        </div>
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_6.jpg"
                                alt="Wildlife 2"
                                fill
                                sizes="280px"
                            />
                        </div>
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_7.jpg"
                                alt="Wildlife 3"
                                fill
                                sizes="280px"
                            />
                        </div>
                        <div className="marquee-img-item marquee-text-item">
                            <h1>Nature</h1>
                        </div>
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_8.jpg"
                                alt="Wildlife 4"
                                fill
                                sizes="280px"
                            />
                        </div>
                    </div>
                </div>

                <div className="marquee-container" id="marquee-3">
                    <div className="marquee">
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_9.jpg"
                                alt="Landscape 1"
                                fill
                                sizes="280px"
                            />
                        </div>
                        <div className="marquee-img-item marquee-text-item">
                            <h1>Travel</h1>
                        </div>
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_10.jpg"
                                alt="Landscape 2"
                                fill
                                sizes="280px"
                            />
                        </div>
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_11.jpg"
                                alt="Landscape 3"
                                fill
                                sizes="280px"
                            />
                        </div>
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_12.jpg"
                                alt="Landscape 4"
                                fill
                                sizes="280px"
                            />
                        </div>
                    </div>
                </div>

                <div className="marquee-container" id="marquee-4">
                    <div className="marquee">
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_14.jpg"
                                alt="Location 1"
                                fill
                                sizes="280px"
                            />
                        </div>
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_13.jpg"
                                alt="Location 2"
                                fill
                                sizes="280px"
                            />
                        </div>
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_15.jpg"
                                alt="Location 3"
                                fill
                                sizes="280px"
                            />
                        </div>
                        <div className="marquee-img-item marquee-text-item">
                            <h1>Street</h1>
                        </div>
                        <div className="marquee-img-item">
                            <Image
                                src="/spotlight/spotlight_16.jpg"
                                alt="Location 4"
                                fill
                                sizes="280px"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Spotlight;
