'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './CareerGrowthVisual.module.css';

export default function CareerGrowthVisual() {
  return (
    <div className={styles.visualContainer}>
      {/* Ambient background light behind monument */}
      <div className={styles.ambientGlow} />

      {/* Center 3D ATLYX Monument Container */}
      <div className={styles.monumentContainer}>
        <motion.div
          className={styles.monumentWrapper}
          animate={{
            y: [-6, 6, -6],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Image
            src="/images/atlyx-3d-monument.png"
            alt="ATLYX 3D Career Growth Monument"
            width={380}
            height={380}
            priority
            className={styles.monumentImage}
          />
        </motion.div>
      </div>
    </div>
  );
}
