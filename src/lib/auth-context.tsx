'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { useUser, useClerk } from '@clerk/nextjs';
import { isFirebaseConfigured, auth } from './firebase';
import { getSupabaseBrowserClient } from './supabase';
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  User as FirebaseUser
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  openSignIn: () => void;
  loginWithDemoUser: (role: 'customer' | 'admin', identifier?: string) => void;
  logout: () => Promise<void>;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  sendEmailOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  sendMobileOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyMobileOtp: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'lll_auth_user_v1';
const LOCAL_WISHLIST_KEY = 'lll_wishlist_v1';
const RATE_LIMIT_KEY = 'lll_otp_rate_limit_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isFbConfigured = isFirebaseConfigured();
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const isConfigured = isClerkConfigured || isFbConfigured;

  // Clerk authentication state
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn, user: clerkUser } = useUser();
  const clerk = useClerk();

  // Local user fallback for preview / offline demo
  const [localUser, setLocalUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const localStored = localStorage.getItem(LOCAL_USER_KEY);
      return localStored ? JSON.parse(localStored) : null;
    } catch {
      return null;
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const storedWishlist = localStorage.getItem(LOCAL_WISHLIST_KEY);
      return storedWishlist ? JSON.parse(storedWishlist) : [];
    } catch {
      return [];
    }
  });

  // Determine active user profile (prioritizing Clerk authenticated user)
  let user: UserProfile | null = null;

  if (clerkSignedIn && clerkUser) {
    const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;
    const primaryPhone = clerkUser.primaryPhoneNumber?.phoneNumber;
    const displayName =
      clerkUser.fullName ||
      clerkUser.firstName ||
      clerkUser.username ||
      primaryEmail?.split('@')[0] ||
      'Candle Enthusiast';

    const isClerkAdmin = Boolean(
      clerkUser.publicMetadata?.role === 'admin' ||
      primaryEmail?.endsWith('@livelovelight.website') ||
      primaryEmail?.endsWith('@livelovelight.in') ||
      primaryEmail === 'admin@livelovelight.website'
    );

    user = {
      uid: clerkUser.id,
      email: primaryEmail,
      phoneNumber: primaryPhone,
      displayName,
      role: isClerkAdmin ? 'admin' : 'customer',
      savedProducts: wishlist,
      createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString()
    };
  } else {
    user = localUser;
  }

  const loading = isClerkConfigured ? !clerkLoaded : false;
  const isAdmin = user?.role === 'admin';

  // Sync Clerk authenticated user into Supabase profiles table
  useEffect(() => {
    if (!clerkSignedIn || !clerkUser) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;
    const primaryPhone = clerkUser.primaryPhoneNumber?.phoneNumber;
    const displayName =
      clerkUser.fullName ||
      clerkUser.firstName ||
      clerkUser.username ||
      primaryEmail?.split('@')[0] ||
      'Candle Enthusiast';

    const role = (
      clerkUser.publicMetadata?.role === 'admin' ||
      primaryEmail?.endsWith('@livelovelight.website') ||
      primaryEmail?.endsWith('@livelovelight.in')
    ) ? 'admin' : 'customer';

    supabase
      .from('profiles')
      .upsert({
        id: clerkUser.id,
        email: primaryEmail || null,
        phone_number: primaryPhone || null,
        display_name: displayName,
        role,
        saved_products: wishlist,
        updated_at: new Date().toISOString()
      })
      .then(({ error }) => {
        if (error) {
          console.warn('Supabase profile sync note:', error.message);
        }
      });
  }, [clerkSignedIn, clerkUser, wishlist]);

  // Legacy Firebase listener (for fallback only if Clerk is not used)
  useEffect(() => {
    if (!isClerkConfigured && isFbConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || undefined,
            phoneNumber: fbUser.phoneNumber || undefined,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Candle Enthusiast',
            role: fbUser.email?.endsWith('@livelovelight.in') ? 'admin' : 'customer',
            createdAt: new Date().toISOString()
          };
          setLocalUser(profile);
          try {
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
          } catch {}
        }
      });
      return () => unsubscribe();
    }
  }, [isClerkConfigured, isFbConfigured]);

  // Open Clerk sign-in modal
  const openSignIn = () => {
    try {
      clerk.openSignIn();
    } catch (e) {
      console.warn('Clerk openSignIn modal note:', e);
    }
  };

  // Toggle saved wishlist and sync to Supabase if signed in
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];

      try {
        localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(updated));
      } catch {}

      // Sync wishlist to Supabase profile
      if (clerkSignedIn && clerkUser) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          supabase
            .from('profiles')
            .update({ saved_products: updated, updated_at: new Date().toISOString() })
            .eq('id', clerkUser.id)
            .then(() => {});
        }
      }

      return updated;
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Rate limiting check
  const checkRateLimit = (key: string): boolean => {
    try {
      const now = Date.now();
      const raw = localStorage.getItem(`${RATE_LIMIT_KEY}_${key}`);
      let timestamps: number[] = raw ? JSON.parse(raw) : [];
      timestamps = timestamps.filter(t => now - t < 300000);
      if (timestamps.length >= 3) return false;
      timestamps.push(now);
      localStorage.setItem(`${RATE_LIMIT_KEY}_${key}`, JSON.stringify(timestamps));
      return true;
    } catch {
      return true;
    }
  };

  const sendEmailOtp = async (email: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!checkRateLimit(`email_${email}`)) {
      return { success: false, message: 'Too many OTP requests. Please wait 5 minutes before trying again.' };
    }
    if (isClerkConfigured) {
      openSignIn();
      return { success: true, message: 'Opening secure Clerk authentication...' };
    }
    return { success: false, message: 'Authentication provider is not yet configured.' };
  };

  const verifyEmailOtp = async (_email: string, otp: string) => {
    if (!otp || otp.trim().length < 4) {
      return { success: false, message: 'Please enter a valid verification code.' };
    }
    return { success: false, message: 'Please use the official Clerk sign-in modal.' };
  };

  const sendMobileOtp = async (phone: string) => {
    if (!phone || phone.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
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

  // Safe developer preview login
  const loginWithDemoUser = (role: 'customer' | 'admin', identifier: string = 'demo@livelovelight.in') => {
    const profile: UserProfile = {
      uid: `usr_${role}_${Date.now()}`,
      email: identifier.includes('@') ? identifier : undefined,
      phoneNumber: !identifier.includes('@') ? identifier : undefined,
      displayName: role === 'admin' ? 'Store Administrator' : 'Guest Collector',
      role,
      savedProducts: wishlist,
      createdAt: new Date().toISOString()
    };
    setLocalUser(profile);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    } catch {}
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
    setLocalUser(null);
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured,
        isAdmin,
        openSignIn,
        loginWithDemoUser,
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
