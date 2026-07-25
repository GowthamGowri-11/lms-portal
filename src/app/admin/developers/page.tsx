import { prisma } from '@/lib/prisma';
import AdminDevelopersClient from './AdminDevelopersClient';

export default async function AdminDevelopersPage() {
  const developers = await prisma.developer.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  return <AdminDevelopersClient initialDevelopers={developers} />;
}
