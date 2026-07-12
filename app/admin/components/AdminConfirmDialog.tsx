'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import AdminModal from './AdminModal';

interface AdminConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
}

export default function AdminConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: AdminConfirmDialogProps) {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      blocking
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-lg text-white ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary hover:bg-primary/90'
            } disabled:opacity-50`}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex gap-3 items-start">
        {variant === 'danger' && (
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        )}
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </AdminModal>
  );
}
