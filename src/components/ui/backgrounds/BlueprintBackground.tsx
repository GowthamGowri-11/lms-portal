'use client';

import React from 'react';
import styles from './BlueprintBackground.module.css';

export default function BlueprintBackground() {
  return (
    <div className={styles.blueprintAtmosphere} aria-hidden="true">
      {/* 1. Blueprint Fine Technical Grid */}
      <div className={styles.blueprintGrid} />

      {/* 2. Soft Ambient Radial Glows */}
      <div className={styles.glowTopCenter} />
      <div className={styles.glowBottomRight} />

      {/* 3. Engineering Crosshairs & Coordinate Markers */}
      <div className={styles.crosshairTL}>+</div>
      <div className={styles.crosshairTR}>+</div>
      <div className={styles.crosshairBL}>+</div>
      <div className={styles.crosshairBR}>+</div>

      {/* 4. Abstract Blueprint Geometric Guide SVG */}
      <svg
        className={styles.blueprintSvg}
        viewBox="0 0 1200 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="blueprintLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Diagonal & Circular Blueprint Construction Lines */}
        <circle cx="200" cy="180" r="140" stroke="url(#blueprintLineGrad)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="200" cy="180" r="170" stroke="url(#blueprintLineGrad)" strokeWidth="0.75" />
        <circle cx="1000" cy="420" r="160" stroke="url(#blueprintLineGrad)" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Horizontal & Vertical Engineering Datum Lines */}
        <line x1="0" y1="180" x2="1200" y2="180" stroke="#2563eb" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="6 6" />
        <line x1="0" y1="420" x2="1200" y2="420" stroke="#2563eb" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="6 6" />
        <line x1="200" y1="0" x2="200" y2="600" stroke="#2563eb" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="6 6" />
        <line x1="1000" y1="0" x2="1000" y2="600" stroke="#2563eb" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="6 6" />
      </svg>
    </div>
  );
}
