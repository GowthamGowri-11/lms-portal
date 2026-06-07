import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
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
import LottieAnimation from '@/components/animations/LottieAnimation';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* ===== HERO SECTION ===== */}
        <section className={styles.hero}>
          <div className={styles.gridLines} />
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <FadeInUp delay={0.1}>
                <h1 className={styles.heroTitle}>
                  Master the Skills <br />
                  <span style={{ color: 'var(--accent-primary)' }}>That Drive Your Career</span>
                </h1>
              </FadeInUp>

              <FadeInUp delay={0.2}>
                <p className={styles.heroDescription}>
                  Join millions of learners advancing their careers with world-class
                  courses in Tech, Design, and Business. Learn from industry experts
                  at your own pace and build a portfolio of real-world projects.
                </p>
              </FadeInUp>

              <FadeInUp delay={0.3}>
                <div className={styles.heroActions}>
                  <Link href="/courses" className="btn btn-primary btn-lg">
                    Join for Free
                  </Link>
                  <button className="btn btn-secondary btn-lg">
                    Explore Programs
                  </button>
                </div>
              </FadeInUp>
            </div>
          </div>
        </section>

        {/* ===== PARTNERS SECTION ===== */}
        <section className={styles.partnersSection}>
          <div className="container">
            <p className={styles.partnersTitle}>We collaborate with <strong>200+ leading universities and companies</strong></p>
            <div className={styles.partnersGrid}>
              {['Google', 'IBM', 'Microsoft', 'Stanford', 'Meta', 'Amazon'].map((partner, idx) => (
                <div key={idx} className={styles.partnerLogo}>
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURED TRAINING PATHS ===== */}
        <section className={`section ${styles.pathsSection}`}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>Learning Paths</span>
                <h2 className={styles.sectionTitle}>
                  Featured <span style={{ color: 'var(--accent-primary)' }}>Training Paths</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Curated curriculums designed to take you from beginner to job-ready professional.
                </p>
              </div>
            </ScrollReveal>

            <div className={styles.pathsGrid}>
              {[
                {
                  title: 'Frontend Mastery',
                  desc: 'Master React, Next.js, and modern CSS to build stunning user interfaces.',
                  courses: 4,
                  duration: '3 Months',
                  icon: <Globe size={24} />,
                  color: 'var(--accent-primary)',
                },
                {
                  title: 'Backend Engineering',
                  desc: 'Learn Node.js, databases, and API design to power complex applications.',
                  courses: 5,
                  duration: '4 Months',
                  icon: <BookOpen size={24} />,
                  color: 'var(--accent-secondary)',
                },
                {
                  title: 'UI/UX Design',
                  desc: 'Design beautiful, user-centric experiences using Figma and design principles.',
                  courses: 3,
                  duration: '2 Months',
                  icon: <Award size={24} />,
                  color: 'var(--accent-tertiary)',
                },
              ].map((path, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.1}>
                  <div className={styles.pathCard}>
                    <div className={styles.pathHeader}>
                      <div className={styles.pathIcon} style={{ background: `${path.color}15`, color: path.color }}>
                        {path.icon}
                      </div>
                      <h3>{path.title}</h3>
                    </div>
                    <p className={styles.pathDesc}>{path.desc}</p>
                    <div className={styles.pathMeta}>
                      <span>{path.courses} Courses</span>
                      <span className={styles.pathDot}>•</span>
                      <span>{path.duration}</span>
                    </div>
                    <Link href="/courses" className={styles.pathLink} style={{ color: path.color }}>
                      View Path <ArrowRight size={16} />
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== WHY CHOOSE US ===== */}
        <section className={`section ${styles.whySection}`}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>Why GM Training</span>
                <h2 className={styles.sectionTitle}>
                  Why Learners <span style={{ color: 'var(--accent-primary)' }}>Choose Us</span>
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
                      style={{ background: 'var(--bg-tertiary)', color: item.color }}
                    >
                      {item.icon}
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section className={`section ${styles.ctaSection}`}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.ctaCard}>
                <h2>Ready to Start Your Learning Journey?</h2>
                <p>
                  Join thousands of students already learning with GM Training.
                  Get access to premium courses taught by industry experts.
                </p>
                <div className={styles.ctaActions}>
                  <Link href="/courses" className="btn btn-primary btn-lg">
                    Get Started Now
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

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

