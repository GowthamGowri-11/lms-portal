'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Code2,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import styles from './CareerGrowthVisual.module.css';

export default function CareerGrowthVisual() {
  return (
    <div className={styles.visualContainer}>
      {/* Background Ambient Glow & Orbital Particle Rings */}
      <div className={styles.ambientGlow} />

      {/* Center 3D ATLYX Monument & Pedestal */}
      <div className={styles.monumentContainer}>
        {/* Orbital Elliptical Rings */}
        <svg
          className={styles.orbitalRings}
          viewBox="0 0 420 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="orbitGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="orbitGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Large Orbital Ellipse */}
          <ellipse
            cx="210"
            cy="190"
            rx="180"
            ry="75"
            transform="rotate(-18 210 190)"
            stroke="url(#orbitGrad1)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className={styles.orbitPulse}
          />

          {/* Secondary Ring */}
          <ellipse
            cx="210"
            cy="195"
            rx="150"
            ry="60"
            transform="rotate(12 210 195)"
            stroke="url(#orbitGrad2)"
            strokeWidth="1.2"
          />

          {/* Glowing Orbit Particle Dots */}
          <circle cx="80" cy="140" r="3.5" fill="#38bdf8" filter="url(#glowFilter)" />
          <circle cx="340" cy="150" r="3" fill="#a855f7" filter="url(#glowFilter)" />
          <circle cx="280" cy="245" r="3.5" fill="#2563eb" filter="url(#glowFilter)" />
        </svg>

        {/* 3D Monument SVG */}
        <div className={styles.monument3D}>
          <svg
            viewBox="0 0 320 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.monumentSvg}
          >
            <defs>
              {/* Pedestal Gradients */}
              <radialGradient id="pedestalGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="pedestalRim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="pedestalGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              <linearGradient id="neonLightRing" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>

              {/* 3D A-Letter Gradients */}
              <linearGradient id="stemLeftFront" x1="0%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="40%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#00d2ff" />
              </linearGradient>

              <linearGradient id="stemLeftBevel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>

              <linearGradient id="stemRightWing" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="60%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              <linearGradient id="innerShade" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#312e81" stopOpacity="0.4" />
              </linearGradient>

              <filter id="pedestalNeon" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Pedestal Bottom Base Layer */}
            <ellipse cx="160" cy="245" rx="110" ry="32" fill="url(#pedestalGlass)" stroke="url(#pedestalRim)" strokeWidth="1.5" />
            <ellipse cx="160" cy="240" rx="100" ry="28" fill="#ffffff" />
            
            {/* Pedestal Tier 2 with Neon Rim */}
            <ellipse cx="160" cy="235" rx="90" ry="24" fill="url(#pedestalGlass)" stroke="url(#pedestalRim)" strokeWidth="1" />
            <ellipse cx="160" cy="232" rx="85" ry="22" fill="#ffffff" />
            <ellipse cx="160" cy="232" rx="85" ry="22" stroke="url(#neonLightRing)" strokeWidth="2" filter="url(#pedestalNeon)" />

            {/* Pedestal Top Tier Stage */}
            <ellipse cx="160" cy="225" rx="68" ry="16" fill="url(#pedestalGlow)" />
            <ellipse cx="160" cy="222" rx="65" ry="15" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

            {/* 3D Geometric "A" Monument */}
            <g className={styles.glowingMonument}>
              {/* Left Back Extrusion / 3D Shadow Depth */}
              <polygon
                points="138,50 156,58 78,212 56,204"
                fill="url(#innerShade)"
              />

              {/* Crossbar 3D Depth */}
              <polygon
                points="102,154 195,154 185,172 90,172"
                fill="#1e3a8a"
              />

              {/* Main Left Stem (Faceted 3D Prism) */}
              <polygon
                points="142,48 158,55 86,212 62,206"
                fill="url(#stemLeftFront)"
              />

              {/* Left Stem Top Highlight Bevel */}
              <polygon
                points="142,48 152,42 168,49 158,55"
                fill="#93c5fd"
              />

              {/* Left Outer Facet */}
              <polygon
                points="142,48 158,55 125,125 110,120"
                fill="url(#stemLeftBevel)"
              />

              {/* Right Dynamic Angular Wing / Peak (The Fast Forward / Checkmark Stroke) */}
              <polygon
                points="158,55 248,118 190,210 162,172 215,130 150,85"
                fill="url(#stemRightWing)"
              />

              {/* Right Wing Top Bevel Highlight */}
              <polygon
                points="158,55 248,118 256,124 166,61"
                fill="#bae6fd"
              />

              {/* Front Center Dynamic Crossbar Accent */}
              <polygon
                points="95,148 202,148 188,168 82,168"
                fill="url(#stemLeftFront)"
              />

              {/* Sharp Cyan Checkmark Crest Accent */}
              <path
                d="M 152 75 L 248 118 L 175 195"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#pedestalNeon)"
              />
            </g>
          </svg>
        </div>
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
            <TrendingUp size={15} />
          </div>
          <span className={styles.pillAmber}>03 • GROW</span>
        </div>
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>Career Capability</h4>
          <p className={styles.cardDesc}>Sharpen problem-solving and in-demand industry tools</p>
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
            <Sparkles size={15} />
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
            <GraduationCap size={15} />
          </div>
          <span className={styles.pillBlue}>01 • LEARN</span>
        </div>
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>Practical Skills</h4>
          <p className={styles.cardDesc}>Build solid foundations with expert-designed curriculum</p>
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
            <Code2 size={15} />
          </div>
          <span className={styles.pillGreen}>02 • BUILD</span>
        </div>
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>Real-World Projects</h4>
          <p className={styles.cardDesc}>Apply concepts to production-grade engineering codebases</p>
        </div>
        <div className={styles.subPillRow}>
          <span className={styles.expertGuidancePill}>
            <ShieldCheck size={12} className={styles.guidanceCheckIcon} />
            <span>Expert Guidance</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
