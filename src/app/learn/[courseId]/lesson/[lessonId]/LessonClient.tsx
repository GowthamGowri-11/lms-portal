'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, CheckCircle, Play, Lock,
  BookOpen, Code, FileText, Menu, X, ArrowLeft,
  Download, ExternalLink, Eye, ClipboardList, FileCode,
  GitBranch, Globe, ExternalLink as YoutubeLink, Calendar, Award, RotateCcw,
} from 'lucide-react';
import { Course, Lesson, CodingProblem } from '@/generated/prisma/client';
import type { LessonNote, LessonResource, LessonAssignment, LessonPracticeFile } from '@/generated/prisma/client';
import { useLearn } from '@/app/learn/[courseId]/LearnContext';
import ReactMarkdown from 'react-markdown';
import styles from './lesson.module.css';



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

  // Using react-markdown for robust rendering

  const nextLocked = nextItem ? !completed : false;

  const trackDownload = async (noteId: string) => {
    try {
      await fetch('/api/lessons/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId }),
      });
    } catch { /* non-fatal */ }
  };

  const resourceIcon = (type: string) => {
    if (type === 'GitHub') return <GitBranch size={15} />;
    if (type === 'YouTube') return <YoutubeLink size={15} />;
    if (type === 'Official Website' || type === 'Documentation') return <Globe size={15} />;
    return <ExternalLink size={15} />;
  };

  return (
    <div className={styles.layout}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <Link href={`/courses/${course.id}`} className={styles.mobileBack}>
          <ArrowLeft size={18} />
        </Link>
        <div className={styles.mobileTitle}>{lesson.title}</div>
        <button className={styles.mobileMenuBtn} onClick={() => setMobileSidebarOpen(true)}>
          <Menu size={20} />
        </button>
      </div>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.glassContainer}>
          {/* Lesson Header */}
          <div className={styles.lessonHeader}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href={`/courses/${course.id}`} className={styles.backButton}>
                <ArrowLeft size={16} />
                <span>Back to Course</span>
              </Link>
              <div>
                <h1 className={styles.lessonTitle}>{lesson.title}</h1>
                {lesson.description && <p className={styles.lessonDesc}>{lesson.description}</p>}
              </div>
            </div>
          </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {[
            { key: 'notes', label: 'Lesson Notes', icon: <FileText size={15} /> },
            ...(lessonNotes.length > 0 ? [{ key: 'docs', label: `Notes (${lessonNotes.length})`, icon: <Download size={15} /> }] : []),
            ...(lessonResources.length > 0 ? [{ key: 'resources', label: `Resources (${lessonResources.length})`, icon: <BookOpen size={15} /> }] : []),
            ...(lessonAssignments.length > 0 ? [{ key: 'assignments', label: `Assignments (${lessonAssignments.length})`, icon: <ClipboardList size={15} /> }] : []),
            ...(lessonPracticeFiles.length > 0 ? [{ key: 'practice', label: `Practice (${lessonPracticeFiles.length})`, icon: <FileCode size={15} /> }] : []),
            ...(codingProblems.length > 0
              ? [{ key: 'coding', label: `Problems (${codingProblems.length})`, icon: <Code size={15} /> }]
              : []),
          ].map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'notes' && (
            <div className={styles.notesContent}>
              {lesson.notes ? (
                <div className={styles.notesBody}>
                  <ReactMarkdown>{lesson.notes}</ReactMarkdown>
                </div>
              ) : (
                <p className={styles.emptyState}>No lesson notes available.</p>
              )}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className={styles.resourcesContent}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Download course notes for this lesson.
              </p>
              {lessonNotes.map((note) => (
                <div key={note.id} className={styles.resourceItem} style={{ marginBottom: 8, flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                    <FileText size={16} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title}</div>
                      {note.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{note.description}</div>}
                      <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '1px 6px', borderRadius: 5, fontWeight: 700 }}>{note.fileType.toUpperCase()}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{note.category}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>v{note.version}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>↓ {note.downloadCount}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {note.fileType === 'pdf' && (
                        <a
                          href={note.secureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`btn btn-secondary btn-sm`}
                          style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                          onClick={() => trackDownload(note.id)}
                        >
                          <Eye size={13} /> View
                        </a>
                      )}
                      <a
                        href={note.secureUrl}
                        download
                        className={`btn btn-primary btn-sm`}
                        style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                        onClick={() => trackDownload(note.id)}
                      >
                        <Download size={13} /> Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className={styles.resourcesContent}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                External resources and reference links for this lesson.
              </p>
              {lessonResources.map((r) => (
                <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className={styles.resourceItem} style={{ marginBottom: 8 }}>
                  {resourceIcon(r.type)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.title}</div>
                    {r.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{r.description}</div>}
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{r.type}</div>
                  </div>
                  <ExternalLink size={14} style={{ flexShrink: 0, opacity: 0.5 }} />
                </a>
              ))}
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className={styles.resourcesContent}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Complete and submit your assignments below.
              </p>
              {lessonAssignments.map((a) => (
                <div key={a.id} className={styles.resourceItem} style={{ marginBottom: 10, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
                    <ClipboardList size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.title}</div>
                      {a.description && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>{a.description}</div>}
                      <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {a.deadline && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--accent-warning)' }}>
                            <Calendar size={12} /> Due: {new Date(a.deadline).toLocaleDateString('en-US')}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          <Award size={12} /> {a.maxMarks} marks
                        </span>
                      </div>
                      {a.instructions && (
                        <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(99,102,241,0.04)', padding: '8px 12px', borderRadius: 8, lineHeight: 1.6 }}>
                          {a.instructions}
                        </div>
                      )}
                    </div>
                  </div>
                  {a.secureUrl && (
                    <div style={{ display: 'flex', gap: 8, paddingLeft: 28 }}>
                      <a href={a.secureUrl} target="_blank" rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
                        <Eye size={13} /> View PDF
                      </a>
                      <a href={a.secureUrl} download
                        className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
                        <Download size={13} /> Download
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'practice' && (
            <div className={styles.resourcesContent}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Download starter code, completed examples, and project files.
              </p>
              {lessonPracticeFiles.map((f) => (
                <div key={f.id} className={styles.resourceItem} style={{ marginBottom: 8, gap: 12 }}>
                  <FileCode size={16} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</div>
                    {f.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{f.description}</div>}
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.68rem', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', padding: '1px 6px', borderRadius: 5, fontWeight: 700 }}>{f.type}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{f.fileType.toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <a href={f.secureUrl} target="_blank" rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
                      <Eye size={13} /> View
                    </a>
                    <a href={f.secureUrl} download
                      className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
                      <Download size={13} /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'coding' && (
            <div className={styles.codingList}>
              <p className={styles.codingIntro}>Practice problems for this lesson:</p>
              {codingProblems.map((p) => (
                <Link
                  key={p.id}
                  href={`/learn/${course.id}/lesson/${lesson.id}/problem/${p.id}`}
                  className={styles.problemCard}
                >
                  <div className={styles.problemInfo}>
                    <span className={styles.problemTitle}>{p.title}</span>
                    <span className={`${styles.difficulty} ${styles[`diff${p.difficulty}`]}`}>
                      {p.difficulty}
                    </span>
                  </div>
                  <div className={styles.problemMeta}>
                    <span>{p.points} pts</span>
                    <ChevronRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className={styles.lessonNav}>
          {prevItem ? (
            <Link href={prevItem.url} className={`btn btn-secondary ${styles.navBtn}`}>
              <ChevronLeft size={18} />
              <span>
                <span className={styles.navLabel}>Previous</span>
                <span className={styles.navTitle}>{prevItem.title}</span>
              </span>
            </Link>
          ) : (
            <div />
          )}

          {completed ? (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className={`btn btn-secondary ${styles.navBtn}`}
                onClick={toggleComplete}
                disabled={isUpdating}
                title="Mark as incomplete to relearn"
              >
                <RotateCcw size={18} />
                <span>
                  <span className={styles.navLabel}>Relearn</span>
                  <span className={styles.navTitle}>Redo Topic</span>
                </span>
              </button>
              <div className={`btn btn-success ${styles.navBtn}`} style={{ cursor: 'default' }}>
                <CheckCircle size={18} />
                <span>
                  <span className={styles.navLabel}>Status</span>
                  <span className={styles.navTitle}>Completed!</span>
                </span>
              </div>
            </div>
          ) : (
            <button
              className={`btn btn-primary ${styles.navBtn}`}
              onClick={toggleComplete}
              disabled={isUpdating}
              style={{ minWidth: 200 }}
            >
              <CheckCircle size={18} />
              <span>
                <span className={styles.navLabel}>Status</span>
                <span className={styles.navTitle}>Mark as Complete</span>
              </span>
            </button>
          )}

          {nextItem ? (
            nextLocked ? (
              <div
                className={`btn btn-secondary ${styles.navBtn}`}
                style={{ cursor: 'not-allowed', opacity: 0.5, border: '1px dashed var(--glass-border)' }}
                title="Complete current lesson to unlock next"
              >
                <span>
                  <span className={styles.navLabel}>Next (Locked)</span>
                  <span className={styles.navTitle}>{nextItem.title}</span>
                </span>
                <Lock size={14} style={{ marginLeft: 6 }} />
              </div>
            ) : (
              <Link href={nextItem.url} className={`btn btn-primary ${styles.navBtn}`}>
                <span>
                  <span className={styles.navLabel}>Next</span>
                  <span className={styles.navTitle}>{nextItem.title}</span>
                </span>
                <ChevronRight size={18} />
              </Link>
            )
          ) : (
            <div />
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
