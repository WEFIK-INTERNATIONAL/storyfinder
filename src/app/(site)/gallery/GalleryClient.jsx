'use client';
import './gallery.css';
import { useRef, useMemo } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useViewTransition } from '@/hooks/useViewTransition';
import { useMobile } from '@/hooks/useMobile';
import Image from 'next/image';
import Footer from '@/components/layout/footer/Footer';
import { urlFor } from '@/lib/image';

gsap.registerPlugin(useGSAP);

const GalleryClient = ({ galleries }) => {
    const { isMobileOrTablet } = useMobile();
    const { navigateWithTransition } = useViewTransition();
    const workPageContainer = useRef(null);

    /* ================= Dynamic Items ================= */
    const workItems = useMemo(() => {
        if (!galleries || galleries.length === 0) return [];

        return galleries.map((g, i) => ({
            index: String(i + 1).padStart(2, '0'),
            name: g.title,
            href: `/gallery/${g.slug}`,
            variant: ['variant-1', 'variant-2', 'variant-3'][i % 3],
            images: g.coverImage
                ? [
                      urlFor(g.coverImage).width(600).quality(80).url(),
                      urlFor(g.coverImage).width(600).quality(80).url(),
                      urlFor(g.coverImage).width(600).quality(80).url(),
                  ]
                : [],
        }));
    }, [galleries]);

    /* ================= GSAP Hover ================= */
    useGSAP(
        () => {
            const q = gsap.utils.selector(workPageContainer);
            const folders = q('.folder');
            const folderWrappers = q('.folder-wrapper');

            let isMobile = window.innerWidth < 1000;

            const setInitialPositions = () => {
                gsap.set(folderWrappers, { y: isMobile ? 0 : 25 });
            };

            folders.forEach((folder, index) => {
                const previewImages = folder.querySelectorAll(
                    '.folder-preview-img'
                );

                folder.addEventListener('mouseenter', () => {
                    if (isMobile) return;

                    folders.forEach((f) => {
                        if (f !== folder) f.classList.add('disabled');
                    });

                    gsap.to(folderWrappers[index], {
                        y: 0,
                        duration: 0.25,
                        ease: 'back.out(1.7)',
                    });

                    previewImages.forEach((img, imgIndex) => {
                        const rotation =
                            imgIndex === 0
                                ? gsap.utils.random(-20, -10)
                                : imgIndex === 1
                                  ? gsap.utils.random(-10, 10)
                                  : gsap.utils.random(10, 20);

                        gsap.to(img, {
                            y: '-100%',
                            rotation,
                            duration: 0.25,
                            ease: 'back.out(1.7)',
                            delay: imgIndex * 0.025,
                        });
                    });
                });

                folder.addEventListener('mouseleave', () => {
                    if (isMobile) return;

                    folders.forEach((f) => f.classList.remove('disabled'));

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
                });
            });

            setInitialPositions();
        },
        { scope: workPageContainer }
    );

    /* ================= Render ================= */
    return (
        <>
            <section className="folders py-16" ref={workPageContainer}>
                {workItems.length === 0 && (
                    <div className="empty-state">
                        <p>No galleries available.</p>
                    </div>
                )}

                {Array.from({ length: Math.ceil(workItems.length / 2) }).map(
                    (_, rowIndex) => (
                        <div
                            className="row"
                            key={rowIndex}
                            style={{ '--row-index': rowIndex }}
                        >
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
                                        <div
                                            className={`folder ${item.variant}`}
                                        >
                                            <div className="folder-preview">
                                                {item.images.map((src, i) => (
                                                    <div
                                                        className="folder-preview-img"
                                                        key={`${item.index}-${i}`}
                                                    >
                                                        <Image
                                                            src={src}
                                                            alt="preview"
                                                            fill
                                                            sizes="(max-width:768px) 50vw, 25vw"
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
                    )
                )}
            </section>

            {isMobileOrTablet && <Footer />}
        </>
    );
};

export default GalleryClient;
