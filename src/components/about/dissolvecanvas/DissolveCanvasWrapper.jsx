'use client';

import dynamic from 'next/dynamic';

const DissolveCanvas = dynamic(() => import('./DissolveCanvas'), {
    ssr: false,
    loading: () => null,
});

export default function DissolveCanvasWrapper({ scrollProgressRef }) {
    return <DissolveCanvas scrollProgressRef={scrollProgressRef} />;
}
