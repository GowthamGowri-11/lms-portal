import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Get trainer's own profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).role !== 'TRAINER') {
      return NextResponse.json({ error: 'Forbidden - Trainers only' }, { status: 403 });
    }

    const trainer = await prisma.trainer.findUnique({
      where: { userId: session.user.id },
    });

    if (!trainer) return NextResponse.json({ error: 'Trainer profile not found' }, { status: 404 });

    return NextResponse.json({ trainer });
  } catch (error) {
    console.error('GET /api/trainer/profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update trainer profile details (onboarding or general updates)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).role !== 'TRAINER') {
      return NextResponse.json({ error: 'Forbidden - Trainers only' }, { status: 403 });
    }

    const body = await req.json();
    const { specialization, experience, bio, avatar, name } = body;

    const trainer = await prisma.trainer.findUnique({
      where: { userId: session.user.id },
    });

    if (!trainer) return NextResponse.json({ error: 'Trainer profile not found' }, { status: 404 });

    const updated = await prisma.trainer.update({
      where: { id: trainer.id },
      data: {
        ...(name && { name }),
        ...(specialization && { specialization }),
        ...(experience !== undefined && { experience }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    // If name was updated, update User record as well
    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    return NextResponse.json({ trainer: updated });
  } catch (error) {
    console.error('PATCH /api/trainer/profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
