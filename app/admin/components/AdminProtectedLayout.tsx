'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminLayout from './AdminLayout';
import { getAdminSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface AdminProtectedLayoutProps {
  children: React.ReactNode;
}

export default function AdminProtectedLayout({ children }: AdminProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      try {
        const session = await getAdminSession();
        if (!session) {
          localStorage.removeItem('admin_authenticated');
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          router.push('/admin/login');
          return;
        }

        setIsAuthenticated(true);
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('admin_user_email', session.user.email || '');
      } catch {
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.removeItem('admin_authenticated');
        router.push('/admin/login');
      } else if (event === 'SIGNED_IN' && session) {
        const canAccess = session.user.user_metadata?.can_access || ['admin'];
        if (!canAccess.includes('admin')) {
          supabase.auth.signOut();
          router.push('/admin/login');
        } else {
          setIsAuthenticated(true);
          localStorage.setItem('admin_authenticated', 'true');
          localStorage.setItem('admin_user_email', session.user.email || '');
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <AdminLayout currentPath={pathname || '/admin'}>{children}</AdminLayout>;
}
