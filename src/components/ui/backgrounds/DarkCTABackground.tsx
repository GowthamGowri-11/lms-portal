'use client';

import React from 'react';
import styles from './DarkCTABackground.module.css';

export default function DarkCTABackground() {
  return (
    <div className={styles.ctaAtmosphere} aria-hidden="true">
      {/* 1. Deep Space Aurora Glows */}
      <div className={styles.auroraGlowCenter} />
      <div className={styles.auroraGlowBlue} />
      <div className={styles.auroraGlowPurple} />

      {/* 2. Large Faint ATLYX Geometric Silhouette */}
      <svg
        className={styles.atlyxSilhouette}
        viewBox="0 0 400 350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 200 40 L 320 280 L 260 280 L 230 210 L 170 210 L 140 280 L 80 280 Z M 200 120 L 180 175 L 220 175 Z"
          stroke="url(#silhouetteGrad)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <defs>
          <linearGradient id="silhouetteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* 3. Thin Orbital Rings */}
      <svg
        className={styles.orbitalRings}
        viewBox="0 0 900 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="450"
          cy="225"
          rx="420"
          ry="150"
          transform="rotate(-8 450 225)"
          stroke="#38bdf8"
          strokeWidth="1"
          strokeDasharray="4 8"
          strokeOpacity="0.2"
          className={styles.ringRotate}
        />
        <ellipse
          cx="450"
          cy="225"
          rx="360"
          ry="110"
          transform="rotate(6 450 225)"
          stroke="#818cf8"
          strokeWidth="0.8"
          strokeDasharray="6 6"
          strokeOpacity="0.15"
        />
      </svg>

      {/* 4. Micro Star-like Particles */}
      <div className={`${styles.starDot} ${styles.star1}`} />
      <div className={`${styles.starDot} ${styles.star2}`} />
      <div className={`${styles.starDot} ${styles.star3}`} />
      <div className={`${styles.starDot} ${styles.star4}`} />
      <div className={`${styles.starDot} ${styles.star5}`} />
      <div className={`${styles.starDot} ${styles.star6}`} />
    </div>
  );
}
