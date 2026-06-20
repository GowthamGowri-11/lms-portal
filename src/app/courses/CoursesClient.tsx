'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Star, ArrowRight, Filter, BookOpen, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { Course, Trainer } from '@/generated/prisma/client';

const categories = ['All', 'Web Development', 'Design', 'Data Science', 'Mobile Development', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'Other'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesClient({ courses, trainers }: { courses: Course[], trainers: Trainer[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const filterSidebar = (
    <div className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <h4 className={styles.sidebarTitle}>
          <SlidersHorizontal size={16} />
          Filters
        </h4>
      </div>

      <div className={styles.sidebarSection}>
        <h5 className={styles.filterLabel}>Category</h5>
        <div className={styles.filterList}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterItem} ${selectedCategory === cat ? styles.filterItemActive : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span className={styles.filterDot} />
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sidebarSection}>
        <h5 className={styles.filterLabel}>Level</h5>
        <div className={styles.filterList}>
          {levels.map((lvl) => (
            <button
              key={lvl}
              className={`${styles.filterItem} ${selectedLevel === lvl ? styles.filterItemActive : ''}`}
              onClick={() => setSelectedLevel(lvl)}
            >
              <span className={styles.filterDot} />
              {lvl}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

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
          <div className="container">
            <div className={styles.contentLayout}>
              {/* Desktop Sidebar */}
              {filterSidebar}

              {/* Main Content */}
              <div className={styles.mainContent}>
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
                    <button
                      className={styles.mobileFilterBtn}
                      onClick={() => setShowMobileFilters(!showMobileFilters)}
                    >
                      <Filter size={18} />
                      Filters
                    </button>
                    <p className={styles.resultCount}>
                      <strong>{filteredCourses.length}</strong> courses
                    </p>
                  </div>
                </FadeInUp>

                {/* Mobile filters */}
                {showMobileFilters && (
                  <div className={styles.mobileFilters}>
                    <div className={styles.mobileFilterGroup}>
                      <h5>Category</h5>
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
                    <div className={styles.mobileFilterGroup}>
                      <h5>Level</h5>
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
                )}

                <StaggerContainer className={styles.coursesGrid}>
                  {filteredCourses.map((course) => {
                    const trainer = trainers.find((t) => t.id === course.trainerId);
                    return (
                      <StaggerItem key={course.id}>
                        <Link href={`/courses/${course.id}`}>
                          <div className={styles.courseCard}>
                            <div className={styles.cardLeft}>
                              <div className={styles.cardLogo}>{course.logo}</div>
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

                {filteredCourses.length === 0 && (
                  <div className={styles.emptyState}>
                    <BookOpen size={48} />
                    <h3>No courses found</h3>
                    <p>Try adjusting your filters or search query.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
