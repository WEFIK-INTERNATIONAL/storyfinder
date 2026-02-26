'use client';

const DEBOUNCE_MS = 80;

class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.enabled = true;
        this.volume = 0.3;
        this.isInitialized = false;
        this._lastPlayed = new Map();

        this.soundLibrary = {
            // UI
            click: ['/sounds/glitch-fx-001.mp3'],
            hover: ['/sounds/glitch-fx-001.mp3'],
            'button-click': ['/sounds/glitch-fx-001.mp3'],
            'link-click': ['/sounds/click-glitch-001.mp3'],
            // Gallery
            open: ['/sounds/click-glitch-001.mp3'],
            close: ['/sounds/click-glitch-001.mp3'],
            'zoom-in': ['/sounds/whoosh-fx-001.mp3'],
            'zoom-out': ['/sounds/whoosh-fx-001.mp3'],
            'drag-start': ['/sounds/preloader-2s-001.mp3'],
            'drag-end': ['/sounds/preloader-2s-001.mp3'],
            // Navigation
            'page-transition': ['/sounds/whoosh-fx-001.mp3'],
        };
    }

    init() {
        if (this.isInitialized) return this;

        Object.entries(this.soundLibrary).forEach(([name, urls]) => {
            const primaryUrl = Array.isArray(urls) ? urls[0] : urls;
            const audio = new Audio(primaryUrl);
            audio.preload = 'auto';
            audio.volume = this.volume;

            if (Array.isArray(urls) && urls.length > 1) {
                let fallbackIndex = 1;
                audio.addEventListener('error', () => {
                    if (fallbackIndex < urls.length) {
                        audio.src = urls[fallbackIndex++];
                        audio.load();
                    }
                });
            }

            this.sounds.set(name, audio);
        });

        this.isInitialized = true;
        return this;
    }

    play(soundName, options = {}) {
        if (!this.enabled || !this.isInitialized) return;

        if (!options.force) {
            const now = Date.now();
            const last = this._lastPlayed.get(soundName) ?? 0;
            if (now - last < DEBOUNCE_MS) return;
            this._lastPlayed.set(soundName, now);
        }

        const audio = this.sounds.get(soundName);
        if (!audio) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`Sound "${soundName}" not found`);
            }
            return;
        }

        try {
            audio.currentTime = 0;
            audio.volume =
                options.volume !== undefined
                    ? Math.max(0, Math.min(1, options.volume))
                    : this.volume;

            audio.play().catch((error) => {
                if (
                    error.name !== 'NotAllowedError' &&
                    process.env.NODE_ENV === 'development'
                ) {
                    console.warn(`Error playing sound "${soundName}":`, error);
                }
            });
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`Error playing sound "${soundName}":`, error);
            }
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.sounds.forEach((audio) => {
            audio.volume = this.volume;
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    addSound(name, urls) {
        if (this.sounds.has(name)) return;
        const urlList = Array.isArray(urls) ? urls : [urls];
        const audio = new Audio(urlList[0]);
        audio.preload = 'auto';
        audio.volume = this.volume;

        if (urlList.length > 1) {
            let fallbackIndex = 1;
            audio.addEventListener('error', () => {
                if (fallbackIndex < urlList.length) {
                    audio.src = urlList[fallbackIndex++];
                    audio.load();
                }
            });
        }

        this.sounds.set(name, audio);
        this.soundLibrary[name] = urlList;
    }

    removeSound(name) {
        this.sounds.delete(name);
        delete this.soundLibrary[name];
        this._lastPlayed.delete(name);
    }

    getState() {
        return {
            enabled: this.enabled,
            volume: this.volume,
            isInitialized: this.isInitialized,
            sounds: Array.from(this.sounds.keys()),
        };
    }
}

const soundManager = new SoundManager();
export default soundManager;
