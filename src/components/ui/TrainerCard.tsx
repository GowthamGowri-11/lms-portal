'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Users,
  BookOpen,
  Award,
  ArrowRight,
  User,
  GraduationCap,
  Sparkles,
  Trophy,
  Code2,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { Trainer } from '@/generated/prisma/client';
import TechLogo from './TechLogo';
import styles from './TrainerCard.module.css';

type Course = { id: string; title: string; logo: string; trainerId: string };

// ── SKILL DETECTION ──────────────────────────────────────────────────────────
const SKILL_MAP: { keyword: string; label: string; color: string }[] = [
  { keyword: 'python',           label: 'Python',           color: '#3b82f6' },
  { keyword: 'react',            label: 'React.js',         color: '#06b6d4' },
  { keyword: 'node',             label: 'Node.js',          color: '#22c55e' },
  { keyword: 'java',             label: 'Java Enterprise',  color: '#ea580c' },
  { keyword: 'javascript',       label: 'JavaScript',       color: '#eab308' },
  { keyword: 'typescript',       label: 'TypeScript',       color: '#2563eb' },
  { keyword: 'django',           label: 'Django',           color: '#16a34a' },
  { keyword: 'spring',           label: 'Spring Boot',      color: '#22c55e' },
  { keyword: 'machine learning', label: 'Machine Learning', color: '#8b5cf6' },
  { keyword: 'data science',     label: 'Data Science',     color: '#0284c7' },
  { keyword: 'aws',              label: 'AWS Cloud',        color: '#f59e0b' },
  { keyword: 'docker',           label: 'Docker & K8s',     color: '#0284c7' },
  { keyword: 'c++',              label: 'C++ Systems',      color: '#0ea5e9' },
  { keyword: 'devops',           label: 'DevOps & CI/CD',   color: '#6366f1' },
  { keyword: 'next',             label: 'Next.js',          color: '#0f172a' },
  { keyword: 'fullstack',        label: 'Full Stack Web',   color: '#2563eb' },
  { keyword: 'full stack',       label: 'Full Stack Web',   color: '#2563eb' },
  { keyword: 'web developer',    label: 'Modern Web Dev',   color: '#0284c7' },
  { keyword: 'database',         label: 'SQL & Databases',  color: '#d97706' },
  { keyword: 'backend',          label: 'Backend Arch',     color: '#475569' },
  { keyword: 'frontend',         label: 'Frontend UI/UX',   color: '#ec4899' },
];

function getSkills(trainer: Trainer) {
  const text = `${trainer.specialization || ''} ${trainer.bio || ''}`.toLowerCase();
  const detected = SKILL_MAP.filter((s) => text.includes(s.keyword));
  if (detected.length > 0) {
    return detected.slice(0, 3);
  }
  return [
    { label: trainer.specialization || 'Software Engineering', color: '#2563eb' },
    { label: 'System Architecture', color: '#0284c7' },
    { label: 'Mentorship', color: '#8b5cf6' },
  ];
}

function getInitials(name: string) {
  if (!name) return 'FM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAvatarGradient(name: string) {
  const gradients = [
    'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
    'linear-gradient(135deg, #059669 0%, #34d399 100%)',
    'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function getFeaturedTag(trainer: Trainer, indexSeed: number) {
  if (trainer.rating && trainer.rating >= 4.9) {
    return {
      label: 'Top Rated Faculty',
      icon: <Star size={12} className={styles.starIconGold} />,
      badgeClass: styles.badgeGold,
    };
  }
  if (indexSeed % 2 === 0) {
    return {
      label: 'Featured Mentor',
      icon: <Trophy size={12} className={styles.trophyIconBlue} />,
      badgeClass: styles.badgeBlue,
    };
  }
  return {
    label: 'Senior Instructor',
    icon: <GraduationCap size={12} className={styles.gradIconPurple} />,
    badgeClass: styles.badgePurple,
  };
}

interface Props {
  trainer: Trainer;
  courses: Course[];
  isAdmin?: boolean;
  onEdit?: (trainer: Trainer) => void;
  onDelete?: (id: string) => void;
}

export default function TrainerCard({
  trainer,
  courses,
  isAdmin = false,
  onEdit,
  onDelete,
}: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const trainerCourses = courses.filter((c) => c.trainerId === trainer.id);
  const skills = getSkills(trainer);

  const charCode = (trainer.name || 'T').charCodeAt(0);
  const studentCount = ((charCode * 47) % 350) + 120;
  const ratingValue = trainer.rating ? Number(trainer.rating).toFixed(1) : '4.8';
  const experienceValue = trainer.experience
    ? trainer.experience.toLowerCase().includes('yr') || trainer.experience.toLowerCase().includes('year')
      ? trainer.experience
      : `${trainer.experience} Yrs`
    : '5+ Yrs';

  const featuredBadge = getFeaturedTag(trainer, charCode);
  const MAX_COURSES = 2;
  const extra = trainerCourses.length - MAX_COURSES;
  const avatarGradient = getAvatarGradient(trainer.name || 'Trainer');

  const isValidAvatar =
    Boolean(trainer.avatar) &&
    (trainer.avatar.startsWith('http://') ||
      trainer.avatar.startsWith('https://') ||
      trainer.avatar.startsWith('data:image/') ||
      /\.(jpg|jpeg|png|webp|svg|gif|avif)(\?.*)?$/i.test(trainer.avatar));

  const statMetrics = [
    {
      icon: <Star size={14} className={styles.metricStar} />,
      value: ratingValue,
      label: 'Rating',
    },
    {
      icon: <Users size={14} className={styles.metricUsers} />,
      value: `${studentCount}+`,
      label: 'Students',
    },
    {
      icon: <BookOpen size={14} className={styles.metricCourses} />,
      value: trainerCourses.length.toString(),
      label: 'Courses',
    },
    {
      icon: <Award size={14} className={styles.metricExp} />,
      value: experienceValue.replace(/ years?/i, ' Yrs'),
      label: 'Exp',
    },
  ];

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── TOP DECORATIVE BANNER ── */}
      <div className={styles.cardBanner}>
        <div className={styles.bannerPattern} />
        <div className={styles.bannerGlow} />

        {/* Top Header Row with Badge & Admin Controls */}
        <div className={styles.bannerHeader}>
          <div className={`${styles.featuredBadge} ${featuredBadge.badgeClass}`}>
            <span className={styles.badgeIcon}>{featuredBadge.icon}</span>
            <span className={styles.badgeText}>{featuredBadge.label}</span>
          </div>

          {isAdmin && (
            <div className={styles.adminControls}>
              <button
                className={styles.adminBtn}
                onClick={() => onEdit?.(trainer)}
                title="Edit Trainer"
                type="button"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                className={`${styles.adminBtn} ${styles.adminDangerBtn}`}
                onClick={() => onDelete?.(trainer.id)}
                title="Delete Trainer"
                type="button"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardBody}>
        {/* ── PROFILE SECTION WITH FLOATING AVATAR ── */}
        <div className={styles.profileSection}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatarRing}>
              {isValidAvatar && !imgFailed ? (
                <img
                  src={trainer.avatar}
                  alt={trainer.name}
                  className={styles.avatarImg}
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div
                  className={styles.avatarInitials}
                  style={{ background: avatarGradient }}
                >
                  {getInitials(trainer.name)}
                </div>
              )}
            </div>
            <span className={styles.verifiedCheck} title="Verified Faculty Mentor">
              ✓
            </span>
          </div>

          <div className={styles.profileDetails}>
            <div className={styles.nameRow}>
              <h3 className={styles.trainerName}>{trainer.name}</h3>
            </div>

            <div className={styles.specializationBadge}>
              <span className={styles.specDot} />
              <span className={styles.specText}>
                {trainer.specialization || 'Fullstack Web Developer'}
              </span>
            </div>
          </div>
        </div>

        {/* ── 4-METRIC STATS STRIP ── */}
        <div className={styles.metricsStrip}>
          {statMetrics.map((stat, idx) => (
            <div key={stat.label} className={styles.metricItem}>
              {idx > 0 && <div className={styles.metricDivider} />}
              <div className={styles.metricContent}>
                <div className={styles.metricTop}>
                  <span className={styles.metricIconWrap}>{stat.icon}</span>
                  <span className={styles.metricNumber}>{stat.value}</span>
                </div>
                <span className={styles.metricLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── ABOUT FACULTY BIO ── */}
        <div className={styles.infoSection}>
          <div className={styles.sectionHeader}>
            <User size={12} className={styles.sectionIcon} />
            <span className={styles.sectionTitle}>About Faculty</span>
          </div>
          <p className={styles.bioText}>
            {trainer.bio ||
              'Dedicated instructor with extensive real-world engineering experience delivering practical, hands-on curriculum and project mentorship.'}
          </p>
        </div>

        {/* ── CORE EXPERTISE TAGS ── */}
        {skills.length > 0 && (
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <Code2 size={12} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>Core Expertise</span>
            </div>
            <div className={styles.skillsList}>
              {skills.map((s) => (
                <span key={s.label} className={styles.skillPill}>
                  <span className={styles.techLogoBox}>
                    <TechLogo name={s.label} size={16} />
                  </span>
                  <span className={styles.skillLabel}>{s.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── CURRICULUM & COURSES ── */}
        <div className={styles.infoSection}>
          <div className={styles.sectionHeader}>
            <BookOpen size={12} className={styles.sectionIcon} />
            <span className={styles.sectionTitle}>Curriculum & Courses</span>
          </div>
          {trainerCourses.length === 0 ? (
            <div className={styles.noCoursesPill}>
              <Sparkles size={11} className={styles.sparkleIconMuted} />
              <span>Upcoming Curricula in Development</span>
            </div>
          ) : (
            <div className={styles.courseTagsList}>
              {trainerCourses.slice(0, MAX_COURSES).map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.id}`}
                  className={styles.courseLinkPill}
                  title={c.title}
                >
                  <span className={styles.courseLogoBox}>
                    <TechLogo name={c.title} size={15} />
                  </span>
                  <span>{c.title}</span>
                </Link>
              ))}
              {extra > 0 && (
                <span className={styles.moreCoursesPill}>+{extra} More</span>
              )}
            </div>
          )}
        </div>

        {/* ── EXPLORE COURSES CTA BUTTON ── */}
        <div className={styles.actionWrapper}>
          <Link href="/courses" className={styles.exploreBtn}>
            <span>Explore Courses</span>
            <ArrowRight size={14} className={styles.btnArrow} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
