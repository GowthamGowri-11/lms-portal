import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseCourse } from '@/lib/utils';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

const toIso = (d: any) => {
  if (!d) return new Date().toISOString();
  if (d instanceof Date) return d.toISOString();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  const [
    coursesRaw,
    trainers,
    students,
    enrollments,
    lessons,
    users,
    developers,
    courseProgress,
  ] = await Promise.all([
    prisma.course.findMany({
      include: { trainer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.trainer.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.student.findMany({
      include: { user: { select: { isOnboarded: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.enrollment.findMany({ orderBy: { enrolledAt: 'desc' } }),
    prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        module: { select: { course: { select: { isPublished: true } } } },
      },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, image: true, createdAt: true, isOnboarded: true },
    }),
    prisma.developer.findMany({ select: { id: true, name: true, createdAt: true } }),
    prisma.courseProgress.findMany({
      select: { courseId: true, percentage: true, isCompleted: true, studentId: true },
    }),
  ]);

  const courses = coursesRaw.map((c) => {
    const parsed = parseCourse(c);
    return {
      id: parsed.id,
      title: parsed.title,
      logo: parsed.logo,
      category: parsed.category,
      isPublished: parsed.isPublished,
      trainerId: parsed.trainerId,
      trainerName: c.trainer?.name || 'Unassigned',
      studentsEnrolled: parsed.studentsEnrolled,
      price: parsed.price,
      discountPrice: parsed.discountPrice,
      createdAt: toIso(parsed.createdAt),
      lessonsCount: parsed.lessonsCount,
    };
  });

  return (
    <AdminDashboardClient
      admin={{
        name: session?.user?.name || 'Administrator',
        email: session?.user?.email || '',
        image: session?.user?.image || '',
      }}
      courses={courses}
      trainers={trainers.map((t) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        createdAt: toIso(t.createdAt),
      }))}
      students={students.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        avatar: s.avatar,
        createdAt: toIso(s.createdAt),
        isOnboarded: s.user?.isOnboarded ?? true,
      }))}
      enrollments={enrollments.map((e) => ({
        id: e.id,
        studentId: e.studentId,
        courseId: e.courseId,
        paymentStatus: e.paymentStatus,
        progress: e.progress,
        enrolledAt: toIso(e.enrolledAt),
      }))}
      lessons={lessons.map((l) => ({
        id: l.id,
        title: l.title,
        createdAt: toIso(l.createdAt),
        coursePublished: l.module?.course?.isPublished ?? false,
      }))}
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: toIso(u.createdAt),
        isOnboarded: u.isOnboarded,
      }))}
      developers={developers.map((d) => ({
        id: d.id,
        name: d.name,
        createdAt: toIso(d.createdAt),
      }))}
      courseProgress={courseProgress}
    />
  );
}
