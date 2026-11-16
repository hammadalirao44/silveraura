import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { CategoryItem } from '../../types';
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  toggleAdminCategoryStatus,
  deleteAdminCategory,
  seedInitialCategories,
} from '../../services/adminCategoryService';
import { slugifyText } from '../../services/catalogService';
import { validateMediaFile } from '../../services/storageService';

export const CategoriesSection: React.FC = () => {
  const { isSupabaseReady, supabaseError, showAdminToast, refreshDashboard } = useAdmin();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState<boolean>(false);

  // Add/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    imageUrl: '',
    displayOrder: 0,
    isActive: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const objectUrlRef = useRef<string | null>(null);

  // Delete modal state
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const revokePreviewObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => revokePreviewObjectUrl();
  }, []);

  const loadCategories = useCallback(async () => {
    if (!isSupabaseReady) {
      setLoading(false);
      setLoadError(
        supabaseError ||
          'Supabase environment variables are not configured. Category management requires a connected Supabase project.'
      );
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to load categories.';
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [isSupabaseReady, supabaseError]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const broadcastCatalogChange = useCallback(async () => {
    window.dispatchEvent(new CustomEvent('silver_aura_catalog_updated'));
    await refreshDashboard();
  }, [refreshDashboard]);

  const openAddModal = () => {
    revokePreviewObjectUrl();
    setEditingCategory(null);
    setSlugManuallyEdited(false);
    setSelectedFile(null);
    const nextOrder =
      categories.length > 0
        ? Math.max(...categories.map((c) => c.displayOrder ?? 0)) + 1
        : 1;
    setFormData({
      name: '',
      slug: '',
      tagline: '',
      imageUrl: '',
      displayOrder: nextOrder,
      isActive: true,
    });
    setPreviewUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    revokePreviewObjectUrl();
    setEditingCategory(cat);
    setSlugManuallyEdited(true);
    setSelectedFile(null);
    setFormData({
      name: cat.name,
      slug: cat.slug || slugifyText(cat.name),
      tagline: cat.tagline,
      imageUrl: cat.image || '',
      displayOrder: cat.displayOrder ?? 0,
      isActive: cat.active,
    });
    setPreviewUrl(cat.image || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    revokePreviewObjectUrl();
    setSelectedFile(null);
    setIsModalOpen(false);
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: !slugManuallyEdited ? slugifyText(value) : prev.slug,
    }));
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validationError = validateMediaFile(file);
    if (validationError) {
      showAdminToast(validationError, 'error');
      return;
    }

    revokePreviewObjectUrl();
    const localUrl = URL.createObjectURL(file);
    objectUrlRef.current = localUrl;
    setSelectedFile(file);
    setPreviewUrl(localUrl);
  };

  const handleClearImage = () => {
    revokePreviewObjectUrl();
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const cleanSlug = slugifyText(formData.slug || cleanName);

    if (!cleanName) {
      showAdminToast('Please provide a category name.', 'error');
      return;
    }
    if (!cleanSlug) {
      showAdminToast('Please provide a valid URL slug.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await updateAdminCategory(
          editingCategory.id,
          {
            name: cleanName,
            slug: cleanSlug,
            tagline: formData.tagline.trim(),
            imageUrl: formData.imageUrl.trim(),
            imageFile: selectedFile,
            displayOrder: Number(formData.displayOrder) || 0,
            isActive: formData.isActive,
          },
          editingCategory.image
        );
        showAdminToast(`Updated "${cleanName}" category`);
      } else {
        await createAdminCategory({
          name: cleanName,
          slug: cleanSlug,
          tagline: formData.tagline.trim(),
          imageUrl: formData.imageUrl.trim(),
          imageFile: selectedFile,
          displayOrder: Number(formData.displayOrder) || 0,
          isActive: formData.isActive,
        });
        showAdminToast(`Created "${cleanName}" category`);
      }

      revokePreviewObjectUrl();
      setSelectedFile(null);
      setIsModalOpen(false);
      await loadCategories();
      await broadcastCatalogChange();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to save category.';
      showAdminToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cat: CategoryItem) => {
    setBusyId(cat.id);
    try {
      const nextActive = !cat.active;
      await toggleAdminCategoryStatus(cat.id, nextActive);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, active: nextActive } : c))
      );
      showAdminToast(
        `${cat.name} is now ${nextActive ? 'visible on storefront' : 'hidden from storefront'}`
      );
      await broadcastCatalogChange();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update category visibility.';
      showAdminToast(msg, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      await deleteAdminCategory(deletingCategory.id, deletingCategory.image);
      showAdminToast(`Deleted "${deletingCategory.name}" category`);
      setDeletingCategory(null);
      await loadCategories();
      await broadcastCatalogChange();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to delete category.';
      showAdminToast(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      await seedInitialCategories();
      showAdminToast('Seeded 6 core Silver Aura categories');
      await loadCategories();
      await broadcastCatalogChange();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to seed initial categories.';
      showAdminToast(msg, 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#78716C] font-semibold block">
            Storefront Taxonomy
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1917] font-normal">
            Category Management
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            {categories.length} collection{categories.length === 1 ? '' : 's'} ({categories.filter((c) => c.active).length} active on storefront)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void loadCategories()}
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
            <span>Add Category</span>
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
            onClick={() => void loadCategories()}
            className="px-3 py-1.5 bg-rose-900 text-white uppercase tracking-wider text-[11px] font-medium hover:bg-rose-800 shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E8E0D5] overflow-hidden shadow-xs animate-pulse"
            >
              <div className="aspect-[16/9] bg-[#F4EFEB]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-[#F4EFEB] w-1/2" />
                <div className="h-3 bg-[#F4EFEB] w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !loadError && categories.length === 0 && (
        <div className="bg-white border border-[#E8E0D5] p-10 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E8E0D5] flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5 text-[#78716C]" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif-luxury text-2xl text-[#1C1917]">
              No categories in your database yet
            </h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Create your first collection or seed the 6 core Silver Aura categories (Rings, Necklaces, Earrings, Bracelets, Anklets, Jewellery Sets).
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => void handleSeedDefaults()}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {seeding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{seeding ? 'Seeding...' : 'Seed 6 Initial Categories'}</span>
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#1C1917] text-[#1C1917] text-xs uppercase tracking-wider font-medium hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Category</span>
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const isActive = cat.active;
            const isBusy = busyId === cat.id;

            return (
              <div
                key={cat.id}
                className="bg-white border border-[#E8E0D5] overflow-hidden shadow-xs group flex flex-col justify-between"
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-[#F4EFEB]">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F4EFEB] to-[#E8E0D5] text-[#78716C] p-4">
                      <ImageIcon className="w-7 h-7 mb-1.5 text-[#A8A29E]" />
                      <span className="text-[11px] uppercase tracking-widest text-[#78716C]">
                        No Cover Image
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border ${
                        isActive
                          ? 'bg-emerald-950/85 text-emerald-200 border-emerald-500/40 backdrop-blur-xs'
                          : 'bg-stone-900/85 text-stone-300 border-stone-600 backdrop-blur-xs'
                      }`}
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </span>

                    <span className="px-2 py-0.5 text-[10px] font-mono bg-black/55 text-white/90 border border-white/15 backdrop-blur-xs">
                      Order #{cat.displayOrder ?? 0}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-serif-luxury text-xl font-normal drop-shadow-xs truncate">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-[#E8E0D5] truncate drop-shadow-xs">
                      {cat.tagline || '925 Sterling Silver Collection'}
                    </p>
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#78716C]">
                    <span className="font-mono text-[11px] truncate max-w-[150px]" title={cat.slug}>
                      /{cat.slug || slugifyText(cat.name)}
                    </span>
                    <span className="font-semibold text-[#1C1917]">
                      {cat.count} {cat.count === 1 ? 'product' : 'products'}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-[#F4EFEB] flex items-center justify-between">
                    <button
                      onClick={() => void handleToggleStatus(cat)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 text-xs text-[#57534E] hover:text-[#1C1917] uppercase tracking-wider font-medium disabled:opacity-50 cursor-pointer"
                    >
                      {isActive ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(cat)}
                        disabled={isBusy}
                        className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F4EFEB] transition-colors cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        disabled={isBusy}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                        title={
                          cat.count > 0
                            ? 'Reassign or delete assigned products first'
                            : 'Delete Category'
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E0D5] max-w-lg w-full p-6 shadow-2xl relative space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#78716C] font-semibold">
                  Collection Taxonomy
                </span>
                <h3 className="font-serif-luxury text-xl text-[#1C1917]">
                  {editingCategory ? `Edit "${editingCategory.name}"` : 'Create New Category'}
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vintage Brooches"
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
                    placeholder="e.g. vintage-brooches"
                    value={formData.slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setFormData((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] font-mono focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sculptural sterling silver pins"
                    value={formData.tagline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        displayOrder: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              {/* Image Upload to silver-aura-media/categories */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                    Category Image (JPEG, PNG, WebP, AVIF · max 5 MB)
                  </label>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="text-[11px] text-rose-700 hover:underline cursor-pointer"
                    >
                      Remove image
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 border border-dashed border-[#D6CEC5] bg-[#FAF8F5]">
                  <div className="w-20 h-20 bg-white border border-[#E8E0D5] flex items-center justify-center overflow-hidden shrink-0">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Category preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#A8A29E]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-[#1C1917] text-white text-[11px] uppercase tracking-wider font-medium hover:bg-[#292524] inline-flex items-center gap-1.5">
                        <Upload className="w-3 h-3" />
                        <span>{previewUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={handleImageFileSelect}
                          className="hidden"
                        />
                      </label>
                      {selectedFile && (
                        <span className="text-[11px] text-emerald-700 truncate max-w-[180px]">
                          Ready: {selectedFile.name}
                        </span>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="Or paste external image URL"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        revokePreviewObjectUrl();
                        setSelectedFile(null);
                        setFormData((prev) => ({ ...prev, imageUrl: e.target.value }));
                        setPreviewUrl(e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 border border-[#E8E0D5] bg-white text-[11px] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="accent-[#1C1917]"
                />
                <span className="font-medium text-[#1C1917]">
                  Active (visible in storefront navigation, filters & category showcase)
                </span>
              </label>

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
                      ? 'Saving...'
                      : editingCategory
                      ? 'Save Changes'
                      : 'Create Category'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif-luxury text-xl text-[#1C1917]">Delete Category</h3>
            </div>

            {deletingCategory.count > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
                <p className="font-semibold">
                  "{deletingCategory.name}" currently has {deletingCategory.count} assigned product
                  {deletingCategory.count === 1 ? '' : 's'}.
                </p>
                <p>
                  To preserve catalog integrity, please reassign or remove those products first, or deactivate this category to hide it from the storefront.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#57534E] leading-relaxed">
                Are you sure you want to permanently delete <strong>{deletingCategory.name}</strong>? Any uploaded category cover in Storage will also be removed.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingCategory(null)}
                disabled={deleting}
                className="px-4 py-2 border border-[#D6CEC5] text-[#57534E] text-xs hover:bg-[#F4EFEB] cursor-pointer"
              >
                Cancel
              </button>
              {deletingCategory.count === 0 && (
                <button
                  onClick={() => void handleConfirmDelete()}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 text-white text-xs uppercase tracking-wider font-semibold hover:bg-rose-800 disabled:opacity-60 cursor-pointer"
                >
                  {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{deleting ? 'Deleting...' : 'Delete Category'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
