import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  X,
  Copy,
  AlertCircle,
  RefreshCw,
  Loader2,
  Search,
  Calendar,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { AdminCoupon } from '../../types';
import {
  createAdminCoupon,
  deleteAdminCoupon,
  fetchAdminCoupons,
  normalizeCouponCode,
  toggleAdminCouponStatus,
  updateAdminCoupon,
  validateCouponInput,
} from '../../services/adminCouponService';

function getTodayYmd(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const CouponsSection: React.FC = () => {
  const { isSupabaseReady, supabaseError, showAdminToast } = useAdmin();

  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'All' | 'Active' | 'Inactive' | 'Expired'>(
    'All'
  );

  // Modal & delete state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<AdminCoupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderAmount: 3000,
    usageLimitText: '',
    expiryDate: '2026-12-31',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const todayYmd = getTodayYmd();

  const loadCoupons = useCallback(async () => {
    if (!isSupabaseReady) {
      setLoading(false);
      setLoadError(
        supabaseError ||
          'Supabase environment variables are not configured. Coupon management requires a connected Supabase project.'
      );
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAdminCoupons();
      setCoupons(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to fetch coupons.';
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [isSupabaseReady, supabaseError]);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormError(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 3000,
      usageLimitText: '',
      expiryDate: '2026-12-31',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: AdminCoupon) => {
    setEditingCoupon(c);
    setFormError(null);
    setFormData({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount,
      usageLimitText: c.usageLimit !== null ? String(c.usageLimit) : '',
      expiryDate: c.expiryDate,
      status: c.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedLimit =
      formData.usageLimitText.trim() === '' ? null : Number(formData.usageLimitText.trim());

    const payload = {
      code: normalizeCouponCode(formData.code),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount),
      expiryDate: formData.expiryDate,
      status: formData.status,
      usageLimit: parsedLimit,
    };

    const validationError = validateCouponInput(payload);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    // Check case-insensitive duplicate locally for instant feedback
    const duplicate = coupons.find(
      (c) =>
        c.code.toLowerCase() === payload.code.toLowerCase() &&
        c.id !== editingCoupon?.id
    );
    if (duplicate) {
      setFormError(`Coupon code "${payload.code}" already exists (codes are case-insensitive).`);
      return;
    }

    setSubmitting(true);
    try {
      if (editingCoupon) {
        const updated = await updateAdminCoupon(editingCoupon.id, payload);
        setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        showAdminToast(`Coupon "${updated.code}" updated.`);
      } else {
        const created = await createAdminCoupon(payload);
        setCoupons((prev) => [created, ...prev]);
        showAdminToast(`Coupon "${created.code}" created.`);
      }
      setIsModalOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to save coupon.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (c: AdminCoupon) => {
    const nextStatus: 'Active' | 'Inactive' = c.status === 'Active' ? 'Inactive' : 'Active';
    setBusyId(c.id);
    try {
      await toggleAdminCouponStatus(c.id, nextStatus);
      setCoupons((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, status: nextStatus } : item))
      );
      showAdminToast(`Coupon "${c.code}" is now ${nextStatus}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to update coupon status.';
      showAdminToast(msg, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCoupon) return;
    setDeleting(true);
    try {
      await deleteAdminCoupon(deletingCoupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== deletingCoupon.id));
      showAdminToast(`Deleted coupon "${deletingCoupon.code}".`);
      setDeletingCoupon(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to delete coupon.';
      showAdminToast(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const copyCode = (code: string) => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(code);
      showAdminToast(`Copied code "${code}" to clipboard`);
    }
  };

  const stats = useMemo(() => {
    const total = coupons.length;
    const activeValid = coupons.filter(
      (c) => c.status === 'Active' && c.expiryDate >= todayYmd
    ).length;
    const expired = coupons.filter((c) => c.expiryDate < todayYmd).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + c.usageCount, 0);
    return { total, activeValid, expired, totalRedemptions };
  }, [coupons, todayYmd]);

  const filteredCoupons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return coupons.filter((c) => {
      const matchSearch = !q || c.code.toLowerCase().includes(q);
      const isExpired = c.expiryDate < todayYmd;

      let matchFilter = true;
      if (filterMode === 'Active') matchFilter = c.status === 'Active' && !isExpired;
      if (filterMode === 'Inactive') matchFilter = c.status === 'Inactive';
      if (filterMode === 'Expired') matchFilter = isExpired;

      return matchSearch && matchFilter;
    });
  }, [coupons, search, filterMode, todayYmd]);

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
            Create and manage promotional codes, minimum spend thresholds, usage limits, and
            expiry dates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => void loadCoupons()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#D6CEC5] bg-white text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#F4EFEB] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openAddModal}
            disabled={!isSupabaseReady}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Create Privilege Coupon</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to Load Coupons</p>
              <p className="text-rose-700 mt-0.5">{loadError}</p>
            </div>
          </div>
          <button
            onClick={() => void loadCoupons()}
            className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 text-[11px] uppercase tracking-wider font-semibold hover:bg-rose-100 cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#78716C]">
            Total Coupons
          </span>
          <div className="font-serif-luxury text-2xl text-[#1C1917] mt-2">{stats.total}</div>
        </div>
        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#78716C]">
            Active &amp; Valid
          </span>
          <div className="font-serif-luxury text-2xl text-emerald-900 mt-2">
            {stats.activeValid}
          </div>
        </div>
        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#78716C]">
            Expired
          </span>
          <div className="font-serif-luxury text-2xl text-amber-900 mt-2">
            {stats.expired}
          </div>
        </div>
        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#78716C]">
            Total Redemptions
          </span>
          <div className="font-serif-luxury text-2xl text-[#1C1917] mt-2">
            {stats.totalRedemptions}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
          />
        </div>

        <select
          value={filterMode}
          onChange={(e) =>
            setFilterMode(e.target.value as 'All' | 'Active' | 'Inactive' | 'Expired')
          }
          className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
        >
          <option value="All">All Coupons</option>
          <option value="Active">Active &amp; Non-Expired</option>
          <option value="Inactive">Inactive</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {/* Coupons Content */}
      {loading && coupons.length === 0 ? (
        <div className="bg-white border border-[#E8E0D5] p-12 flex items-center justify-center gap-2.5 text-xs text-[#57534E]">
          <Loader2 className="w-4 h-4 animate-spin text-[#1C1917]" />
          <span>Loading coupons from Supabase...</span>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="bg-white border border-[#E8E0D5] p-12 text-center space-y-2">
          <Tag className="w-7 h-7 text-[#A8A29E] mx-auto stroke-[1.5]" />
          <p className="text-xs font-semibold text-[#1C1917]">
            {coupons.length === 0
              ? 'No privilege coupons created yet'
              : 'No coupons match your search or filter'}
          </p>
          <p className="text-[11px] text-[#78716C]">
            {coupons.length === 0
              ? 'Create your first percentage or fixed PKR discount coupon above.'
              : 'Adjust the code search or status filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((c) => {
            const isActive = c.status === 'Active';
            const isExpired = c.expiryDate < todayYmd;
            const limitReached =
              c.usageLimit !== null && c.usageCount >= c.usageLimit;
            const isBusy = busyId === c.id;

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
                        type="button"
                        onClick={() => copyCode(c.code)}
                        className="text-[#78716C] hover:text-[#1C1917] p-1 cursor-pointer"
                        title="Copy Code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] text-[#78716C]">
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% Off Subtotal`
                        : `PKR ${c.discountValue.toLocaleString()} Fixed Discount`}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleToggleStatus(c)}
                      className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border cursor-pointer disabled:opacity-50 ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {isBusy ? '...' : isActive ? 'Active' : 'Inactive'}
                    </button>
                    {isExpired && (
                      <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Expired
                      </span>
                    )}
                    {!isExpired && limitReached && (
                      <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        Limit Reached
                      </span>
                    )}
                  </div>
                </div>

                {/* Terms breakdown */}
                <div className="p-3 bg-[#FAF8F5] border border-[#E8E0D5] space-y-1.5 text-xs text-[#57534E]">
                  <div className="flex justify-between">
                    <span>Minimum Order:</span>
                    <span className="font-medium text-[#1C1917]">
                      {c.minOrderAmount === 0
                        ? 'No minimum'
                        : `PKR ${c.minOrderAmount.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Redemptions:</span>
                    <span className="font-medium text-[#1C1917]">
                      {c.usageCount}{' '}
                      <span className="text-[#78716C] font-normal">
                        / {c.usageLimit !== null ? c.usageLimit : 'Unlimited'}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Expires:</span>
                    <span
                      className={`font-medium inline-flex items-center gap-1 ${
                        isExpired ? 'text-rose-700' : 'text-[#1C1917]'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      {c.expiryDate}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[#F4EFEB] flex items-center justify-between text-xs">
                  <span className="text-[#A8A29E] text-[11px]">
                    Validated via database RPC
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F4EFEB] cursor-pointer"
                      title="Edit Coupon"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingCoupon(c)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 cursor-pointer"
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
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-lg w-full p-6 shadow-2xl relative space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5]">
              <h3 className="font-serif-luxury text-xl text-[#1C1917]">
                {editingCoupon ? 'Edit Privilege Coupon' : 'Create Privilege Coupon'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EID2026 or SILVER15"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] font-mono uppercase text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
                <span className="text-[10px] text-[#78716C] block">
                  3–32 characters (letters, numbers, hyphens, underscores). Unique
                  case-insensitively.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as 'percentage' | 'fixed',
                      })
                    }
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
                    max={formData.discountType === 'percentage' ? 100 : undefined}
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Min Order (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Unlimited"
                    value={formData.usageLimitText}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimitText: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.status === 'Active'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.checked ? 'Active' : 'Inactive',
                    })
                  }
                  className="accent-[#1C1917]"
                />
                <span className="font-medium text-[#1C1917]">
                  Active for storefront checkout validation
                </span>
              </label>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8E0D5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D6CEC5] text-[#57534E] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#1C1917] text-white uppercase tracking-wider font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCoupon ? 'Save Changes' : 'Create Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif-luxury text-xl text-[#1C1917]">
              Delete Privilege Coupon
            </h3>
            <p className="text-[#57534E]">
              Are you sure you want to delete coupon{' '}
              <span className="font-mono font-bold text-[#1C1917]">
                {deletingCoupon.code}
              </span>
              ? Customers will no longer be able to apply it at checkout.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCoupon(null)}
                disabled={deleting}
                className="px-4 py-2 border border-[#D6CEC5] text-[#57534E] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={deleting}
                className="px-4 py-2 bg-rose-700 text-white uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Coupon</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
