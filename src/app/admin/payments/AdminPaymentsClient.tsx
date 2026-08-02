'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  UserCheck,
  Calendar,
  X,
  ArrowUpRight,
  Filter,
  FileText,
} from 'lucide-react';
import styles from '../page.module.css';

interface EnrollmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  paymentStatus: string;
  enrolledAt: string;
}

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
  username: string;
}

export default function AdminPaymentsClient({
  enrollments,
  students,
}: {
  enrollments: EnrollmentRecord[];
  students: StudentInfo[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'completed' | 'pending'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);

  // Summary Metrics
  const totalRevenue = useMemo(() => {
    return enrollments
      .filter((e) => e.paymentStatus === 'completed')
      .reduce((sum, e) => sum + e.coursePrice, 0);
  }, [enrollments]);

  const completedCount = useMemo(() => {
    return enrollments.filter((e) => e.paymentStatus === 'completed').length;
  }, [enrollments]);

  const pendingCount = useMemo(() => {
    return enrollments.filter((e) => e.paymentStatus === 'pending').length;
  }, [enrollments]);

  // Filtered List
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const matchesSearch =
        e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ? true : e.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enrollments, searchTerm, statusFilter]);

  // Get user transaction history for modal
  const userTransactions = useMemo(() => {
    if (!selectedStudent) return [];
    return enrollments.filter(
      (e) =>
        e.studentId === selectedStudent.id ||
        e.studentEmail.toLowerCase() === selectedStudent.email.toLowerCase()
    );
  }, [selectedStudent, enrollments]);

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Payment Audit & History</h1>
          <p className={styles.subtitle}>
            Track all transactions, verify user payments, and inspect user payment histories.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className={styles.statsGrid}>
        <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <div className={styles.statValue}>₹{totalRevenue.toLocaleString()}</div>
          <div className={styles.statLabel}>Total Revenue Received</div>
        </motion.div>

        <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
              <CreditCard size={24} />
            </div>
          </div>
          <div className={styles.statValue}>{enrollments.length}</div>
          <div className={styles.statLabel}>Total Payment Logs</div>
        </motion.div>

        <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div className={styles.statValue}>{completedCount}</div>
          <div className={styles.statLabel}>Successful Transactions</div>
        </motion.div>

        <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <Clock size={24} />
            </div>
          </div>
          <div className={styles.statValue}>{pendingCount}</div>
          <div className={styles.statLabel}>Pending Verification</div>
        </motion.div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by Gmail address or Username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.4rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Filter payments by status"
            style={{
              padding: '0.55rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="completed">Completed Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div style={{ marginTop: '1rem' }} className={styles.tableCard}>
        <div className="table-wrapper" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User / Student</th>
                <th>Course Name</th>
                <th>Amount Paid</th>
                <th>Payment Status</th>
                <th>Date & Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((e) => {
                const studentObj = students.find((s) => s.id === e.studentId) || {
                  id: e.studentId,
                  name: e.studentName,
                  email: e.studentEmail,
                  avatar: '',
                  username: e.studentName,
                };

                return (
                  <tr key={e.id}>
                    <td>
                      <div className={styles.cellUser}>
                        <div className={styles.cellAvatar}>{e.studentName.charAt(0)}</div>
                        <div>
                          <div className={styles.cellName}>{e.studentName}</div>
                          <div className={styles.cellEmail}>{e.studentEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{e.courseTitle}</td>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>₹{e.coursePrice}</td>
                    <td>
                      <span className={`badge ${e.paymentStatus === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {e.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div>{formatDate(e.enrolledAt)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{formatTime(e.enrolledAt)}</div>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedStudent(studentObj)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem' }}
                      >
                        <FileText size={14} />
                        View History
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredEnrollments.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No payment records found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Transaction History Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-history-title"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '1rem',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.75rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={styles.cellAvatar} style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 id="user-history-title" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{selectedStudent.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>{selectedStudent.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  aria-label="Close transaction history modal"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  background: userTransactions.some((t) => t.paymentStatus === 'completed')
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${
                    userTransactions.some((t) => t.paymentStatus === 'completed') ? '#10b981' : '#ef4444'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <UserCheck size={20} color={userTransactions.some((t) => t.paymentStatus === 'completed') ? '#10b981' : '#ef4444'} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    Payment Verification Status:{' '}
                    {userTransactions.some((t) => t.paymentStatus === 'completed')
                      ? 'Verified Paying Customer'
                      : 'No Completed Payments Found'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Total Paid:{' '}
                    ₹
                    {userTransactions
                      .filter((t) => t.paymentStatus === 'completed')
                      .reduce((sum, t) => sum + t.coursePrice, 0)}
                  </div>
                </div>
              </div>

              {/* Transaction List */}
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Transaction History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {userTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.courseTitle}</div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} /> {formatDate(tx.enrolledAt)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {formatTime(tx.enrolledAt)}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>₹{tx.coursePrice}</div>
                      <span className={`badge ${tx.paymentStatus === 'completed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
                        {tx.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}

                {userTransactions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No payment history recorded for this user.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
