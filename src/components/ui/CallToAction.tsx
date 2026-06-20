'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import styles from './CallToAction.module.css';

export default function CallToAction() {
  return (
    <section className={styles.ctaWrapper}>
      <div className={styles.backgroundMesh} />
      <div className="container">
        <motion.div 
          className={styles.ctaCard}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Decorative Orbs */}
          <div className={styles.orb1} />
          <div className={styles.orb2} />

          <motion.div 
            className={styles.badge}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles size={16} className={styles.badgeIcon} />
            Your Future Starts Here
          </motion.div>

          <motion.h2 
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Ready to <span className={styles.highlight}>Transform</span> Your Career?
          </motion.h2>

          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Join thousands of professionals who have upgraded their skills. Get unlimited access to premium courses taught by industry elite and start building your legacy today.
          </motion.p>

          <motion.div 
            className={styles.actions}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/courses" className={styles.primaryBtn}>
              Get Started Now <ArrowRight size={20} />
            </Link>
            <Link href="/courses" className={styles.secondaryBtn}>
              Explore Catalog
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
