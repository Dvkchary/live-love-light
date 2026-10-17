'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import CustomerPortalPage from './customer/page';

export default function StorefrontPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;

    fetch('/api/auth/portal', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (!cancelled && typeof data?.redirectTo === 'string' && data.redirectTo !== '/') {
          router.replace(data.redirectTo);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [loading, user, router]);

  return <CustomerPortalPage />;
}
