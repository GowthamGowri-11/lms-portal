'use client';

import { motion } from 'framer-motion';
import { Star, Users, BookOpen, Award, BadgeCheck, ArrowRight, User, Compass, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Trainer } from '@/generated/prisma/client';
import styles from './TrainerCard.module.css';

type Course = { id: string; title: string; logo: string; trainerId: string };

// ── SKILL DETECTION ──────────────────────────────────────────────────────────
const SKILL_MAP: { keyword: string; label: string; icon: string }[] = [
  { keyword: 'python',          label: 'Python',       icon: '🐍' },
  { keyword: 'react',           label: 'React',        icon: '⚛️' },
  { keyword: 'node',            label: 'Node.js',      icon: '🟢' },
  { keyword: 'java',            label: 'Java',         icon: '☕' },
  { keyword: 'javascript',      label: 'JavaScript',   icon: '🟡' },
  { keyword: 'typescript',      label: 'TypeScript',   icon: '🔷' },
  { keyword: 'django',          label: 'Django',       icon: '🎸' },
  { keyword: 'flask',           label: 'Flask',        icon: '🧪' },
  { keyword: 'spring',          label: 'Spring Boot',  icon: '🍃' },
  { keyword: 'angular',         label: 'Angular',      icon: '🔴' },
  { keyword: 'vue',             label: 'Vue',          icon: '💚' },
  { keyword: 'machine learning', label: 'ML',          icon: '🤖' },
  { keyword: 'data science',    label: 'Data Science', icon: '📊' },
  { keyword: 'aws',             label: 'AWS',          icon: '☁️' },
  { keyword: 'docker',          label: 'Docker',       icon: '🐳' },
  { keyword: 'postgresql',      label: 'PostgreSQL',   icon: '🐘' },
  { keyword: 'mongodb',         label: 'MongoDB',      icon: '🍃' },
  { keyword: 'figma',           label: 'Figma',        icon: '🎨' },
  { keyword: 'ui/ux',           label: 'UI/UX',        icon: '✏️' },
  { keyword: 'c++',             label: 'C++',          icon: '⚙️' },
  { keyword: 'devops',          label: 'DevOps',       icon: '🔧' },
  { keyword: 'next',            label: 'Next.js',      icon: '▲' },
  { keyword: 'express',         label: 'Express',      icon: '🚀' },
  { keyword: 'rest api',        label: 'REST API',     icon: '🔗' },
  { keyword: 'full stack',      label: 'Full Stack',   icon: '💻' },
  { keyword: 'frontend',        label: 'Frontend',     icon: '🖥️' },
  { keyword: 'backend',         label: 'Backend',      icon: '⚙️' },
];

function getSkills(trainer: Trainer) {
  const text = `${trainer.specialization || ''} ${trainer.bio || ''}`.toLowerCase();
  return SKILL_MAP.filter((s) => text.includes(s.keyword)).slice(0, 6);
}

// ── FEATURED BADGE ───────────────────────────────────────────────────────────
function getFeaturedBadge(trainer: Trainer): { icon: string; label: string } | null {
  if ((trainer.rating || 0) >= 4.9) return { icon: '⭐', label: 'Top Rated' };
  if ((trainer.name.charCodeAt(0) * 47) % 500 + 50 >= 400) return { icon: '🏆', label: 'Featured' };
  return null;
}

// ── AVATAR GRADIENT — purple/blue palette ──────────────────────────────────
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
  return GRADIENTS[(name || 'T').charCodeAt(0) % GRADIENTS.length];
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
  const featuredBadge = getFeaturedBadge(trainer);
  const [c1, c2]      = getGradient(trainer.name);
  const studentCount  = (trainer.name.charCodeAt(0) * 47) % 500 + 50;
  const MAX_COURSES   = 3;
  const extra         = trainerCourses.length - MAX_COURSES;

  // Stat tile configurations with specific accent colors per user prompt:
  // Rating -> amber/yellow
  // Students -> blue
  // Courses -> green
  // Experience -> purple/pink
  const statTiles = [
    {
      icon: <Star size={14} />,
      value: trainer.rating ? Number(trainer.rating).toFixed(1) : '4.8',
      label: 'Rating',
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.12)',
      border: 'rgba(251, 191, 36, 0.25)',
    },
    {
      icon: <Users size={14} />,
      value: `${studentCount}+`,
      label: 'Students',
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.25)',
    },
    {
      icon: <BookOpen size={14} />,
      value: trainerCourses.length,
      label: 'Courses',
      color: '#34d399',
      bg: 'rgba(52, 211, 153, 0.12)',
      border: 'rgba(52, 211, 153, 0.25)',
    },
    {
      icon: <Award size={14} />,
      value: trainer.experience || '5+',
      label: 'Experience',
      color: '#c084fc',
      bg: 'rgba(192, 132, 252, 0.12)',
      border: 'rgba(192, 132, 252, 0.25)',
    },
  ];

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* ── MESH & LIGHTING EFFECTS ── */}
      <div className={styles.meshBg} />
      <div className={styles.gridPattern} />
      <div className={styles.innerHighlight} />

      {/* ── TOP GRADIENT ACCENT LINE ── */}
      <div className={styles.topStripe} style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />

      {/* ── BADGES & ADMIN ACTIONS ── */}
      <div className={styles.topBadgesRow}>
        {featuredBadge && (
          <div
            className={styles.featuredBadge}
            style={{ background: `linear-gradient(135deg, ${c1}25, ${c2}25)`, borderColor: `${c1}55` }}
          >
            <span>{featuredBadge.icon}</span>
            <span>{featuredBadge.label}</span>
          </div>
        )}

        {isAdmin && (
          <div className={styles.adminActions}>
            <button className={styles.adminBtn} onClick={() => onEdit?.(trainer)} title="Edit Trainer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button className={`${styles.adminBtn} ${styles.adminDanger}`} onClick={() => onDelete?.(trainer.id)} title="Delete Trainer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className={styles.inner}>
        {/* ── TOP TRAINER PROFILE AREA ── */}
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatarGlow} style={{ background: `radial-gradient(circle, ${c1}77 0%, transparent 70%)` }} />
            {trainer.avatar ? (
              <motion.img
                src={trainer.avatar}
                alt={trainer.name}
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
            <div className={styles.avatarRing} style={{ borderColor: `${c1}88` }} />
            <div className={styles.verifiedCheckOverlay} title="Verified Trainer">
              ✓
            </div>
          </div>

          <div className={styles.nameBlock}>
            <div className={styles.nameRow}>
              <h3 className={styles.name}>{trainer.name}</h3>
              <BadgeCheck size={18} className={styles.verifiedIcon} />
            </div>
            <span className={styles.designation}>{trainer.specialization || 'FULLSTACK DEVELOPER'}</span>

            {/* Premium metadata row using existing data */}
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                <Star size={11} className={styles.metaIcon} style={{ color: '#fbbf24' }} />
                <span>Top Rated</span>
              </span>
              <span className={styles.metaDot}>•</span>
              <span className={styles.metaItem}>
                <Award size={11} className={styles.metaIcon} style={{ color: '#c084fc' }} />
                <span>{trainer.experience || '5+ Yrs'}</span>
              </span>
              <span className={styles.metaDot}>•</span>
              <span className={styles.metaItem}>
                <Users size={11} className={styles.metaIcon} style={{ color: '#38bdf8' }} />
                <span>{studentCount}+ Students</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── 4 COMPACT STAT TILES ── */}
        <div className={styles.statsGrid}>
          {statTiles.map((s) => (
            <motion.div
              key={s.label}
              className={styles.statCard}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <div className={styles.statIconContainer} style={{ background: s.bg, borderColor: s.border }}>
                <span style={{ color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</span>
              </div>
              <span className={styles.statVal}>{s.value}</span>
              <span className={styles.statLbl}>{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* ── SUBTLE GRADIENT DIVIDER ── */}
        <div className={styles.gradDivider} style={{ background: `linear-gradient(90deg, transparent, ${c1}33, ${c2}33, transparent)` }} />

        {/* ── ABOUT TRAINER ── */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIconBadge}>
              <User size={13} className={styles.sectionIcon} />
            </div>
            <span className={styles.sectionLabel}>About Trainer</span>
          </div>
          <p className={styles.bio}>
            {trainer.bio || 'Expert instructor with hands-on industry experience delivering practical, real-world training.'}
          </p>
        </div>

        {/* ── OPTIONAL EXPERTISE / SKILLS AREA ── */}
        {skills.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconBadge}>
                <Sparkles size={13} className={styles.sectionIcon} />
              </div>
              <span className={styles.sectionLabel}>Expertise & Skills</span>
            </div>
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

        {/* ── COURSES SECTION ── */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIconBadge}>
              <BookOpen size={13} className={styles.sectionIcon} />
            </div>
            <span className={styles.sectionLabel}>Assigned Courses</span>
          </div>
          {trainerCourses.length === 0 ? (
            <span className={styles.noCourses}>No Courses Assigned</span>
          ) : (
            <div className={styles.courseChips}>
              {trainerCourses.slice(0, MAX_COURSES).map((c) => (
                <span key={c.id} className={styles.courseChip}>
                  <BookOpen size={11} style={{ flexShrink: 0, opacity: 0.75, color: '#818cf8' }} />
                  {c.title}
                </span>
              ))}
              {extra > 0 && <span className={styles.moreChip}>+{extra} More</span>}
            </div>
          )}
        </div>

        {/* ── FULL-WIDTH CTA BUTTON ── */}
        <div className={styles.ctaWrap}>
          <Link href="/courses" className={styles.ctaBtn}>
            <Compass size={16} className={styles.ctaIconLeft} />
            <span className={styles.ctaText}>Explore Courses</span>
            <motion.span
              className={styles.ctaArrow}
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <ArrowRight size={16} />
            </motion.span>
            <span className={styles.ctaShimmer} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

