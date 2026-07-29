import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const {
    studentId,
    quizId,
    answers,
    score,
    totalMarks,
    percentage,
    passed,
    timeTaken,
  } = await req.json();

  // Check if the student has already attempted this quiz
  const existingAttempts = await prisma.quizAttempt.findMany({
    where: { studentId, quizId },
  });

  if (existingAttempts.length > 0) {
    // Student already took this quiz — check for an APPROVED retake request
    const approvedRetake = await prisma.quizRetakeRequest.findFirst({
      where: {
        studentId,
        quizId,
        status: 'APPROVED',
      },
    });

    if (!approvedRetake) {
      return NextResponse.json(
        { error: 'You have already attempted this quiz. Request a retake to try again.' },
        { status: 403 }
      );
    }

    // Consume the approved retake request (mark as USED)
    await prisma.quizRetakeRequest.update({
      where: { id: approvedRetake.id },
      data: { status: 'USED', resolvedAt: new Date() },
    });
  }

  // Create a quiz attempt record
  const attempt = await prisma.quizAttempt.create({
    data: {
      studentId,
      quizId,
      answers: answers ?? '',
      score: score ?? 0,
      totalMarks: totalMarks ?? 0,
      percentage: percentage ?? 0,
      passed: passed ?? false,
      timeTaken: timeTaken ?? 0,
    },
  });

  return NextResponse.json(attempt);
}
