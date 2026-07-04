'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import PublicPageLayout from '@/components/PublicPageLayout';
import StorePage from '@/components/StorePage';

export default function CategoryPage() {
  const { category } = useParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const handleSetIsAdmin = (v: boolean) => { setIsAdmin(v); localStorage.setItem('isAdmin', v.toString()); };

  return (
    <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
      <StorePage currentPage={String(category ?? 'products')} />
    </PublicPageLayout>
  );
}
