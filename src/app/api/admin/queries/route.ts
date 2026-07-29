import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: All queries for admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const queries = await prisma.studentQuery.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ queries });
  } catch (error) {
    console.error('GET /api/admin/queries error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
