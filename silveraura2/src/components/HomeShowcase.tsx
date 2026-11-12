import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';

export const HomeShowcase: React.FC = () => {
  const { products, navigateTo } = useShop();
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'new'>('featured');

  const displayedProducts = products
    .filter((p) => {
      if (activeTab === 'featured') return p.isFeatured;
      if (activeTab === 'bestsellers') return p.isBestSeller;
      if (activeTab === 'new') return p.isNewArrival;
      return true;
    })
    .slice(0, 6);

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

          {/* Tab buttons (Clean segmented control) */}
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

        {/* 3-Column Desktop / 2-Column Mobile Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA to Full Catalog */}
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
