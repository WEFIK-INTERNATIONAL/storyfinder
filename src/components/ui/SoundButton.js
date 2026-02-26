'use client';

import { useCallback } from 'react';
import { useSound } from '@/hooks/useSound';

export default function SoundButton({
    soundType = 'button-click',
    onClick,
    children,
    className = '',
    type = 'button',
    ...props
}) {
    const { playSound } = useSound();

    const handleClick = useCallback(
        (e) => {
            playSound(soundType);
            onClick?.(e);
        },
        [playSound, soundType, onClick]
    );

    return (
        <button
            type={type}
            className={className}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
}
