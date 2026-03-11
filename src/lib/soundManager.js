'use client';

const DEBOUNCE_MS = 80;
const POOL_SIZE = 3;

class SoundManager {
    constructor() {
        /** @type {Map<string, Audio[]>} pool of Audio elements per sound */
        this.pools = new Map();
        /** @type {Map<string, number>} round-robin index per sound */
        this.poolIndex = new Map();
        /** @type {Map<string, boolean>} whether a sound has loaded enough to play */
        this.ready = new Map();
        /** @type {Map<string, number>} last-played timestamp for debounce */
        this._lastPlayed = new Map();

        /** @type {Audio|null} dedicated looping audio element */
        this._loopAudio = null;
        this._loopName = null;

        this.enabled = true;
        this.volume = 0.3;
        this.musicVolume = 0.06;
        this.isInitialized = false;
        this._interactionUnlocked = false;

        this.soundLibrary = {
            // UI
            click: ['/sounds/click.mp3'],
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
            'page-transition': ['/sounds/page_transition.mp3'],
            // Background Music
            'background-music': ['/sounds/background_music.mp3'],
        };
    }

    /* ── Initialization ───────────────────────────────────────── */

    init() {
        if (this.isInitialized) return this;

        Object.entries(this.soundLibrary).forEach(([name, urls]) => {
            const primaryUrl = Array.isArray(urls) ? urls[0] : urls;

            // Background music gets a single dedicated element, not a pool
            if (name === 'background-music') {
                const audio = new Audio(primaryUrl);
                audio.preload = 'auto';
                audio.loop = true;
                audio.volume = this.musicVolume;
                audio.addEventListener('canplaythrough', () => {
                    this.ready.set(name, true);
                }, { once: true });
                this._loopAudio = audio;
                this.ready.set(name, false);
                return;
            }

            // Create a pool of Audio elements for concurrent playback
            const pool = [];
            for (let p = 0; p < POOL_SIZE; p++) {
                const audio = new Audio(primaryUrl);
                audio.preload = 'auto';
                audio.volume = this.volume;

                // Fallback URLs
                if (Array.isArray(urls) && urls.length > 1) {
                    let fallbackIndex = 1;
                    audio.addEventListener('error', () => {
                        if (fallbackIndex < urls.length) {
                            audio.src = urls[fallbackIndex++];
                            audio.load();
                        }
                    });
                }

                pool.push(audio);
            }

            // Track readiness via the first element
            pool[0].addEventListener('canplaythrough', () => {
                this.ready.set(name, true);
            }, { once: true });

            this.pools.set(name, pool);
            this.poolIndex.set(name, 0);
            this.ready.set(name, false);
        });

        this.isInitialized = true;
        return this;
    }

    /**
     * Unlock audio playback after first user interaction.
     * Browsers block autoplay until a user gesture has occurred.
     */
    initOnInteraction() {
        if (this._interactionUnlocked) return;
        this._interactionUnlocked = true;

        // Resume all audio contexts by playing then immediately pausing a silent buffer
        this.pools.forEach((pool) => {
            pool.forEach((audio) => {
                const playPromise = audio.play();
                if (playPromise) {
                    playPromise.then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                    }).catch(() => { /* expected — just unlocking */ });
                }
            });
        });

        // Also unlock the loop audio
        if (this._loopAudio) {
            const p = this._loopAudio.play();
            if (p) {
                p.then(() => {
                    this._loopAudio.pause();
                    this._loopAudio.currentTime = 0;
                }).catch(() => {});
            }
        }
    }

    /* ── Playback ─────────────────────────────────────────────── */

    play(soundName, options = {}) {
        if (!this.enabled || !this.isInitialized) return;

        // Debounce
        if (!options.force) {
            const now = Date.now();
            const last = this._lastPlayed.get(soundName) ?? 0;
            if (now - last < DEBOUNCE_MS) return;
            this._lastPlayed.set(soundName, now);
        }

        const pool = this.pools.get(soundName);
        if (!pool || pool.length === 0) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`Sound "${soundName}" not found`);
            }
            return;
        }

        // Round-robin through the pool
        const idx = this.poolIndex.get(soundName) ?? 0;
        const audio = pool[idx];
        this.poolIndex.set(soundName, (idx + 1) % pool.length);

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

    /* ── Looping (background music) ───────────────────────────── */

    playLoop(name = 'background-music') {
        if (!this.enabled || !this.isInitialized || !this._loopAudio) return;
        this._loopName = name;
        this._loopAudio.volume = this.musicVolume;
        this._loopAudio.play().catch(() => {});
    }

    stopLoop() {
        if (this._loopAudio) {
            this._loopAudio.pause();
        }
    }

    isLoopPlaying() {
        return this._loopAudio && !this._loopAudio.paused;
    }

    /* ── Controls ──────────────────────────────────────────────── */

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopLoop();
        } else if (this._loopName && this._interactionUnlocked) {
            this.playLoop(this._loopName);
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.pools.forEach((pool) => {
            pool.forEach((audio) => {
                audio.volume = this.volume;
            });
        });
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this._loopAudio) {
            this._loopAudio.volume = this.musicVolume;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopLoop();
        } else if (this._loopName && this._interactionUnlocked) {
            this.playLoop(this._loopName);
        }
        return this.enabled;
    }

    getState() {
        return {
            enabled: this.enabled,
            volume: this.volume,
            musicVolume: this.musicVolume,
            isInitialized: this.isInitialized,
            interactionUnlocked: this._interactionUnlocked,
            sounds: Array.from(this.pools.keys()),
        };
    }
}

const soundManager = new SoundManager();
export default soundManager;
