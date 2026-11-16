import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CategoryItem,
  CartItem,
  ActivePage,
  OrderDetails,
  StoreSettings,
  WebsiteContent,
  PromotionalBanner,
} from '../types';
import { fetchStorefrontCatalog, formatVariantLabel } from '../services/catalogService';
import {
  DEFAULT_STORE_SETTINGS,
  DEFAULT_WEBSITE_CONTENT,
  fetchStorefrontSiteData,
} from '../services/siteContentService';
import { getCartItemStockStatus, validateCouponRpc } from '../services/checkoutService';

interface AppliedCouponState {
  code: string;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number;
  discountAmount: number;
  minOrderAmount: number;
}

interface ShopContextType {
  products: Product[];
  categories: CategoryItem[];
  catalogLoading: boolean;
  catalogError: string | null;
  refreshCatalog: () => Promise<void>;

  homepageContent: WebsiteContent;
  promotionalBanners: PromotionalBanner[];
  storeSettings: StoreSettings;
  siteDataLoading: boolean;
  refreshSiteData: () => Promise<void>;

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
  couponValidating: boolean;
  couponMessage: string | null;
  cartHasStockIssues: boolean;
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
  addToCart: (
    product: Product,
    quantity?: number,
    selectedSize?: string,
    variantId?: string,
    selectedPrice?: number
  ) => void;
  removeFromCart: (productId: string, selectedSize?: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    selectedSize?: string,
    variantId?: string
  ) => void;
  clearCart: () => void;
  buyNow: (
    product: Product,
    quantity?: number,
    selectedSize?: string,
    variantId?: string,
    selectedPrice?: number
  ) => void;

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
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: (silent?: boolean) => void;
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

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const refreshCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const { categories: liveCategories, products: liveProducts } =
        await fetchStorefrontCatalog();
      setCategories(liveCategories);
      setProducts(liveProducts);

      // Keep currently opened product synchronized with latest DB data
      setSelectedProduct((prev) =>
        prev ? liveProducts.find((p) => p.id === prev.id) ?? null : null
      );
      setQuickViewProduct((prev) =>
        prev ? liveProducts.find((p) => p.id === prev.id) ?? null : null
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to load products and categories from Supabase.';
      setCatalogError(msg);
      setCategories([]);
      setProducts([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const [homepageContent, setHomepageContent] = useState<WebsiteContent>(
    DEFAULT_WEBSITE_CONTENT
  );
  const [promotionalBanners, setPromotionalBanners] = useState<PromotionalBanner[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [siteDataLoading, setSiteDataLoading] = useState<boolean>(true);

  const refreshSiteData = useCallback(async () => {
    setSiteDataLoading(true);
    try {
      const siteData = await fetchStorefrontSiteData();
      setHomepageContent(siteData.homepageContent);
      setPromotionalBanners(siteData.promotionalBanners);
      setStoreSettings(siteData.storeSettings);
    } catch (err) {
      console.warn('Could not load live storefront site data from Supabase:', err);
    } finally {
      setSiteDataLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
    void refreshSiteData();
  }, [refreshCatalog, refreshSiteData]);

  // Listen to admin catalog & site content/settings updates in same tab
  useEffect(() => {
    const handleCatalogUpdated = () => {
      void refreshCatalog();
    };
    const handleSiteUpdated = () => {
      void refreshSiteData();
    };
    window.addEventListener('silver_aura_catalog_updated', handleCatalogUpdated);
    window.addEventListener('silver_aura_site_updated', handleSiteUpdated);
    return () => {
      window.removeEventListener('silver_aura_catalog_updated', handleCatalogUpdated);
      window.removeEventListener('silver_aura_site_updated', handleSiteUpdated);
    };
  }, [refreshCatalog, refreshSiteData]);

  const [activePage, setActivePage] = useState<ActivePage>(() => {
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/admin') || hash.startsWith('#admin')) {
      return 'admin';
    }
    return 'home';
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<
    'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'
  >('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Promo code (verified via Supabase validate_coupon RPC)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponState | null>(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<OrderDetails | null>(null);

  const promoCode = appliedCoupon?.code ?? '';
  const discountPercent =
    appliedCoupon?.discountType === 'percentage' ? appliedCoupon.discountValue : 0;

  // Toast
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    window.setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, visible: false } : null));
    }, 2800);
  }, []);

  // Cart initialized cleanly from localStorage (never hardcoded seed products)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('silver_aura_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item): item is CartItem =>
              Boolean(item && item.product && item.product.id && typeof item.quantity === 'number')
          );
        }
      }
    } catch {
      // ignore malformed storage
    }
    return [];
  });

  // Wishlist initialized cleanly from localStorage
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('silver_aura_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p): p is Product => Boolean(p && p.id && p.name));
        }
      }
    } catch {
      // ignore malformed storage
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('silver_aura_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('silver_aura_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Could not save wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Keep persisted cart items synchronized with live catalog prices & variant stocks
  useEffect(() => {
    if (catalogLoading || catalogError || products.length === 0) return;

    setCart((prev) => {
      if (prev.length === 0) return prev;
      let changed = false;

      const updated = prev.map((item) => {
        const matched = products.find((p) => p.id === item.product.id);
        if (!matched) return item;

        const activeVariants = (matched.productVariants ?? []).filter((v) => v.isActive);
        const matchedVariant = item.variantId
          ? activeVariants.find((v) => v.id === item.variantId)
          : undefined;

        const nextPrice = matchedVariant?.price ?? matched.price;
        const maxStock = matchedVariant
          ? Math.max(0, matchedVariant.stock)
          : Math.max(0, matched.stockCount);
        const nextQty = maxStock > 0 && item.quantity > maxStock ? maxStock : item.quantity;

        const needsUpdate =
          item.product !== matched ||
          item.selectedPrice !== nextPrice ||
          item.quantity !== nextQty;

        if (!needsUpdate) return item;
        changed = true;
        return {
          ...item,
          product: matched,
          selectedPrice: nextPrice,
          quantity: nextQty,
        };
      });

      return changed ? updated : prev;
    });
  }, [products, catalogLoading, catalogError]);

  // Handle URL pathname & hash routing or deep linking against live Supabase categories/products
  useEffect(() => {
    const handleRouteChange = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (path.startsWith('/admin') || hash.startsWith('#admin')) {
        setActivePage('admin');
        return;
      }

      const cleanHash = hash.replace('#', '');
      if (['home', 'shop', 'about', 'contact', 'faq', 'shipping'].includes(cleanHash)) {
        setActivePage(cleanHash as ActivePage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (cleanHash.startsWith('category-')) {
        const slugOrKey = cleanHash.replace('category-', '');
        const matched = categories.find(
          (c) =>
            c.slug?.toLowerCase() === slugOrKey ||
            c.name.toLowerCase().replace(/\s+/g, '-') === slugOrKey
        );
        if (matched) {
          setSelectedCategory(matched.name);
          setActivePage('shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (cleanHash.startsWith('product-')) {
        const key = cleanHash.replace('product-', '');
        const found = products.find(
          (p) => p.id.toLowerCase() === key || p.slug?.toLowerCase() === key
        );
        if (found) {
          setSelectedProduct(found);
          setActivePage('product');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (path === '/' || path === '') {
        setActivePage((prev) => (prev === 'admin' ? 'home' : prev));
      }
    };

    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [products, categories]);

  const navigateTo = useCallback((page: ActivePage, category?: string) => {
    if (category) {
      setSelectedCategory(category);
    }
    setActivePage(page);
    if (page === 'admin') {
      window.history.pushState(null, '', '/admin/dashboard');
    } else {
      if (window.location.pathname.toLowerCase().startsWith('/admin')) {
        const target = page === 'home' ? '/' : `/#${page}`;
        window.history.pushState(null, '', target);
      } else {
        window.location.hash = page === 'home' ? '' : page;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const openProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setActivePage('product');
    window.location.hash = `product-${product.slug || product.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
  }, []);

  const closeQuickView = useCallback(() => {
    setQuickViewProduct(null);
  }, []);

  const addToCart = useCallback(
    (
      product: Product,
      quantity = 1,
      selectedSize?: string,
      variantId?: string,
      selectedPrice?: number
    ) => {
      const activeVariants = (product.productVariants ?? []).filter((v) => v.isActive);
      let resolvedVariantId = variantId;
      let resolvedLabel = selectedSize;
      let resolvedPrice = selectedPrice ?? product.price;
      let availableStock = product.stockCount;

      if (activeVariants.length > 0) {
        const matchedVariant =
          (resolvedVariantId
            ? activeVariants.find((v) => v.id === resolvedVariantId)
            : undefined) ??
          activeVariants.find((v) => v.stock > 0) ??
          activeVariants[0];

        if (matchedVariant) {
          resolvedVariantId = matchedVariant.id;
          resolvedLabel =
            resolvedLabel ||
            formatVariantLabel(matchedVariant.sizeLabel, matchedVariant.colorLabel) ||
            matchedVariant.sku ||
            undefined;
          resolvedPrice = selectedPrice ?? matchedVariant.price ?? product.price;
          availableStock = matchedVariant.stock;
        }
      } else if (!resolvedLabel && product.sizes && product.sizes.length > 0) {
        resolvedLabel = product.sizes[0];
      }

      if (availableStock <= 0 || !product.inStock) {
        showToast('This piece is currently out of stock');
        return;
      }

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.product.id === product.id &&
            (item.variantId ?? '') === (resolvedVariantId ?? '') &&
            (item.selectedSize ?? '') === (resolvedLabel ?? '')
        );

        if (existingIndex > -1) {
          const next = [...prev];
          const updatedQty = Math.min(availableStock, next[existingIndex].quantity + quantity);
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: updatedQty,
            selectedPrice: resolvedPrice,
          };
          return next;
        }

        return [
          ...prev,
          {
            product,
            quantity: Math.min(availableStock, Math.max(1, quantity)),
            selectedSize: resolvedLabel,
            variantId: resolvedVariantId,
            selectedPrice: resolvedPrice,
          },
        ];
      });

      showToast(`Added ${product.name} to your jewellery bag`);
      setIsCartOpen(true);
    },
    [showToast]
  );

  const buyNow = useCallback(
    (
      product: Product,
      quantity = 1,
      selectedSize?: string,
      variantId?: string,
      selectedPrice?: number
    ) => {
      const activeVariants = (product.productVariants ?? []).filter((v) => v.isActive);
      const targetVariant =
        activeVariants.length > 0
          ? (variantId ? activeVariants.find((v) => v.id === variantId) : undefined) ??
            activeVariants.find((v) => v.stock > 0) ??
            activeVariants[0]
          : undefined;

      const availableStock = targetVariant ? targetVariant.stock : product.stockCount;

      if (!product.inStock || availableStock <= 0) {
        showToast('This piece is currently out of stock');
        return;
      }

      addToCart(
        product,
        quantity,
        selectedSize,
        targetVariant?.id ?? variantId,
        selectedPrice
      );
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    },
    [addToCart, showToast]
  );

  const removeFromCart = useCallback(
    (productId: string, selectedSize?: string, variantId?: string) => {
      setCart((prev) =>
        prev.filter(
          (item) =>
            !(
              item.product.id === productId &&
              (item.selectedSize ?? '') === (selectedSize ?? '') &&
              (item.variantId ?? '') === (variantId ?? '')
            )
        )
      );
      showToast('Item removed from cart');
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, selectedSize?: string, variantId?: string) => {
      if (quantity <= 0) {
        removeFromCart(productId, selectedSize, variantId);
        return;
      }

      let cappedToast: string | null = null;
      const catalogLoaded = !catalogLoading && !catalogError && products.length > 0;

      setCart((prev) =>
        prev.map((item) => {
          if (
            item.product.id === productId &&
            (item.selectedSize ?? '') === (selectedSize ?? '') &&
            (item.variantId ?? '') === (variantId ?? '')
          ) {
            const stockStatus = getCartItemStockStatus(item, products, catalogLoaded);
            if (quantity > item.quantity && stockStatus.availableStock <= 0) {
              cappedToast = stockStatus.issueMessage || 'Item is currently out of stock.';
              return item;
            }
            if (stockStatus.availableStock > 0 && quantity > stockStatus.availableStock) {
              cappedToast = `Maximum available quantity (${stockStatus.availableStock}) reached.`;
              return { ...item, quantity: stockStatus.availableStock };
            }
            return { ...item, quantity };
          }
          return item;
        })
      );

      if (cappedToast) {
        showToast(cappedToast);
      }
    },
    [removeFromCart, products, catalogLoading, catalogError, showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback(
    (product: Product) => {
      setWishlist((prev) => {
        const exists = prev.some((p) => p.id === product.id);
        if (exists) {
          showToast('Removed from your wishlist');
          return prev.filter((p) => p.id !== product.id);
        }
        showToast(`Saved ${product.name} to wishlist`);
        return [...prev, product];
      });
    },
    [showToast]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((p) => p.id === productId),
    [wishlist]
  );

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('featured');
    setPriceRange([0, 100000]);
    setInStockOnly(false);
  }, []);

  const freeShippingThreshold = storeSettings.freeShippingThreshold ?? 5000;
  const standardShippingFee = storeSettings.standardShippingCharge ?? 250;

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + (item.selectedPrice ?? item.product.price) * item.quantity,
    0
  );

  const catalogLoaded = !catalogLoading && !catalogError;
  const cartHasStockIssues =
    cart.length > 0 &&
    cart.some((item) => !getCartItemStockStatus(item, products, catalogLoaded).isAvailable);

  const removePromoCode = useCallback(
    (silent = false) => {
      setAppliedCoupon(null);
      setCouponMessage(null);
      if (!silent) {
        showToast('Coupon removed');
      }
    },
    [showToast]
  );

  // Server-backed coupon validation via Supabase validate_coupon RPC
  const applyPromoCode = useCallback(
    async (code: string): Promise<{ success: boolean; message: string }> => {
      if (cartSubtotal <= 0 || cart.length === 0) {
        const msg = 'Add items to your jewellery bag before applying a coupon code.';
        setCouponMessage(msg);
        return { success: false, message: msg };
      }

      setCouponValidating(true);
      try {
        const result = await validateCouponRpc(code, cartSubtotal);
        if (!result.valid) {
          setCouponMessage(result.message);
          return { success: false, message: result.message };
        }

        setAppliedCoupon({
          code: result.code,
          discountType: result.discountType,
          discountValue: result.discountValue,
          discountAmount: result.discountAmount,
          minOrderAmount: result.minOrderAmount,
        });
        setCouponMessage(result.message);
        showToast(`${result.code} applied!`);
        return { success: true, message: result.message };
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Unable to validate coupon right now.';
        setCouponMessage(msg);
        return { success: false, message: msg };
      } finally {
        setCouponValidating(false);
      }
    },
    [cartSubtotal, cart.length, showToast]
  );

  // Re-validate applied coupon whenever cart subtotal changes so totals stay exact
  useEffect(() => {
    if (!appliedCoupon) return;

    if (cart.length === 0 || cartSubtotal <= 0) {
      setAppliedCoupon(null);
      setCouponMessage(null);
      return;
    }

    let cancelled = false;
    const codeToRevalidate = appliedCoupon.code;

    const revalidate = async () => {
      const result = await validateCouponRpc(codeToRevalidate, cartSubtotal);
      if (cancelled) return;

      if (!result.valid) {
        setAppliedCoupon(null);
        setCouponMessage(result.message);
        showToast(`Coupon ${codeToRevalidate} removed: ${result.message}`);
        return;
      }

      setAppliedCoupon((prev) => {
        if (!prev || prev.code !== result.code) return prev;
        if (
          prev.discountAmount === result.discountAmount &&
          prev.discountType === result.discountType &&
          prev.discountValue === result.discountValue
        ) {
          return prev;
        }
        return {
          code: result.code,
          discountType: result.discountType,
          discountValue: result.discountValue,
          discountAmount: result.discountAmount,
          minOrderAmount: result.minOrderAmount,
        };
      });
    };

    void revalidate();
    return () => {
      cancelled = true;
    };
  }, [cartSubtotal, cart.length, appliedCoupon?.code, showToast]);

  const completeOrder = useCallback(
    (order: OrderDetails) => {
      setLastOrder(order);
      setCart([]);
      setAppliedCoupon(null);
      setCouponMessage(null);
      void refreshCatalog();
      window.dispatchEvent(new CustomEvent('silver_aura_new_order', { detail: order }));
    },
    [refreshCatalog]
  );

  const cartDiscountAmount = appliedCoupon
    ? Math.min(cartSubtotal, Math.max(0, Math.round(appliedCoupon.discountAmount)))
    : 0;
  const cartShipping =
    cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : standardShippingFee;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscountAmount + cartShipping);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        catalogLoading,
        catalogError,
        refreshCatalog,
        homepageContent,
        promotionalBanners,
        storeSettings,
        siteDataLoading,
        refreshSiteData,
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
        couponValidating,
        couponMessage,
        cartHasStockIssues,
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
        removePromoCode,
        completeOrder,
        cartSubtotal,
        cartShipping,
        cartDiscountAmount,
        cartTotal,
        cartCount,
        freeShippingThreshold,
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
