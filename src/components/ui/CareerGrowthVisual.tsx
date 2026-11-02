'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Code2,
  TrendingUp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
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

      {/* ── CARD 1: TOP LEFT (03 • GROW - Career Capability) ── */}
      <motion.div
        className={`${styles.floatingCard} ${styles.cardGrow}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        whileHover={{ y: -4, scale: 1.02 }}
      >
        <div className={styles.cardHeader}>
          <div className={styles.iconCircleAmber}>
            <TrendingUp size={16} />
          </div>
          <span className={styles.pillAmber}>03 • GROW</span>
        </div>
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>Career Capability</h4>
          <p className={styles.cardDesc}>
            Sharpen problem-solving and in-demand industry tools
          </p>
        </div>
      </motion.div>

      {/* ── CARD 2: TOP RIGHT (CAREER READY) ── */}
      <motion.div
        className={`${styles.floatingCard} ${styles.cardCareerReady}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        whileHover={{ y: -4, scale: 1.02 }}
      >
        <div className={styles.cardHeader}>
          <div className={styles.iconCircleBlue}>
            <Sparkles size={16} />
          </div>
          <span className={styles.pillBlue}>CAREER READY</span>
        </div>
        <p className={styles.cardSingleText}>Portfolio Verified & Job Prepared</p>
      </motion.div>

      {/* ── CARD 3: BOTTOM LEFT (01 • LEARN - Practical Skills) ── */}
      <motion.div
        className={`${styles.floatingCard} ${styles.cardLearn}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        whileHover={{ y: -4, scale: 1.02 }}
      >
        <div className={styles.cardHeader}>
          <div className={styles.iconCircleBlue}>
            <GraduationCap size={16} />
          </div>
          <span className={styles.pillBlue}>01 • LEARN</span>
        </div>
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>Practical Skills</h4>
          <p className={styles.cardDesc}>
            Build solid foundations with expert-designed curriculum
          </p>
        </div>
      </motion.div>

      {/* ── CARD 4: MIDDLE RIGHT (02 • BUILD - Real-World Projects + Expert Guidance) ── */}
      <motion.div
        className={`${styles.floatingCard} ${styles.cardBuild}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        whileHover={{ y: -4, scale: 1.02 }}
      >
        <div className={styles.cardHeader}>
          <div className={styles.iconCircleGreen}>
            <Code2 size={16} />
          </div>
          <span className={styles.pillGreen}>02 • BUILD</span>
        </div>
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>Real-World Projects</h4>
          <p className={styles.cardDesc}>
            Apply concepts to production-grade engineering codebases
          </p>
        </div>
        <div className={styles.subPillRow}>
          <span className={styles.expertGuidancePill}>
            <ShieldCheck size={13} className={styles.guidanceCheckIcon} />
            <span>Expert Guidance</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
