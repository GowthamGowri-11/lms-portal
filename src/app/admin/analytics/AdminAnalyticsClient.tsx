'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, BookOpen } from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { CourseWithArrays } from '@/lib/utils';
import { Enrollment } from '@/generated/prisma/client';
import styles from './page.module.css';

export default function AdminAnalyticsClient({
  courses,
  enrollments
}: {
  courses: CourseWithArrays[],
  enrollments: Enrollment[]
}) {
  const totalRevenue = enrollments
    .filter((e) => e.paymentStatus === 'completed')
    .reduce((sum, e) => {
      const course = courses.find((c) => c.id === e.courseId);
      return sum + (course?.discountPrice || course?.price || 0);
    }, 0);

  const categoryStats = courses.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <PageTransition>
      <div className={styles.page}>
        <FadeInUp>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>
            Overview of platform performance and metrics.
          </p>
        </FadeInUp>

        <StaggerContainer className={styles.statsGrid}>
          {[
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign size={24} />, color: '#00b894' },
            { label: 'Active Enrollments', value: enrollments.length, icon: <TrendingUp size={24} />, color: '#6c5ce7' },
            { label: 'Course Completion Rate', value: `${Math.round((enrollments.filter((e) => e.progress === 100).length / Math.max(enrollments.length, 1)) * 100)}%`, icon: <BarChart3 size={24} />, color: '#fdcb6e' },
            { label: 'Avg Course Rating', value: (courses.reduce((sum, c) => sum + c.rating, 0) / Math.max(courses.length, 1)).toFixed(1), icon: <BookOpen size={24} />, color: '#fd79a8' },
          ].map((stat, i) => (
            <StaggerItem key={i}>
              <motion.div
                className={styles.statCard}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className={styles.iconWrapper} style={{ background: `${stat.color}18`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statAccent} style={{ background: stat.color }} />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeInUp delay={0.3}>
          <div className={styles.chartContainer}>
            <h2 className={styles.chartTitle}>Courses by Category</h2>
            <div className={styles.chartList}>
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className={styles.chartRow}>
                  <span className={styles.chartLabel}>{category}</span>
                  <div className={styles.progressBar}>
                    <motion.div
                      className={styles.progressFill}
                      initial={{ width: 0 }}
                      animate={{ width: `${((count as number) / courses.length) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span className={styles.chartValue}>{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>
      </div>
    </PageTransition>
  );
}
