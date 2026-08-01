import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, targetId } = body;

    if (!['COURSE_ENROLLMENT', 'TRAINER_APPLICATION'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    // 1. Check if user is already a trainer (for trainer application)
    if (type === 'TRAINER_APPLICATION') {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      if (dbUser?.role === 'TRAINER') {
        return NextResponse.json({ error: 'You are already a trainer.' }, { status: 400 });
      }
    }

    // 2. Check if student is already enrolled in the course (for course enrollment)
    if (type === 'COURSE_ENROLLMENT' && targetId) {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
      if (student) {
        // Prevent duplicate enrollment
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: student.id,
              courseId: targetId,
            },
          },
        });
        if (enrollment) {
          return NextResponse.json({ error: 'You are already enrolled in this course.' }, { status: 400 });
        }

        // Enforce gating: requests are only for students who already have ≥1 active enrollments.
        // Students with 0 enrollments must use the direct-enroll endpoint instead.
        const activeCount = await prisma.enrollment.count({
          where: { studentId: student.id },
        });
        if (activeCount === 0) {
          return NextResponse.json(
            { error: 'You have no active enrollments. Please use the direct enroll option.' },
            { status: 400 }
          );
        }
      }
    }

    // 3. Check if there is already a pending or approved request of this type for this user/target
    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        userId: session.user.id,
        type,
        targetId: targetId || null,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingRequest) {
      const msg = existingRequest.status === 'PENDING'
        ? 'You already have a pending request for this.'
        : 'You are already approved for this.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const newRequest = await prisma.joinRequest.create({
      data: {
        userId: session.user.id,
        type,
        targetId: targetId || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error('Request Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
