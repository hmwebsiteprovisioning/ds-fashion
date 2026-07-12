'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataTableShellProps {
  children: ReactNode;
  className?: string;
  toolbar?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

/**
 * DataTableShell - Consistent table container styling
 * 
 * Features:
 * - Rounded corners (rounded-admin-card)
 * - Border and background
 * - Overflow handling
 * - Standard header row typography + row height + hover state
 */
export default function DataTableShell({
  children,
  className,
  toolbar,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
}: DataTableShellProps) {
  return (
    <div
      className={cn(
        'rounded-admin-card border border-slate-200 bg-white overflow-hidden',
        className
      )}
    >
      {(toolbar || onSearchChange) && (
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 flex-wrap">
          {onSearchChange && (
            <input
              type="search"
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          {children}
        </table>
      </div>
    </div>
  );
}

/**
 * TableHeader - Consistent table header styling
 */
export function TableHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <thead className={cn('bg-slate-50', className)}>
      {children}
    </thead>
  );
}

/**
 * TableHeaderRow - Standard header row
 */
export function TableHeaderRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={className}>
      {children}
    </tr>
  );
}

/**
 * TableHeaderCell - Standard header cell
 */
export function TableHeaderCell({ children, className, align = 'left', sortable, sorted, onSort }: { 
  children: ReactNode; 
  className?: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
}) {
  const alignClasses = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
  };

  return (
    <th
      className={cn(
        'px-4 xl:px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider',
        alignClasses[align],
        sortable && 'cursor-pointer hover:text-slate-700 select-none',
        className
      )}
      onClick={sortable ? onSort : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && sorted && (
          <span className="text-primary">{sorted === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );
}

/**
 * TableBody - Table body wrapper
 */
export function TableBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tbody className={cn('bg-white divide-y divide-slate-200', className)}>
      {children}
    </tbody>
  );
}

/**
 * TableRow - Standard table row with hover state
 */
export function TableRow({ children, className, onClick }: { 
  children: ReactNode; 
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      className={cn(
        'h-12 hover:bg-slate-50/60 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

/**
 * TableCell - Standard table cell
 */
export function TableCell({ children, className, align = 'left', style }: { 
  children: ReactNode; 
  className?: string;
  align?: 'left' | 'right' | 'center';
  style?: React.CSSProperties;
}) {
  const alignClasses = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
  };

  return (
    <td
      className={cn(
        'px-4 xl:px-6 py-4 text-sm',
        alignClasses[align],
        className
      )}
      style={style}
    >
      {children}
    </td>
  );
}
