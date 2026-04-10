'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { FiArrowRight } from 'react-icons/fi';
import './not-found.css';

gsap.registerPlugin(useGSAP);

export default function NotFound() {
    const containerRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useGSAP(
        () => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.from('.nf-error-code', {
                y: 80,
                opacity: 0,
                duration: 1.4,
                ease: 'expo.out',
            })
                .from(
                    '.nf-glitch-line',
                    {
                        scaleX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: 'expo.out',
                    },
                    '-=0.8'
                )
                .from(
                    '.nf-subtitle',
                    {
                        y: 30,
                        opacity: 0,
                        duration: 1,
                    },
                    '-=0.6'
                )
                .from(
                    '.nf-description',
                    {
                        y: 20,
                        opacity: 0,
                        duration: 0.8,
                    },
                    '-=0.5'
                )
                .from(
                    '.nf-cta',
                    {
                        y: 20,
                        opacity: 0,
                        duration: 0.8,
                    },
                    '-=0.4'
                )
                .from(
                    '.nf-footer-item',
                    {
                        y: 15,
                        opacity: 0,
                        duration: 0.6,
                        stagger: 0.1,
                    },
                    '-=0.3'
                );

            gsap.to('.nf-error-code', {
                y: -8,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        },
        { scope: containerRef }
    );

    return (
        <div className="nf-page" ref={containerRef}>
            <div className="nf-grain" />

            <div
                className="nf-glow"
                style={{
                    background: `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(192, 80, 26, 0.08), transparent 60%)`,
                }}
            />

            <div className="nf-grid-lines">
                <div className="nf-grid-v" style={{ left: '25%' }} />
                <div className="nf-grid-v" style={{ left: '50%' }} />
                <div className="nf-grid-v" style={{ left: '75%' }} />
                <div className="nf-grid-h" style={{ top: '33%' }} />
                <div className="nf-grid-h" style={{ top: '66%' }} />
            </div>

            <div className="nf-content">
                <div className="nf-error-block">
                    <div className="nf-error-code">
                        <span className="nf-digit">4</span>
                        <span className="nf-digit nf-digit-accent">0</span>
                        <span className="nf-digit">4</span>
                    </div>
                </div>

                <h2 className="nf-subtitle">Lost in the Frame</h2>

                <p className="nf-description">
                    The story you&apos;re looking for doesn&apos;t exist — or
                    perhaps it&apos;s still being captured somewhere out there.
                </p>

                <Link href="/" className="nf-cta">
                    <span className="nf-cta-text">Return Home</span>
                    <span className="nf-cta-icon">
                        <FiArrowRight size={18} />
                    </span>
                    <span className="nf-cta-bg" />
                </Link>

                <div className="nf-footer">
                    <span className="nf-footer-item">STORYFINDER</span>
                    <span className="nf-footer-divider" />
                    <span className="nf-footer-item">PAGE NOT FOUND</span>
                    <span className="nf-footer-divider" />
                    <span className="nf-footer-item">ERR_404</span>
                </div>
            </div>

            <div className="nf-corner nf-corner-tl" />
            <div className="nf-corner nf-corner-tr" />
            <div className="nf-corner nf-corner-bl" />
            <div className="nf-corner nf-corner-br" />
        </div>
    );
}
