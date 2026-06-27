'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, BookOpen } from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { CourseWithArrays } from '@/lib/utils';
import { Enrollment } from '@/generated/prisma/client';

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
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <FadeInUp>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Overview of platform performance and metrics.
          </p>
        </FadeInUp>

        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign size={24} />, color: '#00b894' },
            { label: 'Active Enrollments', value: enrollments.length, icon: <TrendingUp size={24} />, color: '#6c5ce7' },
            { label: 'Course Completion Rate', value: `${Math.round((enrollments.filter((e) => e.progress === 100).length / Math.max(enrollments.length, 1)) * 100)}%`, icon: <BarChart3 size={24} />, color: '#fdcb6e' },
            { label: 'Avg Course Rating', value: (courses.reduce((sum, c) => sum + c.rating, 0) / Math.max(courses.length, 1)).toFixed(1), icon: <BookOpen size={24} />, color: '#fd79a8' },
          ].map((stat, i) => (
            <StaggerItem key={i}>
              <motion.div
                style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${stat.color}18`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  {stat.icon}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{stat.label}</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: stat.color, opacity: 0.5 }} />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeInUp delay={0.3}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Courses by Category</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ minWidth: 140, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{category}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 99, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: 99, background: 'var(--gradient-accent)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${((count as number) / courses.length) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: 20, textAlign: 'right' }}>{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>
      </div>
    </PageTransition>
  );
}
