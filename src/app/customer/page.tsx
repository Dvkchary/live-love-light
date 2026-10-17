'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ZomatoFilters from '@/components/ZomatoFilters';
import ProductGrid from '@/components/ProductGrid';
import BrandStorySection from '@/components/BrandStorySection';
import MarketplaceBanner from '@/components/MarketplaceBanner';
import Footer from '@/components/Footer';
import { Product, FilterOptions } from '@/types';
import { getAllProducts } from '@/lib/products';
import { useAuth } from '@/lib/auth-context';
import { Flame, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const defaultFilters: FilterOptions = {
  searchQuery: '',
  category: 'all',
  fragrance: 'all',
  sortBy: 'featured',
  onlyInStock: false,
  onlyMarketplace: 'all',
  maxPrice: undefined,
};

export default function CustomerPortalPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute dynamic categories: ONLY display categories that contain active products
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.active && p.category) {
        cats.add(p.category);
      }
    });
    return Array.from(cats);
  }, [products]);

  // Compute available fragrances for filter dropdown
  const availableFragrances = useMemo(() => {
    const frags = new Set<string>();
    products.forEach(p => {
      if (p.active && p.fragrance) {
        frags.add(p.fragrance);
      }
    });
    return Array.from(frags);
  }, [products]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Only active products
        if (!p.active) return false;

        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchFrag = p.fragrance?.toLowerCase().includes(q);
          const matchCat = p.category?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchFrag && !matchCat) return false;
        }

        // Category filter
        if (filters.category !== 'all' && p.category !== filters.category) {
          return false;
        }

        // Fragrance filter
        if (filters.fragrance !== 'all' && p.fragrance !== filters.fragrance) {
          return false;
        }

        // In Stock filter
        if (filters.onlyInStock && !p.inStock) {
          return false;
        }

        // Max price filter
        if (filters.maxPrice && p.price > filters.maxPrice) {
          return false;
        }

        // Marketplace filter
        if (filters.onlyMarketplace && filters.onlyMarketplace !== 'all') {
          const m = filters.onlyMarketplace;
          const url = p.marketplaces?.[m];
          if (!url || url.trim().length === 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-low') {
          return a.price - b.price;
        }
        if (filters.sortBy === 'price-high') {
          return b.price - a.price;
        }
        if (filters.sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // Default: Featured first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [products, filters]);

  // Category thumbnail images mapping
  const categoryImages: Record<string, string> = {
    'Teddy Candles': '/images/teddy - Royal oud.jpeg',
    'Flower Candles': '/images/daisy - jasmine.jpeg',
    'Rose Candles': '/images/peony - jamsine & Royal oud.jpeg',
    'Fragrance Candles': '/images/jar - rayal oud.jpeg',
    'Decorative Candles': '/images/lotus - sandlewood.jpeg',
    'Gift Collections': '/images/logo.jpeg',
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
      <Navbar
        searchQuery={filters.searchQuery}
        onSearchChange={val => setFilters(prev => ({ ...prev, searchQuery: val }))}
      />

      {/* Customer Portal Welcome Banner */}
      {user && <div className="bg-[#F6F1EC] border-b border-[#EAE3D9] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#786C63]">Welcome,</span>
            <span className="font-semibold text-[#231B15]">{user?.displayName || 'Candle Collector'}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white border border-[#EAE3D9] text-[#9A7513]">
              Customer Portal
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#786C63]">
            <span>{user?.email || user?.phoneNumber || ''}</span>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace('/login');
              }}
              className="inline-flex items-center gap-1 text-xs text-[#231B15] hover:text-[#9A7513] font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>}

      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Categories Showcase Section */}
        <section id="categories" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-[#9A7513] uppercase mb-1">
                <Flame className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>CURATED BY CRAFT</span>
              </div>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-[#231B15]">
                Explore By Category
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#786C63] mt-2 sm:mt-0">
              Only authentic collections with active artisanal batches
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {availableCategories.map(cat => {
              const img = categoryImages[cat] || '/images/logo.jpeg';
              const count = products.filter(p => p.active && p.category === cat).length;
              const isSelected = filters.category === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, category: isSelected ? 'all' : cat }));
                    const el = document.getElementById('collection');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group text-left p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#231B15] text-[#FCFBF7] border-[#231B15] shadow-md scale-102'
                      : 'bg-white text-[#231B15] border-[#EAE3D9] hover:border-[#C59B27] hover:shadow-sm'
                  }`}
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#F6F1EC] mb-2.5 relative">
                    <Image
                      src={img}
                      alt={cat}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold leading-snug line-clamp-1 ${isSelected ? 'text-white' : 'text-[#231B15]'}`}>
                      {cat}
                    </h3>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#DFBE58]' : 'text-[#786C63]'}`}>
                      {count} {count === 1 ? 'candle' : 'candles'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Product Catalogue Section with Discovery Filters */}
        <section id="collection" className="pt-4 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#9A7513]">
                  CATALOGUE & MARKETPLACE DISCOVERY
                </span>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#231B15]">
                  Our Handcrafted Candles
                </h2>
              </div>
              <p className="text-xs text-[#786C63]">
                Scroll down naturally to browse all pieces. Click any candle to view scents & purchase links.
              </p>
            </div>
          </div>

          {/* Sticky Filters Bar */}
          <ZomatoFilters
            filters={filters}
            setFilters={setFilters}
            availableCategories={availableCategories}
            availableFragrances={availableFragrances}
            totalResults={filteredProducts.length}
            onReset={() => setFilters(defaultFilters)}
          />

          {/* Product Grid */}
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            onResetFilters={() => setFilters(defaultFilters)}
          />
        </section>

        {/* Brand Craft Story */}
        <BrandStorySection />

        {/* Marketplace Redirection Banner */}
        <MarketplaceBanner />
      </main>

      <Footer />
    </div>
  );
}
