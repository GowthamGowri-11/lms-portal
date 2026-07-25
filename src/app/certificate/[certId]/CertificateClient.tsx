'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Award, Download, ArrowLeft, CheckCircle } from 'lucide-react';
import { Certificate, Student, Course, Trainer } from '@/generated/prisma/client';
import styles from './certificate.module.css';

type FullCert = Certificate & {
  student: Student;
  course: Course & { trainer: Trainer };
};

export default function CertificateClient({ cert }: { cert: FullCert }) {
  const handlePrint = () => window.print();

  return (
    <div className={styles.page}>
      {/* Back link — hidden on print */}
      <div className={styles.controls}>
        <Link href="/dashboard" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <button className="btn btn-primary btn-sm" onClick={handlePrint}>
          <Download size={16} /> Download / Print
        </button>
      </div>

      {/* Certificate */}
      <motion.div
        className={styles.cert}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Border decoration */}
        <div className={styles.border} />

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src={cert.course.logo || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className={styles.gmName}>GM Training</div>
          <div className={styles.tagline}>Premium Learning Management System</div>
        </div>

        <div className={styles.divider} />

        <div className={styles.certLabel}>CERTIFICATE OF COMPLETION</div>

        <div className={styles.body}>
          <p className={styles.presented}>This is to certify that</p>
          <h1 className={styles.studentName}>{cert.student.name}</h1>
          <p className={styles.presented}>has successfully completed the course</p>
          <h2 className={styles.courseName}>{cert.course.title}</h2>
          <div className={styles.courseDetails}>
            <span className={styles.badge}>{cert.course.level}</span>
            <span className={styles.badge}>{cert.course.category}</span>
            <span className={styles.badge}>{cert.course.duration}</span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.signatureBlock}>
            <div className={styles.signatureLine} />
            <div className={styles.signerName}>{cert.course.trainer.name}</div>
            <div className={styles.signerTitle}>{cert.course.trainer.specialization}</div>
          </div>

          <div className={styles.sealBlock}>
            <div className={styles.seal}>
              <CheckCircle size={32} />
              <span>VERIFIED</span>
            </div>
          </div>

          <div className={styles.signatureBlock}>
            <div className={styles.signatureLine} />
            <div className={styles.signerName}>GM Training</div>
            <div className={styles.signerTitle}>Platform Director</div>
          </div>
        </div>

        <div className={styles.certMeta}>
          <div>Date: {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div>Certificate ID: <span className={styles.certId}>{cert.certificateId}</span></div>
        </div>
      </motion.div>
    </div>
  );
}
