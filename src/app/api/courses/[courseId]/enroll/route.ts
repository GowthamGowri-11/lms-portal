import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const { studentId } = await req.json();

  if (!studentId) {
    return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
  }

  // Create enrollment record
  const enrollment = await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
    update: {
      paymentStatus: 'completed',
    },
    create: {
      studentId,
      courseId,
      paymentStatus: 'completed',
      progress: 0,
    },
  });

  // Calculate total lessons in this course
  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
  });

  // Initialize course progress
  await prisma.courseProgress.upsert({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
    update: {
      totalLessons: lessons.length,
    },
    create: {
      studentId,
      courseId,
      completedLessons: 0,
      totalLessons: lessons.length,
      percentage: 0,
      isCompleted: false,
    },
  });

  return NextResponse.json({ ok: true, enrollment });
}
