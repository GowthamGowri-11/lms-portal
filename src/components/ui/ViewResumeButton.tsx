'use client';

import styles from '@/app/about/page.module.css';

export default function ViewResumeButton({ resumeUrl }: { resumeUrl: string }) {
  const handleView = async () => {
    if (resumeUrl.startsWith('data:')) {
      try {
        // Convert base64 data URL to a blob URL to bypass browser security restrictions
        // that prevent opening data URLs directly in a new tab
        const res = await fetch(resumeUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Clean up the object URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } catch (error) {
        console.error("Failed to open resume:", error);
        alert("Failed to open resume. The file might be corrupted or too large.");
      }
    } else {
      // If it's a standard HTTP URL (e.g. Google Drive), just open it
      window.open(resumeUrl, '_blank');
    }
  };

  return (
    <button onClick={handleView} className={`btn btn-primary ${styles.resumeBtn}`}>
      View Resume
    </button>
  );
}
