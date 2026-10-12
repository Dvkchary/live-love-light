import { Suspense } from 'react';
import type { Metadata } from 'next';
import { INITIAL_PRODUCTS } from '@/data/initialProducts';
import ProductDetailClient from '@/components/ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return INITIAL_PRODUCTS.map(p => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = INITIAL_PRODUCTS.find(p => p.slug === slug || p.id === slug);
  if (!product) {
    return {
      title: 'Candle Not Found — Live Love Light',
    };
  }
  return {
    title: `${product.name} — Handcrafted Candles | Live Love Light`,
    description: `${product.description} Scent: ${product.fragrance}. ₹${product.price}. Shop on Amazon, Flipkart, & Meesho.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFBF7] animate-pulse" />}>
      <ProductDetailClient slug={slug} />
    </Suspense>
  );
}
