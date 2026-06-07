'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, GraduationCap, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem, PageTransition } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { Course, Trainer, Student, Enrollment } from '@/generated/prisma/client';

export default function AdminDashboardClient({
  courses,
  trainers,
  students,
  enrollments,
}: {
  courses: Course[];
  trainers: Trainer[];
  students: Student[];
  enrollments: Enrollment[];
}) {
  const totalRevenue = enrollments
    .filter((e) => e.paymentStatus === 'completed')
    .reduce((sum, e) => {
      const course = courses.find((c) => c.id === e.courseId);
      return sum + (course?.discountPrice || course?.price || 0);
    }, 0);

  const stats = [
    {
      label: 'Total Courses',
      value: courses.length,
      change: '+12%',
      positive: true,
      icon: <BookOpen size={24} />,
      color: '#6c5ce7',
      bg: 'rgba(108, 92, 231, 0.12)',
    },
    {
      label: 'Total Trainers',
      value: trainers.length,
      change: '+5%',
      positive: true,
      icon: <Users size={24} />,
      color: '#00cec9',
      bg: 'rgba(0, 206, 201, 0.12)',
    },
    {
      label: 'Total Students',
      value: students.length,
      change: '+18%',
      positive: true,
      icon: <GraduationCap size={24} />,
      color: '#fd79a8',
      bg: 'rgba(253, 121, 168, 0.12)',
    },
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      change: '+24%',
      positive: true,
      icon: <DollarSign size={24} />,
      color: '#00b894',
      bg: 'rgba(0, 184, 148, 0.12)',
    },
  ];

  return (
    <PageTransition>
      <div className={styles.dashboard}>
        <FadeInUp>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Dashboard</h1>
              <p className={styles.subtitle}>Welcome back! Here&apos;s your overview.</p>
            </div>
            <div className={styles.headerBadge}>
              <Activity size={16} />
              <span>Live</span>
            </div>
          </div>
        </FadeInUp>

        <StaggerContainer className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <StaggerItem key={i}>
              <motion.div
                className={styles.statCard}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className={styles.statTop}>
                  <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className={`${styles.statChange} ${stat.positive ? styles.positive : styles.negative}`}>
                    {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.change}
                  </div>
                </div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statBar} style={{ background: stat.color }} />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeInUp delay={0.3}>
          <div className={styles.sectionHeader}>
            <h2>Recent Enrollments</h2>
          </div>
          <div className={styles.tableCard}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => {
                    const student = students.find((s) => s.id === enrollment.studentId);
                    const course = courses.find((c) => c.id === enrollment.courseId);
                    return (
                      <tr key={enrollment.id}>
                        <td>
                          <div className={styles.cellUser}>
                            <div className={styles.cellAvatar}>{student?.name.charAt(0) || '?'}</div>
                            <div>
                              <div className={styles.cellName}>{student?.name}</div>
                              <div className={styles.cellEmail}>{student?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{course?.title}</td>
                        <td>
                          <span className={`badge ${enrollment.paymentStatus === 'completed' ? 'badge-success' : enrollment.paymentStatus === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                            {enrollment.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <div className={styles.progressCell}>
                            <div className={styles.progressBar}>
                              <motion.div
                                className={styles.progressFill}
                                initial={{ width: 0 }}
                                animate={{ width: `${enrollment.progress}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                            <span>{enrollment.progress}%</span>
                          </div>
                        </td>
                        <td className={styles.cellDate}>{new Date(enrollment.enrolledAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                  {enrollments.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No enrollments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.4}>
          <div className={styles.quickGrid}>
            <div className={styles.quickCard}>
              <h3>Top Courses</h3>
              <div className={styles.quickList}>
                {courses.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No courses found.</p>}
                {courses
                  .sort((a, b) => b.studentsEnrolled - a.studentsEnrolled)
                  .slice(0, 4)
                  .map((course, i) => (
                    <div key={course.id} className={styles.quickItem}>
                      <div className={styles.quickRank}>#{i + 1}</div>
                      <div className={styles.quickInfo}>
                        <span className={styles.quickTitle}>{course.title}</span>
                        <span className={styles.quickMeta}>{course.studentsEnrolled} students</span>
                      </div>
                      <div className={styles.quickLogo}>{course.logo}</div>
                    </div>
                  ))}
              </div>
            </div>

            <div className={styles.quickCard}>
              <h3>Top Trainers</h3>
              <div className={styles.quickList}>
                {trainers.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No trainers found.</p>}
                {trainers
                  // We map to add a mock "studentsCount" for now to mimic the top trainers view
                  .map(t => ({ ...t, studentsCount: (t.name.charCodeAt(0) * 47) % 500 + 50 }))
                  .sort((a, b) => b.studentsCount - a.studentsCount)
                  .slice(0, 4)
                  .map((trainer, i) => (
                    <div key={trainer.id} className={styles.quickItem}>
                      <div className={styles.quickRank}>#{i + 1}</div>
                      <div className={styles.quickInfo}>
                        <span className={styles.quickTitle}>{trainer.name}</span>
                        <span className={styles.quickMeta}>{trainer.studentsCount.toLocaleString()} students</span>
                      </div>
                      <div className={styles.quickAvatar}>{trainer.name.charAt(0)}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </FadeInUp>
      </div>
    </PageTransition>
  );
}
