import React from 'react';
import {
  Package,
  AlertTriangle,
  ShoppingBag,
  Clock,
  Coins,
  Layers,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Award,
  XCircle,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const DashboardSection: React.FC = () => {
  const {
    dashboardOverview,
    dashboardLoading,
    dashboardError,
    refreshDashboard,
    setActiveSection,
  } = useAdmin();

  const totalProducts = dashboardOverview?.totalProducts ?? 0;
  const activeProducts = dashboardOverview?.activeProducts ?? 0;
  const outOfStockProducts = dashboardOverview?.outOfStockProducts ?? 0;
  const lowStockProducts = dashboardOverview?.lowStockProducts ?? 0;
  const totalCategories = dashboardOverview?.totalCategories ?? 0;
  const totalOrders = dashboardOverview?.totalOrders ?? 0;
  const pendingOrders = dashboardOverview?.pendingOrders ?? 0;
  const totalRevenue = dashboardOverview?.totalRevenue ?? 0;
  const recentOrders = dashboardOverview?.recentOrders ?? [];
  const bestSellingProducts = dashboardOverview?.bestSellingProducts ?? [];

  const statusBreakdown = dashboardOverview?.statusBreakdown ?? {
    Pending: 0,
    Confirmed: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Confirmed':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100/70 text-amber-900 border-amber-300';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Failed':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Refunded':
        return 'bg-stone-100 text-stone-700 border-stone-300';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="bg-[#FAF8F5] p-6 border border-[#E8E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Executive Studio Overview
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Silver Aura Dashboard
          </h1>
          <p className="text-xs text-[#57534E] mt-1">
            Live catalog, inventory, order, and revenue totals fetched directly from Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => void refreshDashboard()}
            disabled={dashboardLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#D6CEC5] bg-white text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#F4EFEB] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${dashboardLoading ? 'animate-spin' : ''}`} />
            <span>{dashboardLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {dashboardError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Unable to Load Dashboard Data</p>
            <p className="text-rose-700">{dashboardError}</p>
          </div>
        </div>
      )}

      {/* Loading Indicator on Initial Fetch */}
      {dashboardLoading && !dashboardOverview && (
        <div className="bg-white border border-[#E8E0D5] p-10 flex items-center justify-center gap-2.5 text-xs text-[#57534E]">
          <Loader2 className="w-4 h-4 animate-spin text-[#1C1917]" />
          <span>Loading live metrics from Supabase...</span>
        </div>
      )}

      {/* 7 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#E8E0D5]">
              <Coins className="w-4 h-4 text-[#1C1917]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#1C1917] tracking-tight">
              PKR {totalRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#78716C] block mt-1">
              Excludes cancelled orders
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#E8E0D5]">
              <ShoppingBag className="w-4 h-4 text-[#1C1917]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#1C1917]">
              {totalOrders}
            </div>
            <span className="text-[11px] text-[#78716C] block mt-1">
              All recorded storefront orders
            </span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200">
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif-luxury text-2xl sm:text-3xl font-normal text-amber-900">
              {pendingOrders}
            </div>
            <span className="text-[11px] text-amber-700 block mt-1">
              Awaiting confirmation
            </span>
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-white p-5 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Total Categories
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#E8E0D5]">
              <Layers className="w-4 h-4 text-[#1C1917]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#1C1917]">
              {totalCategories}
            </div>
            <span className="text-[11px] text-[#78716C] block mt-1">
              Configured jewellery collections
            </span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#E8E0D5]">
              <Package className="w-4 h-4 text-[#1C1917]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#1C1917]">
              {totalProducts}
            </div>
            <span className="text-[11px] text-[#78716C] block mt-1">
              Total SKUs in catalog
            </span>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-5 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Active Products
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif-luxury text-2xl sm:text-3xl font-normal text-emerald-900">
              {activeProducts}
            </div>
            <span className="text-[11px] text-emerald-700 block mt-1">
              {totalProducts > 0
                ? `${Math.round((activeProducts / totalProducts) * 100)}% active in catalog`
                : 'No products added yet'}
            </span>
          </div>
        </div>

        {/* Low-Stock Products */}
        <div className="bg-white p-5 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Low-Stock Products
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between gap-2">
            <div>
              <div
                className={`font-serif-luxury text-2xl sm:text-3xl font-normal ${
                  lowStockProducts > 0 ? 'text-amber-800' : 'text-[#1C1917]'
                }`}
              >
                {lowStockProducts}
              </div>
              <span className="text-[11px] text-[#78716C] block mt-1">
                At or below alert threshold
              </span>
            </div>
            <button
              onClick={() => setActiveSection('inventory')}
              className="text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Vault</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Out-of-Stock Products */}
        <div className="bg-white p-5 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Out-of-Stock Products
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center border border-rose-200">
              <XCircle
                className={`w-4 h-4 ${
                  outOfStockProducts > 0 ? 'text-rose-600' : 'text-stone-400'
                }`}
              />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between gap-2">
            <div>
              <div
                className={`font-serif-luxury text-2xl sm:text-3xl font-normal ${
                  outOfStockProducts > 0 ? 'text-rose-700' : 'text-[#1C1917]'
                }`}
              >
                {outOfStockProducts}
              </div>
              <span className="text-[11px] text-[#78716C] block mt-1">
                0 units remaining
              </span>
            </div>
            <button
              onClick={() => setActiveSection('inventory')}
              className="text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Restock</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Status & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Status Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold">
              Order Pipeline
            </span>
            <h2 className="font-serif-luxury text-lg text-[#1C1917] mb-4">
              Orders by Status
            </h2>

            <div className="space-y-3 pt-1">
              {Object.entries(statusBreakdown).map(([status, count]) => {
                const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#1C1917] font-medium flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            status === 'Delivered'
                              ? 'bg-emerald-500'
                              : status === 'Shipped'
                              ? 'bg-blue-500'
                              : status === 'Processing'
                              ? 'bg-amber-500'
                              : status === 'Confirmed'
                              ? 'bg-indigo-500'
                              : status === 'Pending'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        />
                        {status}
                      </span>
                      <span className="text-[#78716C] font-mono">
                        {count} <span className="text-[10px]">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F4EFEB] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full transition-all duration-300 ${
                          status === 'Delivered'
                            ? 'bg-emerald-600'
                            : status === 'Shipped'
                            ? 'bg-blue-600'
                            : status === 'Processing'
                            ? 'bg-amber-600'
                            : status === 'Confirmed'
                            ? 'bg-indigo-600'
                            : status === 'Pending'
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-[#F4EFEB] flex items-center justify-between">
            <span className="text-[11px] text-[#78716C]">
              {dashboardOverview?.fetchedAt
                ? `Synced ${new Date(dashboardOverview.fetchedAt).toLocaleTimeString()}`
                : 'Awaiting sync'}
            </span>
            <button
              onClick={() => setActiveSection('orders')}
              className="text-xs uppercase tracking-wider font-semibold text-[#1C1917] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Orders Module</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-6 border border-[#E8E0D5] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F4EFEB]">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold">
                Database Feed
              </span>
              <h2 className="font-serif-luxury text-lg text-[#1C1917]">
                Recent Orders
              </h2>
            </div>
            <button
              onClick={() => setActiveSection('orders')}
              className="text-xs uppercase tracking-wider font-semibold text-[#1C1917] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Orders ({totalOrders})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ShoppingBag className="w-7 h-7 text-[#A8A29E] mx-auto stroke-[1.5]" />
              <p className="text-xs font-medium text-[#1C1917]">No orders recorded yet</p>
              <p className="text-[11px] text-[#78716C]">
                Orders placed through Supabase checkout will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8E0D5] text-[#78716C] uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 pr-3 font-semibold">Order #</th>
                    <th className="py-2.5 pr-3 font-semibold">Customer</th>
                    <th className="py-2.5 pr-3 font-semibold">City</th>
                    <th className="py-2.5 pr-3 font-semibold">Total</th>
                    <th className="py-2.5 pr-3 font-semibold">Payment</th>
                    <th className="py-2.5 pr-3 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFEB]">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 pr-3 font-mono font-medium text-[#1C1917] whitespace-nowrap">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 pr-3 font-medium text-[#1C1917]">
                        {ord.customerName}
                      </td>
                      <td className="py-3 pr-3 text-[#78716C]">{ord.city}</td>
                      <td className="py-3 pr-3 font-semibold text-[#1C1917] whitespace-nowrap">
                        PKR {ord.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border ${getPaymentStatusBadge(
                            ord.paymentStatus
                          )}`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border ${getOrderStatusBadge(
                            ord.orderStatus
                          )}`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[#78716C] whitespace-nowrap">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Best-Selling Products Panel */}
      <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#F4EFEB]">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold">
              Order Item Performance
            </span>
            <h2 className="font-serif-luxury text-lg text-[#1C1917]">
              Best-Selling Products
            </h2>
          </div>
          <button
            onClick={() => setActiveSection('products')}
            className="text-xs uppercase tracking-wider font-semibold text-[#1C1917] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Products Catalog</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {bestSellingProducts.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Award className="w-7 h-7 text-[#A8A29E] mx-auto stroke-[1.5]" />
            <p className="text-xs font-medium text-[#1C1917]">
              No best-selling rankings yet
            </p>
            <p className="text-[11px] text-[#78716C]">
              Rankings calculate automatically from non-cancelled order line items.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E0D5] text-[#78716C] uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 pr-3 font-semibold">Rank</th>
                  <th className="py-2.5 pr-3 font-semibold">Product</th>
                  <th className="py-2.5 pr-3 font-semibold">SKU</th>
                  <th className="py-2.5 pr-3 font-semibold">Units Sold</th>
                  <th className="py-2.5 pr-3 font-semibold">Orders</th>
                  <th className="py-2.5 font-semibold text-right">Line Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFEB]">
                {bestSellingProducts.map((item, idx) => (
                  <tr key={item.productId} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 pr-3 font-serif-luxury text-sm text-[#1C1917]">
                      #{idx + 1}
                    </td>
                    <td className="py-3 pr-3 font-medium text-[#1C1917]">
                      {item.productName}
                    </td>
                    <td className="py-3 pr-3 font-mono text-[11px] text-[#78716C]">
                      {item.productSku || '—'}
                    </td>
                    <td className="py-3 pr-3 font-semibold text-[#1C1917]">
                      {item.unitsSold} unit{item.unitsSold === 1 ? '' : 's'}
                    </td>
                    <td className="py-3 pr-3 text-[#57534E]">
                      {item.orderCount} order{item.orderCount === 1 ? '' : 's'}
                    </td>
                    <td className="py-3 text-right font-semibold text-[#1C1917] whitespace-nowrap">
                      PKR {item.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
