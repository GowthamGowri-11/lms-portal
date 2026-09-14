'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, CheckCircle, Play, Lock,
  BookOpen, Code, FileText, Menu, ArrowLeft,
  Download, ExternalLink, Eye, ClipboardList, FileCode,
  GitBranch, Globe, Video, Calendar, Award, RotateCcw,
  Copy, Check, Sparkles, Clock, Compass, Layers, CheckCircle2
} from 'lucide-react';
import type { Course, Lesson, CodingProblem } from '@/generated/prisma/client';
import type { LessonNote, LessonResource, LessonAssignment, LessonPracticeFile } from '@/generated/prisma/client';
import { useLearn } from '@/app/learn/[courseId]/LearnContext';
import ReactMarkdown from 'react-markdown';
import styles from './lesson.module.css';

function normalizeLanguageLabel(lang: string | undefined, courseCategory?: string, courseTitle?: string): string {
  const l = (lang || '').toLowerCase().trim();
  if (l === 'cpp' || l === 'c++') return 'C++';
  if (l === 'c') return 'C';
  if (l === 'py' || l === 'python') return 'PYTHON';
  if (l === 'js' || l === 'javascript') return 'JAVASCRIPT';
  if (l === 'ts' || l === 'typescript') return 'TYPESCRIPT';
  if (l === 'java') return 'JAVA';
  if (l === 'html') return 'HTML';
  if (l === 'css') return 'CSS';
  if (l === 'sql') return 'SQL';
  if (l === 'rust') return 'RUST';
  if (l === 'go' || l === 'golang') return 'GO';
  if (l === 'sh' || l === 'bash' || l === 'shell') return 'BASH';
  if (l === 'json') return 'JSON';
  if (l) return l.toUpperCase();

  const ct = `${courseCategory || ''} ${courseTitle || ''}`.toLowerCase();
  if (ct.includes('c++') || ct.includes('cpp')) return 'C++';
  if (ct.includes('python')) return 'PYTHON';
  if (ct.includes('java') && !ct.includes('script')) return 'JAVA';
  if (ct.includes('react') || ct.includes('next') || ct.includes('web') || ct.includes('javascript')) return 'JAVASCRIPT';
  if (ct.includes('data') || ct.includes('sql')) return 'SQL';
  return 'CODE';
}

// Code Block Component with Dynamic Language, Mac Header, Line Numbers & Copy Feedback
function createCodeBlock(courseCategory?: string, courseTitle?: string) {
  return function CustomCodeBlock({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const rawLang = match ? match[1] : '';
    const displayLang = normalizeLanguageLabel(rawLang, courseCategory, courseTitle);
    const codeString = String(children).replace(/\n$/, '');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };

    if (inline || !match) {
      return (
        <code className={styles.inlineCode} {...props}>
          {children}
        </code>
      );
    }

    return (
      <div className={styles.codeEditorBlock}>
        <div className={styles.codeEditorHeader}>
          <div className={styles.codeEditorDots}>
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </div>
          <div className={styles.codeEditorMeta}>
            <span className={styles.codeLangBadge}>{displayLang}</span>
          </div>
          <button
            className={`${styles.copyCodeBtn} ${copied ? styles.copyCodeBtnCopied : ''}`}
            onClick={handleCopy}
            title="Copy code to clipboard"
          >
            {copied ? <Check size={12} className={styles.copyCheckIcon} /> : <Copy size={12} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
        <pre className={styles.codeEditorPre}>
          <code>{codeString}</code>
        </pre>
      </div>
    );
  };
}

export default function LessonClient({
  course,
  lesson,
  student,
  initialProgress,
  prevItem,
  nextItem,
  codingProblems,
  lessonNotes,
  lessonResources,
  lessonAssignments,
  lessonPracticeFiles,
}: {
  course: Course;
  lesson: Lesson;
  student: any;
  initialProgress: any;
  prevItem: any;
  nextItem: any;
  codingProblems: CodingProblem[];
  lessonNotes: LessonNote[];
  lessonResources: LessonResource[];
  lessonAssignments: LessonAssignment[];
  lessonPracticeFiles: LessonPracticeFile[];
}) {
  const router = useRouter();
  const { setMobileSidebarOpen } = useLearn();

  const [activeTab, setActiveTab] = useState<'notes' | 'docs' | 'resources' | 'assignments' | 'practice' | 'coding'>('notes');
  const [completed, setCompleted] = useState(initialProgress?.completed ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync completed state with server initialProgress
  useEffect(() => {
    setCompleted(initialProgress?.completed ?? false);
  }, [lesson.id, initialProgress]);

  const toggleComplete = async () => {
    setIsUpdating(true);
    try {
      const targetState = !completed;
      const res = await fetch('/api/lessons/mark-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          lessonId: lesson.id,
          completed: targetState,
        }),
      });

      if (res.ok) {
        setCompleted(targetState);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const nextLocked = nextItem ? !completed : false;

  const trackDownload = async (noteId: string) => {
    try {
      await fetch('/api/lessons/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId }),
      });
    } catch {
      /* non-fatal */
    }
  };

  const resourceIcon = (type: string) => {
    if (type === 'GitHub') return <GitBranch size={18} />;
    if (type === 'YouTube') return <Video size={18} />;
    if (type === 'Official Website' || type === 'Documentation') return <Globe size={18} />;
    return <ExternalLink size={18} />;
  };

  const CodeBlockComponent = createCodeBlock(course.category, course.title);

  return (
    <div className={styles.layout}>
      {/* ── SUBTLE ATLYX BACKGROUND ATMOSPHERE (5-10% INTENSITY) ── */}
      <div className={styles.learnAtmosphere} aria-hidden="true">
        <div className={styles.ambientGlowBlue} />
        <div className={styles.ambientGlowViolet} />
        <div className={styles.faintGridPattern} />
        <div className={styles.diagonalEnergyBeam} />
        <div className={styles.floatingOrb1} />
        <div className={styles.floatingOrb2} />
      </div>

      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <Link href={`/courses/${course.id}`} className={styles.mobileBack}>
          <ArrowLeft size={18} />
        </Link>
        <div className={styles.mobileTitle}>{lesson.title}</div>
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open Curriculum Menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Main Workspace */}
      <main className={styles.main}>
        <div className={styles.workspaceContainer}>
          {/* Top Command / Breadcrumbs Bar */}
          <div className={styles.topBar}>
            <div className={styles.breadcrumbs}>
              <Link href="/courses" className={styles.breadcrumbLink}>
                <Compass size={14} />
                <span>Courses</span>
              </Link>
              <ChevronRight size={13} className={styles.breadcrumbChevron} />
              <Link href={`/courses/${course.id}`} className={styles.breadcrumbLink}>
                <span>{course.title}</span>
              </Link>
              <ChevronRight size={13} className={styles.breadcrumbChevron} />
              <span className={styles.breadcrumbActive}>{lesson.title}</span>
            </div>

            <div className={styles.topBarActions}>
              <button
                className={`${styles.quickCompleteBtn} ${completed ? styles.quickCompleteBtnDone : ''}`}
                onClick={toggleComplete}
                disabled={isUpdating}
                title={completed ? 'Click to mark as incomplete' : 'Mark lesson as complete'}
              >
                {completed ? <CheckCircle2 size={14} className={styles.quickCheckDone} /> : <CheckCircle size={14} />}
                <span>{completed ? 'Completed' : 'Mark as Complete'}</span>
              </button>
            </div>
          </div>

          {/* Hero Overview Card */}
          <div className={styles.heroCard}>
            <div className={styles.heroCardAccentGlow} />
            <div className={styles.heroPillRow}>
              <span className={styles.lessonTagPill}>
                <Sparkles size={13} className={styles.tagSparkle} />
                <span>CORE LEARNING MODULE</span>
              </span>
              {completed ? (
                <span className={`${styles.statusPill} ${styles.statusPillCompleted}`}>
                  <CheckCircle size={12} />
                  <span>LESSON FINISHED</span>
                </span>
              ) : (
                <span className={`${styles.statusPill} ${styles.statusPillInProgress}`}>
                  <span className={styles.inProgressDot} />
                  <span>IN PROGRESS</span>
                </span>
              )}
            </div>

            <h1 className={styles.lessonTitle}>{lesson.title}</h1>

            {lesson.description && <p className={styles.lessonDesc}>{lesson.description}</p>}

            <div className={styles.heroDivider} />

            <div className={styles.heroMetaRow}>
              <div className={styles.metaItem}>
                <Clock size={14} className={styles.metaIcon} />
                <span>Duration: <strong>{lesson.duration || '15 min read'}</strong></span>
              </div>
              <div className={styles.metaSep}>•</div>
              <div className={styles.metaItem}>
                <Layers size={14} className={styles.metaIcon} />
                <span>Level: <strong>Comprehensive</strong></span>
              </div>
              {codingProblems.length > 0 && (
                <>
                  <div className={styles.metaSep}>•</div>
                  <div className={styles.metaItem}>
                    <Code size={14} className={styles.metaIconPurple} />
                    <span>Interactive Labs: <strong>{codingProblems.length} Problems</strong></span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tabs Navigation Bar */}
          <div className={styles.tabsContainer}>
            {[
              { key: 'notes', label: 'Lesson Guide & Notes', icon: <FileText size={15} /> },
              ...(lessonNotes.length > 0 ? [{ key: 'docs', label: 'PDF Notes', count: lessonNotes.length, icon: <Download size={15} /> }] : []),
              ...(lessonResources.length > 0 ? [{ key: 'resources', label: 'Web Resources', count: lessonResources.length, icon: <BookOpen size={15} /> }] : []),
              ...(lessonAssignments.length > 0 ? [{ key: 'assignments', label: 'Assignments', count: lessonAssignments.length, icon: <ClipboardList size={15} /> }] : []),
              ...(lessonPracticeFiles.length > 0 ? [{ key: 'practice', label: 'Starter Files', count: lessonPracticeFiles.length, icon: <FileCode size={15} /> }] : []),
              ...(codingProblems.length > 0 ? [{ key: 'coding', label: 'Coding Practice', count: codingProblems.length, icon: <Code size={15} /> }] : []),
            ].map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && <span className={styles.tabCountBadge}>{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Main Tab Content Panel */}
          <div className={styles.tabContentCard}>
            {activeTab === 'notes' && (
              <div className={styles.notesContent}>
                {lesson.notes ? (
                  <div className={styles.notesBody}>
                    <ReactMarkdown
                      components={{
                        code: CodeBlockComponent,
                      }}
                    >
                      {lesson.notes}
                    </ReactMarkdown>

                    {/* Key Takeaways Card */}
                    <div className={styles.takeawaysCard}>
                      <div className={styles.takeawaysHeader}>
                        <Sparkles size={18} />
                        <span>Core Takeaways & Best Practices</span>
                      </div>
                      <div className={styles.takeawaysList}>
                        <div className={styles.takeawayItem}>
                          <CheckCircle2 size={16} className={styles.takeawayCheckIcon} />
                          <span>Understand the architectural concepts and practical use cases covered in this module.</span>
                        </div>
                        <div className={styles.takeawayItem}>
                          <CheckCircle2 size={16} className={styles.takeawayCheckIcon} />
                          <span>Review the code snippets above and execute the interactive exercises in your development environment.</span>
                        </div>
                        <div className={styles.takeawayItem}>
                          <CheckCircle2 size={16} className={styles.takeawayCheckIcon} />
                          <span>Mark this lesson as completed when ready to unlock subsequent lessons and certification milestones.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className={styles.emptyState}>No written notes available for this lesson.</p>
                )}
              </div>
            )}

            {activeTab === 'docs' && (
              <div className={styles.resourcesList}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Download official lesson notes, study sheets, and PDF documentation:
                </p>
                {lessonNotes.map((note) => (
                  <div key={note.id} className={styles.resourceCard}>
                    <div className={styles.resourceLeft}>
                      <div className={styles.resourceIconContainer}>
                        <FileText size={20} />
                      </div>
                      <div className={styles.resourceInfo}>
                        <div className={styles.resourceTitle}>{note.title}</div>
                        {note.description && <div className={styles.resourceDesc}>{note.description}</div>}
                        <div className={styles.resourceMetaTags}>
                          <span className={`${styles.metaBadge} ${styles.metaBadgeAccent}`}>{note.fileType.toUpperCase()}</span>
                          <span className={styles.metaBadge}>{note.category}</span>
                          <span className={styles.metaBadge}>v{note.version}</span>
                          <span className={styles.metaBadge}>↓ {note.downloadCount} downloads</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.resourceActions}>
                      {note.fileType === 'pdf' && (
                        <a
                          href={note.secureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                          onClick={() => trackDownload(note.id)}
                        >
                          <Eye size={14} /> View
                        </a>
                      )}
                      <a
                        href={note.secureUrl}
                        download
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        onClick={() => trackDownload(note.id)}
                      >
                        <Download size={14} /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className={styles.resourcesList}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Handpicked reference materials, official repositories, and video deep-dives:
                </p>
                {lessonResources.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.resourceCard}
                  >
                    <div className={styles.resourceLeft}>
                      <div className={styles.resourceIconContainer}>
                        {resourceIcon(r.type)}
                      </div>
                      <div className={styles.resourceInfo}>
                        <div className={styles.resourceTitle}>{r.title}</div>
                        {r.description && <div className={styles.resourceDesc}>{r.description}</div>}
                        <div className={styles.resourceMetaTags}>
                          <span className={`${styles.metaBadge} ${styles.metaBadgeAccent}`}>{r.type}</span>
                        </div>
                      </div>
                    </div>
                    <ExternalLink size={16} style={{ color: 'var(--text-tertiary)' }} />
                  </a>
                ))}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className={styles.resourcesList}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Practical assessments to test your real-world understanding:
                </p>
                {lessonAssignments.map((a) => (
                  <div key={a.id} className={styles.resourceCard} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div className={styles.resourceLeft} style={{ width: '100%' }}>
                      <div className={styles.resourceIconContainer} style={{ background: '#fef3c7', color: '#d97706', borderColor: '#fde68a' }}>
                        <ClipboardList size={20} />
                      </div>
                      <div className={styles.resourceInfo}>
                        <div className={styles.resourceTitle}>{a.title}</div>
                        {a.description && <div className={styles.resourceDesc}>{a.description}</div>}
                        <div className={styles.resourceMetaTags}>
                          {a.deadline && (
                            <span className={styles.metaBadge} style={{ color: '#d97706', background: '#fffbeb' }}>
                              <Calendar size={11} style={{ marginRight: 4, display: 'inline' }} />
                              Due: {new Date(a.deadline).toLocaleDateString('en-US')}
                            </span>
                          )}
                          <span className={styles.metaBadge}>
                            <Award size={11} style={{ marginRight: 4, display: 'inline' }} />
                            {a.maxMarks} max marks
                          </span>
                        </div>
                      </div>
                    </div>
                    {a.instructions && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 8, width: '100%', border: '1px solid var(--glass-border)' }}>
                        <strong>Instructions:</strong> {a.instructions}
                      </div>
                    )}
                    {a.secureUrl && (
                      <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem' }}>
                        <a href={a.secureUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                          <Eye size={14} /> View Task PDF
                        </a>
                        <a href={a.secureUrl} download className="btn btn-primary btn-sm">
                          <Download size={14} /> Download Template
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'practice' && (
              <div className={styles.resourcesList}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Starter projects, solution templates, and boilerplate files:
                </p>
                {lessonPracticeFiles.map((f) => (
                  <div key={f.id} className={styles.resourceCard}>
                    <div className={styles.resourceLeft}>
                      <div className={styles.resourceIconContainer} style={{ background: '#ecfdf5', color: '#10b981', borderColor: '#a7f3d0' }}>
                        <FileCode size={20} />
                      </div>
                      <div className={styles.resourceInfo}>
                        <div className={styles.resourceTitle}>{f.title}</div>
                        {f.description && <div className={styles.resourceDesc}>{f.description}</div>}
                        <div className={styles.resourceMetaTags}>
                          <span className={styles.metaBadge} style={{ color: '#16a34a', background: '#f0fdf4' }}>{f.type}</span>
                          <span className={styles.metaBadge}>{f.fileType.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.resourceActions}>
                      <a href={f.secureUrl} download className="btn btn-primary btn-sm">
                        <Download size={14} /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'coding' && (
              <div className={styles.problemList}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Solve these hands-on coding challenges to test your implementation:
                </p>
                {codingProblems.map((p) => (
                  <Link
                    key={p.id}
                    href={`/learn/${course.id}/lesson/${lesson.id}/problem/${p.id}`}
                    className={styles.problemCard}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div className={styles.resourceIconContainer} style={{ background: '#faf5ff', color: '#9333ea', borderColor: '#e9d5ff' }}>
                        <Code size={20} />
                      </div>
                      <div>
                        <div className={styles.problemTitle}>{p.title}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                          <span className={`${styles.difficulty} ${styles[`diff${p.difficulty}`]}`}>
                            {p.difficulty}
                          </span>
                          <span className={styles.metaBadge}>{p.points} Points</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                      <span>Solve Lab</span>
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Sticky Action & Navigation Dock */}
          <div className={styles.bottomDock}>
            {/* Previous Lesson */}
            {prevItem ? (
              <Link href={prevItem.url} className={`${styles.dockNavBtn} ${styles.dockNavBtnLeft}`}>
                <ChevronLeft size={18} />
                <div className={styles.dockNavText}>
                  <span className={styles.dockNavSubtitle}>Previous Lesson</span>
                  <span className={styles.dockNavTitle}>{prevItem.title}</span>
                </div>
              </Link>
            ) : (
              <div style={{ minWidth: 180 }} />
            )}

            {/* Center Action: Mark as Complete / Completed status */}
            <div className={styles.dockCenterAction}>
              {completed ? (
                <>
                  <div className={styles.completedBadge}>
                    <CheckCircle2 size={18} />
                    <span>Lesson Completed</span>
                  </div>
                  <button
                    className={styles.redoBtn}
                    onClick={toggleComplete}
                    disabled={isUpdating}
                    title="Mark incomplete to review topic"
                  >
                    <RotateCcw size={14} />
                    <span>Relearn</span>
                  </button>
                </>
              ) : (
                <button
                  className={styles.markCompleteBtn}
                  onClick={toggleComplete}
                  disabled={isUpdating}
                >
                  <CheckCircle size={18} />
                  <span>Mark as Completed</span>
                </button>
              )}
            </div>

            {/* Next Lesson */}
            {nextItem ? (
              nextLocked ? (
                <div
                  className={`${styles.dockNavBtn} ${styles.dockNavBtnLocked}`}
                  title="Complete current lesson to unlock next"
                >
                  <div className={styles.dockNavText} style={{ textAlign: 'right' }}>
                    <span className={styles.dockNavSubtitle}>Locked Next</span>
                    <span className={styles.dockNavTitle}>{nextItem.title}</span>
                  </div>
                  <Lock size={16} style={{ marginLeft: 4 }} />
                </div>
              ) : (
                <Link href={nextItem.url} className={`${styles.dockNavBtn} ${styles.dockNavBtnRight}`}>
                  <div className={styles.dockNavText} style={{ textAlign: 'right' }}>
                    <span className={styles.dockNavSubtitle}>Next Lesson</span>
                    <span className={styles.dockNavTitle}>{nextItem.title}</span>
                  </div>
                  <ChevronRight size={18} />
                </Link>
              )
            ) : (
              <div style={{ minWidth: 180 }} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
