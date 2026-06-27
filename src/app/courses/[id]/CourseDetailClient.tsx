'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Star, Clock, BookOpen, CheckCircle,
  Play, ShieldCheck, X, Lock, ChevronDown, ChevronRight,
  Users, Award, Target,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, ScrollReveal, PageTransition } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { CourseWithArrays } from '@/lib/utils';
import { Trainer, Module, Lesson } from '@/generated/prisma/client';

type ModuleWithLessons = Module & { lessons: Lesson[] };

export default function CourseDetailClient({
  course,
  trainer,
  modules = [],
}: {
  course: CourseWithArrays;
  trainer: Trainer | null;
  modules?: ModuleWithLessons[];
}) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([modules[0]?.id ?? '']));

  const totalLessons = modules.reduce((t, m) => t + m.lessons.length, 0);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const firstLesson = modules[0]?.lessons[0];

  return (
    <>
      <Navbar />
      <PageTransition>
        <main className={styles.main}>
          {/* Hero */}
          <section className={styles.hero}>
            <div className={styles.heroBg} />
            <div className={`container ${styles.heroContent}`}>
              <FadeInUp>
                <Link href="/courses" className={styles.backLink}>
                  <ArrowLeft size={18} />
                  Back to Courses
                </Link>
              </FadeInUp>

              <div className={styles.heroGrid}>
                <div className={styles.heroLeft}>
                  <FadeInUp delay={0.1}>
                    <div className={styles.heroBadges}>
                      <span className="badge badge-primary">{course.level}</span>
                      <span className="badge badge-success">{course.category}</span>
                    </div>
                  </FadeInUp>
                  <FadeInUp delay={0.15}>
                    <h1 className={styles.heroTitle}>{course.title}</h1>
                  </FadeInUp>
                  <FadeInUp delay={0.2}>
                    <p className={styles.heroDesc}>{course.shortDescription}</p>
                  </FadeInUp>
                  <FadeInUp delay={0.25}>
                    <div className={styles.heroMeta}>
                      <div className={styles.metaItem}>
                        <Star size={16} fill="#fdcb6e" stroke="#fdcb6e" />
                        <strong>{course.rating}</strong>
                        <span>({course.studentsEnrolled.toLocaleString()} students)</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>{course.duration}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <BookOpen size={16} />
                        <span>{totalLessons} lessons</span>
                      </div>
                    </div>
                  </FadeInUp>
                  {trainer && (
                    <FadeInUp delay={0.3}>
                      <div className={styles.trainerInfo}>
                        <div className={styles.trainerAvatar}>{trainer.name.charAt(0)}</div>
                        <div>
                          <span className={styles.trainerLabel}>Instructor</span>
                          <span className={styles.trainerName}>{trainer.name}</span>
                        </div>
                      </div>
                    </FadeInUp>
                  )}
                </div>

                <div className={styles.heroRight}>
                  <FadeInUp delay={0.2}>
                    <div className={styles.enrollCard}>
                      <div className={styles.enrollLogo}>{course.logo}</div>
                      <div className={styles.enrollPrice}>
                        {course.discountPrice ? (
                          <>
                            <span className={styles.enrollOldPrice}>₹{course.price}</span>
                            <span className={styles.enrollCurrentPrice}>₹{course.discountPrice}</span>
                            <span className={styles.enrollDiscount}>
                              {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                            </span>
                          </>
                        ) : (
                          <span className={styles.enrollCurrentPrice}>₹{course.price}</span>
                        )}
                      </div>
                      {firstLesson && (
                        <Link
                          href={`/learn/${course.id}/lesson/${firstLesson.id}`}
                          className="btn btn-primary btn-lg"
                          style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }}
                        >
                          <Play size={18} /> Start Learning
                        </Link>
                      )}
                      <button
                        className="btn btn-secondary btn-lg"
                        style={{ width: '100%' }}
                        onClick={() => setShowEnrollModal(true)}
                      >
                        Enroll Now
                      </button>
                      <div className={styles.enrollFeatures}>
                        <div><CheckCircle size={14} /> {totalLessons} Lessons</div>
                        <div><CheckCircle size={14} /> Lifetime Access</div>
                        <div><CheckCircle size={14} /> Certificate of Completion</div>
                        <div><CheckCircle size={14} /> Coding Practice</div>
                        <div><CheckCircle size={14} /> Quizzes & Assessments</div>
                      </div>
                    </div>
                  </FadeInUp>
                </div>
              </div>
            </div>
          </section>

          {/* Progress Overview */}
          {modules.length > 0 && (
            <section className={styles.progressSection}>
              <div className="container">
                <ScrollReveal>
                  <div className={styles.progressGrid}>
                    {[
                      { icon: <BookOpen size={22} />, value: modules.length, label: 'Modules', color: 'var(--accent-primary)' },
                      { icon: <Play size={22} />, value: totalLessons, label: 'Total Lessons', color: 'var(--accent-secondary)' },
                      { icon: <Clock size={22} />, value: course.duration, label: 'Course Duration', color: 'var(--accent-tertiary)' },
                      { icon: <Award size={22} />, value: '1 Certificate', label: 'On Completion', color: 'var(--accent-warning)' },
                    ].map((stat, i) => (
                      <motion.div key={i} className={styles.progressStat} whileHover={{ y: -3 }}>
                        <div className={styles.progressStatIcon} style={{ color: stat.color, background: `${stat.color}18` }}>
                          {stat.icon}
                        </div>
                        <div>
                          <div className={styles.progressStatValue}>{stat.value}</div>
                          <div className={styles.progressStatLabel}>{stat.label}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollReveal>
              </div>
            </section>
          )}

          {/* Content */}
          <section className={styles.contentSection}>
            <div className="container">
              <div className={styles.contentGrid}>
                <div className={styles.contentMain}>
                  {/* About */}
                  <ScrollReveal>
                    <div className={styles.contentBlock}>
                      <h2>About This Course</h2>
                      <p>{course.description}</p>
                    </div>
                  </ScrollReveal>

                  {/* Tags */}
                  {course.tags.length > 0 && (
                    <ScrollReveal>
                      <div className={styles.contentBlock}>
                        <h2>Skills You&apos;ll Learn</h2>
                        <div className={styles.tagsList}>
                          {course.tags.map((tag: string) => (
                            <span key={tag} className={styles.tag}>
                              <CheckCircle size={14} /> {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )}

                  {/* Course Content / Modules */}
                  {modules.length > 0 && (
                    <ScrollReveal>
                      <div className={styles.contentBlock}>
                        <div className={styles.modulesSectionHeader}>
                          <h2>Course Content</h2>
                          <span className={styles.modulesCount}>
                            {modules.length} sections • {totalLessons} lessons • {course.duration}
                          </span>
                        </div>

                        <div className={styles.modulesList}>
                          {modules.map((mod, mIdx) => (
                            <div key={mod.id} className={styles.moduleItem}>
                              <button
                                className={styles.moduleHeader}
                                onClick={() => toggleModule(mod.id)}
                              >
                                <div className={styles.moduleHeaderLeft}>
                                  {expandedModules.has(mod.id)
                                    ? <ChevronDown size={18} />
                                    : <ChevronRight size={18} />
                                  }
                                  <span className={styles.moduleNum}>Section {mIdx + 1}</span>
                                  <span className={styles.moduleTitle}>{mod.title}</span>
                                </div>
                                <span className={styles.moduleCount}>{mod.lessons.length} lessons</span>
                              </button>

                              <AnimatePresence>
                                {expandedModules.has(mod.id) && (
                                  <motion.div
                                    className={styles.lessonsContainer}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {mod.lessons.map((lesson) => (
                                      <Link
                                        key={lesson.id}
                                        href={`/learn/${course.id}/lesson/${lesson.id}`}
                                        className={styles.lessonRow}
                                      >
                                        <Play size={14} className={styles.lessonPlay} />
                                        <span className={styles.lessonTitle}>{lesson.title}</span>
                                        <div className={styles.lessonMeta}>
                                          {lesson.duration && <span className={styles.lessonDuration}>{lesson.duration}</span>}
                                          {lesson.isFree
                                            ? <span className={styles.freeBadge}>Free</span>
                                            : <Lock size={12} className={styles.lockIcon} />
                                          }
                                        </div>
                                      </Link>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )}

                  {/* Trainer Details */}
                  {trainer && (
                    <ScrollReveal>
                      <div className={styles.contentBlock}>
                        <h2>Meet Your Instructor</h2>
                        <div className={styles.trainerCard}>
                          <div className={styles.trainerCardAvatar}>{trainer.name.charAt(0)}</div>
                          <div className={styles.trainerCardInfo}>
                            <h3>{trainer.name}</h3>
                            <span className={styles.trainerCardSpec}>{trainer.specialization}</span>
                            <p>{trainer.bio}</p>
                            <div className={styles.trainerCardStats}>
                              <div>
                                <strong>{trainer.experience}</strong>
                                <span>Experience</span>
                              </div>
                              <div>
                                <strong>{course.studentsEnrolled}</strong>
                                <span>Students</span>
                              </div>
                              <div>
                                <strong>{trainer.rating}</strong>
                                <span>Rating</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </PageTransition>

      <AnimatePresence>
        {showEnrollModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEnrollModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setShowEnrollModal(false)}>
                <X size={20} />
              </button>
              <div className={styles.successModal}>
                <motion.div
                  className={styles.successIcon}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                >
                  <ShieldCheck size={36} />
                </motion.div>
                <h3>Payment Integration Coming Soon!</h3>
                <p>
                  Razorpay payment gateway will be integrated soon. Once payment is completed,
                  this course will be unlocked for your account.
                </p>
                <div className={styles.successPrice}>
                  <span>Amount: </span>
                  <strong>₹{course.discountPrice || course.price}</strong>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => setShowEnrollModal(false)}>
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
