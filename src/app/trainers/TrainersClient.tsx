'use client';

import { motion } from 'framer-motion';
import { Star, Users as UsersIcon, Award } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { Trainer, Course } from '@/generated/prisma/client';

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
                  <StaggerItem key={trainer.id}>
                    <div className={styles.trainerCard}>
                      <div className={styles.cardLeft}>
                        <div className={styles.cardAvatar}>{trainer.name.charAt(0)}</div>
                        <div className={styles.cardStats}>
                          <div className={styles.statItem}>
                            <Award size={16} />
                            <span>{trainer.experience} Exp</span>
                          </div>
                          <div className={styles.statItem}>
                            <Star size={16} />
                            <span>{trainer.rating} Rating</span>
                          </div>
                          <div className={styles.statItem}>
                            <UsersIcon size={16} />
                            <span>{(trainer.name.charCodeAt(0) * 47) % 500 + 50} Students</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={styles.cardRight}>
                        <div className={styles.cardHeader}>
                          <h3 className={styles.cardName}>{trainer.name}</h3>
                          <span className={styles.cardSpec}>{trainer.specialization}</span>
                        </div>
                        
                        <p className={styles.cardBio}>{trainer.bio}</p>

                        {trainerCourses.length > 0 && (
                          <div className={styles.cardCourses}>
                            <h4>Courses by {trainer.name.split(' ')[0]}</h4>
                            <div className={styles.coursesList}>
                              {trainerCourses.map((c) => (
                                <div key={c.id} className={styles.courseChip}>
                                  <span className={styles.courseChipLogo}>{c.logo}</span>
                                  <span>{c.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
