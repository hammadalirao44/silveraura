import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Truck, RefreshCw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { HERO_IMAGE } from '../data/products';

export const Hero: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5]">
      {/* Main Campaign Hero Split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Statement & CTAs */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 z-10">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#78716C] font-semibold block">
                925 Sterling Silver Atelier
              </span>
              <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl text-[#1C1917] font-normal leading-[1.08] tracking-tight text-balance">
                Pure Silver, <br />
                <span className="italic font-light">Timeless Allure.</span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-[#57534E] leading-relaxed max-w-lg">
              Sculpted from certified 925 sterling silver and finished with mirror rhodium plating. 
              Designed for effortless modern living, from Karachi evenings to everyday rituals.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => navigateTo('shop', 'All')}
                className="py-3.5 px-8 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#292524] transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => navigateTo('shop', 'Jewellery Sets')}
                className="py-3.5 px-6 border border-[#D6CEC5] text-[#1C1917] text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#F4EFEB] transition-colors flex items-center justify-center cursor-pointer"
              >
                Bridal & Gift Sets
              </button>
            </div>

            <div className="pt-4 flex items-center gap-6 text-xs text-[#78716C]">
              <div>
                <span className="block font-serif-luxury text-xl text-[#1C1917] font-medium">92.5%</span>
                <span className="tracking-wide">Pure Fine Silver</span>
              </div>
              <div className="w-[1px] h-8 bg-[#E8E0D5]" />
              <div>
                <span className="block font-serif-luxury text-xl text-[#1C1917] font-medium">100%</span>
                <span className="tracking-wide">Hypoallergenic</span>
              </div>
              <div className="w-[1px] h-8 bg-[#E8E0D5]" />
              <div>
                <span className="block font-serif-luxury text-xl text-[#1C1917] font-medium">Nationwide</span>
                <span className="tracking-wide">Insured Transit</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Campaign Visual */}
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-sm overflow-hidden bg-[#E8E0D5] shadow-lg">
              <img
                src={HERO_IMAGE}
                alt="Silver Aura certified 925 sterling silver statement jewellery resting on natural travertine stone"
                className="w-full h-full object-cover object-center transform hover:scale-[1.01] transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              
              {/* Subtle ambient lighting vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

              {/* Floating Minimal Badge */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md py-2 px-3.5 border border-[#E8E0D5] shadow-sm text-xs text-[#1C1917] hidden sm:flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#78716C]" />
                <span className="font-serif-luxury italic text-sm">The Heritage Capsule</span>
                <span className="text-[#A8A29E]">·</span>
                <span className="text-[11px] uppercase tracking-wider text-[#78716C]">Solid 925 Hallmarked</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4-Pillar Trust Strip */}
      <div className="border-y border-[#E8E0D5] bg-[#F4EFEB]/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-[#E8E0D5] text-[#1C1917]">
                <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">Certified 925 Silver</h4>
                <p className="text-xs text-[#78716C] mt-0.5">Laser hallmarked authenticity guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-[#E8E0D5] text-[#1C1917]">
                <Sparkles className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">Rhodium Shield</h4>
                <p className="text-xs text-[#78716C] mt-0.5">Anti-tarnish triple platinum mirror bath</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-[#E8E0D5] text-[#1C1917]">
                <Truck className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">Pakistan Delivery</h4>
                <p className="text-xs text-[#78716C] mt-0.5">Insured 2–4 business days via TCS & Leopard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-[#E8E0D5] text-[#1C1917]">
                <RefreshCw className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">7-Day Exchange</h4>
                <p className="text-xs text-[#78716C] mt-0.5">Hassle-free sizing exchanges & returns</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
