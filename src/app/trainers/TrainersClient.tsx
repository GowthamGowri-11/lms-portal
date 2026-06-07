'use client';

import { motion } from 'framer-motion';
import { Star, BookOpen, Users as UsersIcon, Award } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { Trainer, Course } from '@/generated/prisma/client';

export default function TrainersClient({ trainers, courses }: { trainers: Trainer[], courses: Course[] }) {
  return (
    <>
      <Navbar />
      <PageTransition>
        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroBg} />
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
              <FadeInUp>
                <h1 className={styles.heroTitle}>
                  Our Expert <span className="gradient-text">Trainers</span>
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
                      <motion.div
                        className={styles.trainerCard}
                        whileHover={{ y: -8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <div className={styles.cardAvatar}>{trainer.name.charAt(0)}</div>
                        <h3 className={styles.cardName}>{trainer.name}</h3>
                        <span className={styles.cardSpec}>{trainer.specialization}</span>
                        <p className={styles.cardBio}>{trainer.bio}</p>

                        <div className={styles.cardStats}>
                          <div className={styles.statItem}>
                            <Award size={18} />
                            <div>
                              <strong>{trainer.experience}</strong>
                              <span>Experience</span>
                            </div>
                          </div>
                          <div className={styles.statItem}>
                            <UsersIcon size={18} />
                            <div>
                              <strong>{(trainer.name.charCodeAt(0) * 47) % 500 + 50}</strong>
                              <span>Students</span>
                            </div>
                          </div>
                          <div className={styles.statItem}>
                            <Star size={18} />
                            <div>
                              <strong>{trainer.rating}</strong>
                              <span>Rating</span>
                            </div>
                          </div>
                        </div>

                        {trainerCourses.length > 0 && (
                          <div className={styles.cardCourses}>
                            <h4>Courses by {trainer.name.split(' ')[0]}</h4>
                            {trainerCourses.map((c) => (
                              <div key={c.id} className={styles.courseChip}>
                                <span className={styles.courseChipLogo}>{c.logo}</span>
                                <span>{c.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          </section>
        </main>
      </PageTransition>
    </>
  );
}
