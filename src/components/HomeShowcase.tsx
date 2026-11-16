import React, { useState } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';

export const HomeShowcase: React.FC = () => {
  const { products, catalogLoading, navigateTo } = useShop();
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'new'>('featured');

  const filteredByTab = products.filter((p) => {
    if (activeTab === 'featured') return p.isFeatured;
    if (activeTab === 'bestsellers') return p.isBestSeller;
    if (activeTab === 'new') return p.isNewArrival;
    return true;
  });

  const displayedProducts = (
    filteredByTab.length > 0 ? filteredByTab : products
  ).slice(0, 6);

  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5] border-t border-[#E8E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 pb-4 border-b border-[#E8E0D5] gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#78716C] font-semibold block mb-1">
              Curated Highlights
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
              Selected Creations
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F4EFEB] rounded-xs self-start md:self-auto">
            <button
              onClick={() => setActiveTab('featured')}
              className={`py-2 px-4 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'featured'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`py-2 px-4 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'bestsellers'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Best Sellers
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`py-2 px-4 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {catalogLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="animate-pulse space-y-3">
                <div className="aspect-[3/4] bg-[#E8E0D5]/70 rounded-xs" />
                <div className="h-4 bg-[#E8E0D5]/80 w-3/4" />
                <div className="h-4 bg-[#E8E0D5]/60 w-1/3" />
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="bg-white border border-[#E8E0D5] p-12 text-center space-y-3">
            <Sparkles className="w-7 h-7 text-[#A8A29E] mx-auto" />
            <h3 className="font-serif-luxury text-xl text-[#1C1917]">
              Atelier Catalog Awaiting Releases
            </h3>
            <p className="text-xs text-[#78716C] max-w-md mx-auto">
              Active sterling silver pieces published in the admin console will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigateTo('shop', 'All')}
            className="py-3.5 px-8 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Explore Complete Collection</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
