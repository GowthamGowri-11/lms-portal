'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Token = { text: string; color?: string };
type Line = Token[];

const lines: Line[] = [
  [
    { text: 'const ', color: 'var(--accent-tertiary)' },
    { text: 'career ', color: 'var(--accent-primary)' },
    { text: '= ', color: 'rgba(255, 255, 255, 0.7)' },
    { text: 'learn', color: 'var(--accent-secondary)' },
    { text: '();', color: 'rgba(255, 255, 255, 0.7)' },
  ],
  [
    { text: 'const ', color: 'var(--accent-tertiary)' },
    { text: 'skills ', color: 'var(--accent-primary)' },
    { text: '= ', color: 'rgba(255, 255, 255, 0.7)' },
    { text: 'grow', color: 'var(--accent-secondary)' },
    { text: '();', color: 'rgba(255, 255, 255, 0.7)' },
  ],
  [
    { text: 'export ', color: 'var(--accent-tertiary)' },
    { text: 'success;', color: 'var(--accent-primary)' },
  ]
];

export default function CodeTypingAnimation() {
  const [displayedChars, setDisplayedChars] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Calculate total characters
  const totalChars = lines.reduce(
    (acc, line) => acc + line.reduce((lineAcc, token) => lineAcc + token.text.length, 0),
    0
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isTyping && displayedChars < totalChars) {
      // Type next character
      timeout = setTimeout(() => {
        setDisplayedChars((prev) => prev + 1);
      }, Math.random() * 50 + 30); // Random delay for realistic typing
    } else if (isTyping && displayedChars === totalChars) {
      // Pause at the end, then start deleting
      timeout = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    } else if (!isTyping && displayedChars > 0) {
      // Delete characters
      timeout = setTimeout(() => {
        setDisplayedChars((prev) => prev - 1);
      }, 20); // Faster deletion
    } else if (!isTyping && displayedChars === 0) {
      // Pause briefly before restarting
      timeout = setTimeout(() => {
        setIsTyping(true);
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [displayedChars, isTyping, totalChars]);

  // Helper to get visible tokens based on current displayedChars
  const renderLines = () => {
    let charsRemaining = displayedChars;
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const visibleTokens = [];

      for (let j = 0; j < line.length; j++) {
        const token = line[j];
        if (charsRemaining <= 0) break;

        if (charsRemaining >= token.text.length) {
          // Add full token
          visibleTokens.push(
            <span key={j} style={{ color: token.color }}>
              {token.text}
            </span>
          );
          charsRemaining -= token.text.length;
        } else {
          // Add partial token
          visibleTokens.push(
            <span key={j} style={{ color: token.color }}>
              {token.text.substring(0, charsRemaining)}
            </span>
          );
          charsRemaining = 0;
        }
      }

      if (visibleTokens.length > 0) {
        result.push(
          <div key={i} style={{ whiteSpace: 'nowrap' }}>
            {visibleTokens}
            {/* Show blinking cursor on the active line */}
            {charsRemaining === 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '16px',
                  background: 'var(--accent-primary)',
                  marginLeft: '4px',
                  verticalAlign: 'middle',
                }}
              />
            )}
          </div>
        );
      } else {
        // Empty lines to maintain layout height (optional, but good for stability)
        result.push(<div key={i} style={{ height: '24px' }}></div>);
      }
    }

    // Always ensure we have 3 lines rendered to prevent the card height from collapsing
    while (result.length < 3) {
        result.push(<div key={`empty-${result.length}`} style={{ height: '24px' }}></div>);
    }

    // Add cursor to line 0 if completely empty
    if (displayedChars === 0) {
        result[0] = (
          <div key="0" style={{ whiteSpace: 'nowrap', height: '24px' }}>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '16px',
                  background: 'var(--accent-primary)',
                  marginLeft: '4px',
                  verticalAlign: 'middle',
                }}
              />
          </div>
        )
    }

    return result;
  };

  return <>{renderLines()}</>;
}
