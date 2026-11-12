import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { REVIEWS } from '../data/reviews';

export const ReviewsSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16 space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Client Impressions
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
            Loved Across Pakistan
          </h2>
          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[#57534E]">
            <div className="flex text-[#1C1917]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#1C1917]" />
              ))}
            </div>
            <span><strong>4.9 / 5.0</strong> based on 450+ verified orders</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {REVIEWS.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="p-6 sm:p-7 bg-white border border-[#E8E0D5] rounded-xs shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#1C1917]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#1C1917]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#A8A29E]">{review.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#F4EFEB] flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-medium text-[#1C1917]">{review.author}</h4>
                  <span className="text-[11px] text-[#78716C]">{review.city}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Client</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
