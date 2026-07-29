import { prisma } from '@/lib/prisma';
import AdminRequestsClient from './AdminRequestsClient';

export const dynamic = 'force-dynamic';

export default async function AdminRequestsPage() {
  // --- Retroactive Automatic Cleanup of Duplicates ---
  try {
    // 1. Delete pending trainer requests for users who are already approved
    const approvedTrainerRequests = await prisma.joinRequest.findMany({
      where: { type: 'TRAINER_APPLICATION', status: 'APPROVED' },
      select: { userId: true },
    });
    const approvedTrainerUserIds = approvedTrainerRequests.map(r => r.userId);
    if (approvedTrainerUserIds.length > 0) {
      await prisma.joinRequest.deleteMany({
        where: {
          userId: { in: approvedTrainerUserIds },
          type: 'TRAINER_APPLICATION',
          status: 'PENDING',
        },
      });
    }

    // 2. Delete pending enrollment requests for courses where the user is already approved
    const approvedEnrollmentRequests = await prisma.joinRequest.findMany({
      where: { type: 'COURSE_ENROLLMENT', status: 'APPROVED' },
      select: { userId: true, targetId: true },
    });
    for (const req of approvedEnrollmentRequests) {
      if (req.targetId) {
        await prisma.joinRequest.deleteMany({
          where: {
            userId: req.userId,
            type: 'COURSE_ENROLLMENT',
            targetId: req.targetId,
            status: 'PENDING',
          },
        });
      }
    }

    // 3. Keep only the newest pending request if multiple pending requests exist for the same user/type/target
    const pendingRequests = await prisma.joinRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    const seen = new Set<string>();
    const idsToDelete: string[] = [];
    for (const req of pendingRequests) {
      const key = `${req.userId}_${req.type}_${req.targetId || 'null'}`;
      if (seen.has(key)) {
        idsToDelete.push(req.id);
      } else {
        seen.add(key);
      }
    }
    if (idsToDelete.length > 0) {
      await prisma.joinRequest.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }
  } catch (error) {
    console.error('Error during auto-cleanup of duplicate requests:', error);
  }

  // --- Fetch cleaned requests ---
  const requests = await prisma.joinRequest.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return <AdminRequestsClient requests={requests} />;
}

