'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Language } from '@/lib/translations';
import { useStoreSettings } from './StoreSettingsContext';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { settings } = useStoreSettings();
  
  // Admin language can be en or bg (stored in localStorage / settings)
  const [adminLanguage, setAdminLanguage] = useState<Language>('bg');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage === 'en' || savedLanguage === 'bg') {
      setAdminLanguage(savedLanguage);
    }
  }, []);

  // Sync with StoreSettings from DB
  useEffect(() => {
    if (settings?.language) {
      setAdminLanguage(settings.language);
    }
  }, [settings?.language]);

  const setLanguage = (lang: Language) => {
    setAdminLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const isAdminRoute = pathname?.startsWith('/admin');
  // Storefront is ALWAYS Bulgarian ('bg'), Admin panel uses adminLanguage
  const currentLanguage: Language = isAdminRoute ? adminLanguage : 'bg';

  return (
    <LanguageContext.Provider value={{ language: currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

