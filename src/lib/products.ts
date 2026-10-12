import { Product } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/data/initialProducts';
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy
} from 'firebase/firestore';

const STORAGE_KEY_PRODUCTS = 'lll_products_v2';
const STORAGE_KEY_CATEGORIES = 'lll_categories_v2';

// In-memory cache for fast SSR / hydration
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryCategories: string[] = [...INITIAL_CATEGORIES];

export function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return memoryProducts;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (raw) {
      const parsed: Product[] = JSON.parse(raw);
      // If legacy images (like 01-handcrafted-candles) are present, refresh to given images
      const hasOldImages = parsed.some(p => p.images?.some(img => img.includes('.png')));
      if (Array.isArray(parsed) && parsed.length > 0 && !hasOldImages) {
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
  if (isFirebaseConfigured() && db) {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const firestoreProducts = snapshot.docs.map(docSnap => docSnap.data() as Product);
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

export async function saveProduct(product: Product): Promise<void> {
  // Update local memory & storage
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

  // Sync to Firestore if configured
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, product, { merge: true });
    } catch (err) {
      console.error('Failed to sync product to Firestore:', err);
    }
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const current = getLocalProducts();
  const updated = current.filter(p => p.id !== id);
  setLocalProducts(updated);

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Failed to delete product from Firestore:', err);
    }
  }
}

export async function getAllCategories(): Promise<string[]> {
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
