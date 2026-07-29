import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH: Update lesson content - only if trainer owns the parent course
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId } = await params;

    // Verify trainer owns the course this lesson belongs to
    const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
    if (!trainer) return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    if (lesson.module.course.trainerId !== trainer.id) {
      return NextResponse.json({ error: 'Forbidden - Not your course' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, videoUrl, notes, duration, isFree } = body;

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(notes !== undefined && { notes }),
        ...(duration !== undefined && { duration }),
        ...(isFree !== undefined && { isFree }),
      },
    });

    return NextResponse.json({ lesson: updated });
  } catch (error) {
    console.error('PATCH /api/trainer/lessons/[lessonId] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
