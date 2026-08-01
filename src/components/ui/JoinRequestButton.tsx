"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, X } from "lucide-react";

export default function JoinRequestButton({
  type,
  targetId,
  label,
  className,
}: {
  type: "COURSE_ENROLLMENT" | "TRAINER_APPLICATION";
  targetId?: string;
  label: string;
  className?: string;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isError, setIsError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleRequest = async () => {
    if (!session) {
      setIsError(true);
      setMessage("Only registered web users can enroll in courses. Please sign in first if you wish to enroll!");
      setShowToast(true);
      return;
    }

    if (!(session.user as any)?.isOnboarded && (session.user as any)?.role !== 'ADMIN') {
      setIsError(true);
      setMessage("Please complete your profile onboarding questionnaire first!");
      setShowToast(true);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, targetId }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsError(false);
        setMessage(
          type === "COURSE_ENROLLMENT"
            ? "Request sent! Waiting for admin approval."
            : "Application submitted! Waiting for admin approval."
        );
        setShowToast(true);
      } else {
        setIsError(true);
        setMessage(data.error || "Failed to send request.");
        setShowToast(true);
      }
    } catch (e) {
      setIsError(true);
      setMessage("An error occurred. Please try again.");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const toastContent = (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%", scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.9 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          style={{
            position: "fixed",
            top: "90px",
            left: "50%",
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 22px",
            borderRadius: "14px",
            background: "rgba(23, 23, 23, 0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: isError ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(16, 185, 129, 0.4)",
            boxShadow: "0 15px 50px -10px rgba(0, 0, 0, 0.8)",
            color: "#ffffff",
            minWidth: "340px",
            maxWidth: "480px",
          }}
        >
          {isError ? (
            <AlertCircle size={22} style={{ color: "#ef4444", flexShrink: 0 }} />
          ) : (
            <CheckCircle size={22} style={{ color: "#10b981", flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.4 }}>
            {message}
          </div>
          <button
            onClick={() => setShowToast(false)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.5)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div style={{ display: "inline-flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={handleRequest}
          disabled={loading || (message.includes("Request sent") && !isError)}
          className={className || "btn btn-primary"}
        >
          {loading ? "Processing..." : (message.includes("Request sent") && !isError) ? "Pending Approval" : label}
        </button>
      </div>

      {/* Premium Notification Toast (Rendered via Portal to avoid CSS transform trapping) */}
      {mounted && typeof document !== "undefined" && createPortal(toastContent, document.body)}
    </>
  );
}

