'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Star, Clock, BookOpen, CheckCircle,
  Play, ShieldCheck, X, Lock, ChevronDown, ChevronRight,
  Users, Award, Target, Layout
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import JoinRequestButton from '@/components/ui/JoinRequestButton';
import { FadeInUp, ScrollReveal, PageTransition } from '@/components/animations/MotionWrappers';
import TechIllustration from '@/components/ui/TechIllustration';
import styles from './page.module.css';
import { CourseWithArrays } from '@/lib/utils';
import { Trainer, Module, Lesson } from '@/generated/prisma/client';

type ModuleWithLessons = Module & { lessons: Lesson[] };

export default function CourseDetailClient({
  course,
  trainer,
  modules = [],
  enrollmentStatus = 'NONE',
  activeEnrollmentCount = 0,
}: {
  course: CourseWithArrays;
  trainer: Trainer | null;
  modules?: ModuleWithLessons[];
  enrollmentStatus?: string;
  activeEnrollmentCount?: number;
}) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([modules[0]?.id ?? '']));
  const [directEnrollLoading, setDirectEnrollLoading] = useState(false);
  const [directEnrollDone, setDirectEnrollDone] = useState(false);
  const [directEnrollError, setDirectEnrollError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setDirectEnrollLoading(true);
    setDirectEnrollError('');
    try {
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setDirectEnrollError(orderData.error || 'Failed to create order');
        setDirectEnrollLoading(false);
        return;
      }

      // Use the key returned from the server since process.env is only for Node environment or NEXT_PUBLIC_ variables
      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'GM Training',
        description: `Enrollment for ${course.title}`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                courseId: course.id,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setDirectEnrollDone(true);
              router.refresh();
            } else {
              setDirectEnrollError(verifyData.error || 'Payment verification failed');
            }
          } catch (e) {
            setDirectEnrollError('Payment verification failed');
          }
        },
        theme: {
          color: '#6366f1'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setDirectEnrollError(response.error.description);
      });
      rzp.open();

    } catch (e) {
      setDirectEnrollError('An error occurred. Please try again.');
    } finally {
      setDirectEnrollLoading(false);
    }
  };

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
          {/* Hero Section */}
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
                {/* Left Content column */}
                <div className={styles.heroMain}>
                  <FadeInUp delay={0.1}>
                    <div className={styles.heroBadges}>
                      <span className="badge badge-primary" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary-light)', border: '1px solid rgba(99,102,241,0.3)' }}>{course.level}</span>
                      <span className="badge badge-success" style={{ background: 'rgba(45,212,191,0.15)', color: 'var(--accent-secondary)', border: '1px solid rgba(45,212,191,0.3)' }}>{course.category}</span>
                    </div>
                  </FadeInUp>
                  
                  <FadeInUp delay={0.15}>
                    <h1 className={styles.heroTitle}>{course.title}</h1>
                  </FadeInUp>

                  {/* Subtle Metadata near title */}
                  <FadeInUp delay={0.18}>
                    <div className={styles.premiumMetaRow}>
                      <span className={styles.premiumMetaItem}>
                        <Star size={13} fill="var(--accent-warning)" stroke="var(--accent-warning)" /> {course.rating} Rating
                      </span>
                      <span className={styles.premiumMetaDivider}>•</span>
                      <span className={styles.premiumMetaItem}>
                        👨‍🎓 {course.studentsEnrolled.toLocaleString()} Students
                      </span>
                    </div>
                  </FadeInUp>

                  {/* Tiny Premium Details Pills */}
                  <FadeInUp delay={0.19}>
                    <div className={styles.premiumDetailPills}>
                      <span className={styles.detailPill}>📅 Completion: ~4 Weeks</span>
                      <span className={styles.detailPill}>⏱ Last updated: July 2026</span>
                      <span className={styles.detailPill}>🌐 Language: English</span>
                      <span className={styles.detailPill}>💬 Subtitles: English [CC]</span>
                      <span className={styles.detailPill}>♾ Lifetime Updates</span>
                      <span className={styles.detailPill}>📁 Downloadable Resources</span>
                      <span className={styles.detailPill}>💻 Mobile & Desktop Support</span>
                    </div>
                  </FadeInUp>
                  
                  <FadeInUp delay={0.20}>
                    <p className={styles.heroDesc}>{course.shortDescription}</p>
                  </FadeInUp>

                  {/* Instructor Preview */}
                  {trainer && (
                    <FadeInUp delay={0.22}>
                      <div className={styles.heroTrainerPreview}>
                        <div className={styles.heroTrainerDot}>{trainer.name.charAt(0)}</div>
                        <div className={styles.heroTrainerInfo}>
                          <div className={styles.heroTrainerNameRow}>
                            <span className={styles.heroTrainerName}>{trainer.name}</span>
                            <span className={styles.verifiedBadge}>✓ Verified Instructor</span>
                          </div>
                          <div className={styles.heroTrainerStats}>
                            <span>{trainer.experience} Experience</span>
                            <span className={styles.bullet}>•</span>
                            <span>⭐ {trainer.rating} Trainer Rating</span>
                          </div>
                        </div>
                      </div>
                    </FadeInUp>
                  )}

                  {/* Trust Badges */}
                  <FadeInUp delay={0.25}>
                    <div className={styles.trustBadgesRow}>
                      <span className={styles.trustBadge}>✓ Lifetime Access</span>
                      <span className={styles.trustBadge}>🏆 Certificate Included</span>
                      <span className={styles.trustBadge}>🚀 {course.level} Friendly</span>
                      <span className={styles.trustBadge}>💬 Community Support</span>
                    </div>
                  </FadeInUp>
                </div>

                {/* Right Illustration column */}
                <FadeInUp delay={0.2} className={styles.heroIllustrationContainer}>
                  <div className={styles.hologramWrapper}>
                    <div className={styles.hologramCircleFrame} />
                    <div className={styles.hologramGlow} />
                    <TechIllustration title={course.title} category={course.category} size={340} />
                  </div>
                </FadeInUp>
              </div>

            </div>
          </section>
          
          <div className={styles.heroSeparator} />

          {/* Main Layout: Two Columns */}
          <section className="container">
            <div className={styles.layoutGrid}>
              
              {/* Left Column (Content) */}
              <div className={styles.contentMain}>
                
                {/* Progress Overview Grid */}
                {modules.length > 0 && (
                  <ScrollReveal>
                    <div className={styles.progressGrid}>
                      {[
                        { icon: <Layout size={22} />, value: modules.length, label: 'MODULES', color: 'var(--accent-primary)' },
                        { icon: <Play size={22} />, value: totalLessons, label: 'LESSONS', color: 'var(--accent-secondary)' },
                        { icon: <Clock size={22} />, value: course.duration, label: 'DURATION', color: 'var(--accent-tertiary)' },
                        { icon: <Award size={22} />, value: '1', label: 'CERTIFICATE', color: 'var(--accent-warning)' },
                      ].map((stat, i) => (
                        <motion.div key={i} className={styles.progressStat} whileHover={{ y: -5 }}>
                          <div className={styles.progressStatIcon} style={{ color: stat.color, background: `${stat.color}12` }}>
                            {stat.icon}
                          </div>
                          <div className={styles.progressStatContent}>
                            <div className={styles.progressStatValue}>{stat.value}</div>
                            <div className={styles.progressStatLabel}>{stat.label}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollReveal>
                )}

                {/* About Section */}
                <ScrollReveal>
                  <div className={`${styles.contentBlock} ${styles.aboutBlock}`}>
                    <h2><Target size={24} color="var(--accent-primary)" /> About This Course</h2>
                    <p>{course.description}</p>
                  </div>
                </ScrollReveal>

                {/* Skills Tags */}
                {course.tags.length > 0 && (
                  <ScrollReveal>
                    <div className={styles.contentBlock}>
                      <h2><ShieldCheck size={24} color="var(--accent-secondary)" /> Skills You&apos;ll Learn</h2>
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

                {/* Modules Section */}
                {modules.length > 0 && (
                  <ScrollReveal>
                    <div className={styles.contentBlock}>
                      <div className={styles.modulesSectionHeader}>
                        <h2><BookOpen size={24} color="var(--accent-primary)" /> Course Content</h2>
                        <span className={styles.modulesCount}>
                          {modules.length} sections • {totalLessons} lessons
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

                {/* Trainer Section */}
                {trainer && (
                  <ScrollReveal>
                    <div className={styles.contentBlock}>
                      <h2><Users size={24} color="var(--accent-primary)" /> Meet Your Instructor</h2>
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

              {/* Right Column (Sticky Enroll Card) */}
              <div className={styles.sidebarColumn}>
                <FadeInUp delay={0.3}>
                  <div className={styles.enrollCard}>
                    <div className={styles.premiumBadge}>
                      <span>BEST VALUE</span>
                    </div>
                    <div className={styles.enrollLogo}>
                      <TechIllustration title={course.title} category={course.category} size={80} />
                    </div>
                    <div className={styles.priceContainer}>
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
                    </div>
                    <div className={styles.ctaContainer}>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                        {enrollmentStatus === 'ENROLLED' || directEnrollDone ? (
                          firstLesson ? (
                            <Link
                              href={`/learn/${course.id}/lesson/${firstLesson.id}`}
                              className={`btn btn-primary btn-lg ${styles.startLearningBtn}`}
                              style={{ width: '100%', justifyContent: 'center' }}
                            >
                              <Play size={18} /> Start Learning <ArrowRight size={16} className={styles.btnArrow} />
                            </Link>
                          ) : (
                            <button className="btn btn-secondary btn-lg" disabled style={{ width: '100%', justifyContent: 'center', background: 'rgba(45, 212, 191, 0.2)', color: 'var(--accent-secondary)', border: '1px solid var(--accent-secondary)' }}>
                              <CheckCircle size={18} style={{ marginRight: '8px' }} /> Enrolled (No lessons yet)
                            </button>
                          )
                        ) : enrollmentStatus === 'PENDING' ? (
                          <button className="btn btn-secondary btn-lg" disabled>
                            ⏳ Pending Approval
                          </button>
                        ) : enrollmentStatus === 'REJECTED' ? (
                          <button className="btn btn-secondary btn-lg" disabled>
                            ✗ Request Rejected
                          </button>
                        ) : (
                          // ── Buy Now with Razorpay ──
                          <>
                            <button
                              className="btn btn-primary btn-lg"
                              style={{ width: '100%', justifyContent: 'center' }}
                              disabled={directEnrollLoading}
                              onClick={handlePayment}
                            >
                              {directEnrollLoading ? 'Processing...' : '🚀 Buy Now'}
                            </button>
                            {directEnrollError && (
                              <p style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '8px', textAlign: 'center' }}>
                                {directEnrollError}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className={styles.enrollDivider} />
                    <div className={styles.enrollFeatures}>
                      <div><CheckCircle size={16} /> {totalLessons} Lessons</div>
                      <div><CheckCircle size={16} /> Lifetime Access</div>
                      <div><CheckCircle size={16} /> Certificate of Completion</div>
                      <div><CheckCircle size={16} /> Coding Practice</div>
                      <div><CheckCircle size={16} /> Quizzes & Assessments</div>
                    </div>
                  </div>
                </FadeInUp>
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
