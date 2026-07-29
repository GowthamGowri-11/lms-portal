import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST — Student submits a retake request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { studentId, quizId } = await req.json();
    if (!studentId || !quizId) return NextResponse.json({ error: 'Missing studentId or quizId' }, { status: 400 });

    // Check if there's already a PENDING request
    const existing = await prisma.quizRetakeRequest.findFirst({
      where: { studentId, quizId, status: 'PENDING' },
    });
    if (existing) return NextResponse.json({ error: 'Request already pending' }, { status: 409 });

    const request = await prisma.quizRetakeRequest.create({
      data: { studentId, quizId },
    });

    return NextResponse.json(request);
  } catch (err) {
    console.error('POST /api/quizzes/retake-request error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH — Admin or Trainer approves/rejects a retake request
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'ADMIN' && role !== 'TRAINER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, status } = await req.json();
    if (!id || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const retakeReq = await prisma.quizRetakeRequest.findUnique({ where: { id } });
    if (!retakeReq || retakeReq.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request not found or already resolved' }, { status: 404 });
    }

    // Update this request
    const updated = await prisma.quizRetakeRequest.update({
      where: { id },
      data: {
        status,
        resolvedBy: session.user.id,
        resolvedAt: new Date(),
      },
    });

    // If approved, auto-remove any other PENDING requests for the same student+quiz
    if (status === 'APPROVED') {
      await prisma.quizRetakeRequest.updateMany({
        where: {
          studentId: retakeReq.studentId,
          quizId: retakeReq.quizId,
          status: 'PENDING',
          id: { not: id },
        },
        data: {
          status: 'RESOLVED_AUTO',
          resolvedAt: new Date(),
        },
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/quizzes/retake-request error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET — Fetch pending retake requests (filtered for trainer's courses, all for admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'ADMIN' && role !== 'TRAINER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let where: any = { status: 'PENDING' };

    // If trainer, only show requests for their courses
    if (role === 'TRAINER') {
      const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
      if (!trainer) return NextResponse.json([]);
      const trainerCourses = await prisma.course.findMany({
        where: { trainerId: trainer.id },
        select: { id: true },
      });
      const courseIds = trainerCourses.map((c) => c.id);
      where = {
        status: 'PENDING',
        quiz: { courseId: { in: courseIds } },
      };
    }

    const requests = await prisma.quizRetakeRequest.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        quiz: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json(requests);
  } catch (err) {
    console.error('GET /api/quizzes/retake-request error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
