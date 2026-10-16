'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import {
  Search,
  User,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  Sparkles
} from 'lucide-react';
import LoginModal from './LoginModal';

interface NavbarProps {
  onSearchClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export default function Navbar({ onSearchClick, searchQuery = '', onSearchChange }: NavbarProps) {
  const { user, isAdmin, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FCFBF7]/90 backdrop-blur-md border-b border-[#EAE3D9] transition-all">
        {/* Top luxury announcement bar */}
        <div className="bg-[#231B15] text-[#F6F1EC] text-xs py-1.5 px-4 text-center tracking-widest uppercase flex items-center justify-center gap-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#DFBE58] animate-pulse" />
          <span>Handcrafted Botanical Soy Wax • Discover & Shop on Amazon, Flipkart & Meesho</span>
          <Sparkles className="w-3.5 h-3.5 text-[#DFBE58] animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Mobile hamburger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#231B15] hover:bg-[#F6F1EC] transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Identity / Official Logo */}
            <div className="flex-1 lg:flex-none text-center lg:text-left">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#EAE3D9] shadow-xs shrink-0 bg-white">
                  <Image
                    src="/images/logo.jpeg"
                    alt="Live Love Light Logo"
                    fill
                    sizes="48px"
                    className="object-cover group-hover:scale-105 transition-transform"
                    priority
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-wider text-[#231B15] group-hover:text-[#9A7513] transition-colors leading-tight">
                    LIVE LOVE LIGHT
                  </span>
                  <span className="text-[8px] sm:text-[9px] tracking-[0.25em] text-[#786C63] font-semibold uppercase">
                    LIGHT SOMETHING BEAUTIFUL
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation links */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#231B15]">
              <Link href="/" className="hover:text-[#C59B27] transition-colors">
                Home
              </Link>
              <Link href="/#collection" className="hover:text-[#C59B27] transition-colors">
                Explore Candles
              </Link>
              <Link href="/#categories" className="hover:text-[#C59B27] transition-colors">
                Categories
              </Link>
              <Link href="/about" className="hover:text-[#C59B27] transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="hover:text-[#C59B27] transition-colors">
                Support
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#9A7513] bg-[#F4E8C1]/60 px-3 py-1 rounded-full hover:bg-[#F4E8C1] transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Right actions: Search, Wishlist, Account */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Zomato-style Quick Search Input (Desktop) */}
              <div className="hidden md:flex items-center relative w-56 lg:w-72">
                <Search className="w-4 h-4 text-[#786C63] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search candles, fragrances..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full bg-[#F6F1EC] text-sm text-[#231B15] placeholder-[#786C63] pl-9 pr-3 py-2 rounded-full border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
                />
              </div>

              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={onSearchClick}
                className="md:hidden p-2 text-[#231B15] hover:bg-[#F6F1EC] rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Account Dropdown / Login button */}
              <div className="relative">
                {user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-2 p-1.5 pr-3 bg-[#F6F1EC] border border-[#EAE3D9] rounded-full text-xs font-medium text-[#231B15] hover:border-[#C59B27] transition-all"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#C59B27] text-white flex items-center justify-center font-bold text-xs uppercase">
                        {user.displayName?.[0] || 'U'}
                      </div>
                      <span className="hidden sm:inline max-w-[90px] truncate">{user.displayName}</span>
                    </button>

                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#FCFBF7] rounded-xl shadow-xl border border-[#EAE3D9] py-2 z-50 animate-in fade-in-50">
                        <div className="px-4 py-2 border-b border-[#EAE3D9]">
                          <p className="text-xs text-[#786C63]">Signed in as</p>
                          <p className="text-sm font-semibold text-[#231B15] truncate">
                            {user.email || user.phoneNumber || user.displayName}
                          </p>
                          {isAdmin && (
                            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-[#9A7513] bg-[#F4E8C1] px-2 py-0.5 rounded">
                              Administrator
                            </span>
                          )}
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#231B15] hover:bg-[#F6F1EC] transition-colors"
                        >
                          <User className="w-4 h-4 text-[#786C63]" />
                          My Account & Wishlist
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#9A7513] hover:bg-[#F6F1EC] transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Admin Catalogue Manager
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserDropdown(false);
                            logout();
                          }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsLoginOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#231B15] text-[#FCFBF7] text-xs font-medium hover:bg-[#3D3027] transition-all shadow-sm"
                  >
                    <User className="w-3.5 h-3.5 text-[#DFBE58]" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FCFBF7] border-b border-[#EAE3D9] px-4 pt-3 pb-6 space-y-3">
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-[#786C63] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search candles or fragrances..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full bg-[#F6F1EC] text-sm text-[#231B15] placeholder-[#786C63] pl-9 pr-3 py-2 rounded-lg border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27]"
              />
            </div>
            <div className="flex flex-col space-y-2 text-sm font-medium text-[#231B15]">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-[#F6F1EC]"
              >
                Home
              </Link>
              <Link
                href="/#collection"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-[#F6F1EC]"
              >
                Explore Candles
              </Link>
              <Link
                href="/#categories"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-[#F6F1EC]"
              >
                Categories
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-[#F6F1EC]"
              >
                My Account
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-[#F6F1EC]"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-[#F6F1EC]"
              >
                Customer Support
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-[#9A7513] font-semibold bg-[#F4E8C1]/60"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
