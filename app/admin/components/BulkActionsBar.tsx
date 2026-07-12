'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function BulkActionsBar({
  selectedCount,
  onClear,
  children,
  className,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-lg text-sm',
        className
      )}
    >
      <span className="font-medium text-primary">
        {selectedCount} selected
      </span>
      <div className="flex items-center gap-2 flex-1">{children}</div>
      <button
        onClick={onClear}
        className="p-1 rounded hover:bg-slate-100 text-slate-500"
        aria-label="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
