'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  Clock,
  BookOpen,
  CheckCircle,
  Play,
  ShieldCheck,
  X,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, ScrollReveal, PageTransition } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { Course, Trainer } from '@/generated/prisma/client';

export default function CourseDetailClient({ 
  course, 
  trainer 
}: { 
  course: Course, 
  trainer: Trainer | null 
}) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);

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
                        <span>{course.lessonsCount} lessons</span>
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
                      <button
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        onClick={() => setShowEnrollModal(true)}
                      >
                        Enroll Now
                      </button>
                      <div className={styles.enrollFeatures}>
                        <div><CheckCircle size={14} /> Lifetime Access</div>
                        <div><CheckCircle size={14} /> Certificate of Completion</div>
                        <div><CheckCircle size={14} /> Project-Based Learning</div>
                        <div><CheckCircle size={14} /> 24/7 Support</div>
                      </div>
                    </div>
                  </FadeInUp>
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className={styles.contentSection}>
            <div className="container">
              <div className={styles.contentGrid}>
                {/* Description */}
                <div className={styles.contentMain}>
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

                  {/* Syllabus */}
                  {course.syllabus.length > 0 && (
                    <ScrollReveal>
                      <div className={styles.contentBlock}>
                        <h2>Course Syllabus</h2>
                        <div className={styles.syllabusList}>
                          {course.syllabus.map((item: string, i: number) => (
                            <motion.div
                              key={i}
                              className={styles.syllabusItem}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.08 }}
                            >
                              <div className={styles.syllabusNumber}>
                                {String(i + 1).padStart(2, '0')}
                              </div>
                              <div className={styles.syllabusContent}>
                                <span>{item}</span>
                              </div>
                              <Play size={16} className={styles.syllabusPlay} />
                            </motion.div>
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
                          <div className={styles.trainerCardAvatar}>
                            {trainer.name.charAt(0)}
                          </div>
                          <div className={styles.trainerCardInfo}>
                            <h3>{trainer.name}</h3>
                            <span className={styles.trainerCardSpec}>
                              {trainer.specialization}
                            </span>
                            <p>{trainer.bio}</p>
                            <div className={styles.trainerCardStats}>
                              <div>
                                <strong>{trainer.experience}</strong>
                                <span>Experience</span>
                              </div>
                              <div>
                                <strong>{Math.floor(Math.random() * 500) + 50}</strong>
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
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowEnrollModal(false)}
                >
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
