import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  // --- Auth guard ---
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Require onboarding (same check as JoinRequestButton)
  if (!(session.user as any).isOnboarded && (session.user as any).role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Please complete your profile onboarding first.' },
      { status: 403 }
    );
  }

  // --- Check course validity & assigned trainer ---
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, isPublished: true, trainerId: true },
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  }

  if (!course.trainerId) {
    return NextResponse.json(
      { error: 'No trainer assigned to this course yet.' },
      { status: 400 }
    );
  }

  // --- Resolve student profile ---
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) {
    return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
  }

  // --- Race-condition safe: only allow direct enroll when count = 0 ---
  const activeCount = await prisma.enrollment.count({
    where: { studentId: student.id },
  });

  if (activeCount > 0) {
    return NextResponse.json(
      { error: 'You already have active enrollments. Please request admin approval instead.' },
      { status: 403 }
    );
  }

  // --- Prevent duplicate enrollment ---
  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: { studentId: student.id, courseId },
    },
  });
  if (existing) {
    return NextResponse.json({ error: 'Already enrolled in this course.' }, { status: 400 });
  }

  // --- Count lessons for progress initialization ---
  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
  });

  // --- Atomically create enrollment + course progress ---
  await prisma.$transaction(async (tx) => {
    await tx.enrollment.create({
      data: {
        studentId: student.id,
        courseId,
        paymentStatus: 'completed',
        progress: 0,
      },
    });

    await tx.courseProgress.upsert({
      where: {
        studentId_courseId: { studentId: student.id, courseId },
      },
      update: { totalLessons: lessons.length },
      create: {
        studentId: student.id,
        courseId,
        completedLessons: 0,
        totalLessons: lessons.length,
        percentage: 0,
        isCompleted: false,
      },
    });
  });

  return NextResponse.json({ ok: true, message: 'Successfully enrolled' });
}


