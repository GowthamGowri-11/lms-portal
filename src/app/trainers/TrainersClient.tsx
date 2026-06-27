'use client';

import { motion } from 'framer-motion';
import { Star, Users as UsersIcon, Award, BookOpen } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { Trainer } from '@/generated/prisma/client';

export default function TrainersClient({ trainers, courses }: { trainers: Trainer[], courses: { id: string; title: string; logo: string; trainerId: string; isPublished: boolean }[] }) {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroDotGrid} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <FadeInUp>
              <span className={styles.heroTag}>Our Faculty</span>
              <h1 className={styles.heroTitle}>
                Expert <span className={styles.accentText}>Trainers</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Learn from the best in the industry. Our trainers bring real-world
                experience and passion to every course.
              </p>
            </FadeInUp>
          </div>
        </section>

        <section className={styles.trainersSection}>
          <div className="container">
            <StaggerContainer className={styles.trainersGrid}>
              {trainers.map((trainer) => {
                const trainerCourses = courses.filter((c) => c.trainerId === trainer.id && c.isPublished);
                return (
                  <StaggerItem key={trainer.id} className={styles.staggerItemWrapper}>
                    <div className={styles.trainerCard}>
                      
                      <div className={styles.cardHeader}>
                        <div className={styles.cardAvatar}>{trainer.name.charAt(0)}</div>
                        <div className={styles.cardHeaderInfo}>
                          <h3 className={styles.cardName}>{trainer.name}</h3>
                          <span className={styles.cardSpec}>{trainer.specialization}</span>
                        </div>
                      </div>
                      
                      <div className={styles.cardBody}>
                        <p className={styles.cardBio}>{trainer.bio}</p>

                        {trainerCourses.length > 0 && (
                          <div className={styles.cardCourses}>
                            <h4><BookOpen size={14} /> Courses</h4>
                            <div className={styles.coursesList}>
                              {trainerCourses.map((c) => (
                                <div key={c.id} className={styles.courseChip}>
                                  <span className={styles.courseChipLogo}>
                                    <img src={c.logo} alt="" style={{ width: '1em', height: '1em', objectFit: 'contain' }} />
                                  </span>
                                  <span>{c.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.statItem}>
                          <Award size={18} color="var(--accent-primary)" />
                          <div className={styles.statInfo}>
                            <strong>{trainer.experience}</strong>
                            <span>Experience</span>
                          </div>
                        </div>
                        <div className={styles.statItem}>
                          <Star size={18} color="var(--accent-warning)" />
                          <div className={styles.statInfo}>
                            <strong>{trainer.rating}</strong>
                            <span>Rating</span>
                          </div>
                        </div>
                        <div className={styles.statItem}>
                          <UsersIcon size={18} color="var(--accent-secondary)" />
                          <div className={styles.statInfo}>
                            <strong>{(trainer.name.charCodeAt(0) * 47) % 500 + 50}</strong>
                            <span>Students</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>
      </main>
    </>
  );
}
