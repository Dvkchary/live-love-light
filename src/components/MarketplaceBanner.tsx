'use client';

import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function MarketplaceBanner() {
  return (
    <section className="bg-[#231B15] text-[#FCFBF7] py-16 px-4 sm:px-6 lg:px-8 border-t border-[#3D3027]">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#2A211B] via-[#352922] to-[#2A211B] rounded-3xl p-8 sm:p-12 border border-[#4D3A2F] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left explanation */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#DFBE58] uppercase">
                EFFORTLESS MARKETPLACE REDIRECTION
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white leading-tight">
                Discover Here, Purchase on India&apos;s Favorite Platforms
              </h2>
              <p className="text-sm text-[#DECDBA] leading-relaxed max-w-xl">
                We believe in zero payment friction. Explore our curated collections, view scent profiles and burning notes, and complete your purchase securely with your existing accounts on Amazon, Flipkart, or Meesho.
              </p>

              {/* Supported Marketplaces Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <div className="bg-[#1A1410] border border-[#FF9900]/40 rounded-xl px-4 py-2 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
                  <span className="text-xs font-bold text-white">Amazon India</span>
                </div>
                <div className="bg-[#1A1410] border border-[#2874F0]/40 rounded-xl px-4 py-2 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2874F0]" />
                  <span className="text-xs font-bold text-white">Flipkart</span>
                </div>
                <div className="bg-[#1A1410] border border-[#E02076]/40 rounded-xl px-4 py-2 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E02076]" />
                  <span className="text-xs font-bold text-white">Meesho</span>
                </div>
              </div>
            </div>

            {/* Right trust points */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-1">
                <ShieldCheck className="w-6 h-6 text-[#DFBE58] mb-2" />
                <h4 className="text-sm font-bold text-white">100% Secure Checkout</h4>
                <p className="text-xs text-[#DECDBA]">
                  Protected by Amazon Pay, Flipkart Pay, and standard marketplace protections.
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-1">
                <Truck className="w-6 h-6 text-[#DFBE58] mb-2" />
                <h4 className="text-sm font-bold text-white">Pan-India Express</h4>
                <p className="text-xs text-[#DECDBA]">
                  Fast doorstep delivery across all Indian pin codes with real-time tracking.
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-1">
                <RefreshCw className="w-6 h-6 text-[#DFBE58] mb-2" />
                <h4 className="text-sm font-bold text-white">Easy Returns</h4>
                <p className="text-xs text-[#DECDBA]">
                  Seamless return and replacement assistance under marketplace guarantee.
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-1">
                <ShoppingBag className="w-6 h-6 text-[#DFBE58] mb-2" />
                <h4 className="text-sm font-bold text-white">Authentic Fragrances</h4>
                <p className="text-xs text-[#DECDBA]">
                  Directly dispatched from Live Love Light certified craft batches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
