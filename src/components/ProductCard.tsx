'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { Heart, Sparkles, ExternalLink, ArrowRight, Flame } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useAuth();
  const wishlisted = isWishlisted(product.id);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const hasAmazon = Boolean(product.marketplaces?.amazon && product.marketplaces.amazon.trim().length > 0);
  const hasFlipkart = Boolean(product.marketplaces?.flipkart && product.marketplaces.flipkart.trim().length > 0);
  const hasMeesho = Boolean(product.marketplaces?.meesho && product.marketplaces.meesho.trim().length > 0);

  const mainImage = product.images?.[0] || '/images/01-handcrafted-candles.png';

  return (
    <div className="group bg-white rounded-2xl border border-[#EAE3D9] overflow-hidden luxury-card-shadow transition-all duration-300 flex flex-col h-full relative">
      {/* Top Media Container */}
      <div className="relative aspect-square w-full bg-[#F6F1EC] overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-2.5 left-2.5 bg-[#231B15]/90 backdrop-blur-xs text-[#FCFBF7] text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-[#DFBE58]" />
            <span>Featured</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
            wishlisted
              ? 'bg-rose-50 text-rose-600 shadow-md scale-105'
              : 'bg-white/80 text-[#786C63] hover:text-rose-600 hover:bg-white shadow-xs'
          }`}
          aria-label={wishlisted ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Marketplace Availability Indicator Tag */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 overflow-hidden">
          {hasAmazon && (
            <span className="bg-[#231B15]/85 backdrop-blur-xs text-[#FF9900] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
              Amazon
            </span>
          )}
          {hasFlipkart && (
            <span className="bg-[#231B15]/85 backdrop-blur-xs text-[#2874F0] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
              Flipkart
            </span>
          )}
          {hasMeesho && (
            <span className="bg-[#231B15]/85 backdrop-blur-xs text-[#E02076] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
              Meesho
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Fragrance Tag */}
          <div className="flex items-center justify-between text-[11px] text-[#786C63] font-medium mb-1.5">
            <span className="text-[#9A7513] uppercase tracking-wider font-semibold truncate max-w-[120px]">
              {product.category}
            </span>
            {product.fragrance && (
              <span className="flex items-center gap-1 text-[#786C63] truncate max-w-[120px]" title={product.fragrance}>
                <Flame className="w-3 h-3 text-[#C59B27] shrink-0" />
                <span className="truncate">{product.fragrance}</span>
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-[#231B15] group-hover:text-[#9A7513] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-[#786C63] line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 border-t border-[#EAE3D9] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-[#231B15]">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-[#786C63] line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            {discountPercent && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                Save {discountPercent}%
              </span>
            )}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F6F1EC] group-hover:bg-[#231B15] text-[#231B15] group-hover:text-white text-xs font-semibold tracking-wider transition-colors"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
