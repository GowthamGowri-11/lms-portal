'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Star, ArrowRight, Filter, BookOpen } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { Course, Trainer } from '@/generated/prisma/client';

const categories = ['All', 'Web Development', 'Design', 'Data Science', 'Mobile Development', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'Other'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesClient({ courses, trainers }: { courses: Course[], trainers: Trainer[] }) {
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
      <PageTransition>
        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroBg} />
            <div className="container">
              <FadeInUp>
                <h1 className={styles.heroTitle}>
                  Explore Our <span className="gradient-text">Courses</span>
                </h1>
                <p className={styles.heroSubtitle}>
                  Discover courses taught by industry experts. Learn at your own pace
                  and advance your career.
                </p>
              </FadeInUp>
            </div>
          </section>

          <section className={styles.filtersSection}>
            <div className="container">
              <FadeInUp delay={0.1}>
                <div className={styles.filtersRow}>
                  <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      className={`input-field ${styles.searchInput}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className={styles.filterGroup}>
                    <Filter size={16} />
                    <div className={styles.chips}>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          className={`${styles.chip} ${selectedCategory === cat ? styles.chipActive : ''}`}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.filterGroup}>
                    <div className={styles.chips}>
                      {levels.map((lvl) => (
                        <button
                          key={lvl}
                          className={`${styles.chip} ${selectedLevel === lvl ? styles.chipActive : ''}`}
                          onClick={() => setSelectedLevel(lvl)}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.15}>
                <p className={styles.resultCount}>
                  Showing <strong>{filteredCourses.length}</strong> courses
                </p>
              </FadeInUp>
            </div>
          </section>

          <section className={styles.coursesSection}>
            <div className="container">
              <StaggerContainer className={styles.coursesGrid}>
                {filteredCourses.map((course) => {
                  const trainer = trainers.find((t) => t.id === course.trainerId);
                  return (
                    <StaggerItem key={course.id}>
                      <Link href={`/courses/${course.id}`}>
                        <motion.div
                          className={styles.courseCard}
                          whileHover={{ y: -8 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <div className={styles.cardTop}>
                            <div className={styles.cardLogo}>{course.logo}</div>
                            <span className={`badge badge-primary`}>{course.level}</span>
                          </div>
                          <div className={styles.cardBody}>
                            <span className={styles.cardCategory}>{course.category}</span>
                            <h3 className={styles.cardTitle}>{course.title}</h3>
                            <p className={styles.cardDesc}>{course.shortDescription}</p>
                            <div className={styles.cardMeta}>
                              <div className={styles.rating}>
                                <Star size={14} fill="#fdcb6e" stroke="#fdcb6e" />
                                <span>{course.rating}</span>
                              </div>
                              <span>•</span>
                              <span>{course.duration}</span>
                              <span>•</span>
                              <span>{course.lessonsCount} lessons</span>
                            </div>
                            {trainer && (
                              <div className={styles.cardTrainer}>
                                <div className={styles.trainerDot}>{trainer.name.charAt(0)}</div>
                                <span>{trainer.name}</span>
                              </div>
                            )}
                          </div>
                          <div className={styles.cardFooter}>
                            <div className={styles.price}>
                              {course.discountPrice ? (
                                <>
                                  <span className={styles.oldPrice}>₹{course.price}</span>
                                  <span className={styles.currentPrice}>₹{course.discountPrice}</span>
                                </>
                              ) : (
                                <span className={styles.currentPrice}>₹{course.price}</span>
                              )}
                            </div>
                            <span className={styles.enrollLink}>
                              View Details <ArrowRight size={16} />
                            </span>
                          </div>
                        </motion.div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>

              {filteredCourses.length === 0 && (
                <div className={styles.emptyState}>
                  <BookOpen size={48} />
                  <h3>No courses found</h3>
                  <p>Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </PageTransition>
    </>
  );
}
