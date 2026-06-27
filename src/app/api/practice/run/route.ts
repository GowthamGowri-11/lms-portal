// src/app/api/practice/run/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runCode } from "@/services/practice/executionEngine";

export async function POST(req: NextRequest) {
  try {
    const { problemId, language, code, input } = await req.json();

    if (!problemId || !language || code === undefined || input === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const problem = await prisma.codingProblem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const result = await runCode(problem, language, code, input);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("POST /api/practice/run error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
