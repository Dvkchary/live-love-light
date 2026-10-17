'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SignIn, SignUp, useUser } from '@clerk/nextjs';
import { Sparkles, Shield, HeartHandshake, Flame } from 'lucide-react';

export default function LoginPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Automatic portal redirection after successful authentication
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Check role
      const rawRole = (user.publicMetadata as { role?: string })?.role;
      const superAdminId = process.env.NEXT_PUBLIC_SUPER_ADMIN_CLERK_ID?.trim();
      const productManagerId = process.env.NEXT_PUBLIC_PRODUCT_MANAGER_CLERK_ID?.trim();

      const isSuper = rawRole === 'super_admin' || rawRole === 'admin' || (superAdminId && user.id === superAdminId);
      const isPm = rawRole === 'product_manager' || (productManagerId && user.id === productManagerId);

      if (isSuper || isPm) {
        router.replace('/admin');
      } else {
        router.replace('/customer');
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  const clerkAppearance = {
    variables: {
      colorPrimary: '#C59B27',
      colorText: '#231B15',
      colorBackground: '#FCFBF7',
      colorInputBackground: '#FFFFFF',
      colorInputText: '#231B15',
      borderRadius: '0.75rem',
      fontFamily: 'inherit',
    },
    elements: {
      rootBox: 'w-full',
      card: 'bg-white/90 backdrop-blur-md border border-[#EAE3D9] shadow-xl rounded-2xl p-6 sm:p-8',
      headerTitle: 'font-serif-luxury text-2xl font-bold text-[#231B15]',
      headerSubtitle: 'text-xs text-[#786C63]',
      formButtonPrimary: 'bg-[#231B15] hover:bg-[#3D3027] text-white text-xs font-semibold tracking-wider uppercase py-2.5 transition-colors shadow-xs',
      formFieldInput: 'bg-white border-[#EAE3D9] focus:border-[#C59B27] focus:ring-[#C59B27] text-sm text-[#231B15] rounded-xl',
      footerActionLink: 'text-[#C59B27] hover:text-[#9A7513] font-semibold text-xs',
      identityPreviewText: 'text-sm text-[#231B15]',
      dividerLine: 'bg-[#EAE3D9]',
      dividerText: 'text-xs text-[#786C63]',
      socialButtonsBlockButton: 'border-[#EAE3D9] hover:bg-[#F6F1EC] text-xs font-medium text-[#231B15]',
    },
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] flex flex-col justify-between selection:bg-[#F4E8C1] selection:text-[#231B15]">
      {/* Top Announcement Bar */}
      <div className="bg-[#231B15] text-[#F6F1EC] text-xs py-2 px-4 text-center tracking-widest uppercase flex items-center justify-center gap-2 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-[#DFBE58] animate-pulse" />
        <span>Live Love Light • Artisanal Handcrafted Soy Candles</span>
        <Sparkles className="w-3.5 h-3.5 text-[#DFBE58] animate-pulse" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#C59B27]/40 shadow-lg mx-auto bg-white p-1">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/images/logo.jpeg"
                  alt="Live Love Light Official Emblem"
                  fill
                  sizes="80px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div>
              <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-wider text-[#231B15]">
                LIVE LOVE LIGHT
              </h1>
              <p className="text-[10px] tracking-[0.3em] font-semibold uppercase text-[#786C63] mt-1">
                LIGHT SOMETHING BEAUTIFUL
              </p>
            </div>

            <p className="text-xs text-[#786C63] max-w-xs mx-auto">
              Sign in to browse our exclusive hand-poured candle collections and access your portal.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="bg-[#F6F1EC] p-1 rounded-xl flex border border-[#EAE3D9] text-xs font-medium">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'signin'
                  ? 'bg-white text-[#231B15] font-semibold shadow-xs'
                  : 'text-[#786C63] hover:text-[#231B15]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-[#231B15] font-semibold shadow-xs'
                  : 'text-[#786C63] hover:text-[#231B15]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Authentication Container */}
          <div className="flex justify-center">
            {authMode === 'signin' ? (
              <SignIn
                routing="hash"
                appearance={clerkAppearance}
                fallbackRedirectUrl="/"
              />
            ) : (
              <SignUp
                routing="hash"
                appearance={clerkAppearance}
                fallbackRedirectUrl="/"
              />
            )}
          </div>

          {/* Security & Authenticity Trust Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#EAE3D9]/80 text-center text-[10px] text-[#786C63]">
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/60 border border-[#EAE3D9]">
              <Shield className="w-4 h-4 text-[#C59B27]" />
              <span className="font-semibold text-[#231B15]">Encrypted Auth</span>
              <span>256-Bit TLS</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/60 border border-[#EAE3D9]">
              <Flame className="w-4 h-4 text-[#C59B27]" />
              <span className="font-semibold text-[#231B15]">Pure Soy Wax</span>
              <span>100% Botanical</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/60 border border-[#EAE3D9]">
              <HeartHandshake className="w-4 h-4 text-[#C59B27]" />
              <span className="font-semibold text-[#231B15]">Verified Shop</span>
              <span>Amazon • Flipkart</span>
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Minimal Footer */}
      <footer className="py-4 text-center text-xs text-[#786C63] border-t border-[#EAE3D9] bg-white/50">
        <p>© 2026 Live Love Light. Handcrafted Luxury Candles. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
