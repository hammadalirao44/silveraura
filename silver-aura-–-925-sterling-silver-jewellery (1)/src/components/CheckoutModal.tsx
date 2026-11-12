import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, Banknote, Building2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { OrderDetails } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartShipping,
    cartDiscountAmount,
    cartTotal,
    completeOrder,
    navigateTo,
  } = useShop();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Karachi',
    postalCode: '',
    paymentMethod: 'cod' as 'cod' | 'bank_transfer' | 'card',
    orderNotes: '',
  });

  const [orderConfirmed, setOrderConfirmed] = useState<OrderDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const formatPKR = (num: number) => `PKR ${num.toLocaleString()}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Please fill in your name, phone number, and delivery address.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newOrder: OrderDetails = {
        orderId: `SA-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        paymentMethod: formData.paymentMethod,
        notes: formData.orderNotes,
        items: [...cart],
        subtotal: cartSubtotal,
        shipping: cartShipping,
        discount: cartDiscountAmount,
        total: cartTotal,
        date: new Date().toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };

      completeOrder(newOrder);
      setOrderConfirmed(newOrder);
      setSubmitting(false);
    }, 600);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderConfirmed(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={handleClose} />

      <div className="relative bg-[#FAF8F5] border border-[#E8E0D5] shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-[#78716C] hover:text-[#1C1917] z-20"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {orderConfirmed ? (
          /* Confirmation Screen */
          <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-[#78716C] font-semibold">
                Order Confirmed
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1C1917] mt-1 font-medium">
                Thank You, {orderConfirmed.customerName}
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] mt-2 max-w-md mx-auto">
                Your bespoke 925 sterling silver order reference is{' '}
                <strong className="text-[#1C1917] font-mono tabular-nums">{orderConfirmed.orderId}</strong>.
                Our Karachi atelier is preparing your insured parcel for dispatch.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-[#F4EFEB] p-5 border border-[#E8E0D5] text-left text-xs space-y-3">
              <div className="flex justify-between font-medium text-[#1C1917] border-b border-[#E8E0D5] pb-2">
                <span>Shipping To</span>
                <span className="text-right text-[#57534E]">
                  {orderConfirmed.address}, {orderConfirmed.city}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#E8E0D5] pb-2">
                <span>Payment Method</span>
                <span className="capitalize font-semibold text-[#1C1917]">
                  {orderConfirmed.paymentMethod === 'cod'
                    ? 'Cash on Delivery (Pay upon arrival)'
                    : orderConfirmed.paymentMethod === 'bank_transfer'
                    ? 'Online Bank Transfer / IBFT'
                    : 'Credit/Debit Card'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#E8E0D5] pb-2">
                <span>Estimated Delivery</span>
                <span className="text-[#1C1917] font-medium">2 – 4 Business Days (TCS Express)</span>
              </div>
              <div className="flex justify-between pt-1 font-semibold text-sm text-[#1C1917]">
                <span>Total Amount Payable</span>
                <span className="tabular-nums font-mono text-base">{formatPKR(orderConfirmed.total)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  handleClose();
                  navigateTo('shop');
                }}
                className="w-full sm:w-auto py-3 px-8 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-wider font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="pb-6 border-b border-[#E8E0D5]">
              <span className="text-xs uppercase tracking-widest text-[#78716C] font-semibold block mb-1">
                Secure Express Checkout
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-medium">
                Delivery & Payment Details
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917] flex items-center gap-1.5">
                  <span>1. Contact & Recipient</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#57534E] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maham Khan"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#57534E] mb-1">Mobile / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0300-1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#57534E] mb-1">Email Address (Optional for order tracking)</label>
                  <input
                    type="email"
                    placeholder="maham@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-4 pt-2 border-t border-[#E8E0D5]">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#78716C]" />
                  <span>2. Delivery Address</span>
                </h3>

                <div>
                  <label className="block text-xs text-[#57534E] mb-1">Complete Street Address / House / Apartment *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House 14-B, Street 3, Block 4, Clifton"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#57534E] mb-1">City *</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    >
                      <option value="Karachi">Karachi</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="Gujranwala">Gujranwala</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Other">Other City in Pakistan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-[#57534E] mb-1">Postal Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 75600"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3 pt-2 border-t border-[#E8E0D5]">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#1C1917]">
                  3. Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`border p-3 flex flex-col justify-between cursor-pointer transition-colors ${
                      formData.paymentMethod === 'cod'
                        ? 'border-[#1C1917] bg-[#F4EFEB]'
                        : 'border-[#D6CEC5] bg-white hover:border-[#A8A29E]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                        className="text-[#1C1917] focus:ring-0"
                      />
                      <Banknote className="w-4 h-4 text-[#1C1917]" />
                    </div>
                    <span className="text-xs font-semibold text-[#1C1917]">Cash on Delivery</span>
                    <span className="text-[10px] text-[#78716C] mt-0.5">Pay courier in cash upon arrival</span>
                  </label>

                  <label
                    className={`border p-3 flex flex-col justify-between cursor-pointer transition-colors ${
                      formData.paymentMethod === 'bank_transfer'
                        ? 'border-[#1C1917] bg-[#F4EFEB]'
                        : 'border-[#D6CEC5] bg-white hover:border-[#A8A29E]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'bank_transfer'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                        className="text-[#1C1917] focus:ring-0"
                      />
                      <Building2 className="w-4 h-4 text-[#1C1917]" />
                    </div>
                    <span className="text-xs font-semibold text-[#1C1917]">Bank Transfer</span>
                    <span className="text-[10px] text-[#78716C] mt-0.5">Meezan Bank / HBL / Raast</span>
                  </label>

                  <label
                    className={`border p-3 flex flex-col justify-between cursor-pointer transition-colors ${
                      formData.paymentMethod === 'card'
                        ? 'border-[#1C1917] bg-[#F4EFEB]'
                        : 'border-[#D6CEC5] bg-white hover:border-[#A8A29E]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'card'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                        className="text-[#1C1917] focus:ring-0"
                      />
                      <CreditCard className="w-4 h-4 text-[#1C1917]" />
                    </div>
                    <span className="text-xs font-semibold text-[#1C1917]">Debit / Credit</span>
                    <span className="text-[10px] text-[#78716C] mt-0.5">Visa, Mastercard & PayPak</span>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-xs text-[#57534E] mb-1">
                  Gift Message or Special Delivery Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please write 'Happy Anniversary' on the gift card"
                  value={formData.orderNotes}
                  onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                  className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              {/* Order Total Review */}
              <div className="bg-[#F4EFEB] p-4 border border-[#E8E0D5] space-y-1.5 text-xs text-[#57534E]">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} creations)</span>
                  <span className="tabular-nums font-medium text-[#1C1917]">{formatPKR(cartSubtotal)}</span>
                </div>
                {cartDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>VIP Privilege Savings</span>
                    <span className="tabular-nums">- {formatPKR(cartDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Insured Courier Delivery</span>
                  <span className="tabular-nums font-medium text-[#1C1917]">
                    {cartShipping === 0 ? 'Complimentary' : formatPKR(cartShipping)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E8E0D5] flex justify-between text-base font-semibold text-[#1C1917]">
                  <span className="font-serif-luxury text-lg">Total Due</span>
                  <span className="tabular-nums">{formatPKR(cartTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="w-full py-4 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-[0.18em] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? 'Confirming Parcel...' : `Place Order · ${formatPKR(cartTotal)}`}</span>
                </button>

                <p className="text-center text-[11px] text-[#78716C]">
                  By clicking Place Order, you receive an authentic 925 sterling silver guarantee and 7-day hassle-free exchange protection.
                </p>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
};
