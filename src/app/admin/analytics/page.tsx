import { prisma } from '@/lib/prisma';
import AdminAnalyticsClient from './AdminAnalyticsClient';

export default async function AdminAnalyticsPage() {
  const courses = await prisma.course.findMany();
  const enrollments = await prisma.enrollment.findMany();

  return <AdminAnalyticsClient courses={courses} enrollments={enrollments} />;
}
