'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Clock,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Layers,
  ArrowRight,
  Code2,
  PlayCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import styles from './HeroDashboardCard.module.css';

export default function HeroDashboardCard() {
  const [selectedModule, setSelectedModule] = useState(3);

  const modules = [
    {
      id: 1,
      title: 'HTML & Modern CSS Architecture',
      duration: '6 Hours',
      status: 'completed',
      type: 'Foundation',
    },
    {
      id: 2,
      title: 'JavaScript & TypeScript Mastery',
      duration: '10 Hours',
      status: 'completed',
      type: 'Core Logic',
    },
    {
      id: 3,
      title: 'React & Frontend Frameworks',
      duration: '12 Hours',
      status: 'completed',
      type: 'Architecture',
    },
    {
      id: 4,
      title: 'REST APIs & Database Design',
      duration: '12 Hours',
      status: 'in-progress',
      type: 'Current Module',
    },
  ];

  return (
    <div className={styles.wrapper}>
      {/* ── LMS PRODUCT DASHBOARD PREVIEW ── */}
      <div className={styles.lmsCard}>
        {/* Window Titlebar */}
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.dots}>
              <span className={styles.dotRed} />
              <span className={styles.dotYellow} />
              <span className={styles.dotGreen} />
            </div>
            <div className={styles.platformTitle}>
              <GraduationCap size={15} className={styles.platformIcon} />
              <span>ATLYX Academic Learning Hub</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.liveSessionBadge}>
              <span className={styles.pulseDot} />
              <span>Active Session</span>
            </span>
          </div>
        </div>

        {/* Current Course Track & Progress Overview */}
        <div className={styles.courseOverview}>
          <div className={styles.overviewTop}>
            <div className={styles.courseMeta}>
              <span className={styles.trackLabel}>CURRENT COURSE TRACK</span>
              <h3 className={styles.courseTitle}>Full Stack Web Development</h3>
            </div>
            <div className={styles.progressPercentWrap}>
              <span className={styles.progressPercent}>84%</span>
              <span className={styles.progressSubLabel}>Completed</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: '84%' }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>

          {/* Meta metrics */}
          <div className={styles.overviewMeta}>
            <div className={styles.metaBlock}>
              <Clock size={13} className={styles.metaIcon} />
              <span>32 / 40 Learning Hours</span>
            </div>
            <span className={styles.metaDivider}>•</span>
            <div className={styles.metaBlock}>
              <BookOpen size={13} className={styles.metaIcon} />
              <span>18 / 22 Modules</span>
            </div>
            <span className={styles.metaDivider}>•</span>
            <div className={styles.metaBlock}>
              <ShieldCheck size={13} className={styles.metaIconBlue} />
              <span>Accredited Track</span>
            </div>
          </div>
        </div>

        {/* Learning Modules Checklist */}
        <div className={styles.modulesSection}>
          <div className={styles.sectionHeaderRow}>
            <span className={styles.sectionTitle}>LEARNING MODULES & MILESTONES</span>
            <span className={styles.moduleCountTag}>Module 4 of 6</span>
          </div>

          <div className={styles.moduleList}>
            {modules.map((mod, idx) => {
              const isCompleted = mod.status === 'completed';
              const isInProgress = mod.status === 'in-progress';

              return (
                <div
                  key={mod.id}
                  className={`${styles.moduleItem} ${
                    isInProgress ? styles.moduleItemActive : ''
                  }`}
                  onClick={() => setSelectedModule(idx)}
                >
                  <div className={styles.moduleStatusIcon}>
                    {isCompleted ? (
                      <CheckCircle2 size={16} className={styles.checkIconCompleted} />
                    ) : (
                      <div className={styles.inProgressDot} />
                    )}
                  </div>

                  <div className={styles.moduleInfo}>
                    <span className={styles.moduleName}>{mod.title}</span>
                    <span className={styles.moduleSub}>{mod.duration} · {mod.type}</span>
                  </div>

                  <div className={styles.moduleAction}>
                    {isCompleted ? (
                      <span className={styles.completedTag}>Completed</span>
                    ) : (
                      <span className={styles.inProgressTag}>
                        <PlayCircle size={12} />
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Faculty Mentorship & Certification Footer */}
        <div className={styles.cardFooter}>
          <div className={styles.mentorInfo}>
            <div className={styles.mentorAvatar}>GM</div>
            <div className={styles.mentorText}>
              <span className={styles.mentorName}>Gowtham M</span>
              <span className={styles.mentorRole}>Faculty Mentor · 1-on-1 Guidance Verified</span>
            </div>
          </div>

          <div className={styles.certBadge}>
            <Award size={13} className={styles.certIcon} />
            <span>Certificate Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
