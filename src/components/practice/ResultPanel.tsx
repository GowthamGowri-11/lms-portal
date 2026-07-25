// src/components/practice/ResultPanel.tsx
"use client";

import React from "react";

interface ExecutionResult {
  output: string;
  timeTaken?: number;
  memoryUsed?: number;
  error?: string;
  status?: string;
}

interface SubmissionResult {
  status: string;
  passedTests: number;
  totalTests: number;
  timeTaken: number;
  memoryUsed: number;
  score: number;
  output: string;
  id?: string;
}

interface ResultPanelProps {
  runResult: ExecutionResult | null;
  submitResult: SubmissionResult | null;
  status: "idle" | "running" | "success" | "error";
  testCasesCount: number;
  maxScore: number;
}

export default function ResultPanel({
  runResult,
  submitResult,
  status,
  testCasesCount,
  maxScore,
}: ResultPanelProps) {
  if (status === "running") {
    return (
      <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded-lg animate-pulse flex items-center space-x-3">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-blue-700 font-medium">Running and evaluating your code...</span>
      </div>
    );
  }

  // Handle run results (Custom Input Run)
  if (runResult && !submitResult) {
    const isError = runResult.status !== "Accepted" && !!runResult.error;
    return (
      <div className="mt-4 border rounded-lg overflow-hidden bg-white shadow-sm border-slate-200">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Run Code Result</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
              isError ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {runResult.status || (isError ? "Error" : "Success")}
          </span>
        </div>
        <div className="p-4 space-y-3">
          {/* Metadata */}
          <div className="flex gap-4 text-xs text-slate-500 font-medium">
            {runResult.timeTaken !== undefined && (
              <span>Time Taken: {runResult.timeTaken.toFixed(2)}s</span>
            )}
            {runResult.memoryUsed !== undefined && (
              <span>Memory: {runResult.memoryUsed.toFixed(1)} MB</span>
            )}
          </div>

          {/* Errors if any */}
          {runResult.error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded text-rose-700 font-mono text-xs whitespace-pre-wrap">
              <strong>Error:</strong> {runResult.error}
            </div>
          )}

          {/* Program output */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Standard Output</span>
            <pre className="bg-slate-900 text-slate-100 font-mono p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap max-h-48 scrollbar-thin">
              {runResult.output || "(No console output)"}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Handle submit results
  if (submitResult) {
    const verdict = submitResult.status;
    const isAccepted = verdict === "Accepted";
    
    // Pick color scheme based on status
    let statusClass = "bg-rose-100 text-rose-800 border-rose-300";
    if (isAccepted) {
      statusClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
    } else if (verdict === "Compilation Error") {
      statusClass = "bg-amber-100 text-amber-800 border-amber-300";
    }

    return (
      <div className={`mt-4 border rounded-lg overflow-hidden bg-white shadow-sm border-slate-200`}>
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Submission Result</span>
          <span className={`px-3 py-1 rounded text-sm font-bold border uppercase tracking-wide ${statusClass}`}>
            {verdict}
          </span>
        </div>
        <div className="p-4 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 block uppercase">Test cases</span>
              <span className="text-lg font-bold text-slate-700">
                {submitResult.passedTests} / {submitResult.totalTests}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 block uppercase">Score</span>
              <span className="text-lg font-bold text-purple-700">
                {submitResult.score} / {maxScore}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 block uppercase">Time</span>
              <span className="text-lg font-bold text-slate-700">{submitResult.timeTaken.toFixed(2)}s</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 block uppercase">Memory</span>
              <span className="text-lg font-bold text-slate-700">{submitResult.memoryUsed.toFixed(1)} MB</span>
            </div>
          </div>

          {/* Failure message / output */}
          {!isAccepted && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-3.5 rounded text-rose-700 text-sm">
              <span className="font-bold block mb-1">Feedback:</span>
              <p className="font-mono text-xs whitespace-pre-wrap">{submitResult.output}</p>
            </div>
          )}

          {isAccepted && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 rounded text-emerald-700 text-sm">
              <span className="font-bold block mb-1">All tests passed!</span>
              <p className="font-mono text-xs whitespace-pre-wrap">{submitResult.output}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
