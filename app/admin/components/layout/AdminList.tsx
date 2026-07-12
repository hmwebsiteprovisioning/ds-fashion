'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdminListProps {
  children: ReactNode;
  className?: string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectAll?: (checked: boolean) => void;
  allSelected?: boolean;
  header?: ReactNode;
}

export default function AdminList({
  children,
  className,
  selectable,
  selectedIds,
  onSelectAll,
  allSelected,
  header,
}: AdminListProps) {
  return (
    <div className={cn('rounded-admin-card border border-slate-200 bg-white overflow-hidden', className)}>
      {header && (
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">{header}</div>
      )}
      {selectable && onSelectAll && (
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="rounded border-slate-300"
          />
          <span className="text-xs text-slate-500 uppercase tracking-wide">Select all</span>
        </div>
      )}
      <ul className="divide-y divide-slate-100">{children}</ul>
    </div>
  );
}

interface AdminListItemProps {
  id?: string;
  thumbnail?: ReactNode;
  primary: ReactNode;
  secondary?: ReactNode;
  meta?: ReactNode;
  description?: ReactNode;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onClick?: () => void;
  className?: string;
}

export function AdminListItem({
  thumbnail,
  primary,
  secondary,
  meta,
  description,
  selectable,
  selected,
  onSelect,
  onClick,
  className,
}: AdminListItemProps) {
  return (
    <li
      className={cn(
        'flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors',
        onClick && 'cursor-pointer',
        selected && 'bg-primary/5',
        className
      )}
      onClick={onClick}
    >
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect?.(e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-slate-300 flex-shrink-0"
        />
      )}
      {thumbnail && <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden">{thumbnail}</div>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">{primary}</div>
            {secondary && <div className="text-xs text-slate-500 truncate">{secondary}</div>}
          </div>
          {meta && <div className="flex-shrink-0 text-xs text-slate-500">{meta}</div>}
        </div>
        {description && <div className="text-xs text-slate-400 mt-0.5 truncate">{description}</div>}
      </div>
    </li>
  );
}
