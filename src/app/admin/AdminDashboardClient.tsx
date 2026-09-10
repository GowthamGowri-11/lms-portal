'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Users,
  GraduationCap,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Plus,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Activity,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem, PageTransition } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { CourseWithArrays, formatDate } from '@/lib/utils';
import { Trainer, Student, Enrollment } from '@/generated/prisma/client';

export default function AdminDashboardClient({
  courses,
  trainers,
  students,
  enrollments,
}: {
  courses: CourseWithArrays[];
  trainers: Trainer[];
  students: Student[];
  enrollments: Enrollment[];
}) {
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const totalRevenue = useMemo(() => {
    return enrollments
      .filter((e) => e.paymentStatus === 'completed')
      .reduce((sum, e) => {
        const course = courses.find((c) => c.id === e.courseId);
        return sum + (course?.discountPrice || course?.price || 0);
      }, 0);
  }, [enrollments, courses]);

  // Master Stat Cards Definition
  const stats = [
    {
      id: 'courses',
      label: 'Total Courses',
      value: courses.length.toString(),
      subLabel: 'Active curriculum',
      change: '+12.4%',
      positive: true,
      timeframe: 'vs last month',
      icon: BookOpen,
      accentColor: '#2563eb',
      accentBg: 'rgba(37, 99, 235, 0.08)',
      accentBorder: 'rgba(37, 99, 235, 0.2)',
      sparkline: 'M0 25 C 20 22, 40 10, 60 18 C 80 24, 100 8, 120 5 L 120 30 L 0 30 Z',
      sparklinePath: 'M0 25 C 20 22, 40 10, 60 18 C 80 24, 100 8, 120 5',
    },
    {
      id: 'trainers',
      label: 'Faculty Mentors',
      value: trainers.length.toString(),
      subLabel: 'Verified instructors',
      change: '+5.2%',
      positive: true,
      timeframe: 'vs last month',
      icon: Users,
      accentColor: '#7c3aed',
      accentBg: 'rgba(124, 58, 237, 0.08)',
      accentBorder: 'rgba(124, 58, 237, 0.2)',
      sparkline: 'M0 20 C 25 15, 50 25, 75 10 C 95 5, 110 12, 120 4 L 120 30 L 0 30 Z',
      sparklinePath: 'M0 20 C 25 15, 50 25, 75 10 C 95 5, 110 12, 120 4',
    },
    {
      id: 'students',
      label: 'Enrolled Students',
      value: students.length.toString(),
      subLabel: 'Active learners',
      change: '+18.7%',
      positive: true,
      timeframe: 'vs last month',
      icon: GraduationCap,
      accentColor: '#059669',
      accentBg: 'rgba(5, 150, 105, 0.08)',
      accentBorder: 'rgba(5, 150, 105, 0.2)',
      sparkline: 'M0 28 C 30 20, 60 22, 80 12 C 100 6, 110 10, 120 2 L 120 30 L 0 30 Z',
      sparklinePath: 'M0 28 C 30 20, 60 22, 80 12 C 100 6, 110 10, 120 2',
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      subLabel: 'Gross platform earnings',
      change: '+24.1%',
      positive: true,
      timeframe: 'vs last month',
      icon: IndianRupee,
      accentColor: '#0284c7',
      accentBg: 'rgba(2, 132, 199, 0.08)',
      accentBorder: 'rgba(2, 132, 199, 0.2)',
      sparkline: 'M0 26 C 25 24, 50 14, 75 18 C 95 12, 110 6, 120 2 L 120 30 L 0 30 Z',
      sparklinePath: 'M0 26 C 25 24, 50 14, 75 18 C 95 12, 110 6, 120 2',
    },
  ];

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const student = students.find((s) => s.id === e.studentId);
      const course = courses.find((c) => c.id === e.courseId);
      const query = searchFilter.toLowerCase();
      
      const matchesSearch =
        (student?.name && student.name.toLowerCase().includes(query)) ||
        (student?.email && student.email.toLowerCase().includes(query)) ||
        (course?.title && course.title.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'completed'
          ? e.paymentStatus === 'completed'
          : e.paymentStatus !== 'completed';

      return matchesSearch && matchesStatus;
    });
  }, [enrollments, students, courses, searchFilter, statusFilter]);

  // Color generator for avatar initials
  const getAvatarGradient = (str: string) => {
    const gradients = [
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
      'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <PageTransition>
      <div className={styles.dashboard}>
        {/* ── MINIMALIST HERO / HEADER ── */}
        <FadeInUp>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.breadcrumb}>
                <span className={styles.breadcrumbBrand}>ATLYX Hub</span>
                <ChevronRight size={12} className={styles.breadcrumbChevron} />
                <span className={styles.breadcrumbCurrent}>Overview</span>
              </div>
              <h1 className={styles.title}>System Overview</h1>
              <p className={styles.subtitle}>
                Real-time institutional performance, course enrollments, and academic intelligence.
              </p>
            </div>

            <div className={styles.headerRight}>
              <div className={styles.telemetryBadge}>
                <span className={styles.telemetryDot} />
                <span className={styles.telemetryText}>Live Telemetry</span>
              </div>

              <Link href="/admin/courses" className={styles.primaryActionBtn}>
                <Plus size={16} strokeWidth={2.5} />
                <span>New Course</span>
              </Link>
            </div>
          </div>
        </FadeInUp>

        {/* ── MASTER PREMIUM STATS CARDS ── */}
        <StaggerContainer className={styles.statsGrid}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={stat.id}>
                <motion.div
                  className={styles.statCard}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  {/* Subtle top indicator line on hover */}
                  <div
                    className={styles.statGlowBar}
                    style={{ background: stat.accentColor }}
                  />

                  {/* Top Bar: Icon + Trend Badge */}
                  <div className={styles.statCardTop}>
                    <div
                      className={styles.statIconBadge}
                      style={{
                        backgroundColor: stat.accentBg,
                        borderColor: stat.accentBorder,
                        color: stat.accentColor,
                      }}
                    >
                      <Icon size={20} strokeWidth={2} />
                    </div>

                    <div
                      className={`${styles.trendBadge} ${
                        stat.positive ? styles.trendPositive : styles.trendNegative
                      }`}
                    >
                      {stat.positive ? (
                        <TrendingUp size={13} strokeWidth={2.5} />
                      ) : (
                        <TrendingDown size={13} strokeWidth={2.5} />
                      )}
                      <span>{stat.change}</span>
                    </div>
                  </div>

                  {/* Middle: Metric Value */}
                  <div className={styles.statValueWrap}>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>

                  {/* Bottom: Sparkline & Context Note */}
                  <div className={styles.statCardBottom}>
                    <div className={styles.statSparklineWrap}>
                      <svg
                        viewBox="0 0 120 30"
                        className={styles.statSparklineSvg}
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id={`gradient-${stat.id}`}
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor={stat.accentColor}
                              stopOpacity="0.25"
                            />
                            <stop
                              offset="100%"
                              stopColor={stat.accentColor}
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                        <path
                          d={stat.sparkline}
                          fill={`url(#gradient-${stat.id})`}
                        />
                        <path
                          d={stat.sparklinePath}
                          fill="none"
                          stroke={stat.accentColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className={styles.statTimeframe}>
                      <span className={styles.statSubLabel}>{stat.subLabel}</span>
                      <span className={styles.statPeriod}>{stat.timeframe}</span>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* ── RECENT ENROLLMENTS MASTER TABLE CARD ── */}
        <FadeInUp delay={0.15}>
          <div className={styles.masterCard}>
            {/* Card Header */}
            <div className={styles.masterCardHeader}>
              <div className={styles.masterCardTitleGroup}>
                <div className={styles.masterCardTitleRow}>
                  <h2 className={styles.masterCardTitle}>Recent Student Enrollments</h2>
                  <span className={styles.recordCounterBadge}>
                    {filteredEnrollments.length} Total
                  </span>
                </div>
                <p className={styles.masterCardSubtitle}>
                  Real-time course admissions, learner progression, and verified payment statuses
                </p>
              </div>

              {/* Filters and Search Bar */}
              <div className={styles.filterControls}>
                <div className={styles.statusTabGroup}>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`${styles.statusTab} ${
                      statusFilter === 'all' ? styles.statusTabActive : ''
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`${styles.statusTab} ${
                      statusFilter === 'completed' ? styles.statusTabActive : ''
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`${styles.statusTab} ${
                      statusFilter === 'pending' ? styles.statusTabActive : ''
                    }`}
                  >
                    Pending
                  </button>
                </div>

                <div className={styles.searchBox}>
                  <Search size={15} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search student, email, or course..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      className={styles.clearSearchBtn}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student Profile</th>
                    <th>Enrolled Course</th>
                    <th>Payment Status</th>
                    <th>Course Progress</th>
                    <th>Date Registered</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredEnrollments.map((enrollment) => {
                      const student = students.find((s) => s.id === enrollment.studentId);
                      const course = courses.find((c) => c.id === enrollment.courseId);
                      const isCompleted = enrollment.paymentStatus === 'completed';
                      const studentName = student?.name || 'Anonymous Learner';
                      const avatarGradient = getAvatarGradient(studentName);

                      return (
                        <tr key={enrollment.id} className={styles.tableRow}>
                          <td>
                            <div className={styles.studentProfileCell}>
                              <div
                                className={styles.studentAvatar}
                                style={{ background: avatarGradient }}
                              >
                                {studentName.charAt(0).toUpperCase()}
                              </div>
                              <div className={styles.studentDetails}>
                                <span className={styles.studentName}>{studentName}</span>
                                <span className={styles.studentEmail}>
                                  {student?.email || 'No email attached'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className={styles.courseCell}>
                              <div className={styles.courseIconWrap}>
                                <BookOpen size={14} />
                              </div>
                              <span className={styles.courseName}>
                                {course?.title || 'Academic Course'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`${styles.statusPill} ${
                                isCompleted ? styles.statusSuccess : styles.statusWarning
                              }`}
                            >
                              <span className={styles.statusPillDot} />
                              {enrollment.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <div className={styles.progressCell}>
                              <div className={styles.progressTrack}>
                                <motion.div
                                  className={styles.progressBar}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${enrollment.progress}%` }}
                                  transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                              </div>
                              <span className={styles.progressValue}>
                                {enrollment.progress}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.dateCell}>
                              <Clock size={13} className={styles.dateIcon} />
                              <span>{formatDate(enrollment.enrolledAt)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </AnimatePresence>
                  {filteredEnrollments.length === 0 && (
                    <tr>
                      <td colSpan={5} className={styles.emptyState}>
                        <div className={styles.emptyStateInner}>
                          <div className={styles.emptyIconCircle}>
                            <Search size={24} />
                          </div>
                          <h4 className={styles.emptyStateTitle}>No enrollments found</h4>
                          <p className={styles.emptyStateText}>
                            Try adjusting your search terms or status filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </FadeInUp>

        {/* ── BENTO DUAL MASTER CARDS (TOP COURSES & FACULTY) ── */}
        <FadeInUp delay={0.25}>
          <div className={styles.bentoGrid}>
            {/* Top Enrolled Courses Bento Card */}
            <div className={styles.bentoCard}>
              <div className={styles.bentoCardHeader}>
                <div className={styles.bentoHeaderLeft}>
                  <div className={styles.bentoIconBadgeBlue}>
                    <BookOpen size={17} />
                  </div>
                  <div>
                    <h3 className={styles.bentoTitle}>Top Enrolled Courses</h3>
                    <span className={styles.bentoSubtitle}>Ranked by active enrollments</span>
                  </div>
                </div>
                <Link href="/admin/courses" className={styles.bentoViewAll}>
                  <span>View All</span>
                  <ArrowRight size={13} className={styles.bentoArrow} />
                </Link>
              </div>

              <div className={styles.bentoList}>
                {courses.length === 0 ? (
                  <div className={styles.bentoEmpty}>No courses available.</div>
                ) : (
                  courses
                    .sort((a, b) => b.studentsEnrolled - a.studentsEnrolled)
                    .slice(0, 4)
                    .map((course, i) => (
                      <div key={course.id} className={styles.bentoItem}>
                        <div
                          className={`${styles.rankIndicator} ${
                            i === 0
                              ? styles.rankGold
                              : i === 1
                              ? styles.rankSilver
                              : i === 2
                              ? styles.rankBronze
                              : styles.rankStandard
                          }`}
                        >
                          {i + 1 < 10 ? `0${i + 1}` : i + 1}
                        </div>

                        <div className={styles.bentoItemInfo}>
                          <span className={styles.bentoItemTitle}>{course.title}</span>
                          <span className={styles.bentoItemMeta}>
                            {course.studentsEnrolled} Active Learners
                          </span>
                        </div>

                        <div
                          className={styles.courseThumbAvatar}
                          style={{ background: getAvatarGradient(course.title) }}
                        >
                          {course.title.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Top Faculty Mentors Bento Card */}
            <div className={styles.bentoCard}>
              <div className={styles.bentoCardHeader}>
                <div className={styles.bentoHeaderLeft}>
                  <div className={styles.bentoIconBadgePurple}>
                    <Award size={17} />
                  </div>
                  <div>
                    <h3 className={styles.bentoTitle}>Faculty Mentors</h3>
                    <span className={styles.bentoSubtitle}>Verified instructors & mentors</span>
                  </div>
                </div>
                <Link href="/admin/trainers" className={styles.bentoViewAll}>
                  <span>View All</span>
                  <ArrowRight size={13} className={styles.bentoArrow} />
                </Link>
              </div>

              <div className={styles.bentoList}>
                {trainers.length === 0 ? (
                  <div className={styles.bentoEmpty}>No trainers registered.</div>
                ) : (
                  trainers
                    .map((t) => ({ ...t, studentsCount: ((t.name.charCodeAt(0) * 47) % 500) + 50 }))
                    .sort((a, b) => b.studentsCount - a.studentsCount)
                    .slice(0, 4)
                    .map((trainer, i) => (
                      <div key={trainer.id} className={styles.bentoItem}>
                        <div
                          className={`${styles.rankIndicator} ${
                            i === 0
                              ? styles.rankGold
                              : i === 1
                              ? styles.rankSilver
                              : i === 2
                              ? styles.rankBronze
                              : styles.rankStandard
                          }`}
                        >
                          {i + 1 < 10 ? `0${i + 1}` : i + 1}
                        </div>

                        <div className={styles.bentoItemInfo}>
                          <span className={styles.bentoItemTitle}>{trainer.name}</span>
                          <span className={styles.bentoItemMeta}>
                            {trainer.studentsCount.toLocaleString()} Students Mentored
                          </span>
                        </div>

                        <div
                          className={styles.trainerThumbAvatar}
                          style={{ background: getAvatarGradient(trainer.name) }}
                        >
                          {trainer.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </FadeInUp>
      </div>
    </PageTransition>
  );
}
