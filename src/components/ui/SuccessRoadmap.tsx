'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Flame, Target, RotateCw, Zap, Trophy, Compass } from 'lucide-react';
import styles from './SuccessRoadmap.module.css';

interface RoadmapStep {
  id: string;
  number: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  iconColor: string;
  accentColor: string;
  iconBg: string;
  positionClass: string;
}

const roadmapSteps: RoadmapStep[] = [
  {
    id: 'step1',
    number: '01',
    title: 'Hunger to Win',
    desc: 'The journey starts with an intense desire to succeed. Cultivate a mindset that refuses to settle for mediocrity.',
    icon: <Flame size={20} />,
    iconColor: '#ef4444',
    accentColor: '#ef4444',
    iconBg: '#fef2f2',
    positionClass: styles.posStep1,
  },
  {
    id: 'step2',
    number: '02',
    title: 'Deliberate Practice',
    desc: 'Turn your ambition into action. Focus on targeted, challenging practice that pushes your boundaries.',
    icon: <Target size={20} />,
    iconColor: '#d97706',
    accentColor: '#f59e0b',
    iconBg: '#fffbeb',
    positionClass: styles.posStep2,
  },
  {
    id: 'step3',
    number: '03',
    title: 'Consistency',
    desc: 'Show up every single day. Small, consistent efforts compound over time into massive results.',
    icon: <RotateCw size={20} />,
    iconColor: '#2563eb',
    accentColor: '#3b82f6',
    iconBg: '#eff6ff',
    positionClass: styles.posStep3,
  },
  {
    id: 'step4',
    number: '04',
    title: 'Continuous Learning',
    desc: 'Stay curious and adaptable. The landscape changes rapidly; your ability to learn new things is your ultimate weapon.',
    icon: <Zap size={20} />,
    iconColor: '#059669',
    accentColor: '#10b981',
    iconBg: '#f0fdf4',
    positionClass: styles.posStep4,
  },
  {
    id: 'step5',
    number: '05',
    title: 'Success',
    desc: 'Reach your goals, elevate your career, and become a leader in your field. Then, set a new target.',
    icon: <Trophy size={20} />,
    iconColor: '#7c3aed',
    accentColor: '#8b5cf6',
    iconBg: '#f5f3ff',
    positionClass: styles.posStep5,
  },
];

export default function SuccessRoadmap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 75%', 'end 65%'],
  });

  // Smooth spring for liquid laser path drawing
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });

  const pathLength = useTransform(smoothProgress, [0, 1], [0.1, 1]);

  return (
    <section className={styles.roadmapSection} ref={containerRef}>
      {/* Background Decorative Mesh & Radial Ambient Glow */}
      <div className={styles.bgGridPattern} />
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowBottom} />

      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <motion.div
            className={styles.blueprintBadge}
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Compass size={13} className={styles.badgeCompass} />
            <span>THE BLUEPRINT</span>
          </motion.div>

          <motion.h2
            className={styles.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Roadmap to <span className={styles.titleAccent}>Success</span>
          </motion.h2>

          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Mastery isn&apos;t just about what you learn; it&apos;s about how you approach the journey.
          </motion.p>
        </div>

        {/* Roadmap Nodes & Connecting Laser Path */}
        <div className={styles.roadmapContent}>
          {/* Animated SVG Energy Path that weaves through the cards */}
          <div className={styles.svgWrapper}>
            <svg
              viewBox="0 0 1000 920"
              preserveAspectRatio="none"
              className={styles.svgCanvas}
            >
              <defs>
                {/* Vibrant Gradient Stroke */}
                <linearGradient id="themeLaserGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.9" />
                  <stop offset="35%" stopColor="#38bdf8" stopOpacity="1" />
                  <stop offset="70%" stopColor="#2563eb" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.9" />
                </linearGradient>

                {/* Soft Blue Glow Filter */}
                <filter id="themeGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="8" result="blur1" />
                  <feGaussianBlur stdDeviation="16" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Base Subtle Guide Path */}
              <path
                d="M 540,10 C 540,110 520,150 410,210 C 270,270 230,240 260,330 C 290,440 440,390 480,480 C 530,590 680,560 670,680 C 660,780 430,750 410,870"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2.5"
                strokeDasharray="6 6"
              />

              {/* Ambient Blue Glowing Stroke */}
              <motion.path
                d="M 540,10 C 540,110 520,150 410,210 C 270,270 230,240 260,330 C 290,440 440,390 480,480 C 530,590 680,560 670,680 C 660,780 430,750 410,870"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="14"
                strokeLinecap="round"
                strokeOpacity="0.25"
                filter="url(#themeGlowFilter)"
                style={{ pathLength }}
              />

              {/* Primary Active Laser Line */}
              <motion.path
                d="M 540,10 C 540,110 520,150 410,210 C 270,270 230,240 260,330 C 290,440 440,390 480,480 C 530,590 680,560 670,680 C 660,780 430,750 410,870"
                fill="none"
                stroke="url(#themeLaserGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                style={{ pathLength }}
              />
            </svg>
          </div>

          {/* Cards List */}
          <div className={styles.cardsContainer}>
            {roadmapSteps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`${styles.cardRow} ${step.positionClass}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div
                  className={styles.card}
                  style={{
                    borderLeftColor: step.accentColor,
                  }}
                >
                  {/* Subtle Top Left Accent Bar */}
                  <div
                    className={styles.cardCornerAccent}
                    style={{ background: step.accentColor }}
                  />

                  {/* Icon Box */}
                  <div
                    className={styles.cardIconBox}
                    style={{
                      color: step.iconColor,
                      background: step.iconBg,
                      border: `1px solid ${step.accentColor}33`,
                    }}
                  >
                    {step.icon}
                  </div>

                  {/* Content */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardTopMeta}>
                      <span className={styles.cardNumber} style={{ color: step.accentColor }}>
                        PHASE {step.number}
                      </span>
                    </div>
                    <h3 className={styles.cardTitle}>{step.title}</h3>
                    <p className={styles.cardDesc}>{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
