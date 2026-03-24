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

function DissolveMesh({ scrollProgressRef }) {
    const meshRef = useRef(null);
    const materialRef = useRef(null);
    const { size } = useThree();

    const uniforms = useMemo(
        () => ({
            uProgress: { value: 0 },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
            uColor: { value: hexToVec3(CONFIG.color) },
            uSpread: { value: CONFIG.spread },
        }),
        [size.width, size.height]
    );

    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.uResolution.value.set(
                size.width,
                size.height
            );
        }
    }, [size.width, size.height]);

    useFrame(() => {
        if (!materialRef.current) return;
        if (scrollProgressRef.current > 1.1) return;

        materialRef.current.uniforms.uProgress.value =
            scrollProgressRef.current;
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

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
            dpr={[1, 2]}
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
