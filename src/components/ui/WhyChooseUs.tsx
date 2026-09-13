'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, CheckCircle2, Globe, ShieldCheck, Sparkles } from 'lucide-react';
import styles from './WhyChooseUs.module.css';

const features = [
  {
    id: 'cert',
    icon: <Award size={22} />,
    iconBoxClass: styles.iconBoxBlue,
    title: 'Industry-Recognized Certificates',
    desc: 'Earn certificates valued by top employers worldwide upon course completion to validate your skills.',
  },
  {
    id: 'trainers',
    icon: <Users size={22} />,
    iconBoxClass: styles.iconBoxTeal,
    title: 'Expert Faculty Mentors',
    desc: 'Learn directly from industry professionals with 10+ years of verified real-world engineering experience.',
  },
  {
    id: 'projects',
    icon: <CheckCircle2 size={22} />,
    iconBoxClass: styles.iconBoxPurple,
    title: 'Project-Based Learning',
    desc: 'Build production-ready architectural capstones and portfolios that demonstrate real engineering mastery.',
  },
  {
    id: 'anywhere',
    icon: <Globe size={22} />,
    iconBoxClass: styles.iconBoxAmber,
    title: 'Learn Anywhere, Anytime',
    desc: 'Access your coursework, interactive code environments, and community discussions on any device, at your pace.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className={styles.section}>
      <div className={styles.bgGlow} />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={12} className={styles.badgeIcon} />
            <span>WHY ATLYX</span>
          </div>
          <h2 className={styles.title}>
            Why Learners <span className={styles.accentText}>Choose Us</span>
          </h2>
          <p className={styles.subtitle}>
            A complete ecosystem engineered to help ambitious learners master high-impact skills and advance their careers.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((item, index) => (
            <motion.div
              key={item.id}
              className={styles.card}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
            >
              <div className={`${styles.iconBox} ${item.iconBoxClass}`}>
                {item.icon}
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
