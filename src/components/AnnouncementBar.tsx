import React, { useState } from 'react';
import { X, ShieldCheck, Truck } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { websiteContent } = useAdmin();

  if (!isVisible) return null;

  const announcementMessage =
    websiteContent?.announcementText ||
    'Complimentary Insured Courier Delivery Across Pakistan on Orders Over PKR 5,000';

  return (
    <div className="bg-[#1C1917] text-[#FAF8F5] text-xs py-2 px-4 border-b border-[#292524] relative z-40 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-6 text-center tracking-wide">
          <span className="flex items-center gap-1.5 font-medium">
            <Truck className="w-3.5 h-3.5 text-[#D1D5DB] inline shrink-0" />
            <span>{announcementMessage}</span>
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
          className="text-[#A8A29E] hover:text-white transition-colors p-1 -mr-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
