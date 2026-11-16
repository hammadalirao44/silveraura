export type ProductCategory = 
  | 'Rings'
  | 'Necklaces'
  | 'Earrings'
  | 'Bracelets'
  | 'Anklets'
  | 'Jewellery Sets'
  | string;

export interface ProductImageItem {
  id: string;
  productId: string;
  imageUrl: string;
  storagePath: string | null;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariantItem {
  id: string;
  productId: string;
  sku: string | null;
  sizeLabel: string | null;
  colorLabel: string | null;
  price: number | null;
  stock: number;
  isActive: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug?: string;
  categoryId?: string;
  name: string;
  category: ProductCategory;
  price: number; // Effective display/selling price in PKR (salePrice ?? basePrice)
  basePrice?: number; // Raw DB products.price in PKR
  originalPrice?: number; // Compare-at price in PKR
  salePrice?: number | null;
  sku?: string;
  images: string[];
  productImages?: ProductImageItem[];
  productVariants?: ProductVariantItem[];
  hasVariants?: boolean;
  description: string;
  silverPurity: string; // e.g., "Solid 925 Sterling Silver"
  plating?: string; // e.g., "Triple Rhodium Anti-Tarnish Finish"
  stone?: string; // e.g., "AAA Swiss Cubic Zirconia", "Freshwater Pearl", "Blue Topaz"
  weight: string; // e.g., "4.2 grams"
  hallmark: string; // "925 Laser Inscription"
  sizes?: string[]; // e.g., ["5", "6", "7", "8", "9"] or ["Adjustable"]
  inStock: boolean;
  stockCount: number;
  lowStockThreshold?: number;
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
  variantId?: string;
  selectedPrice?: number;
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
  slug?: string;
  tagline: string;
  image: string;
  count: number;
  active: boolean;
  displayOrder?: number;
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

export type BannerPlacement = 'top_bar' | 'home_banner' | 'collection_spotlight' | 'popup';

export interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  placement: BannerPlacement;
  isActive: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  updatedAt?: string;
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
  updatedAt?: string;
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

export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface AdminUserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
}

export interface RecentOrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  city: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  createdAt: string;
}

export interface BestSellingProductSummary {
  productId: string;
  productName: string;
  productSku: string | null;
  unitsSold: number;
  revenue: number;
  orderCount: number;
}

export interface DashboardOverviewData {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  statusBreakdown: Record<OrderStatus, number>;
  recentOrders: RecentOrderSummary[];
  bestSellingProducts: BestSellingProductSummary[];
  fetchedAt: string;
}

export type PaymentMethod = 'cod' | 'bank_transfer' | 'card';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type CustomerStatus = 'Active' | 'VIP' | 'Inactive';

export interface AdminOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productSku: string | null;
  variantSnapshot: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  couponCode: string | null;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

export interface AdminCustomer {
  id: string;
  isRegistered: boolean;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
  totalOrders: number;
  totalSpent: number;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  expiryDate: string;
  status: 'Active' | 'Inactive';
  usageCount: number;
  usageLimit: number | null;
  createdAt: string;
  updatedAt: string;
}

