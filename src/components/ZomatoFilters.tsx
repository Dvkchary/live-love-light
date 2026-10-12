'use client';

import React from 'react';
import { FilterOptions } from '@/types';
import {
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
  Check,
  RotateCcw,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface ZomatoFiltersProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  availableCategories: string[];
  availableFragrances: string[];
  totalResults: number;
  onReset: () => void;
}

export default function ZomatoFilters({
  filters,
  setFilters,
  availableCategories,
  availableFragrances,
  totalResults,
  onReset
}: ZomatoFiltersProps) {
  const isAnyFilterActive =
    filters.category !== 'all' ||
    filters.fragrance !== 'all' ||
    filters.onlyInStock ||
    filters.onlyMarketplace !== 'all' ||
    Boolean(filters.maxPrice) ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="bg-[#FCFBF7] border-y border-[#EAE3D9] py-4 sticky top-20 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Row 1: Category Pills (Zomato-style horizontal scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-semibold transition-all border shrink-0 ${
              filters.category === 'all'
                ? 'bg-[#231B15] text-[#FCFBF7] border-[#231B15] shadow-xs'
                : 'bg-white text-[#786C63] border-[#EAE3D9] hover:border-[#C59B27] hover:text-[#231B15]'
            }`}
          >
            All Collections
          </button>

          {availableCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-semibold transition-all border shrink-0 ${
                filters.category === cat
                  ? 'bg-[#231B15] text-[#FCFBF7] border-[#231B15] shadow-xs'
                  : 'bg-white text-[#786C63] border-[#EAE3D9] hover:border-[#C59B27] hover:text-[#231B15]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Row 2: Secondary Quick Filter Badges & Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          {/* Quick Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Fragrance Selector */}
            <select
              value={filters.fragrance}
              onChange={e => setFilters(prev => ({ ...prev, fragrance: e.target.value }))}
              className="bg-white border border-[#EAE3D9] text-[#231B15] rounded-full px-3 py-1.5 font-medium hover:border-[#C59B27] focus:outline-none focus:border-[#C59B27]"
            >
              <option value="all">Fragrance: All Scents</option>
              {availableFragrances.map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            {/* Marketplace Filter */}
            <button
              type="button"
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  onlyMarketplace: prev.onlyMarketplace === 'amazon' ? 'all' : 'amazon'
                }));
              }}
              className={`px-3 py-1.5 rounded-full border transition-all font-medium flex items-center gap-1.5 ${
                filters.onlyMarketplace === 'amazon'
                  ? 'bg-[#FF9900]/15 text-[#8A5200] border-[#FF9900] font-semibold'
                  : 'bg-white text-[#786C63] border-[#EAE3D9] hover:border-[#C59B27]'
              }`}
            >
              <span>On Amazon</span>
              {filters.onlyMarketplace === 'amazon' && <Check className="w-3 h-3" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  onlyMarketplace: prev.onlyMarketplace === 'flipkart' ? 'all' : 'flipkart'
                }));
              }}
              className={`px-3 py-1.5 rounded-full border transition-all font-medium flex items-center gap-1.5 ${
                filters.onlyMarketplace === 'flipkart'
                  ? 'bg-[#2874F0]/15 text-[#134CA6] border-[#2874F0] font-semibold'
                  : 'bg-white text-[#786C63] border-[#EAE3D9] hover:border-[#C59B27]'
              }`}
            >
              <span>On Flipkart</span>
              {filters.onlyMarketplace === 'flipkart' && <Check className="w-3 h-3" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  onlyMarketplace: prev.onlyMarketplace === 'meesho' ? 'all' : 'meesho'
                }));
              }}
              className={`px-3 py-1.5 rounded-full border transition-all font-medium flex items-center gap-1.5 ${
                filters.onlyMarketplace === 'meesho'
                  ? 'bg-[#8A2464]/15 text-[#8A2464] border-[#8A2464] font-semibold'
                  : 'bg-white text-[#786C63] border-[#EAE3D9] hover:border-[#C59B27]'
              }`}
            >
              <span>On Meesho</span>
              {filters.onlyMarketplace === 'meesho' && <Check className="w-3 h-3" />}
            </button>

            {/* Price under ₹400 filter */}
            <button
              type="button"
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  maxPrice: prev.maxPrice === 400 ? undefined : 400
                }));
              }}
              className={`px-3 py-1.5 rounded-full border transition-all font-medium flex items-center gap-1.5 ${
                filters.maxPrice === 400
                  ? 'bg-[#F4E8C1] text-[#9A7513] border-[#D9C38F] font-semibold'
                  : 'bg-white text-[#786C63] border-[#EAE3D9] hover:border-[#C59B27]'
              }`}
            >
              <span>Under ₹400</span>
              {filters.maxPrice === 400 && <Check className="w-3 h-3" />}
            </button>

            {/* In Stock Only */}
            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, onlyInStock: !prev.onlyInStock }))}
              className={`px-3 py-1.5 rounded-full border transition-all font-medium flex items-center gap-1.5 ${
                filters.onlyInStock
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                  : 'bg-white text-[#786C63] border-[#EAE3D9] hover:border-[#C59B27]'
              }`}
            >
              <span>In Stock Only</span>
              {filters.onlyInStock && <Check className="w-3 h-3" />}
            </button>

            {/* Reset button if active */}
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={onReset}
                className="px-2.5 py-1.5 rounded-full text-[#786C63] hover:text-red-700 hover:bg-red-50 flex items-center gap-1 transition-colors font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Right side: Sort By + Results Count */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-[#786C63] text-xs font-medium">
              Showing <strong className="text-[#231B15]">{totalResults}</strong> handcrafted {totalResults === 1 ? 'candle' : 'candles'}
            </span>

            <div className="flex items-center gap-1.5 bg-white border border-[#EAE3D9] rounded-full px-3 py-1.5">
              <ArrowUpDown className="w-3 h-3 text-[#786C63]" />
              <select
                value={filters.sortBy}
                onChange={e =>
                  setFilters(prev => ({
                    ...prev,
                    sortBy: e.target.value as FilterOptions['sortBy']
                  }))
                }
                className="bg-transparent text-xs font-semibold text-[#231B15] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
