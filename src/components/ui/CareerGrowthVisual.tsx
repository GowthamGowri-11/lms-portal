'use client';

import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import styles from './CareerGrowthVisual.module.css';

// Dynamically load 3D Canvas with ssr: false for Next.js
const AtlyxLogoCanvas = dynamic(() => import('./AtlyxLogoCanvas'), {
  ssr: false,
});

export default function CareerGrowthVisual() {
  return (
    <div className={styles.visualContainer}>
      {/* Ambient background light behind monument */}
      <div className={styles.ambientGlow} />

      {/* Center 3D ATLYX Monument Container */}
      <div className={styles.monumentContainer}>
        {/* Stationary Pedestal & Ambient Backdrop */}
        <div className={styles.monumentWrapper}>
          <Image
            src="/images/atlyx-monument-backdrop.png"
            alt="ATLYX 3D Career Growth Monument"
            width={480}
            height={480}
            priority
            className={styles.monumentImage}
          />

          {/* Genuine 3D Rotating Logo Model loaded via R3F useGLTF */}
          <div className={styles.canvasOverlay}>
            <AtlyxLogoCanvas />
          </div>
        </div>
      </div>
    </div>
  );
}
