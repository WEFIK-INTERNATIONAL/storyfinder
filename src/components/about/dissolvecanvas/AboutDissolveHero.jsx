'use client';

import { useRef } from 'react';
import { useLenis } from 'lenis/react';
import DissolveCanvas from '@/components/about/dissolvecanvas/DissolveCanvasWrapper';
import ScrollWords from '@/components/about/dissolvecanvas/ScrollWords';
import Image from 'next/image';
import Copy from '@/components/ui/copy/Copy';

const SPEED = 2;

export default function Home() {
    const heroRef = useRef(null);
    const scrollProgressRef = useRef(0);
    useLenis(({ scroll }) => {
        if (!heroRef.current) return;
        const maxScroll = heroRef.current.offsetHeight - window.innerHeight;
        scrollProgressRef.current = Math.min((scroll / maxScroll) * SPEED, 1.1);
    });

    return (
        <main>
            <section
                ref={heroRef}
                className="relative w-full h-[175svh] overflow-hidden text-white"
            >
                <div className="absolute inset-0">
                    <Image
                        src="/stock/supratik_img.jpg"
                        alt="Hero background"
                        fill
                        priority
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-1/4 -translate-y-1/4 flex flex-col items-center justify-center gap-2 text-center z-1">
                    <Copy delay={0.8}>
                        <h1>Storyfinder</h1>
                    </Copy>
                    <Copy delay={0.95}>
                        <p>Sometimes loneliness is the clearest lens.</p>
                    </Copy>
                </div>
                <DissolveCanvas scrollProgressRef={scrollProgressRef} />
                <ScrollWords text="I find stories where others see silence. Armed with a camera and an obsession with light, I chase moments that refuse to repeat themselves" />
            </section>
        </main>
    );
}
