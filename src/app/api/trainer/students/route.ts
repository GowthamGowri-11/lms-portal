import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized: Trainer role required' }, { status: 401 });
    }

    const trainer = await prisma.trainer.findUnique({
      where: { userId: session.user.id },
    });

    if (!trainer) {
      return NextResponse.json({ error: 'Forbidden: Trainer profile not found' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetCourseId = searchParams.get('courseId');

    if (targetCourseId) {
      const course = await prisma.course.findUnique({
        where: { id: targetCourseId },
        select: { id: true, title: true, trainerId: true },
      });

      if (!course || course.trainerId !== trainer.id) {
        return NextResponse.json({ error: 'Forbidden: Course does not belong to this trainer' }, { status: 403 });
      }

      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: targetCourseId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      });

      return NextResponse.json({
        courseId: course.id,
        courseTitle: course.title,
        studentsCount: enrollments.length,
        students: enrollments.map((e) => ({
          studentId: e.student.id,
          name: e.student.name,
          email: e.student.email,
          avatar: e.student.avatar,
          progress: e.progress,
          enrolledAt: e.enrolledAt,
        })),
      });
    }

    // Fetch all courses belonging to this trainer with enrolled students
    const courses = await prisma.course.findMany({
      where: { trainerId: trainer.id },
      include: {
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = courses.map((c) => ({
      courseId: c.id,
      courseTitle: c.title,
      studentsCount: c.enrollments.length,
      students: c.enrollments.map((e) => ({
        studentId: e.student.id,
        name: e.student.name,
        email: e.student.email,
        avatar: e.student.avatar,
        progress: e.progress,
        enrolledAt: e.enrolledAt,
      })),
    }));

    return NextResponse.json({
      trainerId: trainer.id,
      trainerName: trainer.name,
      courses: result,
    });
  } catch (error) {
    console.error('Trainer Students API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
