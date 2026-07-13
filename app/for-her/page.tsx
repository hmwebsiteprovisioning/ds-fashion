'use client';

import { useState } from 'react';
import PublicPageLayout from '@/components/PublicPageLayout';
import StorePage from '@/components/StorePage';
import { STORE_PAGE_CONFIGS } from '@/lib/store-page-configs';

export default function ForHerPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const handleSetIsAdmin = (v: boolean) => { setIsAdmin(v); localStorage.setItem('isAdmin', v.toString()); };
  return (
    <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
      <StorePage config={STORE_PAGE_CONFIGS['for-her']} />
    </PublicPageLayout>
  );
}
