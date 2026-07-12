'use client';

import { useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';

export default function AdminPage() {
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    document.title = t.dashboard || (language === 'bg' ? 'Табло' : 'Dashboard');
  }, [language, t]);

  return <Dashboard />;
}
