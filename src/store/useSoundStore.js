'use client';

import { create } from 'zustand';

export const useSoundStore = create((set) => ({
    enabled: true,
    volume: 0.3,
    isInitialized: false,

    toggleSound: () => set((state) => ({ enabled: !state.enabled })),
    setSoundEnabled: (val) => set({ enabled: val }),
    setVolume: (newVolume) =>
        set({ volume: Math.max(0, Math.min(1, newVolume)) }),
    setInitialized: (val) => set({ isInitialized: val }),
}));
