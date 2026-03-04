"use client";

import dynamic from "next/dynamic";

// R3F Canvas uses WebGL — must be client-only, no SSR
const DissolveCanvas = dynamic(() => import("./DissolveCanvas"), {
  ssr: false,
  loading: () => null,
});

export default function DissolveCanvasWrapper({ scrollProgressRef }) {
    return <DissolveCanvas scrollProgressRef={scrollProgressRef} />;
}
