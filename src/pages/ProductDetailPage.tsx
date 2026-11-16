import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Truck,
  RefreshCw,
  Award,
  ChevronRight,
  Star,
  Check,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { formatVariantLabel } from '../services/catalogService';

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProduct,
    products,
    catalogLoading,
    addToCart,
    buyNow,
    toggleWishlist,
    isInWishlist,
    setIsSizeGuideOpen,
    navigateTo,
  } = useShop();

  const product = selectedProduct || products[0] || null;

  const activeVariants = useMemo(
    () => (product?.productVariants ?? []).filter((v) => v.isActive),
    [product]
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');
  const [addedRecently, setAddedRecently] = useState(false);

  // Reset selections whenever active product changes
  useEffect(() => {
    setActiveImageIdx(0);
    setQuantity(1);
    setAddedRecently(false);
    if (activeVariants.length > 0) {
      const preferred = activeVariants.find((v) => v.stock > 0) ?? activeVariants[0];
      setSelectedVariantId(preferred?.id);
      setSelectedSize(undefined);
    } else {
      setSelectedVariantId(undefined);
      setSelectedSize(product?.sizes?.[0]);
    }
  }, [product?.id, activeVariants, product?.sizes]);

  if (catalogLoading && !product) {
    return (
      <div className="bg-[#FAF8F5] min-h-[60vh] flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#78716C]" />
        <p className="text-xs uppercase tracking-widest text-[#78716C]">
          Loading Creation Details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#FAF8F5] min-h-[60vh] flex items-center justify-center py-20 px-4">
        <div className="bg-white border border-[#E8E0D5] p-10 max-w-md w-full text-center space-y-4">
          <h2 className="font-serif-luxury text-2xl text-[#1C1917]">
            No Product Selected
          </h2>
          <p className="text-xs text-[#57534E]">
            Return to the Silver Aura collection to browse our solid 925 sterling silver pieces.
          </p>
          <button
            onClick={() => navigateTo('shop', 'All')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Explore Collection</span>
          </button>
        </div>
      </div>
    );
  }

  const selectedVariant =
    activeVariants.find((v) => v.id === selectedVariantId) ?? activeVariants[0];

  const hasVariantOptions = activeVariants.length > 0;
  const activeOptionLabel = hasVariantOptions
    ? formatVariantLabel(selectedVariant?.sizeLabel, selectedVariant?.colorLabel) ||
      selectedVariant?.sku ||
      undefined
    : selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

  const displayedPrice =
    hasVariantOptions && selectedVariant?.price !== null && selectedVariant?.price !== undefined
      ? selectedVariant.price
      : product.price;

  const availableStock = hasVariantOptions
    ? selectedVariant?.stock ?? 0
    : product.stockCount;

  const isOutOfStock = !product.inStock || availableStock <= 0;
  const isFavorited = isInWishlist(product.id);
  const currentImage = product.images[activeImageIdx] || product.images[0] || '';

  const formatPKR = (num: number) => `PKR ${num.toLocaleString()}`;

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(
      product,
      Math.min(quantity, availableStock),
      activeOptionLabel,
      selectedVariant?.id,
      displayedPrice
    );
    setAddedRecently(true);
    window.setTimeout(() => setAddedRecently(false), 1800);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    buyNow(
      product,
      Math.min(quantity, availableStock),
      activeOptionLabel,
      selectedVariant?.id,
      displayedPrice
    );
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#78716C] mb-8">
          <button onClick={() => navigateTo('home')} className="hover:text-[#1C1917] cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button
            onClick={() => navigateTo('shop', product.category)}
            className="hover:text-[#1C1917] cursor-pointer"
          >
            {product.category}
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1C1917] font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* 2-Column Purchase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] sm:aspect-square bg-[#F4EFEB] rounded-xs overflow-hidden border border-[#E8E0D5] shadow-sm">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#78716C]">
                  <span className="font-serif-luxury text-2xl text-[#1C1917]">
                    {product.name}
                  </span>
                  <span className="text-xs mt-1">{product.silverPurity}</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] border border-[#E8E0D5]">
                {product.silverPurity}
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-20 rounded-xs overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIdx === idx
                        ? 'border-[#1C1917] shadow-sm'
                        : 'border-[#E8E0D5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Hallmark Certificate */}
            <div className="bg-white p-5 border border-[#E8E0D5] rounded-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                <Award className="w-4 h-4 text-[#78716C]" />
                <span>Certificate of 925 Hallmark Authenticity</span>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                This creation is crafted from verified 92.5% elemental fine silver. Stamped with our indelible legal hallmark and paired with a physical guarantee card signed by our master jeweller upon dispatch.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-[#78716C] border-t border-[#F4EFEB]">
                <div>
                  <span className="block text-[#A8A29E]">Hallmark:</span>
                  <span className="font-medium text-[#1C1917]">{product.hallmark}</span>
                </div>
                <div>
                  <span className="block text-[#A8A29E]">Gross Weight:</span>
                  <span className="font-medium text-[#1C1917]">{product.weight}</span>
                </div>
                <div>
                  <span className="block text-[#A8A29E]">Surface Finish:</span>
                  <span className="font-medium text-[#1C1917]">
                    {product.plating || 'Rhodium Mirror'}
                  </span>
                </div>
                <div>
                  <span className="block text-[#A8A29E]">Gemstone:</span>
                  <span className="font-medium text-[#1C1917]">
                    {product.stone || 'Pure Silver'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Purchase Module */}
          <div className="lg:col-span-5 flex flex-col space-y-6 lg:sticky lg:top-28">
            <div>
              <div className="flex items-center justify-between text-xs text-[#78716C] mb-1">
                <span className="uppercase tracking-[0.16em] font-semibold">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-[#1C1917]">
                  <Star className="w-3.5 h-3.5 fill-[#1C1917]" />
                  <span className="font-semibold tabular-nums">{product.rating}</span>
                  <span className="text-[#78716C]">({product.reviewCount} client reviews)</span>
                </div>
              </div>

              <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#1C1917] font-normal leading-tight">
                {product.name}
              </h1>
              {(selectedVariant?.sku || product.sku) && (
                <p className="text-[11px] font-mono text-[#78716C] mt-1">
                  SKU: {selectedVariant?.sku || product.sku}
                </p>
              )}
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pb-3 border-b border-[#E8E0D5]">
              <span className="text-2xl sm:text-3xl font-bold text-[#1C1917] tabular-nums">
                {formatPKR(displayedPrice)}
              </span>
              {product.originalPrice && product.originalPrice > displayedPrice && (
                <span className="text-sm text-[#A8A29E] line-through tabular-nums">
                  {formatPKR(product.originalPrice)}
                </span>
              )}
              <span
                className={`text-xs font-medium ml-auto ${
                  isOutOfStock ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : `In Stock (${availableStock} available)`}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              {product.description}
            </p>

            {/* Variant Selector (Live Supabase product_variants) */}
            {hasVariantOptions ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[#1C1917]">
                    Select Option:{' '}
                    <span className="font-normal text-[#57534E]">{activeOptionLabel}</span>
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[#78716C] underline hover:text-[#1C1917] cursor-pointer"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeVariants.map((variant) => {
                    const label =
                      formatVariantLabel(variant.sizeLabel, variant.colorLabel) ||
                      variant.sku ||
                      'Standard';
                    const isSelected = selectedVariant?.id === variant.id;
                    const variantOut = variant.stock <= 0;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setQuantity((q) => Math.max(1, Math.min(q, variant.stock || 1)));
                        }}
                        className={`px-4 py-2 text-xs font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF8F5]'
                            : variantOut
                            ? 'border-[#E8E0D5] bg-[#F4EFEB] text-[#A8A29E] line-through hover:border-[#78716C]'
                            : 'border-[#D6CEC5] bg-white text-[#1C1917] hover:border-[#1C1917]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              product.sizes &&
              product.sizes.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-[#1C1917]">
                      Select Size:{' '}
                      <span className="font-normal text-[#57534E]">{activeOptionLabel}</span>
                    </span>
                    <button
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-[#78716C] underline hover:text-[#1C1917] cursor-pointer"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 text-xs font-medium border transition-colors cursor-pointer ${
                          activeOptionLabel === size
                            ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF8F5]'
                            : 'border-[#D6CEC5] bg-white text-[#1C1917] hover:border-[#1C1917]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Quantity & Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#D6CEC5] bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    className="p-2.5 text-[#78716C] hover:text-[#1C1917] transition-colors disabled:opacity-40 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-semibold tabular-nums text-[#1C1917]">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(Math.max(1, availableStock), q + 1))
                    }
                    disabled={isOutOfStock || quantity >= availableStock}
                    className="p-2.5 text-[#78716C] hover:text-[#1C1917] transition-colors disabled:opacity-40 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => toggleWishlist(product)}
                  aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`p-3 border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                    isFavorited
                      ? 'border-[#1C1917] bg-[#1C1917] text-white'
                      : 'border-[#D6CEC5] bg-white text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="py-3.5 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:bg-stone-400 disabled:cursor-not-allowed"
                >
                  {isOutOfStock ? (
                    <span>Out of Stock</span>
                  ) : addedRecently ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="py-3.5 px-6 bg-[#FAF8F5] border border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Buy Now (Instant Checkout)</span>
                </button>
              </div>
            </div>

            {/* Delivery Strip */}
            <div className="bg-[#F4EFEB] p-4 border border-[#E8E0D5] space-y-2 text-xs text-[#57534E]">
              <div className="flex items-center gap-2 text-[#1C1917] font-medium">
                <Truck className="w-4 h-4 text-[#78716C]" />
                <span>Karachi (1–2 days) · Nationwide Pakistan (2–4 days)</span>
              </div>
              <div className="flex items-center gap-2 text-[#1C1917] font-medium">
                <RefreshCw className="w-4 h-4 text-[#78716C]" />
                <span>Complimentary 7-Day Sizing Exchange & Returns</span>
              </div>
            </div>

            {/* Information Tabs */}
            <div className="pt-4 border-t border-[#E8E0D5]">
              <div className="flex border-b border-[#E8E0D5] text-xs">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-4 uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'details'
                      ? 'border-[#1C1917] text-[#1C1917]'
                      : 'border-transparent text-[#78716C]'
                  }`}
                >
                  Metallurgy
                </button>
                <button
                  onClick={() => setActiveTab('care')}
                  className={`py-2 px-4 uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'care'
                      ? 'border-[#1C1917] text-[#1C1917]'
                      : 'border-transparent text-[#78716C]'
                  }`}
                >
                  Silver Care
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`py-2 px-4 uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'shipping'
                      ? 'border-[#1C1917] text-[#1C1917]'
                      : 'border-transparent text-[#78716C]'
                  }`}
                >
                  Delivery
                </button>
              </div>

              <div className="py-4 text-xs text-[#57534E] leading-relaxed">
                {activeTab === 'details' && (
                  <div className="space-y-2">
                    <p>
                      <strong>Composition:</strong> 92.5% Solid Fine Silver, 7.5% Alloyed Copper for structural integrity.
                    </p>
                    <p>
                      <strong>Protective Shield:</strong> Triple-layer white rhodium electroplating to prevent surface oxidization.
                    </p>
                    <p>
                      <strong>Hypoallergenic:</strong> 100% Nickel-free, lead-free, and cadmium-free.
                    </p>
                  </div>
                )}

                {activeTab === 'care' && (
                  <ul className="space-y-1.5 list-disc list-inside">
                    {product.careNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                    <li>Complimentary micro-fiber polishing cloth included in every parcel.</li>
                  </ul>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-2">
                    <p>
                      <strong>Courier Partners:</strong> Shipped via TCS Express and Leopard Courier with tamper-proof seal and transit insurance.
                    </p>
                    <p>
                      <strong>Payment Options:</strong> Cash on Delivery (COD) accepted in over 200 cities across Pakistan, or Instant Bank Transfer.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Creations */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E8E0D5]">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#78716C] font-semibold block mb-1">
                  Coordinated Aesthetics
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-medium">
                  More in {product.category}
                </h3>
              </div>
              <button
                onClick={() => navigateTo('shop', product.category)}
                className="text-xs uppercase tracking-wider font-medium text-[#1C1917] underline hover:text-[#78716C] cursor-pointer"
              >
                View Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
