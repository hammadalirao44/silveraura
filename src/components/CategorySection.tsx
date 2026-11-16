import React, { useState } from 'react';
import { ArrowUpRight, Layers } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CategorySection: React.FC = () => {
  const { categories, catalogLoading, navigateTo } = useShop();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

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

        {/* Loading Skeleton */}
        {catalogLoading && categories.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="animate-pulse flex flex-col">
                <div className="aspect-[3/4] bg-[#E8E0D5]/70 rounded-xs mb-3" />
                <div className="h-4 bg-[#E8E0D5]/80 w-2/3 mb-1.5" />
                <div className="h-3 bg-[#E8E0D5]/60 w-1/3" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-[#E8E0D5] p-10 text-center space-y-3">
            <Layers className="w-7 h-7 text-[#A8A29E] mx-auto" />
            <h3 className="font-serif-luxury text-xl text-[#1C1917]">
              Collections Are Being Curated
            </h3>
            <p className="text-xs text-[#78716C] max-w-md mx-auto">
              Active sterling silver collections from our studio will appear here as soon as they are published.
            </p>
          </div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat) => {
              const showFallback = !cat.image || Boolean(failedImages[cat.id]);

              return (
                <div
                  key={cat.id}
                  onClick={() => navigateTo('shop', cat.name)}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#E8E0D5] rounded-xs mb-3 shadow-xs">
                    {!showFallback ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [cat.id]: true }))
                        }
                        className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#F4EFEB] to-[#E8E0D5] text-center">
                        <span className="text-[10px] uppercase tracking-[0.22em] text-[#78716C] font-semibold">
                          925 Silver
                        </span>
                        <span className="font-serif-luxury text-xl text-[#1C1917] mt-1">
                          {cat.name}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#1C1917]" />
                    </div>
                  </div>
                  <h3 className="font-serif-luxury text-lg text-[#1C1917] font-medium group-hover:text-[#78716C] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#78716C] tracking-wide mt-0.5">
                    {cat.count} {cat.count === 1 ? 'Design' : 'Designs'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
