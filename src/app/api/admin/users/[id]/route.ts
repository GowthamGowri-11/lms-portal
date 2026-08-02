import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
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

    if (id === currentUser.id) {
      return NextResponse.json({ error: 'You cannot delete yourself' }, { status: 400 });
    }

    // Since we added onDelete: Cascade to the schema, deleting the user will 
    // cleanly remove all associated records (Student, Trainer, Enrollments, Courses).
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'User completely removed from database.' });
  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
