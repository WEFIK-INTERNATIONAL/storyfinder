'use client';

import { useEffect, useCallback, useRef } from 'react';
import soundManager from '@/lib/soundManager';
import { useSoundStore } from '@/store/useSoundStore';

export function useSound() {
    const enabled = useSoundStore((state) => state.enabled);
    const volume = useSoundStore((state) => state.volume);
    const isInitialized = useSoundStore((state) => state.isInitialized);
    const toggleSound = useSoundStore((state) => state.toggleSound);
    const setSoundEnabled = useSoundStore((state) => state.setSoundEnabled);
    const setVolumeStore = useSoundStore((state) => state.setVolume);
    const setInitialized = useSoundStore((state) => state.setInitialized);

    const interactionRef = useRef(false);

    // Initialize the sound manager on first render
    useEffect(() => {
        if (!isInitialized) {
            soundManager.init();
            setInitialized(true);
        }
    }, [isInitialized, setInitialized]);

    // Unlock audio context on first user interaction
    useEffect(() => {
        if (interactionRef.current) return;

        const unlock = () => {
            if (!interactionRef.current) {
                interactionRef.current = true;
                soundManager.initOnInteraction();
            }
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('keydown', unlock);
        };

        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });
        document.addEventListener('keydown', unlock, { once: true });

        return () => {
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('keydown', unlock);
        };
    }, []);

    // Sync enabled state with sound manager
    useEffect(() => {
        soundManager.setEnabled(enabled);
    }, [enabled]);

    // Sync volume with sound manager
    useEffect(() => {
        soundManager.setVolume(volume);
    }, [volume]);

    const playSound = useCallback((soundName, options = {}) => {
        soundManager.play(soundName, options);
    }, []);

    const playLoop = useCallback((name = 'background-music') => {
        soundManager.playLoop(name);
    }, []);

    const stopLoop = useCallback(() => {
        soundManager.stopLoop();
    }, []);

    const toggle = useCallback(() => {
        toggleSound();
    }, [toggleSound]);

    const setEnabled = useCallback(
        (val) => {
            setSoundEnabled(val);
        },
        [setSoundEnabled]
    );

    const changeVolume = useCallback(
        (newVolume) => {
            setVolumeStore(newVolume);
        },
        [setVolumeStore]
    );

    return {
        enabled,
        volume,
        isInitialized,
        playSound,
        playLoop,
        stopLoop,
        toggle,
        setEnabled,
        setVolume: changeVolume,
    };
}
