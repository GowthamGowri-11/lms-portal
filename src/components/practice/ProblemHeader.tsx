// src/components/practice/ProblemHeader.tsx
"use client";

import type { CodingProblem } from '@/generated/prisma/client';

interface ProblemHeaderProps {
  problem: CodingProblem;
}

export default function ProblemHeader({ problem }: ProblemHeaderProps) {
  return (
    <div className="sticky top-0 bg-white py-2 border-b border-gray-200">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">{problem.title}</h1>
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Difficulty: {problem.difficulty}</span>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Points: {problem.points}</span>
        {problem.timeLimit && (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">Estimated Time: {problem.timeLimit}s</span>
        )}
      </div>
    </div>
  );
}
