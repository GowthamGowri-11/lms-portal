import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Trainer's assigned courses with full details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).role !== 'TRAINER') {
      return NextResponse.json({ error: 'Forbidden - Trainers only' }, { status: 403 });
    }

    const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
    if (!trainer) return NextResponse.json({ error: 'Trainer profile not found' }, { status: 404 });

    const courses = await prisma.course.findMany({
      where: { trainerId: trainer.id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' } } },
        },
        enrollments: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ trainer, courses });
  } catch (error) {
    console.error('GET /api/trainer/courses error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
