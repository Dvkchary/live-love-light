'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Flame, Sparkles, Heart, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-[#F6F1EC] to-[#FCFBF7] border-b border-[#EAE3D9]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F4E8C1] border border-[#D9C38F] text-[#9A7513] text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE LIVE LOVE LIGHT ESSENCE</span>
            </div>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl font-bold text-[#231B15]">
              Light Something Beautiful
            </h1>
            <p className="text-base sm:text-lg text-[#786C63] leading-relaxed max-w-2xl mx-auto">
              Live Love Light was founded on a simple devotion: to create handcrafted candles that awaken peace, romance, and warm beauty in everyday spaces.
            </p>
          </div>
        </section>

        {/* Story Content with Imagery */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#9A7513]">
                ARTISANAL ROOTS
              </span>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#231B15]">
                Sculpted Petal by Petal
              </h2>
              <p className="text-sm text-[#786C63] leading-relaxed">
                Unlike mass factory candles that rely on industrial paraffin and synthetic blends, every Live Love Light piece begins with pure botanical soy wax. Our floral designs — from delicate blooming daisies to intricate multi-layered peonies — are sculpted and poured with precision.
              </p>
              <p className="text-sm text-[#786C63] leading-relaxed">
                Our wicks are carefully tested lead-free cotton wicks that provide a calm, smokeless, and soot-free burn.
              </p>
            </div>
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-[#EAE3D9] bg-[#F6F1EC]">
              <Image
                src="/images/01-handcrafted-candles.png"
                alt="Handcrafted candles"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-[#EAE3D9] bg-[#F6F1EC] order-2 md:order-1">
              <Image
                src="/images/02-fragrance-oils.png"
                alt="Fragrance oils"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4 order-1 md:order-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#9A7513]">
                AROMA PHILOSOPHY
              </span>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#231B15]">
                Prestige Scent Blending
              </h2>
              <p className="text-sm text-[#786C63] leading-relaxed">
                Fragrance evokes nostalgia, relaxation, and emotional sanctuary. We collaborate with master scent formulators to blend authentic Indian florals like night-blooming jasmine and sacred Mysore sandalwood with the prestigious, smoky warmth of Arabian Royal Oud.
              </p>
              <p className="text-sm text-[#786C63] leading-relaxed">
                Our formulas are cured slowly for several weeks before packaging, guaranteeing an intoxicating scent throw even unlit.
              </p>
            </div>
          </div>
        </section>

        {/* Marketplace Model Transparency Section */}
        <section className="bg-[#F6F1EC] py-16 border-t border-[#EAE3D9]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="font-serif-luxury text-3xl font-bold text-[#231B15]">
              Seamless Shopping on Trusted Marketplaces
            </h2>
            <p className="text-sm text-[#786C63] leading-relaxed max-w-2xl mx-auto">
              To guarantee prompt, nationwide delivery and maximum consumer confidence, we partner with premier marketplaces — Amazon, Flipkart, and Meesho. You discover the collection here on our brand website, and complete your purchase securely with your existing preferred payment modes.
            </p>
            <div className="pt-4">
              <Link
                href="/#collection"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#231B15] text-[#FCFBF7] text-xs font-semibold tracking-wider uppercase hover:bg-[#3D3027] transition-all shadow-md"
              >
                <span>Browse The Collection</span>
                <ArrowRight className="w-4 h-4 text-[#DFBE58]" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
