import Image from 'next/image';
import Link from 'next/link';
import { Target, Lightbulb, Users as UsersIcon, Shield, Code, Layout, Database } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, ScrollReveal } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';

export default function AboutPage() {
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
                      <span className={styles.statValue}>5K+</span>
                      <span className={styles.statLabel}>Students</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>50+</span>
                      <span className={styles.statLabel}>Courses</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>20+</span>
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
                {/* Developer 1 - Gowtham */}
                <ScrollReveal delay={0.1}>
                  <div className={styles.devCard}>
                    <div className={styles.devAvatar} style={{ borderColor: 'var(--accent-primary)' }}>
                      <div className={styles.avatarPlaceholder}>G</div>
                    </div>
                    <h3>Gowtham</h3>
                    <span className={styles.devRole} style={{ color: 'var(--accent-primary)' }}>Full Stack Developer</span>
                    <p>
                      Specializing in Next.js, React, and Node.js. Passionate about creating seamless 
                      user experiences and robust backend architectures.
                    </p>
                    <div className={styles.devSkills}>
                      <span className={styles.skillChip}><Code size={14} /> Next.js</span>
                      <span className={styles.skillChip}><Database size={14} /> Prisma</span>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Developer 2 - Gowri */}
                <ScrollReveal delay={0.2}>
                  <div className={styles.devCard}>
                    <div className={styles.devAvatar} style={{ borderColor: 'var(--accent-secondary)' }}>
                      <div className={styles.avatarPlaceholder}>G</div>
                    </div>
                    <h3>Gowri</h3>
                    <span className={styles.devRole} style={{ color: 'var(--accent-secondary)' }}>UI/UX Designer & Frontend Dev</span>
                    <p>
                      Expert in Framer Motion, Tailwind CSS, and user-centric design principles. 
                      Dedicated to making interfaces that are both beautiful and accessible.
                    </p>
                    <div className={styles.devSkills}>
                      <span className={styles.skillChip}><Layout size={14} /> UI/UX</span>
                      <span className={styles.skillChip}><Code size={14} /> Frontend</span>
                    </div>
                  </div>
                </ScrollReveal>
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
