import React from 'react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { Terminal, Briefcase, Code, Lightbulb, Award, Users, ShieldCheck } from 'lucide-react';
import styles from './page.module.css';
import { prisma } from '@/lib/prisma';
import ViewResumeButton from '@/components/ui/ViewResumeButton';

export default async function AboutPage() {
  const developers = await prisma.developer.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return (
    <>
      <Navbar />
      <main className={styles.aboutSection}>
        <div className="container">
          <FadeInUp>
            <div className={styles.aboutHeader}>
              <h1 className={styles.aboutTitle}>Empowering Careers Through Expert Education</h1>
              <p className={styles.aboutSubtitle}>
                At GM Training, we are dedicated to providing world-class learning experiences designed
                to help you master the skills that matter most in today's tech-driven world.
              </p>
            </div>
          </FadeInUp>

          <div className={styles.aboutGrid}>
            <ScrollReveal delay={0.2}>
              <div className={styles.aboutContent}>
                <h2>Our Mission</h2>
                <p>
                  We believe that quality education should be accessible and practical. Our mission is to bridge
                  the gap between academic learning and industry requirements by offering hands-on, project-based
                  courses led by seasoned professionals.
                </p>
                <p>
                  Whether you are starting from scratch or looking to upskill, our structured curriculum and
                  expert guidance will ensure you achieve your career goals.
                </p>

                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>10+</span>
                    <span className={styles.statLabel}>Years Experience</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>5K+</span>
                    <span className={styles.statLabel}>Students Placed</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>98%</span>
                    <span className={styles.statLabel}>Success Rate</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className={styles.missionImageContainer}>
                <div className={styles.missionImagePlaceholder}>
                  <h2>Building the Future</h2>
                  <p>Equipping learners with real-world skills.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Core Values Section */}
          <div className={styles.valuesSection}>
            <ScrollReveal>
              <div className={styles.sectionHeader}>
                <h2>Our Core Values</h2>
                <p>The principles that guide everything we do.</p>
              </div>
            </ScrollReveal>

            <div className={styles.valuesGrid}>
              {[
                {
                  icon: <Lightbulb size={28} />,
                  title: 'Innovation',
                  desc: 'We constantly evolve our curriculum to stay ahead of industry trends.',
                  color: 'var(--accent-primary)',
                },
                {
                  icon: <Award size={28} />,
                  title: 'Excellence',
                  desc: 'We are committed to delivering the highest quality educational experience.',
                  color: 'var(--accent-secondary)',
                },
                {
                  icon: <Users size={28} />,
                  title: 'Community',
                  desc: 'We foster a collaborative and supportive environment for all learners.',
                  color: 'var(--accent-tertiary)',
                },
                {
                  icon: <ShieldCheck size={28} />,
                  title: 'Integrity',
                  desc: 'We operate with transparency, honesty, and a focus on student success.',
                  color: 'var(--accent-warning)',
                },
              ].map((value, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.1}>
                  <div className={styles.valueCard}>
                    <div
                      className={styles.valueIcon}
                      style={{ background: `${value.color}15`, color: value.color }}
                    >
                      {value.icon}
                    </div>
                    <h3>{value.title}</h3>
                    <p>{value.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Developers Section */}
          <div className={styles.devsSection}>
            <ScrollReveal>
              <div className={styles.sectionHeader}>
                <h2>Meet the Developers</h2>
                <p>The engineering team that built the GM Training platform.</p>
              </div>
            </ScrollReveal>

            {developers.length > 0 ? (
              <StaggerContainer className={styles.devsGrid}>
                {developers.map((dev) => (
                  <StaggerItem key={dev.id}>
                    <div className={styles.devCard}>
                      <div className={styles.devAvatar}>
                        {dev.avatar ? (
                          <img src={dev.avatar} alt={dev.name} />
                        ) : (
                          <Code size={32} />
                        )}
                      </div>
                      <h3>{dev.name}</h3>
                      <span className={styles.devRole}>{dev.role}</span>
                      <p>{dev.bio}</p>
                      
                      <div className={styles.devLinks}>
                        {dev.github && (
                          <a href={dev.github} target="_blank" rel="noopener noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.5-1.4 6.5-7a4.6 4.6 0 0 0-1.39-3.23 4.08 4.08 0 0 0-.13-3.19s-1.12-.36-3.66 1.25a12.8 12.8 0 0 0-6.6 0C6.12 2.1 5 2.46 5 2.46a4.08 4.08 0 0 0-.13 3.19 4.6 4.6 0 0 0-1.39 3.23c0 5.6 3.36 6.65 6.5 7a4.8 4.8 0 0 0-1 3.02V22"/><path d="M9 20c-5 1.5-5-2.5-7-3"/></svg>
                          </a>
                        )}
                        {dev.linkedin && (
                          <a href={dev.linkedin} target="_blank" rel="noopener noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                          </a>
                        )}
                      </div>

                      {/* View Resume Button */}
                      {(dev as any).resume && (
                        <div className={styles.resumeContainer}>
                          <ViewResumeButton resumeUrl={(dev as any).resume} />
                        </div>
                      )}
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <p className={styles.noDevs}>No developers have been added yet.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
