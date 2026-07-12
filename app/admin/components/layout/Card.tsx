'use client';

import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * Variant style: 'default' or 'subtle'
   * - default: white background, border, shadow
   * - subtle: minimal border, no shadow
   */
  variant?: 'default' | 'subtle';
  padding?: 'default' | 'none' | 'small' | 'large';
}

/**
 * Card - Consistent card container
 * 
 * Styles:
 * - Default: white bg, border border-slate-200, shadow-sm, rounded-admin-card (12px)
 * - Subtle: minimal border, no shadow
 * - Padding: p-6 (24px) by default
 */
export default function Card({ 
  children, 
  className,
  style,
  variant = 'default',
  padding = 'default'
}: CardProps) {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    default: 'p-6', // 24px - standard card padding
    large: 'p-8', // 32px - larger card padding
  };

  return (
    <div
      className={cn(
        'rounded-admin-card',
        variant === 'default'
          ? 'bg-white border-0 shadow-admin-card dark:bg-transparent dark:border dark:border-slate-700 dark:shadow-none'
          : 'bg-white border border-slate-200/50 dark:bg-transparent dark:border-slate-700',
        paddingClasses[padding],
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
