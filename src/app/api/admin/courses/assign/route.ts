import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyCourseAssignment } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session?.user?.id || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { courseId, studentIds } = body;

    if (!courseId || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: courseId and a non-empty array of studentIds are required.' },
        { status: 400 }
      );
    }

    // 1. Verify course existence
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    const totalLessons = course.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);

    // 2. Fetch target students
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
      },
    });

    if (students.length === 0) {
      return NextResponse.json({ error: 'No matching students found.' }, { status: 404 });
    }

    let newlyAssigned = 0;
    let alreadyEnrolled = 0;
    const notificationsQueued: string[] = [];

    for (const student of students) {
      // Check for existing enrollment
      const existing = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id,
          },
        },
      });

      if (existing) {
        // If already enrolled but pending, update to assigned
        if (existing.paymentStatus !== 'completed' && existing.paymentStatus !== 'assigned') {
          await prisma.enrollment.update({
            where: { id: existing.id },
            data: { paymentStatus: 'assigned' },
          });
          newlyAssigned++;
        } else {
          alreadyEnrolled++;
          continue;
        }
      } else {
        // Create new enrollment
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            courseId: course.id,
            paymentStatus: 'assigned',
            progress: 0,
          },
        });
        newlyAssigned++;
      }

      // Ensure CourseProgress record exists
      await prisma.courseProgress.upsert({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id,
          },
        },
        create: {
          studentId: student.id,
          courseId: course.id,
          completedLessons: 0,
          totalLessons,
          percentage: 0,
        },
        update: {
          totalLessons,
        },
      });

      // Dispatch async email notification
      notifyCourseAssignment({
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          userId: student.userId,
        },
        course: {
          id: course.id,
          title: course.title,
          category: course.category,
          level: course.level,
          duration: course.duration,
        },
      });

      notificationsQueued.push(student.email);
    }

    return NextResponse.json({
      success: true,
      message: `Course assigned successfully to ${newlyAssigned} student(s).`,
      newlyAssigned,
      alreadyEnrolled,
      notificationsQueued,
    });
  } catch (err: any) {
    console.error('[Assign Course Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to assign course to students.' },
      { status: 500 }
    );
  }
}
