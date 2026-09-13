'use client';

import React from 'react';
import styles from './HeroBackground.module.css';

export default function HeroBackground() {
  return (
    <div className={styles.heroAtmosphere} aria-hidden="true">
      {/* 1. Large Blurred Ambient Glow Light Sources */}
      <div className={styles.radialGlowPrimary} />
      <div className={styles.radialGlowSecondary} />
      <div className={styles.radialGlowAccent} />

      {/* 2. Extremely Faint Technical Coordinate Grid */}
      <div className={styles.faintDotGrid} />

      {/* 3. Subtle Curved Wave Ribbon & Flowing Gradients */}
      <svg
        className={styles.heroWaveSvg}
        viewBox="0 0 1440 340"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="heroWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(239, 246, 255, 0.7)" />
            <stop offset="45%" stopColor="rgba(219, 234, 254, 0.85)" />
            <stop offset="100%" stopColor="rgba(238, 242, 255, 0.6)" />
          </linearGradient>
          <linearGradient id="heroRibbonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Soft flowing wave fill */}
        <path
          d="M 0 240 C 380 150, 760 310, 1440 180 L 1440 340 L 0 340 Z"
          fill="url(#heroWaveGradient)"
        />

        {/* Laser contour wave edge line */}
        <path
          d="M 0 250 C 390 160, 800 320, 1440 190"
          stroke="url(#heroRibbonGradient)"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {/* 4. Subtle Ambient Floating Spheres */}
      <div className={styles.floatingSphereLeft} />
      <div className={styles.floatingSphereRight} />
    </div>
  );
}
