'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showBack?: boolean;
}

export default function Breadcrumbs({ items, className, showBack = true }: BreadcrumbsProps) {
  const backHref = items.length > 1 ? items[items.length - 2]?.href : items[0]?.href;

  return (
    <nav className={cn('flex items-center gap-2 text-sm mb-4', className)} aria-label="Breadcrumb">
      {showBack && backHref && (
        <Link
          href={backHref}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mr-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      )}
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="text-slate-500 hover:text-slate-700">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? 'text-slate-900 font-medium' : 'text-slate-500'}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
