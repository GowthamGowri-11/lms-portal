"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Gracefully handle browser Back-Forward Cache (bfcache) restoration
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache; trigger smooth state check if needed
        window.dispatchEvent(new Event("resize"));
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}

