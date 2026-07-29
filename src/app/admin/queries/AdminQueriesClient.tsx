'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle, Clock, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { FadeInUp, PageTransition } from '@/components/animations/MotionWrappers';
import { formatDate } from '@/lib/utils';
import styles from './queries.module.css';

type Query = {
  id: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string;
  createdAt: string;
  student: { name: string; email: string; avatar: string };
};

export default function AdminQueriesClient({ queries: initial }: { queries: Query[] }) {
  const [queries, setQueries] = useState(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const openCount = queries.filter((q) => q.status === 'OPEN').length;
  const inProgressCount = queries.filter((q) => q.status === 'IN_PROGRESS').length;
  const resolvedCount = queries.filter((q) => q.status === 'RESOLVED').length;

  const handleReply = async (id: string, status: string) => {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/queries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminReply: replies[id] || '' }),
      });
      if (res.ok) {
        setQueries(queries.map((q) =>
          q.id === id ? { ...q, status, adminReply: replies[id] || q.adminReply } : q
        ));
        setExpandedId(null);
      }
    } finally {
      setSaving(null);
    }
  };

  const statusColors: Record<string, string> = {
    OPEN: 'badge-warning',
    IN_PROGRESS: 'badge-primary',
    RESOLVED: 'badge-success',
  };

  return (
    <PageTransition>
      <div className={styles.container}>
        <FadeInUp>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Student Queries</h1>
              <p className={styles.subtitle}>Manage and respond to student support requests</p>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className={styles.statsRow}>
            <div className={styles.statChip} style={{ borderColor: 'rgba(225,112,85,0.4)', color: '#e17055' }}>
              <MessageSquare size={14} /> {openCount} Open
            </div>
            <div className={styles.statChip} style={{ borderColor: 'rgba(108,92,231,0.4)', color: 'var(--accent-primary)' }}>
              <Clock size={14} /> {inProgressCount} In Progress
            </div>
            <div className={styles.statChip} style={{ borderColor: 'rgba(0,184,148,0.4)', color: '#00b894' }}>
              <CheckCircle size={14} /> {resolvedCount} Resolved
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <div className={styles.queryList}>
            {queries.length === 0 && (
              <div className={styles.empty}>
                <MessageSquare size={48} />
                <p>No queries yet. Students will appear here when they submit queries.</p>
              </div>
            )}
            {queries.map((q, i) => (
              <motion.div
                key={q.id}
                className={styles.queryCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className={styles.queryHeader}
                  onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                >
                  <div className={styles.queryLeft}>
                    <div className={styles.studentAvatar}>
                      {q.student.avatar
                        ? <img src={q.student.avatar} alt="" />
                        : q.student.name.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.querySubject}>{q.subject}</div>
                      <div className={styles.studentInfo}>
                        {q.student.name} · {q.student.email}
                      </div>
                    </div>
                  </div>
                  <div className={styles.queryRight}>
                    <span className={`badge ${statusColors[q.status] || ''}`}>{q.status.replace('_', ' ')}</span>
                    <span className={styles.queryDate}>{formatDate(q.createdAt)}</span>
                    {expandedId === q.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === q.id && (
                    <motion.div
                      className={styles.queryBody}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={styles.queryMessage}>
                        <strong>Message:</strong>
                        <p>{q.message}</p>
                      </div>

                      {q.adminReply && (
                        <div className={styles.previousReply}>
                          <strong>Previous Reply:</strong>
                          <p>{q.adminReply}</p>
                        </div>
                      )}

                      {q.status !== 'RESOLVED' && (
                        <div className={styles.replySection}>
                          <textarea
                            className={styles.replyInput}
                            placeholder="Type your reply to the student..."
                            value={replies[q.id] || ''}
                            onChange={(e) => setReplies({ ...replies, [q.id]: e.target.value })}
                            rows={3}
                          />
                          <div className={styles.replyActions}>
                            <button
                              className={styles.replyBtn}
                              style={{ background: 'rgba(108,92,231,0.15)', color: 'var(--accent-primary)' }}
                              onClick={() => handleReply(q.id, 'IN_PROGRESS')}
                              disabled={saving === q.id}
                            >
                              <Clock size={14} /> Mark In Progress
                            </button>
                            <button
                              className={styles.replyBtn}
                              style={{ background: 'rgba(0,184,148,0.15)', color: '#00b894' }}
                              onClick={() => handleReply(q.id, 'RESOLVED')}
                              disabled={saving === q.id}
                            >
                              <Send size={14} /> {saving === q.id ? 'Saving...' : 'Reply & Resolve'}
                            </button>
                          </div>
                        </div>
                      )}
                      {q.status === 'RESOLVED' && (
                        <div className={styles.resolvedNote}>
                          <CheckCircle size={14} /> This query has been resolved.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </FadeInUp>
      </div>
    </PageTransition>
  );
}
