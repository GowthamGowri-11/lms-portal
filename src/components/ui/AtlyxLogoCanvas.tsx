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
          // Metallic finish with vibrant gradient preservation
          mat.metalness = 0.18;
          mat.roughness = 0.28;
          // Mid-blue emissive gives every face base luminosity,
          // ensuring vivid gradient visibility from all rotation angles
          mat.emissive = new THREE.Color(0x1a3a8f);
          mat.emissiveIntensity = 1.1;
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
          toneMappingExposure: 0.82,
        }}
        dpr={[1, 2]}
      >
        {/* Soft balanced ambient light */}
        <ambientLight intensity={0.55} color="#d0eeff" />

        {/* Primary key light */}
        <directionalLight position={[4, 6, 4]} intensity={1.1} color="#ffffff" />

        {/* Soft indigo fill from the left */}
        <directionalLight position={[-4, 3, 3]} intensity={0.75} color="#c7d2fe" />

        {/* Purple rim light — accentuates lower-left purple gradient */}
        <directionalLight position={[-4, -2, -3]} intensity={1.8} color="#9333ea" />

        {/* Cyan rim light — accentuates top slash and apex */}
        <directionalLight position={[4, 2, -3]} intensity={2.0} color="#00e5ff" />

        {/* Upward cyan glow from pedestal */}
        <pointLight position={[0, -1.0, 0.2]} intensity={3.5} distance={4} color="#00ffff" />

        {/* Top-down light for apex bevel highlight */}
        <directionalLight position={[0, 5, 0]} intensity={0.45} color="#e0f2fe" />

        <AtlyxLogoModel />
      </Canvas>
    </div>
  );
}
