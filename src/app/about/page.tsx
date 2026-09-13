import Link from 'next/link';
import {
  Target,
  Lightbulb,
  Users as UsersIcon,
  Shield,
  Sparkles,
  Award,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Briefcase,
  Compass,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { prisma } from '@/lib/prisma';
import ViewResumeButton from '@/components/ui/ViewResumeButton';
import Footer from '@/components/ui/Footer';
import styles from './page.module.css';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const revalidate = 3600;

export default async function AboutPage() {
  const session = await getServerSession(authOptions);
  let developers = await prisma.developer.findMany();

  // Sort developers so Gowtham appears first
  developers.sort((a, b) => {
    if (a.name.toLowerCase().includes('gowtham')) return -1;
    if (b.name.toLowerCase().includes('gowtham')) return 1;
    return 0;
  });

  const studentsCount = await prisma.student.count();
  const coursesCount = await prisma.course.count();
  const trainersCount = await prisma.trainer.count();

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* ── HERO SECTION ── */}
        <section className={styles.hero}>
          <div className="container">
            <FadeInUp>
              <div className={styles.heroTag}>
                <GraduationCap size={15} />
                <span>Institutional Vision & Philosophy</span>
              </div>
              <h1 className={styles.heroTitle}>
                Empowering the Next Generation of <span className={styles.accentText}>Tech Leaders</span>
              </h1>
              <p className={styles.heroSubtitle}>
                ATLYX is a premier academic and technical learning management platform engineered to deliver
                world-class curriculum in modern software engineering, AI, and systems architecture.
              </p>
            </FadeInUp>
          </div>
        </section>

        {/* ── MISSION & VISION SECTION ── */}
        <section className={styles.aboutSection}>
          <div className="container">
            <div className={styles.aboutGrid}>
              {/* Left Column: Mission Narrative & Stats */}
              <ScrollReveal>
                <div className={styles.aboutContent}>
                  <div className={styles.subTag}>Our Mission</div>
                  <h2 className={styles.sectionTitle}>Bridging the Gap Between Academia & Industry</h2>
                  <p className={styles.leadText}>
                    We believe that world-class technical education must combine rigorous academic fundamentals
                    with practical, production-grade engineering practices.
                  </p>
                  <p className={styles.bodyText}>
                    Our mission is to empower students and professionals through project-driven curriculums,
                    interactive cloud coding environments, and direct 1-on-1 faculty mentorship.
                  </p>

                  {/* 3 Stats Bento Cards */}
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statIconWrap} style={{ color: '#2563eb', background: '#eff6ff' }}>
                        <UsersIcon size={20} />
                      </div>
                      <span className={styles.statValue}>{studentsCount}+</span>
                      <span className={styles.statLabel}>Active Learners</span>
                    </div>

                    <div className={styles.statCard}>
                      <div className={styles.statIconWrap} style={{ color: '#7c3aed', background: '#f5f3ff' }}>
                        <BookOpen size={20} />
                      </div>
                      <span className={styles.statValue}>{coursesCount}+</span>
                      <span className={styles.statLabel}>Accredited Courses</span>
                    </div>

                    <div className={styles.statCard}>
                      <div className={styles.statIconWrap} style={{ color: '#059669', background: '#ecfdf5' }}>
                        <Briefcase size={20} />
                      </div>
                      <span className={styles.statValue}>{trainersCount}+</span>
                      <span className={styles.statLabel}>Faculty Mentors</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Right Column: Vision & Framework Card */}
              <ScrollReveal delay={0.15}>
                <div className={styles.visionCardWrapper}>
                  <div className={styles.visionCard}>
                    <div className={styles.visionCardTop}>
                      <div className={styles.visionIconBox}>
                        <Compass size={28} className={styles.visionIcon} />
                      </div>
                      <span className={styles.visionBadge}>Strategic Vision</span>
                    </div>

                    <h3 className={styles.visionTitle}>Building a Global Center of Technical Excellence</h3>
                    <p className={styles.visionDesc}>
                      Nurturing engineers capable of solving complex global challenges through disciplined software
                      practices, research rigor, and hands-on capstone engineering.
                    </p>

                    <div className={styles.visionPillars}>
                      <div className={styles.pillarItem}>
                        <CheckCircle2 size={16} className={styles.checkBlue} />
                        <span>Curriculum aligned with current industry standards</span>
                      </div>
                      <div className={styles.pillarItem}>
                        <CheckCircle2 size={16} className={styles.checkBlue} />
                        <span>Integrated browser IDE with instant unit test feedback</span>
                      </div>
                      <div className={styles.pillarItem}>
                        <CheckCircle2 size={16} className={styles.checkBlue} />
                        <span>Accredited, verifiable certificates for career portfolios</span>
                      </div>
                    </div>

                    <div className={styles.visionFooter}>
                      <Award size={18} className={styles.awardIcon} />
                      <span>ATLYX Academic Accreditation & Excellence Standards</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* ── CORE VALUES SECTION ── */}
            <div className={styles.valuesSection}>
              <ScrollReveal>
                <div className={styles.sectionHeaderCenter}>
                  <span className={styles.sectionTagCenter}>Core Principles</span>
                  <h2 className={styles.sectionTitleCenter}>The Values That Define Us</h2>
                  <p className={styles.sectionSubtitleCenter}>
                    The pedagogical principles and ethical commitments guiding our curriculum and student success.
                  </p>
                </div>
              </ScrollReveal>

              <div className={styles.valuesGrid}>
                {[
                  {
                    icon: <Target size={24} />,
                    tag: 'Mastery',
                    title: 'Academic Excellence',
                    desc: 'We uphold rigorous standards across all lesson modules, coding labs, and milestone evaluations.',
                    color: '#2563eb',
                    bg: '#eff6ff',
                  },
                  {
                    icon: <Lightbulb size={24} />,
                    tag: 'Technology',
                    title: 'Continuous Innovation',
                    desc: 'Curriculums are regularly updated to reflect modern tools, cloud architectures, and AI engineering.',
                    color: '#7c3aed',
                    bg: '#f5f3ff',
                  },
                  {
                    icon: <UsersIcon size={24} />,
                    tag: 'Collaboration',
                    title: 'Supportive Community',
                    desc: 'We cultivate an inclusive environment for peer problem solving, code reviews, and study circles.',
                    color: '#059669',
                    bg: '#ecfdf5',
                  },
                  {
                    icon: <Shield size={24} />,
                    tag: 'Trust',
                    title: 'Integrity & Transparency',
                    desc: 'We prioritize honest student outcomes, fair assessments, and authentic industry credentialing.',
                    color: '#d97706',
                    bg: '#fffbeb',
                  },
                ].map((val, idx) => (
                  <ScrollReveal key={idx} delay={idx * 0.1}>
                    <div className={styles.valueCard}>
                      <div className={styles.valueCardAccent} style={{ background: val.color }} />
                      <div className={styles.valueHeaderRow}>
                        <div
                          className={styles.valueIcon}
                          style={{ color: val.color, background: val.bg, borderColor: `${val.color}33` }}
                        >
                          {val.icon}
                        </div>
                        <span className={styles.valueTag} style={{ color: val.color, background: val.bg }}>
                          {val.tag}
                        </span>
                      </div>
                      <h3>{val.title}</h3>
                      <p>{val.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* ── DEVELOPERS / CREATORS SECTION ── */}
            <div className={styles.devsSection}>
              <ScrollReveal>
                <div className={styles.sectionHeaderCenter}>
                  <span className={styles.sectionTagCenter}>Engineering & Leadership</span>
                  <h2 className={styles.sectionTitleCenter}>Meet the Platform Architects</h2>
                  <p className={styles.sectionSubtitleCenter}>
                    The visionary engineers and creators behind the ATLYX learning management platform.
                  </p>
                </div>
              </ScrollReveal>

              <div className={styles.devsGrid}>
                {developers.map((dev, idx) => {
                  const isPrimary = idx === 0;
                  const themeColor = isPrimary ? '#2563eb' : '#7c3aed';
                  const themeBg = isPrimary ? '#eff6ff' : '#f5f3ff';

                  return (
                    <ScrollReveal key={dev.id} delay={idx * 0.1} className={styles.devCardWrapper}>
                      <div className={styles.devCard}>
                        <div className={styles.devCardAccent} style={{ background: themeColor }} />

                        {/* Top Header Row with Avatar & Status */}
                        <div className={styles.devHeader}>
                          <div
                            className={styles.devAvatar}
                            style={{ borderColor: themeColor }}
                          >
                            {dev.avatar && (dev.avatar.startsWith('http') || dev.avatar.startsWith('data:image/')) ? (
                              <img
                                src={dev.avatar}
                                alt={dev.name}
                                className={styles.avatarImage}
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                loading="lazy"
                              />
                            ) : (
                              <div
                                className={styles.avatarPlaceholder}
                                style={{ background: themeBg, color: themeColor }}
                              >
                                {dev.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          <span className={styles.verifiedBadge}>
                            <CheckCircle2 size={13} className={styles.verifiedIcon} /> Lead Developer
                          </span>
                        </div>

                        {/* Developer Info */}
                        <h3 className={styles.devName}>{dev.name}</h3>
                        <span className={styles.devRole} style={{ color: themeColor, background: themeBg }}>
                          {dev.role}
                        </span>

                        <p className={styles.devBio}>{dev.bio || 'Platform Architect and Software Engineer dedicated to crafting modern learning experiences.'}</p>

                        {/* Actions & Links */}
                        <div className={styles.devFooter}>
                          <div className={styles.socialLinks}>
                            {dev.github && (
                              <Link
                                href={dev.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialBtn}
                                title="GitHub Profile"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.5-1.4 6.5-7a4.6 4.6 0 0 0-1.39-3.23 4.08 4.08 0 0 0-.13-3.19s-1.12-.36-3.66 1.25a12.8 12.8 0 0 0-6.6 0C6.12 2.1 5 2.46 5 2.46a4.08 4.08 0 0 0-.13 3.19 4.6 4.6 0 0 0-1.39 3.23c0 5.6 3.36 6.65 6.5 7a4.8 4.8 0 0 0-1 3.02V22" />
                                  <path d="M9 20c-5 1.5-5-2.5-7-3" />
                                </svg>
                              </Link>
                            )}
                            {dev.linkedin && (
                              <Link
                                href={dev.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialBtn}
                                title="LinkedIn Profile"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                  <rect width="4" height="12" x="2" y="9" />
                                  <circle cx="4" cy="4" r="2" />
                                </svg>
                              </Link>
                            )}
                          </div>

                          {dev.resume && (
                            <div className={styles.resumeWrap}>
                              <ViewResumeButton resumeUrl={dev.resume} />
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className={styles.ctaSection}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.ctaCard}>
                <div className={styles.ctaGlow} />
                <div className={styles.ctaInner}>
                  <div className={styles.ctaBadge}>
                    <Sparkles size={14} className={styles.sparkleIcon} />
                    <span>Begin Your Academic Journey</span>
                  </div>
                  <h2>Ready to Advance Your Skills with ATLYX?</h2>
                  <p>
                    Join thousands of students mastering programming, cloud engineering, and data science
                    with our guided curriculums.
                  </p>
                  <div className={styles.ctaBtnGroup}>
                    <Link href="/courses" className={styles.ctaPrimaryBtn}>
                      <span>Explore Curriculum</span>
                      <ArrowRight size={18} />
                    </Link>
                    <Link href="/trainers" className={styles.ctaSecondaryBtn}>
                      <span>Meet Mentors</span>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FOOTER */}
        <Footer />
      </main>
    </>
  );
}
