import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Plus,
  Minus,
  Save,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const InventorySection: React.FC = () => {
  const { products, categories, updateProductStock, storeSettings, showAdminToast } = useAdmin();

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'All' | 'in_stock' | 'low_stock' | 'out_of_stock'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Local draft of stock counts for inline editing
  const [draftStock, setDraftStock] = useState<Record<string, number>>({});

  const lowStockThreshold = storeSettings.lowStockThreshold || storeSettings.lowStockAlertThreshold || 5;

  const handleStockChange = (productId: string, val: number) => {
    setDraftStock(prev => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  const handleSaveInlineStock = (productId: string) => {
    const newVal = draftStock[productId];
    if (newVal !== undefined) {
      updateProductStock(productId, newVal);
      // Remove from draft
      setDraftStock(prev => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    }
  };

  // Metrics
  const totalUnits = products.reduce((sum, p) => sum + (p.stockCount ?? 0), 0);
  const outOfStockItems = products.filter((p) => (p.stockCount ?? 0) <= 0 || !p.inStock);
  const lowStockItems = products.filter((p) => (p.stockCount ?? 0) > 0 && (p.stockCount ?? 0) <= lowStockThreshold);
  const healthyStockItems = products.filter((p) => (p.stockCount ?? 0) > lowStockThreshold);

  const inventoryValuation = products.reduce((sum, p) => sum + p.price * (p.stockCount ?? 0), 0);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;

      const currentStock = draftStock[p.id] !== undefined ? draftStock[p.id] : (p.stockCount ?? 0);
      let matchStock = true;
      if (stockFilter === 'in_stock') matchStock = currentStock > 0;
      if (stockFilter === 'low_stock') matchStock = currentStock > 0 && currentStock <= lowStockThreshold;
      if (stockFilter === 'out_of_stock') matchStock = currentStock <= 0;

      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter, draftStock, lowStockThreshold]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Atelier Vault & Vault Valuation
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Inventory & Stock Control
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            Real-time stock monitoring, low inventory notifications, and quick batch restock
          </p>
        </div>
      </div>

      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Total Pieces</span>
            <Package className="w-4 h-4 text-[#1C1917]" />
          </div>
          <div className="font-serif-luxury text-2xl text-[#1C1917] mt-3">
            {totalUnits} <span className="text-xs font-sans text-[#78716C]">units</span>
          </div>
          <span className="text-[11px] text-[#78716C]">{healthyStockItems.length} healthy SKUs</span>
        </div>

        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Vault Valuation</span>
            <Coins className="w-4 h-4 text-[#1C1917]" />
          </div>
          <div className="font-serif-luxury text-2xl text-[#1C1917] mt-3">
            PKR {inventoryValuation.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#78716C]">Asset value at retail</span>
        </div>

        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif-luxury text-2xl text-amber-900 mt-3">
            {lowStockItems.length} <span className="text-xs font-sans text-amber-700">SKUs</span>
          </div>
          <span className="text-[11px] text-amber-700">≤ {lowStockThreshold} units remaining</span>
        </div>

        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Depleted (Out)</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="font-serif-luxury text-2xl text-rose-700 mt-3">
            {outOfStockItems.length} <span className="text-xs font-sans text-rose-600">SKUs</span>
          </div>
          <span className="text-[11px] text-rose-700">Hidden from instant checkout</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, product name..."
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
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="All">All Inventory Levels</option>
            <option value="low_stock">Low Stock (≤ {lowStockThreshold} units)</option>
            <option value="out_of_stock">Out of Stock (0 units)</option>
            <option value="in_stock">In Stock (&gt; 0 units)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#E8E0D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E0D5] text-[#78716C] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Jewellery Piece</th>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Unit Price</th>
                <th className="py-3 px-4 font-semibold">Vault Value</th>
                <th className="py-3 px-4 font-semibold">Status Indicator</th>
                <th className="py-3 px-4 font-semibold">Stock Count (Units)</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFEB]">
              {filteredProducts.map((p) => {
                const currentVal = draftStock[p.id] !== undefined ? draftStock[p.id] : (p.stockCount ?? 0);
                const hasPendingChange = draftStock[p.id] !== undefined && draftStock[p.id] !== (p.stockCount ?? 0);
                const isOut = currentVal <= 0;
                const isLow = currentVal > 0 && currentVal <= lowStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-xs border border-[#E8E0D5] shrink-0"
                        />
                        <div className="min-w-0 max-w-[200px]">
                          <h4 className="font-medium text-[#1C1917] truncate">{p.name}</h4>
                          <span className="text-[10px] text-[#78716C]">925 Sterling Silver</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#57534E]">
                      {p.sku || 'SA-925-101'}
                    </td>

                    <td className="py-3.5 px-4 text-[#1C1917]">
                      {p.category}
                    </td>

                    <td className="py-3.5 px-4 text-[#1C1917]">
                      PKR {p.price.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-[#1C1917]">
                      PKR {(p.price * currentVal).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border inline-flex items-center gap-1 ${
                          isOut
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : isLow
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isOut ? 'Depleted' : isLow ? 'Low Stock' : 'Optimal'}
                      </span>
                    </td>

                    {/* Quick Inline Adjustment */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStockChange(p.id, currentVal - 1)}
                          disabled={currentVal <= 0}
                          className="w-6 h-6 border border-[#D6CEC5] bg-[#FAF8F5] flex items-center justify-center hover:bg-[#F4EFEB] disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3 text-[#1C1917]" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={currentVal}
                          onChange={(e) => handleStockChange(p.id, parseInt(e.target.value) || 0)}
                          className="w-14 px-1.5 py-1 text-center border border-[#E8E0D5] bg-white text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                        />
                        <button
                          onClick={() => handleStockChange(p.id, currentVal + 1)}
                          className="w-6 h-6 border border-[#D6CEC5] bg-[#FAF8F5] flex items-center justify-center hover:bg-[#F4EFEB]"
                        >
                          <Plus className="w-3 h-3 text-[#1C1917]" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {hasPendingChange ? (
                        <button
                          onClick={() => handleSaveInlineStock(p.id)}
                          className="px-3 py-1 bg-[#1C1917] text-white hover:bg-[#292524] text-[10px] uppercase tracking-wider font-medium inline-flex items-center gap-1 shadow-xs"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#A8A29E]">Up to date</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
