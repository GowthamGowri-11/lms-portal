'use client';

import { useState, useEffect } from 'react';

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
      }, Math.random() * 50 + 60); // Noticeably slower typing speed
    } else if (isTyping && displayedChars === totalChars) {
      // Pause at the end, then start deleting
      timeout = setTimeout(() => {
        setIsTyping(false);
      }, 4000);
    } else if (!isTyping && displayedChars > 0) {
      // Delete characters
      timeout = setTimeout(() => {
        setDisplayedChars((prev) => Math.max(0, prev - 1)); // Delete 1 char at a time for smoother, slower erasing
      }, 15); // Effectively half the original speed
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

        let renderText = '';
        if (charsRemaining >= token.text.length) {
          renderText = token.text;
          charsRemaining -= token.text.length;
        } else {
          renderText = token.text.substring(0, charsRemaining);
          charsRemaining = 0;
        }

        visibleTokens.push(
          <span key={j} style={{ color: token.color, display: 'inline', whiteSpace: 'pre' }}>
            {renderText}
          </span>
        );
      }

      if (visibleTokens.length > 0 || (line.length === 0 && charsRemaining > 0)) {
        result.push(
          <div key={i} style={{ whiteSpace: 'nowrap', minHeight: '24px' }}>
            {visibleTokens}
            {/* Show blinking cursor on the active line */}
            {charsRemaining === 0 && (
              <span className="typing-cursor" />
            )}
          </div>
        );
      } else {
        // Empty lines to maintain layout height
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
            <span className="typing-cursor" />
          </div>
        );
    }

    return result;
  };

  return (
    <div style={{ perspective: '1000px', fontSize: '0.9rem', minHeight: '285px' }}>
      {renderLines()}
      <style>{`
        .typing-cursor {
          display: inline-block;
          width: 8px;
          height: 16px;
          background: var(--accent-primary);
          margin-left: 4px;
          vertical-align: middle;
          animation: blink-cursor 0.8s infinite step-end;
        }
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
