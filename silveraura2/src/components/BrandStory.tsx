import React from 'react';
import { ShieldCheck, Sparkles, Award } from 'lucide-react';
import { CRAFTSMANSHIP_IMAGE } from '../data/products';
import { useShop } from '../context/ShopContext';

export const BrandStory: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <section className="py-16 sm:py-24 bg-[#F4EFEB] border-y border-[#E8E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left: Atelier Photography */}
          <div className="lg:col-span-6 relative">
            <div className="aspect-[4/3] rounded-xs overflow-hidden bg-[#E8E0D5] border border-[#D6CEC5] shadow-md">
              <img
                src={CRAFTSMANSHIP_IMAGE}
                alt="Master silversmith artisan crafting 925 sterling silver jewelry at workshop bench"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white p-4 border border-[#E8E0D5] shadow-lg max-w-xs hidden sm:block">
              <span className="font-serif-luxury text-sm font-semibold text-[#1C1917] block">
                The Silversmith's Oath
              </span>
              <p className="text-[11px] text-[#78716C] mt-1 leading-relaxed">
                Every hallmark is stamped only after passing dual acoustic density and acid purity assays.
              </p>
            </div>
          </div>

          {/* Right: Editorial Brand Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
                The Silver Aura Atelier
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1C1917] font-medium leading-tight">
                Honoring the Ancient Craft <br />
                <span className="italic font-light">With Modern Restraint.</span>
              </h2>
            </div>

            <p className="text-sm text-[#57534E] leading-relaxed">
              Silver Aura was conceived to revive true artisanal fine silver. In a market flooded with brass, low-grade alloys, and fleeting costume jewelry, we craft exclusively in solid 925 sterling silver — 92.5% pure elemental silver paired with 7.5% strengthened copper for timeless heirloom durability.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white/70 border border-[#E8E0D5]">
                <div className="flex items-center gap-2 mb-1.5 text-[#1C1917]">
                  <Award className="w-4 h-4 text-[#78716C]" />
                  <h4 className="text-xs uppercase tracking-wider font-semibold">925 Laser Stamped</h4>
                </div>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Every ring, clasp, and pendant carries an indelible laser hallmark certifying fine silver purity.
                </p>
              </div>

              <div className="p-4 bg-white/70 border border-[#E8E0D5]">
                <div className="flex items-center gap-2 mb-1.5 text-[#1C1917]">
                  <Sparkles className="w-4 h-4 text-[#78716C]" />
                  <h4 className="text-xs uppercase tracking-wider font-semibold">Rhodium Anti-Tarnish</h4>
                </div>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Bathed in precious white rhodium — one of the rarest platinum-group metals — ensuring enduring mirror luster.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigateTo('about')}
                className="py-3 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-[0.14em] font-medium transition-colors"
              >
                Read Our Full Atelier Story
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
