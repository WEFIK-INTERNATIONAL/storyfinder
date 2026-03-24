'use client';

import { useRef, useCallback } from 'react';
import { useTransitionRouter } from 'next-view-transitions';
import { gsap } from '@/lib/gsap';

let _isTransitioningGlobal = false;

function createSVGOverlay() {
    let overlay = document.querySelector('.page-transition-overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.style.cssText =
            'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;';

        overlay.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path class="overlay__path" vector-effect="non-scaling-stroke"
          d="M 0 0 h 0 c 0 50 0 50 0 100 H 0 V 0 Z" />
      </svg>
    `;

        document.body.appendChild(overlay);
    }

    return overlay;
}

const PATHS = {
    step1: {
        unfilled: 'M 0 0 h 0 c 0 50 0 50 0 100 H 0 V 0 Z',
        inBetween: 'M 0 0 h 43 c -60 55 140 65 0 100 H 0 V 0 Z',
        filled: 'M 0 0 h 100 c 0 50 0 50 0 100 H 0 V 0 Z',
    },
    step2: {
        filled: 'M 100 0 H 0 c 0 50 0 50 0 100 h 100 V 50 Z',
        inBetween: 'M 100 0 H 50 c 28 43 4 81 0 100 h 50 V 0 Z',
        unfilled: 'M 100 0 H 100 c 0 50 0 50 0 100 h 0 V 0 Z',
    },
};

export const useViewTransition = () => {
    const router = useTransitionRouter();

    const failsafeTimerRef = useRef(null);

    const slideInOut = useCallback(
        (href, onRouteChange) => {
            const overlay = createSVGOverlay();
            const overlayPath = overlay.querySelector('.overlay__path');
            if (!overlayPath) {
                router.push(href);
                if (onRouteChange) onRouteChange();
                _isTransitioningGlobal = false;
                return;
            }

            const cleanup = () => {
                overlay?.parentNode?.removeChild(overlay);
                _isTransitioningGlobal = false;
                clearTimeout(failsafeTimerRef.current);
            };

            gsap.timeline({ onComplete: cleanup })
                .set(overlayPath, { attr: { d: PATHS.step1.unfilled } })
                .to(
                    overlayPath,
                    {
                        duration: 0.6,
                        ease: 'power4.in',
                        attr: { d: PATHS.step1.inBetween },
                    },
                    0
                )
                .to(overlayPath, {
                    duration: 0.2,
                    ease: 'power1',
                    attr: { d: PATHS.step1.filled },
                    onComplete: () => {
                        router.push(href);
                        if (onRouteChange) onRouteChange();
                    },
                })
                .to({}, { duration: 0.75 })
                .set(overlayPath, { attr: { d: PATHS.step2.filled } })
                .to(overlayPath, {
                    duration: 0.15,
                    ease: 'sine.in',
                    attr: { d: PATHS.step2.inBetween },
                })
                .to(overlayPath, {
                    duration: 1,
                    ease: 'power4',
                    attr: { d: PATHS.step2.unfilled },
                });
            failsafeTimerRef.current = setTimeout(() => {
                if (_isTransitioningGlobal) {
                    overlay?.parentNode?.removeChild(overlay);
                    _isTransitioningGlobal = false;
                    router.push(href);
                }
            }, 4000);
        },
        [router]
    );

    const navigateWithTransition = useCallback(
        (href, onRouteChange) => {
            if (typeof window === 'undefined') return;
            if (window.location.pathname === href) return;
            if (_isTransitioningGlobal) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                router.push(href);
                if (onRouteChange) onRouteChange();
                return;
            }

            _isTransitioningGlobal = true;
            slideInOut(href, onRouteChange);
        },
        [router, slideInOut]
    );

    return { navigateWithTransition, router };
};
