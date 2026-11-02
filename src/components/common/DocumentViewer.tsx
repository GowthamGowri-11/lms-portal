'use client';

import React, { useState } from 'react';
import {
  FileText,
  Presentation,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  ImageIcon,
} from 'lucide-react';
import styles from './DocumentViewer.module.css';
import { LessonDocument } from '@/lib/lessonContent';

interface DocumentViewerProps {
  document: LessonDocument;
  initialFullscreen?: boolean;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentViewer({ document, initialFullscreen = false }: DocumentViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);
  const [viewerEngine, setViewerEngine] = useState<'office' | 'google' | 'native'>('office');

  const { url, name, type, size } = document;

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Compute viewer embed URL based on file type
  const getEmbedUrl = () => {
    if (!url) return '';

    if (type === 'pdf') {
      // PDF can be viewed directly in modern browsers
      return `${url}#toolbar=1&navpanes=0&view=FitH`;
    }

    if (type === 'pptx' || type === 'docx') {
      if (viewerEngine === 'office') {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
      }
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }

    return url;
  };

  const getBadgeClass = () => {
    switch (type) {
      case 'pdf':
        return styles.badgePdf;
      case 'pptx':
        return styles.badgePpt;
      case 'docx':
        return styles.badgeDoc;
      case 'image':
        return styles.badgeImg;
      default:
        return styles.badgeDoc;
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'pdf':
        return <FileText size={14} />;
      case 'pptx':
        return <Presentation size={14} />;
      case 'docx':
        return <FileText size={14} />;
      case 'image':
        return <ImageIcon size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'pdf':
        return 'PDF Document';
      case 'pptx':
        return 'PowerPoint Slides';
      case 'docx':
        return 'Word Document';
      case 'image':
        return 'Image File';
      default:
        return 'Document';
    }
  };

  return (
    <div className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.metaInfo}>
          <span className={`${styles.typeBadge} ${getBadgeClass()}`}>
            {getTypeIcon()}
            <span>{getTypeLabel()}</span>
          </span>
          <span className={styles.docTitle} title={name}>
            {name}
          </span>
          {size ? <span className={styles.docSize}>({formatBytes(size)})</span> : null}
        </div>

        <div className={styles.actions}>
          {(type === 'pptx' || type === 'docx') && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => setViewerEngine((curr) => (curr === 'office' ? 'google' : 'office'))}
              title="Switch between Microsoft Office & Google Docs rendering engines"
            >
              <RefreshCw size={13} />
              <span>{viewerEngine === 'office' ? 'Office View' : 'Google View'}</span>
            </button>
          )}

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionBtn}
            title="Open in new browser tab"
          >
            <ExternalLink size={13} />
            <span>Open</span>
          </a>

          <a
            href={url}
            download={name}
            className={styles.actionBtn}
            title="Download document"
          >
            <Download size={13} />
            <span>Download</span>
          </a>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Viewer'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Document View Body */}
      <div className={styles.frameWrap}>
        {type === 'image' ? (
          <div className={styles.imageViewer}>
            <img src={url} alt={name} className={styles.docImage} />
          </div>
        ) : (
          <iframe
            src={getEmbedUrl()}
            className={styles.iframe}
            title={name}
            allow="autoplay; fullscreen"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}

