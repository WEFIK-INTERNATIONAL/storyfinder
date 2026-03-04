'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useImageLoader } from '@/hooks/useImageLoader';

/**
 * BeforeAfterSlider
 * Interactive drag / touch slider comparing two images.
 */
const BeforeAfterSlider = memo(function BeforeAfterSlider({ before, after }) {
  const [pos,   setPos]   = useState(50);
  const [moved, setMoved] = useState(false);
  const wrapRef = useRef(null);
  const isDrag  = useRef(false);

  const { loaded: bl } = useImageLoader(before);
  const { loaded: al } = useImageLoader(after);
  const ready = bl && al;

  /* Reset on image change */
  useEffect(() => { setPos(50); setMoved(false); }, [before, after]);

  const calcPos = useCallback((clientX) => {
    const el = wrapRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    setPos(Math.min(98, Math.max(2, ((clientX - left) / width) * 100)));
    setMoved(true);
  }, []);

  const onMouseDown = useCallback((e) => {
    isDrag.current = true;
    calcPos(e.clientX);
    const onMove = (e) => { if (isDrag.current) calcPos(e.clientX); };
    const onUp   = () => {
      isDrag.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }, [calcPos]);

  const onTouchStart = useCallback((e) => { isDrag.current = true;  calcPos(e.touches[0].clientX); }, [calcPos]);
  const onTouchMove  = useCallback((e) => { if (isDrag.current) { e.preventDefault(); calcPos(e.touches[0].clientX); } }, [calcPos]);
  const onTouchEnd   = useCallback(() =>  { isDrag.current = false; }, []);

  /* ── Loading state ── */
  if (!ready) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-4 bg-rt-cream/[0.03]">
        <svg
          width="32" height="32" viewBox="0 0 24 24" fill="none"
          className="animate-rt-spin text-rt-cream/35 shrink-0"
          aria-label="Loading" role="status"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <span className="font-display text-[0.65rem] tracking-[0.2em] uppercase text-rt-cream/30">
          Loading image…
        </span>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="Before and after comparison — drag to reveal"
      className="relative w-full h-full overflow-hidden select-none cursor-ew-resize touch-none"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* BEFORE — base layer, desaturated */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={before}
        alt="Before retouch"
        draggable={false}
        className="rt-before-img absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* AFTER — clipped to pos% */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
        aria-hidden="true"
      >
        {/* img stays full width inside clip so it doesn't squish */}
        <div className="absolute inset-0" style={{ width: wrapRef.current?.offsetWidth }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={after}
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none max-w-none"
          />
        </div>
      </div>

      {/* Divider line + knob */}
      <div
        className="rt-divider-line"
        style={{ left: `${pos}%` }}
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <svg width="16" height="10" viewBox="0 0 20 11" fill="none">
            <path d="M0 5.5h20M5 1L0 5.5 5 10M15 1l5 4.5L15 10" stroke="#141210" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Chips */}
      <span className="absolute bottom-4 left-4 z-20 font-display text-[0.58rem] tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full pointer-events-none"
        style={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
          color: 'rgba(227,227,219,0.75)',
          border: '1px solid rgba(227,227,219,0.08)',
        }}
      >
        Before
      </span>
      <span className="absolute bottom-4 right-4 z-20 font-display text-[0.58rem] tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full pointer-events-none"
        style={{
          background: '#c0501a',
          color: '#fff',
          boxShadow: '0 2px 12px rgba(192,80,26,0.35)',
        }}
      >
        After
      </span>

      {/* Drag hint */}
      {!moved && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30" aria-hidden="true">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <svg width="14" height="8" viewBox="0 0 16 9" fill="none">
              <path d="M0 4.5h16M4 1L0 4.5 4 8M12 1l4 3.5L12 8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-display text-[0.6rem] tracking-[0.22em] uppercase text-white/45">
              Drag to compare
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export default BeforeAfterSlider;