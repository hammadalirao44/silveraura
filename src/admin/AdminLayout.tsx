import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Boxes,
  Tag,
  Globe,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  CheckCircle2,
  Info,
  AlertCircle,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useShop } from '../context/ShopContext';
import { AdminSection } from '../types';
import { DashboardSection } from './sections/DashboardSection';
import { ProductsSection } from './sections/ProductsSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { OrdersSection } from './sections/OrdersSection';
import { CustomersSection } from './sections/CustomersSection';
import { InventorySection } from './sections/InventorySection';
import { CouponsSection } from './sections/CouponsSection';
import { WebsiteContentSection } from './sections/WebsiteContentSection';
import { SettingsSection } from './sections/SettingsSection';

export const AdminLayout: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    logout,
    dashboardOverview,
    isSupabaseReady,
    adminToast,
    adminUser,
  } = useAdmin();

  const { navigateTo } = useShop();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingOrdersCount = dashboardOverview?.pendingOrders ?? 0;
  const stockAlertCount =
    (dashboardOverview?.outOfStockProducts ?? 0) +
    (dashboardOverview?.lowStockProducts ?? 0);

  const navItems: {
    id: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-amber-500 text-black',
    },
    { id: 'customers', label: 'Customers', icon: Users },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      badge: stockAlertCount > 0 ? stockAlertCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'content', label: 'Website Content', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (sec: AdminSection) => {
    setActiveSection(sec);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToStore = () => {
    navigateTo('home');
  };

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await logout();
  };

  const adminInitials = (() => {
    const source = (adminUser?.name || adminUser?.email || 'SA').trim();
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  })();

  const formattedRole = adminUser?.role
    ? adminUser.role.replace('_', ' ')
    : 'Administrator';

  const currentNavLabel =
    navItems.find((item) => item.id === activeSection)?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-[#F4EFEB] flex flex-col font-sans text-[#1C1917]">
      {/* Admin Floating Toast Notification */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 transition-all transform animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div
            className={`px-4 py-3 rounded-xs shadow-xl flex items-center gap-3 text-xs border ${
              adminToast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : adminToast.type === 'info'
                ? 'bg-stone-900 text-white border-stone-800'
                : 'bg-[#1C1917] text-white border-emerald-500/60'
            }`}
          >
            {adminToast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : adminToast.type === 'info' ? (
              <Info className="w-4 h-4 text-stone-300 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="font-medium">{adminToast.message}</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1C1917] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#292524] ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Sidebar Top: Wordmark & Nav */}
          <div className="flex-1 overflow-y-auto">
            <div className="h-16 px-6 border-b border-[#292524] flex items-center justify-between">
              <div>
                <span className="font-serif-luxury text-xl tracking-[0.18em] uppercase text-white block">
                  Silver Aura
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#A8A29E] -mt-1 block">
                  Admin Console
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden text-[#A8A29E] hover:text-white cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-3 space-y-1" aria-label="Admin sections">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xs transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#292524] text-white border-l-2 border-[#D6CEC5]'
                        : 'text-[#A8A29E] hover:bg-[#292524]/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${isActive ? 'text-[#D6CEC5]' : 'text-[#78716C]'}`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded-xs ${
                          item.badgeColor || 'bg-amber-500 text-black'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Bottom: View Storefront & Logout */}
          <div className="p-4 border-t border-[#292524] space-y-2">
            <button
              onClick={handleReturnToStore}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#D6CEC5] bg-[#292524] hover:bg-[#332E2B] transition-colors rounded-xs group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-[#A8A29E] group-hover:text-white" />
                <span>View Storefront</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[#A8A29E]">Store</span>
            </button>

            <button
              onClick={() => void handleLogout()}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-colors rounded-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Backdrop for Mobile Drawer */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 md:pl-64 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-[#E8E0D5] sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-xs text-[#78716C]">
                <span className="hidden sm:inline">Silver Aura Admin</span>
                <span className="hidden sm:inline text-[#D6CEC5]">/</span>
                <span className="font-semibold text-[#1C1917]">{currentNavLabel}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4 text-xs">
              <div
                className={`hidden lg:flex items-center gap-2 px-2.5 py-1 border text-[11px] font-medium ${
                  isSupabaseReady
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSupabaseReady ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span>{isSupabaseReady ? 'Supabase Auth Active' : 'Supabase Unconfigured'}</span>
              </div>

              <button
                onClick={handleReturnToStore}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D6CEC5] text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#F4EFEB] transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Customer Store</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-[#E8E0D5]">
                <div className="w-8 h-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center font-serif-luxury font-medium text-xs">
                  {adminInitials}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-[#1C1917] max-w-[160px] truncate">
                    {adminUser?.name || adminUser?.email}
                  </div>
                  <div className="text-[10px] text-[#78716C] capitalize">{formattedRole}</div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Section Router */}
          <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
            {activeSection === 'dashboard' ? (
              <DashboardSection />
            ) : activeSection === 'products' ? (
              <ProductsSection />
            ) : activeSection === 'categories' ? (
              <CategoriesSection />
            ) : activeSection === 'orders' ? (
              <OrdersSection />
            ) : activeSection === 'customers' ? (
              <CustomersSection />
            ) : activeSection === 'inventory' ? (
              <InventorySection />
            ) : activeSection === 'coupons' ? (
              <CouponsSection />
            ) : activeSection === 'content' ? (
              <WebsiteContentSection />
            ) : activeSection === 'settings' ? (
              <SettingsSection />
            ) : (
              <DashboardSection />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
