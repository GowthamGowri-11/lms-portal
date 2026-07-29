'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Star, BookOpen, Clock, ArrowRight } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import TiltCard from '@/components/animations/TiltCard';
import TechIllustration from '@/components/ui/TechIllustration';
import Footer from '@/components/ui/Footer';
import styles from './page.module.css';
import { CourseWithArrays } from '@/lib/utils';
import { Trainer } from '@/generated/prisma/client';

const categories = ['All', 'Web Development', 'Python', 'Java', 'C++', 'Data Science', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'Other'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// Per-category accent color for arrow button and level badge
function getAccentColor(title: string, category: string) {
  const t = (title + ' ' + category).toLowerCase();
  if (t.includes('python')) return '#3b82f6';
  if (t.includes('java') && !t.includes('javascript')) return '#22c55e';
  if (t.includes('react')) return '#f97316';
  if (t.includes('node') || t.includes('express')) return '#a855f7';
  if (t.includes('angular')) return '#ef4444';
  if (t.includes('vue')) return '#10b981';
  if (t.includes('frontend') || t.includes('html')) return '#f97316';
  if (t.includes('data')) return '#06b6d4';
  if (t.includes('cloud') || t.includes('devops')) return '#f59e0b';
  return '#6366f1';
}

export default function CoursesClient({ courses, trainers }: { courses: CourseWithArrays[], trainers: Trainer[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroDotGrid} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <FadeInUp>
              <span className={styles.heroTag}>Course Catalog</span>
              <h1 className={styles.heroTitle}>
                Explore Our <span className={styles.accentText}>Courses</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Discover courses taught by industry experts. Learn at your own pace
                and advance your career.
              </p>
            </FadeInUp>
          </div>
        </section>

        <section className={styles.contentSection}>
          <div className="container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Filter Bar */}
            <FadeInUp delay={0.1}>
              <div className={styles.topBar}>
                <div className={styles.searchBar}>
                  <Search size={18} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className={styles.filterControls}>
                  <div className={styles.filterGroup}>
                    <label>CATEGORY</label>
                    <select className={styles.filterSelect} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                      {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className={styles.filterGroup}>
                    <label>LEVEL</label>
                    <select className={styles.filterSelect} value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                      {levels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                  </div>
                  <p className={styles.resultCount}>
                    <strong>{filteredCourses.length}</strong> courses
                  </p>
                </div>
              </div>
            </FadeInUp>

            {/* Grid */}
            <div className={styles.scrollableGrid}>
              {filteredCourses.length > 0 ? (
                <StaggerContainer className={styles.coursesGrid}>
                  {filteredCourses.map((course) => {
                    const trainer = trainers.find((t) => t.id === course.trainerId);
                    const accent = getAccentColor(course.title, course.category);

                    return (
                      <StaggerItem key={course.id}>
                        <Link href={`/courses/${course.id}`} style={{ display: 'block', height: '100%' }}>
                          <TiltCard className={styles.courseCard}>
                            <div className={styles.cardInner}>

                              {/* ── LEFT TEXT ── */}
                              <div className={styles.cardLeft}>
                                {/* Top badges */}
                                <div className={styles.cardTopRow}>
                                  <span className={styles.cardCategory}>{course.category}</span>
                                  <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: accent,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                  }}>
                                    {course.level}
                                  </span>
                                </div>

                                {/* Title */}
                                <h3 className={styles.cardTitle}>{course.title}</h3>

                                {/* Description */}
                                <p className={styles.cardDesc}>{course.shortDescription}</p>

                                {/* Meta */}
                                <div className={styles.cardMeta}>
                                  <div className={styles.rating}>
                                    <Star size={13} fill="#eab308" stroke="#eab308" />
                                    <span>{course.rating}</span>
                                  </div>
                                  <span>•</span>
                                  <Clock size={12} style={{ opacity: 0.5 }} />
                                  <span>{course.duration}</span>
                                  <span>•</span>
                                  <BookOpen size={12} style={{ opacity: 0.5 }} />
                                  <span>{course.lessonsCount} lessons</span>
                                </div>

                                {/* Bottom: trainer + price + arrow */}
                                <div className={styles.cardBottom}>
                                  {trainer ? (
                                    <div className={styles.cardTrainer}>
                                      <div className={styles.trainerDot} style={{ background: accent }}>
                                        {trainer.name.charAt(0)}
                                      </div>
                                      <div className={styles.trainerInfo}>
                                        <span className={styles.trainerName}>{trainer.name}</span>
                                        <span className={styles.trainerLabel}>Instructor</span>
                                      </div>
                                    </div>
                                  ) : <div />}

                                  <div className={styles.priceBlock}>
                                    <div className={styles.price}>
                                      {course.discountPrice && (
                                        <span className={styles.oldPrice}>₹{course.price}</span>
                                      )}
                                      <span className={styles.currentPrice}>
                                        ₹{course.discountPrice ?? course.price}
                                      </span>
                                    </div>
                                    <div
                                      className={styles.arrowBtn}
                                      style={{ background: accent }}
                                    >
                                      <ArrowRight size={15} color="white" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* ── RIGHT ILLUSTRATION ── */}
                              <div className={styles.cardIllustration}>
                                <TechIllustration
                                  title={course.title}
                                  category={course.category}
                                  size={110}
                                />
                              </div>

                            </div>
                          </TiltCard>
                        </Link>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              ) : (
                <div className={styles.emptyState}>
                  <BookOpen size={48} />
                  <h3>No courses found</h3>
                  <p>Try adjusting your filters or search query.</p>
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
