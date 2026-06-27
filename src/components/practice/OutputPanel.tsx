// src/components/practice/OutputPanel.tsx
"use client";

interface OutputPanelProps {
  output: string;
  status: "idle" | "running" | "success" | "error";
}

export default function OutputPanel({ output, status }: OutputPanelProps) {
  return (
    <div className="mt-2 overflow-y-auto border-t pt-2 flex-1 min-h-0">
      <h3 className="text-lg font-medium text-slate-800 mb-1">Output</h3>
      <pre className="bg-gray-50 p-2 rounded whitespace-pre-wrap h-full overflow-y-auto">
        {output || (status === "running" ? "Running..." : "No output yet.")}
      </pre>
    </div>
  );
}
