"use client";

import React, { useEffect } from "react";

export interface ToastProps {
  message: string;
  type?: "info" | "success" | "error";
  onClose?: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "info",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgStyles = {
    info: "bg-ink dark:bg-white text-white dark:text-ink",
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
  }[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl text-sm font-medium transition-all duration-300 animate-slide-up ${bgStyles}`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="opacity-75 hover:opacity-100 p-1"
          aria-label="Dismiss alert"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
