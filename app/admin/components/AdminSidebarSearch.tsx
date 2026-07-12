'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useAdminSearch } from '../lib/useAdminSearch';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminSidebarSearch() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const {
    searchTerm,
    setSearchTerm,
    results,
    isOpen,
    setIsOpen,
    handleSelect,
  } = useAdminSearch();

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={language === 'bg' ? 'Търсене...' : 'Search...'}
          className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1"
          style={{
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X size={14} style={{ color: theme.colors.textSecondary }} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-1 rounded-lg border shadow-lg max-h-64 overflow-y-auto z-50"
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
        >
          {results.slice(0, 8).map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 truncate"
              style={{ color: theme.colors.text }}
            >
              {language === 'bg' ? item.titleBg : item.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
