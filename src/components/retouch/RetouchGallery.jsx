'use client';

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import Image from 'next/image';
import { useDragScroll } from '@/hooks/useDragScroll';
import BeforeAfterSlider from './BeforeAfterSlider';
import './Retouch.css';

const CATEGORIES = [
    'Skin Retouch',
    'Color Grade',
    'Light Edit',
    'Composite',
    'Dodge & Burn',
    'Sky Replace',
];
const FILTER_ALL = 'All';

function useIsMobile(bp = 768) {
    const [mobile, setMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(`(max-width: ${bp - 1}px)`).matches;
    });
    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${bp - 1}px)`);
        const h = (e) => setMobile(e.matches);
        mq.addEventListener('change', h);
        return () => mq.removeEventListener('change', h);
    }, [bp]);
    return mobile;
}

const FilterPills = memo(function FilterPills({
    active,
    onChange,
    categories,
}) {
    const { ref: dragRef, onClick: onDragClick } = useDragScroll();
    return (
        <div
            ref={dragRef}
            onClick={onDragClick}
            role="group"
            aria-label="Filter by category"
            className="flex gap-2 overflow-x-auto select-none px-1 py-1"
        >
            {[FILTER_ALL, ...categories].map((cat) => (
                <button
                    key={cat}
                    onClick={() => onChange(cat)}
                    aria-pressed={active === cat}
                    className="shrink-0 font-display text-[0.65rem] tracking-[0.18em] uppercase px-4 py-1.5 rounded-full border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-rt-orange cursor-pointer"
                    style={{
                        borderColor:
                            active === cat
                                ? 'rgba(227,227,219,0.4)'
                                : 'rgba(227,227,219,0.08)',
                        background:
                            active === cat
                                ? 'rgba(227,227,219,0.08)'
                                : 'transparent',
                        color:
                            active === cat
                                ? '#e3e3db'
                                : 'rgba(227,227,219,0.3)',
                    }}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
});

function PageLoader() {
    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 bg-[#111] flex flex-col items-center justify-center gap-5 z-50"
        >
            <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                className="animate-rt-spin text-rt-orange/70 shrink-0"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeOpacity="0.2"
                />
                <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                />
            </svg>
            <p className="font-display text-[0.7rem] tracking-[0.22em] uppercase text-rt-cream/30">
                Loading retouches…
            </p>
        </div>
    );
}

function ErrorBanner({ message, onRetry }) {
    return (
        <div
            role="alert"
            className="fixed inset-0 bg-[#111] flex flex-col items-center justify-center gap-5 z-50 px-6"
        >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgb(192 80 26/0.6)"
                    strokeWidth="1.5"
                />
                <path
                    d="M12 8v4M12 16h.01"
                    stroke="rgb(192 80 26/0.8)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
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

export default function RetouchGallery({ works = [] }) {
    const isMobile = useIsMobile();

    const dynamicCategories = useMemo(() => {
        const cats = new Set(works.map((w) => w.category).filter(Boolean));
        return Array.from(cats);
    }, [works]);

    const [active, setActive] = useState(null);
    const [filter, setFilter] = useState(FILTER_ALL);
    const thumbStripRef = useRef(null);

    const filtered = useMemo(
        () =>
            filter === FILTER_ALL
                ? works
                : works.filter((w) => w.category === filter),
        [works, filter]
    );
    const activeIdx = useMemo(
        () => filtered.findIndex((w) => w.id === active?.id),
        [filtered, active]
    );
    const prev = filtered[activeIdx - 1] ?? null;
    const next = filtered[activeIdx + 1] ?? null;

    useEffect(() => {
        if (works.length && !active) {
            const t = setTimeout(() => setActive(works[0]), 0);
            return () => clearTimeout(t);
        }
    }, [works, active]);

    useEffect(() => {
        if (!filtered.length) return;
        if (!active || !filtered.find((w) => w.id === active.id)) {
            const t = setTimeout(() => setActive(filtered[0]), 0);
            return () => clearTimeout(t);
        }
    }, [filter, filtered, active]);

    useEffect(() => {
        const h = (e) => {
            if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && next) {
                e.preventDefault();
                setActive(next);
            }
            if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && prev) {
                e.preventDefault();
                setActive(prev);
            }
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [next, prev]);

    useEffect(() => {
        if (!thumbStripRef.current) return;
        const el = thumbStripRef.current.querySelector('[data-active="true"]');
        if (el)
            el.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
            });
    }, [active?.id]);

    const onSelect = useCallback((w) => setActive(w), []);
    const onFilterChange = useCallback((c) => setFilter(c), []);

    if (works.length === 0)
        return (
            <ErrorBanner
                message="No retouch works found."
                onRetry={() => window.location.reload()}
            />
        );
    if (!active) return null;

    return (
        <div className="rt-gallery h-screen flex flex-col bg-[#111] text-rt-cream overflow-hidden relative pt-20 md:pt-24">
            {}
            <div className="flex-1 flex flex-col min-h-0 relative">
                {}
                <div className="flex-1 relative flex flex-col md:flex-row items-center justify-center min-h-0 px-4 md:px-8 lg:px-12 py-2 md:py-4 gap-0 md:gap-6 lg:gap-10">
                    {}
                    <div
                        className="absolute inset-0 pointer-events-none z-1"
                        aria-hidden="true"
                    >
                        <div className="absolute inset-0 bg-linear-to-t from-[#111] via-transparent to-[#111]/70" />
                        <div className="absolute inset-0 bg-linear-to-r from-[#111]/40 via-transparent to-[#111]/40" />
                    </div>

                    {}
                    <div className="hidden md:flex flex-col justify-end items-start shrink-0 z-10 pb-4 min-w-[120px] lg:min-w-[160px]">
                        <div key={active.id + '-title'} className="rt-fade-up">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div
                                    className="w-2 h-2 rounded-full bg-rt-orange"
                                    aria-hidden="true"
                                />
                                <span className="font-display text-[0.6rem] tracking-[0.18em] uppercase text-rt-cream/40">
                                    {active.category}
                                </span>
                            </div>
                            <h2
                                className="text-[2.8rem] lg:text-[4rem] leading-[0.88] tracking-[-0.04em] uppercase text-rt-cream"
                                style={{
                                    fontFamily: 'var(--font-big-shoulders)',
                                    fontWeight: 900,
                                }}
                            >
                                {active.title}
                            </h2>
                        </div>
                    </div>

                    {}
                    <div
                        key={active.id}
                        className="rt-slider-container relative rounded-lg overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.65),0_0_0_1px_rgba(227,227,219,0.05)] rt-entrance z-10"
                    >
                        <BeforeAfterSlider
                            before={active.before}
                            after={active.after}
                            beforeLqip={active.beforeLqip}
                            afterLqip={active.afterLqip}
                            aspectRatio={active.aspectRatio}
                        />
                    </div>

                    {}
                    <div className="hidden md:flex flex-col justify-end items-end shrink-0 z-10 pb-4 min-w-[80px] lg:min-w-[120px]">
                        <div
                            key={active.id + '-count'}
                            className="rt-fade-up flex items-baseline gap-1"
                        >
                            <span
                                className="text-[2.5rem] lg:text-[3.5rem] leading-none text-rt-orange"
                                style={{
                                    fontFamily: 'var(--font-big-shoulders)',
                                    fontWeight: 900,
                                }}
                            >
                                {String(activeIdx + 1).padStart(2, '0')}
                            </span>
                            <span className="font-display text-[0.7rem] tracking-widest text-rt-cream/20 mb-1">
                                / {String(filtered.length).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {}
                    <div className="flex md:hidden items-end justify-between w-full z-10 px-1 pt-2 pb-1 shrink-0">
                        <div
                            key={active.id + '-title-m'}
                            className="rt-fade-up"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div
                                    className="w-1.5 h-1.5 rounded-full bg-rt-orange"
                                    aria-hidden="true"
                                />
                                <span className="font-display text-[0.5rem] tracking-[0.18em] uppercase text-rt-cream/40">
                                    {active.category}
                                </span>
                            </div>
                            <h2
                                className="text-[1.4rem] leading-[0.88] tracking-[-0.04em] uppercase text-rt-cream"
                                style={{
                                    fontFamily: 'var(--font-big-shoulders)',
                                    fontWeight: 900,
                                }}
                            >
                                {active.title}
                            </h2>
                        </div>
                        <div
                            key={active.id + '-count-m'}
                            className="rt-fade-up flex items-baseline gap-1"
                        >
                            <span
                                className="text-[1.6rem] leading-none text-rt-orange"
                                style={{
                                    fontFamily: 'var(--font-big-shoulders)',
                                    fontWeight: 900,
                                }}
                            >
                                {String(activeIdx + 1).padStart(2, '0')}
                            </span>
                            <span className="font-display text-[0.55rem] tracking-widest text-rt-cream/20">
                                / {String(filtered.length).padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                </div>

                {}
                <div className="shrink-0 relative z-20 border-t border-rt-cream/6 bg-[#111]">
                    {}
                    <div className="px-5 md:px-8 pt-3 pb-1 rt-fade-up-delay-1">
                        <FilterPills
                            active={filter}
                            onChange={onFilterChange}
                            categories={dynamicCategories}
                        />
                    </div>

                    {}
                    <div className="flex items-center gap-3 px-5 md:px-8 pb-4 pt-2">
                        {}
                        <button
                            onClick={() => prev && onSelect(prev)}
                            disabled={!prev}
                            aria-label="Previous"
                            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-rt-cream/10 text-rt-cream/30 hover:border-rt-cream/25 hover:text-rt-cream/60 disabled:opacity-20 disabled:cursor-default transition-all duration-200 cursor-pointer bg-transparent"
                        >
                            <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                            >
                                <path
                                    d="M6 2L3 5l3 3"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        {}
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
                                        className={`rt-thumb shrink-0 flex flex-col items-center gap-2 bg-transparent border-none p-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-rt-orange rounded group transition-all duration-300 ease-out ${on ? 'rt-thumb-active scale-105' : 'scale-95 opacity-60 hover:opacity-100 hover:scale-100'}`}
                                    >
                                        <div
                                            className="w-16 h-20 md:w-20 md:h-24 overflow-hidden rounded-md relative transition-all duration-300 ease-out"
                                            style={{
                                                boxShadow: on
                                                    ? '0 0 0 1px #c0501a, 0 8px 32px rgba(192,80,26,0.3)'
                                                    : '0 4px 12px rgba(0,0,0,0.4)',
                                            }}
                                        >
                                            <Image
                                                src={on ? w.after : w.before}
                                                alt={w.title}
                                                fill
                                                sizes="80px"
                                                placeholder={
                                                    (
                                                        on
                                                            ? w.afterLqip
                                                            : w.beforeLqip
                                                    )
                                                        ? 'blur'
                                                        : 'empty'
                                                }
                                                blurDataURL={
                                                    on
                                                        ? w.afterLqip
                                                        : w.beforeLqip
                                                }
                                                className="object-cover transition-all duration-500 ease-out"
                                                style={{
                                                    filter: on
                                                        ? 'none'
                                                        : 'grayscale(0.8) brightness(0.4)',
                                                    transform: on
                                                        ? 'scale(1.05)'
                                                        : 'scale(1)',
                                                }}
                                            />
                                        </div>
                                        <span
                                            className="font-display text-[0.55rem] tracking-[0.12em] uppercase text-center max-w-[80px] truncate transition-all duration-300 ease-out"
                                            style={{
                                                color: on
                                                    ? '#fff'
                                                    : 'rgba(227,227,219,0.35)',
                                                fontWeight: on ? 600 : 400,
                                                textShadow: on
                                                    ? '0 2px 10px rgba(255,255,255,0.2)'
                                                    : 'none',
                                            }}
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

                        {}
                        <button
                            onClick={() => next && onSelect(next)}
                            disabled={!next}
                            aria-label="Next"
                            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-rt-cream/10 text-rt-cream/30 hover:border-rt-cream/25 hover:text-rt-cream/60 disabled:opacity-20 disabled:cursor-default transition-all duration-200 cursor-pointer bg-transparent"
                        >
                            <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                            >
                                <path
                                    d="M4 2l3 3-3 3"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
