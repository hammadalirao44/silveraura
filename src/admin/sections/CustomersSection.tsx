import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Crown,
  Eye,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
  Users,
  ShoppingBag,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { AdminCustomer, AdminOrder, CustomerStatus } from '../../types';
import {
  fetchAdminCustomers,
  updateAdminCustomerStatus,
} from '../../services/adminCustomerService';
import { fetchOrdersByCustomer } from '../../services/adminOrderService';

export const CustomersSection: React.FC = () => {
  const { isSupabaseReady, supabaseError, showAdminToast } = useAdmin();

  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [profileOnlyIds, setProfileOnlyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyCustomerId, setBusyCustomerId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | CustomerStatus>('All');
  const [accountTypeFilter, setAccountTypeFilter] = useState<'All' | 'registered' | 'guest'>('All');

  // Detail modal & customer orders
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    if (!isSupabaseReady) {
      setLoading(false);
      setLoadError(
        supabaseError ||
          'Supabase environment variables are not configured. Customer directory requires a connected Supabase project.'
      );
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetchAdminCustomers();
      setCustomers(res.customers);
      setProfileOnlyIds(res.profileOnlyIds);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to fetch customers.';
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [isSupabaseReady, supabaseError]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const handleOpenCustomer = async (cust: AdminCustomer) => {
    setSelectedCustomer(cust);
    setCustomerOrders([]);
    setOrdersError(null);
    setOrdersLoading(true);

    try {
      const history = await fetchOrdersByCustomer(cust.id, cust.email);
      setCustomerOrders(history);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to load customer order history.';
      setOrdersError(msg);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusChange = async (cust: AdminCustomer, nextStatus: CustomerStatus) => {
    if (profileOnlyIds.has(cust.id)) return;
    setBusyCustomerId(cust.id);
    try {
      await updateAdminCustomerStatus(cust.id, nextStatus);
      setCustomers((prev) =>
        prev.map((c) => (c.id === cust.id ? { ...c, status: nextStatus } : c))
      );
      if (selectedCustomer?.id === cust.id) {
        setSelectedCustomer({ ...selectedCustomer, status: nextStatus });
      }
      showAdminToast(`${cust.name} updated to ${nextStatus}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to update customer status.';
      showAdminToast(msg, 'error');
    } finally {
      setBusyCustomerId(null);
    }
  };

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchType =
        accountTypeFilter === 'All' ||
        (accountTypeFilter === 'registered' && c.isRegistered) ||
        (accountTypeFilter === 'guest' && !c.isRegistered);

      return matchSearch && matchStatus && matchType;
    });
  }, [customers, search, statusFilter, accountTypeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Silver Aura Patronage
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Customer Directory
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            {customers.length} customer{customers.length === 1 ? '' : 's'} across registered accounts and storefront checkouts
          </p>
        </div>

        <button
          onClick={() => void loadCustomers()}
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
            onClick={() => void loadCustomers()}
            className="px-3 py-1.5 bg-rose-900 text-white uppercase tracking-wider text-[11px] font-medium hover:bg-rose-800 shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email or phone..."
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
            value={accountTypeFilter}
            onChange={(e) =>
              setAccountTypeFilter(e.target.value as 'All' | 'registered' | 'guest')
            }
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="All">All Account Types</option>
            <option value="registered">Registered Accounts</option>
            <option value="guest">Checkout Guests</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | CustomerStatus)}
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="All">All Tiers</option>
            <option value="VIP">VIP</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Loading / Empty / Table */}
      {loading ? (
        <div className="bg-white border border-[#E8E0D5] p-12 text-center space-y-3 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#78716C] mx-auto" />
          <p className="text-xs text-[#78716C] uppercase tracking-widest">
            Loading Customer Directory...
          </p>
        </div>
      ) : customers.length === 0 && !loadError ? (
        <div className="bg-white border border-[#E8E0D5] p-12 text-center space-y-3 shadow-xs">
          <Users className="w-7 h-7 text-[#A8A29E] mx-auto" />
          <h3 className="font-serif-luxury text-2xl text-[#1C1917]">No customers recorded yet</h3>
          <p className="text-xs text-[#57534E] max-w-md mx-auto">
            Registered accounts and customers created during storefront checkout will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E0D5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E0D5] text-[#78716C] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Email & Phone</th>
                  <th className="py-3 px-4 font-semibold">City</th>
                  <th className="py-3 px-4 font-semibold">Total Orders</th>
                  <th className="py-3 px-4 font-semibold">Total Spent</th>
                  <th className="py-3 px-4 font-semibold">Joined</th>
                  <th className="py-3 px-4 font-semibold">Tier</th>
                  <th className="py-3 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFEB]">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#78716C]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-[#D6CEC5]" />
                        <p className="font-serif-luxury text-base text-[#1C1917]">
                          No customers matched your criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const isProfileOnly = profileOnlyIds.has(c.id);
                    const isBusy = busyCustomerId === c.id;

                    return (
                      <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#F4EFEB] border border-[#E8E0D5] flex items-center justify-center text-xs font-semibold text-[#1C1917] shrink-0">
                              {(c.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-[#1C1917] truncate max-w-[180px]">
                                {c.name}
                              </div>
                              <span className="text-[10px] uppercase tracking-wider text-[#78716C]">
                                {c.isRegistered ? 'Registered Account' : 'Checkout Guest'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#57534E]">
                          <div className="truncate max-w-[200px]">{c.email || '—'}</div>
                          <div className="text-[11px] text-[#78716C] font-mono">
                            {c.phone || '—'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#1C1917]">{c.city || '—'}</td>

                        <td className="py-3.5 px-4 font-semibold text-[#1C1917] tabular-nums">
                          {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                        </td>

                        <td className="py-3.5 px-4 font-serif-luxury font-medium text-sm text-[#1C1917] tabular-nums whitespace-nowrap">
                          PKR {c.totalSpent.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-[#78716C] whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-4">
                          {isProfileOnly ? (
                            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border bg-stone-50 text-stone-700 border-stone-200">
                              Registered
                            </span>
                          ) : (
                            <select
                              disabled={isBusy}
                              value={c.status}
                              onChange={(e) =>
                                void handleStatusChange(c, e.target.value as CustomerStatus)
                              }
                              className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border cursor-pointer focus:outline-none disabled:opacity-50 ${
                                c.status === 'VIP'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : c.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-stone-100 text-stone-600 border-stone-200'
                              }`}
                            >
                              <option value="Active">Active</option>
                              <option value="VIP">VIP</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => void handleOpenCustomer(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#D6CEC5] text-[#1C1917] hover:bg-[#F4EFEB] text-[11px] uppercase tracking-wider font-medium cursor-pointer"
                            title="View Details & Order History"
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

      {/* Customer Detail & Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E0D5] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 text-xs my-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E0D5]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1C1917] text-white flex items-center justify-center font-serif-luxury text-xl shrink-0">
                  {(selectedCustomer.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif-luxury text-xl text-[#1C1917]">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-[#78716C]">
                    {selectedCustomer.isRegistered ? 'Registered Account' : 'Checkout Guest'} · Joined{' '}
                    {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                aria-label="Close customer details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#FAF8F5] border border-[#E8E0D5]">
              <div>
                <span className="text-[10px] text-[#78716C] uppercase tracking-wider block">
                  Total Spending
                </span>
                <span className="font-serif-luxury text-lg text-[#1C1917] tabular-nums">
                  PKR {selectedCustomer.totalSpent.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#78716C] uppercase tracking-wider block">
                  Total Orders
                </span>
                <span className="font-semibold text-base text-[#1C1917] tabular-nums">
                  {selectedCustomer.totalOrders}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#78716C] uppercase tracking-wider block">
                  Tier
                </span>
                <span className="font-semibold text-sm text-[#1C1917] inline-flex items-center gap-1 mt-0.5">
                  {selectedCustomer.status === 'VIP' && (
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>{selectedCustomer.status}</span>
                </span>
              </div>
            </div>

            {/* Contact & Shipping Details (No auth credentials or internal UIDs) */}
            <div className="space-y-2 p-4 border border-[#E8E0D5]">
              <div className="flex items-center gap-2 text-[#57534E]">
                <Mail className="w-4 h-4 text-[#A8A29E] shrink-0" />
                <span>{selectedCustomer.email || 'No email recorded'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#57534E]">
                <Phone className="w-4 h-4 text-[#A8A29E] shrink-0" />
                <span className="font-mono">{selectedCustomer.phone || 'No phone recorded'}</span>
              </div>
              <div className="flex items-start gap-2 text-[#57534E]">
                <MapPin className="w-4 h-4 text-[#A8A29E] shrink-0 mt-0.5" />
                <span>
                  {[
                    selectedCustomer.address,
                    selectedCustomer.city,
                    selectedCustomer.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'No address saved'}
                </span>
              </div>
            </div>

            {/* Customer Order History */}
            <div className="space-y-2">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#78716C] block">
                Order History
              </span>

              {ordersLoading ? (
                <div className="py-6 text-center border border-[#E8E0D5] flex items-center justify-center gap-2 text-[#78716C]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading order history...</span>
                </div>
              ) : ordersError ? (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800">
                  {ordersError}
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-[#E8E0D5] text-[#78716C] space-y-1">
                  <ShoppingBag className="w-5 h-5 text-[#A8A29E] mx-auto" />
                  <p>No orders linked to this customer yet.</p>
                </div>
              ) : (
                <div className="border border-[#E8E0D5] divide-y divide-[#F4EFEB] max-h-60 overflow-y-auto">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="p-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-mono font-medium text-[#1C1917]">
                          {ord.orderNumber}
                        </div>
                        <div className="text-[11px] text-[#78716C]">
                          {new Date(ord.createdAt).toLocaleDateString()} ·{' '}
                          {ord.items.reduce((s, i) => s + i.quantity, 0)} item(s) · Payment:{' '}
                          {ord.paymentStatus}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-[#1C1917] tabular-nums">
                          PKR {ord.totalAmount.toLocaleString()}
                        </div>
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-[#E8E0D5] bg-[#FAF8F5]">
                          {ord.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 bg-[#1C1917] text-white uppercase tracking-wider text-xs font-medium hover:bg-[#292524] cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
