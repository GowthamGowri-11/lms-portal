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
  Zap,
  Code2,
  ExternalLink,
  Layers,
  Cpu,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, ScrollReveal } from '@/components/animations/MotionWrappers';
import { prisma } from '@/lib/prisma';
import ViewResumeButton from '@/components/ui/ViewResumeButton';
import Footer from '@/components/ui/Footer';
import AcademicBackground from '@/components/ui/backgrounds/AcademicBackground';
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
        {/* ── ACADEMIC INSTITUTIONAL BACKGROUND LAYER ── */}
        <AcademicBackground accent="cyan" />

        {/* ── HERO SECTION ── */}
        <section className={styles.hero}>
          <div className={styles.heroBgGlow} />
          <div className={styles.heroGridPattern} />
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <FadeInUp>
              <div className={styles.heroTag}>
                <span className={styles.pulseDot}>
                  <span className={styles.pulseRing} />
                </span>
                <GraduationCap size={15} className={styles.heroTagIcon} />
                <span>Institutional Vision & Philosophy</span>
              </div>
              <h1 className={styles.heroTitle}>
                Empowering the Next Generation of <span className={styles.heroGradient}>Tech Leaders</span>
              </h1>
              <p className={styles.heroSubtitle}>
                ATLYX is a premier academic and technical learning management platform engineered to deliver
                world-class curriculum in modern software engineering, AI, and systems architecture.
              </p>

              {/* Highlights Trust Strip */}
              <div className={styles.heroHighlights}>
                <div className={styles.heroHighlightItem}>
                  <div className={styles.highlightDot} />
                  <Zap size={14} className={styles.highlightIcon} />
                  <span>Production-Grade Projects</span>
                </div>
                <div className={styles.heroHighlightDivider} />
                <div className={styles.heroHighlightItem}>
                  <div className={styles.highlightDot} />
                  <Shield size={14} className={styles.highlightIcon} />
                  <span>Accredited Certifications</span>
                </div>
                <div className={styles.heroHighlightDivider} />
                <div className={styles.heroHighlightItem}>
                  <div className={styles.highlightDot} />
                  <UsersIcon size={14} className={styles.highlightIcon} />
                  <span>Direct 1-on-1 Mentorship</span>
                </div>
              </div>
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
                  <div className={styles.subTag}>
                    <Sparkles size={13} className={styles.subTagIcon} />
                    <span>Our Mission & Ethos</span>
                  </div>
                  <h2 className={styles.sectionTitle}>
                    Bridging the Gap Between <span className={styles.textAccentBlue}>Academia & Industry</span>
                  </h2>
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
                    <div className={`${styles.statCard} ${styles.statCardBlue}`}>
                      <div className={styles.statCardAccent} style={{ background: 'linear-gradient(90deg, #2563eb, #38bdf8)' }} />
                      <div className={styles.statIconWrap} style={{ color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe' }}>
                        <UsersIcon size={20} />
                      </div>
                      <div className={styles.statNumberRow}>
                        <span className={styles.statValue}>{studentsCount}</span>
                        <span className={styles.statPlus} style={{ color: '#2563eb' }}>+</span>
                      </div>
                      <span className={styles.statLabel}>Active Learners</span>
                      <span className={styles.statBadgePill} style={{ color: '#1d4ed8', background: '#eff6ff' }}>Global Community</span>
                    </div>

                    <div className={`${styles.statCard} ${styles.statCardPurple}`}>
                      <div className={styles.statCardAccent} style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }} />
                      <div className={styles.statIconWrap} style={{ color: '#7c3aed', background: '#f5f3ff', borderColor: '#ddd6fe' }}>
                        <BookOpen size={20} />
                      </div>
                      <div className={styles.statNumberRow}>
                        <span className={styles.statValue}>{coursesCount}</span>
                        <span className={styles.statPlus} style={{ color: '#7c3aed' }}>+</span>
                      </div>
                      <span className={styles.statLabel}>Accredited Courses</span>
                      <span className={styles.statBadgePill} style={{ color: '#6d28d9', background: '#f5f3ff' }}>Curated Tracks</span>
                    </div>

                    <div className={`${styles.statCard} ${styles.statCardEmerald}`}>
                      <div className={styles.statCardAccent} style={{ background: 'linear-gradient(90deg, #059669, #34d399)' }} />
                      <div className={styles.statIconWrap} style={{ color: '#059669', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                        <Briefcase size={20} />
                      </div>
                      <div className={styles.statNumberRow}>
                        <span className={styles.statValue}>{trainersCount}</span>
                        <span className={styles.statPlus} style={{ color: '#059669' }}>+</span>
                      </div>
                      <span className={styles.statLabel}>Faculty Mentors</span>
                      <span className={styles.statBadgePill} style={{ color: '#047857', background: '#ecfdf5' }}>Industry Leaders</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Right Column: Vision & Framework Card */}
              <ScrollReveal delay={0.15}>
                <div className={styles.visionCardWrapper}>
                  <div className={styles.visionCard}>
                    <div className={styles.visionCardTopGlow} />
                    <div className={styles.visionCardHeader}>
                      <div className={styles.visionIconBox}>
                        <Compass size={26} className={styles.visionIcon} />
                      </div>
                      <div className={styles.visionBadge}>
                        <span className={styles.visionBadgeDot} />
                        Strategic Vision
                      </div>
                    </div>

                    <h3 className={styles.visionTitle}>Building a Global Center of Technical Excellence</h3>
                    <p className={styles.visionDesc}>
                      Nurturing engineers capable of solving complex global challenges through disciplined software
                      practices, research rigor, and hands-on capstone engineering.
                    </p>

                    <div className={styles.visionPillars}>
                      <div className={styles.pillarItem}>
                        <div className={styles.pillarIconBox}>
                          <CheckCircle2 size={16} className={styles.checkBlue} />
                        </div>
                        <div className={styles.pillarText}>
                          <strong>Curriculum aligned</strong> with current high-demand industry standards
                        </div>
                      </div>
                      <div className={styles.pillarItem}>
                        <div className={styles.pillarIconBox}>
                          <CheckCircle2 size={16} className={styles.checkBlue} />
                        </div>
                        <div className={styles.pillarText}>
                          <strong>Integrated browser IDE</strong> with automated instant unit test feedback
                        </div>
                      </div>
                      <div className={styles.pillarItem}>
                        <div className={styles.pillarIconBox}>
                          <CheckCircle2 size={16} className={styles.checkBlue} />
                        </div>
                        <div className={styles.pillarText}>
                          <strong>Accredited certificates</strong> verifiable for top-tier career portfolios
                        </div>
                      </div>
                    </div>

                    <div className={styles.visionFooter}>
                      <div className={styles.awardBadgeIconWrap}>
                        <Award size={18} className={styles.awardIcon} />
                      </div>
                      <div className={styles.visionFooterContent}>
                        <span className={styles.visionFooterTitle}>ATLYX Academic Standard</span>
                        <span className={styles.visionFooterSub}>Accreditation & Engineering Rigor</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* ── CORE VALUES SECTION ── */}
            <div className={styles.valuesSection}>
              <ScrollReveal>
                <div className={styles.sectionHeaderCenter}>
                  <span className={styles.sectionTagCenter}>
                    <Sparkles size={13} />
                    Core Principles & Pedagogy
                  </span>
                  <h2 className={styles.sectionTitleCenter}>
                    The Values That <span className={styles.textAccentBlue}>Define Us</span>
                  </h2>
                  <p className={styles.sectionSubtitleCenter}>
                    The pedagogical principles and ethical commitments guiding our curriculum, mentoring, and student success.
                  </p>
                </div>
              </ScrollReveal>

              <div className={styles.valuesGrid}>
                {[
                  {
                    idxStr: '01',
                    icon: <Target size={22} />,
                    tag: 'Mastery',
                    title: 'Academic Excellence',
                    desc: 'We uphold rigorous standards across all lesson modules, interactive coding labs, and milestone capstone projects.',
                    color: '#2563eb',
                    bg: '#eff6ff',
                    border: '#bfdbfe',
                    feature: 'Rigorous Evaluations',
                  },
                  {
                    idxStr: '02',
                    icon: <Lightbulb size={22} />,
                    tag: 'Technology',
                    title: 'Continuous Innovation',
                    desc: 'Curriculums are continuously updated to reflect modern tools, cloud native architectures, and AI engineering practices.',
                    color: '#7c3aed',
                    bg: '#f5f3ff',
                    border: '#ddd6fe',
                    feature: 'Modern Cloud & AI Stack',
                  },
                  {
                    idxStr: '03',
                    icon: <UsersIcon size={22} />,
                    tag: 'Collaboration',
                    title: 'Supportive Community',
                    desc: 'We cultivate an inclusive environment for peer problem solving, live code reviews, and structured study circles.',
                    color: '#059669',
                    bg: '#ecfdf5',
                    border: '#a7f3d0',
                    feature: 'Peer Code Reviews',
                  },
                  {
                    idxStr: '04',
                    icon: <Shield size={22} />,
                    tag: 'Trust',
                    title: 'Integrity & Transparency',
                    desc: 'We prioritize authentic student learning outcomes, fair evaluations, and industry-recognized credentials.',
                    color: '#d97706',
                    bg: '#fffbeb',
                    border: '#fde68a',
                    feature: 'Verifiable Portfolios',
                  },
                ].map((val, idx) => (
                  <ScrollReveal key={idx} delay={idx * 0.1}>
                    <div className={styles.valueCard}>
                      <div className={styles.valueCardAccent} style={{ background: `linear-gradient(90deg, ${val.color}, ${val.color}99)` }} />
                      
                      <div className={styles.valueHeaderRow}>
                        <div
                          className={styles.valueIcon}
                          style={{ color: val.color, background: val.bg, borderColor: val.border }}
                        >
                          {val.icon}
                        </div>
                        <span className={styles.valueTag} style={{ color: val.color, background: val.bg, borderColor: val.border }}>
                          {val.idxStr} • {val.tag}
                        </span>
                      </div>

                      <h3 className={styles.valueTitle}>{val.title}</h3>
                      <p className={styles.valueDesc}>{val.desc}</p>

                      <div className={styles.valueFooterPill}>
                        <span className={styles.valueFeatureDot} style={{ background: val.color }} />
                        <span style={{ color: val.color }}>{val.feature}</span>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* ── DEVELOPERS / CREATORS SECTION ── */}
            <div className={styles.devsSection}>
              <ScrollReveal>
                <div className={styles.sectionHeaderCenter}>
                  <span className={styles.sectionTagCenter}>
                    <Code2 size={14} />
                    Platform Engineering & Leadership
                  </span>
                  <h2 className={styles.sectionTitleCenter}>
                    Meet the <span className={styles.textAccentBlue}>Platform Architects</span>
                  </h2>
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
                  const themeBorder = isPrimary ? '#bfdbfe' : '#ddd6fe';

                  return (
                    <ScrollReveal key={dev.id} delay={idx * 0.1} className={styles.devCardWrapper}>
                      <div className={styles.devCard}>
                        {/* Cover Banner with dark mesh and ambient accent */}
                        <div className={styles.devCoverBanner}>
                          <div className={styles.devBannerOverlay} />
                          <div className={styles.devBannerPattern} />
                          <div className={styles.devBannerBadge}>
                            <CheckCircle2 size={12} className={styles.verifiedIcon} />
                            <span>Verified Architect</span>
                          </div>
                        </div>

                        {/* Avatar overlapping banner */}
                        <div className={styles.devAvatarContainer}>
                          <div className={styles.devAvatarRing} style={{ borderColor: themeColor }}>
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
                        </div>

                        {/* Developer Info */}
                        <div className={styles.devBody}>
                          <h3 className={styles.devName}>{dev.name}</h3>
                          <div className={styles.devRoleBadge} style={{ color: themeColor, background: themeBg, borderColor: themeBorder }}>
                            <Cpu size={12} />
                            <span>{dev.role}</span>
                          </div>

                          <p className={styles.devBio}>
                            {dev.bio || 'Platform Architect and Software Engineer dedicated to crafting modern, scalable learning experiences.'}
                          </p>

                          {/* Tech Expertise Tags */}
                          <div className={styles.devSkills}>
                            <span className={styles.skillPill}>Next.js 14</span>
                            <span className={styles.skillPill}>TypeScript</span>
                            <span className={styles.skillPill}>PostgreSQL</span>
                            <span className={styles.skillPill}>Prisma</span>
                            <span className={styles.skillPill}>Cloud Arch</span>
                          </div>

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
                <div className={styles.ctaGlow1} />
                <div className={styles.ctaGlow2} />
                <div className={styles.ctaInner}>
                  <div className={styles.ctaBadge}>
                    <Sparkles size={14} className={styles.sparkleIcon} />
                    <span>Begin Your Academic Journey</span>
                  </div>
                  <h2 className={styles.ctaHeading}>Ready to Advance Your Skills with ATLYX?</h2>
                  <p className={styles.ctaParagraph}>
                    Join thousands of students mastering modern full-stack development, cloud engineering, and AI
                    with our guided curriculums and verified credentials.
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

