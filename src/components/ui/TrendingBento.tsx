'use client';

import { motion } from 'framer-motion';
import { Code2, Users, Rocket, Brain, Trophy } from 'lucide-react';
import styles from './TrendingBento.module.css';

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

        <div className={styles.bentoGrid}>
          {/* Card 1: Large 2x2 (Row 1-2, Col 1-2) */}
          <motion.div 
            className={`${styles.bentoCard} ${styles.span2x2}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.cardGlow} style={{ background: 'var(--accent-primary)' }} />
            <div className={styles.iconWrapper} style={{ color: 'var(--accent-primary)' }}>
              <Code2 size={24} />
            </div>
            <h3>Interactive Coding Labs</h3>
            <p>
              Stop watching and start building. Our browser-based IDE lets you write, run, and debug code in real-time, right next to the lesson materials.
            </p>
            <div className={styles.ideMockup}>
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
          </motion.div>

          {/* Card 2: 1x1 (Row 1, Col 3) */}
          <motion.div 
            className={`${styles.bentoCard} ${styles.span1x1}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className={styles.cardGlow} style={{ background: 'var(--accent-secondary)' }} />
            <div className={styles.iconWrapper} style={{ color: 'var(--accent-secondary)' }}>
              <Brain size={24} />
            </div>
            <h3>AI Mentorship</h3>
            <p>Our smart AI provides hints, code reviews, and deep explanations 24/7, ensuring you never stop learning.</p>
          </motion.div>

          {/* Card 3: 1x1 (Row 2, Col 3) */}
          <motion.div 
            className={`${styles.bentoCard} ${styles.span1x1}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.cardGlow} style={{ background: 'var(--accent-warning)' }} />
            <div className={styles.iconWrapper} style={{ color: 'var(--accent-warning)' }}>
              <Rocket size={24} />
            </div>
            <h3>Career Prep</h3>
            <p>Master the interview process with tailored mock interviews and professional resume reviews by industry veterans.</p>
          </motion.div>

          {/* Card 4: 1x1 (Row 3, Col 1) */}
          <motion.div 
            className={`${styles.bentoCard} ${styles.span1x1}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.cardGlow} style={{ background: 'var(--accent-danger)' }} />
            <div className={styles.iconWrapper} style={{ color: 'var(--accent-danger)' }}>
              <Trophy size={24} />
            </div>
            <h3>Real Projects</h3>
            <p>Build a robust portfolio of production-ready apps that will make you stand out to top recruiters.</p>
          </motion.div>

          {/* Card 5: 2x1 (Row 3, Col 2-3) */}
          <motion.div 
            className={`${styles.bentoCard} ${styles.span2x1}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.cardGlow} style={{ background: 'var(--accent-tertiary)' }} />
            <div className={styles.iconWrapper} style={{ color: 'var(--accent-tertiary)' }}>
              <Users size={24} />
            </div>
            <h3>Thriving Community</h3>
            <p>Join thousands of active learners. Participate in global hackathons, collaborative study groups, and exclusive networking events with industry leaders.</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
