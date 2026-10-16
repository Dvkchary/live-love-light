'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1D1714] text-[#EBE3D7] border-t border-[#2E241E] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2E241E]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#3A2D24] shadow-md shrink-0 bg-white">
                <Image
                  src="/images/logo.jpeg"
                  alt="Live Love Light Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif-luxury text-2xl font-bold tracking-wider text-white">
                  LIVE LOVE LIGHT
                </span>
                <span className="text-[9px] tracking-[0.28em] text-[#DFBE58] font-semibold uppercase mt-0.5">
                  LIGHT SOMETHING BEAUTIFUL
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#DECDBA] leading-relaxed max-w-sm">
              Artisan handcrafted candles designed with 100% botanical soy wax and exquisite fragrances. Bringing warmth, elegance, and mindful fragrance rituals into Indian homes.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-[#DECDBA]">
              <Sparkles className="w-3.5 h-3.5 text-[#DFBE58]" />
              <span>Small-batch hand-poured in India with love.</span>
            </div>
          </div>

          {/* Quick Discovery */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-widest uppercase text-white font-sans">
              Discovery
            </h4>
            <ul className="space-y-2 text-xs text-[#DECDBA]">
              <li>
                <Link href="/#collection" className="hover:text-[#DFBE58] transition-colors">
                  All Candles
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-[#DFBE58] transition-colors">
                  Product Categories
                </Link>
              </li>
              <li>
                <Link href="/#collection" className="hover:text-[#DFBE58] transition-colors">
                  Teddy Candles
                </Link>
              </li>
              <li>
                <Link href="/#collection" className="hover:text-[#DFBE58] transition-colors">
                  Sculpted Florals
                </Link>
              </li>
              <li>
                <Link href="/#collection" className="hover:text-[#DFBE58] transition-colors">
                  Luxury Gift Boxes
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-widest uppercase text-white font-sans">
              Trust & Support
            </h4>
            <ul className="space-y-2 text-xs text-[#DECDBA]">
              <li>
                <Link href="/about" className="hover:text-[#DFBE58] transition-colors">
                  About Live Love Light
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#DFBE58] transition-colors">
                  Customer Care & Inquiries
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#DFBE58] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#DFBE58] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#DFBE58] transition-colors">
                  My Account & Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Marketplaces notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-widest uppercase text-white font-sans">
              Shop On Marketplaces
            </h4>
            <p className="text-xs text-[#DECDBA] leading-relaxed">
              We list our authentic products on premier marketplaces for trusted fulfillment:
            </p>
            <div className="space-y-1.5 text-xs text-[#DFBE58] font-medium">
              <p>• Amazon India (Prime Eligible)</p>
              <p>• Flipkart Assured</p>
              <p>• Meesho Direct</p>
            </div>
            <p className="text-[10px] text-[#786C63] pt-1">
              Secure payments & pan-India courier delivery handled by marketplace partners.
            </p>
          </div>
        </div>

        {/* Marketplace Disclaimer & Legal Transparency */}
        <div className="pt-8 space-y-4">
          <div className="bg-[#241B16] rounded-xl p-4 border border-[#3A2D24] text-[11px] text-[#A6998E] leading-relaxed">
            <p className="font-semibold text-[#DFBE58] mb-1">
              Third-Party Marketplace Disclosure
            </p>
            <p>
              Live Love Light is an independent lifestyle candle brand. Our website acts as a product discovery catalogue. All final transactions, payment processing, shipping, and returns are completed directly through official listings on <strong>Amazon.in</strong>, <strong>Flipkart.com</strong>, or <strong>Meesho.com</strong>. Live Love Light does not claim official affiliation or ownership of Amazon, Flipkart, or Meesho.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#786C63] gap-4 pt-2">
            <p>© 2026 Live Love Light. All rights reserved. Light Something Beautiful.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:underline">Privacy</Link>
              <Link href="/terms" className="hover:underline">Terms</Link>
              <Link href="/contact" className="hover:underline">Support</Link>
              <Link href="/admin" className="hover:underline text-[#DFBE58]">Admin Portal</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
