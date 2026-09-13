'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import TrainerCard from '@/components/ui/TrainerCard';
import JoinRequestButton from '@/components/ui/JoinRequestButton';
import Footer from '@/components/ui/Footer';
import styles from './page.module.css';
import { Trainer } from '@/generated/prisma/client';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  Users,
  Search,
  Sparkles,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export default function TrainersClient({
  trainers,
  courses,
}: {
  trainers: Trainer[];
  courses: { id: string; title: string; logo: string; trainerId: string; isPublished: boolean }[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');

  const publishedCourses = useMemo(() => courses.filter((c) => c.isPublished), [courses]);

  // Extract unique specializations
  const specializations = useMemo(() => {
    const set = new Set<string>();
    trainers.forEach((t) => {
      if (t.specialization) set.add(t.specialization.trim());
    });
    return ['All', ...Array.from(set)];
  }, [trainers]);

  // Filtered trainers
  const filteredTrainers = useMemo(() => {
    return trainers.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        t.name.toLowerCase().includes(q) ||
        t.specialization?.toLowerCase().includes(q) ||
        t.bio?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q);

      const matchesSpec = selectedSpec === 'All' || t.specialization?.trim() === selectedSpec;

      return matchesSearch && matchesSpec;
    });
  }, [trainers, searchQuery, selectedSpec]);

  const hasActiveFilters = searchQuery !== '' || selectedSpec !== 'All';

  return (
    <PageTransition>
      <Navbar />
      <main className={styles.main}>
        {/* ── MINIMALIST ACADEMIC HERO ── */}
        <section className={styles.hero}>
          <div className="container">
            <FadeInUp>
              <div className={styles.heroBadge}>
                <Sparkles size={13} className={styles.sparkleIcon} />
                <span>Academic Faculty & Mentors</span>
              </div>
              <h1 className={styles.heroTitle}>
                Distinguished <span className={styles.accentText}>Faculty & Instructors</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Learn directly from verified practitioners, researchers, and engineers dedicated
                to academic excellence and practical, career-ready mentorship.
              </p>

              <div className={styles.heroActionsRow}>
                <JoinRequestButton
                  type="TRAINER_APPLICATION"
                  label="Apply as Faculty"
                  className={styles.applyBtn}
                />
              </div>

              {/* Minimalist Academic Badges Bar */}
              <div className={styles.academicBadges}>
                <div className={styles.badgeItem}>
                  <ShieldCheck size={14} className={styles.badgeIconBlue} />
                  <span>Verified Credentials</span>
                </div>
                <div className={styles.badgeSep}>•</div>
                <div className={styles.badgeItem}>
                  <Award size={14} className={styles.badgeIconAmber} />
                  <span>Curriculum Experts</span>
                </div>
                <div className={styles.badgeSep}>•</div>
                <div className={styles.badgeItem}>
                  <Users size={14} className={styles.badgeIconGreen} />
                  <span>1-on-1 Student Mentorship</span>
                </div>
              </div>
            </FadeInUp>
          </div>
        </section>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <section className={styles.trainersSection}>
          <div className="container">
            <FadeInUp delay={0.1}>
              <div className={styles.filterBar}>
                {/* Search Field */}
                <div className={styles.searchContainer}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search faculty by name, department, or expertise..."
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

                {/* Dropdown & Counter */}
                <div className={styles.filterControlsGroup}>
                  {specializations.length > 2 && (
                    <div className={styles.selectWrapper}>
                      <span className={styles.selectLabel}>Department</span>
                      <select
                        className={styles.customSelect}
                        value={selectedSpec}
                        onChange={(e) => setSelectedSpec(e.target.value)}
                      >
                        {specializations.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedSpec('All');
                      }}
                      className={styles.resetFilterBtn}
                      title="Reset filters"
                    >
                      <RotateCcw size={13} />
                      <span>Reset</span>
                    </button>
                  )}

                  <div className={styles.counterBadge}>
                    <span className={styles.counterNumber}>{filteredTrainers.length}</span>
                    <span className={styles.counterText}>Faculty Mentors</span>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* ── FACULTY CARDS GRID ── */}
            <div className={styles.gridContainer}>
              {filteredTrainers.length > 0 ? (
                <StaggerContainer className={styles.trainersGrid}>
                  {filteredTrainers.map((trainer) => (
                    <StaggerItem key={trainer.id}>
                      <TrainerCard
                        trainer={trainer}
                        courses={publishedCourses}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconWrap}>
                    <Search size={28} />
                  </div>
                  <h3 className={styles.emptyTitle}>No Faculty Profiles Found</h3>
                  <p className={styles.emptySubtitle}>
                    Try searching with different keywords or clear your active filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSpec('All');
                    }}
                    className={styles.emptyResetBtn}
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
    </PageTransition>
  );
}
