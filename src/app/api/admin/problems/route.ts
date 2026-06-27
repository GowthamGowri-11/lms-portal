import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const problem = await prisma.codingProblem.create({
    data: {
      title: body.title,
      difficulty: body.difficulty ?? 'Easy',
      description: body.description ?? '',
      inputFormat: body.inputFormat ?? '',
      outputFormat: body.outputFormat ?? '',
      constraints: body.constraints ?? '',
      examples: body.examples ?? '[]',
      visibleTests: body.visibleTests ?? '[]',
      hiddenTests: body.hiddenTests ?? '[]',
      starterCode: body.starterCode ?? '{}',
      languages: body.languages ?? '[]',
      timeLimit: body.timeLimit ?? 2,
      memoryLimit: body.memoryLimit ?? 256,
      points: body.points ?? 10,
      lessonId: body.lessonId ?? null,
    },
  });
  return NextResponse.json(problem);
}

export async function PATCH(req: NextRequest) {
  const { id, ...data } = await req.json();
  const problem = await prisma.codingProblem.update({
    where: { id },
    data: { ...data, lessonId: data.lessonId ?? null },
  });
  return NextResponse.json(problem);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.codingSubmission.deleteMany({ where: { problemId: id } });
  await prisma.codingProblem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
