'use client';

import { useState } from 'react';
import PublicPageLayout from '@/components/PublicPageLayout';
import StorePage from '@/components/StorePage';

export default function ProductsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const handleSetIsAdmin = (v: boolean) => { setIsAdmin(v); localStorage.setItem('isAdmin', v.toString()); };
  return (
    <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
      <StorePage currentPage="products" />
    </PublicPageLayout>
  );
}
