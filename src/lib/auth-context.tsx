'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { useUser, useClerk } from '@clerk/nextjs';
import { isFirebaseConfigured, auth } from './firebase';
import { getSupabaseBrowserClient } from './supabase';
import { signOut as fbSignOut } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isProductManager: boolean;
  openSignIn: () => void;
  logout: () => Promise<void>;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  sendEmailOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  sendMobileOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyMobileOtp: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_WISHLIST_KEY = 'lll_wishlist_v1';
const RATE_LIMIT_KEY = 'lll_otp_rate_limit_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isFbConfigured = isFirebaseConfigured();
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const isConfigured = isClerkConfigured || isFbConfigured;

  // Clerk authentication state
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn, user: clerkUser } = useUser();
  const clerk = useClerk();

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const storedWishlist = localStorage.getItem(LOCAL_WISHLIST_KEY);
      return storedWishlist ? JSON.parse(storedWishlist) : [];
    } catch {
      return [];
    }
  });

  // Determine active user profile strictly from authenticated Clerk user
  let user: UserProfile | null = null;

  if (clerkSignedIn && clerkUser) {
    const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;
    const primaryPhone = clerkUser.primaryPhoneNumber?.phoneNumber;

    const rawRole = (clerkUser.publicMetadata as { role?: string })?.role;
    let computedRole: UserRole = 'user';

    const superAdminEnv = process.env.NEXT_PUBLIC_SUPER_ADMIN_CLERK_ID || '';
    const superAdminIds = superAdminEnv.split(',').map(s => s.trim()).filter(Boolean);
    superAdminIds.push('user_3KoJSKsibmvnXr6GHtrV0QC3TYa', 'user_3KoN3Nwwtai7ZGXslEv7iaAgYFt');

    if (superAdminIds.includes(clerkUser.id) || rawRole === 'super_admin') {
      computedRole = 'super_admin';
    } else if (rawRole === 'admin' || rawRole === 'product_manager') {
      computedRole = 'admin';
    }

    const metadataDisplayName = (clerkUser.publicMetadata as { displayName?: string })?.displayName;
    const designatedDisplayName =
      computedRole === 'super_admin'
        ? 'Live Love Light Super Admin'
        : computedRole === 'admin'
        ? 'Live Love Light Admin'
        : undefined;

    const displayName =
      designatedDisplayName ||
      metadataDisplayName ||
      clerkUser.fullName ||
      clerkUser.firstName ||
      clerkUser.username ||
      primaryEmail?.split('@')[0] ||
      'Candle Enthusiast';

    user = {
      uid: clerkUser.id,
      email: primaryEmail,
      phoneNumber: primaryPhone,
      displayName,
      role: computedRole,
      savedProducts: wishlist,
      createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString()
    };
  }

  const loading = isClerkConfigured ? !clerkLoaded : false;
  const isSuperAdmin = user?.role === 'super_admin';
  const isProductManager = user?.role === 'product_manager';
  const isAdmin = isSuperAdmin || user?.role === 'admin' || isProductManager;

  useEffect(() => {
    if (!clerkSignedIn || !clerkUser || !user) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase.from('profiles').upsert({
      id: clerkUser.id,
      email: user.email || null,
      phone_number: user.phoneNumber || null,
      display_name: user.displayName || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.warn('Supabase profile sync note:', error.message);
    });
  }, [clerkSignedIn, clerkUser, user]);

  const openSignIn = () => {
    if (isClerkConfigured) {
      clerk.openSignIn();
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      try {
        localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const checkRateLimit = (identifier: string): boolean => {
    try {
      const raw = localStorage.getItem(RATE_LIMIT_KEY);
      const limits = raw ? JSON.parse(raw) : {};
      const lastSent = limits[identifier];
      const now = Date.now();
      if (lastSent && now - lastSent < 30000) {
        return false;
      }
      limits[identifier] = now;
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(limits));
      return true;
    } catch {
      return true;
    }
  };

  const sendEmailOtp = async (email: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    if (!checkRateLimit(email)) {
      return { success: false, message: 'Please wait 30 seconds before requesting another code.' };
    }
    if (isClerkConfigured) {
      openSignIn();
      return { success: true, message: 'Opening secure Clerk sign-in...' };
    }
    return { success: false, message: 'Authentication provider is not configured.' };
  };

  const verifyEmailOtp = async (_email: string, otp: string) => {
    if (!otp || otp.length < 4) {
      return { success: false, message: 'Invalid verification code.' };
    }
    return { success: false, message: 'Please use the official Clerk sign-in modal.' };
  };

  const sendMobileOtp = async (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, message: 'Please provide a valid 10-digit mobile number.' };
    }
    if (!checkRateLimit(cleanPhone)) {
      return { success: false, message: 'Please wait 30 seconds before requesting another code.' };
    }
    if (isClerkConfigured) {
      openSignIn();
      return { success: true, message: 'Opening secure Clerk authentication...' };
    }
    return { success: false, message: 'Authentication provider is not configured.' };
  };

  const verifyMobileOtp = async (_phone: string, otp: string) => {
    if (!otp || otp.length < 4) {
      return { success: false, message: 'Invalid verification code.' };
    }
    return { success: false, message: 'Please use the official Clerk sign-in modal.' };
  };

  const logout = async () => {
    if (clerkSignedIn) {
      try {
        await clerk.signOut();
      } catch (err) {
        console.warn('Clerk signout note:', err);
      }
    }
    if (isFbConfigured && auth) {
      try {
        await fbSignOut(auth);
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured,
        isAdmin,
        isSuperAdmin,
        isProductManager,
        openSignIn,
        logout,
        toggleWishlist,
        isWishlisted,
        sendEmailOtp,
        verifyEmailOtp,
        sendMobileOtp,
        verifyMobileOtp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
