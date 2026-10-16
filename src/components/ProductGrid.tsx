'use client';

import React from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { SearchX, RotateCcw } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onResetFilters?: () => void;
}

export default function ProductGrid({
  products,
  loading = false,
  onResetFilters
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#EAE3D9] p-4 animate-pulse space-y-4"
            >
              <div className="aspect-square bg-[#F6F1EC] rounded-xl" />
              <div className="h-4 bg-[#F6F1EC] rounded w-3/4" />
              <div className="h-3 bg-[#F6F1EC] rounded w-1/2" />
              <div className="h-8 bg-[#F6F1EC] rounded w-full mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F6F1EC] text-[#786C63] mx-auto flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-[#C59B27]" />
        </div>
        <h3 className="font-serif-luxury text-2xl font-bold text-[#231B15] mb-2">
          No matching candles found
        </h3>
        <p className="text-sm text-[#786C63] max-w-md mx-auto mb-6">
          We couldn&apos;t find any candles matching your current filters or search terms. Try adjusting your search query or selecting a different fragrance.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#231B15] text-[#FCFBF7] text-xs font-semibold tracking-wider uppercase hover:bg-[#3D3027] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#DFBE58]" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
