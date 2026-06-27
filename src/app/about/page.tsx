import Link from 'next/link';
import { Target, Lightbulb, Users as UsersIcon, Shield } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, ScrollReveal } from '@/components/animations/MotionWrappers';
import { prisma } from '@/lib/prisma';
import ViewResumeButton from '@/components/ui/ViewResumeButton';
import styles from './page.module.css';

export default async function AboutPage() {
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
        {/* HERO SECTION */}
        <section className={styles.hero}>
          <div className={styles.heroDotGrid} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <FadeInUp>
              <span className={styles.heroTag}>About Us</span>
              <h1 className={styles.heroTitle}>
                Empowering the Next Generation of <span className={styles.accentText}>Tech Leaders</span>
              </h1>
              <p className={styles.heroSubtitle}>
                GM Training is a premium learning platform dedicated to providing 
                world-class education in technology, design, and business.
              </p>
            </FadeInUp>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className={styles.aboutSection}>
          <div className="container">
            <div className={styles.aboutGrid}>
              <ScrollReveal>
                <div className={styles.aboutContent}>
                  <h2 className={styles.sectionTitle}>Our Mission</h2>
                  <p>
                    We believe that quality education should be accessible to everyone. 
                    Our mission is to bridge the gap between academic learning and industry 
                    requirements by providing practical, project-based training.
                  </p>
                  <p>
                    Since our founding, we have helped thousands of students transition 
                    into successful careers in tech through our comprehensive curriculums 
                    designed by industry experts.
                  </p>
                  
                  <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{studentsCount}</span>
                      <span className={styles.statLabel}>Students</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{coursesCount}</span>
                      <span className={styles.statLabel}>Courses</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{trainersCount}</span>
                      <span className={styles.statLabel}>Expert Trainers</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.2}>
                <div className={styles.missionImageContainer}>
                  <div className={styles.missionImagePlaceholder}>
                    <Target size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Vision for the Future</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Building a global community of lifelong learners.</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* CORE VALUES */}
            <div className={styles.valuesSection}>
              <ScrollReveal>
                <div className={styles.sectionHeaderCenter}>
                  <h2 className={styles.sectionTitle}>Our Core Values</h2>
                  <p className={styles.sectionSubtitleCenter}>The principles that guide everything we do.</p>
                </div>
              </ScrollReveal>

              <div className={styles.valuesGrid}>
                {[
                  { icon: <Target size={32} />, title: 'Excellence', desc: 'We strive for the highest quality in our curriculum and teaching.', color: 'var(--accent-primary)' },
                  { icon: <Lightbulb size={32} />, title: 'Innovation', desc: 'We constantly update our content to match the latest industry trends.', color: 'var(--accent-secondary)' },
                  { icon: <UsersIcon size={32} />, title: 'Community', desc: 'We foster a supportive environment where learners grow together.', color: 'var(--accent-tertiary)' },
                  { icon: <Shield size={32} />, title: 'Integrity', desc: 'We are transparent, honest, and committed to our students\' success.', color: 'var(--accent-warning)' }
                ].map((value, idx) => (
                  <ScrollReveal key={idx} delay={idx * 0.1}>
                    <div className={styles.valueCard} style={{ borderTopColor: value.color }}>
                      <div className={styles.valueIcon} style={{ color: value.color, background: `${value.color}15` }}>
                        {value.icon}
                      </div>
                      <h3>{value.title}</h3>
                      <p>{value.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* DEVELOPERS / CREATORS */}
            <div className={styles.devsSection}>
              <ScrollReveal>
                <div className={styles.sectionHeaderCenter}>
                  <span className={styles.heroTag} style={{ marginBottom: '1rem' }}>The Creators</span>
                  <h2 className={styles.sectionTitle}>Meet the Developers</h2>
                  <p className={styles.sectionSubtitleCenter}>The team behind GM Training platform.</p>
                </div>
              </ScrollReveal>

              <div className={styles.devsGrid}>
                {developers.map((dev, idx) => {
                  const color = idx % 2 === 0 ? 'var(--accent-primary)' : 'var(--accent-secondary)';
                  return (
                    <ScrollReveal key={dev.id} delay={idx * 0.1} className={styles.devCardWrapper}>
                      <div className={styles.devCard}>
                        <div className={styles.devAvatar} style={{ borderColor: color }}>
                          {dev.avatar ? (
                            <img src={dev.avatar} alt={dev.name} className={styles.avatarImage} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div className={styles.avatarPlaceholder}>{dev.name.charAt(0)}</div>
                          )}
                        </div>
                        <h3>{dev.name}</h3>
                        <span className={styles.devRole} style={{ color }}>{dev.role}</span>
                        <p>{dev.bio}</p>
                        <div className={styles.devSkills} style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                          {dev.github && (
                            <Link href={dev.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.5-1.4 6.5-7a4.6 4.6 0 0 0-1.39-3.23 4.08 4.08 0 0 0-.13-3.19s-1.12-.36-3.66 1.25a12.8 12.8 0 0 0-6.6 0C6.12 2.1 5 2.46 5 2.46a4.08 4.08 0 0 0-.13 3.19 4.6 4.6 0 0 0-1.39 3.23c0 5.6 3.36 6.65 6.5 7a4.8 4.8 0 0 0-1 3.02V22"/><path d="M9 20c-5 1.5-5-2.5-7-3"/></svg>
                            </Link>
                          )}
                          {dev.linkedin && (
                            <Link href={dev.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                            </Link>
                          )}
                        </div>
                        {dev.resume && (
                          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <ViewResumeButton resumeUrl={dev.resume} />
                          </div>
                        )}
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className={styles.ctaSection}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.ctaCard}>
                <h2>Join Our Learning Community</h2>
                <p>Start your journey today and get access to premium courses, expert trainers, and a supportive community.</p>
                <Link href="/courses" className="btn btn-primary btn-lg" style={{ background: 'white', color: 'var(--accent-primary)' }}>
                  Explore Courses
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerContent}>
              <div className={styles.footerBrand}>
                <h3>GM <span className={styles.accentText}>Training</span></h3>
                <p>Empowering learners worldwide.</p>
              </div>
              <div className={styles.footerCopyright}>
                <span>© {new Date().getFullYear()} GM Training. All rights reserved.</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
