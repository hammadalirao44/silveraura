export type ProductCategory = 
  | 'Rings'
  | 'Necklaces'
  | 'Earrings'
  | 'Bracelets'
  | 'Anklets'
  | 'Jewellery Sets';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // In PKR
  originalPrice?: number; // In PKR
  images: string[];
  description: string;
  silverPurity: string; // e.g., "925 Sterling Silver (Solid)"
  plating?: string; // e.g., "Rhodium Anti-Tarnish Finish"
  stone?: string; // e.g., "AAA Swiss Cubic Zirconia", "Freshwater Pearl", "Blue Topaz"
  weight: string; // e.g., "4.2 grams"
  hallmark: string; // "925 Laser Inscription"
  sizes?: string[]; // e.g., ["5", "6", "7", "8", "9"] or ["Adjustable"]
  inStock: boolean;
  stockCount: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating: number;
  reviewCount: number;
  careNotes: string[];
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

export interface OrderDetails {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'card';
  notes?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  date: string;
}

export type ActivePage = 'home' | 'shop' | 'about' | 'contact' | 'faq' | 'shipping' | 'product';
