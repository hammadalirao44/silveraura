import React, { useState } from 'react';
import { X, ShieldCheck, Truck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { homepageContent, promotionalBanners, storeSettings, navigateTo } = useShop();

  if (!isVisible) return null;

  const topBarBanner = promotionalBanners.find((b) => b.placement === 'top_bar');
  const currency = storeSettings.currencySymbol || storeSettings.currency || 'PKR';
  const freeThreshold = storeSettings.freeShippingThreshold ?? 5000;

  const fallbackMessage = `Complimentary Insured Courier Delivery Across Pakistan on Orders Over ${currency} ${freeThreshold.toLocaleString()}`;

  const announcementMessage =
    topBarBanner?.title || homepageContent.announcementText || fallbackMessage;

  return (
    <div className="bg-[#1C1917] text-[#FAF8F5] text-xs py-2 px-4 border-b border-[#292524] relative z-40 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-6 text-center tracking-wide">
          <span className="flex items-center gap-1.5 font-medium">
            <Truck className="w-3.5 h-3.5 text-[#D1D5DB] inline shrink-0" />
            <span>{announcementMessage}</span>
            {topBarBanner?.ctaText && (
              topBarBanner.ctaLink && /^https?:\/\//i.test(topBarBanner.ctaLink) ? (
                <a
                  href={topBarBanner.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 underline underline-offset-2 text-white hover:text-[#D6CEC5]"
                >
                  {topBarBanner.ctaText}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => navigateTo('shop', 'All')}
                  className="ml-2 underline underline-offset-2 text-white hover:text-[#D6CEC5] cursor-pointer"
                >
                  {topBarBanner.ctaText}
                </button>
              )
            )}
          </span>
          <span className="hidden md:inline text-[#78716C]">|</span>
          <span className="hidden md:flex items-center gap-1.5 text-[#D6D3D1]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D1D5DB] inline shrink-0" />
            <span>100% Certified Solid 925 Sterling Silver</span>
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss banner"
          className="text-[#A8A29E] hover:text-white transition-colors p-1 -mr-1 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
