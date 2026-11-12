import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategorySection } from './components/CategorySection';
import { HomeShowcase } from './components/HomeShowcase';
import { BrandStory } from './components/BrandStory';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { CheckoutModal } from './components/CheckoutModal';
import { Toast } from './components/Toast';

import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';

import { AdminLoginPage } from './admin/AdminLoginPage';
import { AdminLayout } from './admin/AdminLayout';

const MainAppRouter: React.FC = () => {
  const { activePage } = useShop();
  const { isAuthenticated } = useAdmin();

  // If currently routed to Admin Portal
  if (activePage === 'admin') {
    if (!isAuthenticated) {
      return <AdminLoginPage />;
    }
    return <AdminLayout />;
  }

  // Customer-Facing Storefront
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* 3-Zone Sticky Navbar */}
      <Navbar />

      {/* Main Content Router */}
      <main className="flex-1">
        {activePage === 'home' && (
          <>
            <Hero />
            <CategorySection />
            <HomeShowcase />
            <BrandStory />
            <ReviewsSection />
          </>
        )}

        {activePage === 'shop' && <ShopPage />}
        {activePage === 'product' && <ProductDetailPage />}
        {activePage === 'about' && <AboutPage />}
        {activePage === 'contact' && <ContactPage />}
        {activePage === 'faq' && <FAQPage />}
        {activePage === 'shipping' && <ShippingPolicyPage />}
      </main>

      {/* Luxury Footer */}
      <Footer />

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <QuickViewModal />
      <SizeGuideModal />
      <CheckoutModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AdminProvider>
      <ShopProvider>
        <MainAppRouter />
      </ShopProvider>
    </AdminProvider>
  );
}
