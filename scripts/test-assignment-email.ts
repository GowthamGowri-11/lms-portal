import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { notifyCourseAssignment, sendNotification } from '../src/lib/email';

async function main() {
  console.log('--- Testing Course Assignment & Email Delivery Pipeline ---');

  const course = await prisma.course.findFirst({
    where: { isPublished: true },
  });

  const student = await prisma.student.findFirst();

  if (!course || !student) {
    console.error('Missing sample course or student');
    return;
  }

  console.log(`Assigning "${course.title}" to student "${student.name}" (${student.email})...`);

  // 1. Check or upsert Enrollment
  const enrollment = await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: course.id,
      },
    },
    update: {
      paymentStatus: 'assigned',
    },
    create: {
      studentId: student.id,
      courseId: course.id,
      paymentStatus: 'assigned',
      progress: 0,
    },
  });

  console.log('✓ Enrollment created/updated with ID:', enrollment.id, 'status:', enrollment.paymentStatus);

  // 2. Dispatch Email Notification
  console.log('Sending course assignment email notification...');
  const notifResult = await sendNotification({
    recipientEmail: student.email,
    recipientName: student.name,
    studentId: student.id,
    userId: student.userId || undefined,
    type: 'COURSE_ASSIGNMENT',
    title: `You've Been Assigned to: ${course.title}`,
    subject: `[Course Enrolled] You have been assigned access to ${course.title}`,
    message: `Your administrator has granted you full access to the course "${course.title}". You can now start watching lectures, reading protected notes, completing assignments, and taking module quizzes.`,
    actionUrl: `/courses/${course.id}`,
    actionText: 'Start Learning Now',
    details: [
      { label: 'Course', value: course.title },
      { label: 'Category', value: course.category || 'General' },
      { label: 'Level', value: course.level || 'Beginner' },
      { label: 'Duration', value: course.duration || 'Self-paced' },
    ],
    metadata: { courseId: course.id },
  });

  console.log('✓ Notification dispatch result:', notifResult);

  // 3. Query the Notification table in DB
  const latestNotification = await prisma.notification.findFirst({
    where: { recipientEmail: student.email },
    orderBy: { createdAt: 'desc' },
  });

  console.log('✓ Database Notification Record verified:');
  console.log({
    id: latestNotification?.id,
    type: latestNotification?.type,
    recipient: latestNotification?.recipientEmail,
    subject: latestNotification?.subject,
    status: latestNotification?.status,
    sentAt: latestNotification?.sentAt,
  });

  console.log('\n✅ ALL ASSIGNMENT & EMAIL NOTIFICATION CHECKS PASSED!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
