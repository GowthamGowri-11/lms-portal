// src/app/learn/[courseId]/lesson/[lessonId]/problem/[problemId]/CodingProblemClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import {
  ArrowLeft, Play, RotateCcw, Send, CheckCircle,
  XCircle, Clock, Cpu, ChevronDown,
} from 'lucide-react';
import { CodingProblem, Course } from '@/generated/prisma/client';
import styles from './problem.module.css';

const LANGUAGES = ['python', 'javascript', 'java', 'cpp'];

export default function CodingProblemClient({
  problem,
  course,
  lessonId,
  student,
  submissions = [],
}: {
  problem: CodingProblem;
  course: Course;
  lessonId: string;
  student: any;
  submissions?: any[];
}) {
  const router = useRouter();

  const examples: { input: string; output: string; explanation: string }[] = (() => {
    try { return JSON.parse(problem.examples); } catch { return []; }
  })();

  const starterCodeMap: Record<string, string> = (() => {
    try { return JSON.parse(problem.starterCode); } catch { return {}; }
  })();

  const languages: string[] = (() => {
    try { return JSON.parse(problem.languages); } catch { return LANGUAGES; }
  })();

  const visibleTests: { input: string; expected: string }[] = (() => {
    try { return JSON.parse(problem.visibleTests); } catch { return []; }
  })();

  const [language, setLanguage] = useState(languages[0] ?? 'python');
  
  // Load code from latest submission if available, otherwise starter code
  const latestSubForLang = submissions.find((s) => s.language === language);
  const [code, setCode] = useState(latestSubForLang?.code ?? starterCodeMap[language] ?? '');
  
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'description' | 'examples' | 'testcases' | 'submissions'>('description');
  const [passed, setPassed] = useState(0);

  // Submissions list state to handle dynamic updates
  const [submissionsList, setSubmissionsList] = useState<any[]>(submissions);

  // Sync editor code when language changes
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const sub = submissionsList.find((s) => s.language === lang);
    setCode(sub?.code ?? starterCodeMap[lang] ?? '');
  };

  const handleRun = async () => {
    setStatus('running');
    setOutput('');
    try {
      const response = await fetch('/api/problems/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code,
          input: customInput,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutput(data.output || (data.error ? `Error: ${data.error}` : ''));
        
        // Map engine status to local success/error
        const isRunSuccess = data.status === 'success' || data.status === 'Accepted';
        setStatus(isRunSuccess ? 'success' : 'error');
        
        if (isRunSuccess) {
          setPassed(visibleTests.length);
        } else {
          setPassed(0);
        }
      } else {
        const errText = await response.text();
        setOutput(`Execution error: ${errText}`);
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setOutput('Failed to run code.');
      setStatus('error');
    }
  };

  const handleSubmit = async () => {
    setStatus('running');
    setOutput('');
    try {
      const response = await fetch('/api/problems/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          problemId: problem.id,
          language,
          code,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutput(data.output);
        
        const isSubmitAccepted = data.status === 'Accepted' || data.status === 'success';
        setStatus(isSubmitAccepted ? 'success' : 'error');
        setPassed(data.passedTests ?? 0);
        
        // Refresh submissions tab list
        const subRes = await fetch(`/api/practice/submissions/${problem.id}?studentId=${student.id}`);
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubmissionsList(subData);
        }

        // Refresh sidebar progress
        router.refresh();
      } else {
        const errText = await response.text();
        setOutput(`Submission error: ${errText}`);
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setOutput('Failed to submit code.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setCode(starterCodeMap[language] ?? '');
    setOutput('');
    setStatus('idle');
    setPassed(0);
  };

  return (
    <div className={styles.layout}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <Link href={`/learn/${course.id}/lesson/${lessonId}`} className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Lesson
        </Link>
        <div className={styles.problemTitle}>{problem.title}</div>
        <span className={`${styles.difficulty} ${styles[`diff${problem.difficulty}`]}`}>
          {problem.difficulty}
        </span>
      </div>

      <div className={styles.body}>
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          {/* Tabs */}
          <div className={styles.leftTabs}>
            {(['description', 'examples', 'testcases', 'submissions'] as const).map((tab) => (
              <button
                key={tab}
                className={`${styles.leftTab} ${activeTab === tab ? styles.leftTabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className={styles.leftContent}>
            {activeTab === 'description' && (
              <div>
                <p className={styles.description}>{problem.description}</p>
                {problem.inputFormat && (
                  <div className={styles.formatBlock}>
                    <h4>Input Format</h4>
                    <p>{problem.inputFormat}</p>
                  </div>
                )}
                {problem.outputFormat && (
                  <div className={styles.formatBlock}>
                    <h4>Output Format</h4>
                    <p>{problem.outputFormat}</p>
                  </div>
                )}
                {problem.constraints && (
                  <div className={styles.formatBlock}>
                    <h4>Constraints</h4>
                    <p>{problem.constraints}</p>
                  </div>
                )}
                <div className={styles.limits}>
                  <div className={styles.limitItem}>
                    <Clock size={14} />
                    <span>Time Limit: {problem.timeLimit}s</span>
                  </div>
                  <div className={styles.limitItem}>
                    <Cpu size={14} />
                    <span>Memory: {problem.memoryLimit} MB</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'examples' && (
              <div className={styles.examples}>
                {examples.map((ex, i) => (
                  <div key={i} className={styles.exampleBlock}>
                    <div className={styles.exampleTitle}>Example {i + 1}</div>
                    {ex.input && (
                      <div className={styles.ioBlock}>
                        <div className={styles.ioLabel}>Input:</div>
                        <pre className={styles.ioPre}>{ex.input}</pre>
                      </div>
                    )}
                    <div className={styles.ioBlock}>
                      <div className={styles.ioLabel}>Output:</div>
                      <pre className={styles.ioPre}>{ex.output}</pre>
                    </div>
                    {ex.explanation && (
                      <div className={styles.explanation}>
                        <strong>Explanation:</strong> {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className={styles.testCases}>
                {visibleTests.map((tc, i) => (
                  <div key={i} className={styles.testCase}>
                    <div className={styles.testCaseHeader}>
                      Test Case {i + 1}
                      {status !== 'idle' && (
                        i < passed
                          ? <CheckCircle size={14} className={styles.passIcon} />
                          : <XCircle size={14} className={styles.failIcon} />
                      )}
                    </div>
                    {tc.input && (
                      <div className={styles.ioBlock}>
                        <div className={styles.ioLabel}>Input:</div>
                        <pre className={styles.ioPre}>{tc.input || '(none)'}</pre>
                      </div>
                    )}
                    <div className={styles.ioBlock}>
                      <div className={styles.ioLabel}>Expected:</div>
                      <pre className={styles.ioPre}>{tc.expected}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className={styles.submissionsList}>
                {submissionsList.length > 0 ? (
                  submissionsList.map((sub, i) => {
                    const isAccepted = sub.status === 'success' || sub.status === 'Accepted';
                    return (
                      <div key={sub.id} style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', borderRadius: 12, marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{sub.language}</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isAccepted ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                            {isAccepted ? 'Accepted' : sub.status || 'Failed'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Submitted at: {new Date(sub.submittedAt).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          Time: {sub.timeTaken.toFixed(3)}s • Memory: {sub.memoryUsed.toFixed(1)} MB • Test cases: {sub.passedTests}/{sub.totalTests}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className={styles.emptyState}>No submissions yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className={styles.rightPanel}>
          {/* Editor Toolbar */}
          <div className={styles.editorToolbar}>
            <div className={styles.langSelector}>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={styles.langSelect}
              >
                {languages.map((l) => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
              <ChevronDown size={14} className={styles.langArrow} />
            </div>
            <div className={styles.editorActions}>
              <button className={styles.resetBtn} onClick={handleReset} title="Reset code">
                <RotateCcw size={15} />
              </button>
              <button
                className={`btn btn-secondary btn-sm ${styles.runBtn}`}
                onClick={handleRun}
                disabled={status === 'running'}
              >
                <Play size={15} />
                {status === 'running' ? 'Running...' : 'Run'}
              </button>
              <button
                className={`btn btn-primary btn-sm`}
                onClick={handleSubmit}
                disabled={status === 'running'}
              >
                <Send size={15} />
                Submit
              </button>
            </div>
          </div>

          {/* Monaco Code Editor Wrapper */}
          <div className={styles.codeEditor} style={{ padding: 0, minHeight: '300px', flex: 1 }}>
            <Editor
              height="100%"
              defaultLanguage={language}
              language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : language === 'javascript' ? 'javascript' : 'java'}
              value={code}
              onChange={(value) => setCode(value ?? '')}
              theme="vs-dark"
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                tabSize: 4,
              }}
            />
          </div>

          {/* Custom Input */}
          <div className={styles.inputSection}>
            <div className={styles.inputLabel}>Custom Input</div>
            <textarea
              className={styles.customInput}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter custom input (optional)..."
              rows={3}
            />
          </div>

          {/* Output */}
          <div className={styles.outputSection}>
            <div className={styles.outputHeader}>
              <span className={styles.outputLabel}>Output</span>
              {status !== 'idle' && (
                <span className={`${styles.outputStatus} ${status === 'success' ? styles.outputSuccess : status === 'error' ? styles.outputError : styles.outputRunning}`}>
                  {status === 'running' ? 'Running...' : status === 'success' ? 'Passed' : 'Failed'}
                </span>
              )}
            </div>
            <pre className={`${styles.outputPre} ${status === 'success' ? styles.outputPreSuccess : status === 'error' ? styles.outputPreError : ''}`}>
              {status === 'running' ? (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                >
                  Executing...
                </motion.span>
              ) : output || 'Run your code to see output here.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
