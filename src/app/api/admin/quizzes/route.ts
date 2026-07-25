import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { title, description, courseId, moduleId, timeLimit, passMark, questions } = await req.json();
  const quiz = await prisma.quiz.create({
    data: {
      title,
      description: description ?? '',
      courseId: courseId || null,
      moduleId: moduleId || null,
      timeLimit: timeLimit ?? 0,
      passMark: passMark ?? 70,
      questions: {
        create: (questions ?? []).map((q: Record<string, unknown>, i: number) => ({
          question: q.question as string,
          type: (q.type as string) ?? 'mcq',
          options: q.options as string,
          correctAnswer: q.correctAnswer as string,
          explanation: (q.explanation as string) ?? '',
          order: i,
        })),
      },
    },
  });
  return NextResponse.json(quiz);
}

export async function PATCH(req: NextRequest) {
  const { id, questions, ...data } = await req.json();
  // Delete old questions and recreate
  await prisma.quizQuestion.deleteMany({ where: { quizId: id } });
  const quiz = await prisma.quiz.update({
    where: { id },
    data: {
      ...data,
      courseId: data.courseId || null,
      moduleId: data.moduleId || null,
      questions: {
        create: (questions ?? []).map((q: Record<string, unknown>, i: number) => ({
          question: q.question as string,
          type: (q.type as string) ?? 'mcq',
          options: q.options as string,
          correctAnswer: q.correctAnswer as string,
          explanation: (q.explanation as string) ?? '',
          order: i,
        })),
      },
    },
  });
  return NextResponse.json(quiz);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.quizAttempt.deleteMany({ where: { quizId: id } });
  await prisma.quizQuestion.deleteMany({ where: { quizId: id } });
  await prisma.quiz.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
