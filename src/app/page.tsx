'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

/**
 * Root Route Handler (/)
 *
 * Automatically inspects authenticated role and routes:
 * - Unauthenticated -> /login (also enforced by middleware)
 * - Super Admin / Product Manager -> /admin
 * - Customer -> /customer
 */
export default function RootPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      router.replace('/login');
      return;
    }

    const rawRole = (user.publicMetadata as { role?: string })?.role;
    const superAdminId = process.env.NEXT_PUBLIC_SUPER_ADMIN_CLERK_ID?.trim();
    const productManagerId = process.env.NEXT_PUBLIC_PRODUCT_MANAGER_CLERK_ID?.trim();

    const isSuper =
      rawRole === 'super_admin' ||
      rawRole === 'admin' ||
      (Boolean(superAdminId) && user.id === superAdminId);

    const isPm =
      rawRole === 'product_manager' ||
      (Boolean(productManagerId) && user.id === productManagerId);

    if (isSuper || isPm) {
      router.replace('/admin');
    } else {
      router.replace('/customer');
    }
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#C59B27] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase tracking-widest text-[#786C63]">Routing to your portal...</p>
      </div>
    </div>
  );
}
