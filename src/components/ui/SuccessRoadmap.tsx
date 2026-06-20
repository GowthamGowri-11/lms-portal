'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Flame, Repeat, Target, Zap, Trophy } from 'lucide-react';
import styles from './SuccessRoadmap.module.css';

const roadmapSteps = [
  {
    id: 'step1',
    icon: <Flame size={24} />,
    title: 'Hunger to Win',
    desc: 'The journey starts with an intense desire to succeed. Cultivate a mindset that refuses to settle for mediocrity.',
    color: 'var(--accent-danger)',
  },
  {
    id: 'step2',
    icon: <Target size={24} />,
    title: 'Deliberate Practice',
    desc: 'Turn your ambition into action. Focus on targeted, challenging practice that pushes your boundaries.',
    color: 'var(--accent-warning)',
  },
  {
    id: 'step3',
    icon: <Repeat size={24} />,
    title: 'Consistency',
    desc: 'Show up every single day. Small, consistent efforts compound over time into massive results.',
    color: 'var(--accent-primary)',
  },
  {
    id: 'step4',
    icon: <Zap size={24} />,
    title: 'Continuous Learning',
    desc: 'Stay curious and adaptable. The landscape changes rapidly; your ability to learn new things is your ultimate weapon.',
    color: 'var(--accent-secondary)',
  },
  {
    id: 'step5',
    icon: <Trophy size={28} />,
    title: 'Success',
    desc: 'Reach your goals, elevate your career, and become a leader in your field. Then, set a new target.',
    color: 'var(--text-primary)',
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
      <div className={styles.dotGrid} />
      <div className="container">
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionTag}>The Blueprint</span>
          <h2 className={styles.sectionTitle}>
            Roadmap to <span className={styles.accentText}>Success</span>
          </h2>
          <p className={styles.sectionSubtitleCenter}>
            Mastery isn&apos;t just about what you learn, it&apos;s about how you approach the journey.
          </p>
        </div>

        <div className={styles.roadmapContainer}>
          {/* Animated SVG Path connecting nodes */}
          <div className={styles.svgContainer}>
            <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className={styles.svgPath}>
              <motion.path
                d="M 500,20 C 500,100 200,100 200,200 C 200,300 800,300 800,400 C 800,500 500,500 500,580"
                fill="none"
                stroke="var(--glass-border)"
                strokeWidth="4"
                strokeDasharray="8 8"
              />
              <motion.path
                d="M 500,20 C 500,100 200,100 200,200 C 200,300 800,300 800,400 C 800,500 500,500 500,580"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="6"
                strokeLinecap="round"
                style={{ pathLength }}
              />
            </svg>
          </div>

          <div className={styles.nodesWrapper}>
            {roadmapSteps.map((step, index) => {
              // Determine placement based on the SVG curve
              const isLeft = index === 1;
              const isRight = index === 3;

              let positionClass = styles.nodeCenter;
              if (isLeft) positionClass = styles.nodeLeft;
              if (isRight) positionClass = styles.nodeRight;

              return (
                <div key={step.id} className={`${styles.nodeRow} ${positionClass}`}>
                  <motion.div
                    className={styles.nodeCard}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{ borderLeftColor: step.color }}
                  >
                    <div className={styles.nodeIcon} style={{ color: step.color, background: `${step.color}15` }}>
                      {step.icon}
                    </div>
                    <div className={styles.nodeContent}>
                      <span className={styles.nodeNumber}>0{index + 1}</span>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
