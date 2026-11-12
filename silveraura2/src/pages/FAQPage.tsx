import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'Authenticity & Metal Purity',
    q: 'How do I know Silver Aura jewellery is real 925 Sterling Silver?',
    a: 'Every single creation is stamped with an official, legal "925" hallmark, signifying it contains exactly 92.5% elemental fine silver and 7.5% copper. Each parcel includes a signed Certificate of Authenticity. We welcome independent acid or XRF testing at any certified gemological laboratory.',
  },
  {
    category: 'Authenticity & Metal Purity',
    q: 'Will Silver Aura jewellery turn my skin green or cause allergies?',
    a: 'Never. Skin discoloration and allergic contact dermatitis are caused by nickel, brass, and cheap alloys found in fashion jewellery. Our solid 925 silver is 100% hypoallergenic, nickel-free, and lead-free.',
  },
  {
    category: 'Tarnishing & Care',
    q: 'Does 925 Sterling Silver tarnish, and how does your Rhodium finish protect it?',
    a: 'Pure silver naturally reacts over time with atmospheric sulfur. However, all Silver Aura pieces receive a triple-thickness electroplated white rhodium bath (a precious metal from the platinum family). This creates an impenetrable mirror shield that prevents oxidization and keeps your pieces brilliant for years. We also include a free silver polishing cloth with every order.',
  },
  {
    category: 'Tarnishing & Care',
    q: 'Can I wear my Silver Aura jewellery in the shower or during exercise?',
    a: 'While our solid 925 silver and rhodium shield withstand fresh water, we recommend removing rings and necklaces before swimming in chlorinated pools, applying perfumed lotions, or heavy gym workouts to maintain optimum mirror luster.',
  },
  {
    category: 'Sizing & Fit',
    q: 'How do I determine my ring size before purchasing?',
    a: 'We provide an interactive Size Guide on our website with millimeter measurements for diameter and circumference matching Pakistani/Indian and US sizing. If you receive a ring that feels slightly loose or snug, we offer a complimentary 7-day ring size exchange.',
  },
  {
    category: 'Delivery & Courier',
    q: 'What are the delivery times and charges across Pakistan?',
    a: 'Orders in Karachi are delivered within 24 to 48 hours. Orders to Lahore, Islamabad, Rawalpindi, Faisalabad, and other nationwide cities take 2 to 4 business days via TCS Express or Leopard Courier. Delivery is complimentary on all orders above PKR 5,000.',
  },
  {
    category: 'Delivery & Courier',
    q: 'Do you offer Cash on Delivery (COD)?',
    a: 'Yes, Cash on Delivery (COD) is available across all major cities and towns in Pakistan without any extra hidden charges.',
  },
  {
    category: 'Returns & Warranty',
    q: 'What is your return and exchange policy?',
    a: 'We offer a 7-day hassle-free exchange and return policy. If you are not completely enchanted with your piece, or need an alternate size, contact our concierge on WhatsApp (+92 300 8291925) for immediate assistance.',
  },
];

export const FAQPage: React.FC = () => {
  const { navigateTo, setIsSizeGuideOpen } = useShop();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Authenticity & Metal Purity', 'Tarnishing & Care', 'Sizing & Fit', 'Delivery & Courier', 'Returns & Warranty'];

  const filteredFaqs = FAQ_DATA.filter((item) =>
    selectedCategory === 'All' ? true : item.category === selectedCategory
  );

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#78716C] font-semibold block">
            Assistance & Guidance
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] max-w-lg mx-auto">
            Everything you need to know about our certified 925 sterling silver purity, rhodium plating, and nationwide insured delivery.
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-2 px-3.5 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1C1917] text-white'
                  : 'bg-white border border-[#E8E0D5] text-[#57534E] hover:border-[#1C1917]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E8E0D5] rounded-xs transition-colors overflow-hidden"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full py-4 sm:py-5 px-5 sm:px-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-serif-luxury text-lg sm:text-xl text-[#1C1917] font-medium leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#78716C] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#1C1917]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-[#57534E] leading-relaxed border-t border-[#F4EFEB] animate-in fade-in duration-150">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Concierge Prompt */}
        <div className="mt-14 p-6 bg-[#F4EFEB] border border-[#E8E0D5] rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-serif-luxury text-lg text-[#1C1917] font-medium">Still have questions?</h4>
            <p className="text-xs text-[#78716C]">
              Our silver specialists in Karachi are available via WhatsApp Concierge.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSizeGuideOpen(true)}
              className="py-2.5 px-4 bg-white border border-[#D6CEC5] text-xs uppercase tracking-wider font-medium text-[#1C1917] hover:bg-[#FAF8F5]"
            >
              Size Guide
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className="py-2.5 px-5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524]"
            >
              Contact Atelier
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
