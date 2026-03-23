'use client';
import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

const StoryfinderLogo = ({ className = '', width = 28, height = 28 }) => {
    const svgRef = useRef(null);
    const pathRefs = useRef([]);
    const spinTween = useRef(null);
    const isHovered = useRef(false);

    useEffect(() => {
        const paths = pathRefs.current.filter(Boolean);
        if (!paths.length) return;

        paths.forEach((path) => {
            gsap.set(path, {
                opacity: 0,
                scale: 0.6,
                transformOrigin: '95px 95px',
            });
        });

        gsap.to(paths, {
            opacity: 1,
            scale: 1,
            duration: 1,
            stagger: { each: 0.06, from: 'start' },
            ease: 'expo.out',
            delay: 0.3,
        });
    }, []);

    const handleMouseEnter = () => {
        if (isHovered.current) return;
        isHovered.current = true;

        const svg = svgRef.current;
        if (spinTween.current) spinTween.current.kill();
        spinTween.current = gsap.to(svg, {
            rotation: '+=360',
            transformOrigin: '50% 50%',
            duration: 2,
            ease: 'none',
            repeat: -1,
        });
    };

    const handleMouseLeave = () => {
        if (!isHovered.current) return;
        isHovered.current = false;

        const svg = svgRef.current;
        if (spinTween.current) {
            spinTween.current.kill();
            const currentRotation = gsap.getProperty(svg, 'rotation');
            const targetRotation = Math.ceil(currentRotation / 360) * 360;
            gsap.to(svg, {
                rotation: targetRotation,
                transformOrigin: '50% 50%',
                duration: 1.2,
                ease: 'expo.out',
            });
        }
    };

    const PATHS = [
        'M76.5445 13.3424C69.2514 28.2317 64.8416 50.3852 64.5768 67.2526C80.2824 52.6126 103.252 32.9533 134.474 21.1467C120.584 13.1466 105.075 10.5432 88.8408 11.7651C84.6627 12.0796 80.5678 12.5683 76.5445 13.3424Z',
        'M86.8141 53.8559C106.005 53.4143 135.491 55.3167 167.681 67.2946C170.124 68.1837 172.485 69.1693 174.465 69.8928C167.981 51.0262 158.106 36.8172 139.877 24.982C122.721 30.084 104.979 40.0437 88.9224 53.4866L86.8141 53.8559Z',
        'M117.901 60.5016C132.485 80.6638 157.317 111.337 164.943 138.18C174.603 122.36 179.22 105.356 177.667 88.4548C177.191 83.4665 176.468 78.7875 175.746 76.2546C158.681 67.6311 138.822 62.2663 117.901 60.5016Z',
        'M116.142 174.375C133.734 168.809 146.761 160.016 161.877 142.743C157.512 126.986 148.559 108.757 136.347 93.8712C133.125 89.9621 128.545 88.1406 123.639 85.5816L96.2277 73.0034C91.457 70.7752 86.575 73.7299 86.7842 79.4403C86.8935 82.8918 88.2448 84.856 91.7761 86.6059L116.54 98.2502C125.671 102.447 130.307 111.554 129.651 121.351C128.45 138.45 124.237 158.944 118.629 173.706L116.142 174.375Z',
        'M55.144 167.634C68.7601 175.464 83.558 178.211 99.2835 177.027C104.09 176.666 108.508 175.942 112.736 174.952C120.487 157.22 124.144 138.663 124.713 122.104C106.517 137.764 86.3002 156.153 55.144 167.634Z',
        'M15.7321 119.656C22.1726 138.075 33.1787 153.332 49.5282 164.436C61.1074 161.459 78.4966 151.335 99.8075 135.09C73.9261 135.644 42.728 130.18 15.7321 119.656Z',
        'M24.4037 51.1322C13.402 68.9782 9.74368 87.5251 13.5618 113.472C28.7678 121.774 52.0075 125.56 71.8515 128.6C56.4118 107.198 32.8211 77.1639 24.4037 51.1322Z',
        'M71.0249 14.6202C51.7234 20.6559 37.5691 30.8569 27.5482 46.9444C28.9309 58.6536 41.2628 80.6 52.6407 94.1343C56.5903 98.9113 60.6813 100.77 66.5743 103.786L93.0678 116.694C98.6076 119.015 102.716 113.771 102.098 109.967C101.647 107.163 100.2 105.256 97.4788 104.017L74.5139 92.6886C64.8728 88.2396 60.7776 80.9965 60.743 70.8104C60.8825 54.1429 64.5785 32.7652 71.0249 14.6202Z',
    ];

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox="0 0 190 190"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`cursor-pointer select-none ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="Storyfinder logo"
            role="img"
        >
            <rect width="190" height="190" rx="95" fill="#EB5938" />
            {PATHS.map((d, i) => (
                <path
                    key={i}
                    ref={(el) => {
                        pathRefs.current[i] = el;
                    }}
                    d={d}
                    fill="white"
                    style={{ opacity: 0 }}
                />
            ))}
        </svg>
    );
};

export default StoryfinderLogo;
