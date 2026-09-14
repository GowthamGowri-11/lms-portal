'use client';

import React from 'react';
import styles from './AcademicBackground.module.css';

interface AcademicBackgroundProps {
  accent?: 'blue' | 'purple' | 'cyan';
}

export default function AcademicBackground({ accent = 'blue' }: AcademicBackgroundProps) {
  return (
    <div className={styles.academicAtmosphere} aria-hidden="true">
      {/* 1. Technical Coordinate Grid Pattern */}
      <div className={styles.coordinateGrid} />

      {/* 2. Soft Academic Radial Glows */}
      <div className={`${styles.glowPrimary} ${styles[`glow_${accent}`]}`} />
      <div className={styles.glowSecondary} />

      {/* 3. Engineering Precision SVG Geometric Blueprint Lines */}
      <svg
        className={styles.blueprintSvg}
        viewBox="0 0 1440 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="academicLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.04" />
            <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.18" />
            <stop offset="70%" stopColor="#818cf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.03" />
          </linearGradient>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Technical Blueprint Curves & Construction Lines */}
        <circle cx="1280" cy="120" r="180" stroke="url(#academicLineGrad)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="1280" cy="120" r="240" stroke="url(#academicLineGrad)" strokeWidth="0.75" />
        <circle cx="160" cy="380" r="160" stroke="url(#academicLineGrad)" strokeWidth="1" strokeDasharray="3 3" />

        {/* Technical Horizon & Flow Guide Lines */}
        <path
          d="M 0 320 Q 360 260 720 340 T 1440 280"
          stroke="url(#academicLineGrad)"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M 0 350 Q 400 290 800 370 T 1440 310"
          stroke="url(#academicLineGrad)"
          strokeWidth="0.8"
          strokeDasharray="6 6"
          fill="none"
        />

        {/* Node Points */}
        <circle cx="720" cy="340" r="3" fill="#38bdf8" />
        <circle cx="1280" cy="120" r="2.5" fill="#818cf8" />
        <circle cx="160" cy="380" r="2.5" fill="#38bdf8" />
      </svg>

      {/* 4. Subtle Engineering Crosshairs */}
      <div className={styles.crosshairTL}>+</div>
      <div className={styles.crosshairTR}>+</div>
      <div className={styles.crosshairBR}>+</div>
    </div>
  );
}
