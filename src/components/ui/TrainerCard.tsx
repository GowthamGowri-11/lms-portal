'use client';

import { motion } from 'framer-motion';
import { Star, Users, BookOpen, Award, BadgeCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Trainer } from '@/generated/prisma/client';
import styles from './TrainerCard.module.css';

type Course = { id: string; title: string; logo: string; trainerId: string };

// Extract skill keywords from specialization + bio
function getSkills(trainer: Trainer): string[] {
  const keywords = [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js',
    'Express', 'Django', 'Flask', 'Spring Boot', 'Angular', 'Vue',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'AWS',
    'Machine Learning', 'Data Science', 'AI', 'C++', 'DevOps',
    'UI/UX', 'Figma', 'CSS', 'HTML', 'Next.js', 'REST API',
  ];
  const text = `${trainer.specialization} ${trainer.bio}`.toLowerCase();
  return keywords.filter((k) => text.includes(k.toLowerCase())).slice(0, 6);
}

// Deterministic student count from name
function getStudentCount(trainer: Trainer) {
  return (trainer.name.charCodeAt(0) * 47) % 500 + 50;
}

// Gradient per initial letter
function getAvatarGradient(name: string) {
  const gradients = [
    'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    'linear-gradient(135deg, #00b894, #00cec9)',
    'linear-gradient(135deg, #e17055, #fd79a8)',
    'linear-gradient(135deg, #0984e3, #74b9ff)',
    'linear-gradient(135deg, #fdcb6e, #e17055)',
    'linear-gradient(135deg, #6c5ce7, #fd79a8)',
    'linear-gradient(135deg, #00cec9, #55efc4)',
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

interface TrainerCardProps {
  trainer: Trainer;
  courses: Course[];
  // Admin-only props
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
}: TrainerCardProps) {
  const trainerCourses = courses.filter((c) => c.trainerId === trainer.id);
  const skills = getSkills(trainer);
  const studentCount = getStudentCount(trainer);
  const avatarGradient = getAvatarGradient(trainer.name);
  const maxCourses = 3;
  const extraCourses = trainerCourses.length - maxCourses;

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -8, boxShadow: '0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(108,92,231,0.25)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* ── TOP GLOW STRIPE ── */}
      <div className={styles.topGlow} style={{ background: avatarGradient }} />

      {/* ── ADMIN ACTIONS ── */}
      {isAdmin && (
        <div className={styles.adminActions}>
          <button className={styles.adminBtn} onClick={() => onEdit?.(trainer)} title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className={`${styles.adminBtn} ${styles.adminBtnDanger}`} onClick={() => onDelete?.(trainer.id)} title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      )}

      {/* ── HEADER: AVATAR + NAME + BADGE ── */}
      <div className={styles.header}>
        <div className={styles.avatarWrap}>
          {trainer.avatar ? (
            <img src={trainer.avatar} alt={trainer.name} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarInitials} style={{ background: avatarGradient }}>
              {trainer.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className={styles.avatarRing} style={{ background: avatarGradient }} />
        </div>

        <div className={styles.nameBlock}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{trainer.name}</h3>
            <span className={styles.verifiedBadge} title="Verified Instructor">
              <BadgeCheck size={16} />
            </span>
          </div>
          <span className={styles.designation}>{trainer.specialization}</span>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <Star size={15} className={styles.statIcon} style={{ color: '#eab308' }} />
          <span className={styles.statVal}>{trainer.rating || '4.8'}</span>
          <span className={styles.statLbl}>Rating</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statBox}>
          <Users size={15} className={styles.statIcon} style={{ color: '#00cec9' }} />
          <span className={styles.statVal}>{studentCount}</span>
          <span className={styles.statLbl}>Students</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statBox}>
          <BookOpen size={15} className={styles.statIcon} style={{ color: '#a29bfe' }} />
          <span className={styles.statVal}>{trainerCourses.length}</span>
          <span className={styles.statLbl}>Courses</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statBox}>
          <Award size={15} className={styles.statIcon} style={{ color: '#fd79a8' }} />
          <span className={styles.statVal}>{trainer.experience || '5+ yrs'}</span>
          <span className={styles.statLbl}>Exp</span>
        </div>
      </div>

      {/* ── GRADIENT DIVIDER ── */}
      <div className={styles.gradDivider} />

      {/* ── ABOUT ── */}
      <div className={styles.about}>
        <span className={styles.sectionLabel}>About Trainer</span>
        <p className={styles.bio}>
          {trainer.bio || 'Expert instructor with hands-on industry experience.'}
        </p>
      </div>

      {/* ── SKILLS ── */}
      {skills.length > 0 && (
        <div className={styles.skills}>
          <span className={styles.sectionLabel}>Skills</span>
          <div className={styles.skillChips}>
            {skills.map((skill) => (
              <span key={skill} className={styles.skillChip}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── COURSES ── */}
      <div className={styles.coursesBlock}>
        <span className={styles.sectionLabel}>Courses</span>
        {trainerCourses.length === 0 ? (
          <span className={styles.noCourses}>No Courses Assigned</span>
        ) : (
          <div className={styles.courseChips}>
            {trainerCourses.slice(0, maxCourses).map((c) => (
              <span key={c.id} className={styles.courseChip}>
                {c.title}
              </span>
            ))}
            {extraCourses > 0 && (
              <span className={styles.moreChip}>+{extraCourses} More</span>
            )}
          </div>
        )}
      </div>

      {/* ── CTA ── */}
      <div className={styles.cta}>
        <Link href={`/trainers`} className={styles.ctaBtn}>
          <span>Explore Courses</span>
          <ArrowRight size={15} className={styles.ctaArrow} />
        </Link>
      </div>
    </motion.div>
  );
}
