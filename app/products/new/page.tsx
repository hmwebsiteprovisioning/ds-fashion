'use client';

import { useState } from 'react';
import PublicPageLayout from '@/components/PublicPageLayout';
import StorePage from '@/components/StorePage';
import { STORE_PAGE_CONFIGS } from '@/lib/store-page-configs';

export default function NewProductsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const handleSetIsAdmin = (v: boolean) => { setIsAdmin(v); localStorage.setItem('isAdmin', v.toString()); };
  return (
    <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
      <StorePage config={STORE_PAGE_CONFIGS.new} />
    </PublicPageLayout>
  );
}
