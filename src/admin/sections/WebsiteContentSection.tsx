import React, { useState } from 'react';
import {
  Globe,
  Save,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';

export const WebsiteContentSection: React.FC = () => {
  const { websiteContent, updateWebsiteContent, showAdminToast } = useAdmin();
  const { navigateTo } = useShop();

  const [formData, setFormData] = useState({
    heroTitle: websiteContent.heroTitle || 'Pure Silver, Timeless Allure.',
    heroSubtitle: websiteContent.heroSubtitle || '925 Sterling Silver Atelier',
    heroDescription: websiteContent.heroDescription || 'Sculpted from certified 925 sterling silver and finished with mirror rhodium plating.',
    heroCtaText: websiteContent.heroCtaText || 'Shop Collection',
    heroSecondaryCtaText: websiteContent.heroSecondaryCtaText || 'Bridal & Gift Sets',
    heroImage: websiteContent.heroImage || '',
    announcementText: websiteContent.announcementText || 'Complimentary Insured Courier Delivery Across Pakistan on Orders Over PKR 5,000',
    brandStorySnippet: websiteContent.brandStorySnippet || websiteContent.aboutText || 'Silver Aura was founded with a singular ambition to craft authentic solid 925 sterling silver fine jewellery that rivals European luxury houses.',
    atelierAddress: websiteContent.atelierAddress || websiteContent.contactAddress || 'Suite 402, Executive Tower, Marine Drive, Clifton Block 4, Karachi, Pakistan.',
    conciergePhone: websiteContent.conciergePhone || websiteContent.contactWhatsApp || '+92 300 8291925',
    conciergeEmail: websiteContent.conciergeEmail || websiteContent.contactEmail || 'concierge@silveraura.pk',
    visitingHours: websiteContent.visitingHours || 'Mon – Sat: 11:00 AM – 9:00 PM PKT',
  });

  const [previewImage, setPreviewImage] = useState<string>(websiteContent.heroImage);

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAdminToast('Image exceeds 2MB limit', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setPreviewImage(res);
        setFormData(prev => ({ ...prev, heroImage: res }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteContent({
      ...formData,
      heroImage: previewImage.trim() || formData.heroImage,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Brand Experience & Copywriting
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Website Content Management
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            Update storefront hero campaign, announcement ticker, and studio details in real time
          </p>
        </div>

        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#D6CEC5] bg-white text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#F4EFEB]"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#78716C]" />
          <span>Preview Live Storefront</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Announcement Bar Section */}
        <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F4EFEB]">
            <Globe className="w-4 h-4 text-[#1C1917]" />
            <h3 className="font-serif-luxury text-lg text-[#1C1917]">Storefront Header Announcement Bar</h3>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
              Top Ticker Banner Message
            </label>
            <input
              type="text"
              required
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
              className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
            />
            <span className="text-[11px] text-[#78716C]">
              Displayed across the top of all customer pages.
            </span>
          </div>
        </div>

        {/* 2. Hero Campaign Section */}
        <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F4EFEB]">
            <Sparkles className="w-4 h-4 text-[#1C1917]" />
            <h3 className="font-serif-luxury text-lg text-[#1C1917]">Homepage Hero Campaign Banner</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Eyebrow / Subtitle
              </label>
              <input
                type="text"
                value={formData.heroSubtitle}
                onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Main Headline Title
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Hero Narrative Description
              </label>
              <textarea
                rows={2}
                value={formData.heroDescription}
                onChange={(e) => setFormData({ ...formData, heroDescription: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Primary CTA Button Text
              </label>
              <input
                type="text"
                value={formData.heroCtaText}
                onChange={(e) => setFormData({ ...formData, heroCtaText: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Secondary CTA Button Text
              </label>
              <input
                type="text"
                value={formData.heroSecondaryCtaText}
                onChange={(e) => setFormData({ ...formData, heroSecondaryCtaText: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            {/* Hero Image Upload */}
            <div className="sm:col-span-2 space-y-2 pt-2">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px] block">
                Hero Campaign Photography
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-[#D6CEC5] bg-[#FAF8F5]">
                <div className="w-32 h-20 bg-white border border-[#E8E0D5] overflow-hidden shrink-0 flex items-center justify-center">
                  {previewImage ? (
                    <img src={previewImage} alt="Hero Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-[#A8A29E]" />
                  )}
                </div>
                <div className="flex-1 space-y-2 w-full text-xs">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-[#1C1917] text-white text-[11px] uppercase tracking-wider font-medium hover:bg-[#292524] inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload High-Res Visual</span>
                      <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                    </label>
                    <span className="text-[11px] text-[#78716C]">or paste public image URL below</span>
                  </div>
                  <input
                    type="url"
                    value={formData.heroImage}
                    onChange={(e) => {
                      setFormData({ ...formData, heroImage: e.target.value });
                      setPreviewImage(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-2.5 py-1.5 border border-[#E8E0D5] bg-white text-[#1C1917]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Studio Atelier & Concierge Details */}
        <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F4EFEB]">
            <Globe className="w-4 h-4 text-[#1C1917]" />
            <h3 className="font-serif-luxury text-lg text-[#1C1917]">Atelier Flagship & Concierge Info</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Brand Story Snippet
              </label>
              <textarea
                rows={2}
                value={formData.brandStorySnippet}
                onChange={(e) => setFormData({ ...formData, brandStorySnippet: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Flagship Studio Address
              </label>
              <input
                type="text"
                value={formData.atelierAddress}
                onChange={(e) => setFormData({ ...formData, atelierAddress: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Concierge WhatsApp / Phone
              </label>
              <input
                type="text"
                value={formData.conciergePhone}
                onChange={(e) => setFormData({ ...formData, conciergePhone: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Concierge Email
              </label>
              <input
                type="email"
                value={formData.conciergeEmail}
                onChange={(e) => setFormData({ ...formData, conciergeEmail: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Studio Visiting Hours
              </label>
              <input
                type="text"
                value={formData.visitingHours}
                onChange={(e) => setFormData({ ...formData, visitingHours: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#292524] shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Publish Content to Storefront</span>
          </button>
        </div>
      </form>
    </div>
  );
};
