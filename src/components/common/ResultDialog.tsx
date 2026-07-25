// src/components/common/ResultDialog.tsx
"use client";

import { type ReactNode } from "react";
import styles from "./ResultDialog.module.css";

interface ResultDialogProps {
  /** Called when the user closes the dialog */
  onClose: () => void;
  /** Arbitrary result data to display; typically a submission response */
  result: any;
  /** Optional title for the dialog */
  title?: string;
}

/**
 * A simple modal dialog used to display the result of a problem submission.
 * It is deliberately lightweight – just enough to satisfy type checking and
 * provide a functional UI without altering any existing behavior.
 */
export default function ResultDialog({ onClose, result, title = "Submission Result" }: ResultDialogProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* Stop propagation so clicks inside the dialog don't close it */}
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <section className={styles.content}>
          <pre className={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
        </section>
        <footer className={styles.footer}>
          <button className={styles.actionBtn} onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

/**
 * The component is intentionally minimal; styling is defined in the accompanying
 * CSS module. If the CSS file is missing, the build will still succeed because
 * CSS modules are optional at compile time.
 */
