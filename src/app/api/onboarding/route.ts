import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; email?: string; name?: string; image?: string; role?: string } | undefined;

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const { phone, age, education, intendedRole, username } = await req.json();

    if (!phone || !age || !education || !intendedRole) {
      return NextResponse.json({ error: 'All fields (phone, age, education, intended role) are required.' }, { status: 400 });
    }

    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          name: { equals: username, mode: 'insensitive' },
          NOT: { id: user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Username is already taken. Please choose a fresh, unique username.' }, { status: 400 });
      }
    }

    const numericAge = parseInt(age, 10);
    if (isNaN(numericAge) || numericAge < 10 || numericAge > 100) {
      return NextResponse.json({ error: 'Please provide a valid age between 10 and 100.' }, { status: 400 });
    }

    // Determine target role and update User
    const newRole = intendedRole === 'STUDENT' ? 'STUDENT' : (user.role === 'ADMIN' ? 'ADMIN' : 'GUEST');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(username && { name: username }),
        phone,
        age: numericAge,
        education,
        isOnboarded: true,
        role: newRole,
      },
    });

    if (intendedRole === 'STUDENT') {
      // Create student profile if not already present
      const existingStudent = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!existingStudent) {
        await prisma.student.create({
          data: {
            userId: user.id,
            name: user.name || 'New Student',
            email: user.email || '',
            avatar: user.image || '',
          },
        });
      }
    } else if (intendedRole === 'TRAINER') {
      // Create a trainer application request for Admin approval
      const existingReq = await prisma.joinRequest.findFirst({
        where: {
          userId: user.id,
          type: 'TRAINER_APPLICATION',
          status: { in: ['PENDING', 'APPROVED'] },
        },
      });

      if (!existingReq) {
        await prisma.joinRequest.create({
          data: {
            userId: user.id,
            type: 'TRAINER_APPLICATION',
            status: 'PENDING',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: intendedRole === 'STUDENT'
        ? 'Onboarding complete! Welcome to your student learning journey.'
        : 'Onboarding complete! Your trainer application has been submitted for admin review.',
      role: newRole,
    });
  } catch (error) {
    console.error('Onboarding Error:', error);
    return NextResponse.json({ error: 'Internal Server Error during onboarding.' }, { status: 500 });
  }
}
