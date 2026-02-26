'use client';

import { useSound } from '@/hooks/useSound';
import { useEffect, useRef } from 'react';

const COLORS = {
    primary: [44, 27, 20], // #2C1B14
    accent: [166, 75, 35], // #A64B23
    mute: [217, 196, 170], // #D9C4AA
};

function interpolateRgb(rgb1, rgb2, factor) {
    const r = Math.round(rgb1[0] + factor * (rgb2[0] - rgb1[0]));
    const g = Math.round(rgb1[1] + factor * (rgb2[1] - rgb1[1]));
    const b = Math.round(rgb1[2] + factor * (rgb2[2] - rgb1[2]));
    return `rgb(${r},${g},${b})`;
}

export default function SoundToggle({ className = '' }) {
    const { enabled, toggle } = useSound();
    const canvasRef = useRef(null);
    const animationIdRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const W = 32;
        const H = 16;
        const centerY = Math.floor(H / 2);
        const startTime = Date.now();

        let currentAmplitude = enabled ? 1 : 0;

        const animate = () => {
            const target = enabled ? 1 : 0;
            currentAmplitude += (target - currentAmplitude) * 0.08;

            ctx.clearRect(0, 0, W, H);
            const t = (Date.now() - startTime) / 1000;
            const mute = 1 - currentAmplitude;

            if (!enabled && currentAmplitude < 0.01) {
                ctx.fillStyle = `rgb(${COLORS.mute.join(',')})`;
                ctx.fillRect(0, centerY, W, 2);
            } else {
                ctx.fillStyle = interpolateRgb(
                    COLORS.primary,
                    COLORS.mute,
                    mute
                );
                for (let i = 0; i < W; i++) {
                    const x = i - W / 2;
                    const e = Math.exp((-x * x) / 50);
                    const y =
                        centerY +
                        Math.cos(x * 0.4 - t * 8) *
                            e *
                            H *
                            0.35 *
                            currentAmplitude;
                    ctx.fillRect(i, Math.round(y), 1, 2);
                }
                ctx.fillStyle = interpolateRgb(
                    COLORS.accent,
                    COLORS.mute,
                    mute
                );
                for (let i = 0; i < W; i++) {
                    const x = i - W / 2;
                    const e = Math.exp((-x * x) / 80);
                    const y =
                        centerY +
                        Math.cos(x * 0.3 - t * 5) *
                            e *
                            H *
                            0.25 *
                            currentAmplitude;
                    ctx.fillRect(i, Math.round(y), 1, 2);
                }
            }

            animationIdRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationIdRef.current)
                cancelAnimationFrame(animationIdRef.current);
        };
    }, [enabled]);

    return (
        <button
            className={`sound-toggle ${enabled ? 'active' : ''} ${className}`.trim()}
            onClick={toggle}
            aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
            aria-pressed={enabled}
            type="button"
        >
            <canvas
                ref={canvasRef}
                className="sound-wave-canvas"
                width={32}
                height={16}
                aria-hidden="true"
            />
        </button>
    );
}
