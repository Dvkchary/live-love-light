'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/image';
import { Flame, Sparkles, Heart, ShieldCheck, ArrowRight } from 'lucide-react';

export default function BrandStorySection() {
  const pillars = [
    {
      title: 'Artisanal Hand-Sculpting',
      desc: 'Each candle is meticulously hand-sculpted and poured in small batches to preserve fine sculptural detail.',
      image: '/images/lotus - sandlewood.jpeg'
    },
    {
      title: 'Prestige Fragrance Blends',
      desc: 'Infused with fine fragrance oils including authentic Mysore sandalwood, Arabian royal oud, and blooming jasmine.',
      image: '/images/peony - jamsine & Royal oud.jpeg'
    },
    {
      title: '100% Botanical Soy Wax',
      desc: 'Clean-burning, soot-free botanical waxes safe for your home, loved ones, and mindful sanctuaries.',
      image: '/images/daisy - jasmine.jpeg'
    }
  ];

  return (
    <section className="bg-[#F6F1EC] py-16 sm:py-24 border-t border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4E8C1] border border-[#D9C38F] text-[#9A7513] text-[11px] font-semibold tracking-widest uppercase">
            <Sparkles className="w-3 h-3" />
            <span>THE LIVE LOVE LIGHT DIFFERENCE</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-[#231B15]">
            Handcrafted With Care, Lit With Love
          </h2>
          <p className="text-sm sm:text-base text-[#786C63] leading-relaxed">
            We believe lighting a candle is an intentional ritual. Every Live Love Light piece is crafted to turn routine spaces into warm sanctuaries of fragrance and tranquility.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-[#EAE3D9] luxury-card-shadow transition-all group"
            >
              <div className="relative h-56 w-full overflow-hidden bg-[#EBE3D7]">
                <Image
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-serif-luxury text-xl font-bold text-[#231B15]">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#786C63] leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
