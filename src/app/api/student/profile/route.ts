import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Get student's own profile & stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        enrollments: { include: { course: true } },
        courseProgresses: true,
        certificates: { include: { course: true } },
        queries: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });

    return NextResponse.json({ student });
  } catch (error) {
    console.error('GET /api/student/profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update student profile (name, avatar only)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, avatar } = body;

    const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
    });

    // Also update the User's name
    await prisma.user.update({
      where: { id: session.user.id },
      data: { ...(name && { name }) },
    });

    return NextResponse.json({ student: updated });
  } catch (error) {
    console.error('PATCH /api/student/profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
