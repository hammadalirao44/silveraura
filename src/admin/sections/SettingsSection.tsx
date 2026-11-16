import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  Truck,
  Shield,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import {
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_COUPONS,
  INITIAL_WEBSITE_CONTENT,
  INITIAL_STORE_SETTINGS,
} from '../../data/adminSeedData';
import { PRODUCTS } from '../../data/products';

export const SettingsSection: React.FC = () => {
  const { storeSettings, updateStoreSettings, showAdminToast } = useAdmin();

  const [formData, setFormData] = useState({
    storeName: storeSettings.storeName,
    contactEmail: storeSettings.storeEmail || storeSettings.contactEmail || 'concierge@silveraura.pk',
    contactPhone: storeSettings.contactPhone,
    currencySymbol: storeSettings.currency || storeSettings.currencySymbol || 'PKR',
    standardShippingCharge: storeSettings.standardShippingCharge,
    freeShippingThreshold: storeSettings.freeShippingThreshold,
    lowStockAlertThreshold: storeSettings.lowStockThreshold || storeSettings.lowStockAlertThreshold || 5,
  });

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({
      storeName: formData.storeName.trim(),
      storeEmail: formData.contactEmail.trim(),
      contactEmail: formData.contactEmail.trim(),
      contactPhone: formData.contactPhone.trim(),
      currency: formData.currencySymbol.trim(),
      currencySymbol: formData.currencySymbol.trim(),
      standardShippingCharge: Number(formData.standardShippingCharge),
      freeShippingThreshold: Number(formData.freeShippingThreshold),
      lowStockThreshold: Number(formData.lowStockAlertThreshold),
      lowStockAlertThreshold: Number(formData.lowStockAlertThreshold),
    });
  };

  const handleResetData = () => {
    try {
      localStorage.setItem('silver_aura_products', JSON.stringify(PRODUCTS));
      localStorage.setItem('silver_aura_categories', JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem('silver_aura_orders', JSON.stringify(INITIAL_ORDERS));
      localStorage.setItem('silver_aura_customers', JSON.stringify(INITIAL_CUSTOMERS));
      localStorage.setItem('silver_aura_coupons', JSON.stringify(INITIAL_COUPONS));
      localStorage.setItem('silver_aura_content', JSON.stringify(INITIAL_WEBSITE_CONTENT));
      localStorage.setItem('silver_aura_settings', JSON.stringify(INITIAL_STORE_SETTINGS));

      showAdminToast('All Silver Aura demo data restored to pristine state');
      setIsResetConfirmOpen(false);

      // Reload window to reinitialize state cleanly
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (e) {
      showAdminToast('Error resetting demo data', 'error');
    }
  };

  const handleExportData = () => {
    try {
      const dump = {
        products: JSON.parse(localStorage.getItem('silver_aura_products') || '[]'),
        categories: JSON.parse(localStorage.getItem('silver_aura_categories') || '[]'),
        orders: JSON.parse(localStorage.getItem('silver_aura_orders') || '[]'),
        customers: JSON.parse(localStorage.getItem('silver_aura_customers') || '[]'),
        coupons: JSON.parse(localStorage.getItem('silver_aura_coupons') || '[]'),
        content: JSON.parse(localStorage.getItem('silver_aura_content') || '{}'),
        settings: JSON.parse(localStorage.getItem('silver_aura_settings') || '{}'),
        exportedAt: new Date().toISOString(),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dump, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `silver_aura_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showAdminToast('Atelier database backup exported successfully');
    } catch (e) {
      showAdminToast('Export failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            System & Operations Configuration
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Store Settings & Logistics Policy
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            Shipping fees, free shipping qualifiers, inventory safety limits, and database snapshots
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#D6CEC5] bg-white text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#F4EFEB] transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-[#78716C]" />
          <span>Export JSON Backup</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F4EFEB]">
            <Settings className="w-4 h-4 text-[#1C1917]" />
            <h3 className="font-serif-luxury text-lg text-[#1C1917]">Store Identity & Atelier Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Brand Name *
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Concierge Contact Email *
              </label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                WhatsApp / Support Number *
              </label>
              <input
                type="text"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>
          </div>
        </div>

        {/* Currency & Logistics Parameters */}
        <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F4EFEB]">
            <Truck className="w-4 h-4 text-[#1C1917]" />
            <h3 className="font-serif-luxury text-lg text-[#1C1917]">Financial & Courier Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Currency Unit
              </label>
              <input
                type="text"
                required
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Standard Courier Fee (PKR)
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.standardShippingCharge}
                onChange={(e) => setFormData({ ...formData, standardShippingCharge: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
              <span className="text-[10px] text-[#78716C]">Charged when cart is below free limit</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Free Shipping Threshold (PKR)
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
              <span className="text-[10px] text-[#78716C]">Orders equal or above qualify for PKR 0 delivery</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                Low Stock Threshold (Units)
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.lowStockAlertThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockAlertThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
              />
              <span className="text-[10px] text-[#78716C]">Triggers dashboard low stock badge</span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#292524] shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>

      {/* Dangerous Zone / Reset Data */}
      <div className="bg-rose-50/50 border border-rose-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-900 font-semibold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Atelier Sandbox & Demo Reset</span>
        </div>
        <p className="text-xs text-[#57534E] leading-relaxed max-w-2xl">
          If you wish to clear all custom additions, test purchases, and modified coupons, you can restore the complete realistic luxury dataset (18 pieces of 925 silver jewellery, 7 Pakistan customer orders, and 4 privilege codes).
        </p>
        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-rose-300 bg-white text-rose-700 hover:bg-rose-100 text-xs uppercase tracking-wider font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Pristine Demo Catalog & Orders</span>
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif-luxury text-xl text-[#1C1917]">Confirm Demo Reset</h3>
            <p className="text-[#57534E] leading-relaxed">
              This will reset browser localStorage to the default Silver Aura luxury catalog and seed orders. Any newly added mock products will be overwritten.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 border border-[#D6CEC5] text-[#57534E]"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 bg-rose-700 text-white uppercase tracking-wider font-semibold hover:bg-rose-800"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
