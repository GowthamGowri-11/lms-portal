'use client';

import Navbar from '@/components/ui/Navbar';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import TrainerCard from '@/components/ui/TrainerCard';
import JoinRequestButton from '@/components/ui/JoinRequestButton';
import Footer from '@/components/ui/Footer';
import styles from './page.module.css';
import { Trainer } from '@/generated/prisma/client';

export default function TrainersClient({
  trainers,
  courses,
}: {
  trainers: Trainer[];
  courses: { id: string; title: string; logo: string; trainerId: string; isPublished: boolean }[];
}) {
  // Only show published courses on public page
  const publishedCourses = courses.filter((c) => c.isPublished);

  return (
    <PageTransition>
      <Navbar />
      <main className={styles.main}>
        {/* ── HERO — untouched ── */}
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
              <div style={{ marginTop: '2rem' }}>
                <JoinRequestButton 
                  type="TRAINER_APPLICATION" 
                  label="Join as Trainer" 
                  className="btn btn-primary btn-lg" 
                />
              </div>
            </FadeInUp>
          </div>
        </section>

        {/* ── TRAINER CARDS ── */}
        <section className={styles.trainersSection}>
          <div className="container">
            <StaggerContainer className={styles.trainersGrid}>
              {trainers.map((trainer) => (
                <StaggerItem key={trainer.id}>
                  <TrainerCard
                    trainer={trainer}
                    courses={publishedCourses}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>

            {trainers.length === 0 && (
              <FadeInUp>
                <div style={{
                  textAlign: 'center', padding: '4rem 2rem',
                  color: 'rgba(255,255,255,0.3)', fontSize: '0.95rem',
                }}>
                  No trainers available yet.
                </div>
              </FadeInUp>
            )}
          </div>
        </section>
        <Footer />
      </main>
    </PageTransition>
  );
}
