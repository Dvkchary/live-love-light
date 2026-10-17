import { auth, currentUser } from '@clerk/nextjs/server';
import { UserRole, AdminRole, AdminPermissions } from '@/types';

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
  return role === 'super_admin';
}

export function canManagePublishing(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin' || role === 'product_manager';
}

export function canManageAdminRoles(role: UserRole): boolean {
  return role === 'super_admin';
}

export function canAccessAdminSettings(role: UserRole): boolean {
  return role === 'super_admin';
}

export function getAdminPermissions(role: UserRole): AdminPermissions {
  return {
    canManageProductContent: canManageProductContent(role),
    canManageMarketplaceLinks: canManageMarketplaceLinks(role),
    canManagePublishing: canManagePublishing(role),
    canManageAdminRoles: canManageAdminRoles(role),
    canAccessAdminSettings: canAccessAdminSettings(role),
    canManageCategories: role === 'super_admin' || role === 'admin' || role === 'product_manager',
    canViewOrders: role === 'super_admin',
  };
}

/**
 * Resolves the authenticated user and their trusted role strictly from server-side sources:
 * 1. Clerk session & server-controlled publicMetadata
 * 2. Supabase profiles table
 * Never trusts client-supplied headers, query parameters, passcodes, or local storage.
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

      // 1. Explicit Clerk User ID configuration via environment variables:
      const superAdminId = process.env.SUPER_ADMIN_CLERK_ID?.trim();
      const adminId = process.env.ADMIN_CLERK_ID?.trim() || process.env.PRODUCT_MANAGER_CLERK_ID?.trim();

      let resolvedRole: UserRole = 'user';

      if (superAdminId && userId === superAdminId) {
        resolvedRole = 'super_admin';
      } else if (adminId && userId === adminId) {
        resolvedRole = 'admin';
      } else {
        // 2. Server-controlled Clerk metadata
        const rawMetadataRole = (user?.publicMetadata as { role?: string })?.role;

        if (rawMetadataRole === 'super_admin') {
          resolvedRole = 'super_admin';
        } else if (rawMetadataRole === 'admin' || rawMetadataRole === 'product_manager') {
          resolvedRole = 'admin';
        }
      }

      const metadataDisplayName = (user?.publicMetadata as { displayName?: string })?.displayName;
      const designatedDisplayName =
        resolvedRole === 'super_admin'
          ? 'Live Love Light Owner'
          : resolvedRole === 'admin'
          ? 'Live Love Light Admin'
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
    role: 'user',
    permissions: getAdminPermissions('user'),
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

  const role: AdminRole = authContext.role === 'super_admin' ? 'super_admin' : 'admin';

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
 * - Admins cannot change marketplace links, featured status, or publishing state.
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
  const featured = isSuper
    ? (typeof input.featured === 'boolean' ? input.featured : (existingProduct?.featured ?? false))
    : (existingProduct ? existingProduct.featured : false);

  return {
    sanitized: {
      ...input,
      marketplaces,
      active,
      featured,
    },
    rejectedMarketplaceAttempt,
  };
}
