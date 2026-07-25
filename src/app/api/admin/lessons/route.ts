import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { moduleId, title, description, videoUrl, notes, duration, isFree, order } = body;
  const lesson = await prisma.lesson.create({
    data: { moduleId, title, description: description ?? '', videoUrl: videoUrl ?? '', notes: notes ?? '', duration: duration ?? '', isFree: isFree ?? false, order: order ?? 0 },
  });
  return NextResponse.json(lesson);
}

export async function PATCH(req: NextRequest) {
  const { id, ...data } = await req.json();
  const lesson = await prisma.lesson.update({ where: { id }, data });
  return NextResponse.json(lesson);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.lessonProgress.deleteMany({ where: { lessonId: id } });
  await prisma.codingProblem.updateMany({ where: { lessonId: id }, data: { lessonId: null } });
  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
