'use client';

import { useState, useEffect, useRef } from 'react';
import { useMobile } from '@/hooks/useMobile';
import Preloader from '@/components/ui/Preloader';
import GalleryCanvas from '@/components/home/GalleryCanvas';
import MobileHome from '@/components/home/MobileHome';
import GalleryErrorBoundary from '@/components/errors/GalleryErrorBoundary';
import soundManager from '@/lib/soundManager';
import { useSoundStore } from '@/store/useSoundStore';
import './HomeOverlay.css';

export default function HomeClient({ images }) {
    const { isMobileOrTablet } = useMobile();
    const [mounted, setMounted] = useState(false);
    const overlayRef = useRef(null);
    const soundToggleRef = useRef(null);
    const soundWaveCanvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const isSoundHoveredRef = useRef(false);
    const { enabled, toggleSound } = useSoundStore();
    const isMuted = !enabled; // Derivative state for readability

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted || isMobileOrTablet) return;

        const revealOverlay = () => {
            const el = overlayRef.current;
            if (!el) return;
            el.classList.add('home-overlay--visible');
        };

        // Listen for preloader completion, then delay to let gallery intro finish
        const onPreloaderDone = () => {
            window.removeEventListener('preloader:complete', onPreloaderDone);
            setTimeout(revealOverlay, 2800);
        };

        window.addEventListener('preloader:complete', onPreloaderDone);
        // Fallback if preloader already fired
        const fallback = setTimeout(revealOverlay, 5000);

        return () => {
            window.removeEventListener('preloader:complete', onPreloaderDone);
            clearTimeout(fallback);
        };
    }, [mounted, isMobileOrTablet]);

    // Audio Waveform Animation
    useEffect(() => {
        if (!mounted || isMobileOrTablet) return;

        let phase = 0;
        const drawWaveform = () => {
            const canvas = soundWaveCanvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isEnabled = !isMuted;
            const targetAmplitude = isSoundHoveredRef.current ? 4 : 2; // Always animate, but amplitude changes

            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = isEnabled ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';

            for (let x = 0; x < canvas.width; x++) {
                const normalizedX = x / canvas.width;
                const wave1 = Math.sin(normalizedX * Math.PI * 2 + phase);
                const wave2 = Math.sin(normalizedX * Math.PI * 4 - phase * 1.5) * 0.5;
                const windowFunc = Math.sin(normalizedX * Math.PI); // Envelope

                const y = (canvas.height / 2) + ((wave1 + wave2) * targetAmplitude * windowFunc);

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();

            phase += isEnabled ? 0.05 : 0.02;
            animationFrameRef.current = requestAnimationFrame(drawWaveform);
        };

        const handleMouseEnter = () => { isSoundHoveredRef.current = true; };
        const handleMouseLeave = () => { isSoundHoveredRef.current = false; };

        const toggleBtn = soundToggleRef.current;
        if (toggleBtn) {
            toggleBtn.addEventListener('mouseenter', handleMouseEnter);
            toggleBtn.addEventListener('mouseleave', handleMouseLeave);
        }

        drawWaveform();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (toggleBtn) {
                toggleBtn.removeEventListener('mouseenter', handleMouseEnter);
                toggleBtn.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [mounted, isMobileOrTablet, isMuted]);

    if (!mounted) {
        return <Preloader />;
    }

    if (isMobileOrTablet) {
        return (
            <>
                <Preloader />
                <MobileHome />
            </>
        );
    }

    return (
        <>
            <Preloader />
            <GalleryErrorBoundary>
                <main className="absolute top-0 left-0 inset-0 overflow-hidden">
                    <GalleryCanvas images={images} />
                </main>
                <div
                    className="fixed inset-0 pointer-events-none z-7"
                    aria-hidden="true"
                >
                    <div className="absolute inset-0 mix-blend-overlay bg-linear-to-b from-black/90 via-black/50 to-transparent from-0% via-20% to-40% pointer-events-none" />
                </div>

                {/* Subtle branded overlay — navbar aligned */}
                <div
                    ref={overlayRef}
                    className="home-overlay home-overlay--visible pointer-events-auto"
                    aria-label="Homepage secondary navigation and controls"
                >
                    <div className="home-overlay__item hidden lg:flex">
                        <span className="home-overlay__label tracking-widest">DRAG</span>
                        <span className="home-overlay__value text-white/50 tracking-widest">[EXPLORE]</span>
                    </div>

                    <div className="home-overlay__item home-overlay__tagline !hidden xl:!block">
                        SUPRATIK SAHIS IS A VISUAL STORYTELLER<br/>
                        CRAFTING EXPERIENCES THROUGH PHOTOGRAPHY.
                    </div>

                    {/* Sound Toggle inserted here based on user reference image */}
                    <button
                        className="home-overlay__item home-overlay__sound cursor-pointer hover:opacity-70 transition-opacity bg-transparent border-none p-0 flex items-center gap-2"
                        ref={soundToggleRef}
                        type="button"
                        aria-label="Toggle sound"
                        onClick={() => {
                            toggleSound();
                            window.dispatchEvent(
                                new CustomEvent('togglesound', { detail: { isMuted: enabled } }) // detail is flipped as it's being toggled
                            );
                        }}
                    >
                        <canvas
                            ref={soundWaveCanvasRef}
                            className="sound-wave-canvas w-4 h-2 block opacity-70"
                            width="16"
                            height="8"
                            aria-hidden="true"
                        />
                        <span className="tracking-widest" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                            SOUND [{isMuted ? 'OFF' : 'ON'}]
                        </span>
                    </button>

                    <div className="home-overlay__item home-overlay__availability">
                        <span className="home-overlay__dot" />
                        <span className="home-overlay__status">AVAILABLE FOR WORK</span>
                    </div>
                </div>
            </GalleryErrorBoundary>
        </>
    );
}
