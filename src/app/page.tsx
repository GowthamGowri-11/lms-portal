import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import HeroAuthButtons from '@/components/auth/HeroAuthButtons';
import CareerGrowthVisual from '@/components/ui/CareerGrowthVisual';
import Footer from '@/components/ui/Footer';
import CourseBanner from '@/components/ui/CourseBanner';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import {
  BookOpen,
  Users,
  Award,
  ArrowRight,
  ShieldCheck,
  Code2,
  Clock,
  CheckCircle2,
  Layers,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Star,
  Check,
  Zap,
  Terminal,
  Cpu,
  Database,
  Layout,
} from 'lucide-react';

export const revalidate = 3600; // Cache this page for 1 hour

// Helper to generate initials for avatar
function getInitials(name: string) {
  if (!name) return 'FM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Avatar gradient helper
function getAvatarGradient(name: string) {
  const gradients = [
    'linear-gradient(135deg, #2563eb, #38bdf8)',
    'linear-gradient(135deg, #7c3aed, #a855f7)',
    'linear-gradient(135deg, #0284c7, #06b6d4)',
    'linear-gradient(135deg, #059669, #34d399)',
    'linear-gradient(135deg, #d97706, #fbbf24)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

// Helper to get course icon & color variant
function getCourseIcon(category: string, title: string) {
  const text = `${category} ${title}`.toLowerCase();
  if (text.includes('web') || text.includes('full stack') || text.includes('react') || text.includes('node') || text.includes('frontend')) {
    return { icon: <Code2 size={18} />, boxClass: styles.iconBoxBlue };
  }
  if (text.includes('c++') || text.includes('cpp') || text.includes('system')) {
    return { icon: <Terminal size={18} />, boxClass: styles.iconBoxGreen };
  }
  if (text.includes('java')) {
    return { icon: <Layers size={18} />, boxClass: styles.iconBoxAmber };
  }
  if (text.includes('python') || text.includes('data') || text.includes('ai') || text.includes('ml')) {
    return { icon: <Sparkles size={18} />, boxClass: styles.iconBoxPurple };
  }
  return { icon: <BookOpen size={18} />, boxClass: styles.iconBoxBlue };
}

export default async function Home() {
  // Fetch real dynamic counts and items from Prisma
  const [studentsCount, coursesCount, trainersCount, featuredCourses, featuredTrainers] =
    await Promise.all([
      prisma.student.count(),
      prisma.course.count(),
      prisma.trainer.count(),
      prisma.course.findMany({
        where: { isPublished: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: { trainer: true },
      }),
      prisma.trainer.findMany({
        take: 4,
        orderBy: { rating: 'desc' },
        include: { courses: true },
      }),
    ]);

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* =================================================================
            1. HERO SECTION
            ================================================================= */}
        <section className={styles.hero}>
          <div className={styles.heroContainer}>
            {/* Left Side: Copy, CTA & Stats */}
            <div className={styles.heroContent}>
              <div className={styles.heroTag}>
                <span className={styles.heroTagDot} />
                <span>LEARNING MANAGEMENT SYSTEM</span>
              </div>

              <h1 className={styles.heroTitle}>
                Master the Skills That{' '}
                <span className={styles.accentText}>Drive Your Career</span>
              </h1>

              <p className={styles.heroDescription}>
                Learn in-demand skills through structured courses, expert guidance, and
                real-world projects designed to help you build a career-ready portfolio.
              </p>

              <div className={styles.heroActions}>
                <HeroAuthButtons />
              </div>

              {/* Compact Dynamic Statistics Card */}
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <strong>{studentsCount}</strong>
                  <span>Students</span>
                </div>
                <div className={styles.heroStatDivider} />
                <div className={styles.heroStat}>
                  <strong>{coursesCount}</strong>
                  <span>Courses</span>
                </div>
                <div className={styles.heroStatDivider} />
                <div className={styles.heroStat}>
                  <strong>{trainersCount}</strong>
                  <span>Expert Trainers</span>
                </div>
              </div>
            </div>

            {/* Right Side: ATLYX Career Growth Brand Story Visual */}
            <div className={styles.heroVisual}>
              <CareerGrowthVisual />
            </div>
          </div>
        </section>

        {/* =================================================================
            2. COMPACT VALUE PROPOSITION / TRUST BAR
            ================================================================= */}
        <section className={styles.valueSection}>
          <div className={styles.valueContainer}>
            <div className={styles.valueItem}>
              <div className={styles.valueIconBoxBlue}>
                <BookOpen size={18} />
              </div>
              <div className={styles.valueText}>
                <h4>Structured Learning</h4>
                <p>Curriculum with clear progression</p>
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIconBoxPurple}>
                <Users size={18} />
              </div>
              <div className={styles.valueText}>
                <h4>Expert Trainers</h4>
                <p>Direct guidance from verified faculty</p>
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIconBoxGreen}>
                <Code2 size={18} />
              </div>
              <div className={styles.valueText}>
                <h4>Real-World Projects</h4>
                <p>Portfolio-ready capstone engineering</p>
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIconBoxAmber}>
                <Award size={18} />
              </div>
              <div className={styles.valueText}>
                <h4>Career-Ready Skills</h4>
                <p>Accredited certs & in-demand tools</p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            3. POPULAR COURSES SECTION (PREMIUM MINIMALIST EDTECH CARDS)
            ================================================================= */}
        {featuredCourses.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeaderBetween}>
                <div>
                  <span className={styles.sectionBadge}>POPULAR COURSES</span>
                  <h2 className={styles.sectionHeading}>
                    Featured <span className={styles.accentText}>Academic Tracks</span>
                  </h2>
                  <p className={styles.sectionSub}>
                    Explore top-rated academic tracks and hands-on engineering specializations.
                  </p>
                </div>

                <Link href="/courses" className={styles.sectionLinkBtn}>
                  <span>Explore All Courses</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className={styles.coursesGrid}>
                {featuredCourses.map((course) => {
                  const trainerName = course.trainer?.name || 'ATLYX Faculty';
                  const avatarBg = getAvatarGradient(trainerName);
                  const { icon, boxClass } = getCourseIcon(course.category, course.title);

                  return (
                    <div key={course.id} className={styles.courseCard}>
                      {/* Redesigned Visual Course Banner */}
                      <CourseBanner
                        category={course.category}
                        title={course.title}
                        level={course.level}
                        rating={course.rating || '4.8'}
                        learnerCount={((course.title.charCodeAt(0) * 89) % 750) + 200}
                        logo={course.logo}
                      />

                      {/* Card Body */}
                      <div className={styles.courseCardBody}>

                        {/* Course Title */}
                        <h3 className={styles.courseCardTitle}>
                          <Link href={`/courses/${course.id}`}>{course.title}</Link>
                        </h3>

                        {/* Description with Line Clamping */}
                        <p className={styles.courseCardDesc}>
                          {course.shortDescription ||
                            'Structured hands-on curriculum with practical assignments, industry case studies, and faculty mentorship.'}
                        </p>

                        {/* Metadata Row */}
                        <div className={styles.courseCardMeta}>
                          <div className={styles.metaItem}>
                            <Clock size={13} className={styles.metaIcon} />
                            <span>{course.duration || '40 Hours'}</span>
                          </div>
                          <span className={styles.metaDot}>•</span>
                          <div className={styles.metaItem}>
                            <BookOpen size={13} className={styles.metaIcon} />
                            <span>{course.lessonsCount || 12} Modules</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Row: Faculty & View Course Link */}
                      <div className={styles.courseCardFooter}>
                        <div className={styles.instructorRow}>
                          <div
                            className={styles.instructorAvatar}
                            style={{ background: avatarBg }}
                          >
                            {getInitials(trainerName)}
                          </div>
                          <div className={styles.instructorInfo}>
                            <span className={styles.instructorName}>{trainerName}</span>
                            <span className={styles.instructorRole}>Faculty Mentor</span>
                          </div>
                        </div>

                        <Link
                          href={`/courses/${course.id}`}
                          className={styles.viewCourseBtn}
                          title="View Course Details"
                        >
                          <span>View Course</span>
                          <ArrowRight size={13} className={styles.viewArrow} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* =================================================================
            4. HOW ATLYX WORKS (4-STEP LEARNING JOURNEY)
            ================================================================= */}
        <section className={styles.howSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeaderCenter}>
              <span className={styles.sectionBadge}>HOW ATLYX WORKS</span>
              <h2 className={styles.sectionHeading}>
                Your Structured <span className={styles.accentText}>Learning Journey</span>
              </h2>
              <p className={styles.sectionSub}>
                A clear, milestone-driven workflow designed to take you from foundational concepts to production mastery.
              </p>
            </div>

            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>01</div>
                <h3 className={styles.stepTitle}>Choose a Course</h3>
                <p className={styles.stepDesc}>
                  Select from comprehensive curricula aligned with modern technology standards and academic benchmarks.
                </p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>02</div>
                <h3 className={styles.stepTitle}>Learn with Experts</h3>
                <p className={styles.stepDesc}>
                  Engage with structured modules, comprehensive study materials, and direct faculty mentor guidance.
                </p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>03</div>
                <h3 className={styles.stepTitle}>Build Real Projects</h3>
                <p className={styles.stepDesc}>
                  Apply your knowledge by creating production-grade capstones and portfolio-ready software architectures.
                </p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>04</div>
                <h3 className={styles.stepTitle}>Earn & Grow</h3>
                <p className={styles.stepDesc}>
                  Receive verified accredited certifications, validate your skills, and accelerate your professional career.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            5. LEARN FROM EXPERT TRAINERS SECTION
            ================================================================= */}
        {featuredTrainers.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeaderBetween}>
                <div>
                  <span className={styles.sectionBadge}>FACULTY</span>
                  <h2 className={styles.sectionHeading}>
                    Learn from <span className={styles.accentText}>Expert Trainers</span>
                  </h2>
                  <p className={styles.sectionSub}>
                    Distinguished instructors dedicated to your academic and professional development.
                  </p>
                </div>

                <Link href="/trainers" className={styles.sectionLinkBtn}>
                  <span>Meet All Faculty</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className={styles.trainersGrid}>
                {featuredTrainers.map((trainer) => {
                  const avatarBg = getAvatarGradient(trainer.name);

                  return (
                    <div key={trainer.id} className={styles.trainerCard}>
                      <div className={styles.trainerCardTop}>
                        <div
                          className={styles.trainerAvatar}
                          style={{ background: avatarBg }}
                        >
                          {getInitials(trainer.name)}
                        </div>
                        <span className={styles.facultyPill}>
                          <span className={styles.facultyDot} />
                          FACULTY
                        </span>
                      </div>

                      <div className={styles.trainerInfo}>
                        <h3 className={styles.trainerName}>{trainer.name}</h3>
                        <span className={styles.trainerSpec}>
                          {trainer.specialization || 'Software Engineering'}
                        </span>
                      </div>

                      <p className={styles.trainerBio}>
                        {trainer.bio ||
                          'Experienced faculty instructor committed to delivering practical, industry-aligned software engineering education.'}
                      </p>

                      <div className={styles.trainerFooter}>
                        <div className={styles.trainerCoursesCount}>
                          <BookOpen size={13} className={styles.trainerIcon} />
                          <span>{trainer.courses.length} Active Courses</span>
                        </div>

                        <Link href="/trainers" className={styles.trainerProfileLink}>
                          <span>View Profile</span>
                          <ArrowRight size={13} className={styles.profileArrow} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* =================================================================
            6. FINAL CALL TO ACTION
            ================================================================= */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <div className={styles.ctaCard}>
              <div className={styles.ctaGlow} />
              <span className={styles.ctaTag}>ACCELERATE YOUR LEARNING</span>
              <h2 className={styles.ctaTitle}>Ready to Build Your Future?</h2>
              <p className={styles.ctaDesc}>
                Start learning practical skills and turn knowledge into real-world experience.
                Join our verified academic community today.
              </p>

              <div className={styles.ctaActionRow}>
                <Link href="/courses" className={styles.ctaPrimaryBtn}>
                  <span>Explore Courses</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            7. FOOTER
            ================================================================= */}
        <Footer />
      </main>
    </>
  );
}
