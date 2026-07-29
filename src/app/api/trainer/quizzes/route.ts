import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getTrainer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  if ((session.user as any).role !== 'TRAINER' && (session.user as any).role !== 'ADMIN') return null;
  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  return trainer;
}

export async function POST(req: NextRequest) {
  try {
    const trainer = await getTrainer();
    if (!trainer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, courseId, moduleId, afterLessonId, isFinalAssessment, timeLimit, passMark, questions } = await req.json();

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course || course.trainerId !== trainer.id) {
        return NextResponse.json({ error: 'Forbidden: Course not assigned to you' }, { status: 403 });
      }
    }

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
  } catch (err) {
    console.error('Error in POST /api/trainer/quizzes:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const trainer = await getTrainer();
    if (!trainer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, questions, ...data } = await req.json();

    const existingQuiz = await prisma.quiz.findUnique({ where: { id }, include: { course: true } });
    if (!existingQuiz || (existingQuiz.course && existingQuiz.course.trainerId !== trainer.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.quizQuestion.deleteMany({ where: { quizId: id } });
    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        ...data,
        courseId: data.courseId || null,
        moduleId: data.moduleId || null,
        afterLessonId: data.afterLessonId || null,
        isFinalAssessment: Boolean(data.isFinalAssessment),
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
  } catch (err) {
    console.error('Error in PATCH /api/trainer/quizzes:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const trainer = await getTrainer();
    if (!trainer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();
    const existingQuiz = await prisma.quiz.findUnique({ where: { id }, include: { course: true } });
    if (!existingQuiz || (existingQuiz.course && existingQuiz.course.trainerId !== trainer.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.quizAttempt.deleteMany({ where: { quizId: id } });
    await prisma.quizQuestion.deleteMany({ where: { quizId: id } });
    await prisma.quiz.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error in DELETE /api/trainer/quizzes:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
