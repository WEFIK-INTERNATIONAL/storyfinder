'use client';
import './gallery.css';
import { useRef, useMemo } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useViewTransition } from '@/hooks/useViewTransition';
import { useMobile } from '@/hooks/useMobile';
import Image from 'next/image';
import Footer from '@/components/layout/footer/Footer';

gsap.registerPlugin(useGSAP);

const GalleryClient = ({ galleries }) => {
    const { isMobileOrTablet } = useMobile();
    const { navigateWithTransition } = useViewTransition();

    const workPageContainer = useRef(null);

    const workItems = galleries;

    useGSAP(
        () => {
            const q = gsap.utils.selector(workPageContainer);
            const folders = q('.folder');
            const folderWrappers = q('.folder-wrapper');

            let isMobile = window.innerWidth < 1000;

            const setInitialPositions = () => {
                gsap.set(folderWrappers, { y: isMobile ? 0 : 25 });
            };

            const mouseEnterHandlers = new Map();
            const mouseLeaveHandlers = new Map();

            folders.forEach((folder, index) => {
                const previewImages = folder.querySelectorAll(
                    '.folder-preview-img'
                );

                const onEnter = () => {
                    if (isMobile) return;

                    folders.forEach((siblingFolder) => {
                        if (siblingFolder !== folder) {
                            siblingFolder.classList.add('disabled');
                        }
                    });

                    gsap.to(folderWrappers[index], {
                        y: 0,
                        duration: 0.25,
                        ease: 'back.out(1.7)',
                    });

                    previewImages.forEach((img, imgIndex) => {
                        let rotation;
                        if (imgIndex === 0) {
                            rotation = gsap.utils.random(-20, -10);
                        } else if (imgIndex === 1) {
                            rotation = gsap.utils.random(-10, 10);
                        } else {
                            rotation = gsap.utils.random(10, 20);
                        }

                        gsap.to(img, {
                            y: '-100%',
                            rotation,
                            duration: 0.25,
                            ease: 'back.out(1.7)',
                            delay: imgIndex * 0.025,
                        });
                    });
                };

                const onLeave = () => {
                    if (isMobile) return;

                    folders.forEach((siblingFolder) => {
                        siblingFolder.classList.remove('disabled');
                    });

                    gsap.to(folderWrappers[index], {
                        y: 25,
                        duration: 0.25,
                        ease: 'back.out(1.7)',
                    });

                    previewImages.forEach((img, imgIndex) => {
                        gsap.to(img, {
                            y: '0%',
                            rotation: 0,
                            duration: 0.25,
                            ease: 'back.out(1.7)',
                            delay: imgIndex * 0.05,
                        });
                    });
                };

                mouseEnterHandlers.set(folder, onEnter);
                mouseLeaveHandlers.set(folder, onLeave);
                folder.addEventListener('mouseenter', onEnter);
                folder.addEventListener('mouseleave', onLeave);
            });

            const handleResize = () => {
                if (!workPageContainer.current) return;
                const currentBreakpoint = window.innerWidth < 1000;
                if (currentBreakpoint !== isMobile) {
                    isMobile = currentBreakpoint;
                    setInitialPositions();

                    folders.forEach((folder) => {
                        folder.classList.remove('disabled');
                    });
                    const allPreviewImages = q('.folder-preview-img');
                    if (allPreviewImages && allPreviewImages.length) {
                        gsap.set(allPreviewImages, { y: '0%', rotation: 0 });
                    }
                }
            };

            window.addEventListener('resize', handleResize);
            setInitialPositions();

            return () => {
                window.removeEventListener('resize', handleResize);
                folders.forEach((folder) => {
                    const onEnter = mouseEnterHandlers.get(folder);
                    const onLeave = mouseLeaveHandlers.get(folder);
                    if (onEnter)
                        folder.removeEventListener('mouseenter', onEnter);
                    if (onLeave)
                        folder.removeEventListener('mouseleave', onLeave);
                });
            };
        },
        { scope: workPageContainer }
    );

    return (
        <>
            <section className="folders" ref={workPageContainer}>
                {[0, 1, 2].map((rowIndex) => (
                    <div className="row" key={`row-${rowIndex}`}>
                        {workItems
                            .slice(rowIndex * 2, rowIndex * 2 + 2)
                            .map((item) => (
                                <a
                                    key={item.index}
                                    href={item.href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigateWithTransition(item.href);
                                    }}
                                >
                                    <div className={`folder ${item.variant}`}>
                                        <div className="folder-preview">
                                            {item.images.map((imgData, i) => (
                                                <div
                                                    className="folder-preview-img"
                                                    key={`${item.index}-img-${i}`}
                                                >
                                                    <Image
                                                        src={imgData.src}
                                                        alt={imgData.title}
                                                        fill
                                                        sizes="(max-width: 1000px) 0vw, 250px"
                                                        placeholder={
                                                            imgData.lqip
                                                                ? 'blur'
                                                                : 'empty'
                                                        }
                                                        blurDataURL={
                                                            imgData.lqip
                                                        }
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="folder-wrapper">
                                            <div className="folder-index">
                                                <p>{item.index}</p>
                                            </div>
                                            <div className="folder-name">
                                                <h1>{item.name}</h1>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                    </div>
                ))}
            </section>
            {isMobileOrTablet && <Footer />}
        </>
    );
};

export default GalleryClient;
