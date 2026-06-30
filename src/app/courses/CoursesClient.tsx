'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Star, BookOpen } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { CourseWithArrays } from '@/lib/utils';
import { Trainer } from '@/generated/prisma/client';

const categories = ['All', 'Web Development', 'Python', 'Java', 'C++', 'Data Science', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'Other'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

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
            
            {/* Horizontal Filter Bar */}
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
                    <label>Category</label>
                    <select 
                      className={styles.filterSelect}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={styles.filterGroup}>
                    <label>Level</label>
                    <select 
                      className={styles.filterSelect}
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                      {levels.map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                  
                  <p className={styles.resultCount}>
                    <strong>{filteredCourses.length}</strong> courses
                  </p>
                </div>
              </div>
            </FadeInUp>

            {/* Scrollable Grid Container */}
            <div className={styles.scrollableGrid}>
              {filteredCourses.length > 0 ? (
                <StaggerContainer className={styles.coursesGrid}>
                  {filteredCourses.map((course) => {
                    const trainer = trainers.find((t) => t.id === course.trainerId);
                    return (
                      <StaggerItem key={course.id} style={{ height: '100%' }}>
                        <Link href={`/courses/${course.id}`} style={{ display: 'block', height: '100%' }}>
                          <div className={styles.courseCard}>
                            <div className={styles.cardLeft}>
                              <div className={styles.cardLogo}>
                                <img src={course.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              </div>
                            </div>
                            <div className={styles.cardRight}>
                              <div className={styles.cardTopRow}>
                                <span className={styles.cardCategory}>{course.category}</span>
                                <span className={`badge badge-primary`}>{course.level}</span>
                              </div>
                              <h3 className={styles.cardTitle}>{course.title}</h3>
                              <p className={styles.cardDesc}>{course.shortDescription}</p>
                              <div className={styles.cardMeta}>
                                <div className={styles.rating}>
                                  <Star size={14} fill="#eab308" stroke="#eab308" />
                                  <span>{course.rating}</span>
                                </div>
                                <span>•</span>
                                <span>{course.duration}</span>
                                <span>•</span>
                                <span>{course.lessonsCount} lessons</span>
                              </div>
                              <div className={styles.cardBottom}>
                                {trainer && (
                                  <div className={styles.cardTrainer}>
                                    <div className={styles.trainerDot}>{trainer.name.charAt(0)}</div>
                                    <span>{trainer.name}</span>
                                  </div>
                                )}
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
                              </div>
                            </div>
                          </div>
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
      </main>
    </>
  );
}
