// src/components/practice/PracticePageContent.tsx
"use client";

import PracticeWorkspace from '@/components/practice/PracticeWorkspace';
import type { CodingProblem, Course, Module, Quiz } from '@/generated/prisma/client';

interface PracticePageContentProps {
  problem: CodingProblem;
  visibleTests: any[];
  // Props retained for compatibility but not used in UI
  course?: Course | null;
  modules: any[]; // relaxed type
  codingProblems: CodingProblem[];
  quizzes: Quiz[];
}

export default function PracticePageContent({
  problem,
  visibleTests,
}: PracticePageContentProps) {
  return (
    <PracticeWorkspace problem={problem} visibleTests={visibleTests} />
  );
}
