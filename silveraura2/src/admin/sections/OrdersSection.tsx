import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  X,
  Printer,
  ChevronDown,
  User,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { OrderDetails, OrderStatus } from '../../types';

export const OrdersSection: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, showAdminToast } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const statuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

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
        return 'bg-amber-100 text-amber-900 border-amber-300';
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderId.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (o.phone && o.phone.includes(search)) ||
        (o.city && o.city.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'All' || o.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const handlePrintSlip = () => {
    window.print();
  };

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
            Manage dispatch, consignment tracking, and payments across Pakistan
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 font-medium">
            Pending verification: {orders.filter((o) => o.status === 'Pending').length}
          </div>
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 font-medium">
            In Transit: {orders.filter((o) => o.status === 'Shipped').length}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID (SA-ORD-...), customer, city or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#78716C]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="All">All Pipeline Stages ({orders.length})</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s} ({orders.filter((o) => o.status === s).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E8E0D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E0D5] text-[#78716C] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Destination</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Items</th>
                <th className="py-3 px-4 font-semibold">Total (PKR)</th>
                <th className="py-3 px-4 font-semibold">Channel</th>
                <th className="py-3 px-4 font-semibold">Pipeline Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFEB]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#78716C]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-[#D6CEC5]" />
                      <p className="font-serif-luxury text-base text-[#1C1917]">No orders found matching filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1C1917]">
                      {ord.orderId}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-[#1C1917]">
                      <div>{ord.customerName}</div>
                      <div className="text-[11px] text-[#78716C] font-mono">{ord.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-[#57534E]">
                      {ord.city || 'Karachi'}
                    </td>

                    <td className="py-3.5 px-4 text-[#78716C]">
                      {ord.date}
                    </td>

                    <td className="py-3.5 px-4 text-[#57534E]">
                      {ord.items.reduce((s, it) => s + it.quantity, 0)} pcs
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#1C1917]">
                      PKR {ord.total.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-[#78716C]">
                      {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : ord.paymentMethod === 'bank' ? 'Bank Transfer' : 'Card / Raast'}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status || 'Pending'}
                        onChange={(e) => updateOrderStatus(ord.orderId, e.target.value as OrderStatus)}
                        className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 border cursor-pointer focus:outline-none ${getStatusBadge(
                          ord.status || 'Pending'
                        )}`}
                      >
                        {statuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F4EFEB] transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingOrderId(ord.orderId)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E0D5] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E0D5]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#78716C] font-semibold">
                  Atelier Consignment Record
                </span>
                <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#1C1917]">
                  Order {selectedOrder.orderId}
                </h3>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Placed on {selectedOrder.date} · Payment: {selectedOrder.paymentMethod.toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSlip}
                  className="px-3 py-1.5 border border-[#D6CEC5] text-[#1C1917] text-xs hover:bg-[#F4EFEB] inline-flex items-center gap-1.5"
                  title="Print Packing Slip"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-[#78716C] hover:text-[#1C1917]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Status Update Banner */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E0D5] flex items-center justify-between">
              <span className="text-xs text-[#57534E]">Update Order Pipeline Status:</span>
              <select
                value={selectedOrder.status || 'Pending'}
                onChange={(e) => {
                  const newStatus = e.target.value as OrderStatus;
                  updateOrderStatus(selectedOrder.orderId, newStatus);
                  setSelectedOrder({ ...selectedOrder, status: newStatus });
                }}
                className={`text-xs uppercase tracking-wider font-semibold px-3 py-1 border ${getStatusBadge(
                  selectedOrder.status || 'Pending'
                )}`}
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 border border-[#E8E0D5] bg-[#FAF8F5] space-y-2">
                <div className="font-semibold uppercase tracking-wider text-[10px] text-[#78716C] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Client Information</span>
                </div>
                <div className="font-medium text-[#1C1917] text-sm">{selectedOrder.customerName}</div>
                {selectedOrder.email && (
                  <div className="flex items-center gap-1.5 text-[#57534E]">
                    <Mail className="w-3.5 h-3.5 text-[#A8A29E]" />
                    <span>{selectedOrder.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[#57534E]">
                  <Phone className="w-3.5 h-3.5 text-[#A8A29E]" />
                  <span>{selectedOrder.phone}</span>
                </div>
              </div>

              <div className="p-4 border border-[#E8E0D5] bg-[#FAF8F5] space-y-2">
                <div className="font-semibold uppercase tracking-wider text-[10px] text-[#78716C] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Delivery Address</span>
                </div>
                <p className="text-[#1C1917] leading-relaxed">
                  {selectedOrder.address}
                </p>
                <div className="text-[#57534E]">
                  {selectedOrder.city}, Pakistan {selectedOrder.postalCode ? `· ${selectedOrder.postalCode}` : ''}
                </div>
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                Consignment Items ({selectedOrder.items.length})
              </span>
              <div className="border border-[#E8E0D5] divide-y divide-[#F4EFEB]">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-11 h-11 object-cover rounded-xs border border-[#E8E0D5]"
                      />
                      <div>
                        <h4 className="font-medium text-[#1C1917]">{item.product.name}</h4>
                        <div className="text-[11px] text-[#78716C] flex items-center gap-2">
                          <span>Size: {item.selectedSize || 'Standard'}</span>
                          <span>·</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#1C1917]">
                        PKR {(item.product.price * item.quantity).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#78716C]">
                        PKR {item.product.price.toLocaleString()} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="p-4 bg-[#FAF8F5] border border-[#E8E0D5] space-y-2 text-xs">
              <div className="flex justify-between text-[#57534E]">
                <span>Items Subtotal</span>
                <span>PKR {selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              {selectedOrder.discount && selectedOrder.discount > 0 ? (
                <div className="flex justify-between text-emerald-800">
                  <span>Privilege Code Discount</span>
                  <span>-PKR {selectedOrder.discount.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-[#57534E]">
                <span>Insured Nationwide Delivery</span>
                <span>{selectedOrder.shipping === 0 ? 'Complimentary (Free)' : `PKR ${selectedOrder.shipping}`}</span>
              </div>
              <div className="pt-2 border-t border-[#E8E0D5] flex justify-between font-semibold text-sm text-[#1C1917]">
                <span>Consignment Total</span>
                <span className="font-serif-luxury text-base">PKR {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Close button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#292524]"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Dialog */}
      {deletingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif-luxury text-xl text-[#1C1917]">Delete Order Record</h3>
            <p className="text-[#57534E]">
              Are you sure you want to permanently remove order <strong>{deletingOrderId}</strong> from archive?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingOrderId(null)}
                className="px-4 py-2 border border-[#D6CEC5] text-[#57534E]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteOrder(deletingOrderId);
                  setDeletingOrderId(null);
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
