export type ProductCategory = 
  | 'Rings'
  | 'Necklaces'
  | 'Earrings'
  | 'Bracelets'
  | 'Anklets'
  | 'Jewellery Sets'
  | string;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // In PKR
  originalPrice?: number; // In PKR
  salePrice?: number;
  sku?: string;
  images: string[];
  description: string;
  silverPurity: string; // e.g., "Solid 925 Sterling Silver"
  plating?: string; // e.g., "Triple Rhodium Anti-Tarnish Finish"
  stone?: string; // e.g., "AAA Swiss Cubic Zirconia", "Freshwater Pearl", "Blue Topaz"
  weight: string; // e.g., "4.2 grams"
  hallmark: string; // "925 Laser Inscription"
  sizes?: string[]; // e.g., ["5", "6", "7", "8", "9"] or ["Adjustable"]
  inStock: boolean;
  stockCount: number;
  status?: 'active' | 'inactive';
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating: number;
  reviewCount: number;
  careNotes: string[];
  createdAt?: string;
  variants?: {
    sizes?: string[];
    colors?: string[];
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface Review {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  productName: string;
}

export interface FilterOptions {
  category: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  searchQuery: string;
  priceRange: [number, number];
  inStockOnly: boolean;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderDetails {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'card' | string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  date: string;
  status?: OrderStatus;
}

export interface CategoryItem {
  id: string;
  name: string;
  tagline: string;
  image: string;
  count: number;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  registrationDate: string;
  status: 'Active' | 'VIP' | 'Inactive';
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10% or 1500 for PKR 1500
  minOrderAmount: number;
  expiryDate: string;
  status: 'Active' | 'Inactive';
  usageCount: number;
}

export interface WebsiteContent {
  heroSubtitle: string;
  heroTitle: string;
  heroTitleItalic?: string;
  heroDescription: string;
  heroImage: string;
  heroCtaText?: string;
  heroSecondaryCtaText?: string;
  announcementText: string;
  announcementDeliveryThreshold?: number;
  societyDiscountCode?: string;
  aboutText?: string;
  brandStorySnippet?: string;
  contactAddress?: string;
  atelierAddress?: string;
  contactWhatsApp?: string;
  conciergePhone?: string;
  contactEmail?: string;
  conciergeEmail?: string;
  visitingHours?: string;
}

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  contactEmail?: string;
  contactPhone: string;
  storeAddress: string;
  currency: string;
  currencySymbol?: string;
  standardShippingCharge: number;
  freeShippingThreshold: number;
  lowStockThreshold: number;
  lowStockAlertThreshold?: number;
}

export type ActivePage = 'home' | 'shop' | 'about' | 'contact' | 'faq' | 'shipping' | 'product' | 'admin';

export type AdminSection = 
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'coupons'
  | 'content'
  | 'settings';
