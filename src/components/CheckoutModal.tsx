import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Building2,
  AlertCircle,
  Tag,
  Loader2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { OrderDetails } from '../types';
import { placeStorefrontOrderRpc } from '../services/checkoutService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartShipping,
    cartDiscountAmount,
    cartTotal,
    promoCode,
    couponValidating,
    cartHasStockIssues,
    storeSettings,
    applyPromoCode,
    removePromoCode,
    completeOrder,
    navigateTo,
    setIsCartOpen,
  } = useShop();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Karachi',
    customCity: '',
    postalCode: '',
    paymentMethod: 'cod' as 'cod' | 'bank_transfer' | 'card',
    orderNotes: '',
  });

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    success?: boolean;
    text: string;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<OrderDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (!promoCode && couponFeedback?.success) {
      setCouponFeedback(null);
    }
  }, [promoCode, couponFeedback?.success]);

  if (!isCheckoutOpen) return null;

  const currency = storeSettings.currencySymbol || 'PKR';
  const formatPrice = (num: number) => `${currency} ${num.toLocaleString()}`;

  const resolvedCity =
    formData.city === 'Other' ? formData.customCity.trim() : formData.city.trim();

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || couponValidating || submitting) return;
    setCouponFeedback(null);
    const res = await applyPromoCode(couponInput);
    setCouponFeedback({ success: res.success, text: res.message });
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleRemoveCoupon = () => {
    if (submitting) return;
    removePromoCode();
    setCouponFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || submitting) return;

    setFormError(null);

    if (cart.length === 0) {
      setFormError('Your jewellery bag is empty. Please add an item before checking out.');
      return;
    }

    if (cartHasStockIssues) {
      setFormError(
        'One or more items in your bag are out of stock or exceed available stock. Please update your bag first.'
      );
      return;
    }

    const cleanName = formData.fullName.trim();
    const cleanPhone = formData.phone.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanAddress = formData.address.trim();

    if (cleanName.length < 2) {
      setFormError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (cleanPhone.replace(/\D/g, '').length < 7) {
      setFormError('Please enter a valid mobile or WhatsApp number.');
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setFormError('Please enter a valid email address for order tracking and confirmation.');
      return;
    }
    if (cleanAddress.length < 5) {
      setFormError('Please enter your complete street delivery address.');
      return;
    }
    if (!resolvedCity) {
      setFormError('Please select or enter your delivery city.');
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);

    try {
      const confirmedOrder = await placeStorefrontOrderRpc({
        customerName: cleanName,
        customerEmail: cleanEmail,
        customerPhone: cleanPhone,
        shippingAddress: cleanAddress,
        city: resolvedCity,
        postalCode: formData.postalCode.trim(),
        paymentMethod: formData.paymentMethod,
        couponCode: promoCode || null,
        notes: formData.orderNotes.trim() || null,
        items: cart,
        fallbackSubtotal: cartSubtotal,
        fallbackShipping: cartShipping,
        fallbackDiscount: cartDiscountAmount,
        fallbackTotal: cartTotal,
      });

      completeOrder(confirmedOrder);
      setOrderConfirmed(confirmedOrder);
      setFormError(null);
      setCouponFeedback(null);
      setCouponInput('');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not place your order right now. Please try again.';
      setFormError(msg);
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setIsCheckoutOpen(false);
    setFormError(null);
    setCouponFeedback(null);
    if (orderConfirmed) {
      setOrderConfirmed(null);
      setFormData((prev) => ({
        ...prev,
        orderNotes: '',
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="relative bg-[#FAF8F5] border border-[#E8E0D5] shadow-2xl max-w-2xl w-full p-5 sm:p-8 z-10 max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-1.5 text-[#78716C] hover:text-[#1C1917] z-20 disabled:opacity-40 cursor-pointer"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {orderConfirmed ? (
          /* Confirmation Screen */
          <div className="text-center py-4 sm:py-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-[#78716C] font-semibold">
                Order Confirmed · {orderConfirmed.status || 'Pending'}
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1C1917] mt-1 font-medium">
                Thank You, {orderConfirmed.customerName}
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] mt-2 max-w-md mx-auto">
                Your 925 sterling silver order reference is{' '}
                <strong className="text-[#1C1917] font-mono tabular-nums">
                  {orderConfirmed.orderId}
                </strong>
                . A confirmation record has been logged for {orderConfirmed.email}.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-[#F4EFEB] p-4 sm:p-5 border border-[#E8E0D5] text-left text-xs space-y-3">
              <div className="flex justify-between gap-4 font-medium text-[#1C1917] border-b border-[#E8E0D5] pb-2">
                <span>Shipping To</span>
                <span className="text-right text-[#57534E]">
                  {orderConfirmed.address}, {orderConfirmed.city}
                  {orderConfirmed.postalCode ? ` (${orderConfirmed.postalCode})` : ''}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#E8E0D5] pb-2">
                <span>Contact</span>
                <span className="text-[#1C1917] text-right">
                  {orderConfirmed.phone} · {orderConfirmed.email}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#E8E0D5] pb-2">
                <span>Payment Method</span>
                <span className="font-semibold text-[#1C1917] text-right">
                  {orderConfirmed.paymentMethod === 'cod'
                    ? 'Cash on Delivery (Pay upon arrival)'
                    : orderConfirmed.paymentMethod === 'bank_transfer'
                    ? 'Online Bank Transfer / IBFT'
                    : 'Credit / Debit Card'}
                </span>
              </div>

              {orderConfirmed.items.length > 0 && (
                <div className="border-b border-[#E8E0D5] pb-2 space-y-1.5">
                  <span className="font-semibold text-[#1C1917] block">Pieces Ordered</span>
                  {orderConfirmed.items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.variantId || ''}-${item.selectedSize || ''}`}
                      className="flex justify-between gap-3 text-[#57534E]"
                    >
                      <span className="truncate">
                        {item.quantity} × {item.product.name}
                        {item.selectedSize ? ` (${item.selectedSize})` : ''}
                      </span>
                      <span className="tabular-nums shrink-0 text-[#1C1917]">
                        {formatPrice((item.selectedPrice ?? item.product.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-[#57534E]">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-[#1C1917]">
                    {formatPrice(orderConfirmed.subtotal)}
                  </span>
                </div>
                {orderConfirmed.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Privilege Discount</span>
                    <span className="tabular-nums">- {formatPrice(orderConfirmed.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#57534E]">
                  <span>Insured Delivery</span>
                  <span className="tabular-nums text-[#1C1917]">
                    {orderConfirmed.shipping === 0
                      ? 'Complimentary'
                      : formatPrice(orderConfirmed.shipping)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-[#E8E0D5] font-semibold text-sm text-[#1C1917]">
                <span>Total Amount Payable</span>
                <span className="tabular-nums font-mono text-base">
                  {formatPrice(orderConfirmed.total)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  handleClose();
                  navigateTo('shop');
                }}
                className="w-full sm:w-auto py-3 px-8 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="pb-5 border-b border-[#E8E0D5]">
              <span className="text-xs uppercase tracking-widest text-[#78716C] font-semibold block mb-1">
                Secure Express Checkout
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-medium">
                Delivery & Payment Details
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
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
                      disabled={submitting}
                      onChange={(e) => {
                        setFormError(null);
                        setFormData({ ...formData, fullName: e.target.value });
                      }}
                      className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917] disabled:bg-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#57534E] mb-1">
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0300-1234567"
                      value={formData.phone}
                      disabled={submitting}
                      onChange={(e) => {
                        setFormError(null);
                        setFormData({ ...formData, phone: e.target.value });
                      }}
                      className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917] disabled:bg-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#57534E] mb-1">
                    Email Address (Required for order confirmation) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="maham@example.com"
                    value={formData.email}
                    disabled={submitting}
                    onChange={(e) => {
                      setFormError(null);
                      setFormData({ ...formData, email: e.target.value });
                    }}
                    className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917] disabled:bg-stone-100"
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
                  <label className="block text-xs text-[#57534E] mb-1">
                    Complete Street Address / House / Apartment *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House 14-B, Street 3, Block 4, Clifton"
                    value={formData.address}
                    disabled={submitting}
                    onChange={(e) => {
                      setFormError(null);
                      setFormData({ ...formData, address: e.target.value });
                    }}
                    className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917] disabled:bg-stone-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#57534E] mb-1">City *</label>
                    <select
                      value={formData.city}
                      disabled={submitting}
                      onChange={(e) => {
                        setFormError(null);
                        setFormData({ ...formData, city: e.target.value });
                      }}
                      className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917] disabled:bg-stone-100"
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
                    <label className="block text-xs text-[#57534E] mb-1">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 75600"
                      value={formData.postalCode}
                      disabled={submitting}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917] disabled:bg-stone-100"
                    />
                  </div>
                </div>

                {formData.city === 'Other' && (
                  <div>
                    <label className="block text-xs text-[#57534E] mb-1">
                      Specify Delivery City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abbottabad, Bahawalpur, Sukkur"
                      value={formData.customCity}
                      disabled={submitting}
                      onChange={(e) => {
                        setFormError(null);
                        setFormData({ ...formData, customCity: e.target.value });
                      }}
                      className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917] disabled:bg-stone-100"
                    />
                  </div>
                )}
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
                        disabled={submitting}
                        checked={formData.paymentMethod === 'cod'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                        className="text-[#1C1917] focus:ring-0"
                      />
                      <Banknote className="w-4 h-4 text-[#1C1917]" />
                    </div>
                    <span className="text-xs font-semibold text-[#1C1917]">Cash on Delivery</span>
                    <span className="text-[10px] text-[#78716C] mt-0.5">
                      Pay courier in cash upon arrival
                    </span>
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
                        disabled={submitting}
                        checked={formData.paymentMethod === 'bank_transfer'}
                        onChange={() =>
                          setFormData({ ...formData, paymentMethod: 'bank_transfer' })
                        }
                        className="text-[#1C1917] focus:ring-0"
                      />
                      <Building2 className="w-4 h-4 text-[#1C1917]" />
                    </div>
                    <span className="text-xs font-semibold text-[#1C1917]">Bank Transfer</span>
                    <span className="text-[10px] text-[#78716C] mt-0.5">
                      Meezan Bank / HBL / Raast
                    </span>
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
                        disabled={submitting}
                        checked={formData.paymentMethod === 'card'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                        className="text-[#1C1917] focus:ring-0"
                      />
                      <CreditCard className="w-4 h-4 text-[#1C1917]" />
                    </div>
                    <span className="text-xs font-semibold text-[#1C1917]">Debit / Credit</span>
                    <span className="text-[10px] text-[#78716C] mt-0.5">
                      Visa, Mastercard & PayPak
                    </span>
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
                  disabled={submitting}
                  onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                  className="w-full bg-white border border-[#D6CEC5] px-3.5 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917] disabled:bg-stone-100"
                />
              </div>

              {/* Coupon & Order Summary */}
              <div className="bg-[#F4EFEB] p-4 border border-[#E8E0D5] space-y-3 text-xs text-[#57534E]">
                {/* Coupon Apply / Remove inside Checkout */}
                <div className="pb-2 border-b border-[#E8E0D5]">
                  {promoCode ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-900">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="font-semibold uppercase tracking-wider">{promoCode}</span>
                        <span className="text-emerald-700">
                          (-{formatPrice(cartDiscountAmount)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        disabled={submitting}
                        className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 hover:text-rose-900 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Have a coupon code?"
                            value={couponInput}
                            disabled={couponValidating || submitting}
                            onChange={(e) => setCouponInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                void handleApplyCoupon();
                              }
                            }}
                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D6CEC5] text-xs text-[#1C1917] uppercase tracking-wider focus:outline-none focus:border-[#1C1917]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleApplyCoupon()}
                          disabled={couponValidating || submitting || !couponInput.trim()}
                          className="px-3.5 py-1.5 bg-white border border-[#1C1917] text-[#1C1917] text-[11px] uppercase tracking-wider font-medium hover:bg-[#1C1917] hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          {couponValidating ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Checking</span>
                            </>
                          ) : (
                            <span>Apply</span>
                          )}
                        </button>
                      </div>
                      {couponFeedback && (
                        <p
                          className={`text-[11px] ${
                            couponFeedback.success ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {couponFeedback.text}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>
                      Subtotal ({cart.reduce((s, item) => s + item.quantity, 0)} piece
                      {cart.reduce((s, item) => s + item.quantity, 0) === 1 ? '' : 's'})
                    </span>
                    <span className="tabular-nums font-medium text-[#1C1917]">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>
                  {cartDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Privilege Savings ({promoCode})</span>
                      <span className="tabular-nums">- {formatPrice(cartDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Insured Courier Delivery</span>
                    <span className="tabular-nums font-medium text-[#1C1917]">
                      {cartShipping === 0 ? 'Complimentary' : formatPrice(cartShipping)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#E8E0D5] flex justify-between text-base font-semibold text-[#1C1917]">
                    <span className="font-serif-luxury text-lg">Total Due</span>
                    <span className="tabular-nums">{formatPrice(cartTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Stock issue banner if cart stale */}
              {cartHasStockIssues && (
                <div className="bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Stock changed for items in your bag. Please review your bag before placing the
                      order.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="underline font-semibold shrink-0 cursor-pointer"
                  >
                    Review Bag
                  </button>
                </div>
              )}

              {/* Inline Validation / RPC Error Banner */}
              {formError && (
                <div
                  role="alert"
                  className="bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-1 space-y-3">
                <button
                  type="submit"
                  disabled={submitting || cart.length === 0 || cartHasStockIssues}
                  className="w-full py-4 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-[0.18em] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Placing Your Order...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Place Order · {formatPrice(cartTotal)}</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-[#78716C]">
                  By clicking Place Order, you receive an authentic 925 sterling silver guarantee and
                  7-day hassle-free exchange protection.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

