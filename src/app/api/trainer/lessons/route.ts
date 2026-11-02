import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST: Create a new lesson under a module
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
    if (!trainer) return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });

    const body = await req.json();
    const { moduleId, title, description, videoUrl, notes, duration, isFree } = body;

    if (!moduleId || !title?.trim()) {
      return NextResponse.json({ error: 'moduleId and title are required' }, { status: 400 });
    }

    // Verify trainer owns the course for this module
    const moduleRecord = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: true,
        lessons: {
          orderBy: { order: 'desc' },
          take: 1,
        },
      },
    });

    if (!moduleRecord) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    if (moduleRecord.course.trainerId !== trainer.id) {
      return NextResponse.json({ error: 'Forbidden - Not your course' }, { status: 403 });
    }

    const nextOrder = (moduleRecord.lessons[0]?.order ?? 0) + 1;

    const newLesson = await prisma.lesson.create({
      data: {
        moduleId,
        title: title.trim(),
        description: description?.trim() || '',
        videoUrl: videoUrl?.trim() || '',
        notes: notes?.trim() || '',
        duration: duration ? String(duration).trim() : '',
        isFree: Boolean(isFree),
        order: nextOrder,
      },
    });

    // Update course total lessons count
    await prisma.course.update({
      where: { id: moduleRecord.courseId },
      data: { lessonsCount: { increment: 1 } },
    });

    return NextResponse.json({ lesson: newLesson }, { status: 201 });
  } catch (error) {
    console.error('POST /api/trainer/lessons error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
