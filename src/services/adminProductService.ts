import { getSupabaseClient } from '../lib/supabase';
import type { Product, ProductImageItem, ProductVariantItem } from '../types';
import { mapDbProductToProduct, ProductQueryRow, slugifyText } from './catalogService';
import {
  extractStoragePathFromUrl,
  removeMediaImages,
  uploadMediaImage,
} from './storageService';

export interface AdminProductPayload {
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  originalPrice: number | null;
  salePrice: number | null;
  description: string;
  silverPurity: string;
  plating: string;
  stone: string;
  weight: string;
  hallmark: string;
  careNotes: string[];
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
}

export interface StagedProductImage {
  tempId: string;
  existingId?: string;
  existingStoragePath?: string | null;
  previewUrl: string;
  file?: File;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface AdminVariantInput {
  productId: string;
  sizeLabel?: string | null;
  colorLabel?: string | null;
  sku?: string | null;
  price?: number | null;
  stock: number;
  isActive: boolean;
  sortOrder?: number;
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id, category_id, name, slug, sku, price, original_price, sale_price,
      description, silver_purity, plating, stone, weight, hallmark, care_notes,
      has_variants, is_active, is_featured, is_best_seller, is_new_arrival,
      rating, review_count, created_at, updated_at,
      categories(id, name, slug, is_active),
      product_images(id, product_id, image_url, storage_path, alt_text, is_primary, sort_order, created_at),
      product_variants(id, product_id, sku, size_label, color_label, price, stock, is_active, sort_order, created_at, updated_at),
      inventory(id, product_id, stock_quantity, low_stock_threshold, updated_at)
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return ((data ?? []) as unknown as ProductQueryRow[]).map(mapDbProductToProduct);
}

export async function createAdminProduct(payload: AdminProductPayload): Promise<string> {
  const supabase = getSupabaseClient();
  const cleanSlug = slugifyText(payload.slug || payload.name);

  const { data, error } = await supabase
    .from('products')
    .insert({
      category_id: payload.categoryId,
      name: payload.name.trim(),
      slug: cleanSlug,
      sku: payload.sku.trim() ? payload.sku.trim() : null,
      price: payload.price,
      original_price: payload.originalPrice,
      sale_price: payload.salePrice,
      description: payload.description.trim(),
      silver_purity: payload.silverPurity.trim() || 'Solid 925 Sterling Silver',
      plating: payload.plating.trim() || null,
      stone: payload.stone.trim() || null,
      weight: payload.weight.trim(),
      hallmark: payload.hallmark.trim() || '925 Laser Inscription',
      care_notes: payload.careNotes,
      is_active: payload.isActive,
      is_featured: payload.isFeatured,
      is_best_seller: payload.isBestSeller,
      is_new_arrival: payload.isNewArrival,
    })
    .select('id')
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      throw new Error('A product with this slug or SKU already exists.');
    }
    throw new Error(`Failed to create product: ${error?.message || 'Unknown error'}`);
  }

  return data.id;
}

export async function updateAdminProduct(
  productId: string,
  payload: AdminProductPayload
): Promise<void> {
  const supabase = getSupabaseClient();
  const cleanSlug = slugifyText(payload.slug || payload.name);

  // Note: has_variants is intentionally omitted (managed by DB triggers)
  const { error } = await supabase
    .from('products')
    .update({
      category_id: payload.categoryId,
      name: payload.name.trim(),
      slug: cleanSlug,
      sku: payload.sku.trim() ? payload.sku.trim() : null,
      price: payload.price,
      original_price: payload.originalPrice,
      sale_price: payload.salePrice,
      description: payload.description.trim(),
      silver_purity: payload.silverPurity.trim() || 'Solid 925 Sterling Silver',
      plating: payload.plating.trim() || null,
      stone: payload.stone.trim() || null,
      weight: payload.weight.trim(),
      hallmark: payload.hallmark.trim() || '925 Laser Inscription',
      care_notes: payload.careNotes,
      is_active: payload.isActive,
      is_featured: payload.isFeatured,
      is_best_seller: payload.isBestSeller,
      is_new_arrival: payload.isNewArrival,
    })
    .eq('id', productId);

  if (error) {
    if (error.code === '23505') {
      throw new Error('Another product already uses this slug or SKU.');
    }
    throw new Error(`Failed to update product: ${error.message}`);
  }
}

export async function toggleAdminProductField(
  productId: string,
  field: 'is_active' | 'is_featured' | 'is_best_seller',
  value: boolean
): Promise<void> {
  const supabase = getSupabaseClient();
  const updatePayload =
    field === 'is_active'
      ? { is_active: value }
      : field === 'is_featured'
      ? { is_featured: value }
      : { is_best_seller: value };

  const { error } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', productId);

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }
}

export async function deleteAdminProduct(
  productId: string,
  images: ProductImageItem[] = []
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('products').delete().eq('id', productId);

  if (error) {
    if (error.code === '23503') {
      throw new Error(
        'This product is linked to existing orders and cannot be deleted. Deactivate it instead.'
      );
    }
    throw new Error(`Failed to delete product: ${error.message}`);
  }

  const paths = images
    .map((img) => img.storagePath || extractStoragePathFromUrl(img.imageUrl))
    .filter((p): p is string => Boolean(p));

  await removeMediaImages(paths);
}

/**
 * Synchronizes staged gallery changes (additions, replacements, deletions,
 * primary selection, and sort order) with Supabase Storage and `product_images`.
 * Respects `idx_product_images_single_primary` by clearing existing primary before
 * assigning the new primary image.
 */
export async function syncProductImages(
  productId: string,
  productName: string,
  desiredImages: StagedProductImage[],
  originalImages: ProductImageItem[]
): Promise<void> {
  const supabase = getSupabaseClient();

  // Normalize sort order and guarantee exactly 1 primary when >= 1 image exists
  const normalized = desiredImages.map((img, idx) => ({
    ...img,
    sortOrder: idx,
  }));
  if (normalized.length > 0 && !normalized.some((img) => img.isPrimary)) {
    normalized[0].isPrimary = true;
  }

  const keptExistingIds = new Set(
    normalized.map((img) => img.existingId).filter((id): id is string => Boolean(id))
  );

  // 1. Delete removed DB rows first (frees primary constraint slot if deleted was primary)
  const removedOriginals = originalImages.filter((orig) => !keptExistingIds.has(orig.id));
  if (removedOriginals.length > 0) {
    const removeIds = removedOriginals.map((r) => r.id);
    const { error: delError } = await supabase
      .from('product_images')
      .delete()
      .in('id', removeIds);
    if (delError) {
      throw new Error(`Failed to delete removed images: ${delError.message}`);
    }

    const storageToDelete = removedOriginals.map(
      (r) => r.storagePath || extractStoragePathFromUrl(r.imageUrl)
    );
    await removeMediaImages(storageToDelete);
  }

  // 2. Unset is_primary on all remaining existing rows for this product before reassigning
  const { error: clearPrimaryErr } = await supabase
    .from('product_images')
    .update({ is_primary: false })
    .eq('product_id', productId)
    .eq('is_primary', true);

  if (clearPrimaryErr) {
    throw new Error(`Failed to reset primary image flag: ${clearPrimaryErr.message}`);
  }

  // 3. Process kept existing rows (including file replacements) and new uploads
  for (const item of normalized) {
    if (item.existingId) {
      let nextUrl = item.previewUrl;
      let nextStoragePath = item.existingStoragePath ?? null;
      let oldPathToDelete: string | null = null;

      if (item.file) {
        const uploaded = await uploadMediaImage('products', productId, item.file);
        oldPathToDelete =
          item.existingStoragePath || extractStoragePathFromUrl(item.previewUrl);
        nextUrl = uploaded.publicUrl;
        nextStoragePath = uploaded.storagePath;
      }

      const { error: updErr } = await supabase
        .from('product_images')
        .update({
          image_url: nextUrl,
          storage_path: nextStoragePath,
          alt_text: item.altText.trim() || productName,
          is_primary: item.isPrimary,
          sort_order: item.sortOrder,
        })
        .eq('id', item.existingId);

      if (updErr) {
        if (item.file && nextStoragePath) {
          await removeMediaImages([nextStoragePath]);
        }
        throw new Error(`Failed to update product image: ${updErr.message}`);
      }

      if (oldPathToDelete) {
        await removeMediaImages([oldPathToDelete]);
      }
    } else if (item.file) {
      const uploaded = await uploadMediaImage('products', productId, item.file);

      const { error: insErr } = await supabase.from('product_images').insert({
        product_id: productId,
        image_url: uploaded.publicUrl,
        storage_path: uploaded.storagePath,
        alt_text: item.altText.trim() || productName,
        is_primary: item.isPrimary,
        sort_order: item.sortOrder,
      });

      if (insErr) {
        await removeMediaImages([uploaded.storagePath]);
        throw new Error(`Failed to save uploaded image record: ${insErr.message}`);
      }
    }
  }
}

// ----------------------------------------------------------------------------
// Strict RPC-Only Inventory & Variant Mutations (Stage 1 Lock Hierarchy)
// ----------------------------------------------------------------------------

export async function setMasterInventoryRpc(
  productId: string,
  stockQuantity: number | null,
  lowStockThreshold: number | null
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('admin_set_product_inventory', {
    p_product_id: productId,
    p_stock_quantity: stockQuantity,
    p_low_stock_threshold: lowStockThreshold,
  });

  if (error) {
    throw new Error(`Failed to update inventory: ${error.message}`);
  }
}

export async function createVariantRpc(input: AdminVariantInput): Promise<ProductVariantItem> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('admin_create_product_variant', {
    p_product_id: input.productId,
    p_size_label: input.sizeLabel?.trim() || null,
    p_color_label: input.colorLabel?.trim() || null,
    p_sku: input.sku?.trim() || null,
    p_price: input.price ?? null,
    p_stock: input.stock,
    p_is_active: input.isActive,
    p_sort_order: input.sortOrder ?? 0,
  });

  if (error || !data) {
    if (error?.code === '23505') {
      throw new Error('A variant with this option combination or SKU already exists.');
    }
    throw new Error(`Failed to create variant: ${error?.message || 'Unknown error'}`);
  }

  return {
    id: data.id,
    productId: data.product_id,
    sku: data.sku,
    sizeLabel: data.size_label,
    colorLabel: data.color_label,
    price: data.price,
    stock: data.stock,
    isActive: data.is_active,
    sortOrder: data.sort_order,
  };
}

export async function updateVariantRpc(
  variantId: string,
  input: Omit<AdminVariantInput, 'productId'>
): Promise<ProductVariantItem> {
  const supabase = getSupabaseClient();
  const cleanSize = input.sizeLabel?.trim() || null;
  const cleanColor = input.colorLabel?.trim() || null;
  const cleanSku = input.sku?.trim() || null;

  const { data, error } = await supabase.rpc('admin_update_product_variant', {
    p_variant_id: variantId,
    p_size_label: cleanSize,
    p_clear_size_label: cleanSize === null,
    p_color_label: cleanColor,
    p_clear_color_label: cleanColor === null,
    p_sku: cleanSku,
    p_clear_sku: cleanSku === null,
    p_price: input.price ?? null,
    p_clear_price: input.price === null || input.price === undefined,
    p_stock: input.stock,
    p_is_active: input.isActive,
    p_sort_order: input.sortOrder ?? 0,
  });

  if (error || !data) {
    if (error?.code === '23505') {
      throw new Error('Another variant on this product uses that option or SKU.');
    }
    throw new Error(`Failed to update variant: ${error?.message || 'Unknown error'}`);
  }

  return {
    id: data.id,
    productId: data.product_id,
    sku: data.sku,
    sizeLabel: data.size_label,
    colorLabel: data.color_label,
    price: data.price,
    stock: data.stock,
    isActive: data.is_active,
    sortOrder: data.sort_order,
  };
}

export async function deleteVariantRpc(variantId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('admin_delete_product_variant', {
    p_variant_id: variantId,
  });

  if (error) {
    throw new Error(`Failed to delete variant: ${error.message}`);
  }
}
