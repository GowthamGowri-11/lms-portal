'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Clock,
  BookOpen,
  CheckCircle,
  Play,
  ShieldCheck,
  X,
  Lock,
  ChevronDown,
  ChevronRight,
  Users,
  Award,
  Target,
  Layout,
  Code2,
  Cpu,
  Zap,
  HelpCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Terminal,
  Check,
  Globe,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import JoinRequestButton from '@/components/ui/JoinRequestButton';
import { FadeInUp, ScrollReveal, PageTransition } from '@/components/animations/MotionWrappers';
import CourseBanner from '@/components/ui/CourseBanner';
import Footer from '@/components/ui/Footer';
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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [directEnrollLoading, setDirectEnrollLoading] = useState(false);
  const [directEnrollDone, setDirectEnrollDone] = useState(false);
  const [directEnrollError, setDirectEnrollError] = useState('');

  const totalLessons = modules.reduce((t, m) => t + m.lessons.length, 0);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const firstLesson = modules[0]?.lessons[0];

  const learningOutcomes = [
    {
      title: 'Architect Production-Grade Applications',
      desc: 'Design modular, scalable architectures adhering to modern enterprise design patterns and industry best practices.',
      icon: <Cpu size={20} />,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      title: 'Real-World Clean Code & Best Practices',
      desc: 'Write clean, maintainable, and type-safe code with automated unit testing and rigorous linting standards.',
      icon: <Code2 size={20} />,
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
    {
      title: 'Database Schema Modeling & Optimization',
      desc: 'Master relational data modeling, query optimization, indexing, and high-performance database transactions.',
      icon: <Terminal size={20} />,
      color: '#059669',
      bg: '#ecfdf5',
    },
    {
      title: 'End-to-End Authentication & Security',
      desc: 'Implement battle-tested authentication, role-based access control (RBAC), token security, and secure API gateways.',
      icon: <ShieldCheck size={20} />,
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      title: 'Cloud CI/CD & Production Deployment',
      desc: 'Containerize applications with Docker, automate deployment pipelines, and configure production cloud environments.',
      icon: <Globe size={20} />,
      color: '#0284c7',
      bg: '#f0f9ff',
    },
    {
      title: 'Real-World Capstone Portfolio Projects',
      desc: 'Build and deploy fully functional, resume-ready portfolio capstones that showcase your engineering mastery to recruiters.',
      icon: <Briefcase size={20} />,
      color: '#dc2626',
      bg: '#fef2f2',
    },
  ];

  const faqs = [
    {
      q: 'Do I get lifetime access to all course materials and future updates?',
      a: 'Yes! Once enrolled, you receive unlimited lifetime access to all lessons, interactive coding sandboxes, milestone capstones, and all future curriculum updates at no extra charge.',
    },
    {
      q: 'How does the certificate verification work?',
      a: 'Upon completing all lessons and capstone assessments, you will be issued an official ATLYX Certificate of Completion. It features a unique, cryptographically verifiable URL that can be directly embedded into your LinkedIn profile and resume.',
    },
    {
      q: 'Can I get direct help from the instructor if I get stuck?',
      a: 'Absolutely. All enrolled students receive access to direct 1-on-1 faculty discussion channels, code review sessions, and dedicated mentor office hours to help resolve technical roadblocks.',
    },
    {
      q: 'Is this course suitable for beginners and self-paced learners?',
      a: 'Yes. The curriculum is structured to take you from core fundamentals to advanced architectural mastery step-by-step. You can learn entirely at your own pace from any device.',
    },
  ];

  return (
    <>
      <Navbar />
      <PageTransition>
        <main className={styles.main}>
          {/* ── HERO SECTION ── */}
          <section className={styles.hero}>
            <div className={styles.heroBg} />
            <div className={`container ${styles.heroContent}`}>
              <FadeInUp>
                <div className={styles.breadcrumbRow}>
                  <Link href="/courses" className={styles.backLink}>
                    <ArrowLeft size={16} />
                    Courses
                  </Link>
                  <span className={styles.breadcrumbSep}>/</span>
                  <span className={styles.breadcrumbCat}>{course.category}</span>
                  <span className={styles.breadcrumbSep}>/</span>
                  <span className={styles.breadcrumbTitle}>{course.title}</span>
                </div>
              </FadeInUp>

              <div className={styles.heroGrid}>
                {/* Left Content column */}
                <div className={styles.heroMain}>
                  <FadeInUp delay={0.08}>
                    <div className={styles.heroBadges}>
                      <span className={styles.badgeLevel}>
                        <GraduationCap size={13} />
                        {course.level}
                      </span>
                      <span className={styles.badgeCategory}>{course.category}</span>
                      <span className={styles.badgeUpdated}>
                        <Sparkles size={12} className={styles.sparkleIcon} />
                        Updated 2026
                      </span>
                    </div>
                  </FadeInUp>

                  <FadeInUp delay={0.12}>
                    <h1 className={styles.heroTitle}>{course.title}</h1>
                  </FadeInUp>

                  {/* Rating & Students metadata */}
                  <FadeInUp delay={0.16}>
                    <div className={styles.premiumMetaRow}>
                      <span className={styles.premiumMetaItem}>
                        <Star size={14} className={styles.starIcon} />
                        <strong>{course.rating || '4.9'}</strong> Rating
                      </span>
                      <span className={styles.premiumMetaDivider}>•</span>
                      <span className={styles.premiumMetaItem}>
                        <Users size={14} className={styles.metaIcon} />
                        <strong>{(course.studentsEnrolled || 580).toLocaleString()}</strong> Students Enrolled
                      </span>
                      <span className={styles.premiumMetaDivider}>•</span>
                      <span className={styles.premiumMetaItem}>
                        <Award size={14} className={styles.certIcon} />
                        Accredited Certificate
                      </span>
                    </div>
                  </FadeInUp>

                  <FadeInUp delay={0.20}>
                    <p className={styles.heroDesc}>
                      {course.shortDescription ||
                        'Master production-grade engineering principles, hands-on capstone projects, and modern cloud architectures with direct industry mentorship.'}
                    </p>
                  </FadeInUp>

                  {/* Instructor Preview */}
                  {trainer && (
                    <FadeInUp delay={0.22}>
                      <div className={styles.heroTrainerPreview}>
                        <div className={styles.heroTrainerDot}>{trainer.name.charAt(0)}</div>
                        <div className={styles.heroTrainerInfo}>
                          <div className={styles.heroTrainerNameRow}>
                            <span className={styles.heroTrainerName}>{trainer.name}</span>
                            <span className={styles.verifiedBadge}>
                              <Check size={11} /> Verified Faculty
                            </span>
                          </div>
                          <div className={styles.heroTrainerStats}>
                            <span>{trainer.experience || '8+ Years'} Experience</span>
                            <span className={styles.bullet}>•</span>
                            <span>⭐ {trainer.rating || '4.9'} Faculty Rating</span>
                            <span className={styles.bullet}>•</span>
                            <span>{trainer.specialization || 'Lead Architect'}</span>
                          </div>
                        </div>
                      </div>
                    </FadeInUp>
                  )}

                  {/* Trust / Feature Badges Strip */}
                  <FadeInUp delay={0.25}>
                    <div className={styles.trustBadgesRow}>
                      <span className={styles.trustBadge}>
                        <Clock size={14} className={styles.trustIcon} /> {course.duration || '40 Hours'} Self-Paced
                      </span>
                      <span className={styles.trustBadge}>
                        <ShieldCheck size={14} className={styles.trustIcon} /> Lifetime Access
                      </span>
                      <span className={styles.trustBadge}>
                        <Award size={14} className={styles.trustIcon} /> Verifiable Credential
                      </span>
                      <span className={styles.trustBadge}>
                        <Zap size={14} className={styles.trustIcon} /> Interactive Code Labs
                      </span>
                    </div>
                  </FadeInUp>
                </div>

                {/* Right Visual Graphic column */}
                <FadeInUp delay={0.2} className={styles.heroIllustrationContainer}>
                  <div className={styles.heroBannerCard}>
                    <CourseBanner
                      category={course.category}
                      title={course.title}
                      level={course.level}
                      rating={course.rating}
                      learnerCount={course.studentsEnrolled}
                      logo={course.logo}
                      className={styles.heroCourseBanner}
                    />
                    <div className={styles.heroBannerOverlayFooter}>
                      <div className={styles.overlayItem}>
                        <CheckCircle size={14} className={styles.checkGreen} />
                        <span>Interactive Sandbox Ready</span>
                      </div>
                      <div className={styles.overlayItem}>
                        <ShieldCheck size={14} className={styles.checkBlue} />
                        <span>Accredited Curriculum</span>
                      </div>
                    </div>
                  </div>
                </FadeInUp>
              </div>
            </div>
          </section>

          <div className={styles.heroSeparator} />

          {/* ── MAIN LAYOUT: TWO COLUMNS ── */}
          <section className="container">
            <div className={styles.layoutGrid}>
              {/* Left Column (Main Content) */}
              <div className={styles.contentMain}>
                {/* 1. Progress & Stats Overview Strip */}
                <ScrollReveal>
                  <div className={styles.progressGrid}>
                    {[
                      {
                        icon: <Layout size={22} />,
                        value: modules.length > 0 ? modules.length : '12',
                        label: 'STRUCTURED MODULES',
                        color: '#2563eb',
                        bg: '#eff6ff',
                      },
                      {
                        icon: <Play size={22} />,
                        value: totalLessons > 0 ? totalLessons : '48',
                        label: 'LESSONS & LABS',
                        color: '#7c3aed',
                        bg: '#f5f3ff',
                      },
                      {
                        icon: <Clock size={22} />,
                        value: course.duration || '40h',
                        label: 'TOTAL DURATION',
                        color: '#059669',
                        bg: '#ecfdf5',
                      },
                      {
                        icon: <Award size={22} />,
                        value: '1',
                        label: 'CAREER CERTIFICATE',
                        color: '#d97706',
                        bg: '#fffbeb',
                      },
                    ].map((stat, i) => (
                      <motion.div key={i} className={styles.progressStat} whileHover={{ y: -4 }}>
                        <div className={styles.progressStatIcon} style={{ color: stat.color, background: stat.bg }}>
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

                {/* 2. "What You Will Master" Learning Outcomes Grid */}
                <ScrollReveal>
                  <div className={styles.outcomesBlock}>
                    <div className={styles.blockHeader}>
                      <div className={styles.blockHeaderTag}>
                        <Target size={14} />
                        <span>Core Competencies</span>
                      </div>
                      <h2 className={styles.blockTitle}>What You Will Master</h2>
                      <p className={styles.blockSubtitle}>
                        Transformative, production-proven engineering capabilities you will acquire through this curriculum.
                      </p>
                    </div>

                    <div className={styles.outcomesGrid}>
                      {learningOutcomes.map((item, idx) => (
                        <div key={idx} className={styles.outcomeCard}>
                          <div className={styles.outcomeHeader}>
                            <div
                              className={styles.outcomeIconBox}
                              style={{ color: item.color, background: item.bg }}
                            >
                              {item.icon}
                            </div>
                            <span className={styles.outcomeCheck}>
                              <CheckCircle size={16} style={{ color: item.color }} />
                            </span>
                          </div>
                          <h3 className={styles.outcomeTitle}>{item.title}</h3>
                          <p className={styles.outcomeDesc}>{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>

                {/* 3. About This Course Narrative */}
                <ScrollReveal>
                  <div className={`${styles.contentBlock} ${styles.aboutBlock}`}>
                    <div className={styles.blockHeader}>
                      <div className={styles.blockHeaderTag}>
                        <BookOpen size={14} />
                        <span>Curriculum Overview</span>
                      </div>
                      <h2 className={styles.blockTitle}>About This Course</h2>
                    </div>
                    <p className={styles.aboutParagraph}>
                      {course.description ||
                        'This course is meticulously designed to provide an end-to-end deep dive into modern software engineering, scalable cloud systems, and architectural patterns. Combining rigorous conceptual fundamentals with hands-on coding labs, you will build production-grade projects ready for real-world deployment.'}
                    </p>

                    {/* Key Course Takeaways */}
                    <div className={styles.takeawaysList}>
                      <div className={styles.takeawayItem}>
                        <CheckCircle size={16} className={styles.checkBlue} />
                        <span>Industry-aligned syllabus updated for 2026 engineering standards</span>
                      </div>
                      <div className={styles.takeawayItem}>
                        <CheckCircle size={16} className={styles.checkBlue} />
                        <span>Interactive coding environments with automated instant test feedback</span>
                      </div>
                      <div className={styles.takeawayItem}>
                        <CheckCircle size={16} className={styles.checkBlue} />
                        <span>Direct 1-on-1 code reviews and architectural mentorship</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* 4. Skills & Technologies Tags */}
                {course.tags.length > 0 && (
                  <ScrollReveal>
                    <div className={styles.contentBlock}>
                      <div className={styles.blockHeader}>
                        <div className={styles.blockHeaderTag}>
                          <Code2 size={14} />
                          <span>Stack & Tools</span>
                        </div>
                        <h2 className={styles.blockTitle}>Skills You&apos;ll Acquire</h2>
                      </div>
                      <div className={styles.tagsList}>
                        {course.tags.map((tag: string) => (
                          <span key={tag} className={styles.tag}>
                            <CheckCircle size={14} className={styles.tagCheck} /> {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>
                )}

                {/* 5. Production Capstone Showcase Card */}
                <ScrollReveal>
                  <div className={styles.capstoneCard}>
                    <div className={styles.capstoneGlow} />
                    <div className={styles.capstoneHeader}>
                      <div className={styles.capstoneBadge}>
                        <Briefcase size={14} />
                        <span>Hands-On Capstone Project</span>
                      </div>
                      <span className={styles.capstoneVerifiedPill}>Recruiter Ready</span>
                    </div>
                    <h3 className={styles.capstoneTitle}>
                      Build & Deploy: Production Full-Stack Platform
                    </h3>
                    <p className={styles.capstoneDesc}>
                      Throughout this course, you won&apos;t just follow along with simple code snippets. You will architect, build, and deploy an end-to-end production application complete with authentication, optimized database schemas, automated testing, and CI/CD pipelines.
                    </p>
                    <div className={styles.capstonePillars}>
                      <div className={styles.capstonePillarItem}>
                        <span className={styles.pillarBullet}>01</span>
                        <span>Modular Architecture Design</span>
                      </div>
                      <div className={styles.capstonePillarItem}>
                        <span className={styles.pillarBullet}>02</span>
                        <span>Automated CI/CD Pipeline</span>
                      </div>
                      <div className={styles.capstonePillarItem}>
                        <span className={styles.pillarBullet}>03</span>
                        <span>Live Cloud Deployment</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* 6. Modules / Course Content Accordion */}
                {modules.length > 0 && (
                  <ScrollReveal>
                    <div className={styles.contentBlock}>
                      <div className={styles.modulesSectionHeader}>
                        <div>
                          <div className={styles.blockHeaderTag}>
                            <BookOpen size={14} />
                            <span>Step-by-Step Curriculum</span>
                          </div>
                          <h2 className={styles.blockTitle}>Course Content</h2>
                        </div>
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
                                <div className={styles.moduleToggleIcon}>
                                  {expandedModules.has(mod.id) ? (
                                    <ChevronDown size={18} />
                                  ) : (
                                    <ChevronRight size={18} />
                                  )}
                                </div>
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
                                      <div className={styles.lessonRowLeft}>
                                        <div className={styles.playIconBox}>
                                          <Play size={12} className={styles.lessonPlay} />
                                        </div>
                                        <span className={styles.lessonTitle}>{lesson.title}</span>
                                      </div>
                                      <div className={styles.lessonMeta}>
                                        {lesson.duration && (
                                          <span className={styles.lessonDuration}>
                                            <Clock size={12} /> {lesson.duration}
                                          </span>
                                        )}
                                        {lesson.isFree ? (
                                          <span className={styles.freeBadge}>Free Preview</span>
                                        ) : (
                                          <Lock size={12} className={styles.lockIcon} />
                                        )}
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

                {/* 7. Who This Course Is For & Prerequisites */}
                <ScrollReveal>
                  <div className={styles.audienceGrid}>
                    {/* Who It's For */}
                    <div className={styles.audienceCard}>
                      <div className={styles.audienceIconBox} style={{ color: '#2563eb', background: '#eff6ff' }}>
                        <Target size={20} />
                      </div>
                      <h3 className={styles.audienceTitle}>Who This Course Is For</h3>
                      <ul className={styles.audienceList}>
                        <li>
                          <Check size={14} className={styles.checkBlue} />
                          <span>Aspiring engineers aiming to master production-grade software development</span>
                        </li>
                        <li>
                          <Check size={14} className={styles.checkBlue} />
                          <span>Frontend or Backend developers looking to transition into full-stack architecture</span>
                        </li>
                        <li>
                          <Check size={14} className={styles.checkBlue} />
                          <span>Students building verified capstone portfolios for high-impact tech interviews</span>
                        </li>
                      </ul>
                    </div>

                    {/* Prerequisites */}
                    <div className={styles.audienceCard}>
                      <div className={styles.audienceIconBox} style={{ color: '#059669', background: '#ecfdf5' }}>
                        <GraduationCap size={20} />
                      </div>
                      <h3 className={styles.audienceTitle}>Requirements & Prerequisites</h3>
                      <ul className={styles.audienceList}>
                        <li>
                          <Check size={14} className={styles.checkGreen} />
                          <span>Basic programming familiarity (variables, functions, basic logic)</span>
                        </li>
                        <li>
                          <Check size={14} className={styles.checkGreen} />
                          <span>A modern browser (Chrome, Edge, Firefox) — all IDE environments run in cloud</span>
                        </li>
                        <li>
                          <Check size={14} className={styles.checkGreen} />
                          <span>No advanced cloud or distributed systems experience required</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </ScrollReveal>

                {/* 8. Career Certification Preview */}
                <ScrollReveal>
                  <div className={styles.certificateBanner}>
                    <div className={styles.certBannerLeft}>
                      <div className={styles.certBadgePill}>
                        <Award size={14} />
                        <span>Accredited Credential</span>
                      </div>
                      <h3 className={styles.certTitle}>Official ATLYX Certificate of Completion</h3>
                      <p className={styles.certDesc}>
                        Showcase your verified engineering expertise to top global employers. Every certificate includes a tamper-proof verification ID and direct one-click LinkedIn integration.
                      </p>
                      <div className={styles.certFeatures}>
                        <div className={styles.certFeatureItem}>
                          <CheckCircle size={14} className={styles.checkGold} />
                          <span>Verifiable Credential Hash</span>
                        </div>
                        <div className={styles.certFeatureItem}>
                          <CheckCircle size={14} className={styles.checkGold} />
                          <span>LinkedIn One-Click Share</span>
                        </div>
                        <div className={styles.certFeatureItem}>
                          <CheckCircle size={14} className={styles.checkGold} />
                          <span>Recruiter Recognized</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.certPreviewBox}>
                      <div className={styles.certMockup}>
                        <div className={styles.certMockupTop}>
                          <Award size={28} className={styles.certRibbon} />
                          <span className={styles.certSeal}>ATLYX VERIFIED</span>
                        </div>
                        <span className={styles.certMockupName}>{course.title}</span>
                        <span className={styles.certMockupSub}>Certificate of Academic Excellence</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* 9. Trainer Section */}
                {trainer && (
                  <ScrollReveal>
                    <div className={styles.contentBlock}>
                      <div className={styles.blockHeader}>
                        <div className={styles.blockHeaderTag}>
                          <Users size={14} />
                          <span>Faculty & Mentorship</span>
                        </div>
                        <h2 className={styles.blockTitle}>Meet Your Instructor</h2>
                      </div>

                      <div className={styles.trainerCard}>
                        <div className={styles.trainerCardAvatar}>{trainer.name.charAt(0)}</div>
                        <div className={styles.trainerCardInfo}>
                          <div className={styles.trainerNameRow}>
                            <h3>{trainer.name}</h3>
                            <span className={styles.verifiedBadge}>
                              <Check size={11} /> Verified Lead Faculty
                            </span>
                          </div>
                          <span className={styles.trainerCardSpec}>{trainer.specialization || 'Principal Software Architect'}</span>
                          <p className={styles.trainerBio}>
                            {trainer.bio ||
                              'Seasoned engineer with over 10+ years of battle-tested industry experience building high-performance applications, mentoring hundreds of students, and designing scalable system architectures.'}
                          </p>
                          <div className={styles.trainerCardStats}>
                            <div>
                              <strong>{trainer.experience || '8+ Years'}</strong>
                              <span>Experience</span>
                            </div>
                            <div>
                              <strong>{(course.studentsEnrolled || 580).toLocaleString()}</strong>
                              <span>Students Mentored</span>
                            </div>
                            <div>
                              <strong>{trainer.rating || '4.9'} ⭐</strong>
                              <span>Faculty Score</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                )}

                {/* 10. Frequently Asked Questions (FAQ) */}
                <ScrollReveal>
                  <div className={styles.contentBlock}>
                    <div className={styles.blockHeader}>
                      <div className={styles.blockHeaderTag}>
                        <HelpCircle size={14} />
                        <span>Common Inquiries</span>
                      </div>
                      <h2 className={styles.blockTitle}>Frequently Asked Questions</h2>
                    </div>

                    <div className={styles.faqList}>
                      {faqs.map((faq, fIdx) => (
                        <div key={fIdx} className={styles.faqItem}>
                          <button
                            className={styles.faqQuestion}
                            onClick={() => toggleFaq(fIdx)}
                          >
                            <span>{faq.q}</span>
                            <div className={styles.faqIcon}>
                              {expandedFaq === fIdx ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                          </button>
                          <AnimatePresence>
                            {expandedFaq === fIdx && (
                              <motion.div
                                className={styles.faqAnswer}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <p>{faq.a}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* ── RIGHT COLUMN: STICKY ENROLL CARD ── */}
              <div className={styles.sidebarColumn}>
                <FadeInUp delay={0.25}>
                  <div className={styles.enrollCard}>
                    <div className={styles.premiumBadge}>
                      <Sparkles size={11} className={styles.sparkleIcon} />
                      <span>BEST VALUE</span>
                    </div>

                    {/* Course Banner Artwork Header */}
                    <div className={styles.enrollBannerWrap}>
                      <CourseBanner
                        category={course.category}
                        title={course.title}
                        level={course.level}
                        rating={course.rating}
                        learnerCount={course.studentsEnrolled}
                        logo={course.logo}
                        className={styles.sidebarCourseBanner}
                      />
                    </div>

                    {/* Pricing */}
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
                      {course.discountPrice && (
                        <span className={styles.priceSavingsNote}>
                          Save ₹{course.price - course.discountPrice} today with limited-time discount
                        </span>
                      )}
                    </div>

                    {/* CTA Actions */}
                    <div className={styles.ctaContainer}>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                        {enrollmentStatus === 'ENROLLED' || directEnrollDone ? (
                          firstLesson ? (
                            <Link
                              href={`/learn/${course.id}/lesson/${firstLesson.id}`}
                              className={styles.startLearningBtn}
                              style={{ width: '100%', justifyContent: 'center' }}
                            >
                              <Play size={18} />
                              <span>Start Learning Now</span>
                              <ArrowRight size={16} className={styles.btnArrow} />
                            </Link>
                          ) : (
                            <button className="btn btn-secondary btn-lg" disabled>
                              Coming Soon
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
                        ) : activeEnrollmentCount === 0 ? (
                          // ── First course: instant direct enrollment ──
                          <>
                            <button
                              className="btn btn-primary btn-lg"
                              style={{ width: '100%', justifyContent: 'center' }}
                              disabled={directEnrollLoading}
                              onClick={async () => {
                                setDirectEnrollLoading(true);
                                setDirectEnrollError('');
                                try {
                                  const res = await fetch(`/api/courses/${course.id}/enroll`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                  });
                                  const data = await res.json();
                                  if (res.ok) {
                                    setDirectEnrollDone(true);
                                  } else {
                                    setDirectEnrollError(data.error || 'Enrollment failed. Please try again.');
                                  }
                                } catch {
                                  setDirectEnrollError('An error occurred. Please try again.');
                                } finally {
                                  setDirectEnrollLoading(false);
                                }
                              }}
                            >
                              {directEnrollLoading ? 'Enrolling...' : '🚀 Enroll Now'}
                            </button>
                            {directEnrollError && (
                              <p style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '8px', textAlign: 'center' }}>
                                {directEnrollError}
                              </p>
                            )}
                          </>
                        ) : (
                          // ── Subsequent courses: admin approval required ──
                          <JoinRequestButton
                            type="COURSE_ENROLLMENT"
                            targetId={course.id}
                            label="Request Enrollment"
                            className="btn btn-primary btn-lg"
                          />
                        )}
                      </div>
                    </div>

                    {/* What's Included Checklist */}
                    <div className={styles.includedSection}>
                      <span className={styles.includedTitle}>This Course Includes:</span>
                      <ul className={styles.includedList}>
                        <li>
                          <Play size={14} className={styles.includedIcon} />
                          <span>{course.duration || '40 Hours'} on-demand lessons & labs</span>
                        </li>
                        <li>
                          <Terminal size={14} className={styles.includedIcon} />
                          <span>In-browser interactive coding runtime</span>
                        </li>
                        <li>
                          <Briefcase size={14} className={styles.includedIcon} />
                          <span>4+ Production-grade portfolio capstones</span>
                        </li>
                        <li>
                          <Award size={14} className={styles.includedIcon} />
                          <span>Official verifiable certificate of completion</span>
                        </li>
                        <li>
                          <Users size={14} className={styles.includedIcon} />
                          <span>Direct 1-on-1 faculty mentorship & reviews</span>
                        </li>
                        <li>
                          <ShieldCheck size={14} className={styles.includedIcon} />
                          <span>Full lifetime access with future updates</span>
                        </li>
                      </ul>
                    </div>

                    {/* Reassurance Footer */}
                    <div className={styles.enrollFooterReassurance}>
                      <ShieldCheck size={16} className={styles.shieldSecIcon} />
                      <span>Instant Access • 100% Satisfaction Guarantee</span>
                    </div>
                  </div>
                </FadeInUp>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <Footer />
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
