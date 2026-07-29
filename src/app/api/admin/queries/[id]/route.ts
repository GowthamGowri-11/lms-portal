import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH: Admin replies/resolves a query
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, adminReply } = body;

    const query = await prisma.studentQuery.findUnique({ where: { id } });
    if (!query) return NextResponse.json({ error: 'Query not found' }, { status: 404 });

    const updated = await prisma.studentQuery.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminReply !== undefined && { adminReply }),
      },
    });

    return NextResponse.json({ query: updated });
  } catch (error) {
    console.error('PATCH /api/admin/queries/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
