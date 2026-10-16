'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/lib/auth-context';
import { getAllProducts } from '@/lib/products';
import { Product, Order } from '@/types';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import {
  User,
  Heart,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Package
} from 'lucide-react';
import LoginModal from '@/components/LoginModal';

export default function AccountPage() {
  const { user, logout, openSignIn } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    getAllProducts().then(setAllProducts);
  }, []);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.uid)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setOrders(data.map((o: Record<string, unknown>) => ({
            id: String(o.id || ''),
            customerId: String(o.customer_id || ''),
            orderStatus: (o.order_status as Order['orderStatus']) || 'pending',
            subtotal: Number(o.subtotal || 0),
            shippingAmount: Number(o.shipping_amount || 0),
            totalAmount: Number(o.total_amount || 0),
            shippingAddress: (o.shipping_address as Record<string, string>) || {},
            paymentStatus: (o.payment_status as Order['paymentStatus']) || 'pending',
            createdAt: String(o.created_at || ''),
            updatedAt: String(o.updated_at || ''),
          })));
        }
      });
  }, [user]);

  const savedIds: string[] = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('lll_wishlist_v1') || '[]')
    : [];

  const savedProducts = allProducts.filter(p => savedIds.includes(p.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {user ? (
          <>
            {/* Account Profile Header */}
            <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#9A7513] to-[#DFBE58] text-white flex items-center justify-center font-bold text-2xl uppercase shadow-md">
                  {user.displayName?.[0] || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#231B15]">
                      {user.displayName}
                    </h1>
                    {user.role === 'admin' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7513] bg-[#F4E8C1] px-2 py-0.5 rounded">
                        Administrator
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#786C63] mt-0.5">
                    {user.email || user.phoneNumber || 'Authenticated Collector'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 rounded-xl bg-[#F4E8C1]/80 text-[#9A7513] text-xs font-semibold hover:bg-[#F4E8C1] transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 rounded-xl bg-[#F6F1EC] text-[#231B15] text-xs font-semibold hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-1.5 border border-[#EAE3D9]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Saved Wishlist Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif-luxury text-2xl font-bold text-[#231B15] flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                    My Saved Candles ({savedProducts.length})
                  </h2>
                  <p className="text-xs text-[#786C63]">
                    Your curated fragrance wishlist ready for marketplace purchase.
                  </p>
                </div>
                <Link
                  href="/#collection"
                  className="text-xs font-semibold text-[#9A7513] hover:underline"
                >
                  Explore More Candles →
                </Link>
              </div>

              {savedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {savedProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-[#EAE3D9] p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#F6F1EC] text-[#786C63] flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6 text-[#C59B27]" />
                  </div>
                  <h3 className="font-serif-luxury text-xl font-bold text-[#231B15]">
                    Your Wishlist is Empty
                  </h3>
                  <p className="text-xs text-[#786C63] max-w-sm mx-auto">
                    Tap the heart icon on any candle card while exploring to bookmark your favorite scents and sculpted pieces here.
                  </p>
                  <Link
                    href="/#collection"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#231B15] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#3D3027] transition-colors"
                  >
                    <span>Browse Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#DFBE58]" />
                  </Link>
                </div>
              )}
            </div>

            {/* Order History Section (Supabase Orders) */}
            {orders.length > 0 && (
              <div className="pt-2">
                <h2 className="font-serif-luxury text-2xl font-bold text-[#231B15] flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-[#9A7513]" />
                  Order History ({orders.length})
                </h2>
                <div className="bg-white rounded-3xl border border-[#EAE3D9] overflow-hidden shadow-xs divide-y divide-[#EAE3D9]">
                  {orders.map((o) => (
                    <div key={o.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#231B15]">Order #{o.id.slice(0, 8)}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {o.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-[#786C63] mt-1">
                          Placed on {new Date(o.createdAt).toLocaleDateString()} • {o.paymentStatus.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-base text-[#231B15]">₹{o.totalAmount}</span>
                        <span className="text-[11px] text-[#786C63] block">Incl. Taxes & Shipping</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Unauthenticated state */
          <div className="bg-white rounded-3xl border border-[#EAE3D9] p-12 max-w-md mx-auto text-center space-y-6 shadow-md">
            <div className="w-16 h-16 rounded-full bg-[#F6F1EC] text-[#9A7513] flex items-center justify-center mx-auto">
              <User className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-serif-luxury text-2xl font-bold text-[#231B15]">
                Account Access
              </h2>
              <p className="text-xs text-[#786C63] mt-1">
                Please sign in with Clerk authentication to view saved candles and account details.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
                    openSignIn();
                  } else {
                    setIsLoginOpen(true);
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#231B15] hover:bg-[#3D3027] text-white text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Sign In to Your Account
              </button>
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F6F1EC] hover:bg-[#EBE3D7] text-[#231B15] text-xs font-medium border border-[#EAE3D9] transition-colors"
              >
                Preview / Demo Mode
              </button>
            </div>
          </div>
        )}
      </main>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Footer />
    </div>
  );
}
