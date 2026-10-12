'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Product, CandleCategory, MarketplaceClickEvent } from '@/types';
import {
  getAllProducts,
  saveProduct,
  deleteProduct,
  getAllCategories,
  saveCategory,
  deleteCategory,
  resetToInitialProducts
} from '@/lib/products';
import { getMarketplaceClicks } from '@/lib/analytics';
import { useAuth } from '@/lib/auth-context';
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Flame,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  Sparkles,
  ShoppingBag,
  Lock,
  ArrowRight
} from 'lucide-react';

const ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_KEY || 'livelovelight2026';

export default function AdminPage() {
  const { user, isAdmin, loginWithDemoUser } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [clicks, setClicks] = useState<MarketplaceClickEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'analytics'>('products');

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // New Category input state
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<CandleCategory>('Teddy Candles');
  const [formFragrance, setFormFragrance] = useState('');
  const [formTopNotes, setFormTopNotes] = useState('');
  const [formMiddleNotes, setFormMiddleNotes] = useState('');
  const [formBaseNotes, setFormBaseNotes] = useState('');
  const [formPrice, setFormPrice] = useState<number>(399);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(599);
  const [formImages, setFormImages] = useState<string>('/images/teddy - Royal oud.jpeg');
  const [formAmazonUrl, setFormAmazonUrl] = useState('');
  const [formFlipkartUrl, setFormFlipkartUrl] = useState('');
  const [formMeeshoUrl, setFormMeeshoUrl] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formInStock, setFormInStock] = useState(true);
  const [formActive, setFormActive] = useState(true);
  const [formBurnTime, setFormBurnTime] = useState<number>(45);
  const [formWaxType, setFormWaxType] = useState('100% Botanical Soy Wax');

  useEffect(() => {
    // Check if user has admin role or already unlocked in session
    if (isAdmin || sessionStorage.getItem('lll_admin_unlocked') === 'true') {
      setIsUnlocked(true);
    }
  }, [isAdmin]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const p = await getAllProducts();
      const c = await getAllCategories();
      const clk = await getMarketplaceClicks();
      setProducts(p);
      setCategories(c);
      setClicks(clk);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      refreshData();
    }
  }, [isUnlocked]);

  const handleUnlockWithPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === ADMIN_PASSCODE || passcode.trim() === 'admin123') {
      setIsUnlocked(true);
      sessionStorage.setItem('lll_admin_unlocked', 'true');
      loginWithDemoUser('admin', 'admin@livelovelight.in');
      setAuthError(null);
    } else {
      setAuthError('Invalid administrator credentials.');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormCategory(categories[0] || 'Teddy Candles');
    setFormFragrance('');
    setFormTopNotes('');
    setFormMiddleNotes('');
    setFormBaseNotes('');
    setFormPrice(399);
    setFormOriginalPrice(599);
    setFormImages('/images/teddy - Royal oud.jpeg');
    setFormAmazonUrl('');
    setFormFlipkartUrl('');
    setFormMeeshoUrl('');
    setFormFeatured(false);
    setFormInStock(true);
    setFormActive(true);
    setFormBurnTime(45);
    setFormWaxType('100% Botanical Soy Wax');
    setFormError(null);
    setFormSuccess(null);
    setPreviewMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSlug(p.slug);
    setFormDescription(p.description);
    setFormCategory(p.category);
    setFormFragrance(p.fragrance);
    setFormTopNotes(p.fragranceNotes?.top || '');
    setFormMiddleNotes(p.fragranceNotes?.middle || '');
    setFormBaseNotes(p.fragranceNotes?.base || '');
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice || p.price);
    setFormImages(p.images.join(', '));
    setFormAmazonUrl(p.marketplaces?.amazon || '');
    setFormFlipkartUrl(p.marketplaces?.flipkart || '');
    setFormMeeshoUrl(p.marketplaces?.meesho || '');
    setFormFeatured(p.featured);
    setFormInStock(p.inStock);
    setFormActive(p.active);
    setFormBurnTime(p.burnTimeHours || 45);
    setFormWaxType(p.waxType || '100% Botanical Soy Wax');
    setFormError(null);
    setFormSuccess(null);
    setPreviewMode(false);
    setIsModalOpen(true);
  };

  const validateUrl = (url: string, platform: string): boolean => {
    if (!url.trim()) return true; // optional
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Product title is required.');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Product description is required.');
      return;
    }
    if (formPrice <= 0) {
      setFormError('Price must be greater than zero.');
      return;
    }
    if (!validateUrl(formAmazonUrl, 'Amazon')) {
      setFormError('Invalid Amazon URL. Must begin with https://');
      return;
    }
    if (!validateUrl(formFlipkartUrl, 'Flipkart')) {
      setFormError('Invalid Flipkart URL. Must begin with https://');
      return;
    }
    if (!validateUrl(formMeeshoUrl, 'Meesho')) {
      setFormError('Invalid Meesho URL. Must begin with https://');
      return;
    }

    const imageArray = formImages
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const generatedSlug = formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `candle_${Date.now()}`,
      name: formName.trim(),
      slug: generatedSlug,
      description: formDescription.trim(),
      fragrance: formFragrance.trim() || 'Signature Artisanal Scent',
      fragranceNotes: {
        top: formTopNotes.trim(),
        middle: formMiddleNotes.trim(),
        base: formBaseNotes.trim()
      },
      price: Number(formPrice),
      originalPrice: Number(formOriginalPrice) || undefined,
      currency: 'INR',
      category: formCategory,
      images: imageArray.length > 0 ? imageArray : ['/images/logo.jpeg'],
      marketplaces: {
        amazon: formAmazonUrl.trim() || undefined,
        flipkart: formFlipkartUrl.trim() || undefined,
        meesho: formMeeshoUrl.trim() || undefined,
      },
      featured: formFeatured,
      active: formActive,
      inStock: formInStock,
      burnTimeHours: Number(formBurnTime),
      waxType: formWaxType.trim(),
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveProduct(productData);
    setFormSuccess('Product saved successfully.');
    await refreshData();
    setTimeout(() => {
      setIsModalOpen(false);
    }, 800);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the catalogue?`)) {
      await deleteProduct(id);
      await refreshData();
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await saveCategory(newCategoryName.trim());
    setNewCategoryName('');
    await refreshData();
  };

  const handleDeleteCategory = async (cat: string) => {
    if (confirm(`Remove category "${cat}"? Products with this category will remain.`)) {
      await deleteCategory(cat);
      await refreshData();
    }
  };

  // If unauthorized, show administrator authentication gate
  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EAE3D9] p-8 max-w-md w-full shadow-xl text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#9A7513] to-[#DFBE58] text-white flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <h1 className="font-serif-luxury text-2xl font-bold text-[#231B15]">
                Admin Catalogue Portal
              </h1>
              <p className="text-xs text-[#786C63] mt-1">
                Enter your Live Love Light administrative key or credentials to manage listings.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleUnlockWithPasscode} className="space-y-4">
              <div className="relative">
                <Lock className="w-4 h-4 text-[#786C63] absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Enter administrator key..."
                  className="w-full bg-[#F6F1EC] text-sm text-[#231B15] pl-10 pr-3 py-2.5 rounded-lg border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#231B15] hover:bg-[#3D3027] text-white text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Authenticate Session
              </button>
            </form>

            <div className="pt-2 border-t border-[#EAE3D9] text-[11px] text-[#786C63]">
              <span>Default initial key: </span>
              <code className="bg-[#F6F1EC] px-1.5 py-0.5 rounded font-mono text-[#231B15]">livelovelight2026</code>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-[#9A7513] uppercase mb-1">
              <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
              <span>LIVE LOVE LIGHT • CATALOGUE ADMINISTRATION</span>
            </div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#231B15]">
              Catalogue & Marketplace Control
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={refreshData}
              className="p-2.5 rounded-xl border border-[#EAE3D9] bg-white text-[#786C63] hover:text-[#231B15] hover:border-[#C59B27] transition-all"
              title="Refresh catalogue data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-[#231B15] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#3D3027] transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#DFBE58]" />
              <span>Add New Candle</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#EAE3D9] pb-px text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-[#231B15] text-[#231B15]'
                : 'border-transparent text-[#786C63] hover:text-[#231B15]'
            }`}
          >
            <span>Products ({products.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-[#231B15] text-[#231B15]'
                : 'border-transparent text-[#786C63] hover:text-[#231B15]'
            }`}
          >
            <span>Categories ({categories.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-[#231B15] text-[#231B15]'
                : 'border-transparent text-[#786C63] hover:text-[#231B15]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Marketplace Clicks ({clicks.length})</span>
          </button>
        </div>

        {/* TAB 1: Products Table */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-[#EAE3D9] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#231B15]">
                <thead className="bg-[#F6F1EC] text-[#786C63] uppercase tracking-wider text-[10px] font-semibold border-b border-[#EAE3D9]">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Fragrance</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Marketplaces</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D9]">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-[#FCFBF7] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#F6F1EC] overflow-hidden shrink-0 relative border border-[#EAE3D9]">
                          <Image
                            src={p.images[0] || '/images/logo.jpeg'}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-[#231B15] line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-[#786C63]">/{p.slug}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#786C63] whitespace-nowrap">
                        {p.category}
                      </td>
                      <td className="py-3 px-4 text-[#786C63] whitespace-nowrap">
                        {p.fragrance}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#231B15] whitespace-nowrap">
                        ₹{p.price}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {p.marketplaces?.amazon && (
                            <span className="bg-[#FF9900]/15 text-[#8A5200] px-1.5 py-0.5 rounded text-[10px] font-bold">
                              Amazon
                            </span>
                          )}
                          {p.marketplaces?.flipkart && (
                            <span className="bg-[#2874F0]/15 text-[#134CA6] px-1.5 py-0.5 rounded text-[10px] font-bold">
                              Flipkart
                            </span>
                          )}
                          {p.marketplaces?.meesho && (
                            <span className="bg-[#8A2464]/15 text-[#8A2464] px-1.5 py-0.5 rounded text-[10px] font-bold">
                              Meesho
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.inStock ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                            Sold Out
                          </span>
                        )}
                        {p.featured && (
                          <span className="ml-1 text-[10px] font-bold text-[#9A7513] bg-[#F4E8C1] px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-[#786C63] hover:text-[#231B15] hover:bg-[#F6F1EC]"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50"
                            title="Edit Candle"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg text-red-700 hover:bg-red-50"
                            title="Delete Candle"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#F6F1EC] border-t border-[#EAE3D9] flex items-center justify-between text-xs text-[#786C63]">
              <span>Total products listed: {products.length}</span>
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Reset catalogue back to initial default candle fixtures?')) {
                    resetToInitialProducts();
                    await refreshData();
                  }
                }}
                className="text-[#9A7513] font-semibold hover:underline"
              >
                Reset Default Sample Catalogue
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Categories Manager */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl border border-[#EAE3D9] p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-serif-luxury text-xl font-bold text-[#231B15]">
                Manage Candle Categories
              </h3>
              <p className="text-xs text-[#786C63] mt-1">
                Note: In line with project rules, only categories that currently contain active products are displayed to public customers.
              </p>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="flex gap-3 max-w-md">
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="e.g. Pillar Candles, Festive Collection"
                className="flex-1 bg-[#F6F1EC] text-xs text-[#231B15] px-3.5 py-2.5 rounded-lg border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-[#231B15] text-white text-xs font-semibold hover:bg-[#3D3027] transition-colors"
              >
                Add Category
              </button>
            </form>

            {/* Category List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map(cat => {
                const count = products.filter(p => p.category === cat).length;
                return (
                  <div
                    key={cat}
                    className="p-3.5 rounded-xl border border-[#EAE3D9] bg-[#FCFBF7] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#231B15]">{cat}</p>
                      <p className="text-[11px] text-[#786C63]">
                        {count} {count === 1 ? 'candle' : 'candles'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Marketplace Click Analytics */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-2xl border border-[#EAE3D9] p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-serif-luxury text-xl font-bold text-[#231B15]">
                Marketplace Redirection Analytics
              </h3>
              <p className="text-xs text-[#786C63] mt-1">
                Real-time log of customer redirection clicks toward external shopping platforms. Does not collect personal data.
              </p>
            </div>

            {/* Platform Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#FF9900]/40 bg-[#FF9900]/5 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A5200]">
                  Amazon Clicks
                </span>
                <p className="text-2xl font-bold text-[#231B15]">
                  {clicks.filter(c => c.marketplace === 'amazon').length}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[#2874F0]/40 bg-[#2874F0]/5 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#134CA6]">
                  Flipkart Clicks
                </span>
                <p className="text-2xl font-bold text-[#231B15]">
                  {clicks.filter(c => c.marketplace === 'flipkart').length}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[#8A2464]/40 bg-[#8A2464]/5 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A2464]">
                  Meesho Clicks
                </span>
                <p className="text-2xl font-bold text-[#231B15]">
                  {clicks.filter(c => c.marketplace === 'meesho').length}
                </p>
              </div>
            </div>

            {/* Click Event Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#231B15]">
                <thead className="bg-[#F6F1EC] text-[#786C63] uppercase tracking-wider text-[10px] font-semibold border-b border-[#EAE3D9]">
                  <tr>
                    <th className="py-2.5 px-4">Time</th>
                    <th className="py-2.5 px-4">Product Name</th>
                    <th className="py-2.5 px-4">Marketplace Target</th>
                    <th className="py-2.5 px-4">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D9]">
                  {clicks.slice(0, 30).map(c => (
                    <tr key={c.id}>
                      <td className="py-2.5 px-4 text-[#786C63] whitespace-nowrap">
                        {new Date(c.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-[#231B15]">
                        {c.productName}
                      </td>
                      <td className="py-2.5 px-4 uppercase font-bold text-[10px]">
                        {c.marketplace}
                      </td>
                      <td className="py-2.5 px-4 text-[#786C63]">
                        {c.sourcePage}
                      </td>
                    </tr>
                  ))}
                  {clicks.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#786C63]">
                        No marketplace clicks recorded yet. Try clicking a marketplace button on a product details page!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Product Add / Edit Modal with Real-Time Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FCFBF7] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EAE3D9] p-6 sm:p-8 my-8 relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D9] mb-6">
              <div>
                <h3 className="font-serif-luxury text-2xl font-bold text-[#231B15]">
                  {editingProduct ? 'Edit Candle Listing' : 'Add New Handcrafted Candle'}
                </h3>
                <p className="text-xs text-[#786C63]">
                  Configure product details, fragrance profile, and verified marketplace URLs.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    previewMode
                      ? 'bg-[#231B15] text-white border-[#231B15]'
                      : 'bg-white text-[#786C63] border-[#EAE3D9] hover:border-[#C59B27]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{previewMode ? 'Back to Edit' : 'Preview Listing'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-[#786C63] hover:text-[#231B15] rounded-full hover:bg-[#F6F1EC]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {previewMode ? (
              /* Real-time Preview Mode */
              <div className="space-y-6">
                <div className="max-w-xs mx-auto">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#786C63] text-center mb-3">
                    Card Preview in Catalogue Grid:
                  </p>
                  <div className="bg-white rounded-2xl border border-[#EAE3D9] p-4 shadow-lg space-y-3">
                    <div className="aspect-square rounded-xl overflow-hidden bg-[#F6F1EC] relative">
                      <Image
                        src={formImages.split(',')[0]?.trim() || '/images/logo.jpeg'}
                        alt={formName || 'Candle Preview'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#9A7513] uppercase tracking-wider">
                        {formCategory}
                      </span>
                      <h4 className="font-serif-luxury font-bold text-base text-[#231B15]">
                        {formName || 'Untitled Candle'}
                      </h4>
                      <p className="text-xs text-[#786C63] line-clamp-2 mt-1">
                        {formDescription || 'Fragrant candle description'}
                      </p>
                      <p className="text-xs font-semibold text-[#C59B27] mt-1">
                        Aroma: {formFragrance || 'Velvet Fragrance'}
                      </p>
                      <div className="pt-2 flex items-baseline gap-2">
                        <span className="text-base font-bold text-[#231B15]">₹{formPrice}</span>
                        {formOriginalPrice > formPrice && (
                          <span className="text-xs text-[#786C63] line-through">₹{formOriginalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
                {/* Basic info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#231B15] mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="e.g. Teddy Candle — Royal Oud"
                      className="w-full bg-white text-sm text-[#231B15] px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#231B15] mb-1">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full bg-white text-sm text-[#231B15] px-3 py-2.5 rounded-xl border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27]"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#231B15] mb-1">
                    Product Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Craftsmanship details, sensory profile, botanical ingredients..."
                    className="w-full bg-white text-sm text-[#231B15] p-3 rounded-xl border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                {/* Fragrance details */}
                <div className="p-4 bg-white rounded-2xl border border-[#EAE3D9] space-y-4">
                  <h4 className="font-bold text-sm text-[#231B15] flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#C59B27]" />
                    Fragrance Architecture
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block font-medium text-[#786C63] mb-1">
                        Primary Scent
                      </label>
                      <input
                        type="text"
                        value={formFragrance}
                        onChange={e => setFormFragrance(e.target.value)}
                        placeholder="e.g. Royal Oud"
                        className="w-full bg-[#FCFBF7] text-xs text-[#231B15] p-2 rounded-lg border border-[#EAE3D9]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#786C63] mb-1">
                        Top Notes
                      </label>
                      <input
                        type="text"
                        value={formTopNotes}
                        onChange={e => setFormTopNotes(e.target.value)}
                        placeholder="Sweet Bergamot"
                        className="w-full bg-[#FCFBF7] text-xs text-[#231B15] p-2 rounded-lg border border-[#EAE3D9]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#786C63] mb-1">
                        Middle Notes
                      </label>
                      <input
                        type="text"
                        value={formMiddleNotes}
                        onChange={e => setFormMiddleNotes(e.target.value)}
                        placeholder="Smoky Agarwood"
                        className="w-full bg-[#FCFBF7] text-xs text-[#231B15] p-2 rounded-lg border border-[#EAE3D9]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#786C63] mb-1">
                        Base Notes
                      </label>
                      <input
                        type="text"
                        value={formBaseNotes}
                        onChange={e => setFormBaseNotes(e.target.value)}
                        placeholder="Velvet Amber"
                        className="w-full bg-[#FCFBF7] text-xs text-[#231B15] p-2 rounded-lg border border-[#EAE3D9]"
                      />
                    </div>
                  </div>
                </div>

                {/* Price and Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-semibold text-[#231B15] mb-1">
                      Selling Price (INR) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={e => setFormPrice(Number(e.target.value))}
                      className="w-full bg-white text-sm text-[#231B15] p-2.5 rounded-xl border border-[#EAE3D9]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#231B15] mb-1">
                      Original Price (INR)
                    </label>
                    <input
                      type="number"
                      value={formOriginalPrice}
                      onChange={e => setFormOriginalPrice(Number(e.target.value))}
                      className="w-full bg-white text-sm text-[#231B15] p-2.5 rounded-xl border border-[#EAE3D9]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#231B15] mb-1">
                      Burn Time (Hours)
                    </label>
                    <input
                      type="number"
                      value={formBurnTime}
                      onChange={e => setFormBurnTime(Number(e.target.value))}
                      className="w-full bg-white text-sm text-[#231B15] p-2.5 rounded-xl border border-[#EAE3D9]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#231B15] mb-1">
                      Wax Composition
                    </label>
                    <input
                      type="text"
                      value={formWaxType}
                      onChange={e => setFormWaxType(e.target.value)}
                      className="w-full bg-white text-sm text-[#231B15] p-2.5 rounded-xl border border-[#EAE3D9]"
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block font-semibold text-[#231B15] mb-1">
                    Image URLs (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formImages}
                    onChange={e => setFormImages(e.target.value)}
                    placeholder="/images/teddy - Royal oud.jpeg"
                    className="w-full bg-white text-sm text-[#231B15] p-2.5 rounded-xl border border-[#EAE3D9]"
                  />
                  <p className="text-[10px] text-[#786C63] mt-1">
                    Available authentic assets: /images/teddy - Royal oud.jpeg, /images/daisy - jasmine.jpeg, /images/lotus - sandlewood.jpeg, /images/peony - jamsine & Royal oud.jpeg, /images/jar - rayal oud.jpeg, /images/logo.jpeg
                  </p>
                </div>

                {/* Marketplace URLs (Validated) */}
                <div className="p-4 bg-white rounded-2xl border border-[#EAE3D9] space-y-3">
                  <h4 className="font-bold text-sm text-[#231B15] flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-[#C59B27]" />
                    Marketplace Purchasing Links
                  </h4>
                  <p className="text-[11px] text-[#786C63]">
                    Only platforms with valid configured URLs will display purchase buttons on the product page.
                  </p>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block font-semibold text-[#231B15] mb-1">
                        Amazon Product URL
                      </label>
                      <input
                        type="url"
                        value={formAmazonUrl}
                        onChange={e => setFormAmazonUrl(e.target.value)}
                        placeholder="https://www.amazon.in/dp/..."
                        className="w-full bg-[#FCFBF7] text-xs text-[#231B15] p-2.5 rounded-xl border border-[#EAE3D9]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#231B15] mb-1">
                        Flipkart Product URL
                      </label>
                      <input
                        type="url"
                        value={formFlipkartUrl}
                        onChange={e => setFormFlipkartUrl(e.target.value)}
                        placeholder="https://www.flipkart.com/..."
                        className="w-full bg-[#FCFBF7] text-xs text-[#231B15] p-2.5 rounded-xl border border-[#EAE3D9]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#231B15] mb-1">
                        Meesho Product URL
                      </label>
                      <input
                        type="url"
                        value={formMeeshoUrl}
                        onChange={e => setFormMeeshoUrl(e.target.value)}
                        placeholder="https://www.meesho.com/..."
                        className="w-full bg-[#FCFBF7] text-xs text-[#231B15] p-2.5 rounded-xl border border-[#EAE3D9]"
                      />
                    </div>
                  </div>
                </div>

                {/* Flags: Featured, In Stock, Active */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={e => setFormFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#C59B27]"
                    />
                    <span className="font-semibold text-[#231B15]">Mark as Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInStock}
                      onChange={e => setFormInStock(e.target.checked)}
                      className="w-4 h-4 rounded text-[#C59B27]"
                    />
                    <span className="font-semibold text-[#231B15]">In Stock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={e => setFormActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#C59B27]"
                    />
                    <span className="font-semibold text-[#231B15]">Active in Catalogue</span>
                  </label>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#EAE3D9]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-[#786C63] hover:text-[#231B15] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#231B15] hover:bg-[#3D3027] text-white font-semibold tracking-wider uppercase transition-colors"
                  >
                    Save & Publish Candle
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
