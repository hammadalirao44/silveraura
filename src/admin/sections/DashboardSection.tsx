import React from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  Clock,
  Coins,
  ArrowUpRight,
  Plus,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const DashboardSection: React.FC = () => {
  const {
    products,
    categories,
    orders,
    setActiveSection,
    updateOrderStatus,
  } = useAdmin();

  // Metrics computation
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status !== 'inactive').length;
  const outOfStock = products.filter((p) => (p.stockCount ?? 0) <= 0 || !p.inStock).length;
  const lowStock = products.filter((p) => (p.stockCount ?? 0) > 0 && (p.stockCount ?? 0) <= 5).length;
  const totalCategories = categories.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Status breakdown
  const statusCounts = {
    Pending: orders.filter((o) => o.status === 'Pending').length,
    Confirmed: orders.filter((o) => o.status === 'Confirmed').length,
    Processing: orders.filter((o) => o.status === 'Processing').length,
    Shipped: orders.filter((o) => o.status === 'Shipped').length,
    Delivered: orders.filter((o) => o.status === 'Delivered').length,
    Cancelled: orders.filter((o) => o.status === 'Cancelled').length,
  };

  // Best sellers based on mock or real flags
  const bestSellers = products
    .filter((p) => p.isBestSeller || (p.rating && p.rating >= 4.8))
    .slice(0, 5);

  // Recent 6 orders
  const recentOrders = orders.slice(0, 6);

  // Weekly Revenue Sample for SVG Chart
  const weeklyData = [
    { day: 'Mon', revenue: 42500, orders: 4 },
    { day: 'Tue', revenue: 68900, orders: 6 },
    { day: 'Wed', revenue: 51200, orders: 5 },
    { day: 'Thu', revenue: 84000, orders: 8 },
    { day: 'Fri', revenue: 112500, orders: 11 },
    { day: 'Sat', revenue: 145000, orders: 14 },
    { day: 'Sun', revenue: 128900, orders: 12 },
  ];
  const maxWeeklyRev = Math.max(...weeklyData.map((d) => d.revenue));

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Actions Bar */}
      <div className="bg-[#FAF8F5] p-6 border border-[#E8E0D5] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Executive Studio Overview
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Silver Aura Atelier Management
          </h2>
          <p className="text-xs text-[#57534E] mt-1">
            Real-time live monitoring of solid 925 silver orders, luxury inventory, and customer reservations across Pakistan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveSection('products')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Jewellery</span>
          </button>
          <button
            onClick={() => setActiveSection('orders')}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#D6CEC5] bg-white text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#F4EFEB] transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Review Orders ({pendingOrders} Pending)</span>
          </button>
        </div>
      </div>

      {/* 7 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="col-span-2 md:col-span-2 lg:col-span-2 bg-white p-5 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Total Net Sales</span>
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#E8E0D5]">
              <Coins className="w-4 h-4 text-[#1C1917]" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-[#78716C]">Gross Confirmed</span>
            <div className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#1C1917] tracking-tight">
              PKR {totalRevenue.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last calendar week</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#78716C]" />
          </div>
          <div className="mt-3">
            <div className="font-serif-luxury text-2xl font-normal text-[#1C1917]">
              {totalOrders}
            </div>
            <span className="text-[11px] text-[#78716C]">TCS & Leopards</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <div className="font-serif-luxury text-2xl font-normal text-amber-900">
              {pendingOrders}
            </div>
            <span className="text-[11px] text-amber-700">Requires verification</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Catalog</span>
            <Package className="w-4 h-4 text-[#78716C]" />
          </div>
          <div className="mt-3">
            <div className="font-serif-luxury text-2xl font-normal text-[#1C1917]">
              {totalProducts}
            </div>
            <span className="text-[11px] text-[#78716C]">{activeProducts} live on store</span>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Suites</span>
            <Layers className="w-4 h-4 text-[#78716C]" />
          </div>
          <div className="mt-3">
            <div className="font-serif-luxury text-2xl font-normal text-[#1C1917]">
              {totalCategories}
            </div>
            <span className="text-[11px] text-[#78716C]">Curated categories</span>
          </div>
        </div>

        {/* Out of Stock / Low Stock */}
        <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Stock Alert</span>
            <AlertTriangle className={`w-4 h-4 ${outOfStock > 0 ? 'text-rose-600' : 'text-amber-500'}`} />
          </div>
          <div className="mt-3">
            <div className={`font-serif-luxury text-2xl font-normal ${outOfStock > 0 ? 'text-rose-700' : 'text-amber-700'}`}>
              {outOfStock}
            </div>
            <span className="text-[11px] text-[#78716C]">{lowStock} low stock items</span>
          </div>
        </div>
      </div>

      {/* Analytics Row: Sales Graph + Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Visual Chart */}
        <div className="lg:col-span-8 bg-white p-6 border border-[#E8E0D5] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#F4EFEB]">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold">Weekly Atelier Velocity</span>
              <h3 className="font-serif-luxury text-lg text-[#1C1917]">Revenue Performance (PKR)</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#78716C]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last 7 Days (Karachi & Nationwide)</span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6">
            <div className="h-48 flex items-end gap-3 sm:gap-6 justify-between pt-6 px-2 border-b border-[#E8E0D5]">
              {weeklyData.map((item, idx) => {
                const heightPct = Math.round((item.revenue / maxWeeklyRev) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-12 bg-[#1C1917] text-white text-[10px] py-1 px-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-md">
                      <span>PKR {item.revenue.toLocaleString()}</span>
                      <span className="text-[#A8A29E] ml-1">({item.orders} orders)</span>
                    </div>

                    <div className="w-full max-w-[42px] bg-[#FAF8F5] rounded-t-sm flex items-end justify-center h-full">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-[#1C1917] group-hover:bg-[#44403C] transition-all duration-300 rounded-t-xs"
                      />
                    </div>
                    <span className="text-[11px] text-[#78716C] group-hover:text-[#1C1917] font-medium transition-colors">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-[#78716C] pt-3">
              <span>Average Daily Volume: PKR 90,442</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#1C1917] inline-block" />
                  <span>Gross Sales</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="lg:col-span-4 bg-white p-6 border border-[#E8E0D5] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold">Fulfillment Logistics</span>
            <h3 className="font-serif-luxury text-lg text-[#1C1917] mb-4">Orders by Pipeline Status</h3>

            <div className="space-y-3 pt-2">
              {Object.entries(statusCounts).map(([status, count]) => {
                const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#1C1917] font-medium flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          status === 'Delivered' ? 'bg-emerald-500' :
                          status === 'Shipped' ? 'bg-blue-500' :
                          status === 'Processing' ? 'bg-amber-500' :
                          status === 'Pending' ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        {status}
                      </span>
                      <span className="text-[#78716C] font-mono">
                        {count} <span className="text-[10px]">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F4EFEB] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full ${
                          status === 'Delivered' ? 'bg-emerald-600' :
                          status === 'Shipped' ? 'bg-blue-600' :
                          status === 'Processing' ? 'bg-amber-600' :
                          status === 'Pending' ? 'bg-amber-400' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-[#F4EFEB] flex items-center justify-between">
            <span className="text-xs text-[#78716C]">Couriers: TCS, Leopards, M&P</span>
            <button
              onClick={() => setActiveSection('orders')}
              className="text-xs uppercase tracking-wider font-semibold text-[#1C1917] hover:underline flex items-center gap-1"
            >
              <span>Manage Pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Split Row: Best Selling Creations + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Best Selling Products */}
        <div className="lg:col-span-5 bg-white p-6 border border-[#E8E0D5] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F4EFEB]">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold">Curator Picks</span>
              <h3 className="font-serif-luxury text-lg text-[#1C1917]">Most Coveted Pieces</h3>
            </div>
            <button
              onClick={() => setActiveSection('products')}
              className="text-xs text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-[#F4EFEB] mt-2">
            {bestSellers.map((item, idx) => (
              <div key={item.id} className="py-3 flex items-center gap-3 group">
                <span className="text-xs font-serif-luxury text-[#A8A29E] w-4">{idx + 1}.</span>
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-11 h-11 object-cover rounded-xs border border-[#E8E0D5] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-[#1C1917] truncate group-hover:text-[#78716C] transition-colors">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#78716C]">
                    <span>{item.category}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-medium">In Stock ({item.stockCount})</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-[#1C1917]">
                    PKR {item.price.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#A8A29E] flex items-center justify-end gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    {item.rating || 4.9}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white p-6 border border-[#E8E0D5] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F4EFEB]">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold">Live Feed</span>
              <h3 className="font-serif-luxury text-lg text-[#1C1917]">Recent Customer Orders</h3>
            </div>
            <button
              onClick={() => setActiveSection('orders')}
              className="text-xs uppercase tracking-wider font-semibold text-[#1C1917] hover:underline flex items-center gap-1"
            >
              <span>All Orders ({orders.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E0D5] text-[#78716C] uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 font-semibold">Order ID</th>
                  <th className="py-2.5 font-semibold">Customer</th>
                  <th className="py-2.5 font-semibold">City</th>
                  <th className="py-2.5 font-semibold">Total</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFEB]">
                {recentOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 font-mono font-medium text-[#1C1917]">
                      {ord.orderId}
                    </td>
                    <td className="py-3 font-medium text-[#1C1917]">
                      {ord.customerName}
                    </td>
                    <td className="py-3 text-[#78716C]">
                      {ord.city || 'Karachi'}
                    </td>
                    <td className="py-3 font-semibold text-[#1C1917]">
                      PKR {ord.total.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border ${getStatusBadge(ord.status || 'Pending')}`}>
                        {ord.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {ord.status === 'Pending' ? (
                        <button
                          onClick={() => updateOrderStatus(ord.orderId, 'Confirmed')}
                          className="px-2 py-1 bg-emerald-800 text-white hover:bg-emerald-900 text-[10px] uppercase tracking-wider font-medium transition-colors"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveSection('orders')}
                          className="text-[#78716C] hover:text-[#1C1917] p-1 inline-flex items-center"
                          title="View order"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
