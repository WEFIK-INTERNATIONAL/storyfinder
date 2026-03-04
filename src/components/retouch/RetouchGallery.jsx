'use client';

/**
 * RetouchGallery — Cinematic before/after showcase
 *
 * Full-bleed hero layout with floating category pills
 * and a bottom thumbnail navigation strip.
 */

import {
  useState, useEffect, useMemo, useCallback,
  useRef, memo,
} from 'react';
import { useDragScroll } from '@/hooks/useDragScroll';
import BeforeAfterSlider from './BeforeAfterSlider';
import './Retouch.css';

/* ─── constants ───────────────────────────────────────────────── */
const CATEGORIES = [
  'Skin Retouch', 'Color Grade', 'Light Edit',
  'Composite', 'Dodge & Burn', 'Sky Replace',
];
const FILTER_ALL = 'All';

/* ─── SSR-safe breakpoint hook ───────────────────────────────── */
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`);
    setMobile(mq.matches);
    const h = (e) => setMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [bp]);
  return mobile;
}

/* ═══════════════════════════════════════════════════════════════
   FilterPills — floating glassmorphic pill row
═══════════════════════════════════════════════════════════════ */
const FilterPills = memo(function FilterPills({ active, onChange }) {
  const drag = useDragScroll();
  return (
    <div
      ref={drag.ref}
      onClick={drag.onClick}
      role="group"
      aria-label="Filter by category"
      className="flex gap-2 overflow-x-auto select-none px-1 py-1"
    >
      {[FILTER_ALL, ...CATEGORIES].map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          aria-pressed={active === cat}
          className="shrink-0 font-display text-[0.65rem] tracking-[0.18em] uppercase px-4 py-1.5 rounded-full border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-rt-orange cursor-pointer"
          style={{
            borderColor: active === cat ? 'rgba(227,227,219,0.4)' : 'rgba(227,227,219,0.08)',
            background: active === cat ? 'rgba(227,227,219,0.08)' : 'transparent',
            color: active === cat ? '#e3e3db' : 'rgba(227,227,219,0.3)',
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   PAGE STATES
═══════════════════════════════════════════════════════════════ */
function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="fixed inset-0 bg-[#111] flex flex-col items-center justify-center gap-5 z-50">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-rt-spin text-rt-orange/70 shrink-0">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <p className="font-display text-[0.7rem] tracking-[0.22em] uppercase text-rt-cream/30">Loading retouches…</p>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div role="alert" className="fixed inset-0 bg-[#111] flex flex-col items-center justify-center gap-5 z-50 px-6">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="rgb(192 80 26/0.6)" strokeWidth="1.5" />
        <path d="M12 8v4M12 16h.01" stroke="rgb(192 80 26/0.8)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <p className="font-display text-[0.72rem] tracking-[0.16em] uppercase text-rt-cream/35 text-center max-w-[280px] leading-relaxed">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="font-display text-[0.7rem] tracking-[0.18em] uppercase px-7 py-3 border border-rt-cream/25 text-rt-cream/60 hover:border-rt-cream/50 hover:text-rt-cream/90 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-rt-orange cursor-pointer"
      >
        Retry
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RetouchGallery — root
═══════════════════════════════════════════════════════════════ */
export default function RetouchGallery() {
  // const { works, loading, error, refetch } = useRetouchData();
  const works = [
    {
      id: 1,
      title: 'Portrait Glow',
      category: 'Skin Retouch',
      before: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
      after: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      title: 'Cinematic Grade',
      category: 'Color Grade',
      before: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
      after: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      title: 'Sky Boost',
      category: 'Sky Replace',
      before: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7',
      after: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const loading = false;
  const error = null;
  const refetch = () => {};
  const isMobile = useIsMobile();

  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState(FILTER_ALL);
  const thumbStripRef = useRef(null);

  const filtered  = useMemo(() => (filter === FILTER_ALL ? works : works.filter((w) => w.category === filter)), [works, filter]);
  const activeIdx = useMemo(() => filtered.findIndex((w) => w.id === active?.id), [filtered, active]);
  const prev      = filtered[activeIdx - 1] ?? null;
  const next      = filtered[activeIdx + 1] ?? null;

  /* Init */
  useEffect(() => { if (works.length && !active) setActive(works[0]); }, [works]);

  /* Guard: re-select when filter removes active item */
  useEffect(() => {
    if (!filtered.length) return;
    if (!active || !filtered.find((w) => w.id === active.id)) setActive(filtered[0]);
  }, [filter, filtered]);

  /* Keyboard nav */
  useEffect(() => {
    const h = (e) => {
      if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && next) { e.preventDefault(); setActive(next); }
      if ((e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   && prev) { e.preventDefault(); setActive(prev); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [next, prev]);

  /* Auto-scroll active thumb into view */
  useEffect(() => {
    if (!thumbStripRef.current) return;
    const el = thumbStripRef.current.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [active?.id]);

  const onSelect       = useCallback((w) => setActive(w), []);
  const onFilterChange = useCallback((c) => setFilter(c), []);

  /* ── States ── */
  if (loading) return <PageLoader />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;
  if (!active) return null;

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="rt-gallery h-screen flex flex-col bg-[#111] text-rt-cream overflow-hidden relative pt-20 md:pt-24">

      {/* ══════ MAIN STAGE ══════ */}
      <div className="flex-1 flex flex-col min-h-0 relative">

        {/* ── Slider hero area ── */}
        <div className="flex-1 relative flex items-center justify-center min-h-0 px-4 md:px-12 py-4 md:py-6">

          {/* Dark vignette overlays */}
          <div className="absolute inset-0 pointer-events-none z-10" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-[#111]/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111]/40 via-transparent to-[#111]/40" />
          </div>

          {/* Floating title overlay */}
          <div className="absolute left-6 md:left-10 bottom-28 md:bottom-24 z-20 pointer-events-none">
            <div key={active.id + '-title'} className="rt-fade-up">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-rt-orange" aria-hidden="true" />
                <span className="font-display text-[0.6rem] tracking-[0.18em] uppercase text-rt-cream/40">
                  {active.category}
                </span>
              </div>
              <h2
                className="text-[2.8rem] md:text-[4.5rem] leading-[0.88] tracking-[-0.04em] uppercase text-rt-cream"
                style={{ fontFamily: 'var(--font-big-shoulders)', fontWeight: 900 }}
              >
                {active.title}
              </h2>
            </div>
          </div>

          {/* Counter */}
          <div className="absolute right-6 md:right-10 bottom-28 md:bottom-24 z-20 pointer-events-none">
            <div key={active.id + '-count'} className="rt-fade-up flex items-baseline gap-1">
              <span
                className="text-[2.5rem] md:text-[3.5rem] leading-none text-rt-orange"
                style={{ fontFamily: 'var(--font-big-shoulders)', fontWeight: 900 }}
              >
                {String(activeIdx + 1).padStart(2, '0')}
              </span>
              <span className="font-display text-[0.7rem] tracking-[0.1em] text-rt-cream/20 mb-1">
                / {String(filtered.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Slider container — portrait aspect ratio to match photo orientation */}
          <div
            key={active.id}
            className="relative h-full aspect-[3/4] max-h-[68vh] rounded-lg overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.65),0_0_0_1px_rgba(227,227,219,0.05)] rt-entrance z-10"
          >
            <BeforeAfterSlider before={active.before} after={active.after} />
          </div>
        </div>

        {/* ══════ BOTTOM NAVIGATION ══════ */}
        <div className="shrink-0 relative z-20 border-t border-rt-cream/[0.06] bg-[#111]">

          {/* Filter pills row */}
          <div className="px-5 md:px-8 pt-3 pb-1 rt-fade-up-delay-1">
            <FilterPills active={filter} onChange={onFilterChange} />
          </div>

          {/* Thumbnail strip + prev/next */}
          <div className="flex items-center gap-3 px-5 md:px-8 pb-4 pt-2">

            {/* Prev button */}
            <button
              onClick={() => prev && onSelect(prev)}
              disabled={!prev}
              aria-label="Previous"
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-rt-cream/10 text-rt-cream/30 hover:border-rt-cream/25 hover:text-rt-cream/60 disabled:opacity-20 disabled:cursor-default transition-all duration-200 cursor-pointer bg-transparent"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M6 2L3 5l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            {/* Thumbnail strip */}
            <div
              ref={thumbStripRef}
              className="flex-1 flex gap-3 overflow-x-auto py-1 select-none rt-fade-up-delay-2"
            >
              {filtered.map((w) => {
                const on = w.id === active?.id;
                return (
                  <button
                    key={w.id}
                    data-active={on}
                    onClick={() => onSelect(w)}
                    aria-current={on ? 'true' : undefined}
                    className={`rt-thumb shrink-0 flex flex-col items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-rt-orange rounded ${on ? 'rt-thumb-active' : ''}`}
                  >
                    <div
                      className="w-16 h-20 md:w-20 md:h-24 overflow-hidden rounded-md relative"
                      style={{
                        outline:       on ? '2px solid #c0501a' : '2px solid transparent',
                        outlineOffset: '2px',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={on ? w.after : w.before}
                        alt={w.title}
                        className="w-full h-full object-cover transition-all duration-400"
                        style={{ filter: on ? 'none' : 'grayscale(1) brightness(0.35)' }}
                      />
                      {on && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rt-orange" />}
                    </div>
                    <span
                      className="font-display text-[0.55rem] tracking-[0.12em] uppercase text-center max-w-[80px] truncate transition-colors duration-200"
                      style={{ color: on ? '#e3e3db' : 'rgba(227,227,219,0.25)' }}
                    >
                      {w.title}
                    </span>
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <p className="font-display text-[0.65rem] tracking-[0.16em] uppercase text-rt-cream/20 py-4">
                  No results
                </p>
              )}
            </div>

            {/* Next button */}
            <button
              onClick={() => next && onSelect(next)}
              disabled={!next}
              aria-label="Next"
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-rt-cream/10 text-rt-cream/30 hover:border-rt-cream/25 hover:text-rt-cream/60 disabled:opacity-20 disabled:cursor-default transition-all duration-200 cursor-pointer bg-transparent"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M4 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}