import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    toggleWishlist,
    addToCart,
    openProduct,
    navigateTo,
  } = useShop();

  if (!isWishlistOpen) return null;

  const formatPKR = (num: number) => `PKR ${num.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-[#E8E0D5]">
          
          {/* Header */}
          <div className="p-6 border-b border-[#E8E0D5] flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-2xl text-[#1C1917] font-medium">
                Saved Creations
              </h2>
              <span className="text-xs text-[#78716C] tracking-wide">
                {wishlist.length} {wishlist.length === 1 ? 'favourite' : 'favourites'}
              </span>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#E8E0D5]">
            {wishlist.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <p className="font-serif-luxury text-xl text-[#78716C]">Your wishlist is empty.</p>
                <p className="text-xs text-[#A8A29E] max-w-xs mx-auto">
                  Click the heart icon on any jewellery piece to curate your personal capsule.
                </p>
                <button
                  onClick={() => {
                    setIsWishlistOpen(false);
                    navigateTo('shop');
                  }}
                  className="py-3 px-6 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              wishlist.map((product) => (
                <div key={product.id} className="py-4 flex gap-4 first:pt-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    onClick={() => {
                      setIsWishlistOpen(false);
                      openProduct(product);
                    }}
                    className="w-20 h-24 object-cover rounded-xs bg-[#E8E0D5] shrink-0 border border-[#E8E0D5] cursor-pointer hover:opacity-90 transition-opacity"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          onClick={() => {
                            setIsWishlistOpen(false);
                            openProduct(product);
                          }}
                          className="font-serif-luxury text-base text-[#1C1917] font-medium leading-snug cursor-pointer hover:text-[#78716C] transition-colors"
                        >
                          {product.name}
                        </h3>
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="text-[#A8A29E] hover:text-[#DC2626] transition-colors p-1"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-[#78716C] mt-0.5">
                        <span>{product.category}</span>
                        <span className="mx-1">·</span>
                        <span className="tabular-nums font-medium text-[#1C1917]">{formatPKR(product.price)}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          addToCart(product, 1);
                        }}
                        className="py-2 px-3 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 hover:bg-[#292524] transition-colors flex-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {wishlist.length > 0 && (
            <div className="p-6 border-t border-[#E8E0D5] bg-[#FAF8F5]">
              <button
                onClick={() => {
                  wishlist.forEach((p) => addToCart(p, 1));
                  setIsWishlistOpen(false);
                }}
                className="w-full py-3 bg-[#FAF8F5] border border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF8F5] text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Add All to Bag</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
