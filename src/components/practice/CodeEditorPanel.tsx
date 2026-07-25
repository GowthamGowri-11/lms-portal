// src/components/practice/CodeEditorPanel.tsx
"use client";

import { Editor } from "@monaco-editor/react";
import { useState, useEffect } from "react";
import type { CodingProblem } from "@/generated/prisma/client";
import { Check, Copy, RotateCcw } from "lucide-react";

interface CodeEditorPanelProps {
  problem: CodingProblem;
  language: string;
  setLanguage: (lang: string) => void;
  code: string;
  setCode: (code: string) => void;
  customInput: string;
  setCustomInput: (input: string) => void;
}

export default function CodeEditorPanel({
  problem,
  language,
  setLanguage,
  code,
  setCode,
  customInput,
  setCustomInput,
}: CodeEditorPanelProps) {
  const [copied, setCopied] = useState(false);

  // Language options derived from problem.languages JSON
  const languageOptions = (() => {
    try {
      const langs = JSON.parse(problem.languages as unknown as string);
      return Array.isArray(langs) ? langs : [];
    } catch {
      return ["python", "javascript", "java", "cpp"];
    }
  })();

  // Reset to starter code helper
  const handleReset = () => {
    try {
      const starterMap = JSON.parse(problem.starterCode as unknown as string);
      const starter = starterMap[language] ?? "";
      setCode(starter);
    } catch {
      setCode("");
    }
  };

  // Copy code helper
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Language:</span>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="border border-slate-200 rounded-md px-2.5 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-slate-700"
          >
            {languageOptions.map((l: string) => (
              <option key={l} value={l}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium py-1 px-3 rounded-md border border-slate-200 text-xs transition-all active:scale-95"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium py-1 px-3 rounded-md border border-slate-200 text-xs transition-all active:scale-95"
            title="Reset to Starter Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Monaco editor */}
      <div className="flex-1 min-h-[300px] border border-slate-200 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language === "cpp" ? "cpp" : language === "python" ? "python" : language === "javascript" ? "javascript" : "java"}
          value={code}
          onChange={value => setCode(value ?? "")}
          theme="vs-dark"
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            tabSize: 4,
          }}
        />
      </div>

      {/* Custom input area */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Custom Input</h3>
        <textarea
          className="w-full h-24 p-3 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 bg-slate-50/50 text-slate-700 resize-y"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          placeholder="Enter custom input to execute your code against..."
        />
      </div>
    </div>
  );
}
