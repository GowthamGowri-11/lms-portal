'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

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
          // Enhanced metallic finish to preserve vibrant gradient
          mat.metalness = 0.25;
          mat.roughness = 0.22;
          // Reduce emissive to prevent washed-out appearance
          // Use subtle cyan emissive to enhance brightness without dulling
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
      // Delta clamping prevents spin jumps on tab blur / frame lag
      const safeDelta = Math.min(delta, 0.05);

      // Continuous smooth Y-axis rotation ONLY
      groupRef.current.rotation.y += safeDelta * 0.85;

      // FIXED vertical position: NO floating, NO bouncing, NO oscillation.
      // Logo maintains a constant, stable height above the pedestal.
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

useGLTF.preload('/models/atlyx-logo.glb');

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
        {/* Neutral ambient light to preserve gradient colors */}
        <ambientLight intensity={0.4} color="#ffffff" />

        {/* Primary key light - neutral white for definition */}
        <directionalLight position={[4, 6, 4]} intensity={0.9} color="#ffffff" />

        {/* Soft blue fill from the left - enhances blue regions */}
        <directionalLight position={[-4, 3, 3]} intensity={0.5} color="#2563eb" />

        {/* Purple rim light - accentuates lower-left purple gradient */}
        <directionalLight position={[-4, -2, -3]} intensity={1.2} color="#9333ea" />

        {/* Cyan rim light - accentuates top cyan regions */}
        <directionalLight position={[4, 2, -3]} intensity={1.0} color="#00f0ff" />

        {/* Subtle upward glow - reduced to prevent washout */}
        <pointLight position={[0, -1.0, 0.2]} intensity={1.5} distance={4} color="#00f0ff" />

        {/* Top-down light for apex bevel highlight - neutral */}
        <directionalLight position={[0, 5, 0]} intensity={0.3} color="#ffffff" />

        <AtlyxLogoModel />
      </Canvas>
    </div>
  );
}
