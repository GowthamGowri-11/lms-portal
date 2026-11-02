import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('--- Verifying LMS Database State ---');

  const courseCount = await prisma.course.count();
  const publishedCourses = await prisma.course.count({ where: { isPublished: true } });
  const draftCourses = await prisma.course.count({ where: { isPublished: false } });
  const studentsCount = await prisma.student.count();
  const enrollmentsCount = await prisma.enrollment.count();
  const notificationsCount = await prisma.notification.count();

  console.log({
    courseCount,
    publishedCourses,
    draftCourses,
    studentsCount,
    enrollmentsCount,
    notificationsCount,
  });

  const sampleCourse = await prisma.course.findFirst({
    include: { trainer: true },
  });
  console.log('Sample course:', sampleCourse?.title, '| Category:', sampleCourse?.category, '| Published:', sampleCourse?.isPublished);

  const sampleStudent = await prisma.student.findFirst();
  console.log('Sample student:', sampleStudent?.name, '| Email:', sampleStudent?.email);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
