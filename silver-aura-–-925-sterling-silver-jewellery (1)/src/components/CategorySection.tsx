import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CATEGORIES_DATA } from '../data/products';

export const CategorySection: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 pb-4 border-b border-[#E8E0D5] gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#78716C] font-semibold block mb-1">
              Curated Collections
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => navigateTo('shop', 'All')}
            className="text-xs uppercase tracking-[0.14em] font-medium text-[#1C1917] hover:text-[#78716C] transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Creations</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid: 6 Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {CATEGORIES_DATA.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigateTo('shop', cat.name)}
              className="group cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#E8E0D5] rounded-xs mb-3 shadow-xs">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#1C1917]" />
                </div>
              </div>
              <h3 className="font-serif-luxury text-lg text-[#1C1917] font-medium group-hover:text-[#78716C] transition-colors leading-tight">
                {cat.name}
              </h3>
              <p className="text-[11px] text-[#78716C] tracking-wide mt-0.5">
                {cat.count} Designs
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
