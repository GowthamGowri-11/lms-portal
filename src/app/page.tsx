import Link from 'next/link';
import {
  Award,
  Users,
  CheckCircle,
  Globe,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import {
  FadeInUp,
  ScrollReveal,
} from '@/components/animations/MotionWrappers';
import CodeTypingAnimation from '@/components/ui/CodeTypingAnimation';
import SuccessRoadmap from '@/components/ui/SuccessRoadmap';
import TrendingBento from '@/components/ui/TrendingBento';
import CallToAction from '@/components/ui/CallToAction';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export default async function Home() {
  const studentsCount = await prisma.student.count();
  const coursesCount = await prisma.course.count();
  const trainersCount = await prisma.trainer.count();

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* ===== HERO SECTION ===== */}
        <section className={styles.hero}>
          <div className={styles.dotGrid} />
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <FadeInUp delay={0.1}>
                <div className={styles.heroTag}>
                  <span className={styles.heroTagDot} />
                  Learning Management System
                </div>
              </FadeInUp>

              <FadeInUp delay={0.2}>
                <h1 className={styles.heroTitle}>
                  Master the Skills{' '}
                  <span className={styles.accentText}>That Drive Your Career</span>
                </h1>
              </FadeInUp>

              <FadeInUp delay={0.3}>
                <p className={styles.heroDescription}>
                  Join millions of learners advancing their careers with world-class
                  courses in Tech, Design, and Business. Learn from industry experts
                  at your own pace and build a portfolio of real-world projects.
                </p>
              </FadeInUp>

              <FadeInUp delay={0.4}>
                <div className={styles.heroActions}>
                  <Link href="/courses" className="btn btn-primary btn-lg">
                    Join for Free
                  </Link>
                  <Link href="/courses" className="btn btn-secondary btn-lg">
                    Explore Programs
                  </Link>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.5}>
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
              </FadeInUp>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroCard}>
                <div className={styles.heroCardHeader}>
                  <div className={styles.heroCardDot} style={{ background: '#ef4444' }} />
                  <div className={styles.heroCardDot} style={{ background: '#eab308' }} />
                  <div className={styles.heroCardDot} style={{ background: '#10b981' }} />
                </div>
                <div className={styles.heroCardBody}>
                  <CodeTypingAnimation />
                </div>
              </div>
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
                <span className={styles.sectionTag}>Why GM Training</span>
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
                  <div className={styles.whyCard}>
                    <div
                      className={styles.whyIcon}
                      style={{ color: item.color }}
                    >
                      {item.icon}
                    </div>
                    <div className={styles.whyText}>
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <CallToAction />

        {/* ===== FOOTER ===== */}
        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerGrid}>
              <div className={styles.footerBrand}>
                <h3>
                  GM <span style={{ color: 'var(--accent-primary)' }}>Training</span>
                </h3>
                <p>
                  Empowering learners worldwide with premium, expert-led courses
                  designed for the real world.
                </p>
              </div>
              <div className={styles.footerLinks}>
                <h4>Quick Links</h4>
                <Link href="/courses">Courses</Link>
                <Link href="/trainers">Trainers</Link>
                <Link href="/about">About Us</Link>
                <Link href="/admin">Admin Panel</Link>
              </div>
              <div className={styles.footerLinks}>
                <h4>Categories</h4>
                <span>Web Development</span>
                <span>UI/UX Design</span>
                <span>Data Science</span>
                <span>Mobile Development</span>
              </div>
              <div className={styles.footerLinks}>
                <h4>Contact</h4>
                <span>hello@gmtraining.com</span>
                <span>+91 98765 43210</span>
              </div>
            </div>
            <div className={styles.footerBottom}>
              <span>© {new Date().getFullYear()} GM Training. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
