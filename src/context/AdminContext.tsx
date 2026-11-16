import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  AdminUserProfile,
  DashboardOverviewData,
} from '../types';
import { supabase, isSupabaseConfigured, supabaseConfigError } from '../lib/supabase';
import { fetchDashboardOverview } from '../services/dashboardService';

const VALID_ADMIN_SECTIONS: AdminSection[] = [
  'dashboard',
  'products',
  'categories',
  'orders',
  'customers',
  'inventory',
  'coupons',
  'content',
  'settings',
];

function parseAdminSectionFromLocation(): AdminSection {
  const path = window.location.pathname.toLowerCase();
  if (path.startsWith('/admin/')) {
    const seg = path.replace('/admin/', '').split('/')[0] as AdminSection;
    if (VALID_ADMIN_SECTIONS.includes(seg)) {
      return seg;
    }
  }

  const hash = window.location.hash.toLowerCase();
  if (hash.startsWith('#admin/')) {
    const sec = hash.replace('#admin/', '').split('?')[0] as AdminSection;
    if (VALID_ADMIN_SECTIONS.includes(sec)) {
      return sec;
    }
  }

  return 'dashboard';
}

const EMPTY_WEBSITE_CONTENT: WebsiteContent = {
  heroSubtitle: '',
  heroTitle: '',
  heroTitleItalic: '',
  heroDescription: '',
  heroImage: '',
  announcementText: '',
};

const EMPTY_STORE_SETTINGS: StoreSettings = {
  storeName: 'Silver Aura',
  storeEmail: '',
  contactPhone: '',
  storeAddress: '',
  currency: 'PKR',
  standardShippingCharge: 250,
  freeShippingThreshold: 5000,
  lowStockThreshold: 5,
};

interface AdminContextType {
  // Supabase status & Auth
  isSupabaseReady: boolean;
  supabaseError: string | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  adminUser: AdminUserProfile | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;

  // Navigation
  activeSection: AdminSection;
  setActiveSection: (sec: AdminSection) => void;

  // Stage 2 Dashboard Overview (real Supabase metrics)
  dashboardOverview: DashboardOverviewData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;
  refreshDashboard: () => Promise<void>;

  // Feedback Toast
  adminToast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showAdminToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Stage 3/4 Module Contracts (empty non-mock defaults until Stages 3 & 4 wire each module)
  products: Product[];
  addProduct: (product: Partial<Product>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  updateProductStock: (id: string, newStock: number) => void;

  categories: CategoryItem[];
  addCategory: (cat: { name: string; tagline: string; image: string; active?: boolean }) => void;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryStatus: (id: string) => void;

  orders: OrderDetails[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;

  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'registrationDate'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  coupons: Coupon[];
  addCoupon: (coup: Omit<Coupon, 'id' | 'usageCount'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponStatus: (id: string) => void;

  websiteContent: WebsiteContent;
  updateWebsiteContent: (updates: Partial<WebsiteContent>) => void;

  storeSettings: StoreSettings;
  updateStoreSettings: (updates: Partial<StoreSettings>) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUserProfile | null>(null);

  const [activeSection, setActiveSectionState] = useState<AdminSection>(
    parseAdminSectionFromLocation
  );

  const [dashboardOverview, setDashboardOverview] = useState<DashboardOverviewData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [adminToast, setAdminToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showAdminToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setAdminToast({ message, type });
      window.setTimeout(() => setAdminToast(null), 3400);
    },
    []
  );

  const verifyAdminRecord = useCallback(
    async (userId: string): Promise<AdminUserProfile | null> => {
      if (!supabase) return null;

      const { data, error } = await supabase
        .from('admin_users')
        .select('id, user_id, email, full_name, role, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        email: data.email,
        name: data.full_name || data.email,
        role: data.role,
        isActive: data.is_active,
      };
    },
    []
  );

  const refreshDashboard = useCallback(async () => {
    if (!supabase || !isAuthenticated) {
      setDashboardOverview(null);
      return;
    }

    setDashboardLoading(true);
    setDashboardError(null);

    try {
      const overview = await fetchDashboardOverview();
      setDashboardOverview(overview);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to load dashboard metrics from Supabase.';
      setDashboardError(msg);
    } finally {
      setDashboardLoading(false);
    }
  }, [isAuthenticated]);

  // Restore Supabase session and listen to auth state transitions
  useEffect(() => {
    const client = supabase;
    if (!client) {
      setAuthLoading(false);
      setIsAuthenticated(false);
      setAdminUser(null);
      return;
    }

    let cancelled = false;

    const syncSession = async (userId: string | null) => {
      if (!userId) {
        if (!cancelled) {
          setAdminUser(null);
          setIsAuthenticated(false);
          setDashboardOverview(null);
          setAuthLoading(false);
        }
        return;
      }

      const profile = await verifyAdminRecord(userId);
      if (cancelled) return;

      if (!profile) {
        await client.auth.signOut();
        if (!cancelled) {
          setAdminUser(null);
          setIsAuthenticated(false);
          setDashboardOverview(null);
          setAuthLoading(false);
        }
        return;
      }

      setAdminUser(profile);
      setIsAuthenticated(true);
      setAuthLoading(false);
    };

    client.auth
      .getSession()
      .then(({ data }) => syncSession(data.session?.user?.id ?? null))
      .catch(() => {
        if (!cancelled) {
          setAdminUser(null);
          setIsAuthenticated(false);
          setAuthLoading(false);
        }
      });

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      void syncSession(session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [verifyAdminRecord]);

  // Fetch dashboard overview once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      void refreshDashboard();
    }
  }, [isAuthenticated, refreshDashboard]);

  // Sync URL pathname & hash with activeSection
  useEffect(() => {
    const syncSectionFromUrl = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash.startsWith('#admin')) {
        setActiveSectionState(parseAdminSectionFromLocation());
      }
    };

    window.addEventListener('popstate', syncSectionFromUrl);
    window.addEventListener('hashchange', syncSectionFromUrl);
    return () => {
      window.removeEventListener('popstate', syncSectionFromUrl);
      window.removeEventListener('hashchange', syncSectionFromUrl);
    };
  }, []);

  const setActiveSection = useCallback((sec: AdminSection) => {
    setActiveSectionState(sec);
    const targetPath = `/admin/${sec}`;
    if (window.location.pathname.toLowerCase() !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
      if (!supabase) {
        return {
          success: false,
          message:
            supabaseConfigError ||
            'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.',
        };
      }

      const cleanEmail = email.trim();
      if (!cleanEmail || !password) {
        return { success: false, message: 'Please enter your admin email and password.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        return {
          success: false,
          message: error?.message || 'Authentication failed. Please verify your credentials.',
        };
      }

      const profile = await verifyAdminRecord(data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        return {
          success: false,
          message:
            'Access denied. This account does not have active Silver Aura administrator privileges.',
        };
      }

      setAdminUser(profile);
      setIsAuthenticated(true);
      setActiveSectionState('dashboard');
      window.history.pushState(null, '', '/admin/dashboard');
      showAdminToast(`Welcome back, ${profile.name}`);
      return { success: true, message: 'Authenticated successfully.' };
    },
    [showAdminToast, verifyAdminRecord]
  );

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setAdminUser(null);
    setDashboardOverview(null);
    setDashboardError(null);
    setActiveSectionState('dashboard');
    window.history.pushState(null, '', '/admin/login');
    showAdminToast('Signed out of Silver Aura Admin', 'info');
  }, [showAdminToast]);

  const notifyStagePending = useCallback(
    (moduleName: string) => {
      showAdminToast(`${moduleName} module will connect to Supabase in the next stage.`, 'info');
    },
    [showAdminToast]
  );

  return (
    <AdminContext.Provider
      value={{
        isSupabaseReady: isSupabaseConfigured,
        supabaseError: supabaseConfigError,
        authLoading,
        isAuthenticated,
        adminUser,
        login,
        logout,
        activeSection,
        setActiveSection,
        dashboardOverview,
        dashboardLoading,
        dashboardError,
        refreshDashboard,
        adminToast,
        showAdminToast,

        // Non-mock compatibility defaults for un-migrated Stage 3/4 files
        products: [],
        addProduct: () => notifyStagePending('Product management'),
        updateProduct: () => notifyStagePending('Product management'),
        deleteProduct: () => notifyStagePending('Product management'),
        toggleProductStatus: () => notifyStagePending('Product management'),
        updateProductStock: () => notifyStagePending('Inventory management'),
        categories: [],
        addCategory: () => notifyStagePending('Category management'),
        updateCategory: () => notifyStagePending('Category management'),
        deleteCategory: () => notifyStagePending('Category management'),
        toggleCategoryStatus: () => notifyStagePending('Category management'),
        orders: [],
        updateOrderStatus: () => notifyStagePending('Order management'),
        deleteOrder: () => notifyStagePending('Order management'),
        customers: [],
        addCustomer: () => notifyStagePending('Customer management'),
        updateCustomer: () => notifyStagePending('Customer management'),
        deleteCustomer: () => notifyStagePending('Customer management'),
        coupons: [],
        addCoupon: () => notifyStagePending('Coupon management'),
        updateCoupon: () => notifyStagePending('Coupon management'),
        deleteCoupon: () => notifyStagePending('Coupon management'),
        toggleCouponStatus: () => notifyStagePending('Coupon management'),
        websiteContent: EMPTY_WEBSITE_CONTENT,
        updateWebsiteContent: () => notifyStagePending('Website content'),
        storeSettings: EMPTY_STORE_SETTINGS,
        updateStoreSettings: () => notifyStagePending('Store settings'),
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
