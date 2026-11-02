'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Star,
  BookOpen,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Layers,
  GraduationCap,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Code2,
  Users,
  Terminal,
  Zap,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import Footer from '@/components/ui/Footer';
import CourseBanner from '@/components/ui/CourseBanner';
import AcademicBackground from '@/components/ui/backgrounds/AcademicBackground';
import styles from './page.module.css';
import { CourseWithArrays } from '@/lib/utils';
import { Trainer } from '@/generated/prisma/client';

const categories = [
  'All',
  'Web Development',
  'Programming',
  'Python',
  'Java',
  'C++',
  'Data Science',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'Other',
];

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// Smart category banner & styling configuration
function getCourseTheme(cat: string, title: string) {
  const t = (cat + ' ' + title).toLowerCase();
  if (t.includes('python')) {
    return {
      tag: 'Python & Data',
      icon: '🐍',
      gradient: 'linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #14b8a6 100%)',
      accent: '#0d9488',
      glow: 'rgba(13, 148, 136, 0.15)',
    };
  }
  if (t.includes('react') || t.includes('next')) {
    return {
      tag: 'React & Next.js',
      icon: '⚛️',
      gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)',
      accent: '#0284c7',
      glow: 'rgba(2, 132, 199, 0.15)',
    };
  }
  if (t.includes('node') || t.includes('full stack') || t.includes('web')) {
    return {
      tag: 'Full Stack Engineering',
      icon: '💻',
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #2563eb 100%)',
      accent: '#2563eb',
      glow: 'rgba(37, 99, 235, 0.15)',
    };
  }
  if (t.includes('java') && !t.includes('script')) {
    return {
      tag: 'Java Enterprise',
      icon: '☕',
      gradient: 'linear-gradient(135deg, #431407 0%, #c2410c 50%, #f97316 100%)',
      accent: '#ea580c',
      glow: 'rgba(234, 88, 12, 0.15)',
    };
  }
  if (t.includes('c++') || t.includes('cpp')) {
    return {
      tag: 'Systems & C++',
      icon: '⚙️',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)',
      accent: '#059669',
      glow: 'rgba(5, 150, 105, 0.15)',
    };
  }
  if (t.includes('data') || t.includes('ai') || t.includes('ml')) {
    return {
      tag: 'AI & Data Science',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #3b0764 0%, #7e22ce 50%, #a855f7 100%)',
      accent: '#7c3aed',
      glow: 'rgba(124, 58, 237, 0.15)',
    };
  }
  if (t.includes('cloud') || t.includes('devops')) {
    return {
      tag: 'Cloud & DevOps',
      icon: '☁️',
      gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)',
      accent: '#d97706',
      glow: 'rgba(217, 119, 6, 0.15)',
    };
  }
  return {
    tag: cat || 'Academic Course',
    icon: '🎓',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #2563eb 100%)',
    accent: '#2563eb',
    glow: 'rgba(37, 99, 235, 0.15)',
  };
}

// Generate initials for avatar
function getInitials(name: string) {
  if (!name) return 'FM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Color hash for instructor avatars
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

export default function CoursesClient({
  courses,
  trainers,
}: {
  courses: CourseWithArrays[];
  trainers: Trainer[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.shortDescription && c.shortDescription.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchQuery, selectedCategory, selectedLevel]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedLevel !== 'All';

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* ── ACADEMIC INSTITUTIONAL BACKGROUND LAYER ── */}
        <AcademicBackground accent="blue" />

        {/* ── ACADEMIC HERO SECTION ── */}
        <section className={styles.hero}>
          <div className="container">
            <FadeInUp>
              <div className={styles.heroBadge}>
                <Sparkles size={13} className={styles.sparkleIcon} />
                <span>Industry-Aligned Academic Curriculum</span>
              </div>
              <h1 className={styles.heroTitle}>
                Explore Verified <span className={styles.accentText}>Courses & Labs</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Build enterprise software, master modern frameworks, and earn accredited university
                certifications with direct faculty mentorship.
              </p>

              {/* Minimalist Trust Indicator Chips */}
              <div className={styles.heroTrustChips}>
                <div className={styles.trustChip}>
                  <ShieldCheck size={14} className={styles.chipIconBlue} />
                  <span>Accredited Certifications</span>
                </div>
                <div className={styles.trustDivider}>•</div>
                <div className={styles.trustChip}>
                  <Code2 size={14} className={styles.chipIconGreen} />
                  <span>Hands-on Capstones</span>
                </div>
                <div className={styles.trustDivider}>•</div>
                <div className={styles.trustChip}>
                  <Star size={14} className={styles.chipIconAmber} />
                  <span>4.8/5 Student Rating</span>
                </div>
              </div>
            </FadeInUp>
          </div>
        </section>

        {/* ── SEARCH & FILTER BAR ── */}
        <section className={styles.contentSection}>
          <div className="container">
            <FadeInUp delay={0.1}>
              <div className={styles.filterBar}>
                {/* Search Field */}
                <div className={styles.searchContainer}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search courses by title, topic, or keyword..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={styles.clearSearchBtn}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Dropdowns & Course Counter */}
                <div className={styles.filterControlsGroup}>
                  <div className={styles.selectWrapper}>
                    <span className={styles.selectLabel}>Category</span>
                    <select
                      className={styles.customSelect}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.selectWrapper}>
                    <span className={styles.selectLabel}>Level</span>
                    <select
                      className={styles.customSelect}
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                      {levels.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setSelectedLevel('All');
                      }}
                      className={styles.resetFilterBtn}
                      title="Reset filters"
                    >
                      <RotateCcw size={13} />
                      <span>Reset</span>
                    </button>
                  )}

                  <div className={styles.counterBadge}>
                    <span className={styles.counterNumber}>{filteredCourses.length}</span>
                    <span className={styles.counterText}>Courses</span>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* ── MASTER PREMIUM COURSE CARDS GRID ── */}
            <div className={styles.gridContainer}>
              {filteredCourses.length > 0 ? (
                <StaggerContainer className={styles.coursesGrid}>
                  {filteredCourses.map((course) => {
                    const trainer = trainers.find((t) => t.id === course.trainerId);
                    const theme = getCourseTheme(course.category, course.title);
                    const learnerCount = ((course.title.charCodeAt(0) * 89) % 750) + 200;
                    const instructorName = trainer?.name || 'ATLYX Faculty';
                    const avatarBg = getAvatarGradient(instructorName);

                    return (
                      <StaggerItem key={course.id}>
                        <motion.div
                          className={styles.courseCard}
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.22, ease: 'easeOut' }}
                        >
                          {/* ── 1. REDESIGNED VISUAL COURSE BANNER (IMAGE & BADGES) ── */}
                          <CourseBanner
                            category={course.category}
                            title={course.title}
                            level={course.level}
                            rating={course.rating || '4.8'}
                            learnerCount={learnerCount}
                            logo={course.logo}
                          />

                          {/* ── 2. CARD CONTENT BODY ── */}
                          <div className={styles.cardBody}>
                            <h3 className={styles.courseTitle}>
                              <Link href={`/courses/${course.id}`} className={styles.titleLink}>
                                {course.title}
                              </Link>
                            </h3>

                            <p className={styles.courseDescription}>
                              {course.shortDescription ||
                                'Comprehensive hands-on curriculum with real-world architecture, industry case studies, and production project deployment.'}
                            </p>

                            {/* Key Highlights Grid */}
                            <div className={styles.highlightsRow}>
                              <div className={styles.highlightBadge}>
                                <CheckCircle2 size={12} className={styles.checkGreen} />
                                <span>Capstone Project</span>
                              </div>
                              <div className={styles.highlightBadge}>
                                <Award size={12} className={styles.awardBlue} />
                                <span>Certificate</span>
                              </div>
                              <div className={styles.highlightBadge}>
                                <Zap size={12} className={styles.zapAmber} />
                                <span>Interactive Labs</span>
                              </div>
                            </div>

                            {/* Meta Metrics Bar */}
                            <div className={styles.metaMetricsBar}>
                              <div className={styles.metricItem}>
                                <Clock size={13} className={styles.metricIcon} />
                                <span>{course.duration || '40 Hours'}</span>
                              </div>
                              <span className={styles.metricSep}>•</span>
                              <div className={styles.metricItem}>
                                <BookOpen size={13} className={styles.metricIcon} />
                                <span>{course.lessonsCount || 12} Modules</span>
                              </div>
                              <span className={styles.metricSep}>•</span>
                              <div className={styles.metricItem}>
                                <Users size={13} className={styles.metricIcon} />
                                <span>{learnerCount}+ Learners</span>
                              </div>
                            </div>
                          </div>

                          {/* ── 3. CARD FOOTER: INSTRUCTOR & PRICING ACTION ── */}
                          <div className={styles.cardFooter}>
                            <div className={styles.instructorProfile}>
                              <div
                                className={styles.instructorAvatar}
                                style={{ background: avatarBg }}
                              >
                                {getInitials(instructorName)}
                              </div>
                              <div className={styles.instructorDetails}>
                                <span className={styles.instructorName}>{instructorName}</span>
                                <span className={styles.instructorRole}>Faculty Mentor</span>
                              </div>
                            </div>

                            <div className={styles.pricingActionBlock}>
                              <div className={styles.priceContainer}>
                                {course.discountPrice && (
                                  <span className={styles.strikePrice}>₹{course.price}</span>
                                )}
                                <span className={styles.finalPrice}>
                                  ₹{course.discountPrice ?? course.price}
                                </span>
                              </div>

                              <Link
                                href={`/courses/${course.id}`}
                                className={styles.exploreActionBtn}
                                title="Explore Course Details"
                              >
                                <span>Explore</span>
                                <ArrowRight size={14} className={styles.btnArrow} />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconCircle}>
                    <Search size={28} />
                  </div>
                  <h3 className={styles.emptyTitle}>No Courses Matching Filter</h3>
                  <p className={styles.emptySubtitle}>
                    We couldn't find any courses matching your search. Try resetting your filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedLevel('All');
                    }}
                    className={styles.resetAllBtn}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
