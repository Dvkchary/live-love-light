'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Flame } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FCFBF7] via-[#F6F1EC] to-[#FCFBF7] border-b border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Brand Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Brand Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4E8C1]/80 border border-[#D9C38F] text-[#9A7513] text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIVE LOVE LIGHT • ARTISAN COLLECTION</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#231B15] leading-[1.1] tracking-tight">
              LIGHT SOMETHING <br />
              <span className="gold-gradient-text italic font-serif">BEAUTIFUL</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#786C63] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Discover handcrafted candles designed to bring warmth, fragrance, and beauty to your everyday moments. Sculpted with 100% botanical soy wax and infused with prestigious scents.
            </p>

            {/* Value Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-[#231B15]">
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-[#EAE3D9] shadow-2xs">
                <Flame className="w-4 h-4 text-[#C59B27]" />
                <span>100% Pure Soy Wax</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-[#EAE3D9] shadow-2xs">
                <Heart className="w-4 h-4 text-[#C59B27]" />
                <span>Hand-Poured With Care</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-[#EAE3D9] shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
                <span>Available on Prime Marketplaces</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/#collection"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#231B15] text-[#FCFBF7] text-xs sm:text-sm font-semibold tracking-widest uppercase hover:bg-[#3D3027] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 group"
              >
                <span>EXPLORE CANDLES</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#DFBE58]" />
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/80 text-[#231B15] text-xs sm:text-sm font-semibold tracking-widest uppercase hover:bg-[#F6F1EC] transition-all border border-[#EAE3D9] flex items-center justify-center"
              >
                OUR CRAFT STORY
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative warm aura glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#DFBE58]/20 via-[#F4E8C1]/40 to-transparent rounded-3xl blur-2xl -z-10" />

              {/* Main Candle Photo Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-[#F6F1EC]">
                <Image
                  src="/images/jar - rayal oud.jpeg"
                  alt="Live Love Light — Amber Glass Jar Candle"
                  width={600}
                  height={650}
                  priority
                  className="w-full h-[400px] sm:h-[480px] object-cover hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Overlaid Floating Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#EAE3D9] shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#9A7513]">
                      SIGNATURE BLEND
                    </span>
                    <p className="font-serif-luxury font-bold text-[#231B15] text-lg leading-tight">
                      Royal Oud & Amber Jar
                    </p>
                    <p className="text-xs text-[#786C63] mt-0.5">₹549 • 65 Hours Burn Time</p>
                  </div>
                  <Link
                    href="/product/amber-glass-jar-candle-royal-oud"
                    className="px-3.5 py-2 rounded-lg bg-[#231B15] text-white text-xs font-semibold hover:bg-[#3D3027] transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>

              {/* Little Floating Accent Card */}
              <div className="hidden sm:flex absolute -top-4 -left-6 bg-white rounded-xl p-3 shadow-xl border border-[#EAE3D9] items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F6F1EC] shrink-0">
                  <Image
                    src="/images/teddy - Royal oud.jpeg"
                    alt="Teddy Candle"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#231B15]">Teddy Candle</p>
                  <p className="text-[11px] text-[#9A7513] font-semibold">Bestseller</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
