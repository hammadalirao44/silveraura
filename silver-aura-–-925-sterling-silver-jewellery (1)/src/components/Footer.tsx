import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer: React.FC = () => {
  const { navigateTo, setIsSizeGuideOpen } = useShop();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#1C1917] text-[#FAF8F5] pt-16 pb-12 border-t border-[#292524]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter & Club Box */}
        <div className="border-b border-[#292524] pb-12 mb-12">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#A8A29E] font-semibold block">
              The Silver Aura Society
            </span>
            <h3 className="font-serif-luxury text-3xl sm:text-4xl text-white font-normal">
              Receive 10% Privilege on Your First Order
            </h3>
            <p className="text-xs sm:text-sm text-[#A8A29E] leading-relaxed max-w-lg mx-auto">
              Join our private list to receive early access to limited capsule releases, private previews, and complimentary silver care advice.
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-[#292524] text-white text-xs border border-[#44403C]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Privilege code <strong>AURA10</strong> active! Enjoy 10% off at checkout.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#292524] border border-[#44403C] pl-9 pr-4 py-3 text-xs text-white placeholder-[#78716C] focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="py-3 px-6 bg-white text-[#1C1917] hover:bg-[#E8E0D5] text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4-Column Footer Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#292524] text-xs">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-serif-luxury text-2xl tracking-[0.14em] text-white uppercase block">
              Silver Aura
            </span>
            <p className="text-[#A8A29E] leading-relaxed max-w-sm">
              Pakistan's premier destination for certified solid 925 sterling silver fine jewellery. Crafted with precision, triple-rhodium plated, and designed to endure for generations.
            </p>
            <div className="flex items-center gap-2 text-[#D6D3D1] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#A8A29E]" />
              <span className="text-[11px] uppercase tracking-wider">100% Certified 925 Sterling Silver</span>
            </div>
            <p className="text-[11px] text-[#78716C]">
              Flagship Studio: Ocean Mall, Clifton, Karachi, Pakistan.
            </p>
          </div>

          {/* Shop Categories */}
          <div className="space-y-3">
            <h4 className="text-white text-xs uppercase tracking-widest font-semibold">Collections</h4>
            <ul className="space-y-2 text-[#A8A29E]">
              <li>
                <button onClick={() => navigateTo('shop', 'Rings')} className="hover:text-white transition-colors">
                  Rings & Solitaires
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', 'Necklaces')} className="hover:text-white transition-colors">
                  Necklaces & Chokers
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', 'Earrings')} className="hover:text-white transition-colors">
                  Earrings & Huggies
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', 'Bracelets')} className="hover:text-white transition-colors">
                  Bracelets & Tennis Links
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', 'Anklets')} className="hover:text-white transition-colors">
                  Silver Anklets
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', 'Jewellery Sets')} className="hover:text-white transition-colors">
                  Bridal Suites & Duos
                </button>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="space-y-3">
            <h4 className="text-white text-xs uppercase tracking-widest font-semibold">Client Care</h4>
            <ul className="space-y-2 text-[#A8A29E]">
              <li>
                <button onClick={() => setIsSizeGuideOpen(true)} className="hover:text-white transition-colors">
                  Size Guide & Measurements
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shipping')} className="hover:text-white transition-colors">
                  Shipping & Delivery Times
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shipping')} className="hover:text-white transition-colors">
                  7-Day Return & Exchange
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors">
                  Studio Concierge & WhatsApp
                </button>
              </li>
            </ul>
          </div>

          {/* The Atelier */}
          <div className="space-y-3">
            <h4 className="text-white text-xs uppercase tracking-widest font-semibold">The Atelier</h4>
            <ul className="space-y-2 text-[#A8A29E]">
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors">
                  Our Silversmith Heritage
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors">
                  925 Hallmark Guarantee
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors">
                  Anti-Tarnish Rhodium Science
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors">
                  Bespoke Bridal Consultations
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Payment Channels & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#78716C]">
          <div className="flex flex-wrap items-center gap-4">
            <span>Payment Accepted:</span>
            <span className="text-[#A8A29E]">Cash on Delivery (COD)</span>
            <span>·</span>
            <span className="text-[#A8A29E]">Bank Transfer (IBFT)</span>
            <span>·</span>
            <span className="text-[#A8A29E]">Visa & Mastercard</span>
            <span>·</span>
            <span className="text-[#A8A29E]">JazzCash / Raast</span>
          </div>

          <p className="tabular-nums">
            © {new Date().getFullYear()} Silver Aura Fine Jewellery. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};
