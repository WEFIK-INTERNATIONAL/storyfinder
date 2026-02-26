'use client';

import { useEffect, useCallback } from 'react';
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

    useEffect(() => {
        if (!isInitialized) {
            soundManager.init();
            setInitialized(true);
        }
    }, [isInitialized, setInitialized]);

    useEffect(() => {
        soundManager.setEnabled(enabled);
    }, [enabled]);

    useEffect(() => {
        soundManager.setVolume(volume);
    }, [volume]);

    const playSound = useCallback((soundName, options = {}) => {
        soundManager.play(soundName, options);
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
        toggle,
        setEnabled,
        setVolume: changeVolume,
    };
}
