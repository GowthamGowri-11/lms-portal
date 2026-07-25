'use client';

import { createContext, useContext, useState } from 'react';

type LearnContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
};

const LearnContext = createContext<LearnContextType | undefined>(undefined);

export function LearnProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <LearnContext.Provider value={{ sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen }}>
      {children}
    </LearnContext.Provider>
  );
}

export function useLearn() {
  const context = useContext(LearnContext);
  if (!context) throw new Error('useLearn must be used within LearnProvider');
  return context;
}
