'use client';
import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

const PETAL_ORIGINS = [
    { x: 0, y: -30 },
    { x: -25, y: -20 },
    { x: -30, y: 0 },
    { x: -20, y: 25 },
    { x: 0, y: 30 },
    { x: 25, y: 20 },
    { x: 30, y: 0 },
    { x: 20, y: -25 },
];

const StoryfinderLogo = ({ className = '', width = 28, height = 28 }) => {
    const svgRef = useRef(null);
    const pathRefs = useRef([]);
    const spinTween = useRef(null);
    const isHovered = useRef(false);
    const currentRot = useRef(0);

    useEffect(() => {
        const paths = pathRefs.current;
        if (!paths.length) return;
        paths.forEach((path, i) => {
            const { x, y } = PETAL_ORIGINS[i];
            gsap.set(path, {
                x,
                y,
                opacity: 0,
                scale: 0.3,
                rotation: -45,
                transformOrigin: '14px 14px',
            });
        });

        gsap.to(paths, {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 1.2,
            stagger: {
                each: 0.07,
                from: 'start',
            },
            ease: 'expo.out',
            delay: 0.3,
        });
    }, []);

    const handleMouseEnter = () => {
        if (isHovered.current) return;
        isHovered.current = true;

        const paths = pathRefs.current;
        const svg = svgRef.current;
        if (spinTween.current) spinTween.current.kill();
        spinTween.current = gsap.to(svg, {
            rotation: '+=360',
            transformOrigin: '14px 14px',
            duration: 2,
            ease: 'none',
            repeat: -1,
        });
        gsap.to(paths, {
            scale: 1.15,
            duration: 0.4,
            stagger: { each: 0.06, yoyo: true, repeat: -1 },
            ease: 'sine.inOut',
            transformOrigin: '14px 14px',
        });
    };

    const handleMouseLeave = () => {
        if (!isHovered.current) return;
        isHovered.current = false;

        const paths = pathRefs.current;
        const svg = svgRef.current;
        gsap.killTweensOf(paths);
        gsap.to(paths, {
            scale: 1,
            duration: 0.5,
            ease: 'expo.out',
            transformOrigin: '14px 14px',
        });

        if (spinTween.current) {
            spinTween.current.kill();
            const currentRotation = gsap.getProperty(svg, 'rotation');
            const targetRotation = Math.ceil(currentRotation / 360) * 360;

            gsap.to(svg, {
                rotation: targetRotation,
                transformOrigin: '14px 14px',
                duration: 1.2,
                ease: 'expo.out',
            });
        }
    };

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox="0 0 46 46"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`cursor-pointer select-none ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="Storyfinder logo"
            role="img"
        >
            {[
                'M13.9 0.400009L17.9 4.2C19.4 5.6 20.2 7.50001 20.2 9.60001C20.2 11.6 21 13.5 22.4 14.9L22.9 15.4L27.5 0.5',
                'M0.300003 13.7L5.8 13.5C7.8 13.4 9.8 14.2 11.2 15.6C12.6 17 14.5 17.7 16.5 17.7H17.2L9.8 4',
                'M0.300003 32.7L4 28.7C5.4 27.2 7.3 26.3 9.3 26.3C11.3 26.3 13.1 25.4 14.5 24L15 23.5L0 19.2',
                'M13.9 45.9L13.6 40.4C13.5 38.4 14.2 36.4 15.6 34.9C16.9 33.5 17.7 31.5 17.6 29.6V28.9L4 36.6',
                'M32.9 45.5L28.8 41.9C27.3 40.6 26.4 38.7 26.3 36.6C26.2 34.6 25.3 32.8 23.9 31.4L23.4 30.9L19.4 46',
                'M45.9 31.6L40.4 32C38.4 32.2 36.4 31.5 34.9 30.1C33.4 28.8 31.5 28.1 29.5 28.2H28.8L36.8 41.6',
                'M45 12.7L41.5 16.9C40.2 18.4 38.3 19.4 36.3 19.5C34.3 19.6 32.5 20.5 31.2 22L30.8 22.5L46 26.1',
                'M30.9 0L31.4 5.5C31.6 7.5 31 9.50001 29.6 11.1C28.3 12.6 27.7 14.5 27.8 16.5L27.9 17.2L41.1 8.90001',
            ].map((d, i) => (
                <path
                    key={i}
                    ref={(el) => {
                        pathRefs.current[i] = el;
                    }}
                    d={d}
                    fill="#1a1614"
                    style={{ opacity: 0 }}
                />
            ))}
        </svg>
    );
};

export default StoryfinderLogo;
