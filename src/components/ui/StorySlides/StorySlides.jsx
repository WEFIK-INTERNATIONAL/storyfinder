'use client';
import './StorySlides.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from '@/lib/gsap';
import Button from '@/components/ui/button/Button';
import Image from 'next/image';

export default function StorySlides({ stories }) {
    const storiesContainerRef = useRef(null);
    const activeStoryRef = useRef(0);
    const isAnimatingRef = useRef(false);
    const storyTimeoutRef = useRef(null);
    const changeStoryRef = useRef(null);
    const storyDuration = 4000;
    const contentUpdateDelay = 0.4;

    const [profileImgSrc, setProfileImgSrc] = useState(
        stories?.[0]?.profileImg || '/fallback/fallback-image-profile.png'
    );
    const [profileImgLqip, setProfileImgLqip] = useState(
        stories?.[0]?.profileImgLqip || ''
    );

    const resetIndexHighlight = useCallback((index, container) => {
        const highlight = container.querySelectorAll('.index .index-highlight')[
            index
        ];
        if (!highlight) return;

        gsap.killTweensOf(highlight);
        gsap.to(highlight, {
            width: '100%',
            duration: 0.3,
            onStart: () => {
                gsap.to(highlight, {
                    transformOrigin: 'right center',
                    scaleX: 0,
                    duration: 0.3,
                });
            },
        });
    }, []);

    const animateIndexHighlight = useCallback(
        (index, container) => {
            const highlight = container.querySelectorAll(
                '.index .index-highlight'
            )[index];
            if (!highlight) return;

            gsap.set(highlight, {
                width: '0%',
                scaleX: 1,
                transformOrigin: 'right center',
            });
            gsap.to(highlight, {
                width: '100%',
                duration: storyDuration / 1000,
                ease: 'none',
            });
        },
        [storyDuration]
    );

    const animateNewImage = useCallback((imgContainer) => {
        gsap.set(imgContainer, {
            clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
        });
        gsap.to(imgContainer, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            duration: 1,
            ease: 'power4.out',
        });
    }, []);

    const animateImageScale = useCallback((currentImg, upcomingImg) => {
        const tl = gsap.timeline({
            onComplete: () => {
                isAnimatingRef.current = false;
            },
        });

        tl.fromTo(
            currentImg,
            { scale: 1, rotate: 0 },
            {
                scale: 2,
                rotate: -25,
                duration: 1,
                ease: 'power4.out',
                onComplete: () => {
                    if (currentImg.parentElement) {
                        currentImg.parentElement.remove();
                    }
                },
            }
        );

        tl.fromTo(
            upcomingImg,
            { scale: 2, rotate: 25 },
            { scale: 1, rotate: 0, duration: 1, ease: 'power4.out' },
            '<'
        );
    }, []);

    const cleanUpElements = useCallback((container) => {
        const profileNameDiv = container.querySelector('.profile-name');
        const titleRows = container.querySelectorAll('.title-row');

        if (profileNameDiv) {
            while (profileNameDiv.childElementCount > 2) {
                profileNameDiv.removeChild(profileNameDiv.firstChild);
            }
        }

        if (titleRows) {
            titleRows.forEach((titleRow) => {
                while (titleRow.childElementCount > 2) {
                    titleRow.removeChild(titleRow.firstChild);
                }
            });
        }
    }, []);

    useEffect(() => {
        if (!stories) return;
        changeStoryRef.current = (container) => {
            if (isAnimatingRef.current) return;
            isAnimatingRef.current = true;

            const previousStory = activeStoryRef.current;
            activeStoryRef.current =
                (activeStoryRef.current + 1) % stories.length;

            const story = stories[activeStoryRef.current];

            const profileNameElements =
                container.querySelectorAll('.profile-name p');
            if (profileNameElements.length > 0) {
                gsap.to(profileNameElements, {
                    y: -24,
                    duration: 0.75,
                    delay: contentUpdateDelay,
                    ease: 'power3.out',
                });
            }

            const titleElements = container.querySelectorAll('.title-row h1');
            if (titleElements.length > 0) {
                gsap.to(titleElements, {
                    y: -48,
                    duration: 0.75,
                    delay: contentUpdateDelay,
                    ease: 'power3.out',
                });
            }

            const currentImgContainer =
                container.querySelector('.story-img .img');
            if (!currentImgContainer) {
                isAnimatingRef.current = false;
                return;
            }

            const currentImg = currentImgContainer.querySelector('img');
            if (!currentImg) {
                isAnimatingRef.current = false;
                return;
            }

            setTimeout(() => {
                const profileNameDiv = container.querySelector('.profile-name');
                if (profileNameDiv) {
                    const newProfileName = document.createElement('p');
                    newProfileName.innerText = story.profileName;
                    newProfileName.style.transform = 'translateY(24px)';
                    profileNameDiv.appendChild(newProfileName);

                    gsap.to(newProfileName, {
                        y: 0,
                        duration: 0.5,
                        delay: contentUpdateDelay,
                        ease: 'power3.out',
                    });
                }

                const titleRows = container.querySelectorAll('.title-row');
                if (titleRows.length > 0) {
                    story.title.forEach((line, index) => {
                        if (titleRows[index]) {
                            const newTitle = document.createElement('h1');
                            newTitle.innerText = line;
                            newTitle.style.transform = 'translateY(48px)';
                            titleRows[index].appendChild(newTitle);

                            gsap.to(newTitle, {
                                y: 0,
                                duration: 0.75,
                                delay: contentUpdateDelay,
                                ease: 'power3.out',
                            });
                        }
                    });
                }

                const storyImgDiv = container.querySelector('.story-img');
                if (storyImgDiv) {
                    const newImgContainer = document.createElement('div');
                    newImgContainer.classList.add('img');

                    const newStoryImg = document.createElement('img');
                    newStoryImg.src = story.storyImg;
                    newStoryImg.alt = story.profileName || 'Story Image';

                    // ONLY animate once the image is actually fully loaded
                    newStoryImg.onload = () => {
                        newImgContainer.appendChild(newStoryImg);
                        storyImgDiv.appendChild(newImgContainer);

                        animateNewImage(newImgContainer);
                        animateImageScale(currentImg, newStoryImg);

                        // Proceed with highlighting and cleanup only when the image is ready
                        resetIndexHighlight(previousStory, container);
                        animateIndexHighlight(
                            activeStoryRef.current,
                            container
                        );
                        cleanUpElements(container);

                        clearTimeout(storyTimeoutRef.current);
                        storyTimeoutRef.current = setTimeout(
                            () => changeStoryRef.current?.(container),
                            storyDuration
                        );
                    };

                    // Fallback to animate anyway if the image errors out
                    newStoryImg.onerror = () => {
                        newImgContainer.appendChild(newStoryImg);
                        storyImgDiv.appendChild(newImgContainer);
                        animateNewImage(newImgContainer);
                        animateImageScale(currentImg, newStoryImg);
                        resetIndexHighlight(previousStory, container);
                        animateIndexHighlight(
                            activeStoryRef.current,
                            container
                        );
                        cleanUpElements(container);

                        clearTimeout(storyTimeoutRef.current);
                        storyTimeoutRef.current = setTimeout(
                            () => changeStoryRef.current?.(container),
                            storyDuration
                        );
                    };
                }
            }, 500);

            // Profile image update needs a timeout ref too to clear it on unmount
            const profileTimeout = setTimeout(() => {
                setProfileImgSrc(
                    story.profileImg || '/fallback/fallback-image-profile.png'
                );
                setProfileImgLqip(story.profileImgLqip || '');

                const link = container.querySelector('.link a');
                if (link) {
                    link.href = story.linkSrc;
                    const labelEl = link.querySelector('.button-label');
                    if (labelEl) {
                        labelEl.textContent = story.linkLabel;
                    } else {
                        link.textContent = story.linkLabel;
                    }
                }
            }, 600);

            // Save timeout refs on the container or a ref to clear them if unmounted mid-transition
            if (!container._timeouts) container._timeouts = [];
            container._timeouts.push(profileTimeout);
        };
    }, [
        animateNewImage,
        animateImageScale,
        resetIndexHighlight,
        animateIndexHighlight,
        cleanUpElements,
        contentUpdateDelay,
        stories,
    ]);

    useEffect(() => {
        if (typeof window === 'undefined' || !storiesContainerRef.current)
            return;

        const container = storiesContainerRef.current;

        function handleClick() {
            if (isAnimatingRef.current) return;
            clearTimeout(storyTimeoutRef.current);
            resetIndexHighlight(activeStoryRef.current, container);
            changeStoryRef.current?.(container);
        }

        container.addEventListener('click', handleClick);

        storyTimeoutRef.current = setTimeout(
            () => changeStoryRef.current?.(container),
            storyDuration
        );
        animateIndexHighlight(activeStoryRef.current, container);

        return () => {
            container.removeEventListener('click', handleClick);
            clearTimeout(storyTimeoutRef.current);
            if (container._timeouts) {
                container._timeouts.forEach(clearTimeout);
            }
            gsap.killTweensOf(container.querySelectorAll('*'));
        };
    }, [stories, resetIndexHighlight, animateIndexHighlight, storyDuration]);

    if (!stories || stories.length === 0) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center w-full min-h-screen bg-[#111] text-rt-cream">
                <p className="font-display text-sm tracking-widest uppercase opacity-40">
                    No stories found yet
                </p>
                <div className="link">
                    <Button variant="light" href="/">
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="stories-container stories" ref={storiesContainerRef}>
            {/* 
              Preload all upcoming images so that when the vanilla JS DOM creates 
              them during the animation, they are instantly fetched from the browser cache 
            */}
            <div className="hidden" aria-hidden="true">
                {stories.map((story, i) => (
                    <Image
                        key={`preload-${i}`}
                        src={story.storyImg}
                        alt="preload"
                        fill
                        priority
                    />
                ))}
            </div>

            <div className="story-img">
                <div className="img">
                    <Image
                        src={stories[0].storyImg}
                        alt={stories[0]?.profileName || 'Featured Story'}
                        fill={true}
                        priority={true}
                        className="object-cover"
                        placeholder={stories[0].storyImgLqip ? 'blur' : 'empty'}
                        blurDataURL={stories[0].storyImgLqip || undefined}
                    />
                </div>
            </div>

            <div className="stories-footer">
                <div className="container">
                    <p className="sm">Creative Index</p>
                    <p className="sm">( Since 2026 )</p>
                </div>
            </div>

            <div className="story-content">
                <div className="row">
                    <div className="indices">
                        {stories.map((_, index) => (
                            <div className="index" key={`index-${index}`}>
                                <div className="index-highlight"></div>
                            </div>
                        ))}
                    </div>

                    <div className="profile">
                        <div className="profile-icon">
                            <Image
                                src={
                                    profileImgSrc ||
                                    '/fallback/fallback-image-profile.png'
                                }
                                alt=""
                                fill={true}
                                placeholder={profileImgLqip ? 'blur' : 'empty'}
                                blurDataURL={profileImgLqip || undefined}
                            />
                        </div>

                        <div className="profile-name">
                            <p>{stories[0].profileName}</p>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="title">
                        {stories[0].title.map((line, index) => (
                            <div className="title-row" key={`title-${index}`}>
                                <h1>{line}</h1>
                            </div>
                        ))}
                    </div>

                    <div className="link">
                        <Button variant="light" href={stories[0].linkSrc}>
                            {stories[0].linkLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
