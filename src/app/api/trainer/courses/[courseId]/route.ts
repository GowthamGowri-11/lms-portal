import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Verify trainer owns this course
async function verifyTrainerOwnership(userId: string, courseId: string) {
  const trainer = await prisma.trainer.findUnique({ where: { userId } });
  if (!trainer) return null;
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.trainerId !== trainer.id) return null;
  return { trainer, course };
}

// GET: Course details for trainer
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;
    const ownership = await verifyTrainerOwnership(session.user.id, courseId);
    if (!ownership) return NextResponse.json({ error: 'Forbidden - Not your course' }, { status: 403 });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' } } },
        },
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error('GET /api/trainer/courses/[courseId] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update course details (title, description, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;
    const ownership = await verifyTrainerOwnership(session.user.id, courseId);
    if (!ownership) return NextResponse.json({ error: 'Forbidden - Not your course' }, { status: 403 });

    const body = await req.json();
    const { title, description, shortDescription, category, level, duration, tags, syllabus, isPublished } = body;

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(category && { category }),
        ...(level && { level }),
        ...(duration && { duration }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(syllabus !== undefined && { syllabus: JSON.stringify(syllabus) }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({ course: updated });
  } catch (error) {
    console.error('PATCH /api/trainer/courses/[courseId] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
