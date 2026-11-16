import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getCartItemStockStatus } from '../services/checkoutService';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    products,
    catalogLoading,
    catalogError,
    storeSettings,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartShipping,
    cartDiscountAmount,
    cartTotal,
    freeShippingThreshold,
    freeShippingRemaining,
    applyPromoCode,
    removePromoCode,
    promoCode,
    couponValidating,
    cartHasStockIssues,
    setIsCheckoutOpen,
    navigateTo,
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    success?: boolean;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!promoCode && couponFeedback?.success) {
      setCouponFeedback(null);
    }
  }, [promoCode, couponFeedback?.success]);

  if (!isCartOpen) return null;

  const currency = storeSettings.currencySymbol || 'PKR';
  const formatPrice = (num: number) => `${currency} ${num.toLocaleString()}`;
  const catalogLoaded = !catalogLoading && !catalogError;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim() || couponValidating) return;
    const res = await applyPromoCode(couponInput);
    setCouponFeedback({ success: res.success, text: res.message });
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleRemoveCoupon = () => {
    removePromoCode();
    setCouponFeedback(null);
  };

  const progressPercent =
    freeShippingThreshold <= 0
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((freeShippingThreshold - freeShippingRemaining) / freeShippingThreshold) * 100
            )
          )
        );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-[#E8E0D5]">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E0D5] flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-2xl text-[#1C1917] font-medium">
                Your Jewellery Bag
              </h2>
              <span className="text-xs text-[#78716C] tracking-wide">
                {cart.length === 0
                  ? '0 items'
                  : `${cart.reduce((a, b) => a + b.quantity, 0)} handcrafted pieces`}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#F4EFEB] px-6 py-3 border-b border-[#E8E0D5]">
            <div className="flex items-center justify-between text-xs text-[#1C1917] mb-1.5 font-medium">
              <span>
                {freeShippingRemaining === 0 ? (
                  <span className="text-[#15803D] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 inline" /> You’ve unlocked Complimentary Insured Delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong className="tabular-nums">{formatPrice(freeShippingRemaining)}</strong> more for Free Delivery
                  </span>
                )}
              </span>
              <span className="tabular-nums text-[#78716C]">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#E8E0D5] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#1C1917] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#E8E0D5]">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <p className="font-serif-luxury text-xl text-[#78716C]">
                  Your bag is currently empty.
                </p>
                <p className="text-xs text-[#A8A29E] max-w-xs mx-auto">
                  Discover our certified 925 sterling silver heirloom rings, chokers and bracelets.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('shop');
                  }}
                  className="py-3 px-6 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors cursor-pointer"
                >
                  Explore Jewellery
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const linePrice = item.selectedPrice ?? item.product.price;
                const thumb = item.product.images[0] || '';
                const stockStatus = getCartItemStockStatus(item, products, catalogLoaded);
                const maxStock = stockStatus.availableStock;
                const atMaxStock = maxStock > 0 && item.quantity >= maxStock;

                return (
                  <div
                    key={`${item.product.id}-${item.variantId || ''}-${item.selectedSize || ''}`}
                    className="py-4 flex gap-4 first:pt-0"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover rounded-xs bg-[#E8E0D5] shrink-0 border border-[#E8E0D5]"
                      />
                    ) : (
                      <div className="w-20 h-24 rounded-xs bg-[#F4EFEB] shrink-0 border border-[#E8E0D5] flex items-center justify-center text-[10px] text-[#78716C] text-center p-1">
                        925 Silver
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif-luxury text-base text-[#1C1917] font-medium leading-snug">
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() =>
                              removeFromCart(item.product.id, item.selectedSize, item.variantId)
                            }
                            className="text-[#A8A29E] hover:text-[#DC2626] transition-colors p-1 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-xs text-[#78716C] mt-0.5 space-x-2">
                          <span>{item.product.category}</span>
                          {item.selectedSize && (
                            <>
                              <span>·</span>
                              <span>Option: {item.selectedSize}</span>
                            </>
                          )}
                        </div>
                        {stockStatus.issueMessage && (
                          <p className="mt-1.5 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{stockStatus.issueMessage}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-[#D6CEC5] bg-white">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedSize,
                                item.variantId
                              )
                            }
                            className="p-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold tabular-nums text-[#1C1917]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.selectedSize,
                                item.variantId
                              )
                            }
                            disabled={atMaxStock || maxStock <= 0}
                            className="p-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-semibold text-sm text-[#1C1917] tabular-nums">
                          {formatPrice(linePrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#E8E0D5] bg-[#FAF8F5] space-y-4">
              {/* Promo Code Input or Active Badge */}
              {promoCode ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 min-w-0">
                    <Tag className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="font-semibold tracking-wider uppercase">{promoCode}</span>
                    {couponFeedback?.text && (
                      <span className="text-emerald-700 truncate hidden sm:inline">
                        · {couponFeedback.text}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 hover:text-rose-900 underline ml-2 shrink-0 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponInput}
                      disabled={couponValidating}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-[#D6CEC5] text-xs text-[#1C1917] uppercase tracking-wider focus:outline-none focus:border-[#1C1917] disabled:bg-stone-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponValidating || !couponInput.trim()}
                    className="px-4 py-2 bg-[#FAF8F5] border border-[#1C1917] text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#1C1917] hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
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
                </form>
              )}

              {couponFeedback && !promoCode && (
                <p
                  className={`text-xs ${
                    couponFeedback.success ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {couponFeedback.text}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#57534E] pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-[#1C1917]">
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>
                {cartDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Privilege Discount ({promoCode})</span>
                    <span className="tabular-nums">- {formatPrice(cartDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Insured Delivery</span>
                  <span className="tabular-nums font-medium text-[#1C1917]">
                    {cartShipping === 0 ? 'Complimentary' : formatPrice(cartShipping)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E8E0D5] flex justify-between text-base font-medium text-[#1C1917]">
                  <span className="font-serif-luxury text-lg">Estimated Total</span>
                  <span className="tabular-nums font-semibold">{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-[11px] text-[#A8A29E] pt-0.5">
                  Taxes and insured courier transit included.
                </p>
              </div>

              {cartHasStockIssues && (
                <div className="bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Please adjust quantities or remove unavailable items above before checking out.
                  </span>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={() => {
                  if (cartHasStockIssues) return;
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                disabled={cartHasStockIssues}
                className="w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#78716C]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cash on Delivery & Bank Transfer across Pakistan</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

