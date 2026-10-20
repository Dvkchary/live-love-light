import { Product } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/data/initialProducts';
import { db, isFirebaseConfigured } from './firebase';
import { isSupabaseConfigured, getSupabaseBrowserClient, getSupabaseServerClient } from './supabase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  QueryDocumentSnapshot
} from 'firebase/firestore';

const STORAGE_KEY_PRODUCTS = 'lll_products_v3';
const STORAGE_KEY_CATEGORIES = 'lll_categories_v3';

// In-memory cache for fast SSR / hydration
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryCategories: string[] = [...INITIAL_CATEGORIES];

export function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return memoryProducts;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (raw) {
      const parsed: Product[] = JSON.parse(raw);
      // If legacy images (like .png or old filenames without price suffix) are present, refresh
      const OLD_IMAGE_PATHS = [
        '/images/teddy - Royal oud.jpeg',
        '/images/daisy - jasmine.jpeg',
        '/images/peony - jamsine & Royal oud.jpeg',
        '/images/lotus - sandlewood.jpeg',
        '/images/jar - rayal oud.jpeg',
      ];
      const hasOldImages = parsed.some(p =>
        p.images?.some(img => img.includes('.png') || OLD_IMAGE_PATHS.includes(img))
      );
      // Also refresh if any product from INITIAL_PRODUCTS is missing (e.g. new flower candle)
      const hasAllProducts = INITIAL_PRODUCTS.every(ip => parsed.some(p => p.id === ip.id));
      if (Array.isArray(parsed) && parsed.length > 0 && !hasOldImages && hasAllProducts) {
        memoryProducts = parsed;
        return parsed;
      }
    }
    // initialize local storage with default given products
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  } catch (err) {
    console.warn('Error reading local products storage', err);
  }
  return memoryProducts;
}

export function setLocalProducts(products: Product[]) {
  memoryProducts = products;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (err) {
      console.warn('Error writing local products storage', err);
    }
  }
}

export function getLocalCategories(): string[] {
  if (typeof window === 'undefined') return memoryCategories;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCategories = parsed;
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  } catch (err) {
    console.warn('Error reading local categories storage', err);
  }
  return memoryCategories;
}

export function setLocalCategories(categories: string[]) {
  memoryCategories = categories;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (err) {
      console.warn('Error writing local categories storage', err);
    }
  }
}

// Fetch all active products
export async function getAllProducts(): Promise<Product[]> {
  // 1. Fetch from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = typeof window === 'undefined' ? getSupabaseServerClient() : getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const supabaseProducts: Product[] = data.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            fragrance: row.fragrance,
            fragranceNotes: row.fragrance_notes,
            price: Number(row.price),
            originalPrice: row.original_price ? Number(row.original_price) : undefined,
            currency: (row.currency || 'INR') as 'INR',
            category: row.category,
            images: Array.isArray(row.images) ? row.images : [],
            marketplaces: row.marketplaces || {},
            featured: Boolean(row.featured),
            active: Boolean(row.active),
            inStock: Boolean(row.in_stock),
            stockQuantity: Number(row.stock_quantity ?? (row.in_stock ? 1 : 0)),
            burnTimeHours: row.burn_time_hours ?? 45,
            waxType: row.wax_type ?? '100% Botanical Soy Wax',
            weightGrams: row.weight_grams ?? 250,
            dimensions: row.dimensions,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
          setLocalProducts(supabaseProducts);
          return supabaseProducts;
        }
      }
    } catch (err) {
      console.warn('Supabase products fetch failed, falling back to local data:', err);
    }
  }

  // 2. Fallback to Firestore if configured
  if (isFirebaseConfigured() && db) {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const firestoreProducts = snapshot.docs.map((docSnap: QueryDocumentSnapshot) => docSnap.data() as Product);
        setLocalProducts(firestoreProducts);
        return firestoreProducts;
      }
    } catch (error) {
      console.warn('Firestore fetch failed, falling back to local data:', error);
    }
  }
  return getLocalProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find(p => p.slug === slug || p.id === slug) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find(p => p.id === id) || null;
}

export async function saveProduct(product: Product, isUpdate?: boolean): Promise<{ success: boolean; notice?: string }> {
  // If in browser, execute mutation via secure server API enforcing role authorization & marketplace restrictions
  if (typeof window !== 'undefined') {
    const shouldUpdate = isUpdate ?? Boolean(product.id && getLocalProducts().some(p => p.id === product.id));
    const endpoint = '/api/admin/products';
    const method = shouldUpdate ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save candle. Check administrator permissions.');
    }

    const saved: Product = data.product || product;
    const current = getLocalProducts();
    const existingIdx = current.findIndex(p => p.id === saved.id);
    let updated: Product[];

    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = saved;
    } else {
      updated = [saved, ...current.filter(p => p.slug !== saved.slug)];
    }

    setLocalProducts(updated);
    return { success: true, notice: data.notice };
  }

  // Server-side direct execution fallback
  const current = getLocalProducts();
  const existingIdx = current.findIndex(p => p.id === product.id);
  let updated: Product[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...product, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }

  setLocalProducts(updated);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient(true);
      if (supabase) {
        await supabase.from('products').upsert({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          fragrance: product.fragrance,
          fragrance_notes: product.fragranceNotes || {},
          price: product.price,
          original_price: product.originalPrice,
          currency: product.currency,
          category: product.category,
          images: product.images,
          marketplaces: product.marketplaces || {},
          featured: product.featured,
          active: product.active,
          in_stock: product.inStock,
          burn_time_hours: product.burnTimeHours,
          wax_type: product.waxType,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed to sync product to Supabase:', err);
    }
  }

  return { success: true };
}

export async function deleteProduct(id: string): Promise<void> {
  // If in browser, route through secure server API enforcing Super Admin permission
  if (typeof window !== 'undefined') {
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete candle. Only Super Administrators can delete products.');
    }

    const current = getLocalProducts();
    setLocalProducts(current.filter(p => p.id !== id));
    return;
  }

  // Server-side fallback
  const current = getLocalProducts();
  setLocalProducts(current.filter(p => p.id !== id));

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient(true);
      if (supabase) {
        await supabase.from('products').delete().eq('id', id);
      }
    } catch (err) {
      console.error('Failed to delete product from Supabase:', err);
    }
  }
}

export async function getAllCategories(): Promise<string[]> {
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/admin/categories', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (response.ok && Array.isArray(data.categories)) {
        setLocalCategories(data.categories);
        return data.categories;
      }
    } catch (error) {
      console.warn('Category API unavailable, using local categories:', error);
    }
  }

  if (isFirebaseConfigured() && db) {
    try {
      const catDoc = await getDoc(doc(db, 'settings', 'categories'));
      if (catDoc.exists() && catDoc.data()?.list) {
        const list = catDoc.data()?.list as string[];
        setLocalCategories(list);
        return list;
      }
    } catch (error) {
      console.warn('Firestore categories fetch error, using local:', error);
    }
  }
  return getLocalCategories();
}

export async function saveCategory(categoryName: string): Promise<void> {
  if (typeof window !== 'undefined') {
    const response = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: categoryName }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to save category.');
    }
    setLocalCategories(data.categories || []);
    return;
  }

  const cats = getLocalCategories();
  if (!cats.includes(categoryName)) {
    const updated = [...cats, categoryName];
    setLocalCategories(updated);

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'settings', 'categories'), { list: updated }, { merge: true });
      } catch (err) {
        console.error('Failed to save category to Firestore:', err);
      }
    }
  }
}

export async function deleteCategory(categoryName: string): Promise<void> {
  if (typeof window !== 'undefined') {
    const response = await fetch(`/api/admin/categories?category=${encodeURIComponent(categoryName)}`, {
      method: 'DELETE',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete category.');
    }
    setLocalCategories(data.categories || []);
    return;
  }

  const cats = getLocalCategories();
  const updated = cats.filter(c => c !== categoryName);
  setLocalCategories(updated);

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'settings', 'categories'), { list: updated }, { merge: true });
    } catch (err) {
      console.error('Failed to delete category from Firestore:', err);
    }
  }
}

export function resetToInitialProducts(): void {
  setLocalProducts(INITIAL_PRODUCTS);
  setLocalCategories(INITIAL_CATEGORIES);
}
