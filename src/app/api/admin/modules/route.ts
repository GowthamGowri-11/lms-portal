import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, title, description, order } = body;
    const moduleItem = await prisma.module.create({
      data: { courseId, title, description: description ?? '', order: order ?? 0 },
    });
    return NextResponse.json(moduleItem);
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();
    const moduleItem = await prisma.module.update({ where: { id }, data });
    return NextResponse.json(moduleItem);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    // Prisma cascading deletes should handle the nested lessons if configured,
    // otherwise we might need to delete lessons manually.
    // Schema shows onDelete: Cascade for lessons in module, so it's safe.
    await prisma.module.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
  }
}
