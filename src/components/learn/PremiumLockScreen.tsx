'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import TiltCard from '@/components/animations/TiltCard';
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
      <div className={styles.container} style={{ perspective: '1500px' }}>
        <TiltCard className={styles.card}>
          <div className={styles.lockIconContainer} style={{ transform: 'translateZ(40px)' }}>
            <Lock size={40} className={styles.lockIcon} />
          </div>
          <span className={styles.courseLogo} style={{ transform: 'translateZ(30px)' }}>
            <img src={course.logo} alt="" style={{ width: '1em', height: '1em', objectFit: 'contain' }} />
          </span>
          <h1 className={styles.title} style={{ transform: 'translateZ(25px)' }}>{course.title}</h1>
          <p className={styles.subtitle} style={{ transform: 'translateZ(20px)' }}>This course is locked.</p>
          <p className={styles.desc} style={{ transform: 'translateZ(15px)' }}>Purchase this course to continue and unlock all lessons, coding practice, and quizzes.</p>
          
          <div className={styles.priceContainer} style={{ transform: 'translateZ(25px)' }}>
            {course.discountPrice ? (
              <>
                <span className={styles.oldPrice}>₹{course.price}</span>
                <span className={styles.currentPrice}>₹{course.discountPrice}</span>
              </>
            ) : (
              <span className={styles.currentPrice}>₹{course.price}</span>
            )}
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', transform: 'translateZ(35px)' }} onClick={handleEnroll} disabled={loading}>
            {loading ? 'Unlocking...' : 'Unlock Course (Free Demo)'}
          </button>

          <Link href="/courses" className={styles.backLink} style={{ transform: 'translateZ(10px)' }}>
            <ArrowLeft size={16} /> Back to Courses
          </Link>
        </TiltCard>
      </div>
    </>
  );
}
