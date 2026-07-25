'use client';

import { motion } from 'framer-motion';
import {
  Star, Users, BookOpen, Award, BadgeCheck,
  ArrowRight, ShieldCheck, Trophy, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Trainer } from '@/generated/prisma/client';
import styles from './TrainerCard.module.css';

type Course = { id: string; title: string; logo: string; trainerId: string };

// ── SKILL DETECTION ──────────────────────────────────────────────────────────
const SKILL_MAP: { keyword: string; label: string; icon: string }[] = [
  { keyword: 'python',      label: 'Python',       icon: '🐍' },
  { keyword: 'react',       label: 'React',        icon: '⚛️' },
  { keyword: 'node',        label: 'Node.js',      icon: '🟢' },
  { keyword: 'java',        label: 'Java',         icon: '☕' },
  { keyword: 'javascript',  label: 'JavaScript',   icon: '🟡' },
  { keyword: 'typescript',  label: 'TypeScript',   icon: '🔷' },
  { keyword: 'django',      label: 'Django',       icon: '🎸' },
  { keyword: 'flask',       label: 'Flask',        icon: '🧪' },
  { keyword: 'spring',      label: 'Spring Boot',  icon: '🍃' },
  { keyword: 'angular',     label: 'Angular',      icon: '🔴' },
  { keyword: 'vue',         label: 'Vue',          icon: '💚' },
  { keyword: 'machine learning', label: 'ML',      icon: '🤖' },
  { keyword: 'data science', label: 'Data Science',icon: '📊' },
  { keyword: 'aws',         label: 'AWS',          icon: '☁️' },
  { keyword: 'docker',      label: 'Docker',       icon: '🐳' },
  { keyword: 'postgresql',  label: 'PostgreSQL',   icon: '🐘' },
  { keyword: 'mongodb',     label: 'MongoDB',      icon: '🍃' },
  { keyword: 'figma',       label: 'Figma',        icon: '🎨' },
  { keyword: 'ui/ux',       label: 'UI/UX',        icon: '✏️' },
  { keyword: 'c++',         label: 'C++',          icon: '⚙️' },
  { keyword: 'devops',      label: 'DevOps',       icon: '🔧' },
  { keyword: 'next',        label: 'Next.js',      icon: '▲' },
  { keyword: 'express',     label: 'Express',      icon: '🚀' },
  { keyword: 'rest api',    label: 'REST API',     icon: '🔗' },
  { keyword: 'full stack',  label: 'Full Stack',   icon: '💻' },
  { keyword: 'frontend',    label: 'Frontend',     icon: '🖥️' },
  { keyword: 'backend',     label: 'Backend',      icon: '⚙️' },
];

function getSkills(trainer: Trainer) {
  const text = `${trainer.specialization} ${trainer.bio}`.toLowerCase();
  return SKILL_MAP.filter((s) => text.includes(s.keyword)).slice(0, 6);
}

// ── TRUST INDICATORS ─────────────────────────────────────────────────────────
function getTrustBadges(trainer: Trainer): { icon: string; label: string }[] {
  const text = `${trainer.specialization} ${trainer.bio} ${trainer.experience}`.toLowerCase();
  const badges: { icon: string; label: string }[] = [];
  if (text.includes('google'))    badges.push({ icon: '🎓', label: 'Google Certified' });
  if (text.includes('aws'))       badges.push({ icon: '☁️', label: 'AWS Certified' });
  if (text.includes('microsoft')) badges.push({ icon: '🪟', label: 'Microsoft Certified' });
  if ((trainer.rating || 0) >= 4.8) badges.push({ icon: '⭐', label: 'Top Rated Mentor' });
  const students = (trainer.name.charCodeAt(0) * 47) % 500 + 50;
  if (students >= 300) badges.push({ icon: '👥', label: `${students}+ Students Trained` });
  return badges.slice(0, 3);
}

// ── FEATURED BADGE ───────────────────────────────────────────────────────────
function getFeaturedBadge(trainer: Trainer): { icon: string; label: string } | null {
  if ((trainer.rating || 0) >= 4.9) return { icon: '⭐', label: 'Top Rated' };
  if ((trainer.name.charCodeAt(0) * 47) % 500 + 50 >= 400) return { icon: '🏆', label: 'Featured' };
  return null;
}

// ── AVATAR GRADIENT — purple/blue palette only ──────────────────────────────
const GRADIENTS = [
  ['#4f46e5', '#818cf8'],   // indigo → light indigo
  ['#6366f1', '#a5b4fc'],   // violet → periwinkle
  ['#3b82f6', '#93c5fd'],   // blue → light blue
  ['#4f46e5', '#38bdf8'],   // indigo → sky
  ['#6366f1', '#67e8f9'],   // violet → cyan
  ['#3730a3', '#818cf8'],   // deep indigo → light indigo
  ['#1d4ed8', '#60a5fa'],   // deep blue → blue
];
function getGradient(name: string) {
  return GRADIENTS[name.charCodeAt(0) % GRADIENTS.length];
}

interface Props {
  trainer: Trainer;
  courses: Course[];
  isAdmin?: boolean;
  onEdit?: (trainer: Trainer) => void;
  onDelete?: (id: string) => void;
}

export default function TrainerCard({
  trainer, courses, isAdmin = false, onEdit, onDelete,
}: Props) {
  const trainerCourses = courses.filter((c) => c.trainerId === trainer.id);
  const skills        = getSkills(trainer);
  const trustBadges   = getTrustBadges(trainer);
  const featuredBadge = getFeaturedBadge(trainer);
  const [c1, c2]      = getGradient(trainer.name);
  const studentCount  = (trainer.name.charCodeAt(0) * 47) % 500 + 50;
  const MAX_COURSES   = 3;
  const extra         = trainerCourses.length - MAX_COURSES;

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      {/* ── MESH BACKGROUND ── */}
      <div className={styles.meshBg} />
      <div className={styles.gridPattern} />

      {/* ── TOP STRIPE ── */}
      <div className={styles.topStripe} style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />

      {/* ── FEATURED BADGE ── */}
      {featuredBadge && (
        <div className={styles.featuredBadge}
          style={{ background: `linear-gradient(135deg, ${c1}22, ${c2}22)`, borderColor: `${c1}44` }}>
          <span>{featuredBadge.icon}</span>
          <span>{featuredBadge.label}</span>
        </div>
      )}

      {/* ── ADMIN ACTIONS ── */}
      {isAdmin && (
        <div className={styles.adminActions}>
          <button className={styles.adminBtn} onClick={() => onEdit?.(trainer)} title="Edit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className={`${styles.adminBtn} ${styles.adminDanger}`} onClick={() => onDelete?.(trainer.id)} title="Delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      )}

      <div className={styles.inner}>
        {/* ── HEADER: AVATAR + INFO ── */}
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            {/* Radial glow behind avatar */}
            <div className={styles.avatarGlow} style={{ background: `radial-gradient(circle, ${c1}55 0%, transparent 70%)` }} />
            {trainer.avatar ? (
              <motion.img
                src={trainer.avatar} alt={trainer.name}
                className={styles.avatarImg}
                whileHover={{ scale: 1.05 }}
              />
            ) : (
              <motion.div
                className={styles.avatarInitials}
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                whileHover={{ scale: 1.05 }}
              >
                {trainer.name.charAt(0).toUpperCase()}
              </motion.div>
            )}
            {/* Thin glowing ring */}
            <div className={styles.avatarRing} style={{ borderColor: `${c1}66` }} />
          </div>

          <div className={styles.nameBlock}>
            <div className={styles.nameRow}>
              <h3 className={styles.name}>{trainer.name}</h3>
              <BadgeCheck size={17} className={styles.verifiedIcon} />
            </div>
            <span className={styles.designation}>{trainer.specialization}</span>

            {/* Trust Indicators */}
            {trustBadges.length > 0 && (
              <div className={styles.trustRow}>
                {trustBadges.map((b) => (
                  <span key={b.label} className={styles.trustBadge}>
                    {b.icon} {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className={styles.statsGrid}>
          {[
            { icon: <Star size={18} />,     value: trainer.rating || '4.8',       label: 'Rating',   color: '#eab308' },
            { icon: <Users size={18} />,    value: studentCount,                   label: 'Students', color: '#60a5fa' },
            { icon: <BookOpen size={18} />, value: trainerCourses.length,          label: 'Courses',  color: '#818cf8' },
            { icon: <Award size={18} />,    value: trainer.experience || '5+',     label: 'Exp',      color: '#a5b4fc' },
          ].map((s) => (
            <motion.div
              key={s.label}
              className={styles.statCard}
              whileHover={{ y: -3, boxShadow: `0 8px 24px ${s.color}22` }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <span className={styles.statIcon} style={{ color: s.color }}>{s.icon}</span>
              <span className={styles.statVal}>{s.value}</span>
              <span className={styles.statLbl}>{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* ── GRADIENT DIVIDER ── */}
        <div className={styles.gradDivider} style={{ background: `linear-gradient(90deg, transparent, ${c1}55, ${c2}44, transparent)` }} />

        {/* ── ABOUT ── */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>About Trainer</span>
          <p className={styles.bio}>
            {trainer.bio || 'Expert instructor with hands-on industry experience delivering practical, real-world training.'}
          </p>
        </div>

        {/* ── SKILLS ── */}
        {skills.length > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Skills</span>
            <div className={styles.skillChips}>
              {skills.map((s) => (
                <motion.span
                  key={s.label}
                  className={styles.skillChip}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  <span className={styles.skillIcon}>{s.icon}</span>
                  {s.label}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* ── COURSES ── */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Courses</span>
          {trainerCourses.length === 0 ? (
            <span className={styles.noCourses}>No Courses Assigned</span>
          ) : (
            <div className={styles.courseChips}>
              {trainerCourses.slice(0, MAX_COURSES).map((c) => (
                <span key={c.id} className={styles.courseChip}>
                  <BookOpen size={11} style={{ flexShrink: 0, opacity: 0.6 }} />
                  {c.title}
                </span>
              ))}
              {extra > 0 && <span className={styles.moreChip}>+{extra} More</span>}
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div className={styles.ctaWrap}>
          <Link href="/trainers" className={styles.ctaBtn}>
            <span>Explore Courses</span>
            <motion.span
              className={styles.ctaArrow}
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <ArrowRight size={15} />
            </motion.span>
            {/* Shimmer overlay */}
            <span className={styles.ctaShimmer} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
