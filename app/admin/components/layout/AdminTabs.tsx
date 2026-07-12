'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface AdminTab {
  id: string;
  label: string;
  badge?: number | string;
}

interface AdminTabsProps {
  tabs: AdminTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function AdminTabs({ tabs, activeTab, onChange, className }: AdminTabsProps) {
  return (
    <div className={cn('border-b border-slate-200', className)}>
      <nav className="flex gap-1 -mb-px overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
