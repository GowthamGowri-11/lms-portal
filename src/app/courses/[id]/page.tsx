import { prisma } from '@/lib/prisma';
import { parseCourse } from '@/lib/utils';
import CourseDetailClient from './CourseDetailClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import styles from './page.module.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return { title: 'Course Not Found – ATLYX' };

  return {
    title: `${course.title} – ATLYX`,
    description: course.shortDescription || course.description || `Learn ${course.title} on ATLYX.`,
    alternates: {
      canonical: `https://lms-portal-ruby.vercel.app/courses/${id}`,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

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

  let enrollmentStatus = 'NONE'; // NONE, PENDING, ENROLLED, REJECTED
  let activeEnrollmentCount = 0;

  if (session?.user?.id) {
    // Find or resolve student profile
    const student = await prisma.student.findUnique({ where: { userId: session.user.id } });

    if (student) {
      // Count all active enrollments for this student
      activeEnrollmentCount = await prisma.enrollment.count({
        where: { studentId: student.id },
      });

      // Check if already enrolled in THIS course
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: id,
          },
        },
      });
      if (enrollment) enrollmentStatus = 'ENROLLED';
    }

    // If not enrolled, check request status for THIS course
    if (enrollmentStatus === 'NONE') {
      const request = await prisma.joinRequest.findFirst({
        where: {
          userId: session.user.id,
          targetId: id,
          type: 'COURSE_ENROLLMENT',
        },
        orderBy: { createdAt: 'desc' },
      });
      if (request?.status === 'PENDING') enrollmentStatus = 'PENDING';
      else if (request?.status === 'REJECTED') enrollmentStatus = 'REJECTED';
    }
  }

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDescription || course.description,
    provider: {
      '@type': 'Organization',
      name: 'ATLYX',
      sameAs: 'https://lms-portal-ruby.vercel.app',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <CourseDetailClient
        course={course}
        trainer={trainer}
        modules={modules}
        enrollmentStatus={enrollmentStatus}
        activeEnrollmentCount={activeEnrollmentCount}
      />
    </>
  );
}
