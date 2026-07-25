'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Token = { text: string; color?: string };
type Line = Token[];

const lines: Line[] = [
  [
    { text: 'import ', color: 'var(--accent-tertiary)' },
    { text: '{ Determination } ', color: 'rgba(255, 255, 255, 0.9)' },
    { text: 'from ', color: 'var(--accent-tertiary)' },
    { text: "'@/mindset';", color: 'var(--accent-warning)' },
  ],
  [],
  [
    { text: 'const ', color: 'var(--accent-tertiary)' },
    { text: 'potential ', color: 'var(--accent-primary)' },
    { text: '= ', color: 'rgba(255, 255, 255, 0.7)' },
    { text: 'unlock', color: 'var(--accent-secondary)' },
    { text: '();', color: 'rgba(255, 255, 255, 0.7)' },
  ],
  [
    { text: 'const ', color: 'var(--accent-tertiary)' },
    { text: 'limits ', color: 'var(--accent-primary)' },
    { text: '= ', color: 'rgba(255, 255, 255, 0.7)' },
    { text: 'break', color: 'var(--accent-secondary)' },
    { text: '();', color: 'rgba(255, 255, 255, 0.7)' },
  ],
  [],
  [
    { text: 'while ', color: 'var(--accent-tertiary)' },
    { text: '(', color: 'rgba(255, 255, 255, 0.7)' },
    { text: 'journey', color: 'var(--accent-primary)' },
    { text: '.', color: 'rgba(255, 255, 255, 0.7)' },
    { text: 'isOngoing', color: 'var(--accent-secondary)' },
    { text: ') {', color: 'rgba(255, 255, 255, 0.7)' },
  ],
  [
    { text: '  skills.', color: 'var(--accent-primary)' },
    { text: 'upgrade', color: 'var(--accent-secondary)' },
    { text: '(', color: 'rgba(255, 255, 255, 0.7)' },
    { text: 'Infinity', color: 'var(--accent-warning)' },
    { text: ');', color: 'rgba(255, 255, 255, 0.7)' },
  ],
  [
    { text: '  knowledge.', color: 'var(--accent-primary)' },
    { text: 'expand', color: 'var(--accent-secondary)' },
    { text: '();', color: 'rgba(255, 255, 255, 0.7)' },
  ],
  [
    { text: '}', color: 'rgba(255, 255, 255, 0.7)' },
  ],
  [],
  [
    { text: 'export const ', color: 'var(--accent-tertiary)' },
    { text: 'legacy ', color: 'var(--accent-primary)' },
    { text: '= ', color: 'rgba(255, 255, 255, 0.7)' },
    { text: 'build', color: 'var(--accent-secondary)' },
    { text: '();', color: 'rgba(255, 255, 255, 0.7)' },
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
      }, Math.random() * 40 + 15); // Slightly slower typing speed (~0.75x)
    } else if (isTyping && displayedChars === totalChars) {
      // Pause at the end, then start deleting
      timeout = setTimeout(() => {
        setIsTyping(false);
      }, 4000);
    } else if (!isTyping && displayedChars > 0) {
      // Delete characters (fast)
      timeout = setTimeout(() => {
        setDisplayedChars((prev) => prev - 2); // Delete 2 chars at a time
      }, 15); // Slightly slower deletion speed too
    } else if (!isTyping && displayedChars <= 0) {
      setDisplayedChars(0);
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

        let renderText = '';
        if (charsRemaining >= token.text.length) {
          renderText = token.text;
          charsRemaining -= token.text.length;
        } else {
          renderText = token.text.substring(0, charsRemaining);
          charsRemaining = 0;
        }

        // Render each character with a 3D pop animation
        const charElements = renderText.split('').map((char, charIdx) => {
          const isSpace = char === ' ';
          return (
            <motion.span
              key={`${i}-${j}-${charIdx}`}
              initial={{ opacity: 0, scale: 0.3, y: 15, rotateX: -90 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
            >
              {isSpace ? ' ' : char}
            </motion.span>
          );
        });

        visibleTokens.push(
          <span key={j} style={{ color: token.color }}>
            {charElements}
          </span>
        );
      }

      if (visibleTokens.length > 0 || (line.length === 0 && charsRemaining > 0)) {
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

    // Always ensure we have enough lines rendered to prevent the card height from collapsing
    while (result.length < 11) {
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

  return (
    <div style={{ perspective: '1000px', fontSize: '0.9rem' }}>
      {renderLines()}
    </div>
  );
}
