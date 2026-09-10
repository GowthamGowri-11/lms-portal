'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Flame, Repeat, Target, Zap, Trophy, Compass } from 'lucide-react';
import TiltCard from '../animations/TiltCard';
import styles from './SuccessRoadmap.module.css';

const roadmapSteps = [
  {
    id: 'step1',
    icon: <Flame size={22} />,
    title: 'Hunger to Excel',
    desc: 'Cultivate strong problem-solving fundamentals and a commitment to continuous growth and mastery.',
    color: '#ef4444',
    bg: '#fef2f2',
  },
  {
    id: 'step2',
    icon: <Target size={22} />,
    title: 'Deliberate Practice',
    desc: 'Turn theoretical knowledge into code. Solve structured algorithmic challenges and build architectural patterns.',
    color: '#d97706',
    bg: '#fffbeb',
  },
  {
    id: 'step3',
    icon: <Repeat size={22} />,
    title: 'Consistent Compounding',
    desc: 'Build daily engineering habits with guided interactive labs and regular faculty milestone evaluations.',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    id: 'step4',
    icon: <Zap size={22} />,
    title: 'Adaptive Learning',
    desc: 'Stay ahead of the technological curve with modern cloud native tools, AI integration, and frameworks.',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    id: 'step5',
    icon: <Trophy size={22} />,
    title: 'Career Placement & Leadership',
    desc: 'Graduate with an accredited portfolio, verified credentials, and comprehensive interview preparation.',
    color: '#059669',
    bg: '#ecfdf5',
  },
];

export default function SuccessRoadmap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  return (
    <section className={`section ${styles.roadmapSection}`} ref={containerRef}>
      <div className="container">
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionTag}>
            <Compass size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: -1 }} />
            Academic Path
          </span>
          <h2 className={styles.sectionTitle}>
            Roadmap to <span className={styles.accentText}>Engineering Success</span>
          </h2>
          <p className={styles.sectionSubtitleCenter}>
            A structured five-phase progressive framework engineered for measurable academic and industry success.
          </p>
        </div>

        <div className={styles.roadmapContainer}>
          {/* Animated SVG Path connecting nodes */}
          <div className={styles.svgContainer}>
            <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className={styles.svgPath}>
              <motion.path
                d="M 500,20 C 500,100 200,100 200,200 C 200,300 800,300 800,400 C 800,500 500,500 500,580"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="3"
                strokeDasharray="6 6"
              />
              <motion.path
                d="M 500,20 C 500,100 200,100 200,200 C 200,300 800,300 800,400 C 800,500 500,500 500,580"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeLinecap="round"
                style={{
                  pathLength,
                }}
              />
            </svg>
          </div>

          <div className={styles.nodesWrapper}>
            {roadmapSteps.map((step, index) => {
              const isLeft = index === 1;
              const isRight = index === 3;

              let positionClass = styles.nodeCenter;
              if (isLeft) positionClass = styles.nodeLeft;
              if (isRight) positionClass = styles.nodeRight;

              return (
                <div key={step.id} className={`${styles.nodeRow} ${positionClass}`}>
                  <TiltCard
                    className={styles.nodeCard}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -3 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ borderLeftColor: step.color }}
                  >
                    <div
                      className={styles.nodeIcon}
                      style={{ color: step.color, background: step.bg, borderColor: `${step.color}33` }}
                    >
                      {step.icon}
                    </div>
                    <div className={styles.nodeContent}>
                      <div className={styles.nodeTopMeta}>
                        <span className={styles.nodeNumber} style={{ color: step.color }}>
                          Phase 0{index + 1}
                        </span>
                      </div>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </TiltCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
