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

        this.enabled = false;
        this.volume = 0.3;
        this.musicVolume = 0.06;
        this.isInitialized = false;
        this._interactionUnlocked = false;

        /** Web Audio API context for low-latency click sound */
        this._audioCtx = null;
        /** @type {AudioBuffer|null} pre-decoded click sound buffer */
        this._clickBuffer = null;

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
                audio.addEventListener(
                    'canplaythrough',
                    () => {
                        this.ready.set(name, true);
                    },
                    { once: true }
                );
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
            pool[0].addEventListener(
                'canplaythrough',
                () => {
                    this.ready.set(name, true);
                },
                { once: true }
            );

            this.pools.set(name, pool);
            this.poolIndex.set(name, 0);
            this.ready.set(name, false);
        });

        this.isInitialized = true;
        return this;
    }

    /**
     * Unlock audio playback after first user interaction.
     * Uses a silent 1-frame AudioContext buffer — no actual audio files are played,
     * which eliminates the "audio chaos" that occurred when playing/pausing every
     * pool element on mobile.
     */
    initOnInteraction() {
        if (this._interactionUnlocked) return;
        this._interactionUnlocked = true;

        // Unlock via a completely silent AudioContext buffer (no sound files played)
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) {
                const ctx = new AC();
                const buf = ctx.createBuffer(1, 1, 22050);
                const src = ctx.createBufferSource();
                src.buffer = buf;
                src.connect(ctx.destination);
                src.start(0);
                // Keep this context alive as our main Web Audio context
                this._audioCtx = ctx;
                // Now pre-decode the click sound for zero-latency playback
                this._preloadClickBuffer();
            }
        } catch (e) {
            // Web Audio API not available — HTML Audio pool is the fallback
        }
    }

    /** Pre-decode the click sound into a Web Audio buffer for near-zero latency. */
    async _preloadClickBuffer() {
        if (!this._audioCtx) return;
        try {
            const response = await fetch('/sounds/click.mp3');
            const arrayBuffer = await response.arrayBuffer();
            this._clickBuffer =
                await this._audioCtx.decodeAudioData(arrayBuffer);
        } catch (e) {
            // Fallback to HTML Audio pool if fetch/decode fails
        }
    }

    /** Play the click sound instantly via Web Audio API if available. */
    _playClickInstant() {
        if (this._audioCtx && this._clickBuffer) {
            // Resume context if it was suspended (browser autoplay policy)
            if (this._audioCtx.state === 'suspended') {
                this._audioCtx.resume().catch(() => {});
            }
            const src = this._audioCtx.createBufferSource();
            src.buffer = this._clickBuffer;
            const gain = this._audioCtx.createGain();
            gain.gain.value = Math.max(0, Math.min(1, this.volume));
            src.connect(gain);
            gain.connect(this._audioCtx.destination);
            src.start(0);
            return true;
        }
        return false; // Signal to fall back to HTML Audio pool
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

        // Use the pre-decoded Web Audio buffer for zero-latency click
        if (soundName === 'click' && !options.volume) {
            if (this._playClickInstant()) return;
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
