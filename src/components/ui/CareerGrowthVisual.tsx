'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Code2,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  ArrowUpRight,
} from 'lucide-react';
import styles from './CareerGrowthVisual.module.css';

export default function CareerGrowthVisual() {
  return (
    <div className={styles.visualContainer}>
      {/* Ambient background glow & subtle grid */}
      <div className={styles.ambientGlow} />

      {/* SVG Connecting Trajectory Path */}
      <svg
        className={styles.pathSvg}
        viewBox="0 0 540 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="careerPathGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Smooth S-curve trajectory from Stage 1 -> Stage 2 -> Stage 3 -> Career Ready */}
        <path
          d="M 140 370 C 180 340, 240 330, 360 270 C 440 230, 320 160, 220 120 C 180 100, 240 50, 380 40"
          stroke="url(#careerPathGrad)"
          strokeWidth="2.5"
          strokeDasharray="6 6"
          strokeLinecap="round"
          className={styles.animatedPath}
        />

        {/* Pathway Nodes */}
        <circle cx="140" cy="370" r="5" fill="#3b82f6" filter="url(#nodeGlow)" />
        <circle cx="360" cy="270" r="5" fill="#0d9488" filter="url(#nodeGlow)" />
        <circle cx="220" cy="120" r="5" fill="#2563eb" filter="url(#nodeGlow)" />
        <circle cx="380" cy="40" r="6" fill="#2563eb" filter="url(#nodeGlow)" />
      </svg>

      {/* ── STAGE 1: LEARN ── */}
      <motion.div
        className={`${styles.stageCard} ${styles.stageLearn}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ y: -4 }}
      >
        <div className={styles.stageHeader}>
          <div className={styles.iconBoxBlue}>
            <GraduationCap size={18} />
          </div>
          <span className={styles.stepBadge}>01 • LEARN</span>
        </div>
        <div className={styles.stageBody}>
          <h4 className={styles.stageTitle}>Practical Skills</h4>
          <p className={styles.stageDesc}>Build solid foundations with expert-designed curriculum</p>
        </div>
      </motion.div>

      {/* Floating Supporting Micro-Badge 1 */}
      <motion.div
        className={`${styles.floatingBadge} ${styles.badgeMentorship}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileHover={{ y: -2 }}
      >
        <ShieldCheck size={14} className={styles.badgeIconBlue} />
        <span>Expert Guidance</span>
      </motion.div>

      {/* ── STAGE 2: BUILD ── */}
      <motion.div
        className={`${styles.stageCard} ${styles.stageBuild}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        whileHover={{ y: -4 }}
      >
        <div className={styles.stageHeader}>
          <div className={styles.iconBoxTeal}>
            <Code2 size={18} />
          </div>
          <span className={styles.stepBadgeTeal}>02 • BUILD</span>
        </div>
        <div className={styles.stageBody}>
          <h4 className={styles.stageTitle}>Real-World Projects</h4>
          <p className={styles.stageDesc}>Apply concepts to production-grade engineering codebases</p>
        </div>
      </motion.div>

      {/* Floating Supporting Micro-Badge 2 */}
      <motion.div
        className={`${styles.floatingBadge} ${styles.badgeProjects}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        whileHover={{ y: -2 }}
      >
        <Briefcase size={14} className={styles.badgeIconGreen} />
        <span>Career-Focused Learning</span>
      </motion.div>

      {/* ── STAGE 3: GROW ── */}
      <motion.div
        className={`${styles.stageCard} ${styles.stageGrow}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        whileHover={{ y: -4 }}
      >
        <div className={styles.stageHeader}>
          <div className={styles.iconBoxAmber}>
            <TrendingUp size={18} />
          </div>
          <span className={styles.stepBadgeAmber}>03 • GROW</span>
        </div>
        <div className={styles.stageBody}>
          <h4 className={styles.stageTitle}>Career Capability</h4>
          <p className={styles.stageDesc}>Sharpen problem-solving and in-demand industry tools</p>
        </div>
      </motion.div>

      {/* ── DESTINATION APEX: CAREER READY ── */}
      <motion.div
        className={styles.apexDestination}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        whileHover={{ y: -3 }}
      >
        <div className={styles.apexHeader}>
          <div className={styles.apexIconBox}>
            <Sparkles size={16} />
          </div>
          <span className={styles.apexBadgeText}>CAREER READY</span>
        </div>
        <p className={styles.apexSubtitle}>Portfolio Verified & Job Prepared</p>
      </motion.div>
    </div>
  );
}
