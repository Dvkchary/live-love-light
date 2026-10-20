'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { getAllProducts, getProductBySlug } from '@/lib/products';
import { trackMarketplaceClick } from '@/lib/analytics';
import { useAuth } from '@/lib/auth-context';
import {
  Heart,
  Flame,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  ShoppingBag,
  Info
} from 'lucide-react';

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const { isWishlisted, toggleWishlist } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [clickNotice, setClickNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const found = await getProductBySlug(slug);
        const all = await getAllProducts();
        setProduct(found);
        setAllProducts(all);
        if (found && found.images && found.images.length > 0) {
          setSelectedImage(found.images[0]);
        }
      } catch (e) {
        console.error('Error loading product detail', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-6 aspect-square bg-[#F6F1EC] rounded-2xl" />
            <div className="lg:col-span-6 space-y-6">
              <div className="h-8 bg-[#F6F1EC] rounded w-3/4" />
              <div className="h-6 bg-[#F6F1EC] rounded w-1/4" />
              <div className="h-24 bg-[#F6F1EC] rounded" />
              <div className="h-12 bg-[#F6F1EC] rounded w-1/2" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-24 text-center">
          <h2 className="font-serif-luxury text-3xl font-bold text-[#231B15] mb-4">
            Product Not Found
          </h2>
          <p className="text-sm text-[#786C63] mb-8">
            The candle you requested could not be located in our current catalogue. It may have been retired or moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#231B15] text-[#FCFBF7] text-xs font-semibold tracking-wider uppercase"
          >
            <ChevronLeft className="w-4 h-4" />
            Return to Catalogue
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const amazonUrl = product.marketplaces?.amazon?.trim();
  const flipkartUrl = product.marketplaces?.flipkart?.trim();
  const meeshoUrl = product.marketplaces?.meesho?.trim();

  const hasAnyMarketplace = Boolean(amazonUrl || flipkartUrl || meeshoUrl);

  const handleMarketplaceRedirect = async (
    marketplace: 'amazon' | 'flipkart' | 'meesho',
    url: string
  ) => {
    await trackMarketplaceClick(product.id, product.name, marketplace, 'product_details');
    setClickNotice(`Redirecting to official ${marketplace.toUpperCase()} listing...`);
    const targetUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && p.active && (p.category === product.category || p.fragrance === product.fragrance))
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <nav className="flex items-center gap-2 text-xs text-[#786C63]">
            <Link href="/" className="hover:text-[#231B15] flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Catalogue</span>
            </Link>
            <span>/</span>
            <span className="text-[#9A7513] font-medium">{product.category}</span>
            <span>/</span>
            <span className="text-[#231B15] font-semibold truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>
        </div>

        {/* Product Details Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left: Product Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#F6F1EC] border border-[#EAE3D9] shadow-xl">
                <Image
                  src={selectedImage || product.images[0] || '/images/logo.jpeg'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="object-cover"
                />

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-md ${
                    wishlisted
                      ? 'bg-rose-50 text-rose-600 scale-105'
                      : 'bg-white/80 text-[#786C63] hover:text-rose-600 hover:bg-white'
                  }`}
                  aria-label={wishlisted ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-600' : ''}`} />
                </button>

                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#EAE3D9] text-[11px] font-semibold text-[#231B15] flex items-center gap-1.5 shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-[#C59B27]" />
                  <span>100% Botanical Soy Wax</span>
                </div>
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImage === img
                          ? 'border-[#C59B27] shadow-md scale-102'
                          : 'border-[#EAE3D9] hover:border-[#786C63] opacity-80'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${i + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Specification & Marketplace Purchasing Options */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-[#9A7513] bg-[#F4E8C1]/70 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                {product.inStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    In Stock & Handcrafted
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    Batch Sold Out
                  </span>
                )}
              </div>

              <div>
                <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#231B15] leading-tight">
                  {product.name}
                </h1>
                <p className="text-sm text-[#786C63] mt-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F6F1EC] border border-[#EAE3D9] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#786C63] font-medium block">
                    Marketplace Selling Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-bold text-[#231B15]">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-[#786C63] line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-[11px] text-[#786C63]">
                  <span>Inclusive of all taxes</span>
                  <span className="block font-medium text-[#231B15]">Free Marketplace Delivery</span>
                </div>
              </div>

              {/* Marketplace Purchasing Options */}
              <div className="p-6 rounded-2xl bg-white border border-[#EAE3D9] shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-luxury text-lg font-bold text-[#231B15] flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#C59B27]" />
                    Purchase on Verified Marketplaces
                  </h3>
                  <span className="text-[11px] text-[#786C63] font-medium">Official Brand Listings</span>
                </div>

                <p className="text-xs text-[#786C63] leading-relaxed">
                  Select your preferred shopping marketplace below to complete checkout securely with your saved address and payment method.
                </p>

                {clickNotice && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2 animate-in fade-in">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{clickNotice}</span>
                  </div>
                )}

                <div className="space-y-3 pt-1">
                  {amazonUrl && (
                    <button
                      type="button"
                      onClick={() => handleMarketplaceRedirect('amazon', amazonUrl)}
                      className="w-full py-3.5 px-5 rounded-xl bg-[#231B15] hover:bg-[#1A1410] text-white flex items-center justify-between font-semibold text-sm transition-all shadow-sm hover:shadow-md group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-[#FF9900]" />
                        <span>Buy on Amazon</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#DFBE58] group-hover:translate-x-1 transition-transform">
                        <span>Prime Delivery</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </button>
                  )}

                  {flipkartUrl && (
                    <button
                      type="button"
                      onClick={() => handleMarketplaceRedirect('flipkart', flipkartUrl)}
                      className="w-full py-3.5 px-5 rounded-xl bg-[#2874F0] hover:bg-[#1F5EC6] text-white flex items-center justify-between font-semibold text-sm transition-all shadow-sm hover:shadow-md group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-[#FFE500]" />
                        <span>Buy on Flipkart</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-white/90 group-hover:translate-x-1 transition-transform">
                        <span>Flipkart Assured</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </button>
                  )}

                  {meeshoUrl && (
                    <button
                      type="button"
                      onClick={() => handleMarketplaceRedirect('meesho', meeshoUrl)}
                      className="w-full py-3.5 px-5 rounded-xl bg-[#8A2464] hover:bg-[#721A51] text-white flex items-center justify-between font-semibold text-sm transition-all shadow-sm hover:shadow-md group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-[#FF70A6]" />
                        <span>Buy on Meesho</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-white/90 group-hover:translate-x-1 transition-transform">
                        <span>Direct Craft Price</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </button>
                  )}

                  {!hasAnyMarketplace && (
                    <div className="p-4 bg-[#F6F1EC] rounded-xl text-center text-xs text-[#786C63]">
                      <p className="font-semibold text-[#231B15]">New Batch in Preparation</p>
                      <p className="mt-1">
                        Marketplace listings for this artisan batch will be active shortly. Check back soon or contact support for direct batch reservations.
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-[#786C63] flex items-center gap-1.5 pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Official marketplace buyer protection & verified return policies apply.</span>
                </div>
              </div>

              {/* Fragrance Architecture */}
              <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#EAE3D9] space-y-4">
                <h3 className="font-serif-luxury text-lg font-bold text-[#231B15] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#C59B27]" />
                  Fragrance Architecture
                </h3>
                <p className="text-xs font-semibold text-[#9A7513]">
                  Signature Aroma: {product.fragrance}
                </p>

                {product.fragranceNotes && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-[#EAE3D9]">
                      <span className="text-[10px] uppercase font-bold text-[#786C63] tracking-wider block">
                        Top Notes
                      </span>
                      <p className="font-semibold text-[#231B15] mt-1">
                        {product.fragranceNotes.top || 'Citrus & Sweet Spices'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#EAE3D9]">
                      <span className="text-[10px] uppercase font-bold text-[#786C63] tracking-wider block">
                        Heart / Middle
                      </span>
                      <p className="font-semibold text-[#231B15] mt-1">
                        {product.fragranceNotes.middle || 'Floral Blooms & Woods'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#EAE3D9]">
                      <span className="text-[10px] uppercase font-bold text-[#786C63] tracking-wider block">
                        Base Notes
                      </span>
                      <p className="font-semibold text-[#231B15] mt-1">
                        {product.fragranceNotes.base || 'Warm Amber & Vanilla'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#EAE3D9]">
                  <span className="text-[10px] text-[#786C63] block">Burn Time</span>
                  <span className="font-bold text-[#231B15] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#C59B27]" />
                    {product.burnTimeHours || 45} Hours
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#EAE3D9]">
                  <span className="text-[10px] text-[#786C63] block">Wax Composition</span>
                  <span className="font-bold text-[#231B15] truncate block mt-0.5" title={product.waxType}>
                    {product.waxType || '100% Soy Wax'}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#EAE3D9]">
                  <span className="text-[10px] text-[#786C63] block">Approx Weight</span>
                  <span className="font-bold text-[#231B15] block mt-0.5">
                    {product.weightGrams || 220} Grams
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#EAE3D9]">
                  <span className="text-[10px] text-[#786C63] block">Dimensions</span>
                  <span className="font-bold text-[#231B15] block mt-0.5">
                    {product.dimensions || 'Standard Artisan'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="bg-[#F6F1EC] py-16 border-t border-[#EAE3D9]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#9A7513]">
                    COMPLEMENTARY PIECES
                  </span>
                  <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#231B15]">
                    You May Also Love
                  </h2>
                </div>
                <Link
                  href="/"
                  className="text-xs font-semibold text-[#231B15] hover:text-[#9A7513] transition-colors"
                >
                  View All Candles →
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
