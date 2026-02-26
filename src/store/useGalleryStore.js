'use client';

import { create } from 'zustand';

export const useGalleryStore = create((set) => ({
    currentZoom: 0.6,
    selectedIndex: null,
    isZoomActive: false,
    currentGap: 32,

    setZoom: (zoom) => set({ currentZoom: zoom }),
    setCurrentGap: (gap) => set({ currentGap: gap }),
    openImage: (index) => set({ selectedIndex: index, isZoomActive: true }),
    closeImage: () => set({ selectedIndex: null, isZoomActive: false }),
}));
