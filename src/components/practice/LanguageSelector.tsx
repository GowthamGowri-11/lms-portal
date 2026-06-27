// src/components/practice/LanguageSelector.tsx
"use client";

interface LanguageSelectorProps {
  language: string;
  setLanguage: (lang: string) => void;
  options: string[];
}

export default function LanguageSelector({ language, setLanguage, options }: LanguageSelectorProps) {
  return (
    <select
      value={language}
      onChange={e => setLanguage(e.target.value)}
      className="border rounded px-2 py-1 focus:outline-none bg-white"
    >
      {options.map(l => (
        <option key={l} value={l}>
          {l}
        </option>
      ))}
    </select>
  );
}
