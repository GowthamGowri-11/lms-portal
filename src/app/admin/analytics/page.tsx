import { prisma } from '@/lib/prisma';
import { parseCourse } from '@/lib/utils';
import AdminAnalyticsClient from './AdminAnalyticsClient';

export default async function AdminAnalyticsPage() {
  const raw = await prisma.course.findMany();
  const courses = raw.map(parseCourse);
  const enrollments = await prisma.enrollment.findMany();

  return <AdminAnalyticsClient courses={courses} enrollments={enrollments} />;
}
