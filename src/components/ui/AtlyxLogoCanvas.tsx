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
          mat.roughness = 0.2;
          mat.metalness = 0.35;
          mat.emissive = new THREE.Color(0x0c1e38);
          mat.emissiveIntensity = 0.5;
          mat.side = THREE.DoubleSide;
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Continuous smooth rotation around vertical Y-axis
      groupRef.current.rotation.y += delta * 0.85;

      // Subtle gentle hovering oscillation
      groupRef.current.position.y = 0.26 + Math.sin(state.clock.elapsedTime * 1.8) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.26, 0]}>
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
        }}
        dpr={[1, 2]}
      >
        {/* Balanced studio and ambient lights */}
        <ambientLight intensity={1.3} color="#f0f9ff" />

        {/* Primary key light (front-top-right) */}
        <directionalLight position={[4, 6, 4]} intensity={2.2} color="#ffffff" />

        {/* Secondary fill light (left-front) */}
        <directionalLight position={[-4, 3, 3]} intensity={1.5} color="#c7d2fe" />

        {/* Purple rim light (accentuating lower-left purple gradient) */}
        <directionalLight position={[-4, -2, -3]} intensity={2.0} color="#9333ea" />

        {/* Cyan rim light (accentuating top-right cyan slash & apex) */}
        <directionalLight position={[4, 2, -3]} intensity={2.2} color="#00e5ff" />

        {/* Upward cyan pedestal glow light */}
        <pointLight position={[0, -1.0, 0.2]} intensity={4.0} distance={4} color="#00ffff" />

        {/* Top down light for apex bevel highlight */}
        <directionalLight position={[0, 5, 0]} intensity={1.0} color="#e0f2fe" />

        <AtlyxLogoModel />
      </Canvas>
    </div>
  );
}

