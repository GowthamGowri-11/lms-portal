'use client';

import { Code2, Users, Rocket, Brain, Trophy } from 'lucide-react';
import styles from './TrendingBento.module.css';
import TiltCard from '../animations/TiltCard';

export default function TrendingBento() {
  return (
    <section className={styles.bentoSection}>
      <div className="container">
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionTag}>Next-Gen Learning</span>
          <h2 className={styles.sectionTitle}>
            Everything you need to <span className={styles.accentText}>Excel</span>
          </h2>
          <p className={styles.sectionSubtitleCenter}>
            A modern, comprehensive ecosystem built to accelerate your career.
          </p>
        </div>

        <div className={styles.bentoGrid} style={{ perspective: '1500px' }}>
          {/* Card 1: Large 2x2 (Row 1-2, Col 1-2) */}
          <TiltCard 
            className={`${styles.bentoCard} ${styles.span2x2}`}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.02, z: 20, boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
            viewport={{ once: true }}
          >
            <div className={styles.cardGlow} style={{ background: 'var(--accent-primary)', transform: 'translateZ(-10px)' }} />
            <div className={styles.iconWrapper} style={{ color: 'var(--accent-primary)', transform: 'translateZ(30px)' }}>
              <Code2 size={24} />
            </div>
            <h3 style={{ transform: 'translateZ(20px)' }}>Interactive Coding Labs</h3>
            <p style={{ transform: 'translateZ(20px)' }}>
              Stop watching and start building. Our browser-based IDE lets you write, run, and debug code in real-time, right next to the lesson materials.
            </p>
            <div className={styles.ideMockup} style={{ transform: 'translateZ(40px)' }}>
              <div className={styles.ideHeader}>
                <div className={styles.ideDots}>
                  <span className={styles.dotClose}></span>
                  <span className={styles.dotMinimize}></span>
                  <span className={styles.dotMaximize}></span>
                </div>
                <div className={styles.ideTab}>main.tsx</div>
              </div>
              <div className={styles.ideBody}>
                <div>
                  <span className={styles.codeKeyword}>function</span> <span className={styles.codeFunc}>LearnToCode</span>() {'{'}
                  <br />
                  &nbsp;&nbsp;<span className={styles.codeKeyword}>const</span> skills = <span className={styles.codeString}>&apos;limitless&apos;</span>;
                  <br />
                  &nbsp;&nbsp;<span className={styles.codeKeyword}>return</span> <span className={styles.codeTag}>&lt;Future /&gt;</span>;
                  <br />
                  {'}'}
                </div>
              </div>
            </div>
          </TiltCard>

          {/* Card 2: 1x1 (Row 1, Col 3) */}
          <TiltCard 
            className={`${styles.bentoCard} ${styles.span1x1}`}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.05, z: 30, boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring', bounce: 0.4 }}
          >
            <div className={styles.cardGlow} style={{ background: 'var(--accent-secondary)' }} />
            <div className={styles.iconWrapper} style={{ color: 'var(--accent-secondary)', transform: 'translateZ(30px)' }}>
              <Brain size={24} />
            </div>
            <h3 style={{ transform: 'translateZ(20px)' }}>AI Mentorship</h3>
            <p style={{ transform: 'translateZ(20px)' }}>Our smart AI provides hints, code reviews, and deep explanations 24/7, ensuring you never stop learning.</p>
          </TiltCard>

          {/* Card 3: 1x1 (Row 2, Col 3) */}
          <TiltCard 
            className={`${styles.bentoCard} ${styles.span1x1}`}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.05, z: 30, boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', bounce: 0.4 }}
          >
            <div className={styles.cardGlow} style={{ background: 'var(--accent-warning)' }} />
            <div className={styles.iconWrapper} style={{ color: 'var(--accent-warning)', transform: 'translateZ(30px)' }}>
              <Rocket size={24} />
            </div>
            <h3 style={{ transform: 'translateZ(20px)' }}>Career Prep</h3>
            <p style={{ transform: 'translateZ(20px)' }}>Master the interview process with tailored mock interviews and professional resume reviews by industry veterans.</p>
          </TiltCard>

          {/* Card 4: 1x1 (Row 3, Col 1) */}
          <TiltCard 
            className={`${styles.bentoCard} ${styles.span1x1}`}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.05, z: 30, boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, type: 'spring', bounce: 0.4 }}
          >
            <div className={styles.cardGlow} style={{ background: 'var(--accent-danger)' }} />
            <div className={styles.iconWrapper} style={{ color: 'var(--accent-danger)', transform: 'translateZ(30px)' }}>
              <Trophy size={24} />
            </div>
            <h3 style={{ transform: 'translateZ(20px)' }}>Real Projects</h3>
            <p style={{ transform: 'translateZ(20px)' }}>Build a robust portfolio of production-ready apps that will make you stand out to top recruiters.</p>
          </TiltCard>

          {/* Card 5: 2x1 (Row 3, Col 2-3) */}
          <TiltCard 
            className={`${styles.bentoCard} ${styles.span2x1}`}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.03, z: 25, boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4, type: 'spring', bounce: 0.4 }}
          >
            <div className={styles.cardGlow} style={{ background: 'var(--accent-tertiary)' }} />
            <div className={styles.iconWrapper} style={{ color: 'var(--accent-tertiary)', transform: 'translateZ(30px)' }}>
              <Users size={24} />
            </div>
            <h3 style={{ transform: 'translateZ(20px)' }}>Thriving Community</h3>
            <p style={{ transform: 'translateZ(20px)' }}>Join thousands of active learners. Participate in global hackathons, collaborative study groups, and exclusive networking events with industry leaders.</p>
          </TiltCard>

        </div>
      </div>
    </section>
  );
}
