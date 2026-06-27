'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, CheckCircle, Play, Lock,
  BookOpen, Code, FileText, Menu, X, ArrowLeft,
} from 'lucide-react';
import { Course, Lesson, CodingProblem } from '@/generated/prisma/client';
import { useLearn } from '@/app/learn/[courseId]/LearnContext';
import styles from './lesson.module.css';

function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function LessonClient({
  course,
  lesson,
  student,
  initialProgress,
  prevItem,
  nextItem,
  codingProblems,
}: {
  course: Course;
  lesson: Lesson;
  student: any;
  initialProgress: any;
  prevItem: any;
  nextItem: any;
  codingProblems: CodingProblem[];
}) {
  const router = useRouter();
  const { setMobileSidebarOpen } = useLearn();
  
  const [activeTab, setActiveTab] = useState<'notes' | 'resources' | 'coding'>('notes');
  const [completed, setCompleted] = useState(initialProgress?.completed ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressSavedRef = useRef<number>(initialProgress?.watchedSeconds ?? 0);

  // Sync completed state with server initialProgress
  useEffect(() => {
    setCompleted(initialProgress?.completed ?? false);
    progressSavedRef.current = initialProgress?.watchedSeconds ?? 0;
  }, [lesson.id, initialProgress]);

  const saveProgress = async (watchedSeconds: number, totalDuration: number, forceCompleted = false) => {
    if (watchedSeconds === 0 || totalDuration === 0) return;
    
    // Avoid redundant network requests if progress hasn't changed much
    if (!forceCompleted && Math.abs(watchedSeconds - progressSavedRef.current) < 4) {
      return;
    }
    
    progressSavedRef.current = watchedSeconds;
    
    try {
      const isWatchCompleted = forceCompleted || (watchedSeconds / totalDuration >= 0.90);
      
      const response = await fetch('/api/lessons/video-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          lessonId: lesson.id,
          watchedSeconds,
          totalDuration,
          completed: isWatchCompleted,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.progress?.completed && !completed) {
          setCompleted(true);
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Failed to save video progress', error);
    }
  };

  // Video tracking for YouTube
  useEffect(() => {
    const ytId = getYouTubeId(lesson.videoUrl);
    if (!ytId) return;

    let player: any = null;
    let intervalId: any = null;

    const initPlayer = () => {
      player = new (window as any).YT.Player('yt-player', {
        videoId: ytId,
        playerVars: {
          start: Math.floor(progressSavedRef.current),
          autoplay: 0,
        },
        events: {
          onReady: () => {
            // Player loaded
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              intervalId = setInterval(() => {
                if (player && player.getCurrentTime) {
                  const currentTime = player.getCurrentTime();
                  const duration = player.getDuration();
                  saveProgress(currentTime, duration);
                }
              }, 5000);
            } else {
              if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
              }
              if (player && player.getCurrentTime) {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                const isEnded = event.data === (window as any).YT.PlayerState.ENDED;
                saveProgress(currentTime, duration, isEnded);
              }
            }
          },
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };

      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (player && player.destroy) player.destroy();
    };
  }, [lesson.id, lesson.videoUrl]);

  // Video tracking for Direct MP4 Video
  const handleDirectVideoTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      saveProgress(currentTime, duration);
    }
  };

  const handleDirectVideoPause = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      saveProgress(currentTime, duration);
    }
  };

  const handleDirectVideoEnded = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      saveProgress(currentTime, duration, true);
    }
  };

  const handleDirectVideoMetadata = () => {
    if (videoRef.current && progressSavedRef.current > 0) {
      videoRef.current.currentTime = progressSavedRef.current;
    }
  };

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

  // Parse notes markdown-ish
  const parseNotes = (notes: string) => {
    return notes
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} className={styles.notesH1}>{line.slice(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className={styles.notesH2}>{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className={styles.notesH3}>{line.slice(4)}</h3>;
        if (line.startsWith('- ')) return <li key={i} className={styles.notesBullet}>{line.slice(2)}</li>;
        if (line.startsWith('```')) return null;
        if (line.trim() === '') return <br key={i} />;
        
        // Inline bold
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className={styles.notesP}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      });
  };

  const resources = (() => {
    try { return JSON.parse(lesson.resources); } catch { return []; }
  })();

  const pdfResources = resources.filter(
    (r: any) => r.url?.toLowerCase().endsWith('.pdf') || r.name?.toLowerCase().includes('pdf')
  );
  const notesResources = resources.filter(
    (r: any) => r.name?.toLowerCase().includes('notes') || r.name?.toLowerCase().includes('note')
  );
  const otherResources = resources.filter(
    (r: any) => !pdfResources.includes(r) && !notesResources.includes(r)
  );

  const nextLocked = nextItem ? !completed : false;

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
        {/* Video Area */}
        <div className={styles.videoSection}>
          {lesson.videoUrl ? (
            getYouTubeId(lesson.videoUrl) ? (
              <div className={styles.videoWrapper}>
                <div id="yt-player" className={styles.videoIframe}></div>
              </div>
            ) : (
              <div className={styles.videoWrapper}>
                <video
                  ref={videoRef}
                  src={lesson.videoUrl}
                  controls
                  className={styles.videoIframe}
                  onLoadedMetadata={handleDirectVideoMetadata}
                  onTimeUpdate={handleDirectVideoTimeUpdate}
                  onPause={handleDirectVideoPause}
                  onEnded={handleDirectVideoEnded}
                />
              </div>
            )
          ) : (
            <div className={styles.videoPlaceholder}>
              <Play size={48} />
              <p>Video coming soon</p>
            </div>
          )}
        </div>

        {/* Lesson Header */}
        <div className={styles.lessonHeader}>
          <div>
            <h1 className={styles.lessonTitle}>{lesson.title}</h1>
            {lesson.description && <p className={styles.lessonDesc}>{lesson.description}</p>}
          </div>
          <button
            className={`${styles.completeBtn} ${completed ? styles.completeBtnDone : ''}`}
            onClick={toggleComplete}
            disabled={isUpdating}
          >
            <CheckCircle size={18} />
            {completed ? 'Completed!' : 'Mark as Complete'}
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {[
            { key: 'notes', label: 'Lesson Notes', icon: <FileText size={15} /> },
            { key: 'resources', label: 'Resources', icon: <BookOpen size={15} /> },
            ...(codingProblems.length > 0
              ? [{ key: 'coding', label: `Practice (${codingProblems.length})`, icon: <Code size={15} /> }]
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
                <div className={styles.notesBody}>{parseNotes(lesson.notes)}</div>
              ) : (
                <p className={styles.emptyState}>No notes available for this lesson.</p>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className={styles.resourcesContent}>
              {resources.length > 0 ? (
                <>
                  {pdfResources.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>Download PDF</h4>
                      {pdfResources.map((r: any, i: number) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className={styles.resourceItem} style={{ marginBottom: 6 }}>
                          <BookOpen size={16} />
                          <span>{r.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  {notesResources.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>Download Notes</h4>
                      {notesResources.map((r: any, i: number) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className={styles.resourceItem} style={{ marginBottom: 6 }}>
                          <FileText size={16} />
                          <span>{r.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  {otherResources.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>Download Attachments</h4>
                      {otherResources.map((r: any, i: number) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className={styles.resourceItem} style={{ marginBottom: 6 }}>
                          <FileText size={16} />
                          <span>{r.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className={styles.emptyState}>No resources for this lesson.</p>
              )}
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

          <button
            className={`btn ${completed ? 'btn-success' : 'btn-primary'} ${styles.navBtn}`}
            onClick={toggleComplete}
            disabled={isUpdating}
            style={{ minWidth: 200 }}
          >
            <CheckCircle size={18} />
            <span>
              <span className={styles.navLabel}>Status</span>
              <span className={styles.navTitle}>{completed ? 'Completed!' : 'Mark as Complete'}</span>
            </span>
          </button>

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
      </main>
    </div>
  );
}
