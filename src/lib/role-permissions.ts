/**
 * Role-Based Access Control (RBAC) Permissions & Data Sanitization
 * Live Love Light — Two-Level Admin Role System
 *
 * Roles:
 * - product_manager: Content & catalog management, strictly restricted from marketplaces & roles.
 * - super_admin: Full access to all product fields, marketplace links, publishing, and role assignment.
 */

import type { UserRole, AdminRole, AdminPermissions, Product } from '../types/index.ts';

/**
 * Returns granular boolean permission flags for any given role.
 */
export function getAdminPermissions(role: UserRole): AdminPermissions {
  if (role === 'super_admin' || role === 'admin') {
    return {
      canManageProductContent: true,
      canManageMarketplaceLinks: true,
      canManagePublishing: true,
      canManageAdminRoles: true,
      canAccessAdminSettings: true,
    };
  }

  if (role === 'product_manager') {
    return {
      canManageProductContent: true,
      canManageMarketplaceLinks: false, // Strictly restricted
      canManagePublishing: false,        // Strictly restricted
      canManageAdminRoles: false,        // Strictly restricted
      canAccessAdminSettings: false,     // Strictly restricted
    };
  }

  // Customer or unauthenticated: zero administrative permissions
  return {
    canManageProductContent: false,
    canManageMarketplaceLinks: false,
    canManagePublishing: false,
    canManageAdminRoles: false,
    canAccessAdminSettings: false,
  };
}

export function canManageProductContent(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin' || role === 'product_manager';
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

export interface SanitizeOptions {
  role: UserRole;
  incomingData?: Partial<Product> | Record<string, unknown>;
  existingProduct?: Partial<Product> | Record<string, unknown> | null;
  isCreate?: boolean;
}

export type SanitizeResult = Record<string, unknown> & {
  sanitized: Record<string, unknown>;
  rejectedMarketplaceAttempt: boolean;
};

/**
 * Enforces role-based field restrictions on product creation and updates.
 *
 * Supports both:
 * 1. Options signature: sanitizeProductFieldsForRole({ role, incomingData, existingProduct, isCreate })
 * 2. Positional signature: sanitizeProductFieldsForRole(body, existingProduct, role)
 *
 * Security Guarantee for PRODUCT_MANAGER:
 * - On create: Marketplace links are stripped.
 * - On update: Strictly retains existing database marketplace URLs.
 * - Publishing / active state cannot be toggled by Product Manager.
 */
export function sanitizeProductFieldsForRole(
  inputOrOptions: Record<string, unknown> | SanitizeOptions,
  existingProductParam?: Record<string, unknown> | null,
  roleParam?: UserRole | AdminRole
): SanitizeResult {
  let role: UserRole = 'customer';
  let input: Record<string, unknown> = {};
  let existingProduct: Record<string, unknown> | null = null;
  let isCreate = false;

  if (
    inputOrOptions &&
    typeof inputOrOptions === 'object' &&
    'role' in inputOrOptions &&
    ('incomingData' in inputOrOptions || 'isCreate' in inputOrOptions)
  ) {
    const opts = inputOrOptions as SanitizeOptions;
    role = opts.role;
    input = (opts.incomingData as Record<string, unknown>) || {};
    existingProduct = (opts.existingProduct as Record<string, unknown>) || null;
    isCreate = Boolean(opts.isCreate);
  } else {
    input = (inputOrOptions as Record<string, unknown>) || {};
    existingProduct = existingProductParam || null;
    role = (roleParam as UserRole) || 'customer';
    isCreate = !existingProduct;
  }

  const isSuper = role === 'super_admin' || role === 'admin';
  let rejectedMarketplaceAttempt = false;

  const existingMarketplaces = (existingProduct?.marketplaces as Record<string, string>) || {
    amazon: (existingProduct?.amazon_url as string) || '',
    flipkart: (existingProduct?.flipkart_url as string) || '',
    meesho: (existingProduct?.meesho_url as string) || '',
  };

  const incomingMarketplaces = (input.marketplaces as Record<string, string>) || {
    amazon: (input.amazon_url as string) || '',
    flipkart: (input.flipkart_url as string) || '',
    meesho: (input.meesho_url as string) || '',
  };

  // Check if Product Manager attempted to alter marketplace URLs
  if (!isSuper) {
    if (
      (incomingMarketplaces.amazon && incomingMarketplaces.amazon !== (existingMarketplaces.amazon || '')) ||
      (incomingMarketplaces.flipkart && incomingMarketplaces.flipkart !== (existingMarketplaces.flipkart || '')) ||
      (incomingMarketplaces.meesho && incomingMarketplaces.meesho !== (existingMarketplaces.meesho || '')) ||
      (input.amazon_url && input.amazon_url !== (existingProduct?.amazon_url || '')) ||
      (input.flipkart_url && input.flipkart_url !== (existingProduct?.flipkart_url || '')) ||
      (input.meesho_url && input.meesho_url !== (existingProduct?.meesho_url || ''))
    ) {
      rejectedMarketplaceAttempt = true;
    }
  }

  let finalMarketplaces: Record<string, string> = {};
  if (isSuper) {
    finalMarketplaces = {
      amazon: typeof incomingMarketplaces.amazon === 'string' ? incomingMarketplaces.amazon.trim() : (existingMarketplaces.amazon || ''),
      flipkart: typeof incomingMarketplaces.flipkart === 'string' ? incomingMarketplaces.flipkart.trim() : (existingMarketplaces.flipkart || ''),
      meesho: typeof incomingMarketplaces.meesho === 'string' ? incomingMarketplaces.meesho.trim() : (existingMarketplaces.meesho || ''),
    };
  } else if (!isCreate && existingProduct) {
    // Preserve existing trusted marketplace URLs for Product Manager updates
    finalMarketplaces = {
      amazon: existingMarketplaces.amazon || (existingProduct.amazon_url as string) || '',
      flipkart: existingMarketplaces.flipkart || (existingProduct.flipkart_url as string) || '',
      meesho: existingMarketplaces.meesho || (existingProduct.meesho_url as string) || '',
    };
  } else {
    // Empty for new products created by Product Manager
    finalMarketplaces = {};
  }

  const active = isSuper
    ? (typeof input.active === 'boolean' ? input.active : (existingProduct?.active ?? true))
    : (existingProduct ? existingProduct.active : true);

  const sanitized: Record<string, unknown> = {
    ...input,
    marketplaces: finalMarketplaces,
    active,
  };

  if (!isSuper) {
    if (isCreate) {
      delete sanitized.amazon_url;
      delete sanitized.flipkart_url;
      delete sanitized.meesho_url;
    } else if (existingProduct) {
      sanitized.amazon_url = existingProduct.amazon_url;
      sanitized.flipkart_url = existingProduct.flipkart_url;
      sanitized.meesho_url = existingProduct.meesho_url;
    }
  } else {
    if (finalMarketplaces.amazon) sanitized.amazon_url = finalMarketplaces.amazon;
    if (finalMarketplaces.flipkart) sanitized.flipkart_url = finalMarketplaces.flipkart;
    if (finalMarketplaces.meesho) sanitized.meesho_url = finalMarketplaces.meesho;
  }

  const result = {
    ...sanitized,
    sanitized,
    rejectedMarketplaceAttempt,
  };

  return result as SanitizeResult;
}
