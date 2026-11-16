import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Eye,
  X,
  Printer,
  User,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  RefreshCw,
  Loader2,
  Clock,
  CreditCard,
  Save,
  Package,
  Calendar,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { AdminOrder, OrderStatus, PaymentStatus } from '../../types';
import { fetchAdminOrders, updateAdminOrder } from '../../services/adminOrderService';

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const PAYMENT_STATUSES: PaymentStatus[] = ['Pending', 'Paid', 'Failed', 'Refunded'];

export const OrdersSection: React.FC = () => {
  const { isSupabaseReady, supabaseError, showAdminToast, refreshDashboard } = useAdmin();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  // Search & filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | PaymentStatus>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Detail modal & notes draft
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Cancellation confirmation state
  const [pendingCancelOrder, setPendingCancelOrder] = useState<AdminOrder | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!isSupabaseReady) {
      setLoading(false);
      setLoadError(
        supabaseError ||
          'Supabase environment variables are not configured. Orders management requires a connected Supabase project.'
      );
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAdminOrders();
      setOrders(data);
      setSelectedOrder((prev) => (prev ? data.find((o) => o.id === prev.id) ?? null : null));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to fetch orders.';
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [isSupabaseReady, supabaseError]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const openOrderModal = (ord: AdminOrder) => {
    setSelectedOrder(ord);
    setNotesDraft(ord.notes ?? '');
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
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
        return 'bg-amber-100/80 text-amber-900 border-amber-300';
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
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

  const formatPaymentMethod = (method: AdminOrder['paymentMethod']) => {
    if (method === 'cod') return 'Cash on Delivery';
    if (method === 'bank_transfer') return 'Bank Transfer';
    return 'Card';
  };

  const applyOrderUpdate = async (
    order: AdminOrder,
    updates: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus; notes?: string | null },
    successMessage: string
  ) => {
    setBusyOrderId(order.id);
    try {
      const updated = await updateAdminOrder(order.id, updates);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      if (selectedOrder?.id === updated.id) {
        setSelectedOrder(updated);
      }
      showAdminToast(successMessage);
      await refreshDashboard();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to update order.';
      showAdminToast(msg, 'error');
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleOrderStatusSelect = (order: AdminOrder, nextStatus: OrderStatus) => {
    if (nextStatus === order.orderStatus) return;
    if (nextStatus === 'Cancelled') {
      setPendingCancelOrder(order);
      return;
    }
    void applyOrderUpdate(
      order,
      { orderStatus: nextStatus },
      `Order ${order.orderNumber} updated to ${nextStatus}`
    );
  };

  const handleConfirmCancellation = async () => {
    if (!pendingCancelOrder) return;
    setCancelling(true);
    try {
      await applyOrderUpdate(
        pendingCancelOrder,
        { orderStatus: 'Cancelled' },
        `Order ${pendingCancelOrder.orderNumber} marked as Cancelled`
      );
      setPendingCancelOrder(null);
    } finally {
      setCancelling(false);
    }
  };

  const handlePaymentStatusSelect = (order: AdminOrder, nextPayment: PaymentStatus) => {
    if (nextPayment === order.paymentStatus) return;
    void applyOrderUpdate(
      order,
      { paymentStatus: nextPayment },
      `Payment for ${order.orderNumber} marked ${nextPayment}`
    );
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    setSavingNotes(true);
    try {
      const cleanNotes = notesDraft.trim() ? notesDraft.trim() : null;
      await applyOrderUpdate(
        selectedOrder,
        { notes: cleanNotes },
        `Updated notes on order ${selectedOrder.orderNumber}`
      );
    } finally {
      setSavingNotes(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
      const matchesPayment = paymentFilter === 'All' || o.paymentStatus === paymentFilter;

      const orderDay = o.createdAt.slice(0, 10);
      const matchesFrom = !dateFrom || orderDay >= dateFrom;
      const matchesTo = !dateTo || orderDay <= dateTo;

      return matchesSearch && matchesStatus && matchesPayment && matchesFrom && matchesTo;
    });
  }, [orders, search, statusFilter, paymentFilter, dateFrom, dateTo]);

  const pendingCount = orders.filter((o) => o.orderStatus === 'Pending').length;
  const shippedCount = orders.filter((o) => o.orderStatus === 'Shipped').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Fulfillment Logistics
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Order Pipeline
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            {orders.length} order{orders.length === 1 ? '' : 's'} ({pendingCount} pending · {shippedCount} in transit)
          </p>
        </div>

        <button
          onClick={() => void loadOrders()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#D6CEC5] text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#FAF8F5] transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error State */}
      {loadError && (
        <div className="bg-rose-50 border border-rose-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={() => void loadOrders()}
            className="px-3 py-1.5 bg-rose-900 text-white uppercase tracking-wider text-[11px] font-medium hover:bg-rose-800 shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs space-y-3 text-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order number, customer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | OrderStatus)}
              className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
            >
              <option value="All">All Order Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s} ({orders.filter((o) => o.orderStatus === s).length})
                </option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'All' | PaymentStatus)}
              className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
            >
              <option value="All">All Payment Statuses</option>
              {PAYMENT_STATUSES.map((ps) => (
                <option key={ps} value={ps}>
                  Payment: {ps}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F4EFEB]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-[#78716C] inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Date range:</span>
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="Filter from date"
              className="px-2.5 py-1 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
            />
            <span className="text-[#A8A29E]">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label="Filter to date"
              className="px-2.5 py-1 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
            />
            {(dateFrom || dateTo || statusFilter !== 'All' || paymentFilter !== 'All' || search) && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('All');
                  setPaymentFilter('All');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="text-[11px] text-[#1C1917] underline ml-2 cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          <span className="text-[11px] text-[#78716C]">
            Showing <strong className="text-[#1C1917]">{filteredOrders.length}</strong> of{' '}
            {orders.length} orders
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white border border-[#E8E0D5] p-12 text-center space-y-3 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#78716C] mx-auto" />
          <p className="text-xs text-[#78716C] uppercase tracking-widest">
            Loading Storefront Orders...
          </p>
        </div>
      ) : orders.length === 0 && !loadError ? (
        <div className="bg-white border border-[#E8E0D5] p-12 text-center space-y-3 shadow-xs">
          <Package className="w-7 h-7 text-[#A8A29E] mx-auto" />
          <h3 className="font-serif-luxury text-2xl text-[#1C1917]">No orders placed yet</h3>
          <p className="text-xs text-[#57534E] max-w-md mx-auto">
            Storefront orders submitted through Supabase checkout will appear here automatically.
          </p>
        </div>
      ) : (
        /* Orders Table */
        <div className="bg-white border border-[#E8E0D5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E0D5] text-[#78716C] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">Order #</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">City</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Items</th>
                  <th className="py-3 px-4 font-semibold">Total (PKR)</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Order Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFEB]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#78716C]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-[#D6CEC5]" />
                        <p className="font-serif-luxury text-base text-[#1C1917]">
                          No orders match your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const isBusy = busyOrderId === ord.id;
                    const itemCount = ord.items.reduce((sum, i) => sum + i.quantity, 0);

                    return (
                      <tr key={ord.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#1C1917] whitespace-nowrap">
                          {ord.orderNumber}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#1C1917]">{ord.customerName}</div>
                          <div className="text-[11px] text-[#78716C] truncate max-w-[180px]">
                            {ord.customerEmail}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#57534E]">{ord.city || '—'}</td>

                        <td className="py-3.5 px-4 text-[#78716C] whitespace-nowrap">
                          <div>{new Date(ord.createdAt).toLocaleDateString()}</div>
                          <div className="text-[10px] text-[#A8A29E]">
                            {new Date(ord.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#57534E] tabular-nums">
                          {itemCount} {itemCount === 1 ? 'pc' : 'pcs'}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-[#1C1917] tabular-nums whitespace-nowrap">
                          PKR {ord.totalAmount.toLocaleString()}
                        </td>

                        {/* Payment Method & Status */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-[#78716C] block">
                              {formatPaymentMethod(ord.paymentMethod)}
                            </span>
                            <select
                              disabled={isBusy}
                              value={ord.paymentStatus}
                              onChange={(e) =>
                                handlePaymentStatusSelect(ord, e.target.value as PaymentStatus)
                              }
                              className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 border cursor-pointer focus:outline-none disabled:opacity-50 ${getPaymentStatusBadge(
                                ord.paymentStatus
                              )}`}
                            >
                              {PAYMENT_STATUSES.map((ps) => (
                                <option key={ps} value={ps}>
                                  {ps}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Order Status */}
                        <td className="py-3.5 px-4">
                          <select
                            disabled={isBusy}
                            value={ord.orderStatus}
                            onChange={(e) =>
                              handleOrderStatusSelect(ord, e.target.value as OrderStatus)
                            }
                            className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 border cursor-pointer focus:outline-none disabled:opacity-50 ${getOrderStatusBadge(
                              ord.orderStatus
                            )}`}
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openOrderModal(ord)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#D6CEC5] text-[#1C1917] hover:bg-[#F4EFEB] text-[11px] uppercase tracking-wider font-medium cursor-pointer"
                            title="Inspect Full Order"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E0D5] max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-6 space-y-6">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#78716C] font-semibold">
                  Order Consignment Record
                </span>
                <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#1C1917]">
                  Order {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Placed {new Date(selectedOrder.createdAt).toLocaleString()} · Updated{' '}
                  {new Date(selectedOrder.updatedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-start">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 border border-[#D6CEC5] text-[#1C1917] text-xs hover:bg-[#F4EFEB] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                  aria-label="Close order details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Order History & Status Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FAF8F5] border border-[#E8E0D5] space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Order Pipeline Status</span>
                </span>
                <select
                  disabled={busyOrderId === selectedOrder.id}
                  value={selectedOrder.orderStatus}
                  onChange={(e) =>
                    handleOrderStatusSelect(selectedOrder, e.target.value as OrderStatus)
                  }
                  className={`w-full text-xs uppercase tracking-wider font-semibold px-3 py-2 border cursor-pointer ${getOrderStatusBadge(
                    selectedOrder.orderStatus
                  )}`}
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-[#78716C] pt-1 space-y-0.5">
                  <div>Created: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                  <div>Last modified: {new Date(selectedOrder.updatedAt).toLocaleString()}</div>
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] border border-[#E8E0D5] space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payment Status & Method</span>
                </span>
                <select
                  disabled={busyOrderId === selectedOrder.id}
                  value={selectedOrder.paymentStatus}
                  onChange={(e) =>
                    handlePaymentStatusSelect(selectedOrder, e.target.value as PaymentStatus)
                  }
                  className={`w-full text-xs uppercase tracking-wider font-semibold px-3 py-2 border cursor-pointer ${getPaymentStatusBadge(
                    selectedOrder.paymentStatus
                  )}`}
                >
                  {PAYMENT_STATUSES.map((ps) => (
                    <option key={ps} value={ps}>
                      {ps}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-[#78716C] pt-1">
                  Channel: <strong className="text-[#1C1917]">{formatPaymentMethod(selectedOrder.paymentMethod)}</strong>
                  {selectedOrder.couponCode && (
                    <span className="block">
                      Coupon applied: <strong className="font-mono text-[#1C1917]">{selectedOrder.couponCode}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer & Delivery Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 border border-[#E8E0D5] bg-white space-y-2">
                <div className="font-semibold uppercase tracking-wider text-[10px] text-[#78716C] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Customer Information</span>
                </div>
                <div className="font-medium text-[#1C1917] text-sm">
                  {selectedOrder.customerName}
                </div>
                <div className="flex items-center gap-1.5 text-[#57534E]">
                  <Mail className="w-3.5 h-3.5 text-[#A8A29E]" />
                  <span>{selectedOrder.customerEmail || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#57534E]">
                  <Phone className="w-3.5 h-3.5 text-[#A8A29E]" />
                  <span className="font-mono">{selectedOrder.customerPhone}</span>
                </div>
              </div>

              <div className="p-4 border border-[#E8E0D5] bg-white space-y-2">
                <div className="font-semibold uppercase tracking-wider text-[10px] text-[#78716C] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Shipping Destination</span>
                </div>
                <p className="text-[#1C1917] leading-relaxed">{selectedOrder.shippingAddress}</p>
                <div className="text-[#57534E]">
                  {selectedOrder.city}
                  {selectedOrder.postalCode ? ` · ${selectedOrder.postalCode}` : ''}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C] block">
                Ordered Items ({selectedOrder.items.length})
              </span>
              <div className="border border-[#E8E0D5] divide-y divide-[#F4EFEB]">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <h4 className="font-medium text-[#1C1917]">{item.productName}</h4>
                      <div className="text-[11px] text-[#78716C] flex flex-wrap items-center gap-2 mt-0.5">
                        {item.productSku && <span className="font-mono">SKU: {item.productSku}</span>}
                        {item.variantSnapshot && (
                          <>
                            <span>·</span>
                            <span>Option: {item.variantSnapshot}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-[#1C1917] tabular-nums">
                        PKR {item.lineTotal.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#78716C] tabular-nums">
                        PKR {item.unitPrice.toLocaleString()} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div className="space-y-2 text-xs">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C] block">
                Order / Dispatch Notes
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Add tracking number, customer note, or courier reference..."
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
                <button
                  onClick={() => void handleSaveNotes()}
                  disabled={savingNotes}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1C1917] text-white uppercase tracking-wider text-[11px] font-medium hover:bg-[#292524] disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {savingNotes ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Note</span>
                </button>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="p-4 bg-[#FAF8F5] border border-[#E8E0D5] space-y-2 text-xs">
              <div className="flex justify-between text-[#57534E]">
                <span>Subtotal</span>
                <span className="tabular-nums">PKR {selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>
                    Discount {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}
                  </span>
                  <span className="tabular-nums">
                    - PKR {selectedOrder.discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#57534E]">
                <span>Shipping Cost</span>
                <span className="tabular-nums">
                  {selectedOrder.shippingCost === 0
                    ? 'Complimentary'
                    : `PKR ${selectedOrder.shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E8E0D5] flex justify-between font-semibold text-sm text-[#1C1917]">
                <span>Order Total</span>
                <span className="font-serif-luxury text-base tabular-nums">
                  PKR {selectedOrder.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#292524] cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {pendingCancelOrder && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif-luxury text-xl text-[#1C1917]">
                Confirm Order Cancellation
              </h3>
            </div>
            <p className="text-[#57534E] leading-relaxed">
              Are you sure you want to cancel order{' '}
              <strong className="font-mono text-[#1C1917]">
                {pendingCancelOrder.orderNumber}
              </strong>{' '}
              for <strong>{pendingCancelOrder.customerName}</strong>?
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
              Stock quantities are <strong>not automatically restored</strong> on cancellation. If items are returned to inventory, adjust stock manually in the Inventory module.
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingCancelOrder(null)}
                disabled={cancelling}
                className="px-4 py-2 border border-[#D6CEC5] text-[#57534E] hover:bg-[#F4EFEB] cursor-pointer"
              >
                Keep Current Status
              </button>
              <button
                onClick={() => void handleConfirmCancellation()}
                disabled={cancelling}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 text-white uppercase tracking-wider font-semibold hover:bg-rose-800 disabled:opacity-60 cursor-pointer"
              >
                {cancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{cancelling ? 'Cancelling...' : 'Confirm Cancellation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
