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
  stockQuantity?: number;
  burnTimeHours?: number;
  waxType?: string;
  weightGrams?: number;
  dimensions?: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminRole = 'admin' | 'product_manager' | 'super_admin';
export type UserRole = 'user' | 'customer' | 'product_manager' | 'super_admin' | 'admin';

export interface AdminPermissions {
  canManageProductContent: boolean;
  canManageMarketplaceLinks: boolean;
  canManagePublishing: boolean;
  canManageAdminRoles: boolean;
  canAccessAdminSettings: boolean;
  canManageCategories: boolean;
  canViewOrders: boolean;
}

export interface AdminUserSummary {
  id: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  role: UserRole;
  createdAt?: string;
  lastSignInAt?: string;
}

export interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  role: UserRole;
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

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  createdAt?: string;
}

export interface Order {
  id: string;
  customerId: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  shippingAddress?: Record<string, unknown>;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

