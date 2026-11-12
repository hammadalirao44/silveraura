import React, { useState } from 'react';
import {
  ShieldCheck,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Truck,
  RefreshCw,
  Sparkles,
  Award,
  ChevronRight,
  Star,
  Check,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProduct,
    products,
    addToCart,
    buyNow,
    toggleWishlist,
    isInWishlist,
    setIsSizeGuideOpen,
    navigateTo,
  } = useShop();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');
  const [addedRecently, setAddedRecently] = useState(false);

  // If no product is selected, fallback to the first featured product
  const product = selectedProduct || products[0];

  const isFavorited = isInWishlist(product.id);
  const activeSize = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

  const formatPKR = (num: number) => `PKR ${num.toLocaleString()}`;

  // Related products from the same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, quantity, activeSize);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 1800);
  };

  const handleBuyNow = () => {
    buyNow(product, quantity, activeSize);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#78716C] mb-8">
          <button onClick={() => navigateTo('home')} className="hover:text-[#1C1917]">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigateTo('shop', product.category)} className="hover:text-[#1C1917]">
            {product.category}
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1C1917] font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* 2-Column Contiguous Purchase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] sm:aspect-square bg-[#F4EFEB] rounded-xs overflow-hidden border border-[#E8E0D5] shadow-sm">
              <img
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] border border-[#E8E0D5]">
                {product.silverPurity}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-20 rounded-xs overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIdx === idx ? 'border-[#1C1917] shadow-sm' : 'border-[#E8E0D5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Hallmark & Authenticity Micro-Certificate */}
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
                  <span className="font-medium text-[#1C1917]">{product.plating || 'Rhodium Mirror'}</span>
                </div>
                <div>
                  <span className="block text-[#A8A29E]">Gemstone:</span>
                  <span className="font-medium text-[#1C1917]">{product.stone || 'Pure Silver'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-5 flex flex-col space-y-6 lg:sticky lg:top-28">
            
            {/* Title & Reviews */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#78716C] mb-1">
                <span className="uppercase tracking-[0.16em] font-semibold">{product.category}</span>
                <div className="flex items-center gap-1 text-[#1C1917]">
                  <Star className="w-3.5 h-3.5 fill-[#1C1917]" />
                  <span className="font-semibold tabular-nums">{product.rating}</span>
                  <span className="text-[#78716C]">({product.reviewCount} client reviews)</span>
                </div>
              </div>

              <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#1C1917] font-normal leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pb-3 border-b border-[#E8E0D5]">
              <span className="text-2xl sm:text-3xl font-bold text-[#1C1917] tabular-nums">
                {formatPKR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-[#A8A29E] line-through tabular-nums">
                  {formatPKR(product.originalPrice)}
                </span>
              )}
              <span className="text-xs text-emerald-700 font-medium ml-auto">
                In Stock ({product.stockCount} available)
              </span>
            </div>

            {/* Product Narrative */}
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector if available */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[#1C1917]">
                    Select Size: <span className="font-normal text-[#57534E]">{activeSize}</span>
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

            {/* Quantity Stepper & Add to Cart & Buy Now */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#D6CEC5] bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-[#78716C] hover:text-[#1C1917] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-semibold tabular-nums text-[#1C1917]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2.5 text-[#78716C] hover:text-[#1C1917] transition-colors"
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

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="py-3.5 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  {addedRecently ? (
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
                  className="py-3.5 px-6 bg-[#FAF8F5] border border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Buy Now (Instant Checkout)</span>
                </button>
              </div>
            </div>

            {/* Delivery & Assurance Strip */}
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

            {/* Collapsible Information Tabs */}
            <div className="pt-4 border-t border-[#E8E0D5]">
              <div className="flex border-b border-[#E8E0D5] text-xs">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-4 uppercase tracking-wider font-semibold border-b-2 transition-colors ${
                    activeTab === 'details' ? 'border-[#1C1917] text-[#1C1917]' : 'border-transparent text-[#78716C]'
                  }`}
                >
                  Metallurgy
                </button>
                <button
                  onClick={() => setActiveTab('care')}
                  className={`py-2 px-4 uppercase tracking-wider font-semibold border-b-2 transition-colors ${
                    activeTab === 'care' ? 'border-[#1C1917] text-[#1C1917]' : 'border-transparent text-[#78716C]'
                  }`}
                >
                  Silver Care
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`py-2 px-4 uppercase tracking-wider font-semibold border-b-2 transition-colors ${
                    activeTab === 'shipping' ? 'border-[#1C1917] text-[#1C1917]' : 'border-transparent text-[#78716C]'
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
                className="text-xs uppercase tracking-wider font-medium text-[#1C1917] underline hover:text-[#78716C]"
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
