// src/app/api/practice/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const problem = await prisma.codingProblem.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Coding problem not found" }, { status: 404 });
    }

    // Parse visible tests
    let visibleTests: any[] = [];
    try {
      if (problem.visibleTests) {
        visibleTests = JSON.parse(problem.visibleTests as string);
      }
    } catch (e) {
      console.error("Error parsing visibleTests:", e);
    }

    // Get count of hidden tests
    let hiddenTestCount = 0;
    try {
      if (problem.hiddenTests) {
        const parsed = JSON.parse(problem.hiddenTests as string);
        hiddenTestCount = Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch (e) {
      console.error("Error parsing hiddenTests:", e);
    }

    return NextResponse.json({
      problem,
      visibleTests,
      hiddenTestCount,
    });
  } catch (err: any) {
    console.error("GET /api/practice/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
