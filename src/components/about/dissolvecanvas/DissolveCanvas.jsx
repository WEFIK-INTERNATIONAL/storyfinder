'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '@/lib/shaders';

const CONFIG = {
    color: '#e3e3db',
    spread: 0.5,
};

function hexToVec3(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? new THREE.Vector3(
              parseInt(result[1], 16) / 255,
              parseInt(result[2], 16) / 255,
              parseInt(result[3], 16) / 255
          )
        : new THREE.Vector3(0.92, 0.96, 0.87);
}

// ── Inner scene — has access to R3F context ───────────────────────────────────
function DissolveMesh({ scrollProgressRef }) {
    const meshRef = useRef(null);
    const { size } = useThree();

    // Build uniforms once — mutated in useFrame, never recreated
    const uniforms = useMemo(
        () => ({
            uProgress: { value: 0 },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
            uColor: { value: hexToVec3(CONFIG.color) },
            uSpread: { value: CONFIG.spread },
        }),
        [] // eslint-disable-line react-hooks/exhaustive-deps
    );

    useEffect(() => {
        uniforms.uResolution.value.set(size.width, size.height);
    }, [size.width, size.height, uniforms]);

    // Every frame: push scroll progress → shader
    useFrame(() => {
        // Optimization: Skip rendering if the dissolve is completely off-screen or finished
        if (scrollProgressRef.current > 1.1) return;

        uniforms.uProgress.value = scrollProgressRef.current; // eslint-disable-line react-hooks/immutability
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

// ── Public component — renders the R3F Canvas ─────────────────────────────────
export default function DissolveCanvas({ scrollProgressRef }) {
    return (
        <Canvas
            orthographic
            camera={{
                left: -1,
                right: 1,
                top: 1,
                bottom: -1,
                near: 0,
                far: 1,
                position: [0, 0, 0.5],
            }}
            dpr={[1, 2]} // Optimization: Cap DPR on high-res screens to prevent massive GPU drain
            gl={{ alpha: true, antialias: false }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 2,
            }}
        >
            <DissolveMesh scrollProgressRef={scrollProgressRef} />
        </Canvas>
    );
}
