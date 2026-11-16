import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Check,
  X,
  Upload,
  Eye,
  Star,
  Sparkles,
  Layers,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Product } from '../../types';

export const ProductsSection: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    showAdminToast,
  } = useAdmin();

  // Search, filter & sort state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'inactive' | 'low_stock' | 'out_of_stock'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'stock' | 'name'>('newest');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Rings',
    price: 4500,
    salePrice: '',
    sku: '',
    stockCount: 10,
    description: '',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Triple Rhodium Anti-Tarnish Finish',
    stone: 'AAA Flawless Swiss Zirconia',
    weight: '3.8 grams',
    hallmark: '925 Laser Inscription',
    sizes: '6, 7, 8',
    status: 'active' as 'active' | 'inactive',
    isFeatured: false,
    isBestSeller: false,
    imageUrl: '',
  });

  const [previewImage, setPreviewImage] = useState<string>('');

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.name || 'Rings',
      price: 4500,
      salePrice: '',
      sku: `SA-${(categories[0]?.name || 'RNG').slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      stockCount: 12,
      description: 'Artisan handcrafted solid 925 sterling silver fine jewellery piece featuring mirror rhodium plating.',
      silverPurity: 'Solid 925 Sterling Silver',
      plating: 'Triple Rhodium Anti-Tarnish Finish',
      stone: 'AAA Flawless Swiss Zirconia',
      weight: '3.6 grams',
      hallmark: '925 Laser Inscription',
      sizes: '6, 7, 8',
      status: 'active',
      isFeatured: false,
      isBestSeller: false,
      imageUrl: '',
    });
    setPreviewImage('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      price: p.price,
      salePrice: p.salePrice ? String(p.salePrice) : '',
      sku: p.sku || `SA-${p.category.slice(0, 3).toUpperCase()}-101`,
      stockCount: p.stockCount ?? (p.inStock ? 10 : 0),
      description: p.description,
      silverPurity: p.silverPurity || 'Solid 925 Sterling Silver',
      plating: p.plating || 'Triple Rhodium Anti-Tarnish Finish',
      stone: p.stone || 'AAA Flawless Swiss Zirconia',
      weight: p.weight || '3.5 grams',
      hallmark: p.hallmark || '925 Laser Inscription',
      sizes: (p.sizes || []).join(', '),
      status: p.status || (p.inStock ? 'active' : 'inactive'),
      isFeatured: Boolean(p.isFeatured),
      isBestSeller: Boolean(p.isBestSeller),
      imageUrl: p.images[0] || '',
    });
    setPreviewImage(p.images[0] || '');
    setIsModalOpen(true);
  };

  // Image Upload handler (Base64 for demo persistence)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAdminToast('Image exceeds 2MB limit. Please choose a smaller photo.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showAdminToast('Please provide a product title', 'error');
      return;
    }

    const parsedSizes = formData.sizes
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const imageFinal = previewImage.trim() || formData.imageUrl.trim() || '/src/assets/images/category_rings_1794482387362.jpg';

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        sku: formData.sku.trim(),
        stockCount: Number(formData.stockCount),
        description: formData.description.trim(),
        silverPurity: formData.silverPurity,
        plating: formData.plating,
        stone: formData.stone,
        weight: formData.weight,
        hallmark: formData.hallmark,
        sizes: parsedSizes.length > 0 ? parsedSizes : ['Standard'],
        status: formData.status,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        images: [imageFinal, ...(editingProduct.images.slice(1))],
      });
    } else {
      addProduct({
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        sku: formData.sku.trim(),
        stockCount: Number(formData.stockCount),
        description: formData.description.trim(),
        silverPurity: formData.silverPurity,
        plating: formData.plating,
        stone: formData.stone,
        weight: formData.weight,
        hallmark: formData.hallmark,
        sizes: parsedSizes.length > 0 ? parsedSizes : ['Standard'],
        status: formData.status,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        images: [imageFinal],
      });
    }

    setIsModalOpen(false);
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
          p.category.toLowerCase().includes(search.toLowerCase());

        const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;

        let matchesStatus = true;
        if (statusFilter === 'active') matchesStatus = p.status !== 'inactive';
        if (statusFilter === 'inactive') matchesStatus = p.status === 'inactive';
        if (statusFilter === 'out_of_stock') matchesStatus = (p.stockCount ?? 0) <= 0 || !p.inStock;
        if (statusFilter === 'low_stock') matchesStatus = (p.stockCount ?? 0) > 0 && (p.stockCount ?? 0) <= 5;

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock') return (b.stockCount ?? 0) - (a.stockCount ?? 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return (b.id || '').localeCompare(a.id || '');
      });
  }, [products, search, categoryFilter, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Atelier Inventory & Catalog
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Product Management
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            Total {products.length} silver jewellery creations ({products.filter(p => p.status !== 'inactive').length} active on customer storefront)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, SKU or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#1C1917] text-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="low_stock">Low Stock (≤5)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock">Stock Quantity</option>
            <option value="name">Product Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E8E0D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E0D5] text-[#78716C] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">SKU / Purity</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Price (PKR)</th>
                <th className="py-3 px-4 font-semibold">Stock</th>
                <th className="py-3 px-4 font-semibold">Badges</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFEB]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#78716C]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-[#D6CEC5]" />
                      <p className="font-serif-luxury text-base text-[#1C1917]">No products matched your criteria</p>
                      <button
                        onClick={() => { setSearch(''); setCategoryFilter('All'); setStatusFilter('All'); }}
                        className="text-xs text-[#1C1917] underline uppercase tracking-wider"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = p.stockCount ?? 0;
                  const isLow = stock > 0 && stock <= 5;
                  const isOut = stock <= 0 || !p.inStock;

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Product details & thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-xs border border-[#E8E0D5] shrink-0"
                          />
                          <div className="min-w-0 max-w-[220px]">
                            <h4 className="font-medium text-[#1C1917] truncate" title={p.name}>
                              {p.name}
                            </h4>
                            <p className="text-[11px] text-[#78716C] truncate mt-0.5">
                              {p.plating || 'Triple Rhodium Plated'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU & Purity */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#57534E]">
                        <div>{p.sku || 'SA-925-101'}</div>
                        <span className="text-[10px] text-[#A8A29E]">925 Solid Silver</span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-[#1C1917]">
                        <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E0D5] text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#1C1917]">
                          PKR {p.price.toLocaleString()}
                        </div>
                        {p.salePrice && (
                          <div className="text-[10px] text-[#78716C] line-through">
                            PKR {p.salePrice.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <span className="font-medium text-[#1C1917]">{stock}</span>
                          <span className="text-[10px] text-[#78716C]">
                            {isOut ? '(Out)' : isLow ? '(Low)' : 'units'}
                          </span>
                        </div>
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {p.isFeatured && (
                            <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[9px] uppercase tracking-wider font-semibold" title="Featured on Homepage">
                              Featured
                            </span>
                          )}
                          {p.isBestSeller && (
                            <span className="px-1.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-800 text-[9px] uppercase tracking-wider font-semibold" title="Best Seller">
                              Best
                            </span>
                          )}
                          {!p.isFeatured && !p.isBestSeller && (
                            <span className="text-[#A8A29E] text-[10px]">—</span>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleProductStatus(p.id)}
                          className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border cursor-pointer transition-colors ${
                            p.status !== 'inactive'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          {p.status !== 'inactive' ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F4EFEB] transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E0D5] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E0D5]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#78716C] font-semibold">
                  Atelier Database
                </span>
                <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#1C1917]">
                  {editingProduct ? 'Edit Silver Creation' : 'Add New Solid 925 Product'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lumina Pavé Solitaire Ring"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SKU */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Atelier SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="SA-RNG-101"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                {/* Price (PKR) */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                {/* Compare / Sale Price */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#78716C] uppercase tracking-wider text-[10px]">
                    Original / Strikethrough Price (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5800"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Stock Available (Units) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stockCount}
                    onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                {/* Sizes */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Sizes / Variants (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="6, 7, 8, 9 or 16-18 inches"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              {/* Image Upload & Preview */}
              <div className="space-y-2 pt-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px] block">
                  Product Photography *
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 border border-dashed border-[#D6CEC5] bg-[#FAF8F5]">
                  <div className="w-20 h-20 bg-white border border-[#E8E0D5] flex items-center justify-center overflow-hidden shrink-0">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[#A8A29E]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5 w-full">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-[#1C1917] text-white text-[11px] uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-[#78716C]">or enter direct image URL below</span>
                    </div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or relative path"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        setPreviewImage(e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 border border-[#E8E0D5] bg-white text-[#1C1917] text-[11px] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Description & Craft Details
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[#F4EFEB]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                    className="accent-[#1C1917]"
                  />
                  <span className="font-medium text-[#1C1917]">Publish on Storefront (Active)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="accent-[#1C1917]"
                  />
                  <span className="font-medium text-[#1C1917]">Homepage Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="accent-[#1C1917]"
                  />
                  <span className="font-medium text-[#1C1917]">Best Seller Badge</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8E0D5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D6CEC5] text-[#57534E] hover:bg-[#F4EFEB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1C1917] text-white uppercase tracking-wider font-semibold hover:bg-[#292524] transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif-luxury text-xl text-[#1C1917]">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Are you certain you wish to remove this product from the Silver Aura atelier database? This will also remove it from the customer storefront catalog.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 border border-[#D6CEC5] text-[#57534E] text-xs hover:bg-[#F4EFEB]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deletingProductId);
                  setDeletingProductId(null);
                }}
                className="px-4 py-2 bg-rose-700 text-white text-xs uppercase tracking-wider font-semibold hover:bg-rose-800"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
