'use client';
import './contact.css';
import { useEffect, useRef } from 'react';
import Copy from '@/components/ui/copy/Copy';
import Link from 'next/link';

const Contact = () => {
    const screensaverRef = useRef(null);
    const animationIdRef = useRef(null);
    const timeoutIdRef = useRef(null); // ✅ Fix 1: track setTimeout for cleanup
    const containerRef = useRef(null);
    const cachedRectRef = useRef(null); // ✅ Fix 4: cache getBoundingClientRect

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const existingScreensavers = container.querySelectorAll('.screensaver');
        existingScreensavers.forEach((el) => {
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });

        const config = {
            speed: 3,
            imageCount: 10,
            size: 300,
            changeDirectionDelay: 20,
            edgeOffset: -40,
        };

        let isDesktop = window.innerWidth >= 1000;
        let screensaverElement = null;

        const preloadedImages = [];

        const preloadImages = () => {
            return new Promise((resolve) => {
                let loadedCount = 0;

                const handleLoad = () => {
                    loadedCount++;
                    if (loadedCount === config.imageCount) resolve();
                };

                for (let i = 1; i <= config.imageCount; i++) {
                    const img = new Image();
                    img.onload = handleLoad;
                    img.onerror = handleLoad; // ✅ Fix 2: handle image load failures so promise always resolves
                    img.src = `/objects/obj-${i}.png`;
                    preloadedImages.push(img);
                }
            });
        };

        const stopAnimation = () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
                animationIdRef.current = null;
            }

            // ✅ Fix 1: clear pending timeout on stop
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = null;
            }

            if (screensaverElement && screensaverElement.parentNode) {
                screensaverElement.parentNode.removeChild(screensaverElement);
                screensaverElement = null;
            }

            if (screensaverRef.current && screensaverRef.current.parentNode) {
                screensaverRef.current.parentNode.removeChild(
                    screensaverRef.current
                );
                screensaverRef.current = null;
            }

            const leftoverScreensavers =
                container?.querySelectorAll('.screensaver') || [];
            leftoverScreensavers.forEach((el) => {
                if (el && el.parentNode) el.parentNode.removeChild(el);
            });

            cachedRectRef.current = null; // ✅ Fix 4: clear cached rect on stop
        };

        const startAnimation = async () => {
            if (!isDesktop) return;

            stopAnimation();
            await preloadImages();
            stopAnimation();

            screensaverElement = document.createElement('div');
            screensaverElement.classList.add('screensaver');
            screensaverElement.setAttribute(
                'data-timestamp',
                Date.now().toString()
            );
            container.appendChild(screensaverElement);
            screensaverRef.current = screensaverElement;

            // ✅ Fix 4: cache the rect once at start; update only on resize
            cachedRectRef.current = container.getBoundingClientRect();
            let posX = cachedRectRef.current.width / 2 - config.size / 2;
            let posY = cachedRectRef.current.height / 2 - config.size / 2;

            let velX = (Math.random() > 0.5 ? 1 : -1) * config.speed;
            let velY = (Math.random() > 0.5 ? 1 : -1) * config.speed;

            let currentImageIndex = 1;

            screensaverElement.style.width = `${config.size}px`;
            screensaverElement.style.height = `${config.size}px`;
            screensaverElement.style.backgroundImage = `url(/objects/obj-${currentImageIndex}.png)`;
            screensaverElement.style.left = `${posX}px`;
            screensaverElement.style.top = `${posY}px`;

            const changeImage = () => {
                currentImageIndex = (currentImageIndex % config.imageCount) + 1;
                screensaverElement.style.backgroundImage = `url(/objects/obj-${currentImageIndex}.png)`;
            };

            let canChangeDirection = true;

            const animate = () => {
                if (
                    !screensaverElement ||
                    !screensaverElement.parentNode ||
                    !isDesktop ||
                    (container &&
                        container.getElementsByClassName('screensaver').length >
                            1)
                ) {
                    stopAnimation();
                    return;
                }

                // ✅ Fix 4: use cached rect instead of calling getBoundingClientRect every frame
                const containerRect = cachedRectRef.current;

                posX += velX;
                posY += velY;

                const leftEdge = config.edgeOffset;
                const rightEdge =
                    containerRect.width -
                    config.size +
                    Math.abs(config.edgeOffset);
                const topEdge = config.edgeOffset;
                const bottomEdge =
                    containerRect.height -
                    config.size +
                    Math.abs(config.edgeOffset);

                if (posX <= leftEdge || posX >= rightEdge) {
                    if (canChangeDirection) {
                        velX = -velX;
                        changeImage();
                        posX = posX <= leftEdge ? leftEdge : rightEdge;

                        canChangeDirection = false;
                        // ✅ Fix 1: store timeout ID so it can be cleared on unmount
                        timeoutIdRef.current = setTimeout(() => {
                            canChangeDirection = true;
                        }, config.changeDirectionDelay);
                    }
                }

                if (posY <= topEdge || posY >= bottomEdge) {
                    if (canChangeDirection) {
                        velY = -velY;
                        changeImage();
                        posY = posY <= topEdge ? topEdge : bottomEdge;

                        canChangeDirection = false;
                        // ✅ Fix 1: store timeout ID so it can be cleared on unmount
                        timeoutIdRef.current = setTimeout(() => {
                            canChangeDirection = true;
                        }, config.changeDirectionDelay);
                    }
                }

                screensaverElement.style.left = `${posX}px`;
                screensaverElement.style.top = `${posY}px`;

                animationIdRef.current = requestAnimationFrame(animate);
            };

            animationIdRef.current = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            const wasDesktop = isDesktop;
            isDesktop = window.innerWidth >= 1000;

            // ✅ Fix 4: update cached rect on resize so bounce boundaries stay accurate
            if (cachedRectRef.current) {
                cachedRectRef.current = container.getBoundingClientRect();
            }

            if (isDesktop && !wasDesktop) {
                startAnimation();
            } else if (!isDesktop && wasDesktop) {
                stopAnimation();
            }
        };

        window.addEventListener('resize', handleResize);

        if (isDesktop) {
            startAnimation();
        }

        return () => {
            stopAnimation();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <section className="contact screensaver-container" ref={containerRef}>
            <div className="contact-copy">
                <div className="contact-col">
                    <Copy delay={0.8}>
                        <h2 className="font-big">
                            Still frames hold moving memories
                        </h2>
                    </Copy>
                </div>

                <div className="contact-col">
                    <div className="contact-group">
                        <Copy delay={0.8}>
                            <p className="sm font-body">Focus</p>
                            <p>Light Sculpting</p>
                            <p>Moment Crafting</p>
                            <p>Visual Alchemy</p>
                        </Copy>
                    </div>

                    <div className="contact-group">
                        <Copy delay={1.2}>
                            <p className="sm">Contact</p>
                            <p>Kolkata, India</p>
                            <Link
                                href={'mailto:supratik@gmail.com'}
                                className="text-[1.25rem] font-normal leading-1.2"
                            >
                                supratik@gmail.com
                            </Link>
                            <Link
                                href={'tel:+91 8167084856'}
                                className="text-[1.25rem] font-normal leading-1.2"
                            >
                                +91 8167084856
                            </Link>
                        </Copy>
                    </div>

                    <div className="contact-mail"></div>

                    <div className="contact-group">
                        <Copy delay={1.4}>
                            <p className="sm">Credits</p>
                            <a
                                className="text-[1.25rem] font-normal leading-1.2"
                                href="https://wefik.in"
                                target="_blank"
                            >
                                Created by Wefik
                            </a>
                            <p>Edition 2026</p>
                        </Copy>
                    </div>
                </div>
            </div>
            <div className="contact-footer">
                <div className="container">
                    <Copy delay={1.6} animateOnScroll={false}>
                        <p className="sm">Made by Wefik</p>
                    </Copy>

                    <div className="contact-socials">
                        <Copy delay={1.7} animateOnScroll={false}>
                            <a className="sm" href="#" target="_blank">
                                Instagram
                            </a>
                        </Copy>
                        <Copy delay={1.8} animateOnScroll={false}>
                            <a className="sm" href="#" target="_blank">
                                PIXEL
                            </a>
                        </Copy>
                        <Copy delay={1.9} animateOnScroll={false}>
                            <a className="sm" href="#" target="_blank">
                                Twitter
                            </a>
                        </Copy>
                    </div>

                    <Copy delay={2} animateOnScroll={false}>
                        <p className="sm">&copy; Storyfinder</p>
                    </Copy>
                </div>
            </div>
        </section>
    );
};

export default Contact;
