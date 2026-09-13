'use client';

import React from 'react';
import styles from './CurriculumAuroraBackground.module.css';

export default function CurriculumAuroraBackground() {
  return (
    <div className={styles.auroraAtmosphere} aria-hidden="true">
      {/* 1. Large Aurora Glow Waves */}
      <div className={styles.auroraGlowLeft} />
      <div className={styles.auroraGlowRight} />
      <div className={styles.auroraGlowCenter} />

      {/* 2. Edge Geometric 3D Building Blocks (Isometric Facets) */}
      <svg
        className={styles.edgeShapesLeft}
        viewBox="0 0 300 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="cubeRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Floating Layer 1 Isometric Cube */}
        <g className={styles.floatingShape1}>
          <polygon points="80,100 130,75 180,100 130,125" fill="url(#cubeTop)" stroke="#93c5fd" strokeWidth="0.75" strokeOpacity="0.4" />
          <polygon points="80,100 130,125 130,185 80,160" fill="url(#cubeLeft)" />
          <polygon points="130,125 180,100 180,160 130,185" fill="url(#cubeRight)" />
        </g>

        {/* Smaller Secondary Cube */}
        <g className={styles.floatingShape2}>
          <polygon points="40,240 70,225 100,240 70,255" fill="url(#cubeTop)" stroke="#c4b5fd" strokeWidth="0.75" strokeOpacity="0.3" />
          <polygon points="40,240 70,255 70,290 40,275" fill="url(#cubeLeft)" />
          <polygon points="70,255 100,240 100,275 70,290" fill="url(#cubeRight)" />
        </g>
      </svg>

      {/* Right Edge Abstract Geometric Ring & Grid */}
      <svg
        className={styles.edgeShapesRight}
        viewBox="0 0 300 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="220" cy="180" r="90" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.25" />
        <circle cx="220" cy="180" r="120" stroke="#818cf8" strokeWidth="0.75" strokeOpacity="0.2" />
        
        {/* Abstract Layer 2 Cube */}
        <g className={styles.floatingShape3}>
          <polygon points="180,140 220,120 260,140 220,160" fill="url(#cubeTop)" stroke="#93c5fd" strokeWidth="0.75" strokeOpacity="0.4" />
          <polygon points="180,140 220,160 220,210 180,190" fill="url(#cubeLeft)" />
          <polygon points="220,160 260,140 260,190 220,210" fill="url(#cubeRight)" />
        </g>
      </svg>

      {/* 3. Subtle Dotted Matrix Texture */}
      <div className={styles.subtleDotMatrix} />
    </div>
  );
}
