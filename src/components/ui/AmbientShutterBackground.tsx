'use client';

import React from 'react';
import styles from './AmbientShutterBackground.module.css';

export default function AmbientShutterBackground() {
  return (
    <div className={styles.shutterCanvas} aria-hidden="true">
      {/* 1. Shutter Louver & Slit Pattern Overlay */}
      <div className={styles.shutterLouvers} />

      {/* 2. Micro Noise / Grain Filter Layer */}
      <div className={styles.grainTexture} />

      {/* 3. Multi-Point Floating Ambient Filter Lights */}
      <div className={`${styles.ambientOrb} ${styles.orb1}`} />
      <div className={`${styles.ambientOrb} ${styles.orb2}`} />
      <div className={`${styles.ambientOrb} ${styles.orb3}`} />
      <div className={`${styles.ambientOrb} ${styles.orb4}`} />

      {/* 4. Top Optical Shutter Ray */}
      <div className={styles.shutterLightRay} />
    </div>
  );
}
