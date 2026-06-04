"use client";

import React, { useState, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

// Global helper definition
if (typeof window !== "undefined") {
  (window as any).toast = {
    success: (message: string, duration?: number) => {
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type: "success", duration } }));
    },
    error: (message: string, duration?: number) => {
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type: "error", duration } }));
    },
    info: (message: string, duration?: number) => {
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type: "info", duration } }));
    },
    warning: (message: string, duration?: number) => {
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type: "warning", duration } }));
    },
  };
}

// Declare global type for TypeScript support
declare global {
  interface Window {
    toast?: {
      success: (message: string, duration?: number) => void;
      error: (message: string, duration?: number) => void;
      info: (message: string, duration?: number) => void;
      warning: (message: string, duration?: number) => void;
    };
  }
}

// Global variable toast for TS inside components
const toast = typeof window !== "undefined" ? (window as any).toast : {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
};

export { toast };

function ToastItem({ toastItem, onRemove }: { toastItem: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toastItem.id);
    }, toastItem.duration || 4000);

    return () => clearTimeout(timer);
  }, [toastItem.id, toastItem.duration, onRemove]);

  const styles = {
    success: {
      bg: "bg-emerald-50/95 border-emerald-200 text-emerald-800",
      icon: (
        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    error: {
      bg: "bg-rose-50/95 border-rose-200 text-rose-800",
      icon: (
        <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    info: {
      bg: "bg-blue-50/95 border-blue-200 text-blue-800",
      icon: (
        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bg: "bg-amber-50/95 border-amber-200 text-amber-800",
      icon: (
        <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  };

  const currentStyle = styles[toastItem.type] || styles.info;

  return (
    <div
      className={`flex w-80 max-w-full items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-in-right ${currentStyle.bg}`}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{currentStyle.icon}</span>
      <div className="flex-1 text-sm font-medium">{toastItem.message}</div>
      <button
        onClick={() => onRemove(toastItem.id)}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition"
        aria-label="Close notification"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToastEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type: ToastType; duration?: number }>;
      const { message, type, duration } = customEvent.detail;
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts((prev) => {
        const item: Toast = { id, message, type };
        if (duration !== undefined) {
          item.duration = duration;
        }
        return [...prev, item];
      });
    };

    window.addEventListener("app-toast", handleToastEvent);
    return () => {
      window.removeEventListener("app-toast", handleToastEvent);
    };
  }, []);

  const handleRemove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-[999999] flex flex-col gap-3 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} toastItem={t} onRemove={handleRemove} />
        ))}
      </div>
    </div>
  );
}
