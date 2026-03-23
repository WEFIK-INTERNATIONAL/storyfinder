'use client';
import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { useLenis } from 'lenis/react';
import Image from 'next/image';
import { gsap, CustomEase, SplitText } from '@/lib/gsap';

CustomEase.create('hop', '0.9, 0, 0.1, 1');
export let isInitialLoad = true;

const IMAGES = [
    { src: '/preloader/preloader_1.jpg', priority: true },
    { src: '/preloader/preloader_2.jpg', priority: false },
    { src: '/preloader/preloader_3.jpg', priority: false },
    { src: '/preloader/preloader_4.jpg', priority: false },
];

const Preloader = () => {
    const [showPreloader, setShowPreloader] = useState(isInitialLoad);
    const [fontsReady, setFontsReady] = useState(false);
    const isAnimating = useRef(false);

    const preloaderRef = useRef(null);
    const progressRef = useRef(null);
    const imagesWrapRef = useRef(null);
    const imageRefs = useRef([]);
    const imgTagRefs = useRef([]);
    const h1Ref = useRef(null);

    const lenis = useLenis();
    useEffect(
        () => () => {
            isInitialLoad = false;
        },
        []
    );

    useEffect(() => {
        if (!lenis) return;
        if (isAnimating.current) {
            lenis.stop();
        } else {
            lenis.start();
        }
    }, [lenis, showPreloader, fontsReady]);

    useEffect(() => {
        if (!showPreloader) return;
        let cancelled = false;

        const load = async () => {
            try {
                await document.fonts.ready;
                await new Promise((r) => setTimeout(r, 100));
            } catch {
                await new Promise((r) => setTimeout(r, 200));
            }
            if (!cancelled) setFontsReady(true);
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [showPreloader]);

    useGSAP(
        () => {
            if (!showPreloader || !fontsReady) return;

            isAnimating.current = true;
            lenis?.stop();

            const h1 = h1Ref.current;
            const progress = progressRef.current;
            const imagesWrap = imagesWrapRef.current;
            const imageDivs = imageRefs.current.filter(Boolean);

            const imgEls = imgTagRefs.current
                .filter(Boolean)
                .map((el) => el.querySelector('img'))
                .filter(Boolean);

            gsap.set(progress, { scaleX: 0, transformOrigin: 'left' });
            gsap.set(imageDivs, {
                clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
            });
            gsap.set(imgEls, { scale: 2 });
            gsap.set(imagesWrap, {
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            });

            const split = SplitText.create(h1, {
                type: 'chars',
                charsClass: 'char',
                mask: 'chars',
            });

            const { chars } = split;
            gsap.set(chars, { yPercent: (i) => (i % 2 === 0 ? -100 : 100) });
            gsap.set(h1, { opacity: 1 });
            const tl = gsap.timeline({ delay: 0.25 });

            tl.to(progress, { scaleX: 1, duration: 4, ease: 'power3.inOut' })
                .set(progress, { transformOrigin: 'right' })
                .to(progress, { scaleX: 0, duration: 1, ease: 'power3.in' });

            imageDivs.forEach((div, i) => {
                tl.to(
                    div,
                    {
                        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                        duration: 1,
                        ease: 'hop',
                        delay: i * 0.75,
                    },
                    '-=5'
                );
            });

            imgEls.forEach((img, i) => {
                tl.to(
                    img,
                    {
                        scale: 1,
                        duration: 1.5,
                        ease: 'hop',
                        delay: i * 0.75,
                    },
                    '-=5.25'
                );
            });

            tl.to(
                chars,
                { yPercent: 0, duration: 1, ease: 'hop', stagger: 0.025 },
                '-=5'
            );

            tl.to(
                imagesWrap,
                {
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
                    duration: 1,
                    ease: 'hop',
                },
                '-=1.5'
            );

            tl.to(
                chars,
                {
                    yPercent: (i) => (i % 2 === 0 ? 100 : -100),
                    duration: 1,
                    ease: 'hop',
                    stagger: 0.025,
                },
                '-=2.5'
            );

            tl.to(
                preloaderRef.current,
                {
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
                    duration: 1.75,
                    ease: 'hop',
                    onStart: () => {
                        gsap.set(preloaderRef.current, {
                            pointerEvents: 'none',
                        });
                    },
                    onComplete: () => {
                        gsap.set(h1, { opacity: 0 });
                        isAnimating.current = false;
                        lenis?.start();
                        split.revert();
                        setShowPreloader(false);
                        window.dispatchEvent(
                            new CustomEvent('preloader:complete')
                        );
                    },
                },
                '-=0.5'
            );
        },
        { dependencies: [showPreloader, fontsReady] }
    );

    if (!showPreloader) return null;

    return (
        <>
            <div
                ref={preloaderRef}
                className="fixed inset-0 w-full h-svh overflow-hidden bg-[#1a1614] z-100 will-change-[clip-path]"
                style={{
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                }}
            >
                <div
                    ref={progressRef}
                    className="absolute top-0 left-0 w-full h-1.75 bg-[#ff6e14] will-change-transform"
                    style={{ transform: 'scaleX(0)', transformOrigin: 'left' }}
                />

                <div
                    ref={imagesWrapRef}
                    className="absolute overflow-hidden top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 max-md:w-[20rem] max-md:h-80 will-change-[clip-path]"
                    style={{
                        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    }}
                >
                    {IMAGES.map(({ src, priority }, i) => (
                        <div
                            key={src}
                            ref={(el) => {
                                imageRefs.current[i] = el;
                            }}
                            className="absolute inset-0 w-full h-full overflow-hidden rounded-xl will-change-[clip-path]"
                            style={{
                                clipPath:
                                    'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                            }}
                        >
                            <div
                                ref={(el) => {
                                    imgTagRefs.current[i] = el;
                                }}
                                className="absolute inset-0"
                            >
                                <Image
                                    src={src}
                                    alt=""
                                    fill
                                    priority={priority}
                                    sizes="(max-width: 768px) 20rem, 25rem"
                                    className="object-cover will-change-transform"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="fixed top-0 w-full flex justify-center items-center translate-y-[60svh] will-change-transform z-200">
                <h1
                    ref={h1Ref}
                    style={{ opacity: 0 }}
                    className="uppercase leading-none select-none text-[8rem] tracking-[-0.5rem] font-black text-[#e3e3db] font-big max-lg:text-[3rem] max-lg:tracking-normal"
                >
                    StoryFinder
                </h1>
            </div>
        </>
    );
};

export default Preloader;
