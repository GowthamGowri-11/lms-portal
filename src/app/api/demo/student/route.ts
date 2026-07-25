import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Demo student data
  const demoStudent = {
    id: 'demo-student-id',
    name: 'Demo Student',
    email: 'demo@student.com',
  };

  // Ensure the demo student exists in the database (upsert)
  await prisma.student.upsert({
    where: { email: demoStudent.email },
    update: {},
    create: demoStudent,
  });

  return NextResponse.json(demoStudent);
}
