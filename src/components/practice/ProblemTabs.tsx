import React, { ReactNode, useState } from 'react';

interface Tab {
  label: string;
  content: ReactNode;
}

interface ProblemTabsProps {
  tabs: Tab[];
}

export default function ProblemTabs({ tabs }: ProblemTabsProps) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-300">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            className={`px-4 py-2 focus:outline-none ${idx === active ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
            onClick={() => setActive(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: 0 }}>
        {tabs[active].content}
      </div>
    </div>
  );
}
