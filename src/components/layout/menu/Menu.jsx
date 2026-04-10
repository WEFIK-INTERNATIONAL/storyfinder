'use client';
import './Menu.css';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { useLenis } from 'lenis/react';
import { useViewTransition } from '@/hooks/useViewTransition';
import { gsap, SplitText } from '@/lib/gsap';
import { usePathname } from 'next/navigation';
import StoryfinderLogo from '@/components/icons/StoryFinderLogo';
import Link from 'next/link';
import Image from 'next/image';
import { useSoundStore } from '@/store/useSoundStore';

gsap.registerPlugin(useGSAP);

const MENU_ITEMS = [
    { label: 'Home', route: '/' },
    { label: 'About', route: '/about' },
    { label: 'Gallery', route: '/gallery' },
    { label: 'Retouch', route: '/before-after' },
    { label: 'Blog', route: '/blog' },
    { label: 'Stories', route: '/featured' },
    { label: 'Contact', route: '/contact' },
];

const LERP_FACTOR = 0.05;
const MOBILE_BREAKPOINT = 1000;

const Menu = ({ pageRef }) => {
    const navToggleRef = useRef(null);
    const menuOverlayRef = useRef(null);
    const menuImageRef = useRef(null);
    const menuLinksWrapperRef = useRef(null);
    const linkHighlighterRef = useRef(null);
    const openLabelRef = useRef(null);
    const closeLabelRef = useRef(null);
    const menuLinksRef = useRef([]);
    const menuLinkContainersRef = useRef([]);
    const menuColsRef = useRef([]);

    const splitTextInstances = useRef([]);
    const menuColSplitTextInstances = useRef([]);

    const currentX = useRef(0);
    const targetX = useRef(0);
    const currentHighlighterX = useRef(0);
    const targetHighlighterX = useRef(0);
    const currentHighlighterWidth = useRef(0);
    const targetHighlighterWidth = useRef(0);
    const animationFrameRef = useRef(null);

    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuAnimating, setIsMenuAnimating] = useState(false);

    const lenis = useLenis();
    const { navigateWithTransition } = useViewTransition();

    useEffect(() => {
        if (isMenuOpen) return;

        const menuCols = menuColsRef.current;
        if (!menuCols.length) return;

        menuColSplitTextInstances.current.forEach(({ instance }) => {
            instance.revert();
        });
        menuColSplitTextInstances.current = [];

        menuCols.forEach((col) => {
            if (!col) return;
            col.querySelectorAll('p, a').forEach((el) => {
                const split = SplitText.create(el, {
                    type: 'lines',
                    mask: 'lines',
                    linesClass: 'split-line',
                });
                menuColSplitTextInstances.current.push({
                    instance: split,
                    lines: split.lines,
                });

                gsap.set(split.lines, { y: '100%' });
            });
        });
    }, [isMenuOpen]);

    useEffect(() => {
        if (!isMenuOpen) {
            cancelAnimationFrame(animationFrameRef.current);
            return;
        }

        const tick = () => {
            currentX.current +=
                (targetX.current - currentX.current) * LERP_FACTOR;
            currentHighlighterX.current +=
                (targetHighlighterX.current - currentHighlighterX.current) *
                LERP_FACTOR;
            currentHighlighterWidth.current +=
                (targetHighlighterWidth.current -
                    currentHighlighterWidth.current) *
                LERP_FACTOR;

            gsap.set(menuLinksWrapperRef.current, { x: currentX.current });
            gsap.set(linkHighlighterRef.current, {
                x: currentHighlighterX.current,
                width: currentHighlighterWidth.current,
            });

            animationFrameRef.current = requestAnimationFrame(tick);
        };

        animationFrameRef.current = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [isMenuOpen]);

    useGSAP(
        () => {
            const menuLinks = menuLinksRef.current;
            const menuOverlay = menuOverlayRef.current;
            const menuLinksWrapper = menuLinksWrapperRef.current;
            const linkHighlighter = linkHighlighterRef.current;
            const menuImage = menuImageRef.current;
            const menuLinkContainers = menuLinkContainersRef.current;

            splitTextInstances.current.forEach((s) => s.revert());
            splitTextInstances.current = [];

            menuLinks.forEach((link) => {
                if (!link) return;
                link.querySelectorAll('span').forEach((span, i) => {
                    const split = SplitText.create(span, { type: 'chars' });
                    splitTextInstances.current.push(split);
                    split.chars.forEach((c) => c.classList.add('char'));
                    if (i === 1) gsap.set(split.chars, { y: '110%' });
                });
            });

            gsap.set(menuImage, { y: 0, scale: 0.5, opacity: 0.25 });
            gsap.set(menuLinks, { y: '150%' });
            gsap.set(linkHighlighter, { y: '150%' });

            const firstLinkSpan = menuLinksWrapper.querySelector(
                '.menu-link:first-child a span'
            );
            if (firstLinkSpan) {
                const firstLink = menuLinksWrapper.querySelector(
                    '.menu-link:first-child'
                );
                const linkWidth = firstLinkSpan.offsetWidth;
                const wrapperRect = menuLinksWrapper.getBoundingClientRect();
                const initialX =
                    firstLink.getBoundingClientRect().left - wrapperRect.left;

                linkHighlighter.style.width = `${linkWidth}px`;
                currentHighlighterWidth.current = linkWidth;
                targetHighlighterWidth.current = linkWidth;
                currentHighlighterX.current = initialX;
                targetHighlighterX.current = initialX;
            }

            const handleMouseMove = (e) => {
                if (window.innerWidth < MOBILE_BREAKPOINT) return;

                const vw = window.innerWidth;
                const maxMoveRight = vw - menuLinksWrapper.offsetWidth;
                const range = vw * 0.5;
                const startX = (vw - range) / 2;
                const endX = startX + range;

                const pct =
                    e.clientX <= startX
                        ? 0
                        : e.clientX >= endX
                          ? 1
                          : (e.clientX - startX) / range;

                targetX.current = pct * maxMoveRight;
            };

            const cleanupFns = new Map();

            menuLinkContainers.forEach((link) => {
                if (!link) return;

                const onEnter = () => {
                    if (window.innerWidth < MOBILE_BREAKPOINT) return;

                    const [visibleSpan, animatedSpan] =
                        link.querySelectorAll('a span');
                    if (!visibleSpan || !animatedSpan) return;

                    gsap.to(visibleSpan.querySelectorAll('.char'), {
                        y: '-110%',
                        stagger: 0.05,
                        duration: 0.5,
                        ease: 'expo.inOut',
                    });
                    gsap.to(animatedSpan.querySelectorAll('.char'), {
                        y: '0%',
                        stagger: 0.05,
                        duration: 0.5,
                        ease: 'expo.inOut',
                    });

                    const wrapperRect =
                        menuLinksWrapper.getBoundingClientRect();
                    targetHighlighterX.current =
                        link.getBoundingClientRect().left - wrapperRect.left;
                    targetHighlighterWidth.current =
                        link.querySelector('a span')?.offsetWidth ??
                        link.offsetWidth;
                };

                const onLeave = () => {
                    if (window.innerWidth < MOBILE_BREAKPOINT) return;

                    const [visibleSpan, animatedSpan] =
                        link.querySelectorAll('a span');
                    if (!visibleSpan || !animatedSpan) return;

                    gsap.to(animatedSpan.querySelectorAll('.char'), {
                        y: '110%',
                        stagger: 0.05,
                        duration: 0.5,
                        ease: 'expo.inOut',
                    });
                    gsap.to(visibleSpan.querySelectorAll('.char'), {
                        y: '0%',
                        stagger: 0.05,
                        duration: 0.5,
                        ease: 'expo.inOut',
                    });
                };

                link.addEventListener('mouseenter', onEnter);
                link.addEventListener('mouseleave', onLeave);
                cleanupFns.set(link, { onEnter, onLeave });
            });

            const onWrapperLeave = () => {
                const firstLink = menuLinksWrapper.querySelector(
                    '.menu-link:first-child'
                );
                const firstSpan = firstLink?.querySelector('a span');
                if (!firstLink || !firstSpan) return;

                const wrapperRect = menuLinksWrapper.getBoundingClientRect();
                targetHighlighterX.current =
                    firstLink.getBoundingClientRect().left - wrapperRect.left;
                targetHighlighterWidth.current = firstSpan.offsetWidth;
            };

            menuOverlay.addEventListener('mousemove', handleMouseMove);
            menuLinksWrapper.addEventListener('mouseleave', onWrapperLeave);

            return () => {
                cancelAnimationFrame(animationFrameRef.current);
                menuOverlay.removeEventListener('mousemove', handleMouseMove);
                menuLinksWrapper.removeEventListener(
                    'mouseleave',
                    onWrapperLeave
                );

                cleanupFns.forEach(({ onEnter, onLeave }, link) => {
                    link.removeEventListener('mouseenter', onEnter);
                    link.removeEventListener('mouseleave', onLeave);
                });
                cleanupFns.clear();

                splitTextInstances.current.forEach((s) => s?.revert?.());
                splitTextInstances.current = [];
            };
        },
        { scope: menuOverlayRef }
    );

    useEffect(() => {
        if (!lenis) return;
        isMenuOpen ? lenis.stop() : lenis.start();
    }, [lenis, isMenuOpen]);

    const toggleMenu = useCallback(() => {
        if (isMenuAnimating) return;
        setIsMenuAnimating(true);

        const menuOverlay = menuOverlayRef.current;
        const menuImage = menuImageRef.current;
        const menuLinks = menuLinksRef.current;
        const linkHighlighter = linkHighlighterRef.current;
        const menuLinksWrapper = menuLinksWrapperRef.current;
        const openLabel = openLabelRef.current;
        const closeLabel = closeLabelRef.current;
        const menuCols = menuColsRef.current;

        if (!isMenuOpen) {
            gsap.to([openLabel, closeLabel], {
                y: '-100%',
                duration: 1,
                ease: 'power3.out',
            });

            gsap.to(menuOverlay, {
                clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
                duration: 1.25,
                ease: 'expo.out',
                onComplete: () => {
                    gsap.set(menuLinkContainersRef.current, {
                        overflow: 'visible',
                    });
                    setIsMenuOpen(true);
                    setIsMenuAnimating(false);
                },
            });

            gsap.to(menuImage, {
                scale: 1,
                opacity: 1,
                duration: 1.5,
                ease: 'expo.out',
            });

            gsap.to(menuLinks, {
                y: '0%',
                duration: 1.25,
                stagger: 0.1,
                delay: 0.25,
                ease: 'expo.out',
            });

            gsap.to(linkHighlighter, {
                y: '0%',
                duration: 1,
                delay: 1,
                ease: 'expo.out',
            });

            menuCols.forEach((col) => {
                if (!col) return;
                gsap.to(col.querySelectorAll('.split-line'), {
                    y: '0%',
                    duration: 1,
                    stagger: 0.05,
                    delay: 0.5,
                    ease: 'expo.out',
                });
            });
        } else {
            gsap.to([openLabel, closeLabel], {
                y: '0%',
                duration: 1,
                ease: 'power3.out',
            });

            gsap.to(menuImage, {
                y: '-25svh',
                opacity: 0.5,
                duration: 1.25,
                ease: 'expo.out',
            });

            menuCols.forEach((col) => {
                if (!col) return;
                gsap.to(col.querySelectorAll('.split-line'), {
                    y: '-100%',
                    duration: 1,
                    stagger: 0,
                    ease: 'expo.out',
                });
            });

            gsap.to(menuOverlay, {
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
                duration: 1.25,
                ease: 'expo.out',
                onComplete: () => {
                    gsap.set(menuOverlay, {
                        clipPath:
                            'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                    });
                    gsap.set(menuLinks, { y: '150%' });
                    gsap.set(linkHighlighter, { y: '150%' });
                    gsap.set(menuImage, { y: '0', scale: 0.5, opacity: 0.25 });
                    gsap.set(menuLinkContainersRef.current, {
                        overflow: 'hidden',
                    });

                    menuCols.forEach((col) => {
                        if (!col) return;
                        gsap.set(col.querySelectorAll('.split-line'), {
                            y: '100%',
                        });
                    });

                    gsap.set(menuLinksWrapper, { x: 0 });
                    currentX.current = 0;
                    targetX.current = 0;

                    setIsMenuOpen(false);
                    setIsMenuAnimating(false);
                },
            });
        }
    }, [isMenuAnimating, isMenuOpen]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                toggleMenu();
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isMenuOpen, toggleMenu]);

    const prevPathnameRef = useRef(pathname);
    useEffect(() => {
        if (prevPathnameRef.current !== pathname) {
            prevPathnameRef.current = pathname;
            if (isMenuOpen) {
                const menuOverlay = menuOverlayRef.current;
                const menuLinks = menuLinksRef.current;
                const linkHighlighter = linkHighlighterRef.current;
                const menuImage = menuImageRef.current;
                const menuLinksWrapper = menuLinksWrapperRef.current;
                const openLabel = openLabelRef.current;
                const closeLabel = closeLabelRef.current;

                gsap.killTweensOf([
                    menuOverlay,
                    menuImage,
                    ...menuLinks,
                    linkHighlighter,
                    openLabel,
                    closeLabel,
                ]);

                gsap.set(menuOverlay, {
                    clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                });
                gsap.set(menuLinks, { y: '150%' });
                gsap.set(linkHighlighter, { y: '150%' });
                gsap.set(menuImage, { y: '0', scale: 0.5, opacity: 0.25 });
                gsap.set(menuLinksWrapper, { x: 0 });
                gsap.set([openLabel, closeLabel], { y: '0%' });
                gsap.set(menuLinkContainersRef.current, { overflow: 'hidden' });

                menuColsRef.current.forEach((col) => {
                    if (!col) return;
                    gsap.set(col.querySelectorAll('.split-line'), {
                        y: '100%',
                    });
                });

                currentX.current = 0;
                targetX.current = 0;
                setTimeout(() => {
                    setIsMenuOpen(false);
                    setIsMenuAnimating(false);
                }, 0);
            }
        }
    }, [pathname, isMenuOpen]);

    const { enabled: soundEnabled, toggleSound } = useSoundStore();

    return (
        <>
            <nav className="">
                <div className="flex gap-4 items-center">
                    <div
                        className="nav-logo"
                        style={{ mixBlendMode: 'difference' }}
                    >
                        <Link
                            href="/"
                            className="flex w-fit flex-row gap-2 items-center"
                            onClick={(e) => {
                                e.preventDefault();
                                if (pathname === '/') return;
                                navigateWithTransition(
                                    '/',
                                    isMenuOpen ? toggleMenu : null
                                );
                            }}
                        >
                            <StoryfinderLogo width={32} height={32} />
                            <div className="hidden sm:block font-accent font-bold text-xl text-white">
                                StoryFinder
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="flex gap-3 items-center">
                    <button
                        className="nav-sound-toggle"
                        type="button"
                        aria-label={
                            soundEnabled ? 'Mute sounds' : 'Enable sounds'
                        }
                        aria-pressed={soundEnabled}
                        onClick={toggleSound}
                    >
                        <span className="nav-sound-indicator">
                            {[...Array(4)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`nav-sound-bar ${soundEnabled ? 'active' : ''}`}
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </span>
                        <span className="nav-sound-label font-display">
                            {soundEnabled ? 'ON' : 'OFF'}
                        </span>
                    </button>

                    <button
                        className="nav-toggle"
                        ref={navToggleRef}
                        aria-expanded={isMenuOpen}
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <div className="nav-toggle-wrapper font-accent">
                            <p ref={openLabelRef} className="open-label">
                                Menu
                            </p>
                            <p ref={closeLabelRef} className="close-label">
                                Close
                            </p>
                        </div>
                    </button>
                </div>
            </nav>
            <div className="menu-overlay" ref={menuOverlayRef}>
                <div className="menu-content font-body text-[#ccccc4]">
                    <div
                        className="menu-col"
                        ref={(el) => {
                            menuColsRef.current[0] = el;
                        }}
                    >
                        <div className="menu-content-group">
                            <p>&copy; StoryFinder</p>
                            <p>SECTOR V, SALT LAKE</p>
                            <p>Kolkata</p>
                        </div>
                        <div className="menu-content-group">
                            <p>THE MAN</p>
                            <p>SUPRATIK SAHIS</p>
                        </div>
                        <div className="menu-content-group">
                            <p>Say Hello</p>
                            <p>supratiksahis459@gmail.com</p>
                        </div>
                        <div className="menu-content-group">
                            <p>Hotline</p>
                            <p>+91 8167084856</p>
                        </div>
                    </div>

                    <div
                        className="menu-col"
                        ref={(el) => {
                            menuColsRef.current[1] = el;
                        }}
                    >
                        <div className="menu-content-group">
                            <p>Field Log</p>
                            <a
                                href="https://www.instagram.com/_storyfinder__"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Instagram
                            </a>
                            <a
                                href="https://www.pexels.com/@story-finder-269808633/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                PIXEL
                            </a>
                        </div>
                        <div className="menu-content-group">
                            <p>TAGLINE</p>
                            <p>Sometimes loneliness is the clearest lens.</p>
                        </div>
                        <div className="menu-content-group">
                            <p>Credits</p>
                            <p className="">
                                Made by
                                <a
                                    href="https://wefik.in"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#ff6e14]"
                                >
                                    Wefik
                                </a>
                            </p>
                            <p>MWT. JAN2026</p>
                        </div>
                    </div>
                </div>

                <div ref={menuImageRef} className="menu-img">
                    <Image
                        src="/stock/menu_img_v2.jpg"
                        alt="menu image"
                        fill={true}
                        sizes="250px"
                    />
                </div>
                <div
                    className="menu-links-wrapper font-big"
                    ref={menuLinksWrapperRef}
                >
                    {MENU_ITEMS.map((item, index) => (
                        <div
                            key={item.label}
                            className="menu-link"
                            ref={(el) => {
                                menuLinkContainersRef.current[index] = el;
                            }}
                        >
                            <Link
                                href={item.route}
                                ref={(el) => {
                                    menuLinksRef.current[index] = el;
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (pathname === item.route) {
                                        if (isMenuOpen) toggleMenu();
                                        return;
                                    }
                                    navigateWithTransition(
                                        item.route,
                                        isMenuOpen ? toggleMenu : null
                                    );
                                }}
                            >
                                <span>{item.label}</span>
                                <span>{item.label}</span>
                            </Link>
                        </div>
                    ))}

                    <div
                        className="link-highlighter"
                        ref={linkHighlighterRef}
                    />
                </div>
            </div>
        </>
    );
};

export default Menu;
