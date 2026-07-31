import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  context: any
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    const currentUser = session?.user as any;

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !['GUEST', 'STUDENT', 'TRAINER', 'DEVELOPER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 });
    }

    // Update the User role in DB
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    // If changing to TRAINER and they don't have a Trainer record, we should probably create one
    // But since the Trainer onboarding process might require specific details, 
    // it's safer to just let the app handle the missing Trainer record when they visit the dashboard.
    
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update User Role Error:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
