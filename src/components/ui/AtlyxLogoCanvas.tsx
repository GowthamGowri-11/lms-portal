'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Inner model component — only rendered after Canvas mounts
function AtlyxLogoModel() {
  const { scene } = useGLTF('/models/atlyx-logo.glb');
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.vertexColors = true;
          mat.metalness = 0.25;
          mat.roughness = 0.22;
          mat.emissive = new THREE.Color(0x06b6d4);
          mat.emissiveIntensity = 0.15;
          mat.side = THREE.DoubleSide;
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      // Clamp delta to prevent spin-jump on tab blur / heavy frames
      const safeDelta = Math.min(delta, 0.05);
      groupRef.current.rotation.y += safeDelta * 0.85;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.48, 0]}>
      <primitive
        object={scene}
        scale={1.22}
        rotation={[0.08, 0, 0]}
      />
    </group>
  );
}

// Transparent placeholder shown while the model loads
function CanvasLoader() {
  return null;
}

export default function AtlyxLogoCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0.1, 4.3], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        dpr={[1, 2]}
      >
        {/* Neutral ambient light preserves gradient colours */}
        <ambientLight intensity={0.4} color="#ffffff" />

        {/* Primary key light */}
        <directionalLight position={[4, 6, 4]} intensity={0.9} color="#ffffff" />

        {/* Soft blue fill from the left */}
        <directionalLight position={[-4, 3, 3]} intensity={0.5} color="#2563eb" />

        {/* Purple rim — accentuates lower-left gradient */}
        <directionalLight position={[-4, -2, -3]} intensity={1.2} color="#9333ea" />

        {/* Cyan rim — accentuates top cyan regions */}
        <directionalLight position={[4, 2, -3]} intensity={1.0} color="#00f0ff" />

        {/* Subtle upward glow */}
        <pointLight position={[0, -1.0, 0.2]} intensity={1.5} distance={4} color="#00f0ff" />

        {/* Top-down apex bevel highlight */}
        <directionalLight position={[0, 5, 0]} intensity={0.3} color="#ffffff" />

        {/* Wrap model in Suspense so a GLB load delay never crashes the chunk */}
        <Suspense fallback={<CanvasLoader />}>
          <AtlyxLogoModel />
        </Suspense>
      </Canvas>
    </div>
  );
}
