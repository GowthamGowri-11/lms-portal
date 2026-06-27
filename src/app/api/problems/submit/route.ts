import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { judgeSubmission } from "@/services/practice/executionEngine";

export async function POST(req: NextRequest) {
  try {
    const { studentId, problemId, language, code } = await req.json();

    if (!studentId || !problemId || !language || code === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const problem = await prisma.codingProblem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const result = await judgeSubmission(problem, language, code);

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

    return NextResponse.json(submission);
  } catch (err: any) {
    console.error("POST /api/problems/submit error:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
