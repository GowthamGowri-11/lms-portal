'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import styles from './PremiumLockScreen.module.css';

export default function PremiumLockScreen({
  course,
  studentId,
}: {
  course: { id: string; title: string; logo: string; price: number; discountPrice: number | null };
  studentId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to enroll');
      }
    } catch (err) {
      console.error(err);
      alert('Error enrolling');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.lockIconContainer}>
            <Lock size={40} className={styles.lockIcon} />
          </div>
          <span className={styles.courseLogo}>{course.logo}</span>
          <h1 className={styles.title}>{course.title}</h1>
          <p className={styles.subtitle}>This course is locked.</p>
          <p className={styles.desc}>Purchase this course to continue and unlock all lessons, coding practice, and quizzes.</p>
          
          <div className={styles.priceContainer}>
            {course.discountPrice ? (
              <>
                <span className={styles.oldPrice}>₹{course.price}</span>
                <span className={styles.currentPrice}>₹{course.discountPrice}</span>
              </>
            ) : (
              <span className={styles.currentPrice}>₹{course.price}</span>
            )}
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleEnroll} disabled={loading}>
            {loading ? 'Unlocking...' : 'Unlock Course (Free Demo)'}
          </button>

          <Link href="/courses" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Courses
          </Link>
        </div>
      </div>
    </>
  );
}
