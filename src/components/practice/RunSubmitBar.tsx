// src/components/practice/RunSubmitBar.tsx
"use client";

interface RunSubmitBarProps {
  onRun: () => void;
  onSubmit: () => void;
  status: "idle" | "running" | "success" | "error";
}

export default function RunSubmitBar({ onRun, onSubmit, status }: RunSubmitBarProps) {
  const disabled = status === "running";
  return (
    <div className="flex justify-center space-x-4 mt-2">
      <button
        onClick={onRun}
        disabled={disabled}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-all disabled:opacity-50"
      >
        Run
      </button>
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-all disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
}
