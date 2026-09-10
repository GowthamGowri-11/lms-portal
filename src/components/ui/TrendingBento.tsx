'use client';

import { Code2, Users, Rocket, Brain, Trophy, ArrowUpRight, Sparkles, CheckCircle } from 'lucide-react';
import styles from './TrendingBento.module.css';
import TiltCard from '../animations/TiltCard';

export default function TrendingBento() {
  return (
    <section className={styles.bentoSection}>
      <div className="container">
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionTag}>
            <Sparkles size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: -1 }} />
            Core Academic Capabilities
          </span>
          <h2 className={styles.sectionTitle}>
            Engineered for <span className={styles.accentText}>Real Mastery</span>
          </h2>
          <p className={styles.sectionSubtitleCenter}>
            A modern, production-grade learning infrastructure designed to bridge theory and industry engineering.
          </p>
        </div>

        <div className={styles.bentoGrid} style={{ perspective: '1500px' }}>
          {/* Card 1: Large 2x2 (Row 1-2, Col 1-2) */}
          <TiltCard
            className={`${styles.bentoCard} ${styles.span2x2}`}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            <div className={styles.cardAccentBar} style={{ background: '#2563eb' }} />
            <div className={styles.cardHeaderRow}>
              <div className={styles.iconWrapper} style={{ color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe' }}>
                <Code2 size={22} />
              </div>
              <span className={styles.categoryChip} style={{ color: '#2563eb', background: '#eff6ff' }}>
                Live Cloud IDE
              </span>
            </div>
            <h3>Interactive Browser Coding Labs</h3>
            <p>
              Write, compile, and execute code in real time within your browser. Integrated unit tests validate your logic instantly without local machine setup.
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
                  <span className={styles.codeKeyword}>export function</span>{' '}
                  <span className={styles.codeFunc}>AccelerateCareer</span>() {'{'}
                  <br />
                  &nbsp;&nbsp;<span className={styles.codeKeyword}>const</span> practicalSkills ={' '}
                  <span className={styles.codeString}>&apos;production-grade&apos;</span>;
                  <br />
                  &nbsp;&nbsp;<span className={styles.codeKeyword}>return</span>{' '}
                  <span className={styles.codeTag}>&lt;IndustryReady /&gt;</span>;
                  <br />
                  {'}'}
                </div>
              </div>
            </div>
          </TiltCard>

          {/* Card 2: 1x1 (Row 1, Col 3) */}
          <TiltCard
            className={`${styles.bentoCard} ${styles.span1x1}`}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -4 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            <div className={styles.cardAccentBar} style={{ background: '#7c3aed' }} />
            <div className={styles.cardHeaderRow}>
              <div className={styles.iconWrapper} style={{ color: '#7c3aed', background: '#f5f3ff', borderColor: '#ddd6fe' }}>
                <Brain size={22} />
              </div>
              <span className={styles.categoryChip} style={{ color: '#7c3aed', background: '#f5f3ff' }}>
                Adaptive
              </span>
            </div>
            <h3>AI Code Mentor</h3>
            <p>Smart hints, automated code reviews, and contextual syntax breakdowns available 24/7 on every exercise.</p>
          </TiltCard>

          {/* Card 3: 1x1 (Row 2, Col 3) */}
          <TiltCard
            className={`${styles.bentoCard} ${styles.span1x1}`}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -4 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          >
            <div className={styles.cardAccentBar} style={{ background: '#d97706' }} />
            <div className={styles.cardHeaderRow}>
              <div className={styles.iconWrapper} style={{ color: '#d97706', background: '#fffbeb', borderColor: '#fde68a' }}>
                <Rocket size={22} />
              </div>
              <span className={styles.categoryChip} style={{ color: '#d97706', background: '#fffbeb' }}>
                Career Track
              </span>
            </div>
            <h3>Interview Preparation</h3>
            <p>Structured algorithmic challenges, system design patterns, and curated mock evaluations with faculty feedback.</p>
          </TiltCard>

          {/* Card 4: 1x1 (Row 3, Col 1) */}
          <TiltCard
            className={`${styles.bentoCard} ${styles.span1x1}`}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -4 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          >
            <div className={styles.cardAccentBar} style={{ background: '#059669' }} />
            <div className={styles.cardHeaderRow}>
              <div className={styles.iconWrapper} style={{ color: '#059669', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <Trophy size={22} />
              </div>
              <span className={styles.categoryChip} style={{ color: '#059669', background: '#ecfdf5' }}>
                Portfolio
              </span>
            </div>
            <h3>Production Capstones</h3>
            <p>Deploy real full-stack web applications and architectures ready to showcase in technical hiring pipelines.</p>
          </TiltCard>

          {/* Card 5: 2x1 (Row 3, Col 2-3) */}
          <TiltCard
            className={`${styles.bentoCard} ${styles.span2x1}`}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -4 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
          >
            <div className={styles.cardAccentBar} style={{ background: '#0284c7' }} />
            <div className={styles.cardHeaderRow}>
              <div className={styles.iconWrapper} style={{ color: '#0284c7', background: '#f0f9ff', borderColor: '#bae6fd' }}>
                <Users size={22} />
              </div>
              <span className={styles.categoryChip} style={{ color: '#0284c7', background: '#f0f9ff' }}>
                Collab & Community
              </span>
            </div>
            <h3>Collaborative Academic Community</h3>
            <p>
              Engage with peer study groups, academic forums, code sharing sessions, and exclusive masterclasses conducted by verified industry leaders.
            </p>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
