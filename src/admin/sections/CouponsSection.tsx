import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Calendar,
  Percent,
  Coins,
  Copy,
  AlertCircle,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Coupon } from '../../types';

export const CouponsSection: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, toggleCouponStatus, showAdminToast } = useAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    minOrderAmount: 3000,
    expiryDate: '2026-12-31',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: 10,
      minOrderAmount: 3000,
      expiryDate: '2026-12-31',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderAmount: c.minOrderAmount,
      expiryDate: c.expiryDate,
      status: c.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showAdminToast('Please provide a coupon code', 'error');
      return;
    }

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        minOrderAmount: Number(formData.minOrderAmount),
        expiryDate: formData.expiryDate,
        status: formData.status,
      });
    } else {
      addCoupon({
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        minOrderAmount: Number(formData.minOrderAmount),
        expiryDate: formData.expiryDate,
        status: formData.status,
      });
    }

    setIsModalOpen(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showAdminToast(`Copied code "${code}" to clipboard`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Privilege Club & Promotions
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Coupon & Discount Management
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            Configure promotional discount codes, minimum order thresholds, and expiry limits
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Privilege Coupon</span>
        </button>
      </div>

      {/* Coupons Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => {
          const isActive = c.status === 'Active';
          return (
            <div
              key={c.id}
              className="bg-white border border-[#E8E0D5] p-5 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Top Row with Code & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-[#1C1917] tracking-wider">
                      {c.code}
                    </span>
                    <button
                      onClick={() => copyCode(c.code)}
                      className="text-[#78716C] hover:text-[#1C1917] p-1"
                      title="Copy Code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-[#78716C]">
                    {c.type === 'percentage' ? `${c.value}% Off Entire Cart` : `PKR ${c.value.toLocaleString()} Fixed Rebate`}
                  </span>
                </div>

                <button
                  onClick={() => toggleCouponStatus(c.id)}
                  className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {isActive ? 'Active' : 'Disabled'}
                </button>
              </div>

              {/* Terms breakdown */}
              <div className="p-3 bg-[#FAF8F5] border border-[#E8E0D5] space-y-1.5 text-xs text-[#57534E]">
                <div className="flex justify-between">
                  <span>Minimum Order:</span>
                  <span className="font-medium text-[#1C1917]">
                    {c.minOrderAmount === 0 ? 'No minimum' : `PKR ${c.minOrderAmount.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Redemptions:</span>
                  <span className="font-medium text-[#1C1917]">{c.usageCount} times</span>
                </div>
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className="font-medium text-[#1C1917]">{c.expiryDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-[#F4EFEB] flex items-center justify-between text-xs">
                <span className="text-[#A8A29E] text-[11px]">Storefront checkout valid</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F4EFEB]"
                    title="Edit Coupon"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(c.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-lg w-full p-6 shadow-2xl relative space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5]">
              <h3 className="font-serif-luxury text-xl text-[#1C1917]">
                {editingCoupon ? 'Edit Privilege Coupon' : 'Create New Privilege Code'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#78716C] hover:text-[#1C1917]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EID2026 or SUMMER20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] font-mono uppercase text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Discount Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Min Order (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.status === 'Active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })}
                  className="accent-[#1C1917]"
                />
                <span className="font-medium text-[#1C1917]">Immediately activate for storefront checkout</span>
              </label>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8E0D5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D6CEC5] text-[#57534E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1C1917] text-white uppercase tracking-wider font-semibold"
                >
                  {editingCoupon ? 'Save Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif-luxury text-xl text-[#1C1917]">Delete Privilege Code</h3>
            <p className="text-[#57534E]">
              Are you sure you want to remove this discount coupon? Customers will no longer be able to apply it at checkout.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-[#D6CEC5] text-[#57534E]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCoupon(deletingId);
                  setDeletingId(null);
                }}
                className="px-4 py-2 bg-rose-700 text-white uppercase tracking-wider font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
