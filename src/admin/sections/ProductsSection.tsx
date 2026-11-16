import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  Star,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Layers,
  Check,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { CategoryItem, Product } from '../../types';
import { fetchAdminCategories } from '../../services/adminCategoryService';
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  toggleAdminProductField,
  deleteAdminProduct,
  syncProductImages,
  setMasterInventoryRpc,
  createVariantRpc,
  updateVariantRpc,
  deleteVariantRpc,
  StagedProductImage,
} from '../../services/adminProductService';
import { formatVariantLabel, slugifyText } from '../../services/catalogService';
import { validateMediaFile } from '../../services/storageService';

interface StagedVariant {
  tempId: string;
  existingId?: string;
  sizeLabel: string;
  colorLabel: string;
  sku: string;
  price: string; // empty string => inherit product price
  stock: number;
  isActive: boolean;
  sortOrder: number;
}

const DEFAULT_CARE_NOTES =
  'Store in an airtight tarnish-resistant pouch away from moisture.\nAvoid direct contact with perfumes, lotions, and chlorinated water.\nGently buff with the included silver polishing cloth after wear.';

export const ProductsSection: React.FC = () => {
  const { isSupabaseReady, supabaseError, showAdminToast, refreshDashboard } = useAdmin();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'active' | 'inactive' | 'low_stock' | 'out_of_stock'
  >('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'stock' | 'name'>(
    'newest'
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Product form fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    sku: '',
    price: 4500,
    salePrice: '',
    description: '',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Triple Rhodium Anti-Tarnish Finish',
    stone: 'AAA Swiss Cubic Zirconia',
    weight: '3.8 grams',
    hallmark: '925 Laser Inscription',
    careNotesText: DEFAULT_CARE_NOTES,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    masterStock: 10,
    lowStockThreshold: 5,
  });

  // Staged images & object URL tracking
  const [stagedImages, setStagedImages] = useState<StagedProductImage[]>([]);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // Staged variants
  const [stagedVariants, setStagedVariants] = useState<StagedVariant[]>([]);
  const [removedVariantIds, setRemovedVariantIds] = useState<string[]>([]);
  const [variantDraft, setVariantDraft] = useState({
    sizeLabel: '',
    colorLabel: '',
    sku: '',
    price: '',
    stock: 5,
    isActive: true,
  });

  // Delete dialog state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const registerObjectUrl = (url: string) => {
    objectUrlsRef.current.add(url);
    return url;
  };

  const cleanupObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => cleanupObjectUrls();
  }, [cleanupObjectUrls]);

  const loadData = useCallback(async () => {
    if (!isSupabaseReady) {
      setLoading(false);
      setLoadError(
        supabaseError ||
          'Supabase environment variables are not configured. Product management requires a connected Supabase project.'
      );
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const [prodData, catData] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminCategories(),
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to fetch catalog data.';
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [isSupabaseReady, supabaseError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const broadcastCatalogChange = useCallback(async () => {
    window.dispatchEvent(new CustomEvent('silver_aura_catalog_updated'));
    await refreshDashboard();
  }, [refreshDashboard]);

  const openAddModal = () => {
    if (categories.length === 0) {
      showAdminToast('Please create at least one category before adding products.', 'error');
      return;
    }
    cleanupObjectUrls();
    setEditingProduct(null);
    setSlugManuallyEdited(false);

    const defaultCat = categories[0];
    setFormData({
      name: '',
      slug: '',
      categoryId: defaultCat.id,
      sku: `SA-${defaultCat.name.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      price: 4500,
      salePrice: '',
      description: '',
      silverPurity: 'Solid 925 Sterling Silver',
      plating: 'Triple Rhodium Anti-Tarnish Finish',
      stone: 'AAA Swiss Cubic Zirconia',
      weight: '3.6 grams',
      hallmark: '925 Laser Inscription',
      careNotesText: DEFAULT_CARE_NOTES,
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      masterStock: 10,
      lowStockThreshold: 5,
    });
    setStagedImages([]);
    setStagedVariants([]);
    setRemovedVariantIds([]);
    setVariantDraft({
      sizeLabel: '',
      colorLabel: '',
      sku: '',
      price: '',
      stock: 5,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    cleanupObjectUrls();
    setEditingProduct(p);
    setSlugManuallyEdited(true);

    const matchedCategory =
      categories.find((c) => c.id === p.categoryId) ||
      categories.find((c) => c.name === p.category) ||
      categories[0];

    setFormData({
      name: p.name,
      slug: p.slug || slugifyText(p.name),
      categoryId: matchedCategory?.id || '',
      sku: p.sku || '',
      price: p.basePrice ?? p.price,
      salePrice: p.salePrice !== null && p.salePrice !== undefined ? String(p.salePrice) : '',
      description: p.description || '',
      silverPurity: p.silverPurity || 'Solid 925 Sterling Silver',
      plating: p.plating || '',
      stone: p.stone || '',
      weight: p.weight || '3.5 grams',
      hallmark: p.hallmark || '925 Laser Inscription',
      careNotesText:
        p.careNotes && p.careNotes.length > 0 ? p.careNotes.join('\n') : DEFAULT_CARE_NOTES,
      isActive: p.status !== 'inactive',
      isFeatured: Boolean(p.isFeatured),
      isBestSeller: Boolean(p.isBestSeller),
      isNewArrival: Boolean(p.isNewArrival),
      masterStock: p.stockCount ?? 0,
      lowStockThreshold: p.lowStockThreshold ?? 5,
    });

    const initialImages: StagedProductImage[] = (p.productImages ?? []).map((img, idx) => ({
      tempId: img.id,
      existingId: img.id,
      existingStoragePath: img.storagePath,
      previewUrl: img.imageUrl,
      altText: img.altText || p.name,
      isPrimary: img.isPrimary,
      sortOrder: idx,
    }));
    setStagedImages(initialImages);

    const initialVariants: StagedVariant[] = (p.productVariants ?? []).map((v, idx) => ({
      tempId: v.id,
      existingId: v.id,
      sizeLabel: v.sizeLabel ?? '',
      colorLabel: v.colorLabel ?? '',
      sku: v.sku ?? '',
      price: v.price !== null && v.price !== undefined ? String(v.price) : '',
      stock: v.stock,
      isActive: v.isActive,
      sortOrder: idx,
    }));
    setStagedVariants(initialVariants);
    setRemovedVariantIds([]);
    setVariantDraft({
      sizeLabel: '',
      colorLabel: '',
      sku: '',
      price: '',
      stock: 5,
      isActive: true,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    cleanupObjectUrls();
    setIsModalOpen(false);
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: !slugManuallyEdited ? slugifyText(value) : prev.slug,
    }));
  };

  // Multi-image upload staging
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    const validAdditions: StagedProductImage[] = [];
    for (const file of files) {
      const err = validateMediaFile(file);
      if (err) {
        showAdminToast(err, 'error');
        continue;
      }
      const previewUrl = registerObjectUrl(URL.createObjectURL(file));
      validAdditions.push({
        tempId: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        previewUrl,
        file,
        altText: formData.name.trim() || file.name,
        isPrimary: false,
        sortOrder: 0,
      });
    }

    if (validAdditions.length === 0) return;

    setStagedImages((prev) => {
      const merged = [...prev, ...validAdditions].map((item, idx) => ({
        ...item,
        sortOrder: idx,
      }));
      if (!merged.some((img) => img.isPrimary)) {
        merged[0].isPrimary = true;
      }
      return merged;
    });
  };

  const handleReplaceImage = (tempId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const err = validateMediaFile(file);
    if (err) {
      showAdminToast(err, 'error');
      return;
    }

    const previewUrl = registerObjectUrl(URL.createObjectURL(file));
    setStagedImages((prev) =>
      prev.map((img) =>
        img.tempId === tempId
          ? {
              ...img,
              file,
              previewUrl,
            }
          : img
      )
    );
  };

  const handleSetPrimaryImage = (tempId: string) => {
    setStagedImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.tempId === tempId,
      }))
    );
  };

  const handleMoveImage = (idx: number, direction: -1 | 1) => {
    setStagedImages((prev) => {
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.splice(target, 0, moved);
      return next.map((img, i) => ({ ...img, sortOrder: i }));
    });
  };

  const handleRemoveImage = (tempId: string) => {
    setStagedImages((prev) => {
      const remaining = prev.filter((img) => img.tempId !== tempId);
      if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
        remaining[0] = { ...remaining[0], isPrimary: true };
      }
      return remaining.map((img, i) => ({ ...img, sortOrder: i }));
    });
  };

  // Variant helpers
  const handleAddVariantDraft = () => {
    const sizeClean = variantDraft.sizeLabel.trim();
    const colorClean = variantDraft.colorLabel.trim();
    if (!sizeClean && !colorClean) {
      showAdminToast('Provide at least a Size Label or Finish / Color Label for the variant.', 'error');
      return;
    }

    const duplicate = stagedVariants.some(
      (v) =>
        v.sizeLabel.trim().toLowerCase() === sizeClean.toLowerCase() &&
        v.colorLabel.trim().toLowerCase() === colorClean.toLowerCase()
    );
    if (duplicate) {
      showAdminToast('A variant with that size and finish combination already exists.', 'error');
      return;
    }

    if (variantDraft.price.trim()) {
      const parsed = Number(variantDraft.price);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        showAdminToast('Variant price override must be greater than 0 PKR.', 'error');
        return;
      }
    }

    const nextStock = Math.max(0, Math.floor(Number(variantDraft.stock) || 0));

    setStagedVariants((prev) => [
      ...prev,
      {
        tempId: `var-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sizeLabel: sizeClean,
        colorLabel: colorClean,
        sku: variantDraft.sku.trim(),
        price: variantDraft.price.trim(),
        stock: nextStock,
        isActive: variantDraft.isActive,
        sortOrder: prev.length,
      },
    ]);

    setVariantDraft({
      sizeLabel: '',
      colorLabel: '',
      sku: '',
      price: '',
      stock: 5,
      isActive: true,
    });
  };

  const handleUpdateStagedVariant = (tempId: string, patch: Partial<StagedVariant>) => {
    setStagedVariants((prev) =>
      prev.map((v) => (v.tempId === tempId ? { ...v, ...patch } : v))
    );
  };

  const handleRemoveStagedVariant = (variant: StagedVariant) => {
    setStagedVariants((prev) => prev.filter((v) => v.tempId !== variant.tempId));
    if (variant.existingId) {
      setRemovedVariantIds((prev) => [...prev, variant.existingId!]);
    }
  };

  const computedModalStock = useMemo(() => {
    if (stagedVariants.length > 0) {
      return stagedVariants
        .filter((v) => v.isActive)
        .reduce((sum, v) => sum + Math.max(0, Number(v.stock) || 0), 0);
    }
    return Math.max(0, Math.floor(Number(formData.masterStock) || 0));
  }, [stagedVariants, formData.masterStock]);

  // Save full product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = formData.name.trim();
    const cleanSlug = slugifyText(formData.slug || cleanName);
    const priceNum = Number(formData.price);
    const saleNum = formData.salePrice.trim() ? Number(formData.salePrice.trim()) : null;

    if (!cleanName) {
      showAdminToast('Please enter a product name.', 'error');
      return;
    }
    if (!cleanSlug) {
      showAdminToast('Please provide a valid URL slug.', 'error');
      return;
    }
    if (!formData.categoryId) {
      showAdminToast('Please choose a category.', 'error');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      showAdminToast('Base price must be greater than 0 PKR.', 'error');
      return;
    }
    if (saleNum !== null) {
      if (!Number.isFinite(saleNum) || saleNum <= 0) {
        showAdminToast('Sale price must be greater than 0 PKR.', 'error');
        return;
      }
      if (saleNum > priceNum) {
        showAdminToast('Sale price cannot exceed the regular price.', 'error');
        return;
      }
    }

    // Validate all staged variants before hitting DB
    const comboSet = new Set<string>();
    for (const v of stagedVariants) {
      const s = v.sizeLabel.trim();
      const c = v.colorLabel.trim();
      if (!s && !c) {
        showAdminToast('Every variant must specify a Size Label or Finish / Color.', 'error');
        return;
      }
      const comboKey = `${s.toLowerCase()}::${c.toLowerCase()}`;
      if (comboSet.has(comboKey)) {
        showAdminToast(`Duplicate variant combination "${formatVariantLabel(s, c)}".`, 'error');
        return;
      }
      comboSet.add(comboKey);

      if (v.price.trim()) {
        const vp = Number(v.price.trim());
        if (!Number.isFinite(vp) || vp <= 0) {
          showAdminToast(
            `Variant "${formatVariantLabel(s, c)}" price must be greater than 0 PKR.`,
            'error'
          );
          return;
        }
      }
    }

    const careNotes = formData.careNotesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      categoryId: formData.categoryId,
      name: cleanName,
      slug: cleanSlug,
      sku: formData.sku.trim(),
      price: Math.round(priceNum),
      originalPrice: saleNum !== null && saleNum < priceNum ? Math.round(priceNum) : null,
      salePrice: saleNum !== null ? Math.round(saleNum) : null,
      description: formData.description.trim(),
      silverPurity: formData.silverPurity.trim() || 'Solid 925 Sterling Silver',
      plating: formData.plating.trim(),
      stone: formData.stone.trim(),
      weight: formData.weight.trim(),
      hallmark: formData.hallmark.trim() || '925 Laser Inscription',
      careNotes,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      isBestSeller: formData.isBestSeller,
      isNewArrival: formData.isNewArrival,
    };

    setSaving(true);
    try {
      let productId = editingProduct?.id ?? '';
      const originalImages = editingProduct?.productImages ?? [];

      if (editingProduct) {
        await updateAdminProduct(productId, payload);
      } else {
        productId = await createAdminProduct(payload);
      }

      // 1. Sync multi-image gallery with Storage & product_images
      await syncProductImages(productId, cleanName, stagedImages, originalImages);

      // 2. Sync variants via Stage 1 locking RPCs
      for (let i = 0; i < stagedVariants.length; i++) {
        const v = stagedVariants[i];
        const parsedVariantPrice = v.price.trim() ? Math.round(Number(v.price.trim())) : null;
        const parsedStock = Math.max(0, Math.floor(Number(v.stock) || 0));

        if (v.existingId) {
          await updateVariantRpc(v.existingId, {
            sizeLabel: v.sizeLabel.trim() || null,
            colorLabel: v.colorLabel.trim() || null,
            sku: v.sku.trim() || null,
            price: parsedVariantPrice,
            stock: parsedStock,
            isActive: v.isActive,
            sortOrder: i,
          });
        } else {
          await createVariantRpc({
            productId,
            sizeLabel: v.sizeLabel.trim() || null,
            colorLabel: v.colorLabel.trim() || null,
            sku: v.sku.trim() || null,
            price: parsedVariantPrice,
            stock: parsedStock,
            isActive: v.isActive,
            sortOrder: i,
          });
        }
      }

      for (const removedId of removedVariantIds) {
        await deleteVariantRpc(removedId);
      }

      // 3. Sync master inventory via Stage 1 RPC
      const threshold = Math.max(0, Math.floor(Number(formData.lowStockThreshold) || 0));
      if (stagedVariants.length === 0) {
        const masterStock = Math.max(0, Math.floor(Number(formData.masterStock) || 0));
        await setMasterInventoryRpc(productId, masterStock, threshold);
      } else {
        // When product has variants, pass null for stock quantity so RPC only updates threshold
        await setMasterInventoryRpc(productId, null, threshold);
      }

      showAdminToast(editingProduct ? `Updated "${cleanName}"` : `Created "${cleanName}"`);
      cleanupObjectUrls();
      setIsModalOpen(false);
      await loadData();
      await broadcastCatalogChange();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to save product.';
      showAdminToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickToggle = async (
    p: Product,
    field: 'is_active' | 'is_featured' | 'is_best_seller',
    nextValue: boolean
  ) => {
    setBusyProductId(p.id);
    try {
      await toggleAdminProductField(p.id, field, nextValue);
      setProducts((prev) =>
        prev.map((item) => {
          if (item.id !== p.id) return item;
          if (field === 'is_active') return { ...item, status: nextValue ? 'active' : 'inactive' };
          if (field === 'is_featured') return { ...item, isFeatured: nextValue };
          return { ...item, isBestSeller: nextValue };
        })
      );
      const label =
        field === 'is_active'
          ? nextValue
            ? 'activated on storefront'
            : 'deactivated'
          : field === 'is_featured'
          ? nextValue
            ? 'marked Featured'
            : 'removed from Featured'
          : nextValue
          ? 'marked Best Seller'
          : 'removed from Best Sellers';
      showAdminToast(`${p.name} ${label}`);
      await broadcastCatalogChange();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to update product flag.';
      showAdminToast(msg, 'error');
    } finally {
      setBusyProductId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await deleteAdminProduct(deletingProduct.id, deletingProduct.productImages ?? []);
      showAdminToast(`Deleted "${deletingProduct.name}"`);
      setDeletingProduct(null);
      await loadData();
      await broadcastCatalogChange();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to delete product.';
      showAdminToast(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => {
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.slug && p.slug.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q);

        const matchesCategory =
          categoryFilter === 'All' ||
          p.categoryId === categoryFilter ||
          p.category === categoryFilter;

        const threshold = p.lowStockThreshold ?? 5;
        let matchesStatus = true;
        if (statusFilter === 'active') matchesStatus = p.status !== 'inactive';
        if (statusFilter === 'inactive') matchesStatus = p.status === 'inactive';
        if (statusFilter === 'out_of_stock') matchesStatus = p.stockCount <= 0;
        if (statusFilter === 'low_stock')
          matchesStatus = p.stockCount > 0 && p.stockCount <= threshold;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock') return b.stockCount - a.stockCount;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }, [products, search, categoryFilter, statusFilter, sortBy]);

  const activeCount = products.filter((p) => p.status !== 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Atelier Inventory & Catalog
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Product Management
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            {products.length} piece{products.length === 1 ? '' : 's'} ({activeCount} active on storefront)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-[#D6CEC5] text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#FAF8F5] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openAddModal}
            disabled={!isSupabaseReady}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {loadError && (
        <div className="bg-rose-50 border border-rose-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={() => void loadData()}
            className="px-3 py-1.5 bg-rose-900 text-white uppercase tracking-wider text-[11px] font-medium hover:bg-rose-800 shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white p-4 border border-[#E8E0D5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#1C1917] text-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917] cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {!c.active ? '(Inactive)' : ''}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as 'All' | 'active' | 'inactive' | 'low_stock' | 'out_of_stock'
              )
            }
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as 'newest' | 'price-asc' | 'price-desc' | 'stock' | 'name'
              )
            }
            className="px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] text-xs focus:outline-none focus:border-[#1C1917]"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock">Stock Quantity</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white border border-[#E8E0D5] p-12 text-center space-y-3 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#78716C] mx-auto" />
          <p className="text-xs text-[#78716C] uppercase tracking-widest">
            Loading Silver Aura Catalog...
          </p>
        </div>
      ) : products.length === 0 && !loadError ? (
        /* Empty Catalog State */
        <div className="bg-white border border-[#E8E0D5] p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E8E0D5] flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5 text-[#78716C]" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif-luxury text-2xl text-[#1C1917]">No products added yet</h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              {categories.length === 0
                ? 'Start by creating categories in the Categories section, then add your first 925 sterling silver pieces here.'
                : 'Add your first certified 925 sterling silver piece with photography, PKR pricing, and master or variant stock.'}
            </p>
          </div>
          {categories.length > 0 && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Product</span>
            </button>
          )}
        </div>
      ) : (
        /* Products Table */
        <div className="bg-white border border-[#E8E0D5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E0D5] text-[#78716C] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">SKU</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Price (PKR)</th>
                  <th className="py-3 px-4 font-semibold">Stock / Variants</th>
                  <th className="py-3 px-4 font-semibold">Highlights</th>
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
                        <p className="font-serif-luxury text-base text-[#1C1917]">
                          No products matched your search or filters
                        </p>
                        <button
                          onClick={() => {
                            setSearch('');
                            setCategoryFilter('All');
                            setStatusFilter('All');
                          }}
                          className="text-xs text-[#1C1917] underline uppercase tracking-wider cursor-pointer"
                        >
                          Reset filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const threshold = p.lowStockThreshold ?? 5;
                    const stock = p.stockCount ?? 0;
                    const isOut = stock <= 0;
                    const isLow = stock > 0 && stock <= threshold;
                    const variantCount = p.productVariants?.length ?? 0;
                    const isBusy = busyProductId === p.id;
                    const basePrice = p.basePrice ?? p.price;
                    const hasSale = p.salePrice !== null && p.salePrice !== undefined && p.salePrice < basePrice;

                    return (
                      <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                        {/* Thumbnail & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {p.images[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-12 h-12 object-cover rounded-xs border border-[#E8E0D5] shrink-0 bg-[#FAF8F5]"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xs border border-[#E8E0D5] bg-[#FAF8F5] flex items-center justify-center shrink-0">
                                <ImageIcon className="w-5 h-5 text-[#A8A29E]" />
                              </div>
                            )}
                            <div className="min-w-0 max-w-[210px]">
                              <h4 className="font-medium text-[#1C1917] truncate" title={p.name}>
                                {p.name}
                              </h4>
                              <p className="text-[11px] font-mono text-[#78716C] truncate mt-0.5">
                                /{p.slug || p.id.slice(0, 8)}
                                {p.images.length > 1 && ` · ${p.images.length} photos`}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#57534E]">
                          <div>{p.sku || '—'}</div>
                          <span className="text-[10px] font-sans text-[#A8A29E]">
                            {p.silverPurity}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-[#1C1917]">
                          <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E0D5] text-[11px] whitespace-nowrap">
                            {p.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-[#1C1917] tabular-nums">
                            PKR {p.price.toLocaleString()}
                          </div>
                          {hasSale && (
                            <div className="text-[10px] text-[#78716C] line-through tabular-nums">
                              PKR {basePrice.toLocaleString()}
                            </div>
                          )}
                        </td>

                        {/* Stock / Variants */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isOut
                                  ? 'bg-rose-500'
                                  : isLow
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                            <span className="font-semibold text-[#1C1917] tabular-nums">
                              {stock}
                            </span>
                            <span className="text-[10px] text-[#78716C]">
                              {isOut ? '(Out)' : isLow ? '(Low)' : 'units'}
                            </span>
                          </div>
                          {p.hasVariants && (
                            <span className="text-[10px] text-[#78716C] block mt-0.5">
                              {variantCount} variant{variantCount === 1 ? '' : 's'}
                            </span>
                          )}
                        </td>

                        {/* Quick Highlight Toggles */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                void handleQuickToggle(p, 'is_featured', !p.isFeatured)
                              }
                              className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border transition-colors cursor-pointer disabled:opacity-50 ${
                                p.isFeatured
                                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                                  : 'bg-white border-[#E8E0D5] text-[#A8A29E] hover:text-[#1C1917]'
                              }`}
                              title="Toggle Homepage Featured"
                            >
                              Featured
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                void handleQuickToggle(p, 'is_best_seller', !p.isBestSeller)
                              }
                              className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border transition-colors cursor-pointer disabled:opacity-50 ${
                                p.isBestSeller
                                  ? 'bg-purple-50 border-purple-300 text-purple-900'
                                  : 'bg-white border-[#E8E0D5] text-[#A8A29E] hover:text-[#1C1917]'
                              }`}
                              title="Toggle Best Seller"
                            >
                              Best
                            </button>
                          </div>
                        </td>

                        {/* Active Status */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              void handleQuickToggle(p, 'is_active', p.status === 'inactive')
                            }
                            className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold border cursor-pointer transition-colors disabled:opacity-50 ${
                              p.status !== 'inactive'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                            }`}
                          >
                            {p.status !== 'inactive' ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(p)}
                              disabled={isBusy}
                              className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F4EFEB] transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingProduct(p)}
                              disabled={isBusy}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
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
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E0D5] max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E0D5]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#78716C] font-semibold">
                  Atelier Database
                </span>
                <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#1C1917]">
                  {editingProduct ? `Edit "${editingProduct.name}"` : 'Add New Silver Product'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                disabled={saving}
                className="text-[#78716C] hover:text-[#1C1917] p-1 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 pt-5 text-xs">
              {/* Section 1: Core Info & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lumina Pavé Solitaire Ring"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="lumina-pave-solitaire-ring"
                    value={formData.slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setFormData((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] font-mono focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {!c.active ? '(Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="SA-RNG-101"
                    value={formData.sku}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] font-mono focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                      Price (PKR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#78716C] uppercase tracking-wider text-[10px]">
                      Sale Price (PKR)
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Optional"
                      value={formData.salePrice}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, salePrice: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                </div>
              </div>

              {/* Description & Craft Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#F4EFEB]">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Description & Craft Story
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe the craftsmanship, setting, and finish..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                      Silver Purity
                    </label>
                    <input
                      type="text"
                      value={formData.silverPurity}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, silverPurity: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                      Gross Weight
                    </label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, weight: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                      Plating / Finish
                    </label>
                    <input
                      type="text"
                      value={formData.plating}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, plating: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                      Gemstone
                    </label>
                    <input
                      type="text"
                      value={formData.stone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, stone: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                      Care Notes (one per line)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.careNotesText}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, careNotesText: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Multi-Image Supabase Storage Manager */}
              <div className="space-y-3 pt-4 border-t border-[#E8E0D5]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-[#1C1917] uppercase tracking-wider text-[11px]">
                      Product Gallery (`silver-aura-media`)
                    </h4>
                    <p className="text-[11px] text-[#78716C]">
                      Upload multiple photos (JPEG, PNG, WebP, AVIF · max 5 MB each). Choose one primary image for product cards.
                    </p>
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1C1917] text-white text-[11px] uppercase tracking-wider font-medium hover:bg-[#292524] shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleAddImages}
                      className="hidden"
                    />
                  </label>
                </div>

                {stagedImages.length === 0 ? (
                  <div className="p-6 border border-dashed border-[#D6CEC5] bg-[#FAF8F5] text-center text-[#78716C] space-y-1">
                    <ImageIcon className="w-6 h-6 text-[#A8A29E] mx-auto" />
                    <p>No images staged yet. Upload one or more product photographs above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {stagedImages.map((img, idx) => (
                      <div
                        key={img.tempId}
                        className={`border bg-[#FAF8F5] p-2 space-y-2 relative ${
                          img.isPrimary ? 'border-[#1C1917] ring-1 ring-[#1C1917]' : 'border-[#E8E0D5]'
                        }`}
                      >
                        <div className="aspect-square bg-white overflow-hidden border border-[#E8E0D5] relative">
                          <img
                            src={img.previewUrl}
                            alt={img.altText || formData.name}
                            className="w-full h-full object-cover"
                          />
                          {img.isPrimary && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#1C1917] text-white text-[9px] uppercase tracking-wider font-semibold">
                              Primary
                            </span>
                          )}
                          {img.file && (
                            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-emerald-800/90 text-white text-[9px] uppercase tracking-wider">
                              Pending Upload
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(img.tempId)}
                            disabled={img.isPrimary}
                            className={`px-2 py-1 text-[10px] uppercase tracking-wider font-medium border flex items-center gap-1 cursor-pointer ${
                              img.isPrimary
                                ? 'bg-[#1C1917] text-white border-[#1C1917]'
                                : 'bg-white text-[#57534E] border-[#D6CEC5] hover:border-[#1C1917]'
                            }`}
                          >
                            <Star className="w-2.5 h-2.5" />
                            <span>{img.isPrimary ? 'Primary' : 'Set Primary'}</span>
                          </button>

                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 text-[#57534E] hover:text-[#1C1917] disabled:opacity-30 cursor-pointer"
                              title="Move Left"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 1)}
                              disabled={idx === stagedImages.length - 1}
                              className="p-1 text-[#57534E] hover:text-[#1C1917] disabled:opacity-30 cursor-pointer"
                              title="Move Right"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#E8E0D5]">
                          <label className="text-[10px] text-[#1C1917] underline cursor-pointer hover:text-[#78716C]">
                            Replace
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              onChange={(e) => handleReplaceImage(img.tempId, e)}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img.tempId)}
                            className="text-[10px] text-rose-700 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Stock & Product Variants (Stage 1 Locking RPCs) */}
              <div className="space-y-4 pt-4 border-t border-[#E8E0D5]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-[#1C1917] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#78716C]" />
                      <span>Inventory & Product Variants</span>
                    </h4>
                    <p className="text-[11px] text-[#78716C]">
                      {stagedVariants.length > 0
                        ? `Variant mode active (${stagedVariants.length} variant${stagedVariants.length === 1 ? '' : 's'}). Total synchronized stock: ${computedModalStock} units.`
                        : 'Single-item mode. Add size or finish variants below if this creation is stocked per option.'}
                    </p>
                  </div>

                  <div className="px-3 py-1 bg-[#FAF8F5] border border-[#E8E0D5] text-[11px] font-semibold text-[#1C1917] tabular-nums">
                    Effective Stock: {computedModalStock} units
                  </div>
                </div>

                {/* Master Stock & Low Stock Threshold */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF8F5] p-3.5 border border-[#E8E0D5]">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                      Master Stock Quantity {stagedVariants.length > 0 ? '(Auto-synced from variants)' : '*'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      disabled={stagedVariants.length > 0}
                      value={stagedVariants.length > 0 ? computedModalStock : formData.masterStock}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          masterStock: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                        }))
                      }
                      className="w-full px-3 py-2 border border-[#E8E0D5] bg-white text-[#1C1917] focus:outline-none focus:border-[#1C1917] disabled:bg-stone-100 disabled:text-[#78716C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                      Low Stock Alert Threshold
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.lowStockThreshold}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lowStockThreshold: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                        }))
                      }
                      className="w-full px-3 py-2 border border-[#E8E0D5] bg-white text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                </div>

                {/* Existing / Staged Variants Table */}
                {stagedVariants.length > 0 && (
                  <div className="overflow-x-auto border border-[#E8E0D5]">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-[#FAF8F5] border-b border-[#E8E0D5] text-[#78716C] uppercase tracking-wider text-[10px]">
                          <th className="py-2 px-2.5">Size</th>
                          <th className="py-2 px-2.5">Finish / Color</th>
                          <th className="py-2 px-2.5">Variant SKU</th>
                          <th className="py-2 px-2.5">Price Override (PKR)</th>
                          <th className="py-2 px-2.5">Stock</th>
                          <th className="py-2 px-2.5">Active</th>
                          <th className="py-2 px-2.5 text-right">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F4EFEB]">
                        {stagedVariants.map((v) => (
                          <tr key={v.tempId} className="bg-white">
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                placeholder="e.g. 7"
                                value={v.sizeLabel}
                                onChange={(e) =>
                                  handleUpdateStagedVariant(v.tempId, {
                                    sizeLabel: e.target.value,
                                  })
                                }
                                className="w-24 px-2 py-1 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917]"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                placeholder="Rhodium"
                                value={v.colorLabel}
                                onChange={(e) =>
                                  handleUpdateStagedVariant(v.tempId, {
                                    colorLabel: e.target.value,
                                  })
                                }
                                className="w-28 px-2 py-1 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917]"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                placeholder="Optional SKU"
                                value={v.sku}
                                onChange={(e) =>
                                  handleUpdateStagedVariant(v.tempId, { sku: e.target.value })
                                }
                                className="w-28 px-2 py-1 border border-[#E8E0D5] bg-[#FAF8F5] font-mono text-[#1C1917]"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                min={1}
                                placeholder="Default"
                                value={v.price}
                                onChange={(e) =>
                                  handleUpdateStagedVariant(v.tempId, { price: e.target.value })
                                }
                                className="w-24 px-2 py-1 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917]"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                min={0}
                                value={v.stock}
                                onChange={(e) =>
                                  handleUpdateStagedVariant(v.tempId, {
                                    stock: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                  })
                                }
                                className="w-20 px-2 py-1 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917]"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="checkbox"
                                checked={v.isActive}
                                onChange={(e) =>
                                  handleUpdateStagedVariant(v.tempId, {
                                    isActive: e.target.checked,
                                  })
                                }
                                className="accent-[#1C1917]"
                              />
                            </td>
                            <td className="py-2 px-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveStagedVariant(v)}
                                className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
                                title="Remove Variant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add Variant Row Builder */}
                <div className="p-3 bg-[#FAF8F5] border border-dashed border-[#D6CEC5] space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#57534E] block">
                    Add Variant Option
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
                    <div>
                      <label className="text-[10px] text-[#78716C] block mb-0.5">Size Label</label>
                      <input
                        type="text"
                        placeholder="e.g. 6, 7, 18 in"
                        value={variantDraft.sizeLabel}
                        onChange={(e) =>
                          setVariantDraft((prev) => ({ ...prev, sizeLabel: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 border border-[#E8E0D5] bg-white text-[#1C1917]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#78716C] block mb-0.5">
                        Finish / Color
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rhodium"
                        value={variantDraft.colorLabel}
                        onChange={(e) =>
                          setVariantDraft((prev) => ({ ...prev, colorLabel: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 border border-[#E8E0D5] bg-white text-[#1C1917]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#78716C] block mb-0.5">Variant SKU</label>
                      <input
                        type="text"
                        placeholder="Optional"
                        value={variantDraft.sku}
                        onChange={(e) =>
                          setVariantDraft((prev) => ({ ...prev, sku: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 border border-[#E8E0D5] bg-white font-mono text-[#1C1917]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#78716C] block mb-0.5">
                        Price (Optional)
                      </label>
                      <input
                        type="number"
                        min={1}
                        placeholder="Default PKR"
                        value={variantDraft.price}
                        onChange={(e) =>
                          setVariantDraft((prev) => ({ ...prev, price: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 border border-[#E8E0D5] bg-white text-[#1C1917]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#78716C] block mb-0.5">Stock</label>
                      <input
                        type="number"
                        min={0}
                        value={variantDraft.stock}
                        onChange={(e) =>
                          setVariantDraft((prev) => ({
                            ...prev,
                            stock: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                          }))
                        }
                        className="w-full px-2.5 py-1.5 border border-[#E8E0D5] bg-white text-[#1C1917]"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleAddVariantDraft}
                        className="w-full py-1.5 px-3 bg-[#1C1917] text-white text-[11px] uppercase tracking-wider font-medium hover:bg-[#292524] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Add Option</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Storefront Flags */}
              <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[#E8E0D5]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="accent-[#1C1917]"
                  />
                  <span className="font-medium text-[#1C1917]">Active on Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))
                    }
                    className="accent-[#1C1917]"
                  />
                  <span className="font-medium text-[#1C1917]">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isBestSeller: e.target.checked }))
                    }
                    className="accent-[#1C1917]"
                  />
                  <span className="font-medium text-[#1C1917]">Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isNewArrival: e.target.checked }))
                    }
                    className="accent-[#1C1917]"
                  />
                  <span className="font-medium text-[#1C1917]">New Arrival</span>
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8E0D5]">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 border border-[#D6CEC5] text-[#57534E] hover:bg-[#F4EFEB] disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-[#1C1917] text-white uppercase tracking-wider font-semibold hover:bg-[#292524] disabled:opacity-60 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {saving
                      ? 'Saving Product...'
                      : editingProduct
                      ? 'Save Changes'
                      : 'Create Product'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif-luxury text-xl text-[#1C1917]">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Are you sure you want to permanently delete <strong>{deletingProduct.name}</strong>? Its images and variants will also be removed. If this product is linked to past customer orders, deactivate it instead.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                disabled={deleting}
                className="px-4 py-2 border border-[#D6CEC5] text-[#57534E] text-xs hover:bg-[#F4EFEB] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleConfirmDelete()}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 text-white text-xs uppercase tracking-wider font-semibold hover:bg-rose-800 disabled:opacity-60 cursor-pointer"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{deleting ? 'Deleting...' : 'Delete Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
