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
