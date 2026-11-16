import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package,
  AlertTriangle,
  XCircle,
  Search,
  Plus,
  Minus,
  Save,
  Coins,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { CategoryItem, Product, ProductVariantItem } from '../../types';
import {
  fetchAdminProducts,
  setMasterInventoryRpc,
  updateVariantRpc,
} from '../../services/adminProductService';
import { fetchAdminCategories } from '../../services/adminCategoryService';

interface VariantDraft {
  stock: number;
  isActive: boolean;
}

export const InventorySection: React.FC = () => {
  const { isSupabaseReady, supabaseError, showAdminToast, refreshDashboard } = useAdmin();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<
    'All' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'variants_only'
  >('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Expanded variant rows
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  // Drafts for master stock (non-variant products) & low-stock thresholds (all products)
  const [draftStock, setDraftStock] = useState<Record<string, number>>({});
  const [draftThreshold, setDraftThreshold] = useState<Record<string, number>>({});
  const [savingProductId, setSavingProductId] = useState<string | null>(null);

  // Drafts for variant stock & active flags
  const [draftVariants, setDraftVariants] = useState<Record<string, VariantDraft>>({});
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    if (!isSupabaseReady) {
      setLoading(false);
      setLoadError(
        supabaseError ||
          'Supabase environment variables are not configured. Inventory control requires a connected Supabase project.'
      );
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const [prodList, catList] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminCategories(),
      ]);
      setProducts(prodList);
      setCategories(catList);
      // Auto-expand first variant product if none toggled yet? Keep clean collapsed or preserve user toggles
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to fetch inventory records.';
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [isSupabaseReady, supabaseError]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const notifyCatalogSync = () => {
    window.dispatchEvent(new CustomEvent('silver_aura_catalog_updated'));
    void refreshDashboard();
  };

  const getProductThreshold = (p: Product): number => {
    return draftThreshold[p.id] !== undefined
      ? draftThreshold[p.id]
      : p.lowStockThreshold ?? 5;
  };

  const getEffectiveProductStock = (p: Product): number => {
    if (!p.hasVariants && draftStock[p.id] !== undefined) {
      return draftStock[p.id];
    }
    return p.stockCount ?? 0;
  };

  const handleStockDraftChange = (productId: string, val: number) => {
    const clean = Number.isFinite(val) ? Math.max(0, Math.floor(val)) : 0;
    setDraftStock((prev) => ({ ...prev, [productId]: clean }));
  };

  const handleThresholdDraftChange = (productId: string, val: number) => {
    const clean = Number.isFinite(val) ? Math.max(0, Math.floor(val)) : 0;
    setDraftThreshold((prev) => ({ ...prev, [productId]: clean }));
  };

  const handleVariantDraftChange = (
    variant: ProductVariantItem,
    patch: Partial<VariantDraft>
  ) => {
    setDraftVariants((prev) => {
      const current = prev[variant.id] ?? {
        stock: variant.stock,
        isActive: variant.isActive,
      };
      return {
        ...prev,
        [variant.id]: {
          stock:
            patch.stock !== undefined
              ? Math.max(0, Math.floor(patch.stock))
              : current.stock,
          isActive: patch.isActive !== undefined ? patch.isActive : current.isActive,
        },
      };
    });
  };

  const handleSaveMasterInventory = async (p: Product) => {
    const targetThreshold = getProductThreshold(p);
    const targetStock = p.hasVariants
      ? null
      : draftStock[p.id] !== undefined
      ? draftStock[p.id]
      : p.stockCount ?? 0;

    setSavingProductId(p.id);
    try {
      await setMasterInventoryRpc(p.id, targetStock, targetThreshold);
      setDraftStock((prev) => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
      setDraftThreshold((prev) => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
      await loadInventory();
      notifyCatalogSync();
      showAdminToast(
        p.hasVariants
          ? `Low-stock threshold updated for "${p.name}".`
          : `Inventory updated for "${p.name}" (${targetStock} units).`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to update inventory.';
      showAdminToast(msg, 'error');
    } finally {
      setSavingProductId(null);
    }
  };

  const handleSaveVariantInventory = async (p: Product, variant: ProductVariantItem) => {
    const draft = draftVariants[variant.id];
    if (!draft) return;

    setSavingVariantId(variant.id);
    try {
      await updateVariantRpc(variant.id, {
        sizeLabel: variant.sizeLabel,
        colorLabel: variant.colorLabel,
        sku: variant.sku,
        price: variant.price,
        stock: draft.stock,
        isActive: draft.isActive,
        sortOrder: variant.sortOrder,
      });

      setDraftVariants((prev) => {
        const next = { ...prev };
        delete next[variant.id];
        return next;
      });

      await loadInventory();
      notifyCatalogSync();
      const label = [variant.sizeLabel, variant.colorLabel].filter(Boolean).join(' / ') || 'Variant';
      showAdminToast(`Saved ${p.name} (${label}) stock via database RPC.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to update variant stock.';
      showAdminToast(msg, 'error');
    } finally {
      setSavingVariantId(null);
    }
  };

  const toggleExpand = (productId: string) => {
    setExpandedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Vault metrics computed from live Supabase products & variants
  const metrics = useMemo(() => {
    let totalUnits = 0;
    let totalValuation = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let healthyCount = 0;

    for (const p of products) {
      const stock = p.stockCount ?? 0;
      const threshold = p.lowStockThreshold ?? 5;
      totalUnits += stock;

      if (p.hasVariants && p.productVariants && p.productVariants.length > 0) {
        const variantVal = p.productVariants.reduce((sum, v) => {
          if (!v.isActive) return sum;
          const unitPrice = v.price ?? p.price;
          return sum + unitPrice * Math.max(0, v.stock);
        }, 0);
        totalValuation += variantVal;
      } else {
        totalValuation += p.price * Math.max(0, stock);
      }

      if (stock <= 0) {
        outOfStockCount += 1;
      } else if (stock <= threshold) {
        lowStockCount += 1;
      } else {
        healthyCount += 1;
      }
    }

    return { totalUnits, totalValuation, outOfStockCount, lowStockCount, healthyCount };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const variantMatch = (p.productVariants ?? []).some(
        (v) =>
          (v.sku && v.sku.toLowerCase().includes(q)) ||
          (v.sizeLabel && v.sizeLabel.toLowerCase().includes(q)) ||
          (v.colorLabel && v.colorLabel.toLowerCase().includes(q))
      );

      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        variantMatch;

      const matchCat = categoryFilter === 'All' || p.categoryId === categoryFilter;

      const stock = p.stockCount ?? 0;
      const threshold = p.lowStockThreshold ?? 5;
      let matchStock = true;
      if (stockFilter === 'in_stock') matchStock = stock > 0;
      if (stockFilter === 'low_stock') matchStock = stock > 0 && stock <= threshold;
      if (stockFilter === 'out_of_stock') matchStock = stock <= 0;
      if (stockFilter === 'variants_only') matchStock = Boolean(p.hasVariants);

      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Atelier Vault & Stock Locking
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Inventory & Stock Control
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            Live master and variant stock levels managed through transactional Supabase RPCs.
          </p>
        </div>

        <button
          onClick={() => void loadInventory()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#D6CEC5] bg-white text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#F4EFEB] transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Error State */}
      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to Load Inventory</p>
              <p className="text-rose-700 mt-0.5">{loadError}</p>
            </div>
          </div>
          <button
            onClick={() => void loadInventory()}
            className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 text-[11px] uppercase tracking-wider font-semibold hover:bg-rose-100 cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Total Vault Units
            </span>
            <Package className="w-4 h-4 text-[#1C1917]" />
          </div>
          <div className="font-serif-luxury text-2xl text-[#1C1917] mt-3">
            {metrics.totalUnits}{' '}
            <span className="text-xs font-sans text-[#78716C]">units</span>
          </div>
          <span className="text-[11px] text-[#78716C]">
            {metrics.healthyCount} healthy SKUs
          </span>
        </div>

        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Vault Valuation
            </span>
            <Coins className="w-4 h-4 text-[#1C1917]" />
          </div>
          <div className="font-serif-luxury text-2xl text-[#1C1917] mt-3">
            PKR {metrics.totalValuation.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#78716C]">Retail value of active stock</span>
        </div>

        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Low-Stock Items
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif-luxury text-2xl text-amber-900 mt-3">
            {metrics.lowStockCount}{' '}
            <span className="text-xs font-sans text-amber-700">products</span>
          </div>
          <span className="text-[11px] text-amber-700">At or below alert threshold</span>
        </div>

        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Out of Stock
            </span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="font-serif-luxury text-2xl text-rose-700 mt-3">
            {metrics.outOfStockCount}{' '}
            <span className="text-xs font-sans text-rose-600">products</span>
          </div>
          <span className="text-[11px] text-rose-700">0 units available</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, master SKU, or variant SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) =>
              setStockFilter(
                e.target.value as
                  | 'All'
                  | 'in_stock'
                  | 'low_stock'
                  | 'out_of_stock'
                  | 'variants_only'
              )
            }
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="All">All Inventory Levels</option>
            <option value="in_stock">Available (&gt; 0 units)</option>
            <option value="low_stock">Low Stock (≤ Threshold)</option>
            <option value="out_of_stock">Out of Stock (0 units)</option>
            <option value="variants_only">Variant-Managed Only</option>
          </select>
        </div>
      </div>

      {/* Loading / Empty / Table */}
      {loading && products.length === 0 ? (
        <div className="bg-white border border-[#E8E0D5] p-12 flex items-center justify-center gap-2.5 text-xs text-[#57534E]">
          <Loader2 className="w-4 h-4 animate-spin text-[#1C1917]" />
          <span>Loading Supabase inventory and variants...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#E8E0D5] p-12 text-center space-y-2">
          <Package className="w-7 h-7 text-[#A8A29E] mx-auto stroke-[1.5]" />
          <p className="text-xs font-semibold text-[#1C1917]">
            {products.length === 0
              ? 'No products in catalog yet'
              : 'No inventory items match your filters'}
          </p>
          <p className="text-[11px] text-[#78716C]">
            {products.length === 0
              ? 'Add products in the Products module to manage master and variant stock here.'
              : 'Clear search or adjust the category and stock status filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E0D5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E0D5] text-[#78716C] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">SKU & Category</th>
                  <th className="py-3 px-4 font-semibold">Unit Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Alert Threshold</th>
                  <th className="py-3 px-4 font-semibold">Stock Control</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFEB]">
                {filteredProducts.map((p) => {
                  const baseStock = p.stockCount ?? 0;
                  const baseThreshold = p.lowStockThreshold ?? 5;
                  const currentStock = getEffectiveProductStock(p);
                  const currentThreshold = getProductThreshold(p);

                  const stockChanged =
                    !p.hasVariants &&
                    draftStock[p.id] !== undefined &&
                    draftStock[p.id] !== baseStock;
                  const thresholdChanged =
                    draftThreshold[p.id] !== undefined &&
                    draftThreshold[p.id] !== baseThreshold;
                  const hasMasterChange = stockChanged || thresholdChanged;

                  const isOut = currentStock <= 0;
                  const isLow = currentStock > 0 && currentStock <= currentThreshold;
                  const isExpanded = Boolean(expandedProducts[p.id]);
                  const variants = p.productVariants ?? [];
                  const isSavingMaster = savingProductId === p.id;

                  return (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-[#FAF8F5]/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {p.images[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-10 h-10 object-cover rounded-xs border border-[#E8E0D5] shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-[#FAF8F5] border border-[#E8E0D5] flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-[#A8A29E]" />
                              </div>
                            )}
                            <div className="min-w-0 max-w-[220px]">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-medium text-[#1C1917] truncate">
                                  {p.name}
                                </h4>
                                {p.status === 'inactive' && (
                                  <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
                                    Hidden
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#78716C] block">
                                {p.hasVariants
                                  ? `Variant-managed • ${variants.length} option${
                                      variants.length === 1 ? '' : 's'
                                    }`
                                  : 'Master stock product'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[11px] text-[#1C1917]">
                            {p.sku || '—'}
                          </div>
                          <div className="text-[10px] text-[#78716C]">{p.category}</div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-[#1C1917] whitespace-nowrap">
                          PKR {p.price.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span
                              className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border inline-flex items-center gap-1 ${
                                isOut
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : isLow
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {isOut
                                ? 'Out of Stock'
                                : isLow
                                ? 'Low Stock'
                                : 'Available'}
                            </span>
                            <div className="text-[10px] text-[#78716C]">
                              {baseStock} unit{baseStock === 1 ? '' : 's'} total
                            </div>
                          </div>
                        </td>

                        {/* Low-Stock Alert Threshold */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#78716C]">≤</span>
                            <input
                              type="number"
                              min={0}
                              value={currentThreshold}
                              onChange={(e) =>
                                handleThresholdDraftChange(
                                  p.id,
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              aria-label={`Low stock threshold for ${p.name}`}
                              className="w-14 px-1.5 py-1 text-center border border-[#E8E0D5] bg-white text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                            />
                          </div>
                        </td>

                        {/* Master Stock or Variant Toggle */}
                        <td className="py-3.5 px-4">
                          {p.hasVariants ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(p.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[#D6CEC5] bg-[#FAF8F5] hover:bg-[#F4EFEB] text-[#1C1917] text-[11px] font-medium cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                              <Layers className="w-3 h-3 text-[#78716C]" />
                              <span>
                                {isExpanded ? 'Hide Variants' : `Manage ${variants.length} Variants`}
                              </span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleStockDraftChange(p.id, currentStock - 1)
                                }
                                disabled={currentStock <= 0}
                                className="w-6 h-6 border border-[#D6CEC5] bg-[#FAF8F5] flex items-center justify-center hover:bg-[#F4EFEB] disabled:opacity-30 cursor-pointer"
                                aria-label={`Decrease stock for ${p.name}`}
                              >
                                <Minus className="w-3 h-3 text-[#1C1917]" />
                              </button>
                              <input
                                type="number"
                                min={0}
                                value={currentStock}
                                onChange={(e) =>
                                  handleStockDraftChange(
                                    p.id,
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                                aria-label={`Stock quantity for ${p.name}`}
                                className="w-14 px-1.5 py-1 text-center border border-[#E8E0D5] bg-white text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleStockDraftChange(p.id, currentStock + 1)
                                }
                                className="w-6 h-6 border border-[#D6CEC5] bg-[#FAF8F5] flex items-center justify-center hover:bg-[#F4EFEB] cursor-pointer"
                                aria-label={`Increase stock for ${p.name}`}
                              >
                                <Plus className="w-3 h-3 text-[#1C1917]" />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {hasMasterChange ? (
                            <button
                              type="button"
                              disabled={isSavingMaster}
                              onClick={() => void handleSaveMasterInventory(p)}
                              className="px-3 py-1.5 bg-[#1C1917] text-white hover:bg-[#292524] text-[10px] uppercase tracking-wider font-medium inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {isSavingMaster ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                              <span>
                                {p.hasVariants ? 'Save Threshold' : 'Save'}
                              </span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#A8A29E]">Synced</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Variant Stock Matrix */}
                      {p.hasVariants && isExpanded && (
                        <tr className="bg-[#FAF8F5]">
                          <td colSpan={7} className="px-6 py-4 border-t border-[#E8E0D5]">
                            <div className="space-y-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                <span className="font-semibold uppercase tracking-wider text-[#57534E]">
                                  Variant Stock Levels — {p.name}
                                </span>
                                <span className="text-[#78716C]">
                                  Master stock ({baseStock} units) auto-syncs from active
                                  variants via Stage 1 triggers.
                                </span>
                              </div>

                              {variants.length === 0 ? (
                                <p className="text-[11px] text-[#78716C] py-2">
                                  No variants defined for this product.
                                </p>
                              ) : (
                                <div className="bg-white border border-[#E8E0D5] divide-y divide-[#F4EFEB]">
                                  {variants.map((v) => {
                                    const draft = draftVariants[v.id];
                                    const effStock = draft ? draft.stock : v.stock;
                                    const effActive = draft ? draft.isActive : v.isActive;
                                    const isVariantDirty =
                                      draft !== undefined &&
                                      (draft.stock !== v.stock ||
                                        draft.isActive !== v.isActive);
                                    const isSavingVar = savingVariantId === v.id;

                                    const vStatus = !effActive
                                      ? 'Inactive'
                                      : effStock <= 0
                                      ? 'Out of Stock'
                                      : effStock <= currentThreshold
                                      ? 'Low Stock'
                                      : 'Available';

                                    const optionLabel = [v.sizeLabel, v.colorLabel]
                                      .filter(Boolean)
                                      .join(' • ') || 'Standard Option';

                                    return (
                                      <div
                                        key={v.id}
                                        className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                                      >
                                        <div className="min-w-[180px]">
                                          <div className="font-medium text-[#1C1917]">
                                            {optionLabel}
                                          </div>
                                          <div className="text-[10px] font-mono text-[#78716C]">
                                            SKU: {v.sku || '—'} • PKR{' '}
                                            {(v.price ?? p.price).toLocaleString()}
                                          </div>
                                        </div>

                                        <span
                                          className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border ${
                                            !effActive
                                              ? 'bg-stone-100 text-stone-600 border-stone-200'
                                              : effStock <= 0
                                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                                              : effStock <= currentThreshold
                                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                          }`}
                                        >
                                          {vStatus}
                                        </span>

                                        <label className="inline-flex items-center gap-1.5 text-[11px] text-[#57534E] cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={effActive}
                                            onChange={(e) =>
                                              handleVariantDraftChange(v, {
                                                isActive: e.target.checked,
                                              })
                                            }
                                            className="accent-[#1C1917]"
                                          />
                                          <span>Active</span>
                                        </label>

                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleVariantDraftChange(v, {
                                                stock: effStock - 1,
                                              })
                                            }
                                            disabled={effStock <= 0}
                                            className="w-6 h-6 border border-[#D6CEC5] bg-[#FAF8F5] flex items-center justify-center hover:bg-[#F4EFEB] disabled:opacity-30 cursor-pointer"
                                          >
                                            <Minus className="w-3 h-3 text-[#1C1917]" />
                                          </button>
                                          <input
                                            type="number"
                                            min={0}
                                            value={effStock}
                                            onChange={(e) =>
                                              handleVariantDraftChange(v, {
                                                stock: parseInt(e.target.value, 10) || 0,
                                              })
                                            }
                                            className="w-14 px-1.5 py-1 text-center border border-[#E8E0D5] bg-white text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                                          />
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleVariantDraftChange(v, {
                                                stock: effStock + 1,
                                              })
                                            }
                                            className="w-6 h-6 border border-[#D6CEC5] bg-[#FAF8F5] flex items-center justify-center hover:bg-[#F4EFEB] cursor-pointer"
                                          >
                                            <Plus className="w-3 h-3 text-[#1C1917]" />
                                          </button>
                                        </div>

                                        <div className="w-24 text-right">
                                          {isVariantDirty ? (
                                            <button
                                              type="button"
                                              disabled={isSavingVar}
                                              onClick={() =>
                                                void handleSaveVariantInventory(p, v)
                                              }
                                              className="px-3 py-1 bg-[#1C1917] text-white hover:bg-[#292524] text-[10px] uppercase tracking-wider font-medium inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                            >
                                              {isSavingVar ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                              ) : (
                                                <Save className="w-3 h-3" />
                                              )}
                                              <span>Save</span>
                                            </button>
                                          ) : (
                                            <span className="text-[11px] text-[#A8A29E]">
                                              Synced
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
