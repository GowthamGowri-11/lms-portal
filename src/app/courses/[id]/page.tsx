import { prisma } from '@/lib/prisma';
import { parseCourse } from '@/lib/utils';
import CourseDetailClient from './CourseDetailClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import styles from './page.module.css';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const raw = await prisma.course.findUnique({ where: { id } });

  if (!raw) {
    return (
      <>
        <Navbar />
        <div className={styles.notFound}>
          <h2>Course not found</h2>
          <Link href="/courses" className="btn btn-primary">
            <ArrowLeft size={18} />
            Back to Courses
          </Link>
        </div>
      </>
    );
  }

  const course = parseCourse(raw);
  const trainer = await prisma.trainer.findUnique({ where: { id: raw.trainerId } });

  const modules = await prisma.module.findMany({
    where: { courseId: id },
    orderBy: { order: 'asc' },
    include: {
      lessons: { orderBy: { order: 'asc' } },
    },
  });

  return <CourseDetailClient course={course} trainer={trainer} modules={modules} />;
}
