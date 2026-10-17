import { auth, currentUser } from '@clerk/nextjs/server';
import { UserRole, AdminRole, AdminPermissions } from '@/types';
import { getSupabaseServerClient } from './supabase';

export interface AuthenticatedAdminContext {
  userId: string;
  email?: string;
  displayName?: string;
  role: AdminRole;
  permissions: AdminPermissions;
}

export function canManageProductContent(role: UserRole): boolean {
  return role === 'super_admin' || role === 'product_manager' || role === 'admin';
}

export function canManageMarketplaceLinks(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canManagePublishing(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canManageAdminRoles(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canAccessAdminSettings(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function getAdminPermissions(role: UserRole): AdminPermissions {
  return {
    canManageProductContent: canManageProductContent(role),
    canManageMarketplaceLinks: canManageMarketplaceLinks(role),
    canManagePublishing: canManagePublishing(role),
    canManageAdminRoles: canManageAdminRoles(role),
    canAccessAdminSettings: canAccessAdminSettings(role),
  };
}

/**
 * Resolves the authenticated user and their trusted role strictly from server-side sources:
 * 1. Clerk session & server-controlled publicMetadata
 * 2. Supabase profiles table
 * 3. Server-side ADMIN_SECRET_KEY session cookie (for emergency/bootstrap)
 * Never trusts client-supplied headers, query parameters, or local storage.
 */
export async function getAuthenticatedUser(): Promise<{
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  displayName?: string;
  role: UserRole;
  permissions: AdminPermissions;
}> {
  try {
    const { userId } = await auth();

    if (userId) {
      const user = await currentUser();
      const email = user?.primaryEmailAddress?.emailAddress;
      const displayName =
        user?.fullName ||
        user?.firstName ||
        user?.username ||
        email?.split('@')[0] ||
        'User';

      // 1. Explicit Clerk User ID configuration via environment variables:
      const superAdminId = process.env.SUPER_ADMIN_CLERK_ID?.trim();
      const productManagerId = process.env.PRODUCT_MANAGER_CLERK_ID?.trim();

      let resolvedRole: UserRole = 'customer';

      if (superAdminId && userId === superAdminId) {
        resolvedRole = 'super_admin';
      } else if (productManagerId && userId === productManagerId) {
        resolvedRole = 'product_manager';
      } else {
        // 2. Server-controlled Clerk metadata
        const rawMetadataRole = (user?.publicMetadata as { role?: string })?.role;

        if (rawMetadataRole === 'super_admin' || rawMetadataRole === 'admin') {
          resolvedRole = 'super_admin';
        } else if (rawMetadataRole === 'product_manager') {
          resolvedRole = 'product_manager';
        } else {
          // 3. Supabase profiles table role check
          const supabase = getSupabaseServerClient(true);
          if (supabase) {
            const { data } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', userId)
              .single();

            if (data?.role === 'super_admin' || data?.role === 'admin') {
              resolvedRole = 'super_admin';
            } else if (data?.role === 'product_manager') {
              resolvedRole = 'product_manager';
            }
          }
        }
      }

      const metadataDisplayName = (user?.publicMetadata as { displayName?: string })?.displayName;
      const designatedDisplayName =
        resolvedRole === 'super_admin'
          ? 'Live Love Light Owner'
          : resolvedRole === 'product_manager'
          ? 'Live Love Light Manager'
          : undefined;

      const finalDisplayName =
        designatedDisplayName ||
        metadataDisplayName ||
        user?.fullName ||
        user?.firstName ||
        user?.username ||
        email?.split('@')[0] ||
        'User';

      return {
        isAuthenticated: true,
        userId,
        email,
        displayName: finalDisplayName,
        role: resolvedRole,
        permissions: getAdminPermissions(resolvedRole),
      };
    }
  } catch (error: unknown) {
    const err = error as { digest?: string; message?: string };
    if (
      err?.digest === 'HANGING_PROMISE_REJECTION' ||
      err?.digest?.startsWith('NEXT_') ||
      err?.message?.includes('Dynamic server usage')
    ) {
      throw error;
    }
    console.warn('Error reading Clerk server auth session:', err?.message || error);
  }

  // Fallback: Not authenticated
  return {
    isAuthenticated: false,
    role: 'customer',
    permissions: getAdminPermissions('customer'),
  };
}

/**
 * Enforces admin access (either PRODUCT_MANAGER or SUPER_ADMIN).
 * Returns the admin context or throws an Error with status code.
 */
export async function requireAdmin(): Promise<AuthenticatedAdminContext> {
  const authContext = await getAuthenticatedUser();

  if (!authContext.isAuthenticated || !authContext.userId) {
    const err = new Error('Authentication required.');
    (err as unknown as { status: number }).status = 401;
    throw err;
  }

  if (!canManageProductContent(authContext.role)) {
    const err = new Error('Forbidden: Administrative privileges required.');
    (err as unknown as { status: number }).status = 403;
    throw err;
  }

  const role: AdminRole = authContext.role === 'product_manager' ? 'product_manager' : 'super_admin';

  return {
    userId: authContext.userId,
    email: authContext.email,
    displayName: authContext.displayName,
    role,
    permissions: authContext.permissions,
  };
}

/**
 * Enforces Super Admin access exclusively.
 * Returns the admin context or throws an Error with status code.
 */
export async function requireSuperAdmin(): Promise<AuthenticatedAdminContext> {
  const adminContext = await requireAdmin();

  if (adminContext.role !== 'super_admin') {
    const err = new Error('Forbidden: Super Administrator privileges required.');
    (err as unknown as { status: number }).status = 403;
    throw err;
  }

  return adminContext;
}

/**
 * Enforces role-based field restrictions on product creation and updates:
 * - Product Managers CANNOT add or change marketplace links. Existing links are strictly preserved.
 * - Product Managers CANNOT toggle active/publishing status. Existing active status is strictly preserved.
 * - Super Admins have unrestricted access to all product fields.
 */
export function sanitizeProductFieldsForRole(
  input: Record<string, unknown>,
  existingProduct: Record<string, unknown> | null,
  role: AdminRole
): {
  sanitized: Record<string, unknown>;
  rejectedMarketplaceAttempt: boolean;
} {
  const isSuper = role === 'super_admin';
  let rejectedMarketplaceAttempt = false;

  const existingMarketplaces = (existingProduct?.marketplaces as Record<string, string>) || {
    amazon: '',
    flipkart: '',
    meesho: '',
  };

  const incomingMarketplaces = (input.marketplaces as Record<string, string>) || {};

  // Check if Product Manager attempted to alter marketplace URLs
  if (!isSuper) {
    if (
      (incomingMarketplaces.amazon && incomingMarketplaces.amazon !== (existingMarketplaces.amazon || '')) ||
      (incomingMarketplaces.flipkart && incomingMarketplaces.flipkart !== (existingMarketplaces.flipkart || '')) ||
      (incomingMarketplaces.meesho && incomingMarketplaces.meesho !== (existingMarketplaces.meesho || ''))
    ) {
      rejectedMarketplaceAttempt = true;
    }
  }

  const marketplaces = isSuper
    ? {
        amazon: typeof incomingMarketplaces.amazon === 'string' ? incomingMarketplaces.amazon.trim() : (existingMarketplaces.amazon || ''),
        flipkart: typeof incomingMarketplaces.flipkart === 'string' ? incomingMarketplaces.flipkart.trim() : (existingMarketplaces.flipkart || ''),
        meesho: typeof incomingMarketplaces.meesho === 'string' ? incomingMarketplaces.meesho.trim() : (existingMarketplaces.meesho || ''),
      }
    : existingMarketplaces; // Always preserve trusted database record for Product Manager

  const active = isSuper
    ? (typeof input.active === 'boolean' ? input.active : (existingProduct?.active ?? true))
    : (existingProduct ? existingProduct.active : true);

  return {
    sanitized: {
      ...input,
      marketplaces,
      active,
    },
    rejectedMarketplaceAttempt,
  };
}
