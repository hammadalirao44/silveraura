import React from 'react';
import { ShieldCheck, Sparkles, Award, Heart, CheckCircle2 } from 'lucide-react';
import { CRAFTSMANSHIP_IMAGE, HERO_IMAGE } from '../data/products';
import { useShop } from '../context/ShopContext';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#78716C] font-semibold block">
            Our Atelier & Heritage
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl text-[#1C1917] font-normal leading-[1.1]">
            Elevating Pakistani Silversmithing <br />
            <span className="italic font-light">to International Standards.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#57534E] leading-relaxed max-w-xl mx-auto">
            Silver Aura was founded with a singular ambition: to craft authentic solid 925 sterling silver fine jewellery that rivals European luxury houses, tailored for modern aesthetics in Pakistan.
          </p>
        </div>

        {/* Visual Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          <div className="relative aspect-[4/3] rounded-xs overflow-hidden bg-[#E8E0D5] border border-[#D6CEC5] shadow-md">
            <img
              src={CRAFTSMANSHIP_IMAGE}
              alt="Crafting 925 sterling silver jewellery at workshop workbench"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#78716C] font-semibold">
              01. The Purity Standard
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1C1917] font-medium leading-tight">
              Why We Exclusively Forge <br />
              <span className="italic">Solid 925 Sterling Silver.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              Pure fine silver (99.9%) is inherently too soft for delicate stone settings and daily rings. To achieve lifelong durability without compromising elemental richness, true sterling silver contains precisely 92.5% pure silver alloyed with 7.5% strengthened copper.
            </p>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              Unlike cheap silver-plated brass that flakes or turns green within weeks, solid 925 sterling silver is a precious metal investment that can be polished, replated, and handed down across generations.
            </p>
            
            <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-[#1C1917]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Nickel-Free</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Laser Inscription Hallmark</span>
              </div>
            </div>
          </div>
        </div>

        {/* Three Core Pillars */}
        <div className="border-t border-[#E8E0D5] pt-16">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#78716C] font-semibold">
              Our Principles
            </span>
            <h3 className="font-serif-luxury text-3xl text-[#1C1917]">The Silver Aura Triad</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white border border-[#E8E0D5] rounded-xs space-y-3">
              <Award className="w-6 h-6 text-[#1C1917]" />
              <h4 className="font-serif-luxury text-xl text-[#1C1917] font-medium">Authenticity Guarantee</h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Every piece is laser-engraved with our legal '925' mark and comes with an official certificate of authenticity signed by our Karachi inspection bench.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E8E0D5] rounded-xs space-y-3">
              <Sparkles className="w-6 h-6 text-[#1C1917]" />
              <h4 className="font-serif-luxury text-xl text-[#1C1917] font-medium">Triple Rhodium Shield</h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                We electroplate each creation with triple-thickness white rhodium — giving your silver an impenetrable barrier against environmental moisture and oxidization.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E8E0D5] rounded-xs space-y-3">
              <Heart className="w-6 h-6 text-[#1C1917]" />
              <h4 className="font-serif-luxury text-xl text-[#1C1917] font-medium">Fair Artisanal Dignity</h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Our silversmiths in Lahore and Karachi earn fair, dignified living wages. We preserve centuries-old filigree and stone setting traditions while adopting precision Swiss micro-machinery.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-[#1C1917] text-[#FAF8F5] p-8 sm:p-14 rounded-xs text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#A8A29E] font-semibold block">
            Begin Your Collection
          </span>
          <h3 className="font-serif-luxury text-3xl sm:text-4xl text-white font-normal max-w-lg mx-auto">
            Experience the Weight and Radiance of Real 925 Silver.
          </h3>
          <div className="pt-2">
            <button
              onClick={() => navigateTo('shop')}
              className="py-3.5 px-8 bg-white text-[#1C1917] hover:bg-[#E8E0D5] text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
            >
              Discover The Creations
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
