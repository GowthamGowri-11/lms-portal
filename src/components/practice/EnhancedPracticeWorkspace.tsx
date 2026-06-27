// src/components/practice/EnhancedPracticeWorkspace.tsx
"use client";

import Link from "next/link";
import { Editor } from "@monaco-editor/react";
import { useState, useEffect, useRef } from "react";
import styles from "./practice.module.css";
import { CodingProblem, Course, Lesson } from "@/generated/prisma/client";
import CollapsibleCard from "@/components/common/CollapsibleCard";
import TabGroup from "@/components/common/TabGroup";
import ResultDialog from "@/components/common/ResultDialog";

interface EnhancedPracticeWorkspaceProps {
  problem: CodingProblem & { lesson: Lesson & { module: { course: Course } } };
  visibleTests: any[];
}

export default function EnhancedPracticeWorkspace({ problem, visibleTests }: EnhancedPracticeWorkspaceProps) {
  const [language, setLanguage] = useState(() => {
    try {
      const langs = JSON.parse(problem.languages as unknown as string);
      return langs[0] ?? "python";
    } catch {
      return "python";
    }
  });
  const [code, setCode] = useState(() => {
    try {
      const map = JSON.parse(problem.starterCode as unknown as string);
      return map[language] ?? "";
    } catch {
      return "";
    }
  });
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [runResult, setRunResult] = useState<any>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50);
  const dividerRef = useRef<HTMLDivElement>(null);

  // Update code when language changes
  useEffect(() => {
    try {
      const map = JSON.parse(problem.starterCode as unknown as string);
      setCode(map[language] ?? "");
    } catch {
      setCode("");
    }
  }, [language, problem.starterCode]);

  // Drag handling for divider
  useEffect(() => {
    const divider = dividerRef.current;
    if (!divider) return;
    let isDragging = false;
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      e.preventDefault();
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const container = divider.parentElement as HTMLElement;
      const rect = container.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      let newLeft = (offsetX / rect.width) * 100;
      if (newLeft < 10) newLeft = 10;
      if (newLeft > 90) newLeft = 90;
      setLeftWidth(newLeft);
    };
    const onMouseUp = () => (isDragging = false);
    divider.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      divider.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleRun = async () => {
    setStatus("running");
    setOutput("");
    try {
      const res = await fetch("/api/problems/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, language, code, input: customInput }),
      });
      if (!res.ok) {
        const err = await res.text();
        setOutput(`Run error ${res.status}: ${err}`);
        setStatus("error");
        return;
      }
      const data = await res.json();
      setRunResult(data);
      setOutput(data.output ?? JSON.stringify(data, null, 2));
      setStatus("success");
    } catch (e) {
      console.error(e);
      setOutput("Network error");
      setStatus("error");
    }
  };

  const handleSubmit = async () => {
    setStatus("running");
    setOutput("");
    try {
      const studentRes = await fetch("/api/demo/student");
      if (!studentRes.ok) {
        const err = await studentRes.text();
        setOutput(`Student fetch error ${studentRes.status}: ${err}`);
        setStatus("error");
        return;
      }
      const student = await studentRes.json();
      const res = await fetch("/api/problems/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, problemId: problem.id, language, code }),
      });
      if (!res.ok) {
        const err = await res.text();
        setOutput(`Submit error ${res.status}: ${err}`);
        setStatus("error");
        return;
      }
      const data = await res.json();
      setSubmitResult(data);
      setShowResultDialog(true);
      setOutput(JSON.stringify(data, null, 2));
      setStatus("success");
    } catch (e) {
      console.error(e);
      setOutput("Network error");
      setStatus("error");
    }
  };

  const backLink = `/learn/${problem.lesson.module.course.id}/lesson/${problem.lesson.id}`;

  const problemTabs = [
    { label: "Description", content: <CollapsibleCard title="Description">{problem.description}</CollapsibleCard> },
    { label: "Examples", content: <CollapsibleCard title="Examples"><pre className={styles.pre}>{problem.examples}</pre></CollapsibleCard> },
    { label: "Test Cases", content: (
      <CollapsibleCard title="Sample Test Cases">
        {visibleTests.map((tc, i) => (
          <div key={i} className={styles.testCase}>
            <strong>Input:</strong>
            <pre className={styles.pre}>{tc.input}</pre>
            <strong>Expected Output:</strong>
            <pre className={styles.pre}>{tc.output}</pre>
          </div>
        ))}
      </CollapsibleCard>
    ) },
    { label: "Submissions", content: submitResult ? (
      <pre className={styles.pre}>{JSON.stringify(submitResult, null, 2)}</pre>
    ) : <p>No submission yet.</p> },
  ];

  const consoleTabs = [
    { label: "Input", content: <pre className={styles.pre}>{customInput || "(no custom input)"}</pre> },
    { label: "Output", content: <pre className={styles.pre}>{output || (status === "running" ? "Running..." : "No output yet.")}</pre> },
    { label: "Result", content: runResult ? (
      <pre className={styles.pre}>{JSON.stringify(runResult, null, 2)}</pre>
    ) : <p>No run result.</p> },
  ];

  return (
    <div className={styles.container} style={{ height: "100vh" }}>
      <div className={styles.topBar}>
        <Link href={backLink} className={styles.backBtn}>← Back to Lesson</Link>
      </div>
      <div className={styles.split} style={{ display: "flex" }}>
        <section className={styles.leftPanel} style={{ flexBasis: `${leftWidth}%` }}>
          <TabGroup tabs={problemTabs} />
        </section>
        <div ref={dividerRef} className={styles.divider} />
        <section className={styles.rightPanel} style={{ flexBasis: `${100 - leftWidth}%` }}>
          <div className={styles.editorHeader}>
            <select value={language} onChange={e => setLanguage(e.target.value)} className={styles.langSelect}>
              {(() => {
                try {
                  const langs = JSON.parse(problem.languages as unknown as string);
                  return langs.map((l: string) => <option key={l} value={l}>{l}</option>);
                } catch {
                  return ["python", "javascript", "java", "c", "cpp"].map(l => <option key={l} value={l}>{l}</option>);
                }
              })()}
            </select>
            <button onClick={() => setCode('')} className={styles.resetBtn}>Reset</button>
          </div>
          <Editor
            height="60vh"
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={value => setCode(value ?? "")}
            theme="vs-dark"
            options={{ automaticLayout: true, minimap: { enabled: false } }}
          />
          <div className={styles.customInputSection}>
            <h3>Custom Input</h3>
            <textarea
              className={styles.customInput}
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="Enter custom input for runtime"
            />
          </div>
          <div className={styles.actionButtons}>
            <button onClick={handleRun} disabled={status === "running"} className={styles.runBtn}>Run</button>
            <button onClick={handleSubmit} disabled={status === "running"} className={styles.submitBtn}>Submit</button>
          </div>
          <div className={styles.console}>
            <TabGroup tabs={consoleTabs} />
          </div>
        </section>
      </div>
      {showResultDialog && (
        <ResultDialog onClose={() => setShowResultDialog(false)} result={submitResult} />
      )}
    </div>
  );
}
