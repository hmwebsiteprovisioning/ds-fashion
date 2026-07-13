'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PublicPageLayout from '@/components/PublicPageLayout';
import StorePage from '@/components/StorePage';
import { collectionPageConfig } from '@/lib/store-page-configs';

type Collection = {
  collectionid: string;
  name: string;
  slug: string;
  description?: string | null;
  imageurl?: string | null;
};

export default function CollectionPage() {
  const { slug } = useParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSetIsAdmin = (v: boolean) => {
    setIsAdmin(v);
    localStorage.setItem('isAdmin', v.toString());
  };

  useEffect(() => {
    if (!slug) return;
    fetch('/api/collections')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const found = (data.collections || []).find((c: Collection) => c.slug === slug);
          setCollection(found ?? null);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
        <div className="min-h-[40vh] flex items-center justify-center text-ds-text-muted">Зареждане...</div>
      </PublicPageLayout>
    );
  }

  if (!collection) {
    return (
      <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
        <div className="min-h-[40vh] flex items-center justify-center text-ds-text-muted">Колекцията не е намерена</div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
      <StorePage
        config={collectionPageConfig(
          collection.name,
          collection.slug,
          collection.description,
          collection.imageurl
        )}
      />
    </PublicPageLayout>
  );
}
