'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen, Award, Target, TrendingUp, Play, Clock,
  CheckCircle, Star, ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, StaggerContainer, StaggerItem, PageTransition } from '@/components/animations/MotionWrappers';
import { CourseWithArrays } from '@/lib/utils';
import { Student, QuizAttempt, Quiz, Certificate, Course } from '@/generated/prisma/client';
import styles from './dashboard.module.css';

type EnrolledCourse = CourseWithArrays & { progress: number; paymentStatus: string };
type QuizAttemptWithQuiz = QuizAttempt & { quiz: Quiz };
type CertificateWithCourse = Certificate & { course: Course };

export default function DashboardClient({
  student,
  enrolledCourses,
  quizAttempts,
  certificates,
  allCourses,
}: {
  student: Student | null;
  enrolledCourses: EnrolledCourse[];
  quizAttempts: QuizAttemptWithQuiz[];
  certificates: CertificateWithCourse[];
  allCourses: CourseWithArrays[];
}) {
  const completedCourses = enrolledCourses.filter((c) => c.progress === 100);
  const inProgressCourses = enrolledCourses.filter((c) => c.progress > 0 && c.progress < 100);
  const avgQuizScore = quizAttempts.length
    ? Math.round(quizAttempts.reduce((s, a) => s + a.percentage, 0) / quizAttempts.length)
    : 0;

  return (
    <>
      <Navbar />
      <PageTransition>
        <main className={styles.main}>
          {/* Header */}
          <section className={styles.hero}>
            <div className={styles.heroDot} />
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
              <FadeInUp>
                <div className={styles.heroContent}>
                  <div>
                    <span className={styles.heroTag}>Student Dashboard</span>
                    <h1 className={styles.heroTitle}>
                      Welcome back, <span style={{ color: 'var(--accent-primary)' }}>
                        {student?.name ?? 'Learner'}!
                      </span>
                    </h1>
                    <p className={styles.heroSub}>Continue your learning journey.</p>
                  </div>
                  <div className={styles.heroStats}>
                    {[
                      { value: enrolledCourses.length, label: 'Enrolled' },
                      { value: completedCourses.length, label: 'Completed' },
                      { value: certificates.length, label: 'Certificates' },
                    ].map((s, i) => (
                      <div key={i} className={styles.heroStat}>
                        <strong>{s.value}</strong>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInUp>
            </div>
          </section>

          <div className="container">
            {/* Stats Cards */}
            <FadeInUp delay={0.1}>
              <div className={styles.statsGrid}>
                {[
                  { icon: <BookOpen size={22} />, value: enrolledCourses.length, label: 'Courses Enrolled', color: '#6c5ce7', bg: 'rgba(108,92,231,0.1)' },
                  { icon: <CheckCircle size={22} />, value: completedCourses.length, label: 'Completed', color: '#00b894', bg: 'rgba(0,184,148,0.1)' },
                  { icon: <Target size={22} />, value: `${avgQuizScore}%`, label: 'Avg Quiz Score', color: '#fd79a8', bg: 'rgba(253,121,168,0.1)' },
                  { icon: <Award size={22} />, value: certificates.length, label: 'Certificates', color: '#fdcb6e', bg: 'rgba(253,203,110,0.1)' },
                ].map((s, i) => (
                  <motion.div key={i} className={styles.statCard} whileHover={{ y: -4 }}>
                    <div className={styles.statIcon} style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                    <div className={styles.statValue}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                    <div className={styles.statBar} style={{ background: s.color }} />
                  </motion.div>
                ))}
              </div>
            </FadeInUp>

            {/* Continue Learning */}
            {inProgressCourses.length > 0 && (
              <FadeInUp delay={0.2}>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2>Continue Learning</h2>
                    <Link href="/courses" className={styles.seeAll}>See all courses <ArrowRight size={14} /></Link>
                  </div>
                  <div className={styles.continueGrid}>
                    {inProgressCourses.map((course) => (
                      <motion.div key={course.id} className={styles.continueCard} whileHover={{ y: -3 }}>
                        <div className={styles.continueLogo}>{course.logo}</div>
                        <div className={styles.continueInfo}>
                          <div className={styles.continueTitle}>{course.title}</div>
                          <div className={styles.continueCategory}>{course.category}</div>
                          <div className={styles.continueProg}>
                            <div className={styles.progressBar}>
                              <motion.div
                                className={styles.progressFill}
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                              />
                            </div>
                            <span>{course.progress}%</span>
                          </div>
                        </div>
                        <Link
                          href={`/courses/${course.id}`}
                          className="btn btn-primary btn-sm"
                          style={{ flexShrink: 0 }}
                        >
                          <Play size={14} /> Resume
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </FadeInUp>
            )}

            {/* All Enrolled Courses */}
            {enrolledCourses.length > 0 && (
              <FadeInUp delay={0.25}>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2>My Courses</h2>
                  </div>
                  <StaggerContainer className={styles.coursesGrid}>
                    {enrolledCourses.map((course) => (
                      <StaggerItem key={course.id}>
                        <Link href={`/courses/${course.id}`} className={styles.courseCard}>
                          <div className={styles.courseCardLogo}>{course.logo}</div>
                          <div className={styles.courseCardInfo}>
                            <div className={styles.courseCardTitle}>{course.title}</div>
                            <div className={styles.courseCardMeta}>
                              <span className="badge badge-primary">{course.level}</span>
                              <span>{course.lessonsCount} lessons</span>
                            </div>
                            <div className={styles.continueProg}>
                              <div className={styles.progressBar}>
                                <motion.div
                                  className={styles.progressFill}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${course.progress}%` }}
                                  transition={{ duration: 1 }}
                                />
                              </div>
                              <span>{course.progress}%</span>
                            </div>
                          </div>
                          {course.progress === 100 && (
                            <CheckCircle size={20} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />
                          )}
                        </Link>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </FadeInUp>
            )}

            {/* Quiz History */}
            {quizAttempts.length > 0 && (
              <FadeInUp delay={0.3}>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2>Recent Quiz Scores</h2>
                  </div>
                  <div className={styles.tableCard}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Quiz</th>
                          <th>Score</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizAttempts.map((attempt) => (
                          <tr key={attempt.id}>
                            <td>{attempt.quiz.title}</td>
                            <td><strong>{Math.round(attempt.percentage)}%</strong></td>
                            <td>
                              <span className={`badge ${attempt.passed ? 'badge-success' : 'badge-danger'}`}>
                                {attempt.passed ? 'Passed' : 'Failed'}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>
                              {new Date(attempt.completedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </FadeInUp>
            )}

            {/* Certificates */}
            {certificates.length > 0 && (
              <FadeInUp delay={0.35}>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2>My Certificates</h2>
                  </div>
                  <div className={styles.certGrid}>
                    {certificates.map((cert) => (
                      <div key={cert.id} className={styles.certCard}>
                        <Award size={32} style={{ color: 'var(--accent-warning)' }} />
                        <div className={styles.certInfo}>
                          <div className={styles.certCourse}>{cert.course.title}</div>
                          <div className={styles.certId}>ID: {cert.certificateId}</div>
                          <div className={styles.certDate}>{new Date(cert.issuedAt).toLocaleDateString()}</div>
                        </div>
                        <Link href={`/certificate/${cert.certificateId}`} className="btn btn-secondary btn-sm">
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInUp>
            )}

            {/* Explore Courses */}
            {enrolledCourses.length === 0 && (
              <FadeInUp delay={0.3}>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2>Explore Courses</h2>
                    <Link href="/courses" className={styles.seeAll}>See all <ArrowRight size={14} /></Link>
                  </div>
                  <StaggerContainer className={styles.exploreGrid}>
                    {allCourses.map((course) => (
                      <StaggerItem key={course.id}>
                        <Link href={`/courses/${course.id}`} className={styles.exploreCard}>
                          <div className={styles.exploreLogo}>{course.logo}</div>
                          <div className={styles.exploreTitle}>{course.title}</div>
                          <div className={styles.exploreMeta}>
                            <Star size={12} fill="#eab308" stroke="#eab308" />
                            <span>{course.rating}</span>
                            <span>• {course.lessonsCount} lessons</span>
                          </div>
                          <div className={styles.explorePrice}>
                            {course.discountPrice
                              ? <><span className={styles.oldPrice}>₹{course.price}</span> <strong>₹{course.discountPrice}</strong></>
                              : <strong>₹{course.price}</strong>
                            }
                          </div>
                        </Link>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </FadeInUp>
            )}
          </div>
        </main>
      </PageTransition>
    </>
  );
}
