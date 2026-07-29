import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, count } = body;

    if (!courseId || !count || count <= 0 || count > 20) {
      return NextResponse.json({ error: 'Invalid courseId or count (max 20)' }, { status: 400 });
    }

    // Determine current highest order to append new modules correctly
    const existingModules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'desc' },
      take: 1,
    });
    
    const startingOrder = existingModules.length > 0 ? existingModules[0].order + 1 : 1;
    
    const modulesToCreate = [];
    for (let i = 0; i < count; i++) {
      modulesToCreate.push({
        courseId,
        title: `Topic ${startingOrder + i}`,
        order: startingOrder + i,
      });
    }

    await prisma.module.createMany({
      data: modulesToCreate,
    });

    return NextResponse.json({ ok: true, generated: count });
  } catch (error) {
    console.error('Error generating modules in bulk:', error);
    return NextResponse.json({ error: 'Failed to generate modules' }, { status: 500 });
  }
}
