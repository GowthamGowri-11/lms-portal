'use client';

import { useState } from 'react';
import { JoinRequest, User } from '@/generated/prisma/client';
import { Check, X, Clock } from 'lucide-react';
import styles from './page.module.css';

type RequestWithUser = JoinRequest & { user: User };

export default function AdminRequestsClient({ requests: initialRequests }: { requests: RequestWithUser[] }) {
  const [requests, setRequests] = useState<RequestWithUser[]>(initialRequests);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setRequests(requests.map(req => 
          req.id === id ? { ...req, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : req
        ));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to process request');
      }
    } catch (e) {
      alert('Network error occurred.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Join Requests</h1>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Applicant Details</th>
              <th>Request Type</th>
              <th>Target ID (Course)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>No requests found.</td>
              </tr>
            ) : requests.map((req) => (
              <tr key={req.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={req.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name || 'User')}&background=random`} 
                      alt="" 
                      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    />
                    <div>
                      <div style={{ fontWeight: 500 }}>{req.user.name || 'Anonymous'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{req.user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                    <div><strong style={{ color: 'var(--accent-primary)' }}>Edu:</strong> {req.user.education || 'Not Provided'}</div>
                    <div><strong>Phone:</strong> {req.user.phone || 'N/A'}</div>
                    <div><strong>Age:</strong> {req.user.age ? `${req.user.age} yrs` : 'N/A'}</div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${req.type === 'TRAINER_APPLICATION' ? 'badge-primary' : 'badge-warning'}`}>
                    {req.type.replace('_', ' ')}
                  </span>
                </td>
                <td>{req.targetId || '-'}</td>
                <td>
                  <span className={`badge ${req.status === 'APPROVED' ? 'badge-success' : req.status === 'REJECTED' ? 'badge-danger' : ''}`}>
                    {req.status}
                  </span>
                </td>
                <td>
                  {req.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleAction(req.id, 'APPROVE')}
                        disabled={processing === req.id}
                        className="btn btn-success btn-sm"
                        style={{ background: 'var(--accent-success)', color: 'black', padding: '4px 8px', borderRadius: '4px' }}
                      >
                        {processing === req.id ? <Clock size={16} /> : <Check size={16} />}
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'REJECT')}
                        disabled={processing === req.id}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px', borderRadius: '4px' }}
                      >
                        {processing === req.id ? <Clock size={16} /> : <X size={16} />}
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
