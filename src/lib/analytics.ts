import { MarketplaceClickEvent } from '@/types';
import { db, isFirebaseConfigured } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const STORAGE_KEY_CLICKS = 'lll_marketplace_clicks_v1';

export async function trackMarketplaceClick(
  productId: string,
  productName: string,
  marketplace: 'amazon' | 'flipkart' | 'meesho',
  sourcePage: string = 'product_details'
): Promise<void> {
  const event: MarketplaceClickEvent = {
    id: `click_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    productId,
    productName,
    marketplace,
    timestamp: new Date().toISOString(),
    sourcePage
  };

  // Local persistence for admin dashboard preview
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CLICKS);
      const existing: MarketplaceClickEvent[] = raw ? JSON.parse(raw) : [];
      existing.unshift(event);
      // Keep recent 200 events
      localStorage.setItem(STORAGE_KEY_CLICKS, JSON.stringify(existing.slice(0, 200)));
    } catch (err) {
      console.warn('Could not save local click event', err);
    }
  }

  // Firestore persistence if configured
  if (isFirebaseConfigured() && db) {
    try {
      await addDoc(collection(db, 'marketplace_clicks'), event);
    } catch (err) {
      console.warn('Failed to record marketplace click to Firestore:', err);
    }
  }
}

export async function getMarketplaceClicks(): Promise<MarketplaceClickEvent[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const clicksRef = collection(db, 'marketplace_clicks');
      const q = query(clicksRef, orderBy('timestamp', 'desc'), limit(100));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(doc => doc.data() as MarketplaceClickEvent);
      }
    } catch (error) {
      console.warn('Firestore click fetch error, falling back to local:', error);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CLICKS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse local clicks:', e);
    }
  }

  return [];
}
