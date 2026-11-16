import React, { useState, useEffect } from 'react';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import type { ActivePage, PromotionalBanner } from '../types';

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}

function useBannerNavigation() {
  const { navigateTo, categories } = useShop();

  const handleInternalLink = (rawLink: string) => {
    const link = rawLink.trim();
    if (!link) {
      navigateTo('shop', 'All');
      return;
    }

    const cleaned = link.replace(/^\/+/, '').replace(/^#/, '');
    const lower = cleaned.toLowerCase();

    if (lower.startsWith('shop:')) {
      const catQuery = cleaned.slice(5).trim();
      const matched = categories.find(
        (c) =>
          c.name.toLowerCase() === catQuery.toLowerCase() ||
          c.slug?.toLowerCase() === catQuery.toLowerCase()
      );
      navigateTo('shop', matched ? matched.name : catQuery || 'All');
      return;
    }

    if (lower.startsWith('category-')) {
      const slugOrKey = lower.replace('category-', '');
      const matched = categories.find(
        (c) =>
          c.slug?.toLowerCase() === slugOrKey ||
          c.name.toLowerCase().replace(/\s+/g, '-') === slugOrKey
      );
      navigateTo('shop', matched ? matched.name : 'All');
      return;
    }

    if (lower.startsWith('product-')) {
      window.location.hash = cleaned;
      return;
    }

    const allowedPages: ActivePage[] = ['home', 'shop', 'about', 'contact', 'faq', 'shipping'];
    if (allowedPages.includes(lower as ActivePage)) {
      navigateTo(lower as ActivePage);
      return;
    }

    navigateTo('shop', 'All');
  };

  return { handleInternalLink };
}

export const PromotionalBannerStrip: React.FC<{
  placement: 'home_banner' | 'collection_spotlight';
}> = ({ placement }) => {
  const { promotionalBanners } = useShop();
  const { handleInternalLink } = useBannerNavigation();

  const banners = promotionalBanners.filter((b) => b.placement === placement);
  if (banners.length === 0) return null;

  const isSpotlight = placement === 'collection_spotlight';

  return (
    <section
      className={`py-8 sm:py-12 ${
        isSpotlight ? 'bg-[#F4EFEB]/70 border-t border-[#E8E0D5]' : 'bg-[#FAF8F5]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid gap-6 ${
            banners.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
          }`}
        >
          {banners.map((banner: PromotionalBanner) => {
            const hasCta = Boolean(banner.ctaText.trim());
            const external = isExternalUrl(banner.ctaLink);

            return (
              <div
                key={banner.id}
                className="relative overflow-hidden bg-white border border-[#E8E0D5] shadow-xs grid grid-cols-1 md:grid-cols-12 items-center"
              >
                <div
                  className={`p-6 sm:p-8 lg:p-10 space-y-3 ${
                    banner.imageUrl ? 'md:col-span-7' : 'md:col-span-12'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-[#78716C] font-semibold">
                    <Sparkles className="w-3 h-3" />
                    <span>
                      {isSpotlight ? 'Collection Spotlight' : 'Atelier Campaign'}
                    </span>
                  </span>
                  <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal leading-tight">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-xl">
                      {banner.subtitle}
                    </p>
                  )}

                  {hasCta && (
                    <div className="pt-2">
                      {external ? (
                        <a
                          href={banner.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 py-3 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium transition-colors"
                        >
                          <span>{banner.ctaText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleInternalLink(banner.ctaLink)}
                          className="inline-flex items-center gap-2 py-3 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium transition-colors cursor-pointer"
                        >
                          <span>{banner.ctaText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {banner.imageUrl && (
                  <div className="md:col-span-5 h-56 md:h-full min-h-[220px] bg-[#E8E0D5] overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const PromotionalPopupModal: React.FC = () => {
  const { promotionalBanners } = useShop();
  const { handleInternalLink } = useBannerNavigation();
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  const activePopup = promotionalBanners.find((b) => b.placement === 'popup') ?? null;

  useEffect(() => {
    if (!activePopup) return;
    try {
      if (sessionStorage.getItem(`silver_aura_popup_${activePopup.id}`) === '1') {
        setDismissedId(activePopup.id);
      }
    } catch {
      // ignore storage availability errors
    }
  }, [activePopup]);

  if (!activePopup || dismissedId === activePopup.id) {
    return null;
  }

  const handleDismiss = () => {
    setDismissedId(activePopup.id);
    try {
      sessionStorage.setItem(`silver_aura_popup_${activePopup.id}`, '1');
    } catch {
      // ignore storage errors
    }
  };

  const external = isExternalUrl(activePopup.ctaLink);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative bg-[#FAF8F5] border border-[#E8E0D5] max-w-lg w-full shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close promotional popup"
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 border border-[#E8E0D5] flex items-center justify-center text-[#57534E] hover:text-[#1C1917] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {activePopup.imageUrl && (
          <div className="aspect-[16/9] bg-[#E8E0D5] overflow-hidden">
            <img
              src={activePopup.imageUrl}
              alt={activePopup.title}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="p-6 sm:p-8 text-center space-y-3">
          <span className="text-[10px] uppercase tracking-[0.22em] text-[#78716C] font-semibold block">
            Silver Aura Privilege
          </span>
          <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            {activePopup.title}
          </h3>
          {activePopup.subtitle && (
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              {activePopup.subtitle}
            </p>
          )}

          {activePopup.ctaText && (
            <div className="pt-2 flex justify-center">
              {external ? (
                <a
                  href={activePopup.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDismiss}
                  className="inline-flex items-center gap-2 py-3 px-7 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium transition-colors"
                >
                  <span>{activePopup.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleDismiss();
                    handleInternalLink(activePopup.ctaLink);
                  }}
                  className="inline-flex items-center gap-2 py-3 px-7 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium transition-colors cursor-pointer"
                >
                  <span>{activePopup.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
