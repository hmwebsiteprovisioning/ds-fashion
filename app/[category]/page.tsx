'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import PublicPageLayout from '@/components/PublicPageLayout';
import StorePage from '@/components/StorePage';
import { STORE_PAGE_CONFIGS } from '@/lib/store-page-configs';

export default function CategoryPage() {
  const { category } = useParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const handleSetIsAdmin = (v: boolean) => { setIsAdmin(v); localStorage.setItem('isAdmin', v.toString()); };

  const key = String(category ?? 'products');
  const config = STORE_PAGE_CONFIGS[key] ?? STORE_PAGE_CONFIGS.products;

  return (
    <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
      <StorePage config={config} />
    </PublicPageLayout>
  );
}
