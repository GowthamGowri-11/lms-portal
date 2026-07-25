// src/components/practice/PracticeWorkspace.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { CodingProblem, Lesson, Course } from "@/generated/prisma/client";

import ProblemPanel from "./ProblemPanel";
import CodeEditorPanel from "./CodeEditorPanel";
import RunSubmitBar from "./RunSubmitBar";
import ResultPanel from "./ResultPanel";

interface PracticeWorkspaceProps {
  problem: CodingProblem & { lesson?: Lesson & { module?: { course: Course } } | null };
  visibleTests: any[];
}

export default function PracticeWorkspace({ problem, visibleTests }: PracticeWorkspaceProps) {
  // Language selection state
  const [language, setLanguage] = useState(() => {
    try {
      const langs = JSON.parse(problem.languages as unknown as string);
      return langs[0] ?? "python";
    } catch {
      return "python";
    }
  });

  // Code state (holds code written by student)
  const [code, setCode] = useState(() => {
    try {
      const map = JSON.parse(problem.starterCode as unknown as string);
      return map[language] ?? "";
    } catch {
      return "";
    }
  });

  // Custom Input text
  const [customInput, setCustomInput] = useState("");
  
  // Status and evaluation states
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [runResult, setRunResult] = useState<any>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);

  // Submissions history state
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Update editor code when language selection changes
  useEffect(() => {
    try {
      const map = JSON.parse(problem.starterCode as unknown as string);
      setCode(map[language] ?? "");
    } catch {
      setCode("");
    }
  }, [language, problem.starterCode]);

  // Load submissions history on mount
  useEffect(() => {
    fetchSubmissions();
  }, [problem.id]);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`/api/practice/submissions/${problem.id}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error("Failed to load submissions history:", err);
    }
  };

  // Run handler (custom input execution)
  const handleRun = async () => {
    setStatus("running");
    setRunResult(null);
    setSubmitResult(null);
    try {
      const res = await fetch("/api/practice/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code,
          input: customInput,
        }),
      });
      const data = await res.json();
      setRunResult(data);
      setStatus(res.ok ? "success" : "error");
    } catch (e) {
      console.error(e);
      setRunResult({ error: "Network error occurred." });
      setStatus("error");
    }
  };

  // Submit handler (evaluates against hidden tests)
  const handleSubmit = async () => {
    setStatus("running");
    setRunResult(null);
    setSubmitResult(null);
    try {
      const studentRes = await fetch("/api/demo/student");
      let studentId = "";
      if (studentRes.ok) {
        const student = await studentRes.json();
        studentId = student.id;
      }

      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code,
          studentId,
        }),
      });
      
      if (!res.ok) {
        const errText = await res.text();
        setSubmitResult({
          status: "Error",
          passedTests: 0,
          totalTests: 1,
          timeTaken: 0,
          memoryUsed: 0,
          score: 0,
          output: `Submit error: ${errText}`,
        });
        setStatus("error");
        return;
      }

      const data = await res.json();
      setSubmitResult(data);
      setStatus("success");
      
      // Reload submissions list
      fetchSubmissions();
    } catch (e) {
      console.error(e);
      setSubmitResult({
        status: "Error",
        passedTests: 0,
        totalTests: 1,
        timeTaken: 0,
        memoryUsed: 0,
        score: 0,
        output: "Network error occurred during submission.",
      });
      setStatus("error");
    }
  };

  // Back link to lesson
  const backLink = problem.lesson?.module?.course?.id
    ? `/learn/${problem.lesson.module.course.id}/lesson/${problem.lesson.id}`
    : "#";

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 flex flex-col md:flex-row">
      {/* Left Panel: Problem Statement & Tabs */}
      <div className="w-full md:w-[60%] lg:w-1/2 flex flex-col h-full bg-white overflow-hidden border-r border-slate-200">
        <ProblemPanel
          problem={problem}
          visibleTests={visibleTests}
          submissions={submissions}
        />
      </div>

      {/* Right Panel: Editor, Custom Input, Run/Submit, & Results */}
      <div className="w-full md:w-[40%] lg:w-1/2 flex flex-col h-full bg-white p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <Link
            href={backLink}
            className="text-purple-600 font-semibold hover:text-purple-800 flex items-center transition-colors"
          >
            <span className="mr-1">←</span> Back to Lesson
          </Link>
          <span className="text-xs text-slate-400 font-medium">GM Coding Platform</span>
        </div>

        {/* Code Editor Panel */}
        <div className="flex-1 min-h-[400px]">
          <CodeEditorPanel
            problem={problem}
            language={language}
            setLanguage={setLanguage}
            code={code}
            setCode={setCode}
            customInput={customInput}
            setCustomInput={setCustomInput}
          />
        </div>

        {/* Buttons to execute */}
        <div className="mt-4 border-t pt-4">
          <RunSubmitBar onRun={handleRun} onSubmit={handleSubmit} status={status} />
        </div>

        {/* Results Panel */}
        <ResultPanel
          runResult={runResult}
          submitResult={submitResult}
          status={status}
          testCasesCount={visibleTests.length}
          maxScore={problem.points}
        />
      </div>
    </div>
  );
}
