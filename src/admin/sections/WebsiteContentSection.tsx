import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Save,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  Layers,
  Package,
  Calendar,
  Info,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { BannerPlacement, PromotionalBanner } from '../../types';
import {
  createAdminPromotionalBanner,
  deleteAdminPromotionalBanner,
  fetchAdminWebsiteContentData,
  isBannerCurrentlyScheduled,
  toggleAdminPromotionalBannerStatus,
  updateAdminHomepageContent,
  updateAdminPromotionalBanner,
} from '../../services/siteContentService';
import { validateMediaFile } from '../../services/storageService';

const PLACEMENT_LABELS: Record<BannerPlacement, string> = {
  home_banner: 'Homepage Mid Banner',
  collection_spotlight: 'Collection Spotlight',
  top_bar: 'Top Announcement Bar',
  popup: 'Promotional Popup',
};

function toDateTimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fromDateTimeLocalValue(val: string): string | null {
  if (!val.trim()) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export const WebsiteContentSection: React.FC = () => {
  const { isSupabaseReady, supabaseError, showAdminToast, setActiveSection } = useAdmin();
  const { navigateTo, categories } = useShop();

  const [activeTab, setActiveTab] = useState<'homepage' | 'banners' | 'catalog'>('homepage');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingHome, setSavingHome] = useState<boolean>(false);
  const [showHeroPreview, setShowHeroPreview] = useState<boolean>(false);

  // Homepage content form state (aligned strictly with `homepage_content` table)
  const [originalHeroImageUrl, setOriginalHeroImageUrl] = useState<string>('');
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroLocalPreview, setHeroLocalPreview] = useState<string>('');
  const [homeForm, setHomeForm] = useState({
    heroSubtitle: '',
    heroTitle: '',
    heroTitleItalic: '',
    heroDescription: '',
    heroImageUrl: '',
    heroCtaText: '',
    heroSecondaryCtaText: '',
    announcementText: '',
    announcementDeliveryThreshold: 5000,
    societyDiscountCode: 'AURA10',
    aboutText: '',
    contactAddress: '',
    contactWhatsApp: '',
    contactEmail: '',
    visitingHours: '',
  });

  // Promotional banners state
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [bannerFilter, setBannerFilter] = useState<'All' | BannerPlacement>('All');
  const [busyBannerId, setBusyBannerId] = useState<string | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromotionalBanner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<PromotionalBanner | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [deletingBannerBusy, setDeletingBannerBusy] = useState(false);
  const [bannerFormError, setBannerFormError] = useState<string | null>(null);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerLocalPreview, setBannerLocalPreview] = useState<string>('');
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    ctaText: 'Shop Collection',
    ctaLink: 'shop',
    imageUrl: '',
    placement: 'home_banner' as BannerPlacement,
    isActive: true,
    sortOrder: 0,
    startsAtLocal: '',
    endsAtLocal: '',
  });

  const loadContent = useCallback(async () => {
    if (!isSupabaseReady) {
      setLoading(false);
      setLoadError(
        supabaseError ||
          'Supabase environment variables are not configured. Website Content management requires a connected Supabase project.'
      );
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const { homepageContent, banners: bannerList } =
        await fetchAdminWebsiteContentData();
      setHomeForm({
        heroSubtitle: homepageContent.heroSubtitle,
        heroTitle: homepageContent.heroTitle,
        heroTitleItalic: homepageContent.heroTitleItalic ?? '',
        heroDescription: homepageContent.heroDescription,
        heroImageUrl: homepageContent.heroImage,
        heroCtaText: homepageContent.heroCtaText ?? 'Shop Collection',
        heroSecondaryCtaText: homepageContent.heroSecondaryCtaText ?? '',
        announcementText: homepageContent.announcementText,
        announcementDeliveryThreshold:
          homepageContent.announcementDeliveryThreshold ?? 5000,
        societyDiscountCode: homepageContent.societyDiscountCode ?? 'AURA10',
        aboutText: homepageContent.aboutText ?? '',
        contactAddress: homepageContent.contactAddress ?? '',
        contactWhatsApp: homepageContent.contactWhatsApp ?? '',
        contactEmail: homepageContent.contactEmail ?? '',
        visitingHours: homepageContent.visitingHours ?? '',
      });
      setOriginalHeroImageUrl(homepageContent.heroImage);
      setHeroFile(null);
      setHeroLocalPreview('');
      setBanners(bannerList);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to fetch website content.';
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [isSupabaseReady, supabaseError]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  // Clean up object URLs on unmount/change
  useEffect(() => {
    return () => {
      if (heroLocalPreview.startsWith('blob:')) {
        URL.revokeObjectURL(heroLocalPreview);
      }
    };
  }, [heroLocalPreview]);

  useEffect(() => {
    return () => {
      if (bannerLocalPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerLocalPreview);
      }
    };
  }, [bannerLocalPreview]);

  const notifyStorefrontSiteSync = () => {
    window.dispatchEvent(new CustomEvent('silver_aura_site_updated'));
  };

  const handleHeroFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validationError = validateMediaFile(file);
    if (validationError) {
      showAdminToast(validationError, 'error');
      return;
    }

    if (heroLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(heroLocalPreview);
    }
    setHeroFile(file);
    setHeroLocalPreview(URL.createObjectURL(file));
  };

  const handleClearHeroImage = () => {
    if (heroLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(heroLocalPreview);
    }
    setHeroFile(null);
    setHeroLocalPreview('');
    setHomeForm((prev) => ({ ...prev, heroImageUrl: '' }));
  };

  const handleSaveHomepage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHome(true);
    try {
      const updated = await updateAdminHomepageContent({
        heroSubtitle: homeForm.heroSubtitle,
        heroTitle: homeForm.heroTitle,
        heroTitleItalic: homeForm.heroTitleItalic,
        heroDescription: homeForm.heroDescription,
        heroImageUrl: homeForm.heroImageUrl,
        heroImageFile: heroFile,
        previousHeroImageUrl: originalHeroImageUrl,
        heroCtaText: homeForm.heroCtaText,
        heroSecondaryCtaText: homeForm.heroSecondaryCtaText,
        announcementText: homeForm.announcementText,
        announcementDeliveryThreshold: Number(homeForm.announcementDeliveryThreshold),
        societyDiscountCode: homeForm.societyDiscountCode,
        aboutText: homeForm.aboutText,
        contactAddress: homeForm.contactAddress,
        contactWhatsApp: homeForm.contactWhatsApp,
        contactEmail: homeForm.contactEmail,
        visitingHours: homeForm.visitingHours,
      });

      setHomeForm((prev) => ({
        ...prev,
        heroImageUrl: updated.heroImage,
      }));
      setOriginalHeroImageUrl(updated.heroImage);
      setHeroFile(null);
      if (heroLocalPreview.startsWith('blob:')) {
        URL.revokeObjectURL(heroLocalPreview);
      }
      setHeroLocalPreview('');

      notifyStorefrontSiteSync();
      showAdminToast('Homepage & storefront content published to Supabase.');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to save website content.';
      showAdminToast(msg, 'error');
    } finally {
      setSavingHome(false);
    }
  };

  // Banner CRUD handlers
  const openAddBannerModal = () => {
    setEditingBanner(null);
    setBannerFormError(null);
    setBannerFile(null);
    if (bannerLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerLocalPreview);
    }
    setBannerLocalPreview('');
    setBannerForm({
      title: '',
      subtitle: '',
      ctaText: 'Shop Collection',
      ctaLink: 'shop',
      imageUrl: '',
      placement: 'home_banner',
      isActive: true,
      sortOrder: banners.length + 1,
      startsAtLocal: '',
      endsAtLocal: '',
    });
    setIsBannerModalOpen(true);
  };

  const openEditBannerModal = (b: PromotionalBanner) => {
    setEditingBanner(b);
    setBannerFormError(null);
    setBannerFile(null);
    if (bannerLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerLocalPreview);
    }
    setBannerLocalPreview('');
    setBannerForm({
      title: b.title,
      subtitle: b.subtitle,
      ctaText: b.ctaText,
      ctaLink: b.ctaLink,
      imageUrl: b.imageUrl,
      placement: b.placement,
      isActive: b.isActive,
      sortOrder: b.sortOrder,
      startsAtLocal: toDateTimeLocalValue(b.startsAt),
      endsAtLocal: toDateTimeLocalValue(b.endsAt),
    });
    setIsBannerModalOpen(true);
  };

  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validationError = validateMediaFile(file);
    if (validationError) {
      setBannerFormError(validationError);
      return;
    }

    setBannerFormError(null);
    if (bannerLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerLocalPreview);
    }
    setBannerFile(file);
    setBannerLocalPreview(URL.createObjectURL(file));
  };

  const handleClearBannerImage = () => {
    if (bannerLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerLocalPreview);
    }
    setBannerFile(null);
    setBannerLocalPreview('');
    setBannerForm((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerFormError(null);

    const payload = {
      title: bannerForm.title,
      subtitle: bannerForm.subtitle,
      ctaText: bannerForm.ctaText,
      ctaLink: bannerForm.ctaLink,
      imageUrl: bannerForm.imageUrl,
      imageFile: bannerFile,
      placement: bannerForm.placement,
      isActive: bannerForm.isActive,
      sortOrder: Number(bannerForm.sortOrder),
      startsAt: fromDateTimeLocalValue(bannerForm.startsAtLocal),
      endsAt: fromDateTimeLocalValue(bannerForm.endsAtLocal),
    };

    setSavingBanner(true);
    try {
      if (editingBanner) {
        await updateAdminPromotionalBanner(
          editingBanner.id,
          payload,
          editingBanner.imageUrl
        );
        showAdminToast(`Updated promotional banner "${payload.title}".`);
      } else {
        await createAdminPromotionalBanner(payload);
        showAdminToast(`Created promotional banner "${payload.title}".`);
      }
      setIsBannerModalOpen(false);
      await loadContent();
      notifyStorefrontSiteSync();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to save promotional banner.';
      setBannerFormError(msg);
    } finally {
      setSavingBanner(false);
    }
  };

  const handleToggleBannerStatus = async (b: PromotionalBanner) => {
    const nextActive = !b.isActive;
    setBusyBannerId(b.id);
    try {
      await toggleAdminPromotionalBannerStatus(b.id, nextActive);
      setBanners((prev) =>
        prev.map((item) =>
          item.id === b.id ? { ...item, isActive: nextActive } : item
        )
      );
      notifyStorefrontSiteSync();
      showAdminToast(
        `Banner "${b.title}" ${nextActive ? 'activated' : 'deactivated'}.`
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to toggle banner status.';
      showAdminToast(msg, 'error');
    } finally {
      setBusyBannerId(null);
    }
  };

  const handleConfirmDeleteBanner = async () => {
    if (!deletingBanner) return;
    setDeletingBannerBusy(true);
    try {
      await deleteAdminPromotionalBanner(
        deletingBanner.id,
        deletingBanner.imageUrl
      );
      setBanners((prev) => prev.filter((b) => b.id !== deletingBanner.id));
      notifyStorefrontSiteSync();
      showAdminToast(`Deleted banner "${deletingBanner.title}".`);
      setDeletingBanner(null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to delete promotional banner.';
      showAdminToast(msg, 'error');
    } finally {
      setDeletingBannerBusy(false);
    }
  };

  const effectiveHeroPreviewImage = heroLocalPreview || homeForm.heroImageUrl;
  const effectiveBannerPreviewImage = bannerLocalPreview || bannerForm.imageUrl;

  const filteredBanners = banners.filter(
    (b) => bannerFilter === 'All' || b.placement === bannerFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Brand Experience &amp; Editorial Control
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Website Content Management
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            Manage homepage hero copy, announcement bar, atelier contact details, and
            promotional banners in Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadContent()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#D6CEC5] bg-white text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#F4EFEB] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#D6CEC5] bg-white text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#F4EFEB] transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Preview Live Storefront</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to Load Website Content</p>
              <p className="text-rose-700 mt-0.5">{loadError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadContent()}
            className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 text-[11px] uppercase tracking-wider font-semibold hover:bg-rose-100 cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E0D5] pb-3 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('homepage')}
          className={`px-4 py-2 uppercase tracking-wider font-semibold border transition-colors cursor-pointer ${
            activeTab === 'homepage'
              ? 'bg-[#1C1917] text-white border-[#1C1917]'
              : 'bg-white text-[#57534E] border-[#E8E0D5] hover:text-[#1C1917]'
          }`}
        >
          Hero, Brand &amp; Footer Copy
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2 uppercase tracking-wider font-semibold border transition-colors cursor-pointer ${
            activeTab === 'banners'
              ? 'bg-[#1C1917] text-white border-[#1C1917]'
              : 'bg-white text-[#57534E] border-[#E8E0D5] hover:text-[#1C1917]'
          }`}
        >
          Promotional Banners ({banners.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 uppercase tracking-wider font-semibold border transition-colors cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-[#1C1917] text-white border-[#1C1917]'
              : 'bg-white text-[#57534E] border-[#E8E0D5] hover:text-[#1C1917]'
          }`}
        >
          Collections, Showcases &amp; Schema Notes
        </button>
      </div>

      {loading && !homeForm.heroTitle ? (
        <div className="bg-white border border-[#E8E0D5] p-12 flex items-center justify-center gap-2.5 text-xs text-[#57534E]">
          <Loader2 className="w-4 h-4 animate-spin text-[#1C1917]" />
          <span>Loading live website content from Supabase...</span>
        </div>
      ) : activeTab === 'homepage' ? (
        <form onSubmit={(e) => void handleSaveHomepage(e)} className="space-y-6">
          {/* 1. Announcement Bar & Society Discount */}
          <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F4EFEB]">
              <Globe className="w-4 h-4 text-[#1C1917]" />
              <h3 className="font-serif-luxury text-lg text-[#1C1917]">
                Announcement Bar &amp; Newsletter Privilege
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
              <div className="md:col-span-6 space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Top Announcement Ticker Message *
                </label>
                <input
                  type="text"
                  required
                  value={homeForm.announcementText}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, announcementText: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
                <span className="text-[10px] text-[#78716C] block">
                  Shown in the top announcement bar across customer pages (unless an active
                  Top Bar promotional banner overrides it).
                </span>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Announcement Delivery Threshold (PKR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={homeForm.announcementDeliveryThreshold}
                  onChange={(e) =>
                    setHomeForm({
                      ...homeForm,
                      announcementDeliveryThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Society Newsletter Promo Code
                </label>
                <input
                  type="text"
                  value={homeForm.societyDiscountCode}
                  onChange={(e) =>
                    setHomeForm({
                      ...homeForm,
                      societyDiscountCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="AURA10"
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] font-mono uppercase text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
                <span className="text-[10px] text-[#78716C] block">
                  Displayed after footer newsletter signup.
                </span>
              </div>
            </div>
          </div>

          {/* 2. Hero Campaign Section + Live Preview */}
          <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F4EFEB]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1C1917]" />
                <h3 className="font-serif-luxury text-lg text-[#1C1917]">
                  Homepage Hero Campaign
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHeroPreview((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D6CEC5] bg-[#FAF8F5] hover:bg-[#F4EFEB] text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] cursor-pointer"
              >
                {showHeroPreview ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide Preview</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Hero</span>
                  </>
                )}
              </button>
            </div>

            {showHeroPreview && (
              <div className="p-5 bg-[#FAF8F5] border border-[#E8E0D5] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6 space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#78716C] font-semibold block">
                    {homeForm.heroSubtitle || '925 Sterling Silver Atelier'}
                  </span>
                  <h4 className="font-serif-luxury text-3xl text-[#1C1917] leading-tight">
                    {homeForm.heroTitle || 'Pure Silver, Timeless Allure.'}{' '}
                    {homeForm.heroTitleItalic && (
                      <span className="italic font-light">
                        {homeForm.heroTitleItalic}
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-[#57534E] leading-relaxed">
                    {homeForm.heroDescription}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-4 py-2 bg-[#1C1917] text-white text-[10px] uppercase tracking-wider">
                      {homeForm.heroCtaText || 'Shop Collection'}
                    </span>
                    {homeForm.heroSecondaryCtaText && (
                      <span className="px-4 py-2 border border-[#D6CEC5] bg-white text-[#1C1917] text-[10px] uppercase tracking-wider">
                        {homeForm.heroSecondaryCtaText}
                      </span>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-6 aspect-[16/9] bg-[#E8E0D5] overflow-hidden border border-[#E8E0D5]">
                  {effectiveHeroPreviewImage ? (
                    <img
                      src={effectiveHeroPreviewImage}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#78716C]">
                      Default storefront hero image will be used
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Eyebrow / Subtitle
                </label>
                <input
                  type="text"
                  value={homeForm.heroSubtitle}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, heroSubtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Main Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={homeForm.heroTitle}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, heroTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Headline Italic Accent (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Crafted for Generations."
                  value={homeForm.heroTitleItalic}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, heroTitleItalic: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Hero Narrative Description
                </label>
                <textarea
                  rows={2}
                  value={homeForm.heroDescription}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, heroDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Primary CTA Text (→ All Jewellery)
                </label>
                <input
                  type="text"
                  value={homeForm.heroCtaText}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, heroCtaText: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Secondary CTA Text (→ Jewellery Sets, leave blank to hide)
                </label>
                <input
                  type="text"
                  value={homeForm.heroSecondaryCtaText}
                  onChange={(e) =>
                    setHomeForm({
                      ...homeForm,
                      heroSecondaryCtaText: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              {/* Hero Image Upload (silver-aura-media/site) */}
              <div className="sm:col-span-3 space-y-2 pt-2">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px] block">
                  Hero Campaign Photography (Max 5 MB · JPEG, PNG, WebP, AVIF)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-[#D6CEC5] bg-[#FAF8F5]">
                  <div className="w-36 h-24 bg-white border border-[#E8E0D5] overflow-hidden shrink-0 flex items-center justify-center">
                    {effectiveHeroPreviewImage ? (
                      <img
                        src={effectiveHeroPreviewImage}
                        alt="Hero campaign"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[#A8A29E]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer px-3.5 py-1.5 bg-[#1C1917] text-white text-[11px] uppercase tracking-wider font-medium hover:bg-[#292524] inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {effectiveHeroPreviewImage
                            ? 'Replace Image'
                            : 'Upload Hero Image'}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={handleHeroFileSelect}
                          className="hidden"
                        />
                      </label>

                      {effectiveHeroPreviewImage && (
                        <button
                          type="button"
                          onClick={handleClearHeroImage}
                          className="px-3 py-1.5 border border-[#D6CEC5] bg-white text-rose-700 hover:bg-rose-50 text-[11px] uppercase tracking-wider font-medium cursor-pointer"
                        >
                          Remove Image
                        </button>
                      )}

                      {heroFile && (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Staged for upload: {heroFile.name}
                        </span>
                      )}
                    </div>

                    <input
                      type="url"
                      value={homeForm.heroImageUrl}
                      onChange={(e) => {
                        setHeroFile(null);
                        setHeroLocalPreview('');
                        setHomeForm({ ...homeForm, heroImageUrl: e.target.value });
                      }}
                      placeholder="https://... or upload an image to silver-aura-media"
                      className="w-full px-2.5 py-1.5 border border-[#E8E0D5] bg-white text-[#1C1917]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Brand Story & Atelier Concierge Details */}
          <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F4EFEB]">
              <Globe className="w-4 h-4 text-[#1C1917]" />
              <h3 className="font-serif-luxury text-lg text-[#1C1917]">
                Brand Story, Footer &amp; Atelier Contact Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Brand Story / About Copy (Homepage &amp; About Page)
                </label>
                <textarea
                  rows={3}
                  value={homeForm.aboutText}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, aboutText: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Flagship Studio Address (Footer &amp; Contact Page)
                </label>
                <input
                  type="text"
                  value={homeForm.contactAddress}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, contactAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Concierge WhatsApp / Phone
                </label>
                <input
                  type="text"
                  value={homeForm.contactWhatsApp}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, contactWhatsApp: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Concierge Email
                </label>
                <input
                  type="email"
                  value={homeForm.contactEmail}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, contactEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Atelier Visiting Hours
                </label>
                <input
                  type="text"
                  value={homeForm.visitingHours}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, visitingHours: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={savingHome || !isSupabaseReady}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#292524] shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {savingHome ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {savingHome ? 'Publishing...' : 'Publish Content to Storefront'}
              </span>
            </button>
          </div>
        </form>
      ) : activeTab === 'banners' ? (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#78716C] font-semibold uppercase tracking-wider text-[10px]">
                Placement:
              </span>
              <select
                value={bannerFilter}
                onChange={(e) =>
                  setBannerFilter(e.target.value as 'All' | BannerPlacement)
                }
                className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              >
                <option value="All">All Placements ({banners.length})</option>
                <option value="home_banner">Homepage Mid Banner</option>
                <option value="collection_spotlight">Collection Spotlight</option>
                <option value="top_bar">Top Announcement Bar</option>
                <option value="popup">Promotional Popup</option>
              </select>
            </div>

            <button
              type="button"
              onClick={openAddBannerModal}
              disabled={!isSupabaseReady}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Promotional Banner</span>
            </button>
          </div>

          {filteredBanners.length === 0 ? (
            <div className="bg-white border border-[#E8E0D5] p-12 text-center space-y-2">
              <ImageIcon className="w-7 h-7 text-[#A8A29E] mx-auto stroke-[1.5]" />
              <p className="text-xs font-semibold text-[#1C1917]">
                {banners.length === 0
                  ? 'No promotional banners created yet'
                  : 'No banners match the selected placement'}
              </p>
              <p className="text-[11px] text-[#78716C] max-w-md mx-auto">
                Create homepage campaign banners, collection spotlights, top bar promos, or
                scheduled popups linked to any storefront collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredBanners.map((b) => {
                const isLive = isBannerCurrentlyScheduled(b);
                const isBusy = busyBannerId === b.id;

                return (
                  <div
                    key={b.id}
                    className="bg-white border border-[#E8E0D5] shadow-xs overflow-hidden flex flex-col justify-between"
                  >
                    {b.imageUrl && (
                      <div className="h-40 bg-[#FAF8F5] border-b border-[#E8E0D5] overflow-hidden">
                        <img
                          src={b.imageUrl}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-[#FAF8F5] border border-[#E8E0D5] text-[#1C1917]">
                              {PLACEMENT_LABELS[b.placement]}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-mono bg-stone-50 border border-stone-200 text-[#57534E]">
                              Order #{b.sortOrder}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleToggleBannerStatus(b)}
                            className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border cursor-pointer disabled:opacity-50 ${
                              b.isActive
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            {isBusy ? '...' : b.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </div>

                        <h4 className="font-serif-luxury text-lg text-[#1C1917]">
                          {b.title}
                        </h4>
                        {b.subtitle && (
                          <p className="text-[#57534E] leading-relaxed">{b.subtitle}</p>
                        )}
                      </div>

                      <div className="space-y-2 pt-3 border-t border-[#F4EFEB]">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#78716C]">
                          <span>
                            CTA:{' '}
                            <strong className="text-[#1C1917]">
                              {b.ctaText || 'None'}
                            </strong>{' '}
                            {b.ctaLink && (
                              <span className="font-mono text-[10px]">
                                ({b.ctaLink})
                              </span>
                            )}
                          </span>

                          <span
                            className={`text-[10px] uppercase tracking-wider font-semibold ${
                              isLive ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {isLive
                              ? 'Live on Storefront'
                              : b.isActive
                              ? 'Outside Schedule Window'
                              : 'Hidden'}
                          </span>
                        </div>

                        {(b.startsAt || b.endsAt) && (
                          <div className="text-[10px] text-[#78716C] flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {b.startsAt
                                ? `From ${new Date(b.startsAt).toLocaleString()}`
                                : 'Immediate'}{' '}
                              →{' '}
                              {b.endsAt
                                ? `Until ${new Date(b.endsAt).toLocaleString()}`
                                : 'No expiry'}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => openEditBannerModal(b)}
                            className="px-2.5 py-1.5 border border-[#E8E0D5] text-[#1C1917] hover:bg-[#FAF8F5] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingBanner(b)}
                            className="px-2.5 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Catalog-Driven Storefront Sections & Schema Capabilities */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white border border-[#E8E0D5] p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F4EFEB]">
              <Layers className="w-4 h-4 text-[#1C1917]" />
              <h3 className="font-serif-luxury text-lg text-[#1C1917]">
                Featured Collections Grid
              </h3>
            </div>
            <p className="text-[#57534E] leading-relaxed">
              The storefront “Shop by Category” showcase renders active collections from
              your Supabase <code className="font-mono">categories</code> table ordered
              by <code className="font-mono">display_order</code>. Manage titles,
              taglines, photography, visibility, and sort order directly in Categories.
            </p>
            <button
              type="button"
              onClick={() => setActiveSection('categories')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C1917] text-white uppercase tracking-wider font-semibold cursor-pointer"
            >
              <span>Manage Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-[#E8E0D5] p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F4EFEB]">
              <Package className="w-4 h-4 text-[#1C1917]" />
              <h3 className="font-serif-luxury text-lg text-[#1C1917]">
                Featured, Best Sellers &amp; New Arrivals
              </h3>
            </div>
            <p className="text-[#57534E] leading-relaxed">
              The homepage “Selected Creations” tabs (“Featured”, “Best Sellers”, and “New
              Arrivals”) pull live products flagged with{' '}
              <code className="font-mono">is_featured</code>,{' '}
              <code className="font-mono">is_best_seller</code>, and{' '}
              <code className="font-mono">is_new_arrival</code>.
            </p>
            <button
              type="button"
              onClick={() => setActiveSection('products')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C1917] text-white uppercase tracking-wider font-semibold cursor-pointer"
            >
              <span>Manage Product Showcase Flags</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="md:col-span-2 bg-[#FAF8F5] border border-[#E8E0D5] p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#1C1917]">
              <Info className="w-4 h-4 text-[#78716C]" />
              <h3 className="font-serif-luxury text-lg">
                Current Database Schema Scope
              </h3>
            </div>
            <p className="text-[#57534E] leading-relaxed">
              All fields in <code className="font-mono">homepage_content</code>,{' '}
              <code className="font-mono">promotional_banners</code>, and{' '}
              <code className="font-mono">store_settings</code> are wired directly to
              Supabase. The current Stage 1 database schema does not include tables or
              columns for customer testimonials/reviews CRUD, social media profile URLs,
              or separate hero CTA destination URLs, so those storefront sections retain
              safe built-in defaults without creating unapproved schema migrations.
            </p>
          </div>
        </div>
      )}

      {/* Add / Edit Promotional Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E0D5] max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5]">
              <h3 className="font-serif-luxury text-xl text-[#1C1917]">
                {editingBanner ? 'Edit Promotional Banner' : 'Add Promotional Banner'}
              </h3>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bannerFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{bannerFormError}</span>
              </div>
            )}

            {/* Live Banner Card Preview */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E0D5] space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C] block">
                Live Banner Preview ({PLACEMENT_LABELS[bannerForm.placement]})
              </span>
              <div className="bg-white border border-[#E8E0D5] p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div
                  className={
                    effectiveBannerPreviewImage ? 'sm:col-span-8 space-y-1.5' : 'sm:col-span-12 space-y-1.5'
                  }
                >
                  <div className="font-serif-luxury text-lg text-[#1C1917]">
                    {bannerForm.title || 'Banner Headline Preview'}
                  </div>
                  {bannerForm.subtitle && (
                    <p className="text-[11px] text-[#57534E]">{bannerForm.subtitle}</p>
                  )}
                  {bannerForm.ctaText && (
                    <span className="inline-block mt-1 px-3 py-1 bg-[#1C1917] text-white text-[10px] uppercase tracking-wider">
                      {bannerForm.ctaText}
                    </span>
                  )}
                </div>
                {effectiveBannerPreviewImage && (
                  <div className="sm:col-span-4 h-24 bg-[#E8E0D5] overflow-hidden">
                    <img
                      src={effectiveBannerPreviewImage}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={(e) => void handleBannerSubmit(e)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eid Heirloom Capsule 2026"
                    value={bannerForm.title}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Placement *
                  </label>
                  <select
                    value={bannerForm.placement}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        placement: e.target.value as BannerPlacement,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  >
                    <option value="home_banner">Homepage Mid Banner</option>
                    <option value="collection_spotlight">Collection Spotlight</option>
                    <option value="top_bar">Top Announcement Bar</option>
                    <option value="popup">Promotional Popup</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Subtitle / Campaign Copy
                </label>
                <textarea
                  rows={2}
                  value={bannerForm.subtitle}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, subtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Button Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Explore Capsule"
                    value={bannerForm.ctaText}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, ctaText: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Destination Route or URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="shop, shop:Rings, about, contact, or https://..."
                      value={bannerForm.ctaLink}
                      onChange={(e) =>
                        setBannerForm({ ...bannerForm, ctaLink: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] font-mono text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setBannerForm({ ...bannerForm, ctaLink: e.target.value });
                        }
                      }}
                      className="px-2.5 py-2 border border-[#E8E0D5] bg-white text-[#1C1917]"
                      aria-label="Route presets"
                    >
                      <option value="">Presets...</option>
                      <option value="shop">All Jewellery (shop)</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={`shop:${cat.name}`}>
                          Category: {cat.name}
                        </option>
                      ))}
                      <option value="about">Atelier / About</option>
                      <option value="contact">Contact Studio</option>
                      <option value="shipping">Shipping Policy</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Banner Image Upload */}
              <div className="space-y-2">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px] block">
                  Banner Image (Max 5 MB · silver-aura-media/banners)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3 p-3 border border-dashed border-[#D6CEC5] bg-[#FAF8F5]">
                  <div className="w-28 h-20 bg-white border border-[#E8E0D5] overflow-hidden shrink-0 flex items-center justify-center">
                    {effectiveBannerPreviewImage ? (
                      <img
                        src={effectiveBannerPreviewImage}
                        alt="Selected banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#A8A29E]" />
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-[#1C1917] text-white text-[11px] uppercase tracking-wider font-medium hover:bg-[#292524] inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {effectiveBannerPreviewImage ? 'Replace Image' : 'Upload Image'}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={handleBannerFileSelect}
                          className="hidden"
                        />
                      </label>
                      {effectiveBannerPreviewImage && (
                        <button
                          type="button"
                          onClick={handleClearBannerImage}
                          className="px-2.5 py-1.5 border border-[#D6CEC5] bg-white text-rose-700 hover:bg-rose-50 text-[11px] uppercase tracking-wider cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={bannerForm.imageUrl}
                      onChange={(e) => {
                        setBannerFile(null);
                        setBannerLocalPreview('');
                        setBannerForm({ ...bannerForm, imageUrl: e.target.value });
                      }}
                      placeholder="https://... or upload image file"
                      className="w-full px-2.5 py-1.5 border border-[#E8E0D5] bg-white text-[#1C1917]"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Order & Scheduling */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bannerForm.sortOrder}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        sortOrder: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Starts At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={bannerForm.startsAtLocal}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        startsAtLocal: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Ends At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={bannerForm.endsAtLocal}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, endsAtLocal: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={bannerForm.isActive}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, isActive: e.target.checked })
                  }
                  className="accent-[#1C1917]"
                />
                <span className="font-medium text-[#1C1917]">
                  Active on storefront (subject to schedule dates if specified)
                </span>
              </label>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8E0D5]">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 border border-[#D6CEC5] text-[#57534E] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBanner}
                  className="px-6 py-2 bg-[#1C1917] text-white uppercase tracking-wider font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingBanner && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBanner ? 'Save Banner' : 'Create Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Banner Confirmation */}
      {deletingBanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif-luxury text-xl text-[#1C1917]">
              Delete Promotional Banner
            </h3>
            <p className="text-[#57534E]">
              Are you sure you want to permanently remove{' '}
              <strong className="text-[#1C1917]">"{deletingBanner.title}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBanner(null)}
                disabled={deletingBannerBusy}
                className="px-4 py-2 border border-[#D6CEC5] text-[#57534E] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDeleteBanner()}
                disabled={deletingBannerBusy}
                className="px-4 py-2 bg-rose-700 text-white uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deletingBannerBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Banner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
