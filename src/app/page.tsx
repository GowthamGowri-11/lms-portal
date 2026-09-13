import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import HeroAuthButtons from '@/components/auth/HeroAuthButtons';
import CareerGrowthVisual from '@/components/ui/CareerGrowthVisual';
import Footer from '@/components/ui/Footer';
import { prisma } from '@/lib/prisma';
import SuccessRoadmap from '@/components/ui/SuccessRoadmap';
import WhyChooseUs from '@/components/ui/WhyChooseUs';
import styles from './page.module.css';
import { ArrowRight } from 'lucide-react';

export const revalidate = 3600; // Cache this page for 1 hour

export default async function Home() {
  // Fetch real dynamic counts from Prisma
  const [studentsCount, coursesCount, trainersCount] = await Promise.all([
    prisma.student.count(),
    prisma.course.count(),
    prisma.trainer.count(),
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
            2. ROADMAP TO SUCCESS (THE BLUEPRINT)
            ================================================================= */}
        <SuccessRoadmap />

        {/* =================================================================
            3. WHY ATLYX — WHY LEARNERS CHOOSE US
            ================================================================= */}
        <WhyChooseUs />


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
