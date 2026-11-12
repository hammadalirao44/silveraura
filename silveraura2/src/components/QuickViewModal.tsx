import React, { useState } from 'react';
import { X, ShieldCheck, Heart, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    closeQuickView,
    addToCart,
    buyNow,
    toggleWishlist,
    isInWishlist,
    openProduct,
    setIsSizeGuideOpen,
  } = useShop();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isFavorited = isInWishlist(product.id);
  const activeSize = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

  const formatPKR = (num: number) => `PKR ${num.toLocaleString()}`;

  const handleAddToCart = () => {
    addToCart(product, quantity, activeSize);
    closeQuickView();
  };

  const handleBuyNow = () => {
    buyNow(product, quantity, activeSize);
    closeQuickView();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeQuickView}
      />

      <div className="relative bg-[#FAF8F5] border border-[#E8E0D5] shadow-2xl max-w-3xl w-full p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 p-1.5 text-[#78716C] hover:text-[#1C1917] z-20"
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          
          {/* Left: Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-[#F4EFEB] rounded-xs overflow-hidden border border-[#E8E0D5]">
              <img
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-14 h-14 rounded-xs overflow-hidden border-2 transition-colors ${
                      activeImageIdx === idx ? 'border-[#1C1917]' : 'border-[#E8E0D5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Purchase */}
          <div className="flex flex-col space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#78716C] font-semibold mb-1">
                <span>{product.category}</span>
                <span>·</span>
                <span>Solid 925 Silver</span>
              </div>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-medium leading-tight">
                {product.name}
              </h2>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-xl sm:text-2xl font-bold text-[#1C1917] tabular-nums">
                {formatPKR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-[#A8A29E] line-through tabular-nums">
                  {formatPKR(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* 925 Hallmark Guarantee Box */}
            <div className="bg-[#F4EFEB] p-3 border border-[#E8E0D5] flex items-center gap-3 text-xs text-[#1C1917]">
              <ShieldCheck className="w-4 h-4 text-[#78716C] shrink-0" />
              <div>
                <span className="font-semibold">{product.silverPurity}</span>
                <span className="text-[#78716C] block">{product.plating || 'Anti-Tarnish Rhodium Finish'}</span>
              </div>
            </div>

            {/* Size Selector if available */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1C1917]">Select Size</span>
                  <button
                    onClick={() => {
                      closeQuickView();
                      setIsSizeGuideOpen(true);
                    }}
                    className="text-[#78716C] underline hover:text-[#1C1917]"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                        activeSize === size
                          ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF8F5]'
                          : 'border-[#D6CEC5] bg-white text-[#1C1917] hover:border-[#1C1917]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#D6CEC5] bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-[#78716C] hover:text-[#1C1917]"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-semibold tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-[#78716C] hover:text-[#1C1917]"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 border transition-colors ${
                    isFavorited
                      ? 'border-[#1C1917] bg-[#1C1917] text-white'
                      : 'border-[#D6CEC5] bg-white text-[#78716C] hover:text-[#1C1917]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  className="py-3 px-4 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-3 px-4 bg-[#FAF8F5] border border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF8F5] text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Buy Now</span>
                </button>
              </div>

              <button
                onClick={() => {
                  closeQuickView();
                  openProduct(product);
                }}
                className="w-full text-center text-xs text-[#78716C] hover:text-[#1C1917] pt-2 flex items-center justify-center gap-1"
              >
                <span>View Full Product Specifications & Care</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
