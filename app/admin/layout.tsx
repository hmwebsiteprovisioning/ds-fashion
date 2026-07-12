'use client';

import { usePathname } from 'next/navigation';
import AdminProtectedLayout from './components/AdminProtectedLayout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <AdminProtectedLayout>{children}</AdminProtectedLayout>;
}
