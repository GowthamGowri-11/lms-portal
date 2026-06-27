// src/app/api/practice/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { judgeSubmission } from "@/services/practice/executionEngine";

export async function POST(req: NextRequest) {
  try {
    const { problemId, language, code, studentId: bodyStudentId } = await req.json();

    if (!problemId || !language || code === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Resolve studentId
    let studentId = bodyStudentId;
    if (!studentId) {
      let student = await prisma.student.findFirst();
      if (!student) {
        student = await prisma.student.create({
          data: {
            name: "Sample Student",
            email: "student@gmtraining.com",
          },
        });
      }
      studentId = student.id;
    }

    const problem = await prisma.codingProblem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Run tests & judge code
    const result = await judgeSubmission(problem, language, code);

    // Save to Prisma db
    const submission = await prisma.codingSubmission.create({
      data: {
        studentId,
        problemId,
        language,
        code,
        status: result.status,
        output: result.output,
        timeTaken: result.timeTaken,
        memoryUsed: result.memoryUsed,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
      },
    });

    return NextResponse.json({
      ...submission,
      score: result.score, // Return calculated score too
    });
  } catch (err: any) {
    console.error("POST /api/practice/submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
