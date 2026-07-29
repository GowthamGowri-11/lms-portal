import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action } = body; // 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const request = await prisma.joinRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    
    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request is already processed' }, { status: 400 });
    }

    if (action === 'REJECT') {
      await prisma.joinRequest.update({
        where: { id },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json({ success: true, message: 'Request rejected' });
    }

    // Handle APPROVE logic
    await prisma.$transaction(async (tx) => {
      // 1. Update request status
      await tx.joinRequest.update({
        where: { id },
        data: { status: 'APPROVED' },
      });

      // 2. Update user role and create associated profile
      if (request.type === 'COURSE_ENROLLMENT') {
        // Change role to STUDENT if they are currently a GUEST
        if (request.user.role === 'GUEST') {
          await tx.user.update({
            where: { id: request.userId },
            data: { role: 'STUDENT' },
          });
        }
        
        // Find or create student profile
        let student = await tx.student.findUnique({
          where: { userId: request.userId },
        });

        if (!student) {
          student = await tx.student.create({
            data: {
              userId: request.userId,
              name: request.user.name || 'New Student',
              email: request.user.email || '',
              avatar: request.user.image || '',
            },
          });
        }

        // Create enrollment for the specific course
        if (request.targetId) {
          await tx.enrollment.create({
            data: {
              studentId: student.id,
              courseId: request.targetId,
              paymentStatus: 'completed', // Or whatever logic you want here
            },
          });
        }

      } else if (request.type === 'TRAINER_APPLICATION') {
        // Change role to TRAINER
        await tx.user.update({
          where: { id: request.userId },
          data: { role: 'TRAINER' },
        });

        // Create trainer profile
        const existingTrainer = await tx.trainer.findUnique({
          where: { userId: request.userId },
        });

        if (!existingTrainer) {
          await tx.trainer.create({
            data: {
              userId: request.userId,
              name: request.user.name || 'New Trainer',
              email: request.user.email || '',
              avatar: request.user.image || '',
              specialization: 'General',
            },
          });
        }
      }

      // 3. Automatically clean up other pending requests of this type for the user
      await tx.joinRequest.deleteMany({
        where: {
          userId: request.userId,
          type: request.type,
          targetId: request.targetId,
          status: 'PENDING',
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Request approved successfully' });
  } catch (error) {
    console.error('Admin Request Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
