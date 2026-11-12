import React, { useMemo } from 'react';
import { SlidersHorizontal, Search, RotateCcw, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';

export const ShopPage: React.FC = () => {
  const {
    products,
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

  const categories = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Anklets', 'Jewellery Sets'];

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.stone && p.stone.toLowerCase().includes(q));
          if (!match) return false;
        }
        // Price
        if (p.price < priceRange[0] || p.price > priceRange[1]) {
          return false;
        }
        // Stock
        if (inStockOnly && !p.inStock) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        // default: featured
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, priceRange, inStockOnly, sortBy]);

  const formatPKR = (num: number) => `PKR ${num.toLocaleString()}`;

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

        {/* Category Pill/Tabs Filter Bar (Interactive Segmented Buttons) */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
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
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by piece name, stone or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#D6CEC5] text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            {/* Filter controls row */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              
              {/* In Stock toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-[#44403C]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded-xs text-[#1C1917] focus:ring-0"
                />
                <span>In Stock Only</span>
              </label>

              {/* Price Max Filter */}
              <div className="flex items-center gap-2 text-[#44403C]">
                <span>Max Price:</span>
                <select
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="bg-[#FAF8F5] border border-[#D6CEC5] px-2 py-1 text-xs text-[#1C1917] focus:outline-none"
                >
                  <option value={30000}>All Prices</option>
                  <option value={5000}>Under PKR 5,000</option>
                  <option value={8000}>Under PKR 8,000</option>
                  <option value={15000}>Under PKR 15,000</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-[#44403C]">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#FAF8F5] border border-[#D6CEC5] px-2 py-1 text-xs text-[#1C1917] focus:outline-none"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>

              {/* Reset button */}
              {(selectedCategory !== 'All' || searchQuery || inStockOnly || priceRange[1] < 30000) && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#78716C] hover:text-[#1C1917] flex items-center gap-1 underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}

            </div>

          </div>

          <div className="mt-3 pt-3 border-t border-[#F4EFEB] flex items-center justify-between text-xs text-[#78716C]">
            <span>
              Showing <strong className="text-[#1C1917] tabular-nums">{filteredProducts.length}</strong> creations
            </span>
            <span>All creations in solid 925 sterling silver</span>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white border border-[#E8E0D5] p-8">
            <p className="font-serif-luxury text-2xl text-[#1C1917]">No creations match your filter criteria.</p>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              Try adjusting your search terms or clearing price filters to view our full sterling silver catalog.
            </p>
            <button
              onClick={resetFilters}
              className="py-2.5 px-6 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium"
            >
              Reset All Filters
            </button>
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
