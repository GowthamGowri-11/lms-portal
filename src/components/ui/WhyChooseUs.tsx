'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Users,
  Code2,
  Globe,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  Cpu,
  Terminal,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import CurriculumAuroraBackground from '@/components/ui/backgrounds/CurriculumAuroraBackground';
import styles from './WhyChooseUs.module.css';

const features = [
  {
    id: 'cert',
    number: '01',
    pillarTag: 'CREDENTIALS',
    icon: <Award size={26} />,
    colorTheme: 'blue',
    cardClass: styles.cardBlue,
    iconBoxClass: styles.iconBoxBlue,
    numClass: styles.numBlue,
    tagClass: styles.tagBlue,
    title: 'Industry-Recognized Certifications',
    desc: 'Earn tamper-proof, globally verifiable credentials upon module completion, validated against modern enterprise software standards and recognized by global recruiters.',
    highlights: [
      'Cryptographically Verifiable ID & Transcript',
      'One-Click LinkedIn & Resume Showcase',
      'Direct Recruiter Validation Verification Portal',
    ],
    metricBadge: {
      icon: <ShieldCheck size={14} />,
      label: 'Official ATLYX Standard',
      sub: '100% Verifiable',
    },
    linkHref: '/courses',
    linkText: 'Explore Verified Tracks',
  },
  {
    id: 'trainers',
    number: '02',
    pillarTag: 'FACULTY',
    icon: <Users size={26} />,
    colorTheme: 'teal',
    cardClass: styles.cardTeal,
    iconBoxClass: styles.iconBoxTeal,
    numClass: styles.numTeal,
    tagClass: styles.tagTeal,
    title: 'Elite Industry Faculty Mentors',
    desc: 'Learn directly from principal engineers, tech leads, and domain architects with 10+ years of battle-tested experience building high-scale distributed systems.',
    highlights: [
      'Weekly 1-on-1 Architectural Code Reviews',
      'Direct Private Discussion & Mentorship Channels',
      'Real-World Production System Design Walkthroughs',
    ],
    metricBadge: {
      icon: <Star size={14} className={styles.starIcon} />,
      label: '4.98 / 5.0 Faculty Rating',
      sub: 'Direct 1-on-1 Guidance',
    },
    linkHref: '/trainers',
    linkText: 'Meet Our Faculty',
  },
  {
    id: 'projects',
    number: '03',
    pillarTag: 'CURRICULUM',
    icon: <Code2 size={26} />,
    colorTheme: 'purple',
    cardClass: styles.cardPurple,
    iconBoxClass: styles.iconBoxPurple,
    numClass: styles.numPurple,
    tagClass: styles.tagPurple,
    title: 'Project-Driven Architecture Labs',
    desc: 'Move beyond trivial tutorials. Architect and deploy end-to-end production microservices, complete with CI/CD automation, cloud infrastructure, and instant test feedback.',
    highlights: [
      '4+ Production-Ready Architectural Capstones',
      'Zero-Setup In-Browser Cloud IDE & Automated Tests',
      'Full-Stack Modern Stack: Next.js, Docker, Cloud & AI',
    ],
    metricBadge: {
      icon: <Cpu size={14} />,
      label: 'Production Capstones',
      sub: 'Zero-to-Deploy Ready',
    },
    linkHref: '/courses',
    linkText: 'Browse Project Labs',
  },
  {
    id: 'anywhere',
    number: '04',
    pillarTag: 'ECOSYSTEM',
    icon: <Globe size={26} />,
    colorTheme: 'amber',
    cardClass: styles.cardAmber,
    iconBoxClass: styles.iconBoxAmber,
    numClass: styles.numAmber,
    tagClass: styles.tagAmber,
    title: 'Learn Anywhere, Anytime at Scale',
    desc: 'Access ultra-fast cloud development sandboxes, recorded milestone masterclasses, and collaborative peer circles on any device at your personalized learning pace.',
    highlights: [
      'Instant In-Browser Linux & Cloud Runtime',
      'Self-Paced Curriculum with Lifetime Access',
      'Collaborative Peer Code Reviews & Leaderboards',
    ],
    metricBadge: {
      icon: <Zap size={14} />,
      label: '99.9% Cloud IDE Uptime',
      sub: 'Multi-Device Sync',
    },
    linkHref: '/about',
    linkText: 'Discover Our Philosophy',
  },
];

export default function WhyChooseUs() {
  return (
    <section className={styles.section}>
      <CurriculumAuroraBackground />
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <span className={styles.pulseDot}>
              <span className={styles.pulseRing} />
            </span>
            <Sparkles size={13} className={styles.badgeIcon} />
            <span>WHY CHOOSE ATLYX</span>
          </div>
          <h2 className={styles.title}>
            Engineered for <span className={styles.accentText}>Career Mastery</span>
          </h2>
          <p className={styles.subtitle}>
            A comprehensive, battle-tested academic and engineering ecosystem built to take you from foundational syntax to production-grade engineering excellence.
          </p>
        </div>

        {/* Master 2x2 Feature Cards Grid */}
        <div className={styles.grid}>
          {features.map((item, index) => (
            <motion.div
              key={item.id}
              className={`${styles.card} ${item.cardClass}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.55,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Subtle top hairline gradient accent */}
              <div className={styles.topAccentBar} />

              {/* Ambient Hover Glow */}
              <div className={styles.cardHoverGlow} />

              {/* Watermark Pillar Number */}
              <div className={styles.watermarkNum}>{item.number}</div>

              {/* Card Header Row: Icon + Pillar Tag & Number Badge */}
              <div className={styles.cardHeader}>
                <div className={`${styles.iconBox} ${item.iconBoxClass}`}>
                  <div className={styles.iconRing} />
                  {item.icon}
                </div>

                <div className={styles.headerBadgeGroup}>
                  <span className={`${styles.pillarTag} ${item.tagClass}`}>
                    {item.pillarTag}
                  </span>
                  <div className={`${styles.numberPill} ${item.numClass}`}>
                    <span>{item.number}</span>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.desc}</p>

                {/* Feature Highlights Checklist Pills */}
                <div className={styles.highlightsList}>
                  {item.highlights.map((highlight, hIdx) => (
                    <div key={hIdx} className={styles.highlightRow}>
                      <div className={styles.checkIconBox}>
                        <CheckCircle2 size={14} className={styles.checkIcon} />
                      </div>
                      <span className={styles.highlightText}>{highlight}</span>
                    </div>
                  ))}
                </div>

                {/* Card Footer: Live Metric Badge + Action Link */}
                <div className={styles.cardFooter}>
                  <div className={styles.metricBadgeWrap}>
                    <div className={styles.metricIconWrap}>{item.metricBadge.icon}</div>
                    <div className={styles.metricContent}>
                      <span className={styles.metricLabel}>{item.metricBadge.label}</span>
                      <span className={styles.metricSub}>{item.metricBadge.sub}</span>
                    </div>
                  </div>

                  <Link href={item.linkHref} className={styles.cardLink}>
                    <span>{item.linkText}</span>
                    <ArrowRight size={14} className={styles.cardLinkArrow} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

