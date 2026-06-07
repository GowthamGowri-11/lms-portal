import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Star,
  Play,
  CheckCircle,
  TrendingUp,
  Zap,
  Globe,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import {
  FadeInUp,
  ScrollReveal,
  FloatingElement,
  StaggerContainer,
  StaggerItem,
} from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' }
  });
  
  const trainers = await prisma.trainer.findMany();
  
  const totalStudents = courses.reduce((sum, c) => sum + c.studentsEnrolled, 0);

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* ===== HERO SECTION ===== */}
        <section className={styles.hero}>
          <div className={styles.heroBgOrbs}>
            <div className={`bg-orb bg-orb-1`} />
            <div className={`bg-orb bg-orb-2`} />
            <div className={`bg-orb bg-orb-3`} />
          </div>

          <div className={styles.gridLines} />

          <div className={styles.heroContent}>
            <FadeInUp delay={0.1}>
              <div className={styles.heroBadge}>
                <Zap size={14} />
                <span>Upgrade your skills with expert-led courses</span>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <h1 className={styles.heroTitle}>
                Master the Skills
                <br />
                <span className="gradient-text">That Matter Most</span>
              </h1>
            </FadeInUp>

            <FadeInUp delay={0.3}>
              <p className={styles.heroDescription}>
                Join thousands of learners advancing their careers with world-class
                courses in Web Development, UI/UX Design, Data Science, and more.
                Learn from industry experts at your own pace.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.4}>
              <div className={styles.heroActions}>
                <Link href="/courses" className="btn btn-primary btn-lg">
                  <BookOpen size={20} />
                  Explore Courses
                  <ArrowRight size={18} />
                </Link>
                <button className="btn btn-secondary btn-lg">
                  <Play size={18} />
                  Watch Demo
                </button>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.5}>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>{courses.length}+</span>
                  <span className={styles.heroStatLabel}>Courses</span>
                </div>
                <div className={styles.heroStatDivider} />
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>{totalStudents.toLocaleString()}+</span>
                  <span className={styles.heroStatLabel}>Students</span>
                </div>
                <div className={styles.heroStatDivider} />
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>{trainers.length}+</span>
                  <span className={styles.heroStatLabel}>Expert Trainers</span>
                </div>
                <div className={styles.heroStatDivider} />
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>4.9</span>
                  <span className={styles.heroStatLabel}>Avg Rating</span>
                </div>
              </div>
            </FadeInUp>
          </div>

          <FloatingElement className={styles.floatingCard1} duration={4} distance={15}>
            <div className={styles.floatingCardInner}>
              <Award size={24} className={styles.floatingIcon} />
              <span>Certified</span>
            </div>
          </FloatingElement>

          <FloatingElement className={styles.floatingCard2} duration={5} distance={12}>
            <div className={styles.floatingCardInner}>
              <TrendingUp size={24} className={styles.floatingIcon} />
              <span>Career Growth</span>
            </div>
          </FloatingElement>

          <FloatingElement className={styles.floatingCard3} duration={3.5} distance={10}>
            <div className={styles.floatingCardInner}>
              <Globe size={24} className={styles.floatingIcon} />
              <span>Learn Anywhere</span>
            </div>
          </FloatingElement>
        </section>

        {/* ===== FEATURED COURSES ===== */}
        <section className={`section ${styles.coursesSection}`}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>Popular Courses</span>
                <h2 className={styles.sectionTitle}>
                  Explore Our <span className="gradient-text">Featured Courses</span>
                </h2>
                <p className={styles.sectionSubtitle}>
                  Handpicked courses designed by industry experts to help you achieve your goals.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className={styles.coursesGrid}>
              {courses.slice(0, 4).map((course) => {
                const trainer = trainers.find((t) => t.id === course.trainerId);
                return (
                  <StaggerItem key={course.id}>
                    <Link href={`/courses/${course.id}`} className={styles.courseCard}>
                      <div className={styles.courseCardTop}>
                        <div className={styles.courseLogo}>{course.logo}</div>
                        <div className={styles.courseLevel}>
                          <span className={`badge badge-primary`}>{course.level}</span>
                        </div>
                      </div>
                      <div className={styles.courseCardBody}>
                        <span className={styles.courseCategory}>{course.category}</span>
                        <h3 className={styles.courseTitle}>{course.title}</h3>
                        <p className={styles.courseDesc}>{course.shortDescription}</p>
                        <div className={styles.courseMeta}>
                          <div className={styles.courseRating}>
                            <Star size={14} fill="#fdcb6e" stroke="#fdcb6e" />
                            <span>{course.rating}</span>
                          </div>
                          <span className={styles.courseDot}>•</span>
                          <span>{course.duration}</span>
                          <span className={styles.courseDot}>•</span>
                          <span>{course.lessonsCount} lessons</span>
                        </div>
                        {trainer && (
                          <div className={styles.courseTrainer}>
                            <div className={styles.trainerAvatar}>
                              {trainer.name.charAt(0)}
                            </div>
                            <span>{trainer.name}</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.courseCardFooter}>
                        <div className={styles.coursePrice}>
                          {course.discountPrice ? (
                            <>
                              <span className={styles.priceOld}>₹{course.price}</span>
                              <span className={styles.priceCurrent}>₹{course.discountPrice}</span>
                            </>
                          ) : (
                            <span className={styles.priceCurrent}>₹{course.price}</span>
                          )}
                        </div>
                        <span className={styles.enrollBtn}>
                          Enroll Now <ArrowRight size={16} />
                        </span>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            <ScrollReveal>
              <div className={styles.sectionCTA}>
                <Link href="/courses" className="btn btn-secondary btn-lg">
                  View All Courses
                  <ArrowRight size={18} />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ===== WHY CHOOSE US ===== */}
        <section className={`section ${styles.whySection}`}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>Why GM Training</span>
                <h2 className={styles.sectionTitle}>
                  Why Learners <span className="gradient-text">Choose Us</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className={styles.whyGrid}>
              {[
                {
                  icon: <Award size={28} />,
                  title: 'Industry-Recognized Certificates',
                  desc: 'Earn certificates valued by top employers worldwide upon course completion.',
                  color: '#6c5ce7',
                },
                {
                  icon: <Users size={28} />,
                  title: 'Expert Trainers',
                  desc: 'Learn from professionals with 10+ years of real-world experience.',
                  color: '#00cec9',
                },
                {
                  icon: <CheckCircle size={28} />,
                  title: 'Project-Based Learning',
                  desc: 'Build real projects that you can showcase in your portfolio.',
                  color: '#fd79a8',
                },
                {
                  icon: <Globe size={28} />,
                  title: 'Learn Anywhere, Anytime',
                  desc: 'Access your courses on any device, at your own pace.',
                  color: '#fdcb6e',
                },
              ].map((item, i) => (
                <ScrollReveal key={i}>
                  <div className={styles.whyCard}>
                    <div
                      className={styles.whyIcon}
                      style={{ background: `${item.color}15`, color: item.color }}
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

        {/* ===== TRAINERS SECTION ===== */}
        <section className={`section ${styles.trainersSection}`}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>Expert Team</span>
                <h2 className={styles.sectionTitle}>
                  Meet Our <span className="gradient-text">Expert Trainers</span>
                </h2>
              </div>
            </ScrollReveal>

            <StaggerContainer className={styles.trainersGrid}>
              {trainers.map((trainer) => (
                <StaggerItem key={trainer.id}>
                  <div className={styles.trainerCard}>
                    <div className={styles.trainerAvatarLg}>
                      {trainer.name.charAt(0)}
                    </div>
                    <h3 className={styles.trainerName}>{trainer.name}</h3>
                    <span className={styles.trainerSpec}>{trainer.specialization}</span>
                    <div className={styles.trainerStats}>
                      <div>
                        <strong>{trainer.experience}</strong>
                        <span>Experience</span>
                      </div>
                      <div>
                        <strong>{Math.floor(Math.random() * 500) + 50}</strong>
                        <span>Students</span>
                      </div>
                      <div>
                        <strong>{trainer.rating}</strong>
                        <span>Rating</span>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section className={`section ${styles.ctaSection}`}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.ctaCard}>
                <div className={styles.ctaOrb1} />
                <div className={styles.ctaOrb2} />
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
                  GM <span className="gradient-text">Training</span>
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
              <span>© 2024 GM Training. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
