import React from 'react';
import { Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Toast: React.FC = () => {
  const { toast } = useShop();

  if (!toast || !toast.visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#1C1917] text-[#FAF8F5] py-3 px-5 border border-[#44403C] shadow-2xl flex items-center gap-3 text-xs">
        <Sparkles className="w-3.5 h-3.5 text-[#D1D5DB] shrink-0" />
        <span className="font-medium tracking-wide">{toast.message}</span>
      </div>
    </div>
  );
};
