import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Save,
  Download,
  Truck,
  RefreshCw,
  Loader2,
  AlertCircle,
  Globe,
  Info,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import {
  fetchAdminStoreSettingsData,
  updateAdminStoreSettings,
  updateAnnouncementTextOnly,
} from '../../services/siteContentService';

export const SettingsSection: React.FC = () => {
  const { isSupabaseReady, supabaseError, showAdminToast, refreshDashboard } = useAdmin();

  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    storeName: 'Silver Aura',
    storeEmail: 'concierge@silveraura.pk',
    contactPhone: '+92 300 8291925',
    storeAddress:
      'Suite 402, Executive Tower, Marine Drive, Clifton Block 4, Karachi, Pakistan.',
    currency: 'PKR',
    currencySymbol: 'PKR',
    standardShippingCharge: 250,
    freeShippingThreshold: 5000,
    lowStockThreshold: 5,
    announcementText:
      'Complimentary Insured Courier Delivery Across Pakistan on Orders Over PKR 5,000',
  });

  const [initialAnnouncementText, setInitialAnnouncementText] = useState<string>('');

  const loadSettings = useCallback(async () => {
    if (!isSupabaseReady) {
      setLoading(false);
      setLoadError(
        supabaseError ||
          'Supabase environment variables are not configured. Store Settings requires a connected Supabase project.'
      );
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const { settings, announcementText } = await fetchAdminStoreSettingsData();
      setFormData({
        storeName: settings.storeName,
        storeEmail: settings.storeEmail,
        contactPhone: settings.contactPhone,
        storeAddress: settings.storeAddress,
        currency: settings.currency,
        currencySymbol: settings.currencySymbol || settings.currency,
        standardShippingCharge: settings.standardShippingCharge,
        freeShippingThreshold: settings.freeShippingThreshold,
        lowStockThreshold: settings.lowStockThreshold,
        announcementText,
      });
      setInitialAnnouncementText(announcementText);
      setLastUpdated(settings.updatedAt ?? null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to load store settings.';
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [isSupabaseReady, supabaseError]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateAdminStoreSettings({
        storeName: formData.storeName,
        storeEmail: formData.storeEmail,
        contactPhone: formData.contactPhone,
        storeAddress: formData.storeAddress,
        currency: formData.currency,
        currencySymbol: formData.currencySymbol,
        standardShippingCharge: Number(formData.standardShippingCharge),
        freeShippingThreshold: Number(formData.freeShippingThreshold),
        lowStockThreshold: Number(formData.lowStockThreshold),
      });

      const cleanAnnouncement = formData.announcementText.trim();
      if (cleanAnnouncement && cleanAnnouncement !== initialAnnouncementText) {
        await updateAnnouncementTextOnly(cleanAnnouncement);
        setInitialAnnouncementText(cleanAnnouncement);
      }

      setLastUpdated(updated.updatedAt ?? new Date().toISOString());
      window.dispatchEvent(new CustomEvent('silver_aura_site_updated'));
      void refreshDashboard();
      showAdminToast('Store settings saved to Supabase.');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to save store settings.';
      showAdminToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportSettingsJson = () => {
    try {
      const payload = {
        storeSettings: {
          store_name: formData.storeName,
          store_email: formData.storeEmail,
          contact_phone: formData.contactPhone,
          store_address: formData.storeAddress,
          currency: formData.currency,
          currency_symbol: formData.currencySymbol,
          standard_shipping_charge: formData.standardShippingCharge,
          free_shipping_threshold: formData.freeShippingThreshold,
          low_stock_threshold: formData.lowStockThreshold,
        },
        announcement_text: formData.announcementText,
        exportedAt: new Date().toISOString(),
      };

      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `silver_aura_settings_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showAdminToast('Store configuration JSON exported.');
    } catch {
      showAdminToast('Could not export configuration JSON.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            System &amp; Operations Configuration
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Store Settings &amp; Logistics Policy
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            Manage store contact identity, PKR currency, courier shipping rates, free-shipping
            thresholds, and announcement bar copy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadSettings()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#D6CEC5] bg-white text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#F4EFEB] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportSettingsJson}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#D6CEC5] bg-white text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#F4EFEB] transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to Load Store Settings</p>
              <p className="text-rose-700 mt-0.5">{loadError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadSettings()}
            className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 text-[11px] uppercase tracking-wider font-semibold hover:bg-rose-100 cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !lastUpdated ? (
        <div className="bg-white border border-[#E8E0D5] p-12 flex items-center justify-center gap-2.5 text-xs text-[#57534E]">
          <Loader2 className="w-4 h-4 animate-spin text-[#1C1917]" />
          <span>Loading store settings from Supabase...</span>
        </div>
      ) : (
        <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
          {/* Store Profile */}
          <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F4EFEB]">
              <Settings className="w-4 h-4 text-[#1C1917]" />
              <h3 className="font-serif-luxury text-lg text-[#1C1917]">
                Store Identity &amp; Support Contact
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Customer Support Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.storeEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, storeEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Support Phone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Store Address
                </label>
                <input
                  type="text"
                  value={formData.storeAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, storeAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>
            </div>
          </div>

          {/* Currency & Logistics Parameters */}
          <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F4EFEB]">
              <Truck className="w-4 h-4 text-[#1C1917]" />
              <h3 className="font-serif-luxury text-lg text-[#1C1917]">
                Currency, Shipping &amp; Inventory Defaults
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Currency Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] font-mono uppercase text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Display Symbol *
                </label>
                <input
                  type="text"
                  required
                  value={formData.currencySymbol}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currencySymbol: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] font-mono uppercase text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Standard Shipping Fee *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.standardShippingCharge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      standardShippingCharge: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
                <span className="text-[10px] text-[#78716C]">
                  Applied below free-shipping threshold
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Free Shipping Threshold *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.freeShippingThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      freeShippingThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
                <span className="text-[10px] text-[#78716C]">
                  Orders ≥ this value ship free
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Default Low-Stock Alert *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStockThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
                <span className="text-[10px] text-[#78716C]">Default alert threshold</span>
              </div>
            </div>
          </div>

          {/* Store Announcement Bar (Synced with homepage_content.announcement_text) */}
          <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F4EFEB]">
              <Globe className="w-4 h-4 text-[#1C1917]" />
              <h3 className="font-serif-luxury text-lg text-[#1C1917]">
                Store Announcement Bar
              </h3>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Header Announcement Message
              </label>
              <input
                type="text"
                required
                value={formData.announcementText}
                onChange={(e) =>
                  setFormData({ ...formData, announcementText: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
              <span className="text-[10px] text-[#78716C] block">
                Synchronized directly with <code className="font-mono">homepage_content.announcement_text</code>.
              </span>
            </div>
          </div>

          {/* Schema Boundary Info */}
          <div className="bg-[#FAF8F5] border border-[#E8E0D5] p-4 text-xs text-[#57534E] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#78716C] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1C1917]">Schema Alignment:</strong> All fields
              above map 1:1 to columns in <code className="font-mono">store_settings</code>{' '}
              (plus the announcement bar in <code className="font-mono">homepage_content</code>).
              Social media profile URLs are not included in the current Stage 1{' '}
              <code className="font-mono">store_settings</code> schema.
              {lastUpdated && (
                <span className="block text-[10px] text-[#78716C] mt-1">
                  Last saved: {new Date(lastUpdated).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving || !isSupabaseReady}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#292524] shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Store Configuration'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
