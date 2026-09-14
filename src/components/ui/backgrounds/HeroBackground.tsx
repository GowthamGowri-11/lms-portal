'use client';

import React from 'react';
import Image from 'next/image';
import styles from './HeroBackground.module.css';

export default function HeroBackground() {
  return (
    <div className={styles.heroAtmosphere} aria-hidden="true">
      {/* 1. Large Blurred Ambient Glow Light Sources */}
      <div className={styles.radialGlowPrimary} />
      <div className={styles.radialGlowSecondary} />
      <div className={styles.radialGlowAccent} />

      {/* 2. Fluid 3D Silk Wave Backdrop */}
      <div className={styles.waveBackdrop}>
        <Image
          src="/images/hero-bg-waves.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.bgWaveImg}
        />
        <div className={styles.waveOverlay} />
      </div>

      {/* 3. Subtle Ambient Floating Spheres */}
      <div className={styles.floatingSphereLeft} />
      <div className={styles.floatingSphereRight} />
    </div>
  );
}
