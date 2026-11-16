import React, { useMemo } from 'react';
import { Search, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';

export const ShopPage: React.FC = () => {
  const {
    products,
    categories,
    catalogLoading,
    catalogError,
    refreshCatalog,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    priceRange,
    setPriceRange,
    inStockOnly,
    setInStockOnly,
    resetFilters,
  } = useShop();

  const categoryTabs = useMemo(
    () => ['All', ...categories.map((c) => c.name)],
    [categories]
  );

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products
      .filter((p) => {
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }
        if (q) {
          const match =
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.sku && p.sku.toLowerCase().includes(q)) ||
            (p.stone && p.stone.toLowerCase().includes(q));
          if (!match) return false;
        }
        if (p.price < priceRange[0] || p.price > priceRange[1]) {
          return false;
        }
        if (inStockOnly && !p.inStock) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, priceRange, inStockOnly, sortBy]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-[#78716C] font-semibold block">
            Solid 925 Sterling Silver
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            {selectedCategory === 'All' ? 'The Complete Collection' : selectedCategory}
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E]">
            Hand-forged rings, pendants, earrings, and suites hallmarked for purity and bathed in mirror rhodium.
          </p>
        </div>

        {/* Dynamic Category Tabs Filter Bar */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 pb-4 mb-8 scrollbar-none">
          {categoryTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-2 px-4 text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1C1917] text-[#FAF8F5]'
                  : 'bg-white border border-[#E8E0D5] text-[#57534E] hover:border-[#1C1917] hover:text-[#1C1917]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toolbar: Search, Filters & Sorting */}
        <div className="bg-white border border-[#E8E0D5] p-4 sm:p-5 mb-8 rounded-xs shadow-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by piece name, SKU, stone or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#D6CEC5] text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#44403C]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded-xs text-[#1C1917] focus:ring-0"
                />
                <span>In Stock Only</span>
              </label>

              <div className="flex items-center gap-2 text-[#44403C]">
                <span>Max Price:</span>
                <select
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="bg-[#FAF8F5] border border-[#D6CEC5] px-2 py-1 text-xs text-[#1C1917] focus:outline-none"
                >
                  <option value={100000}>All Prices</option>
                  <option value={5000}>Under PKR 5,000</option>
                  <option value={8000}>Under PKR 8,000</option>
                  <option value={15000}>Under PKR 15,000</option>
                  <option value={30000}>Under PKR 30,000</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-[#44403C]">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | 'featured'
                        | 'price-low'
                        | 'price-high'
                        | 'rating'
                        | 'newest'
                    )
                  }
                  className="bg-[#FAF8F5] border border-[#D6CEC5] px-2 py-1 text-xs text-[#1C1917] focus:outline-none"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>

              {(selectedCategory !== 'All' ||
                searchQuery ||
                inStockOnly ||
                priceRange[1] < 100000) && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#78716C] hover:text-[#1C1917] flex items-center gap-1 underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#F4EFEB] flex items-center justify-between text-xs text-[#78716C]">
            <span>
              Showing{' '}
              <strong className="text-[#1C1917] tabular-nums">{filteredProducts.length}</strong>{' '}
              creation{filteredProducts.length === 1 ? '' : 's'}
            </span>
            <span>All creations in solid 925 sterling silver</span>
          </div>
        </div>

        {/* Catalog Error */}
        {catalogError && (
          <div className="bg-amber-50 border border-amber-200 p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{catalogError}</span>
            </div>
            <button
              onClick={() => void refreshCatalog()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1917] text-white uppercase tracking-wider text-[11px] font-medium hover:bg-[#292524] shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Product Grid */}
        {catalogLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <div key={idx} className="animate-pulse space-y-3">
                <div className="aspect-[3/4] bg-[#E8E0D5]/70 rounded-xs" />
                <div className="h-4 bg-[#E8E0D5]/80 w-3/4" />
                <div className="h-4 bg-[#E8E0D5]/60 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white border border-[#E8E0D5] p-8">
            <p className="font-serif-luxury text-2xl text-[#1C1917]">
              {products.length === 0
                ? 'No active products are currently published.'
                : 'No creations match your filter criteria.'}
            </p>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              {products.length === 0
                ? 'Once products are added and marked active in the Silver Aura admin catalog, they will appear here.'
                : 'Try adjusting your search terms or clearing price filters to view our full sterling silver catalog.'}
            </p>
            {products.length > 0 && (
              <button
                onClick={resetFilters}
                className="py-2.5 px-6 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
