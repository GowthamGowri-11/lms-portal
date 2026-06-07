'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Globe, Bell, Shield, Save } from 'lucide-react';
import { FadeInUp, PageTransition } from '@/components/animations/MotionWrappers';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('GM Training');
  const [siteDesc, setSiteDesc] = useState('Premium Learning Management System');
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageTransition>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <FadeInUp>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Configure your LMS platform settings.
          </p>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={20} /> General
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label>Site Name</label>
                <input className="input-field" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Site Description</label>
                <input className="input-field" value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} />
              </div>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={20} /> Notifications
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Email Notifications</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Receive email notifications for new enrollments</p>
              </div>
              <motion.button
                onClick={() => setNotifications(!notifications)}
                style={{
                  width: 52,
                  height: 28,
                  borderRadius: 14,
                  background: notifications ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  position: 'relative',
                  transition: 'background 0.3s',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <motion.div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: 3,
                  }}
                  animate={{ left: notifications ? 27 : 3 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.3}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={20} /> Security
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Authentication and payment gateway settings will be available here once integrated.
              Razorpay configuration and user auth setup coming soon.
            </p>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.4}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={18} />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </FadeInUp>
      </div>
    </PageTransition>
  );
}
