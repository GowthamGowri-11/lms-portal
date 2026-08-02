import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  context: any
) {
  try {
    const params = await Promise.resolve(context.params);
    const session = await getServerSession(authOptions);
    const currentUser = session?.user as any;

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !['STUDENT', 'TRAINER', 'DEVELOPER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 });
    }

    // Get the current user to see their old role
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const oldRole = existingUser.role;

    // Remove old specific profiles if they are being switched away from that role
    if (oldRole === 'STUDENT' && role !== 'STUDENT') {
      await prisma.student.deleteMany({ where: { userId: id } });
    }
    if (oldRole === 'TRAINER' && role !== 'TRAINER') {
      await prisma.trainer.deleteMany({ where: { userId: id } });
    }

    // Update the User role in DB
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });
    
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Update User Role Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user role' }, { status: 500 });
  }
}
