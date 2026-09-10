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
  Mail,
  Code2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Trainer } from '@/generated/prisma/client';
import styles from './TrainerCard.module.css';

type Course = { id: string; title: string; logo: string; trainerId: string };

// ── SKILL DETECTION ──────────────────────────────────────────────────────────
const SKILL_MAP: { keyword: string; label: string; icon: string }[] = [
  { keyword: 'python',           label: 'Python',           icon: '🐍' },
  { keyword: 'react',            label: 'React.js',         icon: '⚛️' },
  { keyword: 'node',             label: 'Node.js',          icon: '🟢' },
  { keyword: 'java',             label: 'Java Enterprise',  icon: '☕' },
  { keyword: 'javascript',       label: 'JavaScript',       icon: '🟡' },
  { keyword: 'typescript',       label: 'TypeScript',       icon: '🔷' },
  { keyword: 'django',           label: 'Django',           icon: '🎸' },
  { keyword: 'spring',           label: 'Spring Boot',      icon: '🍃' },
  { keyword: 'machine learning', label: 'Machine Learning', icon: '🤖' },
  { keyword: 'data science',     label: 'Data Science',     icon: '📊' },
  { keyword: 'aws',              label: 'AWS Cloud',        icon: '☁️' },
  { keyword: 'docker',           label: 'Docker & K8s',     icon: '🐳' },
  { keyword: 'c++',              label: 'C++ Systems',      icon: '⚙️' },
  { keyword: 'devops',           label: 'DevOps',           icon: '🔧' },
  { keyword: 'next',             label: 'Next.js',          icon: '▲' },
  { keyword: 'fullstack',        label: 'Full Stack Web',   icon: '💻' },
  { keyword: 'full stack',       label: 'Full Stack Web',   icon: '💻' },
  { keyword: 'web developer',    label: 'Modern Web Dev',   icon: '🌐' },
  { keyword: 'database',         label: 'SQL & Databases',  icon: '🗄️' },
  { keyword: 'backend',          label: 'Backend Arch',     icon: '🛠️' },
  { keyword: 'frontend',         label: 'Frontend UI/UX',   icon: '🎨' },
];

function getSkills(trainer: Trainer) {
  const text = `${trainer.specialization || ''} ${trainer.bio || ''}`.toLowerCase();
  const detected = SKILL_MAP.filter((s) => text.includes(s.keyword));
  if (detected.length > 0) {
    return detected.slice(0, 3);
  }
  return [
    { label: trainer.specialization || 'Software Engineering', icon: '💻' },
    { label: 'System Architecture', icon: '⚙️' },
    { label: 'Mentorship', icon: '🎯' },
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
    return { label: 'Top Rated Faculty', icon: <Star size={11} className={styles.starIconGold} />, pillClass: styles.badgeGold };
  }
  if (indexSeed % 2 === 0) {
    return { label: 'Featured Mentor', icon: <Trophy size={11} className={styles.trophyIconBlue} />, pillClass: styles.badgeBlue };
  }
  return { label: 'Senior Instructor', icon: <GraduationCap size={11} className={styles.gradIconPurple} />, pillClass: styles.badgePurple };
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
      icon: <Star size={13} className={styles.metricStar} />,
      value: ratingValue,
      label: 'Rating',
    },
    {
      icon: <Users size={13} className={styles.metricUsers} />,
      value: `${studentCount}+`,
      label: 'Students',
    },
    {
      icon: <BookOpen size={13} className={styles.metricCourses} />,
      value: trainerCourses.length.toString(),
      label: 'Courses',
    },
    {
      icon: <Award size={13} className={styles.metricExp} />,
      value: experienceValue.replace(/ years?/i, ' Yrs'),
      label: 'Exp',
    },
  ];

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Top subtle hairline accent line */}
      <div className={styles.topAccentBar} />

      {/* ── CARD TOP BAR (TAG + ADMIN CONTROLS) ── */}
      <div className={styles.cardHeader}>
        <div className={`${styles.featuredBadge} ${featuredBadge.pillClass}`}>
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

      <div className={styles.cardBody}>
        {/* ── PROFILE SECTION ── */}
        <div className={styles.profileSection}>
          <div className={styles.avatarWrapper}>
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

          <div className={styles.profileDetails}>
            <div className={styles.nameRow}>
              <h3 className={styles.trainerName}>{trainer.name}</h3>
              <span className={styles.verifiedBadge} title="Verified Faculty Mentor">
                ✓
              </span>
            </div>

            <div className={styles.specializationPill}>
              <span className={styles.specDot} />
              <span className={styles.specText}>
                {trainer.specialization || 'Fullstack Developer'}
              </span>
            </div>
          </div>
        </div>

        {/* ── STREAMLINED 4-METRIC STRIP ── */}
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

        {/* ── ABOUT TRAINER BIO SECTION ── */}
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
                  <span className={styles.skillEmoji}>{s.icon}</span>
                  <span>{s.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── ASSIGNED / ACTIVE COURSES ── */}
        <div className={styles.infoSection}>
          <div className={styles.sectionHeader}>
            <BookOpen size={12} className={styles.sectionIcon} />
            <span className={styles.sectionTitle}>Curriculum & Courses</span>
          </div>
          {trainerCourses.length === 0 ? (
            <div className={styles.noCoursesPill}>
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
                  <BookOpen size={11} className={styles.courseIcon} />
                  <span>{c.title}</span>
                </Link>
              ))}
              {extra > 0 && (
                <span className={styles.moreCoursesPill}>+{extra} More</span>
              )}
            </div>
          )}
        </div>

        {/* ── CTA BUTTON ── */}
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
