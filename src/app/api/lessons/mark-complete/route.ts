import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, lessonId, completed } = body;

    if (!studentId || !lessonId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        studentId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
