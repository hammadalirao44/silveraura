import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openProduct, openQuickView, addToCart, toggleWishlist, isInWishlist } = useShop();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [addedRecently, setAddedRecently] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const displayImage = product.images[0];
  const secondaryImage = product.images.length > 1 ? product.images[1] : product.images[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 1600);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickView(product);
  };

  // Format PKR
  const formatPKR = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <div
      onClick={() => openProduct(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col bg-transparent cursor-pointer transition-all duration-300"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] bg-[#F4EFEB] overflow-hidden rounded-xs border border-[#E8E0D5]/60 mb-3">
        {!imageError ? (
          <img
            src={isHovered && secondaryImage ? secondaryImage : displayImage}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#FAF8F5] to-[#E8E0D5] text-[#78716C]">
            <span className="font-serif-luxury text-xl text-[#1C1917] mb-1">925 Sterling Silver</span>
            <span className="text-xs">{product.name}</span>
          </div>
        )}

        {/* Quiet Top Badges (Text only, zero-pill) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isNewArrival && (
            <span className="text-[10px] uppercase tracking-widest font-semibold text-[#1C1917] bg-[#FAF8F5]/90 backdrop-blur-xs px-2 py-0.5 border border-[#E8E0D5]">
              New Arrival
            </span>
          )}
          {product.isBestSeller && !product.isNewArrival && (
            <span className="text-[10px] uppercase tracking-widest font-semibold text-[#1C1917] bg-[#FAF8F5]/90 backdrop-blur-xs px-2 py-0.5 border border-[#E8E0D5]">
              Bestseller
            </span>
          )}
          {product.stockCount <= 5 && product.stockCount > 0 && (
            <span className="text-[10px] tracking-wider font-medium text-[#78716C] bg-white/80 px-1.5 py-0.5">
              Only {product.stockCount} left
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 shadow-xs ${
            isFavorited
              ? 'bg-[#1C1917] text-[#FAF8F5]'
              : 'bg-white/90 backdrop-blur-xs text-[#78716C] hover:text-[#1C1917] hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Quick Action Tray */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={handleQuickAdd}
            className="flex-1 py-2.5 px-3 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            {addedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleQuickView}
            aria-label="Quick preview"
            className="w-9 h-9 bg-white/95 hover:bg-white text-[#1C1917] flex items-center justify-center shadow-md transition-colors shrink-0"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Metadata & Price */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-[#78716C]">
          <span className="uppercase tracking-[0.14em] text-[11px] font-medium">
            {product.category}
          </span>
          <span className="text-[11px] tracking-wide text-[#A8A29E]">
            925 Solid
          </span>
        </div>

        <h3 className="font-serif-luxury text-base sm:text-lg text-[#1C1917] font-medium leading-snug group-hover:text-[#78716C] transition-colors truncate">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm sm:text-base font-semibold text-[#1C1917] tabular-nums tracking-tight">
            {formatPKR(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-[#A8A29E] line-through tabular-nums">
              {formatPKR(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
