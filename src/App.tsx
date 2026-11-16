import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { AdminProvider } from './context/AdminContext';
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
import {
  PromotionalBannerStrip,
  PromotionalPopupModal,
} from './components/PromotionalBannerSection';

import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';

import { ProtectedAdminRoute } from './admin/ProtectedAdminRoute';

const MainAppRouter: React.FC = () => {
  const { activePage } = useShop();

  // If currently routed to Admin Portal (/admin/*)
  if (activePage === 'admin') {
    return <ProtectedAdminRoute />;
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
            <PromotionalBannerStrip placement="home_banner" />
            <CategorySection />
            <HomeShowcase />
            <PromotionalBannerStrip placement="collection_spotlight" />
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
      <PromotionalPopupModal />
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
