export interface MarketplaceLinks {
  amazon?: string;
  flipkart?: string;
  meesho?: string;
}

export type CandleCategory =
  | 'Teddy Candles'
  | 'Flower Candles'
  | 'Rose Candles'
  | 'Fragrance Candles'
  | 'Decorative Candles'
  | 'Gift Collections'
  | string;

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  fragrance: string;
  fragranceNotes?: {
    top?: string;
    middle?: string;
    base?: string;
  };
  price: number;
  originalPrice?: number;
  currency: 'INR';
  category: CandleCategory;
  images: string[];
  marketplaces: MarketplaceLinks;
  featured: boolean;
  active: boolean;
  inStock: boolean;
  burnTimeHours?: number;
  waxType?: string;
  weightGrams?: number;
  dimensions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  role: 'customer' | 'admin';
  savedProducts?: string[];
  createdAt: string;
}

export interface MarketplaceClickEvent {
  id: string;
  productId: string;
  productName: string;
  marketplace: 'amazon' | 'flipkart' | 'meesho';
  timestamp: string;
  sourcePage: string;
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  fragrance: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'newest';
  onlyInStock: boolean;
  onlyMarketplace?: 'all' | 'amazon' | 'flipkart' | 'meesho';
  maxPrice?: number;
}
