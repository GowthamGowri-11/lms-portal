'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Award, ShieldCheck, Users, Zap } from 'lucide-react';
import styles from './CallToAction.module.css';

export default function CallToAction() {
  return (
    <section className={styles.ctaWrapper}>
      <div className="container">
        <motion.div
          className={styles.ctaCard}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Subtle Background Accent Patterns */}
          <div className={styles.ambientGlow} />
          <div className={styles.gridOverlay} />

          <div className={styles.ctaInner}>
            {/* Top Pill Tag */}
            <div className={styles.badge}>
              <Sparkles size={14} className={styles.badgeIcon} />
              <span>Transform Your Future</span>
            </div>

            {/* Main Title */}
            <h2 className={styles.title}>
              Ready to Accelerate Your <span className={styles.highlight}>Tech Career?</span>
            </h2>

            {/* Subtitle */}
            <p className={styles.subtitle}>
              Join thousands of aspiring developers, engineers, and researchers. Master in-demand
              skills with curated academic roadmaps, expert faculty guidance, and accredited
              certifications.
            </p>

            {/* Trust Highlights Strip */}
            <div className={styles.trustStrip}>
              <div className={styles.trustItem}>
                <Award size={15} className={styles.trustIcon} />
                <span>Verified Credentials</span>
              </div>
              <div className={styles.trustDivider}>•</div>
              <div className={styles.trustItem}>
                <Zap size={15} className={styles.trustIcon} />
                <span>Hands-on Capstones</span>
              </div>
              <div className={styles.trustDivider}>•</div>
              <div className={styles.trustItem}>
                <Users size={15} className={styles.trustIcon} />
                <span>1-on-1 Faculty Mentorship</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <Link href="/courses" className={styles.primaryBtn}>
                <span>Explore All Courses</span>
                <ArrowRight size={18} className={styles.btnArrow} />
              </Link>
              <Link href="/trainers" className={styles.secondaryBtn}>
                <span>Meet Faculty Mentors</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
