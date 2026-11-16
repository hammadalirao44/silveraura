import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CategoryItem,
  OrderDetails,
  Customer,
  Coupon,
  WebsiteContent,
  StoreSettings,
  AdminSection,
  OrderStatus,
} from '../types';
import { PRODUCTS } from '../data/products';
import {
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_COUPONS,
  INITIAL_WEBSITE_CONTENT,
  INITIAL_STORE_SETTINGS,
} from '../data/adminSeedData';

interface AdminContextType {
  // Auth
  isAuthenticated: boolean;
  adminUser: { name: string; email: string; role: string } | null;
  login: (email: string, pass: string) => { success: boolean; message: string };
  logout: () => void;

  // Active section
  activeSection: AdminSection;
  setActiveSection: (sec: AdminSection) => void;

  // Products
  products: Product[];
  addProduct: (product: Partial<Product>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  updateProductStock: (id: string, newStock: number) => void;

  // Categories
  categories: CategoryItem[];
  addCategory: (cat: { name: string; tagline: string; image: string; active?: boolean }) => void;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryStatus: (id: string) => void;

  // Orders
  orders: OrderDetails[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;

  // Customers
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'registrationDate'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coup: Omit<Coupon, 'id' | 'usageCount'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponStatus: (id: string) => void;

  // Content
  websiteContent: WebsiteContent;
  updateWebsiteContent: (updates: Partial<WebsiteContent>) => void;

  // Settings
  storeSettings: StoreSettings;
  updateStoreSettings: (updates: Partial<StoreSettings>) => void;

  // Toast / Feedback in Admin
  adminToast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showAdminToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('silver_aura_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(() => {
    return isAuthenticated
      ? { name: 'Artisan Administrator', email: 'admin@silveraura.com', role: 'Head Curator' }
      : null;
  });

  // Active section
  const [activeSection, setActiveSectionState] = useState<AdminSection>('dashboard');

  const setActiveSection = (sec: AdminSection) => {
    setActiveSectionState(sec);
    if (window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#admin')) {
      window.location.hash = `admin/${sec}`;
    }
  };

  // Toast
  const [adminToast, setAdminToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showAdminToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAdminToast({ message, type });
    setTimeout(() => setAdminToast(null), 3200);
  };

  // 2. Products state (Shared with Storefront)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('silver_aura_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load products from localStorage', e);
    }
    return PRODUCTS.map((p, idx) => ({
      ...p,
      sku: p.sku || `SA-${p.category.slice(0, 3).toUpperCase()}-${100 + idx}`,
      status: p.status || 'active',
      salePrice: p.originalPrice ? p.price : undefined,
      createdAt: p.createdAt || '2026-10-15',
    }));
  });

  useEffect(() => {
    try {
      localStorage.setItem('silver_aura_products', JSON.stringify(products));
    } catch (e) {
      console.warn('Failed to persist products', e);
    }
  }, [products]);

  // 3. Categories state
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('silver_aura_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load categories', e);
    }
    return INITIAL_CATEGORIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('silver_aura_categories', JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to persist categories', e);
    }
  }, [categories]);

  // 4. Orders state
  const [orders, setOrders] = useState<OrderDetails[]>(() => {
    try {
      const saved = localStorage.getItem('silver_aura_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load orders', e);
    }
    return INITIAL_ORDERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('silver_aura_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to persist orders', e);
    }
  }, [orders]);

  // 5. Customers state
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('silver_aura_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load customers', e);
    }
    return INITIAL_CUSTOMERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('silver_aura_customers', JSON.stringify(customers));
    } catch (e) {
      console.warn('Failed to persist customers', e);
    }
  }, [customers]);

  // 6. Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('silver_aura_coupons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load coupons', e);
    }
    return INITIAL_COUPONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('silver_aura_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.warn('Failed to persist coupons', e);
    }
  }, [coupons]);

  // 7. Website Content state
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent>(() => {
    try {
      const saved = localStorage.getItem('silver_aura_content');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load website content', e);
    }
    return INITIAL_WEBSITE_CONTENT;
  });

  useEffect(() => {
    try {
      localStorage.setItem('silver_aura_content', JSON.stringify(websiteContent));
    } catch (e) {
      console.warn('Failed to persist website content', e);
    }
  }, [websiteContent]);

  // 8. Store Settings state
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('silver_aura_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load store settings', e);
    }
    return INITIAL_STORE_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('silver_aura_settings', JSON.stringify(storeSettings));
    } catch (e) {
      console.warn('Failed to persist store settings', e);
    }
  }, [storeSettings]);

  // Sync hash routing for admin
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#admin/')) {
        const sec = hash.replace('#admin/', '').split('?')[0] as AdminSection;
        const validSections: AdminSection[] = [
          'dashboard', 'products', 'categories', 'orders', 'customers',
          'inventory', 'coupons', 'content', 'settings'
        ];
        if (validSections.includes(sec)) {
          setActiveSectionState(sec);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Listen for storefront new orders event
  useEffect(() => {
    const handleStorefrontOrder = (e: Event) => {
      const customEvent = e as CustomEvent<OrderDetails>;
      if (customEvent.detail) {
        setOrders(prev => [customEvent.detail, ...prev]);
        // Also update or add customer
        const custName = customEvent.detail.customerName;
        const custEmail = customEvent.detail.email || `${custName.toLowerCase().replace(/\s+/g, '')}@client.pk`;
        setCustomers(prev => {
          const existing = prev.find(c => c.name.toLowerCase() === custName.toLowerCase() || c.email === custEmail);
          if (existing) {
            return prev.map(c => c.id === existing.id ? {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: c.totalSpent + customEvent.detail.total,
              status: c.totalSpent + customEvent.detail.total > 20000 ? 'VIP' : c.status
            } : c);
          } else {
            return [
              {
                id: `cust-${Date.now()}`,
                name: custName,
                email: custEmail,
                phone: customEvent.detail.phone,
                city: customEvent.detail.city,
                address: customEvent.detail.address,
                totalOrders: 1,
                totalSpent: customEvent.detail.total,
                registrationDate: new Date().toISOString().split('T')[0],
                status: 'Active'
              },
              ...prev
            ];
          }
        });
      }
    };

    window.addEventListener('silver_aura_new_order', handleStorefrontOrder);
    return () => window.removeEventListener('silver_aura_new_order', handleStorefrontOrder);
  }, []);

  // Auth actions
  const login = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (cleanEmail === 'admin@silveraura.com' && cleanPass === 'Admin123') {
      setIsAuthenticated(true);
      setAdminUser({
        name: 'Artisan Administrator',
        email: 'admin@silveraura.com',
        role: 'Head Curator',
      });
      try {
        localStorage.setItem('silver_aura_admin_auth', 'true');
      } catch {}
      showAdminToast('Welcome back to Silver Aura Studio Management');
      return { success: true, message: 'Authentication successful' };
    }

    return {
      success: false,
      message: 'Invalid credentials. Demo: admin@silveraura.com / Admin123',
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    try {
      localStorage.removeItem('silver_aura_admin_auth');
    } catch {}
    showAdminToast('Logged out of Admin Portal', 'info');
    window.location.hash = 'admin/login';
  };

  // Product Actions
  const addProduct = (p: Partial<Product>) => {
    const newId = `sa-custom-${Date.now()}`;
    const newSku = p.sku || `SA-${(p.category || 'JEW').slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const fullProduct: Product = {
      id: newId,
      name: p.name || 'Untitled Silver Piece',
      category: p.category || 'Rings',
      price: Number(p.price) || 4500,
      originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
      salePrice: p.salePrice ? Number(p.salePrice) : undefined,
      sku: newSku,
      images: p.images && p.images.length > 0 ? p.images : ['/src/assets/images/category_rings_1794482387362.jpg'],
      description: p.description || 'Artisan handcrafted solid 925 sterling silver with mirror rhodium finish.',
      silverPurity: p.silverPurity || 'Solid 925 Sterling Silver',
      plating: p.plating || 'Triple Rhodium Anti-Tarnish Finish',
      stone: p.stone || 'AAA Flawless Swiss Zirconia',
      weight: p.weight || '3.8 grams',
      hallmark: p.hallmark || '925 Laser Inscription',
      sizes: p.sizes && p.sizes.length > 0 ? p.sizes : ['6', '7', '8'],
      inStock: p.stockCount !== undefined ? p.stockCount > 0 : true,
      stockCount: p.stockCount !== undefined ? Number(p.stockCount) : 10,
      status: p.status || 'active',
      isFeatured: Boolean(p.isFeatured),
      isBestSeller: Boolean(p.isBestSeller),
      isNewArrival: true,
      rating: 5.0,
      reviewCount: 0,
      careNotes: p.careNotes || [
        'Store in the provided anti-tarnish velvet pouch',
        'Gently wipe with microfiber polishing cloth after wear',
      ],
      createdAt: new Date().toISOString().split('T')[0],
      variants: p.variants,
    };

    setProducts(prev => [fullProduct, ...prev]);
    showAdminToast(`Product "${fullProduct.name}" created successfully`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextStock = updates.stockCount !== undefined ? Number(updates.stockCount) : p.stockCount;
          return {
            ...p,
            ...updates,
            stockCount: nextStock,
            inStock: nextStock > 0,
          };
        }
        return p;
      })
    );
    showAdminToast('Product updated successfully');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showAdminToast('Product removed from catalog', 'info');
  };

  const toggleProductStatus = (id: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextStatus = p.status === 'inactive' ? 'active' : 'inactive';
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  const updateProductStock = (id: string, newStock: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const validStock = Math.max(0, newStock);
          return {
            ...p,
            stockCount: validStock,
            inStock: validStock > 0,
          };
        }
        return p;
      })
    );
    showAdminToast('Inventory count updated');
  };

  // Category Actions
  const addCategory = (cat: { name: string; tagline: string; image: string; active?: boolean }) => {
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: cat.name,
      tagline: cat.tagline,
      image: cat.image || '/src/assets/images/category_rings_1794482387362.jpg',
      count: 0,
      active: cat.active ?? true,
    };
    setCategories(prev => [...prev, newCat]);
    showAdminToast(`Category "${cat.name}" added`);
  };

  const updateCategory = (id: string, updates: Partial<CategoryItem>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    showAdminToast('Category updated');
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    showAdminToast('Category deleted', 'info');
  };

  const toggleCategoryStatus = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  // Order Actions
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
    showAdminToast(`Order ${orderId} marked as ${status}`);
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.orderId !== orderId));
    showAdminToast('Order deleted', 'info');
  };

  // Customer Actions
  const addCustomer = (cust: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'registrationDate'>) => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      ...cust,
      totalOrders: 0,
      totalSpent: 0,
      registrationDate: new Date().toISOString().split('T')[0],
    };
    setCustomers(prev => [newCust, ...prev]);
    showAdminToast(`Customer "${newCust.name}" registered`);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    showAdminToast('Customer profile updated');
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    showAdminToast('Customer deleted', 'info');
  };

  // Coupon Actions
  const addCoupon = (coup: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newCoup: Coupon = {
      id: `coup-${Date.now()}`,
      ...coup,
      code: coup.code.trim().toUpperCase(),
      usageCount: 0,
    };
    setCoupons(prev => [newCoup, ...prev]);
    showAdminToast(`Privilege coupon "${newCoup.code}" created`);
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons(prev => prev.map(cp => cp.id === id ? {
      ...cp,
      ...updates,
      code: updates.code ? updates.code.trim().toUpperCase() : cp.code,
    } : cp));
    showAdminToast('Coupon updated');
  };

  const deleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(cp => cp.id !== id));
    showAdminToast('Coupon deleted', 'info');
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons(prev => prev.map(cp => cp.id === id ? {
      ...cp,
      status: cp.status === 'Active' ? 'Inactive' : 'Active',
    } : cp));
  };

  // Content Actions
  const updateWebsiteContent = (updates: Partial<WebsiteContent>) => {
    setWebsiteContent(prev => ({ ...prev, ...updates }));
    showAdminToast('Website content updated and published to storefront');
  };

  // Settings Actions
  const updateStoreSettings = (updates: Partial<StoreSettings>) => {
    setStoreSettings(prev => ({ ...prev, ...updates }));
    showAdminToast('Store configuration saved');
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        adminUser,
        login,
        logout,
        activeSection,
        setActiveSection,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        updateProductStock,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus,
        orders,
        updateOrderStatus,
        deleteOrder,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,
        websiteContent,
        updateWebsiteContent,
        storeSettings,
        updateStoreSettings,
        adminToast,
        showAdminToast,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return ctx;
};
