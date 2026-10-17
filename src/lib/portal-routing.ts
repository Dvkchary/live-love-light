import type { UserRole } from '@/types';

export function getPortalPath(role: UserRole | null | undefined): string {
  if (role === 'super_admin') return '/super-admin';
  if (role === 'admin' || role === 'product_manager') return '/admin/products';
  return '/';
}

export function canAccessPortalRoute(role: UserRole | null | undefined, pathname: string): boolean {
  if (pathname.startsWith('/super-admin')) return role === 'super_admin';
  if (pathname.startsWith('/admin')) {
    return role === 'super_admin' || role === 'admin' || role === 'product_manager';
  }
  return true;
}