'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="space-y-4 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#9A7513]">
            TERMS OF SERVICE & MARKETPLACE DISCLOSURE
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-[#231B15]">
            Terms and Conditions
          </h1>
          <p className="text-xs text-[#786C63]">
            Last updated: October 2026 • Live Love Light
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#EAE3D9] p-8 sm:p-12 shadow-sm space-y-8 text-sm text-[#786C63] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif-luxury text-xl font-bold text-[#231B15]">
              1. Platform Nature & Redirection Model
            </h2>
            <p>
              Live Love Light operates primarily as an online product discovery showcase and catalogue. When you choose to purchase an item, you are redirected to third-party marketplaces including Amazon, Flipkart, or Meesho where our products are officially listed.
            </p>
            <p>
              Live Love Light does not directly execute payments, process checkouts, or hold escrow funds on this website.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-xl font-bold text-[#231B15]">
              2. Third-Party Marketplace Relationship
            </h2>
            <p>
              Live Love Light is an independent artisan candle brand. We are not officially owned, endorsed, or operated by Amazon.in (Amazon Seller Services Pvt. Ltd.), Flipkart Internet Pvt. Ltd., or Meesho (Fashnear Technologies Pvt. Ltd.). All brand names and platform trademarks belong to their respective proprietors.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-xl font-bold text-[#231B15]">
              3. Pricing & Product Availability
            </h2>
            <p>
              Prices, discounts, and inventory counts shown on this catalogue are provided for discovery purposes and reflect recent recommended retail pricing. The authoritative selling price, active coupon promotions, and live delivery estimates are established by the respective marketplace listing at the moment of your final order placement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-xl font-bold text-[#231B15]">
              4. Shipping, Returns, and Replacements
            </h2>
            <p>
              Because purchases are completed on Amazon, Flipkart, or Meesho, shipping times, delivery dispatch, return windows, and replacement claims are handled according to the specific marketplace&apos;s customer protection guidelines under which the order was booked.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-xl font-bold text-[#231B15]">
              5. Intellectual Property
            </h2>
            <p>
              All photographs, logos, product designs, sculptural shapes, and textual content of &ldquo;Live Love Light&rdquo; and &ldquo;LIGHT SOMETHING BEAUTIFUL&rdquo; are proprietary assets of Live Love Light. Unauthorized reproduction or commercial re-use is strictly prohibited.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
