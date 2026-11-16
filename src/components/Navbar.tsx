import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Navbar: React.FC = () => {
  const {
    categories,
    storeSettings,
    activePage,
    selectedCategory,
    navigateTo,
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    searchQuery,
    setSearchQuery,
  } = useShop();

  const storeName = storeSettings.storeName || 'Silver Aura';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Keep desktop nav single-line & uncrowded (up to 4 featured active categories + All Jewellery + Atelier)
  const desktopCategories = categories.slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('shop');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E0D5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="p-2 text-[#1C1917] hover:text-[#78716C] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => navigateTo('home')}
            className="text-left group cursor-pointer"
          >
            <span className="font-serif-luxury text-2xl sm:text-3xl font-medium tracking-[0.12em] text-[#1C1917] uppercase group-hover:text-[#44403C] transition-colors whitespace-nowrap">
              {storeName}
            </span>
          </button>

          {/* Zone 2: Dynamic Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium tracking-wider uppercase text-[#44403C]">
            <button
              onClick={() => navigateTo('shop', 'All')}
              className={`hover:text-[#1C1917] transition-colors pb-1 relative whitespace-nowrap cursor-pointer ${
                activePage === 'shop' && selectedCategory === 'All'
                  ? 'text-[#1C1917] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#1C1917]'
                  : ''
              }`}
            >
              All Jewellery
            </button>

            {desktopCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigateTo('shop', cat.name)}
                className={`hover:text-[#1C1917] transition-colors pb-1 relative whitespace-nowrap cursor-pointer ${
                  activePage === 'shop' && selectedCategory === cat.name
                    ? 'text-[#1C1917] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#1C1917]'
                    : ''
                }`}
              >
                {cat.name}
              </button>
            ))}

            <button
              onClick={() => navigateTo('about')}
              className={`hover:text-[#1C1917] transition-colors pb-1 whitespace-nowrap cursor-pointer ${
                activePage === 'about' ? 'text-[#1C1917] font-semibold' : ''
              }`}
            >
              Atelier
            </button>
          </nav>

          {/* Zone 3: Primary Action Cluster */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search collection"
                className="p-2 text-[#1C1917] hover:text-[#78716C] transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5 stroke-[1.75]" />
              </button>
            </div>

            <button
              onClick={() => setIsWishlistOpen(true)}
              aria-label={`Wishlist with ${wishlist.length} items`}
              className="p-2 text-[#1C1917] hover:text-[#78716C] transition-colors relative cursor-pointer"
            >
              <Heart className="w-5 h-5 stroke-[1.75]" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#1C1917] text-[#FAF8F5] text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Shopping bag with ${cartCount} items`}
              className="flex items-center gap-2 py-2 px-3 bg-[#1C1917] text-[#FAF8F5] hover:bg-[#292524] transition-colors rounded-sm cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
              <span className="text-xs tracking-wider uppercase font-medium hidden sm:inline">
                Bag
              </span>
              <span className="text-xs font-semibold tabular-nums px-1.5 py-0.2 bg-[#FAF8F5]/20 rounded-xs">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Dropdown Quick Search Bar */}
        {searchOpen && (
          <div className="py-3 px-2 border-t border-[#E8E0D5] animate-in fade-in slide-in-from-top-2 duration-150">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search rings, necklaces, SKU, 925 sterling silver..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-white border border-[#D6CEC5] px-4 py-2.5 text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#1C1917] rounded-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#78716C] hover:text-black"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Slide-Over Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-[#FAF8F5] h-full shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E8E0D5]">
                <span className="font-serif-luxury text-xl tracking-[0.1em] text-[#1C1917] uppercase">
                  {storeName}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#78716C] hover:text-[#1C1917]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-3">
                <button
                  onClick={() => {
                    navigateTo('shop', 'All');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-base font-serif-luxury text-[#1C1917] flex items-center justify-between"
                >
                  <span>All Jewellery</span>
                  <ArrowRight className="w-4 h-4 text-[#A8A29E]" />
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      navigateTo('shop', cat.name);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-sm text-[#44403C] hover:text-[#1C1917] flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    {cat.count > 0 && (
                      <span className="text-[11px] text-[#A8A29E]">{cat.count}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-[#E8E0D5] space-y-2">
                <button
                  onClick={() => {
                    navigateTo('about');
                    setMobileMenuOpen(false);
                  }}
                  className="block py-1.5 text-xs text-[#78716C] hover:text-[#1C1917]"
                >
                  Our Atelier & 925 Hallmark
                </button>
                <button
                  onClick={() => {
                    navigateTo('shipping');
                    setMobileMenuOpen(false);
                  }}
                  className="block py-1.5 text-xs text-[#78716C] hover:text-[#1C1917]"
                >
                  Shipping & Return Policy
                </button>
                <button
                  onClick={() => {
                    navigateTo('faq');
                    setMobileMenuOpen(false);
                  }}
                  className="block py-1.5 text-xs text-[#78716C] hover:text-[#1C1917]"
                >
                  Frequently Asked Questions
                </button>
                <button
                  onClick={() => {
                    navigateTo('contact');
                    setMobileMenuOpen(false);
                  }}
                  className="block py-1.5 text-xs text-[#78716C] hover:text-[#1C1917]"
                >
                  Contact Studio
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8E0D5] text-xs text-[#78716C]">
              <p>Karachi · Lahore · Islamabad</p>
              <p className="mt-1">Insured Delivery Across Pakistan</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
