import React, { useState } from 'react';
import { X, Ruler, HelpCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useShop();
  const [activeTab, setActiveTab] = useState<'rings' | 'necklaces' | 'bracelets'>('rings');

  if (!isSizeGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSizeGuideOpen(false)}
      />

      <div className="relative bg-[#FAF8F5] border border-[#E8E0D5] shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-4 border-b border-[#E8E0D5]">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#78716C] font-semibold mb-1">
              <Ruler className="w-3.5 h-3.5" />
              <span>Studio Measurement Guide</span>
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-medium">
              Silver Aura Sizing Chart
            </h2>
          </div>
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="p-1 text-[#78716C] hover:text-[#1C1917]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls (Clean segmented functional buttons) */}
        <div className="flex items-center gap-1 p-1 bg-[#F4EFEB] rounded-xs mt-6 mb-6">
          <button
            onClick={() => setActiveTab('rings')}
            className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
              activeTab === 'rings' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Ring Sizing
          </button>
          <button
            onClick={() => setActiveTab('necklaces')}
            className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
              activeTab === 'necklaces' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Necklace Lengths
          </button>
          <button
            onClick={() => setActiveTab('bracelets')}
            className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
              activeTab === 'bracelets' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Bracelets & Bangles
          </button>
        </div>

        {/* Tab Content: Rings */}
        {activeTab === 'rings' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E8E0D5]">
                <thead className="bg-[#F4EFEB] text-[#1C1917] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 border-b border-[#E8E0D5]">US Size</th>
                    <th className="py-2.5 px-3 border-b border-[#E8E0D5]">Pakistani / Indian</th>
                    <th className="py-2.5 px-3 border-b border-[#E8E0D5]">Inside Diameter (mm)</th>
                    <th className="py-2.5 px-3 border-b border-[#E8E0D5]">Circumference (mm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D5] tabular-nums text-[#44403C]">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#1C1917]">5</td>
                    <td className="py-2 px-3">10</td>
                    <td className="py-2 px-3">15.7 mm</td>
                    <td className="py-2 px-3">49.3 mm</td>
                  </tr>
                  <tr className="bg-[#FAF8F5]">
                    <td className="py-2 px-3 font-semibold text-[#1C1917]">6</td>
                    <td className="py-2 px-3">12</td>
                    <td className="py-2 px-3">16.5 mm</td>
                    <td className="py-2 px-3">51.9 mm</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#1C1917]">7 (Most Popular)</td>
                    <td className="py-2 px-3">14</td>
                    <td className="py-2 px-3">17.3 mm</td>
                    <td className="py-2 px-3">54.4 mm</td>
                  </tr>
                  <tr className="bg-[#FAF8F5]">
                    <td className="py-2 px-3 font-semibold text-[#1C1917]">8</td>
                    <td className="py-2 px-3">16</td>
                    <td className="py-2 px-3">18.1 mm</td>
                    <td className="py-2 px-3">57.0 mm</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#1C1917]">9</td>
                    <td className="py-2 px-3">18</td>
                    <td className="py-2 px-3">18.9 mm</td>
                    <td className="py-2 px-3">59.5 mm</td>
                  </tr>
                  <tr className="bg-[#FAF8F5]">
                    <td className="py-2 px-3 font-semibold text-[#1C1917]">10</td>
                    <td className="py-2 px-3">20</td>
                    <td className="py-2 px-3">19.8 mm</td>
                    <td className="py-2 px-3">62.1 mm</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-[#F4EFEB] p-4 text-xs text-[#57534E] space-y-2">
              <h4 className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#78716C]" />
                How to measure at home:
              </h4>
              <p>
                1. Wrap a strip of paper or non-stretchy thread snugly around your finger base.
              </p>
              <p>
                2. Mark the exact spot where the paper overlaps and measure the length in millimeters with a ruler.
              </p>
              <p>
                3. Compare your measurement to the <strong>Circumference (mm)</strong> column above.
              </p>
              <p className="text-[11px] text-[#78716C] italic pt-1">
                Tip: If your knuckle is significantly larger than your finger base, measure both and choose a size midway.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content: Necklaces */}
        {activeTab === 'necklaces' && (
          <div className="space-y-4 text-xs text-[#57534E]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#F4EFEB] border border-[#E8E0D5]">
                <h4 className="font-serif-luxury text-base text-[#1C1917] font-semibold">14–16 Inch (Choker)</h4>
                <p className="mt-1 text-[#78716C]">
                  Rests closely along the base of the throat. Ideal for open-collar shirts, V-necks, and scoop necklines.
                </p>
              </div>
              <div className="p-4 bg-[#F4EFEB] border border-[#E8E0D5]">
                <h4 className="font-serif-luxury text-base text-[#1C1917] font-semibold">18 Inch (Princess)</h4>
                <p className="mt-1 text-[#78716C]">
                  The most versatile universal length. Hangs just below the collarbone, complementing both crew necks and deep cuts.
                </p>
              </div>
              <div className="p-4 bg-[#F4EFEB] border border-[#E8E0D5]">
                <h4 className="font-serif-luxury text-base text-[#1C1917] font-semibold">20–24 Inch (Matinee)</h4>
                <p className="mt-1 text-[#78716C]">
                  Falls above the bustline. Excellent for layering with shorter chains and wearing over sweaters or kurtas.
                </p>
              </div>
            </div>
            <p className="text-center text-[#78716C] text-[11px] pt-2">
              Note: Most Silver Aura necklaces feature a complimentary 2-inch extender chain for tailored styling.
            </p>
          </div>
        )}

        {/* Tab Content: Bracelets */}
        {activeTab === 'bracelets' && (
          <div className="space-y-4 text-xs text-[#57534E]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E8E0D5]">
                <thead className="bg-[#F4EFEB] text-[#1C1917] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 border-b border-[#E8E0D5]">Size</th>
                    <th className="py-2.5 px-3 border-b border-[#E8E0D5]">Wrist Circumference</th>
                    <th className="py-2.5 px-3 border-b border-[#E8E0D5]">Recommended Fit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D5] text-[#44403C]">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Small (6.5")</td>
                    <td className="py-2.5 px-3">5.5" – 6.0" (14 – 15 cm)</td>
                    <td className="py-2.5 px-3">Snug wrist or petite frame</td>
                  </tr>
                  <tr className="bg-[#FAF8F5]">
                    <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Medium (7.0")</td>
                    <td className="py-2.5 px-3">6.0" – 6.6" (15.5 – 17 cm)</td>
                    <td className="py-2.5 px-3">Standard universal size</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#1C1917]">Large (7.5")</td>
                    <td className="py-2.5 px-3">6.7" – 7.2" (17 – 18.5 cm)</td>
                    <td className="py-2.5 px-3">Relaxed drape on wrist</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-[#E8E0D5] flex items-center justify-between text-xs text-[#78716C]">
          <span>Still unsure? WhatsApp our concierge for personalized size guidance.</span>
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="py-2 px-4 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
