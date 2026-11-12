import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ActivePage, OrderDetails } from '../types';
import { PRODUCTS } from '../data/products';

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: Product[];
  activePage: ActivePage;
  selectedProduct: Product | null;
  quickViewProduct: Product | null;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isCheckoutOpen: boolean;
  isSizeGuideOpen: boolean;
  searchQuery: string;
  selectedCategory: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  priceRange: [number, number];
  inStockOnly: boolean;
  promoCode: string;
  discountPercent: number;
  lastOrder: OrderDetails | null;

  // Actions
  setActivePage: (page: ActivePage) => void;
  navigateTo: (page: ActivePage, category?: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  openProduct: (product: Product) => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsSizeGuideOpen: (open: boolean) => void;

  // Cart actions
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  buyNow: (product: Product, quantity?: number, selectedSize?: string) => void;

  // Wishlist actions
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Filter actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSortBy: (sort: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest') => void;
  setPriceRange: (range: [number, number]) => void;
  setInStockOnly: (inStock: boolean) => void;
  resetFilters: () => void;

  // Promo & Order
  applyPromoCode: (code: string) => { success: boolean; message: string };
  completeOrder: (order: OrderDetails) => void;

  // Computed values
  cartSubtotal: number;
  cartShipping: number;
  cartDiscountAmount: number;
  cartTotal: number;
  cartCount: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;

  // Toast
  toast: { message: string; visible: boolean } | null;
  showToast: (message: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 5000;
const STANDARD_SHIPPING_FEE = 250;

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products] = useState<Product[]>(PRODUCTS);
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [lastOrder, setLastOrder] = useState<OrderDetails | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, visible: false } : null));
    }, 2800);
  };

  // LocalStorage initialization for Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('silver_aura_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Initial starter item for delightful first-load experience
    return [
      {
        product: PRODUCTS[0],
        quantity: 1,
        selectedSize: '7',
      },
    ];
  });

  // LocalStorage initialization for Wishlist
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('silver_aura_wishlist');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [PRODUCTS[4]]; // Serena Floating Zirconia Choker
  });

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem('silver_aura_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  // Save wishlist
  useEffect(() => {
    try {
      localStorage.setItem('silver_aura_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Could not save wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Handle URL hash routing or deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['home', 'shop', 'about', 'contact', 'faq', 'shipping'].includes(hash)) {
        setActivePage(hash as ActivePage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('category-')) {
        const cat = hash.replace('category-', '');
        const matched = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Anklets', 'Jewellery Sets'].find(
          c => c.toLowerCase().replace(/\s+/g, '-') === cat
        );
        if (matched) {
          setSelectedCategory(matched);
          setActivePage('shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (hash.startsWith('product-')) {
        const prodId = hash.replace('product-', '');
        const found = products.find(p => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
          setActivePage('product');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [products]);

  const navigateTo = (page: ActivePage, category?: string) => {
    if (category) {
      setSelectedCategory(category);
    }
    setActivePage(page);
    window.location.hash = page === 'home' ? '' : page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setActivePage('product');
    window.location.hash = `product-${product.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  const addToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    const defaultSize = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === defaultSize
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      } else {
        return [...prev, { product, quantity, selectedSize: defaultSize }];
      }
    });

    showToast(`Added ${product.name} to your jewellery bag`);
    setIsCartOpen(true);
  };

  const buyNow = (product: Product, quantity = 1, selectedSize?: string) => {
    addToCart(product, quantity, selectedSize);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.selectedSize === selectedSize))
    );
    showToast('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.selectedSize === selectedSize) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(`Removed from your wishlist`);
        return prev.filter((p) => p.id !== product.id);
      } else {
        showToast(`Saved ${product.name} to wishlist`);
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('featured');
    setPriceRange([0, 30000]);
    setInStockOnly(false);
  };

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'AURA10') {
      setPromoCode('AURA10');
      setDiscountPercent(10);
      showToast('10% Welcome Luxury Privilege Applied!');
      return { success: true, message: '10% discount successfully applied!' };
    } else if (clean === 'SILVER925') {
      setPromoCode('SILVER925');
      setDiscountPercent(15);
      showToast('15% 925 Club Privilege Applied!');
      return { success: true, message: '15% discount applied!' };
    } else {
      return { success: false, message: 'Invalid or expired promotional code. Try "AURA10"' };
    }
  };

  const completeOrder = (order: OrderDetails) => {
    setLastOrder(order);
    clearCart();
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartDiscountAmount = Math.round((cartSubtotal * discountPercent) / 100);
  const cartShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD || cartSubtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscountAmount + cartShipping);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);

  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        wishlist,
        activePage,
        selectedProduct,
        quickViewProduct,
        isCartOpen,
        isWishlistOpen,
        isCheckoutOpen,
        isSizeGuideOpen,
        searchQuery,
        selectedCategory,
        sortBy,
        priceRange,
        inStockOnly,
        promoCode,
        discountPercent,
        lastOrder,
        setActivePage,
        navigateTo,
        setSelectedProduct,
        openProduct,
        openQuickView,
        closeQuickView,
        setIsCartOpen,
        setIsWishlistOpen,
        setIsCheckoutOpen,
        setIsSizeGuideOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        buyNow,
        toggleWishlist,
        isInWishlist,
        setSearchQuery,
        setSelectedCategory,
        setSortBy,
        setPriceRange,
        setInStockOnly,
        resetFilters,
        applyPromoCode,
        completeOrder,
        cartSubtotal,
        cartShipping,
        cartDiscountAmount,
        cartTotal,
        cartCount,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining,
        toast,
        showToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
