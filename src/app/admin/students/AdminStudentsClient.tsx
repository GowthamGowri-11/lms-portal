'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Mail, BookOpen, Award } from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { CourseWithArrays } from '@/lib/utils';
import { Student, Enrollment } from '@/generated/prisma/client';

export default function AdminStudentsClient({
  students,
  courses,
  enrollments
}: {
  students: Student[],
  courses: CourseWithArrays[],
  enrollments: Enrollment[]
}) {
  return (
    <PageTransition>
      <div className={styles.page}>
        <FadeInUp>
          <div className={styles.header}>
            <h1 className={styles.title}>Students</h1>
            <p className={styles.subtitle}>View enrolled students and their progress.</p>
          </div>
        </FadeInUp>

        <StaggerContainer className={styles.studentsGrid}>
          {students.map((student) => {
            const studentEnrollments = enrollments.filter((e) => e.studentId === student.id);
            const enrolledCoursesCount = studentEnrollments.length;
            const completedCoursesCount = studentEnrollments.filter(e => e.progress === 100).length;

            return (
              <StaggerItem key={student.id}>
                <motion.div
                  className={styles.studentCard}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className={styles.studentAvatar}>{student.name.charAt(0)}</div>
                  <h3 className={styles.studentName}>{student.name}</h3>
                  <div className={styles.studentEmail}>
                    <Mail size={14} />
                    <span>{student.email}</span>
                  </div>
                  <div className={styles.studentStats}>
                    <div>
                      <BookOpen size={16} />
                      <strong>{enrolledCoursesCount}</strong>
                      <span>Enrolled</span>
                    </div>
                    <div>
                      <Award size={16} />
                      <strong>{completedCoursesCount}</strong>
                      <span>Completed</span>
                    </div>
                  </div>
                  <div className={styles.enrolledList}>
                    {studentEnrollments.map((enrollment) => {
                      const course = courses.find((c) => c.id === enrollment.courseId);
                      return (
                        <div key={enrollment.id} className={styles.enrolledItem}>
                          <span>
                            <img src={course?.logo} alt="" style={{ width: '1em', height: '1em', objectFit: 'contain', verticalAlign: 'middle', marginRight: '4px' }} /> {course?.title}
                          </span>
                          <div className={styles.progressBar}>
                            <motion.div
                              className={styles.progressFill}
                              initial={{ width: 0 }}
                              animate={{ width: `${enrollment.progress}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                          <span className={styles.progressText}>{enrollment.progress}%</span>
                        </div>
                      );
                    })}
                    {studentEnrollments.length === 0 && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                        No courses enrolled yet.
                      </p>
                    )}
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {students.length === 0 && (
          <FadeInUp>
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <p>No students have registered yet.</p>
            </div>
          </FadeInUp>
        )}
      </div>
    </PageTransition>
  );
}
