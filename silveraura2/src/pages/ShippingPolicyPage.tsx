import React from 'react';
import { Truck, RefreshCw, ShieldCheck, Package, Clock, HelpCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ShippingPolicyPage: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#78716C] font-semibold block">
            Nationwide Transit & Care
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            Shipping & Return Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] max-w-lg mx-auto">
            Transparent courier terms, insured packaging, and our 7-day hassle-free sizing exchange guarantee.
          </p>
        </div>

        {/* 4 Feature Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-[#E8E0D5] text-center space-y-2">
            <Truck className="w-5 h-5 mx-auto text-[#1C1917]" />
            <h3 className="font-serif-luxury text-base font-semibold text-[#1C1917]">Free Over PKR 5,000</h3>
            <p className="text-[11px] text-[#78716C]">Complimentary courier across all cities in Pakistan</p>
          </div>
          <div className="p-5 bg-white border border-[#E8E0D5] text-center space-y-2">
            <Clock className="w-5 h-5 mx-auto text-[#1C1917]" />
            <h3 className="font-serif-luxury text-base font-semibold text-[#1C1917]">2–4 Days Transit</h3>
            <p className="text-[11px] text-[#78716C]">Fast dispatch from our central Karachi studio</p>
          </div>
          <div className="p-5 bg-white border border-[#E8E0D5] text-center space-y-2">
            <RefreshCw className="w-5 h-5 mx-auto text-[#1C1917]" />
            <h3 className="font-serif-luxury text-base font-semibold text-[#1C1917]">7-Day Exchanges</h3>
            <p className="text-[11px] text-[#78716C]">Easy size replacement or store credit</p>
          </div>
          <div className="p-5 bg-white border border-[#E8E0D5] text-center space-y-2">
            <ShieldCheck className="w-5 h-5 mx-auto text-[#1C1917]" />
            <h3 className="font-serif-luxury text-base font-semibold text-[#1C1917]">100% Insured</h3>
            <p className="text-[11px] text-[#78716C]">Tamper-evident seal & full transit insurance</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white border border-[#E8E0D5] p-6 sm:p-10 rounded-xs space-y-10 text-xs sm:text-sm text-[#57534E] leading-relaxed">
          
          {/* Section 1: Timelines */}
          <section className="space-y-3">
            <h2 className="font-serif-luxury text-2xl text-[#1C1917] font-medium pb-2 border-b border-[#F4EFEB]">
              1. Delivery Timelines & Charges
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E8E0D5] mt-2">
                <thead className="bg-[#F4EFEB] text-[#1C1917] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 border-b border-[#E8E0D5]">Region</th>
                    <th className="py-2.5 px-3 border-b border-[#E8E0D5]">Estimated Delivery</th>
                    <th className="py-2.5 px-3 border-b border-[#E8E0D5]">Courier Partner</th>
                    <th className="py-2.5 px-3 border-b border-[#E8E0D5]">Shipping Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D5]">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Karachi (Metro)</td>
                    <td className="py-2.5 px-3">24 to 48 Hours</td>
                    <td className="py-2.5 px-3">TCS Express / Studio Rider</td>
                    <td className="py-2.5 px-3">Free over PKR 5,000 (Else PKR 250)</td>
                  </tr>
                  <tr className="bg-[#FAF8F5]">
                    <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Lahore & Islamabad / Rawalpindi</td>
                    <td className="py-2.5 px-3">2 to 3 Business Days</td>
                    <td className="py-2.5 px-3">TCS Express Overnight</td>
                    <td className="py-2.5 px-3">Free over PKR 5,000 (Else PKR 250)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Faisalabad, Multan, Peshawar, Sialkot</td>
                    <td className="py-2.5 px-3">3 to 4 Business Days</td>
                    <td className="py-2.5 px-3">Leopard Courier / TCS</td>
                    <td className="py-2.5 px-3">Free over PKR 5,000 (Else PKR 250)</td>
                  </tr>
                  <tr className="bg-[#FAF8F5]">
                    <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Rest of Pakistan & Rural Towns</td>
                    <td className="py-2.5 px-3">3 to 5 Business Days</td>
                    <td className="py-2.5 px-3">TCS / Pakistan Post Insured</td>
                    <td className="py-2.5 px-3">Free over PKR 5,000 (Else PKR 250)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Cash on Delivery Policy */}
          <section className="space-y-3">
            <h2 className="font-serif-luxury text-2xl text-[#1C1917] font-medium pb-2 border-b border-[#F4EFEB]">
              2. Cash on Delivery (COD) Guidelines
            </h2>
            <p>
              We provide Cash on Delivery across 250+ cities in Pakistan. Please ensure exact cash is ready upon the courier rider's arrival to prevent delivery rescheduling. If you require inspection prior to payment, you may request our studio for an official Open-Box consignment slip.
            </p>
          </section>

          {/* Section 3: 7-Day Hassle-Free Returns */}
          <section className="space-y-3">
            <h2 className="font-serif-luxury text-2xl text-[#1C1917] font-medium pb-2 border-b border-[#F4EFEB]">
              3. 7-Day Exchange & Return Policy
            </h2>
            <p>
              Your delight is our commitment. If your ring size does not fit seamlessly, or if you prefer an alternate creation:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
              <li>Notify our WhatsApp concierge (+92 300 8291925) within <strong>7 days</strong> of delivery receipt.</li>
              <li>Jewellery must be in unworn, brand-new condition with the original 925 security tag intact.</li>
              <li>Include the original velvet presentation box, authenticity card, and microfiber cloth.</li>
              <li>We will arrange a courier pickup or provide our Karachi atelier dispatch address. Once inspected, your replacement size is dispatched within 24 hours.</li>
            </ul>
          </section>

          {/* Section 4: What is in the Parcel */}
          <section className="space-y-3">
            <h2 className="font-serif-luxury text-2xl text-[#1C1917] font-medium pb-2 border-b border-[#F4EFEB]">
              4. The Silver Aura Unboxing Experience
            </h2>
            <p>Every order dispatched from our Karachi studio arrives in bespoke presentation packaging:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E0D5]">
                <strong className="block text-[#1C1917] mb-1">Hard Velvet Trunk</strong>
                <span>Embossed with silver foil to protect against scratches.</span>
              </div>
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E0D5]">
                <strong className="block text-[#1C1917] mb-1">Certificate of 925 Purity</strong>
                <span>Numbered authenticity card signed by our master jeweller.</span>
              </div>
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E0D5]">
                <strong className="block text-[#1C1917] mb-1">Polishing Cloth</strong>
                <span>Microfiber silver buffing cloth infused with anti-tarnish minerals.</span>
              </div>
            </div>
          </section>

        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => navigateTo('shop')}
            className="py-3 px-8 bg-[#1C1917] hover:bg-[#292524] text-white text-xs uppercase tracking-wider font-medium transition-colors"
          >
            Return to Jewellery Collection
          </button>
        </div>

      </div>
    </div>
  );
};
