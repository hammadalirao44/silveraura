import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { CategoryItem } from '../../types';

export const CategoriesSection: React.FC = () => {
  const {
    categories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    showAdminToast,
  } = useAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    image: '',
    active: true,
  });

  const [previewImage, setPreviewImage] = useState<string>('');

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      tagline: 'Pure 925 sterling silver artisan creations',
      image: '',
      active: true,
    });
    setPreviewImage('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      tagline: cat.tagline,
      image: cat.image,
      active: cat.active ?? true,
    });
    setPreviewImage(cat.image);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAdminToast('Image exceeds 2MB limit', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setPreviewImage(res);
        setFormData(prev => ({ ...prev, image: res }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showAdminToast('Please provide a category title', 'error');
      return;
    }

    const finalImage = previewImage.trim() || formData.image.trim() || '/src/assets/images/category_rings_1794482387362.jpg';

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        tagline: formData.tagline.trim(),
        image: finalImage,
        active: formData.active,
      });
    } else {
      addCategory({
        name: formData.name.trim(),
        tagline: formData.tagline.trim(),
        image: finalImage,
        active: formData.active,
      });
    }

    setIsModalOpen(false);
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
            Organize customer navigation, collection banners, and showcase taxonomy
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#292524] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.category === cat.name).length;
          const isActive = cat.active !== false;

          return (
            <div
              key={cat.id}
              className="bg-white border border-[#E8E0D5] overflow-hidden shadow-xs group flex flex-col justify-between"
            >
              {/* Category Image Cover */}
              <div className="relative aspect-[16/9] overflow-hidden bg-[#FAF8F5]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border ${
                      isActive
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 backdrop-blur-xs'
                        : 'bg-stone-900/80 text-stone-300 border-stone-600 backdrop-blur-xs'
                    }`}
                  >
                    {isActive ? 'Live' : 'Hidden'}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-serif-luxury text-xl font-normal drop-shadow-xs">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#D6CEC5] truncate drop-shadow-xs">
                    {cat.tagline}
                  </p>
                </div>
              </div>

              {/* Info & Stats */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span>Catalog Pieces:</span>
                  <span className="font-semibold text-[#1C1917]">{productCount} creations</span>
                </div>

                <div className="pt-2 border-t border-[#F4EFEB] flex items-center justify-between">
                  <button
                    onClick={() => toggleCategoryStatus(cat.id)}
                    className="text-xs text-[#57534E] hover:text-[#1C1917] underline uppercase tracking-wider"
                  >
                    {isActive ? 'Hide Category' : 'Activate Category'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F4EFEB] transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCatId(cat.id)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                      title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#78716C] font-semibold">
                  Taxonomy
                </span>
                <h3 className="font-serif-luxury text-xl text-[#1C1917]">
                  {editingCategory ? 'Edit Collection' : 'Create New Category'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#78716C] hover:text-[#1C1917] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Category Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Brooches"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px]">
                  Curator Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sculptural sterling silver statement pins"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="font-semibold text-[#1C1917] uppercase tracking-wider text-[10px] block">
                  Category Banner Image
                </label>
                <div className="flex items-center gap-3 p-3 border border-dashed border-[#D6CEC5] bg-[#FAF8F5]">
                  <div className="w-16 h-16 bg-white border border-[#E8E0D5] flex items-center justify-center overflow-hidden shrink-0">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#A8A29E]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer px-3 py-1 bg-[#1C1917] text-white text-[11px] uppercase tracking-wider font-medium hover:bg-[#292524] inline-flex items-center gap-1.5">
                      <Upload className="w-3 h-3" />
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <input
                      type="url"
                      placeholder="Or enter image URL"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setPreviewImage(e.target.value);
                      }}
                      className="w-full px-2 py-1 border border-[#E8E0D5] bg-white text-[11px] text-[#1C1917]"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="accent-[#1C1917]"
                />
                <span className="font-medium text-[#1C1917]">Display in navigation bar & category filters</span>
              </label>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8E0D5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D6CEC5] text-[#57534E] hover:bg-[#F4EFEB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1C1917] text-white uppercase tracking-wider font-semibold hover:bg-[#292524]"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCatId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D5] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif-luxury text-xl text-[#1C1917]">Delete Category</h3>
            </div>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Are you sure you want to delete this category? Associated products will remain in your master inventory.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingCatId(null)}
                className="px-4 py-2 border border-[#D6CEC5] text-[#57534E] text-xs hover:bg-[#F4EFEB]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCategory(deletingCatId);
                  setDeletingCatId(null);
                }}
                className="px-4 py-2 bg-rose-700 text-white text-xs uppercase tracking-wider font-semibold hover:bg-rose-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
