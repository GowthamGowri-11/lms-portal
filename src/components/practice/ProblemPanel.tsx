// src/components/practice/ProblemPanel.tsx
"use client";

import type { CodingProblem } from '@/generated/prisma/client';
import ProblemHeader from './ProblemHeader';
import ProblemTabs from './ProblemTabs';

interface ProblemPanelProps {
  problem: CodingProblem;
  visibleTests: any[];
  submissions: any[];
}

export default function ProblemPanel({ problem, visibleTests, submissions }: ProblemPanelProps) {
  // Parse Examples safely
  const examplesList = (() => {
    try {
      if (problem.examples) {
        const parsed = JSON.parse(problem.examples as string);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error("Failed to parse examples:", e);
    }
    return [];
  })();

  // Parse Hidden Tests count
  const hiddenCount = (() => {
    try {
      if (problem.hiddenTests) {
        const parsed = JSON.parse(problem.hiddenTests as string);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch {}
    return 0;
  })();

  const formatDifficultyColor = (diff: string) => {
    const d = diff.toLowerCase();
    if (d === 'easy') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (d === 'medium' || d === 'medium-hard') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  const DescriptionTab = (
    <div className="space-y-6 text-slate-700">
      {/* Meta attributes */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${formatDifficultyColor(problem.difficulty)}`}>
          {problem.difficulty}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
          Points: {problem.points}
        </span>
        {problem.timeLimit && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            Time Limit: {problem.timeLimit}s
          </span>
        )}
        {problem.memoryLimit && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
            Memory Limit: {problem.memoryLimit}MB
          </span>
        )}
      </div>

      {/* Description */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2 border-b pb-1">Description</h2>
        <div className="prose max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
          {problem.description}
        </div>
      </div>

      {/* Input Format */}
      {problem.inputFormat && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Input Format</h3>
          <p className="bg-slate-50 border-l-4 border-slate-300 p-3 rounded text-slate-600 font-mono text-sm whitespace-pre-wrap">
            {problem.inputFormat}
          </p>
        </div>
      )}

      {/* Output Format */}
      {problem.outputFormat && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Output Format</h3>
          <p className="bg-slate-50 border-l-4 border-slate-300 p-3 rounded text-slate-600 font-mono text-sm whitespace-pre-wrap">
            {problem.outputFormat}
          </p>
        </div>
      )}

      {/* Constraints */}
      {problem.constraints && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Constraints</h3>
          <p className="bg-slate-50 border-l-4 border-rose-300 p-3 rounded text-slate-600 font-mono text-sm whitespace-pre-wrap">
            {problem.constraints}
          </p>
        </div>
      )}

      {/* Examples */}
      {examplesList.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-3">Examples</h3>
          <div className="space-y-4">
            {examplesList.map((example: any, idx: number) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <span className="text-sm font-semibold text-purple-700 block mb-2">Example {idx + 1}</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Input</span>
                    <pre className="bg-white border border-slate-200 p-2.5 rounded text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                      {example.input || "(empty)"}
                    </pre>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Output</span>
                    <pre className="bg-white border border-slate-200 p-2.5 rounded text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                      {example.output || example.expected || ""}
                    </pre>
                  </div>
                </div>
                {example.explanation && (
                  <div className="mt-3 text-sm text-slate-600 border-t pt-2">
                    <span className="font-semibold text-slate-700">Explanation: </span>
                    {example.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample / Visible Test cases */}
      {visibleTests.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Sample Test Cases</h3>
          <div className="space-y-2">
            {visibleTests.map((tc, idx) => (
              <div key={idx} className="border border-slate-100 bg-slate-50/30 rounded p-3 text-sm">
                <div><strong>Case {idx + 1} Input:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{tc.input || "(empty)"}</code></div>
                <div className="mt-1"><strong>Expected Output:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{tc.expected || tc.output || ""}</code></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden test case count */}
      <div className="pt-2 border-t flex justify-between items-center text-sm text-slate-500">
        <span>Total Visible Cases: {visibleTests.length}</span>
        <span>Hidden Test Cases: {hiddenCount}</span>
      </div>
    </div>
  );

  const SubmissionsTab = (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-1">Submission History</h3>
      {submissions.length === 0 ? (
        <p className="text-slate-500 text-sm italic">No submissions yet for this problem.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Language</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Tests Passed</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Time</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Memory</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((sub, idx) => {
                const isAccepted = sub.status === "Accepted" || sub.status === "success";
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 font-bold">
                      <span className={isAccepted ? "text-emerald-600" : "text-rose-600"}>
                        {isAccepted ? "Accepted" : sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">{sub.language}</td>
                    <td className="px-4 py-2.5">
                      {sub.passedTests}/{sub.totalTests}
                    </td>
                    <td className="px-4 py-2.5">{sub.timeTaken ? `${sub.timeTaken.toFixed(2)}s` : "0.0s"}</td>
                    <td className="px-4 py-2.5">{sub.memoryUsed ? `${sub.memoryUsed.toFixed(1)} MB` : "0.0 MB"}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const tabs = [
    { label: "Problem Description", content: DescriptionTab },
    { label: "Submissions", content: SubmissionsTab },
  ];

  return (
    <div className="h-full flex flex-col min-w-0 bg-white">
      <div className="p-6 pb-2 border-b border-gray-100">
        <ProblemHeader problem={problem} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ProblemTabs tabs={tabs} />
      </div>
    </div>
  );
}
