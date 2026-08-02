import dynamic from 'next/dynamic';
import Navbar from '@/components/ui/Navbar';
import HeroAuthButtons from '@/components/auth/HeroAuthButtons';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

const CodeTypingAnimation = dynamic(() => import('@/components/ui/CodeTypingAnimation'));
const SuccessRoadmap = dynamic(() => import('@/components/ui/SuccessRoadmap'));
const TrendingBento = dynamic(() => import('@/components/ui/TrendingBento'));
const CallToAction = dynamic(() => import('@/components/ui/CallToAction'));
const Footer = dynamic(() => import('@/components/ui/Footer'));
const TiltCard = dynamic(() => import('@/components/animations/TiltCard'));
const ScrollReveal = dynamic(() => import('@/components/animations/MotionWrappers').then(m => m.ScrollReveal));

import { Award, Users, CheckCircle, Globe } from 'lucide-react';

export const revalidate = 3600; // Cache this page for 1 hour

export default async function Home() {
  const [studentsCount, coursesCount, trainersCount] = await Promise.all([
    prisma.student.count(),
    prisma.course.count(),
    prisma.trainer.count(),
  ]);

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* ===== HERO SECTION ===== */}
        <section className={styles.hero}>

          <div className={styles.dotGrid} />
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <div className={styles.heroTag}>
                <span className={styles.heroTagDot} />
                Learning Management System
              </div>

              <h1 className={styles.heroTitle}>
                Master the Skills{' '}
                <span className={styles.accentText}>That Drive Your Career</span>
              </h1>

              <p className={styles.heroDescription}>
                Join millions of learners advancing their careers with world-class
                courses in Tech, Design, and Business. Learn from industry experts
                at your own pace and build a portfolio of real-world projects.
              </p>

              <div className={styles.heroActions}>
                <HeroAuthButtons />
              </div>

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

            <div className={styles.heroVisual}>
              <TiltCard className={styles.heroCard}>
                <div className={styles.heroCardHeader}>
                  <div className={styles.heroCardDot} style={{ background: '#ef4444' }} />
                  <div className={styles.heroCardDot} style={{ background: '#eab308' }} />
                  <div className={styles.heroCardDot} style={{ background: '#10b981' }} />
                </div>
                <div className={styles.heroCardBody}>
                  <CodeTypingAnimation />
                </div>
              </TiltCard>
            </div>
          </div>
        </section>


        {/* ===== TRENDING FEATURES ===== */}
        <TrendingBento />

        {/* ===== SUCCESS ROADMAP ===== */}
        <SuccessRoadmap />

        {/* ===== WHY CHOOSE US ===== */}
        <section className={`section ${styles.whySection}`}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>Why ATLYX</span>
                <h2 className={styles.sectionTitle}>
                  Why Learners <span className={styles.accentText}>Choose Us</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className={styles.whyGrid}>
              {[
                {
                  icon: <Award size={28} />,
                  title: 'Industry-Recognized Certificates',
                  desc: 'Earn certificates valued by top employers worldwide upon course completion.',
                  color: 'var(--accent-primary)',
                },
                {
                  icon: <Users size={28} />,
                  title: 'Expert Trainers',
                  desc: 'Learn from professionals with 10+ years of real-world experience.',
                  color: 'var(--accent-secondary)',
                },
                {
                  icon: <CheckCircle size={28} />,
                  title: 'Project-Based Learning',
                  desc: 'Build real projects that you can showcase in your portfolio.',
                  color: 'var(--accent-tertiary)',
                },
                {
                  icon: <Globe size={28} />,
                  title: 'Learn Anywhere, Anytime',
                  desc: 'Access your courses on any device, at your own pace.',
                  color: 'var(--accent-warning)',
                },
              ].map((item, i) => (
                <ScrollReveal key={i}>
                  <TiltCard className={styles.whyCard}>
                    <div
                      className={styles.whyIcon}
                      style={{ color: item.color, transform: 'translateZ(30px)' }}
                    >
                      {item.icon}
                    </div>
                    <div className={styles.whyText} style={{ transform: 'translateZ(20px)' }}>
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <CallToAction />

        {/* ===== FOOTER ===== */}
        <Footer />
      </main>
    </>
  );
}
