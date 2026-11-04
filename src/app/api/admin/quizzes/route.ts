import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { title, description, courseId, moduleId, afterLessonId, isFinalAssessment, timeLimit, passMark, questions } = await req.json();
  const quiz = await prisma.quiz.create({
    data: {
      title,
      description: description ?? '',
      courseId: courseId || null,
      moduleId: moduleId || null,
      afterLessonId: afterLessonId || null,
      isFinalAssessment: Boolean(isFinalAssessment),
      timeLimit: timeLimit ?? 0,
      passMark: passMark ?? 70,
      questions: {
        create: (questions ?? []).map((q: Record<string, unknown>, i: number) => ({
          question: q.question as string,
          type: (q.type as string) ?? 'mcq',
          options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options || []),
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
  const updateData: Record<string, unknown> = { ...data };
  if (data.courseId !== undefined) updateData.courseId = data.courseId || null;
  if (data.moduleId !== undefined) updateData.moduleId = data.moduleId || null;
  if (data.afterLessonId !== undefined) updateData.afterLessonId = data.afterLessonId || null;
  if (data.isFinalAssessment !== undefined) updateData.isFinalAssessment = Boolean(data.isFinalAssessment);

  if (questions !== undefined) {
    await prisma.quizQuestion.deleteMany({ where: { quizId: id } });
    updateData.questions = {
      create: (questions ?? []).map((q: Record<string, unknown>, i: number) => ({
        question: q.question as string,
        type: (q.type as string) ?? 'mcq',
        options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options || []),
        correctAnswer: q.correctAnswer as string,
        explanation: (q.explanation as string) ?? '',
        order: i,
      })),
    };
  }

  const quiz = await prisma.quiz.update({
    where: { id },
    data: updateData,
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
