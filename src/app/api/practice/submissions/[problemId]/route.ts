// src/app/api/practice/submissions/[problemId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const { problemId } = await params;
    const { searchParams } = new URL(req.url);
    
    // Resolve studentId
    let studentId = searchParams.get("studentId");
    if (!studentId) {
      const student = await prisma.student.findFirst();
      if (student) {
        studentId = student.id;
      }
    }

    if (!studentId) {
      return NextResponse.json([], { status: 200 });
    }

    const submissions = await prisma.codingSubmission.findMany({
      where: {
        studentId,
        problemId,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json(submissions);
  } catch (err: any) {
    console.error("GET /api/practice/submissions/[problemId] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
