'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="space-y-4 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#9A7513]">
            TRANSPARENCY & DATA ETHICS
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-[#231B15]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#786C63]">
            Last updated: October 2026 • Live Love Light
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#EAE3D9] p-8 sm:p-12 shadow-sm space-y-8 text-sm text-[#786C63] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif-luxury text-xl font-bold text-[#231B15]">
              1. Our Privacy Commitment
            </h2>
            <p>
              At Live Love Light ("we", "our", or "us"), we value your privacy. We design our website as an elegant discovery platform and minimize data collection to what is essential for account authentication and catalogue browsing.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-xl font-bold text-[#231B15]">
              2. Information We Collect
            </h2>
            <p>
              When you use our website, we may collect:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Authentication Information:</strong> Your email address or phone number when requesting one-time password (OTP) verification for your account.
              </li>
              <li>
                <strong>Saved Preferences:</strong> Candles you add to your wishlist, saved locally or linked securely to your authenticated session.
              </li>
              <li>
                <strong>Aggregated Analytics:</strong> Anonymized counts of marketplace button clicks (Amazon, Flipkart, Meesho) to understand product interest without logging personally identifiable browsing trails.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-xl font-bold text-[#231B15]">
              3. Payment Information
            </h2>
            <p>
              We do <strong>not</strong> collect, process, or store credit card numbers, UPI PINs, or net-banking credentials on Live Love Light. All financial transactions take place exclusively on the respective marketplace platform (Amazon, Flipkart, or Meesho) when you complete your purchase there.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-xl font-bold text-[#231B15]">
              4. Third-Party Links
            </h2>
            <p>
              Our website provides verified outbound links to product listings on Amazon India, Flipkart, and Meesho. Once you click these links and navigate away from our site, the privacy policies of the destination marketplaces govern your interactions and purchases on their platforms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-xl font-bold text-[#231B15]">
              5. Contact Regarding Privacy
            </h2>
            <p>
              If you have any questions about this Privacy Policy or wish to request deletion of your account profile, please write to us at <strong>privacy@livelovelight.in</strong>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
