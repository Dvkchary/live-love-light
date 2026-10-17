'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Product, CandleCategory, MarketplaceClickEvent, UserRole, AdminUserSummary, Order } from '@/types';
import {
  saveProduct,
  deleteProduct,
  getAllCategories,
  saveCategory,
  deleteCategory,
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
  ShoppingBag,
  Lock,
  Users
} from 'lucide-react';

type AdminTab = 'products' | 'categories' | 'analytics' | 'roles' | 'orders' | 'settings';

export default function AdminPage({ initialTab = 'products' }: { initialTab?: AdminTab }) {
  const { user, isAdmin, isSuperAdmin, isProductManager } = useAuth();
  const [serverRole, setServerRole] = useState<UserRole | null>(null);
  const isUnlocked = isAdmin || serverRole === 'admin' || serverRole === 'product_manager' || serverRole === 'super_admin';
  const effectiveRole: UserRole =
    serverRole ||
    (isSuperAdmin ? 'super_admin' : isProductManager ? 'admin' : (user?.role as UserRole) || 'customer');
  const isSuperAdminRole = effectiveRole === 'super_admin';
  const isProductManagerRole = effectiveRole === 'admin' || effectiveRole === 'product_manager';
  const isAdminRole = isSuperAdminRole || isProductManagerRole;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [clicks, setClicks] = useState<MarketplaceClickEvent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [adminCanDeleteProducts, setAdminCanDeleteProducts] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [productQuery, setProductQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productSort, setProductSort] = useState<'name' | 'price-low' | 'price-high'>('name');
  const visibleProducts = products
    .filter(product => {
      const query = productQuery.trim().toLowerCase();
      const matchesQuery = !query || [product.name, product.description, product.fragrance, product.category]
        .some(value => value.toLowerCase().includes(query));
      return matchesQuery && (productCategoryFilter === 'all' || product.category === productCategoryFilter);
    })
    .sort((a, b) => productSort === 'price-low'
      ? a.price - b.price
      : productSort === 'price-high'
      ? b.price - a.price
      : a.name.localeCompare(b.name));

  // Admin users state (Super Admin only)
  const [adminUsers, setAdminUsers] = useState<AdminUserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleActionMessage, setRoleActionMessage] = useState<string | null>(null);
  const [roleActionError, setRoleActionError] = useState<string | null>(null);

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
  const [formStockQuantity, setFormStockQuantity] = useState(50);
  const [formBurnTime, setFormBurnTime] = useState<number>(45);
  const [formWaxType, setFormWaxType] = useState('100% Botanical Soy Wax');

  const refreshData = async () => {
    try {
      const response = await fetch('/api/admin/products', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success || !Array.isArray(data.products)) {
        throw new Error(data.error || 'Unable to load products.');
      }
      const loadedProducts = data.products as Product[];
      setProducts(loadedProducts);
      if (isAdminRole) {
        const loadedCategories = await getAllCategories();
        setCategories(loadedCategories);
      }
      if (isSuperAdminRole) {
        const loadedClicks = await getMarketplaceClicks();
        setClicks(loadedClicks);
      }
    } catch (e) {
      console.error('Failed to load admin data', e);
    }
  };

  useEffect(() => {
    if (!isUnlocked) return;
    let ignore = false;
    async function loadData() {
      try {
        const response = await fetch('/api/admin/products', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || !data.success || !Array.isArray(data.products)) {
          throw new Error(data.error || 'Unable to load products.');
        }
        const loadedProducts = data.products as Product[];
        let loadedCategories: string[] = [];
        let loadedClicks: MarketplaceClickEvent[] = [];
        if (isAdminRole) loadedCategories = await getAllCategories();
        if (isSuperAdminRole) {
          loadedClicks = await getMarketplaceClicks();
        }
        if (!ignore) {
          setProducts(loadedProducts);
          setCategories(loadedCategories);
          setClicks(loadedClicks);
        }
      } catch (e) {
        console.error('Failed to load admin data', e);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [isUnlocked, isAdminRole, isSuperAdminRole]);

  useEffect(() => {
    fetch('/api/admin/session')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.role) {
          setServerRole(data.role);
        }
      })
      .catch(() => {});
  }, []);

  const loadAdminUsers = useCallback(async () => {
    if (!isSuperAdminRole) return;
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setAdminUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [isSuperAdminRole]);

  useEffect(() => {
    if (activeTab !== 'roles' || !isSuperAdminRole) return;
    let ignore = false;
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (!ignore && data.success && Array.isArray(data.users)) {
          setAdminUsers(data.users);
        }
      })
      .catch(err => {
        console.error('Failed to load admin users:', err);
      });

    return () => {
      ignore = true;
    };
  }, [activeTab, isSuperAdminRole]);

  useEffect(() => {
    if (!isAdminRole) return;
    let ignore = false;
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => {
        if (!ignore && data.success) setAdminCanDeleteProducts(data.adminCanDeleteProducts === true);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [isAdminRole]);

  const loadOrders = useCallback(async () => {
    if (!isSuperAdminRole) return;
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/super-admin/orders', { cache: 'no-store' });
      const data = await response.json();
      if (response.ok && data.success && Array.isArray(data.orders)) setOrders(data.orders);
      else setRoleActionError(data.error || 'Unable to load orders.');
    } catch {
      setRoleActionError('Unable to load orders.');
    } finally {
      setOrdersLoading(false);
    }
  }, [isSuperAdminRole]);

  const handleUpdateRole = async (targetUserId: string, newRole: UserRole) => {
    setRoleActionMessage(null);
    setRoleActionError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRoleActionMessage(`Successfully updated user role to "${newRole}".`);
        await loadAdminUsers();
      } else {
        setRoleActionError(data.error || 'Failed to update user role.');
      }
    } catch {
      setRoleActionError('Network error updating user role.');
    }
  };

  const handleUpdateOrder = async (orderId: string, update: { orderStatus?: Order['orderStatus']; paymentStatus?: Order['paymentStatus'] }) => {
    try {
      const response = await fetch('/api/super-admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...update }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to update order.');
      await loadOrders();
    } catch (error) {
      setRoleActionError(error instanceof Error ? error.message : 'Unable to update order.');
    }
  };

  const handleAdminDeletionSetting = async (allow: boolean) => {
    setSettingsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCanDeleteProducts: allow }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to save setting.');
      setAdminCanDeleteProducts(data.adminCanDeleteProducts === true);
    } catch (error) {
      setRoleActionError(error instanceof Error ? error.message : 'Unable to save setting.');
    } finally {
      setSettingsSaving(false);
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
    setFormStockQuantity(50);
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
    setFormStockQuantity(p.stockQuantity ?? (p.inStock ? 1 : 0));
    setFormBurnTime(p.burnTimeHours || 45);
    setFormWaxType(p.waxType || '100% Botanical Soy Wax');
    setFormError(null);
    setFormSuccess(null);
    setPreviewMode(false);
    setIsModalOpen(true);
  };

  const validateUrl = (url: string): boolean => {
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
    if (formAmazonUrl && !validateUrl(formAmazonUrl)) {
      setFormError('Invalid Amazon URL. Must begin with https://');
      return;
    }
    if (formFlipkartUrl && !validateUrl(formFlipkartUrl)) {
      setFormError('Invalid Flipkart URL. Must begin with https://');
      return;
    }
    if (formMeeshoUrl && !validateUrl(formMeeshoUrl)) {
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
      stockQuantity: Number(formStockQuantity),
      burnTimeHours: Number(formBurnTime),
      waxType: formWaxType.trim(),
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await saveProduct(productData, Boolean(editingProduct));
      setFormSuccess(res.notice || 'Product saved successfully.');
      await refreshData();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!isSuperAdminRole && !adminCanDeleteProducts) {
      alert('Product deletion is restricted by the Super Admin.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${name}" from the catalogue?`)) {
      try {
        await deleteProduct(id);
        await refreshData();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to delete product.');
      }
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

  // Middleware and server APIs enforce the same role boundary; this is the UI fallback.
  if (!isUnlocked) {
    const isCustomer = user && (user.role === 'user' || user.role === 'customer');

    return (
      <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EAE3D9] p-8 max-w-md w-full shadow-xl text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-amber-600 text-white flex items-center justify-center mx-auto shadow-md">
              {isCustomer ? <AlertCircle className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
            </div>

            <div>
              <h1 className="font-serif-luxury text-2xl font-bold text-[#231B15]">
                {isCustomer ? 'Access Restricted' : 'Administrator Sign In Required'}
              </h1>
              <p className="text-xs text-[#786C63] mt-1">
                {isCustomer
                  ? 'Your account does not have administrative privileges. Only designated administrators may access this portal.'
                  : 'Sign in with an account assigned Admin or Super Admin access.'}
              </p>
            </div>

            <Link
              href={isCustomer ? '/customer' : '/login'}
              className="w-full py-2.5 px-4 rounded-lg bg-[#231B15] hover:bg-[#3D3027] text-white text-xs font-semibold tracking-wider uppercase transition-colors inline-block"
            >
              {isCustomer ? 'Return to Customer Portal' : 'Sign In'}
            </Link>

            <div className="pt-2 border-t border-[#EAE3D9] text-[11px] text-[#786C63]">
              <span>Protected portal. Role-based access is strictly enforced on the server.</span>
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
              <span>{isSuperAdminRole ? 'LIVE LOVE LIGHT • SUPER ADMINISTRATION' : 'LIVE LOVE LIGHT • PRODUCT MANAGEMENT'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#231B15]">
                {isSuperAdminRole ? 'Super Admin Control Center' : 'Product Management'}
              </h1>
              {isSuperAdminRole ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F4E8C1] text-[#9A7513] border border-[#C59B27]/40 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Super Admin
                </span>
              ) : isProductManagerRole ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 shadow-xs">
                  <Lock className="w-3.5 h-3.5 text-teal-700" />
                  Admin
                </span>
              ) : null}
            </div>
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
        <div className="flex items-center gap-2 border-b border-[#EAE3D9] pb-px text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-[#231B15] text-[#231B15]'
                : 'border-transparent text-[#786C63] hover:text-[#231B15]'
            }`}
          >
            <span>Products ({products.length})</span>
          </button>
          {isAdminRole && (
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'categories'
                  ? 'border-[#231B15] text-[#231B15]'
                  : 'border-transparent text-[#786C63] hover:text-[#231B15]'
              }`}
            >
              <span>Categories ({categories.length})</span>
            </button>
          )}
          {isSuperAdminRole && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'border-[#231B15] text-[#231B15]'
                    : 'border-transparent text-[#786C63] hover:text-[#231B15]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Marketplace Clicks ({clicks.length})</span>
              </button>
            </>
          )}
          {isSuperAdminRole && (
            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'roles'
                  ? 'border-[#231B15] text-[#231B15]'
                  : 'border-transparent text-[#786C63] hover:text-[#231B15]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#9A7513]" />
              <span>Admin Users & Roles</span>
            </button>
          )}
          {isSuperAdminRole && (
            <>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('orders');
                  void loadOrders();
                }}
                className={`pb-3 px-4 border-b-2 transition-all whitespace-nowrap ${activeTab === 'orders' ? 'border-[#231B15] text-[#231B15]' : 'border-transparent text-[#786C63]'}`}
              >
                Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`pb-3 px-4 border-b-2 transition-all whitespace-nowrap ${activeTab === 'settings' ? 'border-[#231B15] text-[#231B15]' : 'border-transparent text-[#786C63]'}`}
              >
                Settings
              </button>
            </>
          )}
        </div>

        {/* TAB 1: Products Table */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-[#EAE3D9] shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-[#EAE3D9]">
              <input
                type="search"
                value={productQuery}
                onChange={event => setProductQuery(event.target.value)}
                placeholder="Search products, descriptions, fragrances..."
                aria-label="Search products"
                className="flex-1 min-w-0 bg-[#FCFBF7] border border-[#EAE3D9] rounded-lg px-3 py-2 text-xs"
              />
              <select value={productCategoryFilter} onChange={event => setProductCategoryFilter(event.target.value)} aria-label="Filter by category" className="bg-white border border-[#EAE3D9] rounded-lg px-3 py-2 text-xs">
                <option value="all">All categories</option>
                {categories.map(category => <option key={category} value={category}>{category}</option>)}
              </select>
              <select value={productSort} onChange={event => setProductSort(event.target.value as typeof productSort)} aria-label="Sort products" className="bg-white border border-[#EAE3D9] rounded-lg px-3 py-2 text-xs">
                <option value="name">Name A to Z</option>
                <option value="price-low">Price low to high</option>
                <option value="price-high">Price high to low</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#231B15]">
                <thead className="bg-[#F6F1EC] text-[#786C63] uppercase tracking-wider text-[10px] font-semibold border-b border-[#EAE3D9]">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Fragrance</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    {isSuperAdminRole && <th className="py-3 px-4">Marketplaces</th>}
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D9]">
                  {visibleProducts.map(p => (
                    <tr key={p.id} className="hover:bg-[#FCFBF7] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#F6F1EC] overflow-hidden shrink-0 relative border border-[#EAE3D9]">
                          <Image
                            src={p.images[0] || '/images/logo.jpeg'}
                            alt={p.name}
                            fill
                            sizes="48px"
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
                      <td className="py-3 px-4 text-[#786C63] whitespace-nowrap">
                        {p.stockQuantity ?? (p.inStock ? 'In stock' : '0')}
                      </td>
                      {isSuperAdminRole && <td className="py-3 px-4 whitespace-nowrap">
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
                      </td>}
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
                        {isAdminRole && p.featured && (
                          <span className="ml-1 text-[10px] font-bold text-[#9A7513] bg-[#F4E8C1] px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                        <span className={`ml-1 text-[10px] font-bold ${p.active ? 'text-emerald-800' : 'text-amber-800'}`}>
                          {p.active ? 'Published' : 'Draft'}
                        </span>
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
                          {(isSuperAdminRole || adminCanDeleteProducts) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 rounded-lg text-red-700 hover:bg-red-50"
                              title="Delete Candle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#F6F1EC] border-t border-[#EAE3D9] flex items-center justify-between text-xs text-[#786C63]">
              <span>Showing {visibleProducts.length} of {products.length} products</span>
            </div>
          </div>
        )}

        {/* TAB 2: Categories Manager */}
        {activeTab === 'categories' && isAdminRole && (
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
        {activeTab === 'analytics' && isSuperAdminRole && (
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

        {/* TAB 4: Admin Users & Roles (Super Admin Only) */}
        {activeTab === 'roles' && isSuperAdminRole && (
          <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
              <div>
                <h3 className="font-serif-luxury text-xl font-bold text-[#231B15] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#9A7513]" />
                  <span>Admin User Registry & Role Assignment</span>
                </h3>
                <p className="text-xs text-[#786C63] mt-1">
                  Assign Admin or Super Admin access to registered accounts. Admins can manage products and prices; only Super Admins can manage links, publishing, and roles.
                </p>
              </div>
              <button
                type="button"
                onClick={loadAdminUsers}
                disabled={usersLoading}
                className="px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-[#F6F1EC] text-xs font-semibold text-[#231B15] hover:bg-[#EBE3D7] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Directory</span>
              </button>
            </div>

            {roleActionMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{roleActionMessage}</span>
              </div>
            )}

            {roleActionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{roleActionError}</span>
              </div>
            )}

            {/* Security Safeguard Notice */}
            <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[#EAE3D9] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#9A7513] shrink-0 mt-0.5" />
              <div className="text-xs text-[#786C63] space-y-1">
                <p className="font-semibold text-[#231B15]">Role-Based Access Control Rules:</p>
                <p>• <strong>SUPER_ADMIN</strong>: Has unrestricted authority across products, pricing, marketplace links, publishing, and role assignment.</p>
                <p>• <strong>ADMIN</strong>: Can manage product details, categories, prices, stock, and publishing. Marketplace links, orders, settings, and role assignment are restricted.</p>
                <p>• <strong>Last Super Admin Protection</strong>: The system rejects any attempt to demote or revoke the last active Super Administrator.</p>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#EAE3D9]">
              <table className="w-full text-left text-xs text-[#231B15]">
                <thead className="bg-[#F6F1EC] text-[#786C63] uppercase tracking-wider text-[10px] font-semibold border-b border-[#EAE3D9]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4">Created / Registered</th>
                    <th className="py-3 px-4">Last Sign In</th>
                    <th className="py-3 px-4 text-right">Role Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D9] bg-white">
                  {adminUsers.map(u => (
                    <tr key={u.id} className="hover:bg-[#FCFBF7]/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#231B15]">{u.displayName}</div>
                        <div className="text-[11px] text-[#786C63]">{u.email || u.phoneNumber || u.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        {u.role === 'super_admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4E8C1] text-[#9A7513] border border-[#C59B27]/30">
                            <ShieldCheck className="w-3 h-3" />
                            Super Admin
                          </span>
                        ) : u.role === 'admin' || u.role === 'product_manager' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                            <Lock className="w-3 h-3 text-teal-700" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#786C63] bg-[#F6F1EC]">
                            User
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#786C63] text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active Member'}
                      </td>
                      <td className="py-3 px-4 text-[#786C63] text-[11px]">
                        {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleString() : 'Never signed in'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {u.role !== 'admin' && u.role !== 'product_manager' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateRole(u.id, 'admin')}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
                            >
                              Make Admin
                            </button>
                          )}
                          {u.role !== 'super_admin' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateRole(u.id, 'super_admin')}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#9A7513] bg-[#F4E8C1]/60 hover:bg-[#F4E8C1] border border-[#C59B27]/30 transition-colors"
                            >
                              Promote Super Admin
                            </button>
                          )}
                          {u.role !== 'user' && u.role !== 'customer' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Revoke administrative access from ${u.displayName || u.email}?`)) {
                                  handleUpdateRole(u.id, 'user');
                                }
                              }}
                              className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                            >
                              Revoke Access
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {adminUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#786C63]">
                        {usersLoading ? 'Loading admin user directory...' : 'No external users registered yet. New users who sign in via Clerk can be assigned administrative roles here.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && isSuperAdminRole && (
          <section className="bg-white rounded-2xl border border-[#EAE3D9] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-5 border-b border-[#EAE3D9]">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-[#231B15]">Orders</h2>
                <p className="text-xs text-[#786C63] mt-1">Review orders and update fulfillment/payment status.</p>
              </div>
              <button type="button" onClick={loadOrders} disabled={ordersLoading} className="p-2.5 border border-[#EAE3D9] rounded-lg bg-white" aria-label="Refresh orders" title="Refresh orders">
                <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {roleActionError && <p role="alert" className="m-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs">{roleActionError}</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F1EC] text-[#786C63] uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Order</th><th className="p-3">Customer ID</th><th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Fulfillment</th><th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D9]">
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="p-3 font-semibold">{order.id}</td>
                      <td className="p-3">{order.customerId}</td>
                      <td className="p-3">{order.items?.length || 0}</td>
                      <td className="p-3 font-semibold">₹{order.totalAmount}</td>
                      <td className="p-3">
                        <select value={order.paymentStatus} onChange={event => void handleUpdateOrder(order.id, { paymentStatus: event.target.value as Order['paymentStatus'] })} className="bg-white border border-[#EAE3D9] rounded px-2 py-1">
                          {['pending', 'paid', 'failed', 'refunded'].map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="p-3">
                        <select value={order.orderStatus} onChange={event => void handleUpdateOrder(order.id, { orderStatus: event.target.value as Order['orderStatus'] })} className="bg-white border border-[#EAE3D9] rounded px-2 py-1">
                          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="p-3 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {!ordersLoading && orders.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-[#786C63]">No orders found.</td></tr>}
                  {ordersLoading && <tr><td colSpan={7} className="p-8 text-center text-[#786C63]">Loading orders...</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'settings' && isSuperAdminRole && (
          <section className="bg-white rounded-2xl border border-[#EAE3D9] p-6 shadow-sm space-y-5">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-[#231B15]">Administrator Permissions</h2>
              <p className="text-xs text-[#786C63] mt-1">Sensitive actions remain disabled for Admins unless explicitly enabled here.</p>
            </div>
            {roleActionError && <p role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-xs">{roleActionError}</p>}
            <label className="flex items-start gap-3 border-t border-[#EAE3D9] pt-5 text-sm">
              <input type="checkbox" checked={adminCanDeleteProducts} disabled={settingsSaving} onChange={event => void handleAdminDeletionSetting(event.target.checked)} className="mt-0.5 h-4 w-4" />
              <span><strong className="block text-[#231B15]">Allow Admins to delete products</strong><span className="text-xs text-[#786C63]">Off by default. Super Admins can always delete products.</span></span>
            </label>
            {settingsSaving && <p className="text-xs text-[#786C63]">Saving permission…</p>}
          </section>
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
                        sizes="(max-width: 640px) 100vw, 320px"
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
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formStockQuantity}
                      onChange={e => setFormStockQuantity(Number(e.target.value))}
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

                {/* Marketplace URLs are visible only to Super Admins. */}
                {isSuperAdminRole && (
                <div className="p-4 bg-white rounded-2xl border border-[#EAE3D9] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#231B15] flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-[#C59B27]" />
                      Marketplace Purchasing Links
                    </h4>
                    {!isSuperAdminRole && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                        <Lock className="w-3 h-3 text-amber-600" />
                        Super Admin Only
                      </span>
                    )}
                  </div>
                  {!isSuperAdminRole ? (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                      <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Read-Only for Product Managers:</strong> Marketplace destination links (Amazon, Flipkart, Meesho) are restricted to Super Administrators. Existing destination URLs will be preserved upon saving.
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#786C63]">
                      Only platforms with valid configured URLs will display purchase buttons on the product page.
                    </p>
                  )}

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block font-semibold text-[#231B15] mb-1 flex items-center justify-between">
                        <span>Amazon Product URL</span>
                        {!isSuperAdminRole && <span className="text-[10px] text-[#786C63] font-normal">Protected</span>}
                      </label>
                      <input
                        type="url"
                        disabled={!isSuperAdminRole}
                        value={formAmazonUrl}
                        onChange={e => setFormAmazonUrl(e.target.value)}
                        placeholder={isSuperAdminRole ? "https://www.amazon.in/dp/..." : "(Restricted to Super Admin)"}
                        className={`w-full text-xs p-2.5 rounded-xl border border-[#EAE3D9] ${
                          isSuperAdminRole
                            ? 'bg-[#FCFBF7] text-[#231B15] focus:outline-none focus:border-[#C59B27]'
                            : 'bg-[#F6F1EC] text-[#786C63] cursor-not-allowed opacity-80'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#231B15] mb-1 flex items-center justify-between">
                        <span>Flipkart Product URL</span>
                        {!isSuperAdminRole && <span className="text-[10px] text-[#786C63] font-normal">Protected</span>}
                      </label>
                      <input
                        type="url"
                        disabled={!isSuperAdminRole}
                        value={formFlipkartUrl}
                        onChange={e => setFormFlipkartUrl(e.target.value)}
                        placeholder={isSuperAdminRole ? "https://www.flipkart.com/..." : "(Restricted to Super Admin)"}
                        className={`w-full text-xs p-2.5 rounded-xl border border-[#EAE3D9] ${
                          isSuperAdminRole
                            ? 'bg-[#FCFBF7] text-[#231B15] focus:outline-none focus:border-[#C59B27]'
                            : 'bg-[#F6F1EC] text-[#786C63] cursor-not-allowed opacity-80'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#231B15] mb-1 flex items-center justify-between">
                        <span>Meesho Product URL</span>
                        {!isSuperAdminRole && <span className="text-[10px] text-[#786C63] font-normal">Protected</span>}
                      </label>
                      <input
                        type="url"
                        disabled={!isSuperAdminRole}
                        value={formMeeshoUrl}
                        onChange={e => setFormMeeshoUrl(e.target.value)}
                        placeholder={isSuperAdminRole ? "https://www.meesho.com/..." : "(Restricted to Super Admin)"}
                        className={`w-full text-xs p-2.5 rounded-xl border border-[#EAE3D9] ${
                          isSuperAdminRole
                            ? 'bg-[#FCFBF7] text-[#231B15] focus:outline-none focus:border-[#C59B27]'
                            : 'bg-[#F6F1EC] text-[#786C63] cursor-not-allowed opacity-80'
                        }`}
                      />
                    </div>
                  </div>
                </div>
                )}

                {/* Flags: Featured, In Stock, Active */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  {isAdminRole && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={e => setFormFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#C59B27]"
                    />
                    <span className="font-semibold text-[#231B15]">Mark as Featured</span>
                  </label>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInStock}
                      onChange={e => setFormInStock(e.target.checked)}
                      className="w-4 h-4 rounded text-[#C59B27]"
                    />
                    <span className="font-semibold text-[#231B15]">In Stock</span>
                  </label>

                  {isAdminRole && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formActive}
                        onChange={e => setFormActive(e.target.checked)}
                        className="w-4 h-4 rounded text-[#C59B27]"
                      />
                      <span className="font-semibold text-[#231B15]">Active in Catalogue</span>
                    </label>
                  )}
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
                    {isSuperAdminRole ? 'Save & Publish Candle' : 'Save Product'}
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
