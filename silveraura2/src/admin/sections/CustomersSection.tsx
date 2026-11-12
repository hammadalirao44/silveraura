import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  MapPin,
  Crown,
  Eye,
  Plus,
  Trash2,
  Edit2,
  X,
  ShoppingBag,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Customer } from '../../types';

export const CustomersSection: React.FC = () => {
  const { customers, orders, addCustomer, updateCustomer, deleteCustomer, showAdminToast } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'VIP' | 'Inactive'>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Karachi',
    address: '',
    status: 'Active' as 'Active' | 'VIP' | 'Inactive',
  });

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '+92 3',
      city: 'Karachi',
      address: '',
      status: 'Active',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      email: cust.email,
      phone: cust.phone,
      city: cust.city,
      address: cust.address || '',
      status: cust.status,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showAdminToast('Please provide customer name', 'error');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        status: formData.status,
      });
    } else {
      addCustomer({
        name: formData.name.trim(),
        email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '')}@client.pk`,
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        status: formData.status,
      });
    }

    setIsAddModalOpen(false);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.city.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [customers, search, statusFilter]);

  // Find customer orders
  const getCustomerOrders = (customer: Customer) => {
    return orders.filter(
      (o) =>
        o.customerName.toLowerCase() === customer.name.toLowerCase() ||
        (o.email && o.email.toLowerCase() === customer.email.toLowerCase()) ||
        (o.phone && o.phone === customer.phone)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Silver Aura Society & Patronage
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Customer Directory
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            Registered clientele, high-value collectors, and order history across Pakistan
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patron name, email, phone or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#78716C]">Tier:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="All">All Patrons ({customers.length})</option>
            <option value="VIP">VIP Society Patrons</option>
            <option value="Active">Active Collectors</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E8E0D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E0D5] text-[#78716C] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Contact</th>
                <th className="py-3 px-4 font-semibold">City</th>
                <th className="py-3 px-4 font-semibold">Orders</th>
                <th className="py-3 px-4 font-semibold">Lifetime Spend</th>
                <th className="py-3 px-4 font-semibold">Member Since</th>
                <th className="py-3 px-4 font-semibold">Society Tier</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFEB]">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[#1C1917]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#F4EFEB] border border-[#E8E0D5] flex items-center justify-center text-[11px] font-semibold text-[#1C1917]">
                        {c.name.charAt(0)}
                      </div>
                      <span>{c.name}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-[#57534E]">
                    <div>{c.email}</div>
                    <div className="text-[11px] text-[#78716C] font-mono">{c.phone}</div>
                  </td>

                  <td className="py-3.5 px-4 text-[#1C1917]">
                    {c.city}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-[#1C1917]">
                    {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                  </td>

                  <td className="py-3.5 px-4 font-serif-luxury font-medium text-sm text-[#1C1917]">
                    PKR {c.totalSpent.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-[#78716C]">
                    {c.registrationDate}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border inline-flex items-center gap-1 ${
                        c.status === 'VIP'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : c.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {c.status === 'VIP' && <Crown className="w-3 h-3 text-amber-600" />}
                      <span>{c.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F4EFEB] transition-colors"
                        title="View Profile & Orders"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F4EFEB] transition-colors"
                        title="Edit Patron"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCustomer(c.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                        title="Remove Client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E0D5]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1C1917] text-white flex items-center justify-center font-serif-luxury text-xl">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif-luxury text-xl text-[#1C1917]">{selectedCustomer.name}</h3>
                  <p className="text-[#78716C]">{selectedCustomer.city}, Pakistan · Member since {selectedCustomer.registrationDate}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 text-[#78716C] hover:text-[#1C1917]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-[#FAF8F5] border border-[#E8E0D5]">
              <div>
                <span className="text-[10px] text-[#78716C] uppercase tracking-wider block">Total Spent</span>
                <span className="font-serif-luxury text-base text-[#1C1917]">PKR {selectedCustomer.totalSpent.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#78716C] uppercase tracking-wider block">Completed Orders</span>
                <span className="font-semibold text-sm text-[#1C1917]">{selectedCustomer.totalOrders}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#78716C] uppercase tracking-wider block">Society Tier</span>
                <span className="font-semibold text-sm text-[#1C1917]">{selectedCustomer.status}</span>
              </div>
            </div>

            {/* Contact & Shipping info */}
            <div className="space-y-2 p-3 border border-[#E8E0D5]">
              <div className="flex items-center gap-2 text-[#57534E]">
                <Mail className="w-4 h-4 text-[#A8A29E]" />
                <span>{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[#57534E]">
                <Phone className="w-4 h-4 text-[#A8A29E]" />
                <span>{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[#57534E]">
                <MapPin className="w-4 h-4 text-[#A8A29E]" />
                <span>{selectedCustomer.address}, {selectedCustomer.city}</span>
              </div>
            </div>

            {/* Orders associated */}
            <div className="space-y-2">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#78716C]">
                Customer Order History
              </span>
              {getCustomerOrders(selectedCustomer).length === 0 ? (
                <p className="text-stone-500 py-3 text-center border border-dashed border-[#E8E0D5]">
                  No order history recorded yet
                </p>
              ) : (
                <div className="border border-[#E8E0D5] divide-y divide-[#F4EFEB] max-h-48 overflow-y-auto">
                  {getCustomerOrders(selectedCustomer).map((ord) => (
                    <div key={ord.orderId} className="p-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-medium text-[#1C1917]">{ord.orderId}</div>
                        <div className="text-[11px] text-[#78716C]">{ord.date} · {ord.items.length} items</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#1C1917]">PKR {ord.total.toLocaleString()}</div>
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border bg-[#FAF8F5]">
                          {ord.status}
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
                className="px-5 py-2 bg-[#1C1917] text-white uppercase tracking-wider text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-lg w-full p-6 shadow-2xl relative space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5]">
              <h3 className="font-serif-luxury text-xl text-[#1C1917]">
                {editingCustomer ? 'Edit Patron Profile' : 'Register New Patron'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-[#78716C] hover:text-[#1C1917]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] text-[10px] uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Siddiqui"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] text-[10px] uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="ayesha@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] text-[10px] uppercase tracking-wider">
                    WhatsApp / Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] text-[10px] uppercase tracking-wider">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Karachi, Lahore, Islamabad..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] text-[10px] uppercase tracking-wider">
                    Society Tier *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  >
                    <option value="Active">Active Collector</option>
                    <option value="VIP">VIP Society Patron</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] text-[10px] uppercase tracking-wider">
                  Full Residential Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Street address, apartment or house number"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8E0D5]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#D6CEC5] text-[#57534E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1C1917] text-white uppercase tracking-wider font-semibold"
                >
                  {editingCustomer ? 'Save Profile' : 'Register Patron'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
