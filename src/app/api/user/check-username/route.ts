import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { username, email, userId } = await req.json();

    if (!username && !email) {
      return NextResponse.json({ error: 'Provide username or email to check' }, { status: 400 });
    }

    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          name: { equals: username, mode: 'insensitive' },
          ...(userId ? { NOT: { id: userId } } : {}),
        },
      });

      const existingStudent = await prisma.student.findFirst({
        where: {
          name: { equals: username, mode: 'insensitive' },
          ...(userId ? { NOT: { userId: userId } } : {}),
        },
      });

      if (existingUser || existingStudent) {
        return NextResponse.json({
          available: false,
          field: 'username',
          message: 'Username is already taken. Please choose a fresh, unique username.',
        });
      }
    }

    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
          ...(userId ? { NOT: { id: userId } } : {}),
        },
      });

      if (existingEmail) {
        return NextResponse.json({
          available: false,
          field: 'email',
          message: 'Gmail/Email address is already registered in the database.',
        });
      }
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error('Check username error:', error);
    return NextResponse.json({ error: 'Failed to verify availability' }, { status: 500 });
  }
}
