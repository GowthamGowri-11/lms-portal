'use client';

import React from 'react';
import styles from './ATLYXLoadingScreen.module.css';

interface ATLYXLoadingScreenProps {
  isExiting?: boolean;
}

export default function ATLYXLoadingScreen({ isExiting = false }: ATLYXLoadingScreenProps) {
  return (
    <div
      className={`${styles.overlay} ${isExiting ? styles.overlayExit : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading ATLYX learning experience"
    >
      <div className={styles.centerContainer}>
        {/* Spinner ring enclosing the logo */}
        <div className={styles.spinnerRing}>
          <svg className={styles.spinnerSvg} viewBox="0 0 100 100">
            <circle
              className={styles.spinnerTrack}
              cx="50"
              cy="50"
              r="44"
            />
            <circle
              className={styles.spinnerArc}
              cx="50"
              cy="50"
              r="44"
            />
          </svg>
        </div>

        {/* ATLYX Exact Brand Logo */}
        <div className={styles.logoWrap}>
          <img
            src="/atlyx-logo.png"
            alt="ATLYX"
            className={styles.logoImg}
          />
        </div>
      </div>

      <span className={styles.srOnly}>Loading page content...</span>
    </div>
  );
}
