'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, { bg: string; icon: typeof CheckCircle }> = {
  success: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: CheckCircle },
  error: { bg: 'bg-red-50 border-red-200 text-red-800', icon: AlertCircle },
  warning: { bg: 'bg-amber-50 border-amber-200 text-amber-800', icon: AlertTriangle },
  info: { bg: 'bg-sky-50 border-sky-200 text-sky-800', icon: Info },
};

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const value: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const { bg, icon: Icon } = variantStyles[t.variant];
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm animate-in slide-in-from-right',
                bg
              )}
              role="alert"
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 opacity-60 hover:opacity-100"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useAdminToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useAdminToast must be used within AdminToastProvider');
  }
  return ctx;
}
