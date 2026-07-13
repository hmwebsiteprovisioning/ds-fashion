'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PublicPageLayout from '@/components/PublicPageLayout';
import LoadingScreen from '@/components/LoadingScreen';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { ArrowRight } from 'lucide-react';

type Collection = {
  collectionid: string;
  name: string;
  slug: string;
  description?: string | null;
  imageurl?: string | null;
  sortorder?: number;
  isactive: boolean;
};

export default function CollectionsIndexPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { settings, isLoading: settingsLoading } = useStoreSettings();

  useEffect(() => {
    const pageTitle = language === 'bg' ? 'Колекции' : 'Collections';
    const storeName = settings?.storename || 'DS-Fashion';
    document.title = `${pageTitle} - ${storeName}`;
  }, [language, settings?.storename]);

  useEffect(() => {
    const adminState = localStorage.getItem('isAdmin');
    if (adminState === 'true') {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    fetch('/api/collections')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          // Sort active collections by sortorder
          const activeCollections = (data.collections || [])
            .filter((c: Collection) => c.isactive !== false)
            .sort((a: Collection, b: Collection) => (a.sortorder || 0) - (b.sortorder || 0));
          setCollections(activeCollections);
        }
      })
      .catch((err) => console.error('Failed to load collections:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSetIsAdmin = (value: boolean) => {
    setIsAdmin(value);
    localStorage.setItem('isAdmin', value.toString());
  };

  if (settingsLoading || loading) {
    return <LoadingScreen />;
  }

  const defaultImage = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&q=85';

  return (
    <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
      <div
        className="flex-1 min-h-screen transition-colors duration-300"
        style={{
          background: theme.colors.background
        }}
      >
        {/* Hero Section */}
        <div className="bg-ds-section py-12 sm:py-16 border-b border-ds-border">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1
              className="font-serif-display text-4xl sm:text-5xl lg:text-6xl mb-4 leading-tight"
              style={{ color: theme.colors.text }}
            >
              {language === 'bg' ? 'Нашите Колекции' : 'Our Collections'}
            </h1>
            <p
              className="max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
              style={{ color: theme.colors.textSecondary }}
            >
              {language === 'bg'
                ? 'Разгледайте нашите специално подбрани сезонни и тематични модни колекции.'
                : 'Explore our curated seasonal and thematic fashion collections.'}
            </p>
          </div>
        </div>

        {/* Collections Catalog Grid */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {collections.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-base" style={{ color: theme.colors.textSecondary }}>
                {language === 'bg'
                  ? 'В момента няма активни колекции.'
                  : 'There are no active collections at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {collections.map((c) => (
                <Link
                  key={c.collectionid}
                  href={`/collections/${c.slug}`}
                  className="group block relative rounded-lg overflow-hidden border transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                  style={{
                    backgroundColor: theme.colors.cardBg,
                    borderColor: theme.colors.border
                  }}
                >
                  {/* Collection Banner Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={c.imageurl || defaultImage}
                      alt={c.name}
                      fill
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                  </div>

                  {/* Card Content */}
                  <div className="p-6 relative">
                    <h2
                      className="font-serif-display text-xl sm:text-2xl mb-2 transition-colors duration-300 group-hover:text-ds-gold"
                      style={{ color: theme.colors.text }}
                    >
                      {c.name}
                    </h2>
                    
                    {c.description ? (
                      <p
                        className="text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {c.description}
                      </p>
                    ) : (
                      <p
                        className="text-xs sm:text-sm leading-relaxed mb-4 italic"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {language === 'bg'
                          ? `Колекция ${c.name} от DS-Fashion.`
                          : `${c.name} Collection from DS-Fashion.`}
                      </p>
                    )}

                    {/* Explore Link Trigger */}
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-ds-gold group-hover:underline">
                      <span>{language === 'bg' ? 'Разгледай' : 'Explore'}</span>
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicPageLayout>
  );
}
