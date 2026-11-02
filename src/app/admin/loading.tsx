import React from 'react';

export default function AdminLoading() {
  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ width: 140, height: 14, background: '#e2e8f0', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: 280, height: 32, background: '#cbd5e1', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: 420, height: 16, background: '#e2e8f0', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
        </div>
        <div style={{ width: 130, height: 40, background: '#e2e8f0', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              border: '1px solid #eef2f6',
              borderRadius: 16,
              padding: '1.35rem 1.4rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
              <div style={{ width: 55, height: 20, borderRadius: 9999, background: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
            </div>
            <div style={{ width: 90, height: 28, background: '#e2e8f0', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: 130, height: 14, background: '#f1f5f9', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          </div>
        ))}
      </div>

      {/* Master Card Skeleton */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #eef2f6',
          borderRadius: 18,
          padding: '1.6rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ width: 220, height: 22, background: '#cbd5e1', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: 340, height: 14, background: '#f1f5f9', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          </div>
          <div style={{ width: 260, height: 38, background: '#f1f5f9', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4, 5].map((r) => (
            <div
              key={r}
              style={{
                height: 52,
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                animation: 'pulse 1.5s infinite',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
