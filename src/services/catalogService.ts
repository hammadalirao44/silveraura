import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  CategoryItem,
  Product,
  ProductImageItem,
  ProductVariantItem,
} from '../types';
import type { Database } from '../types/database';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductImageRow = Database['public']['Tables']['product_images']['Row'];
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row'];
type InventoryRow = Database['public']['Tables']['inventory']['Row'];

export interface ProductQueryRow extends ProductRow {
  categories: Pick<CategoryRow, 'id' | 'name' | 'slug' | 'is_active'> | null;
  product_images: ProductImageRow[] | null;
  product_variants: ProductVariantRow[] | null;
  inventory: InventoryRow | InventoryRow[] | null;
}

export function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatVariantLabel(
  sizeLabel: string | null | undefined,
  colorLabel: string | null | undefined
): string {
  return [sizeLabel?.trim(), colorLabel?.trim()].filter(Boolean).join(' / ');
}

export function mapDbCategoryToItem(row: CategoryRow, productCount = 0): CategoryItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    image: row.image_url,
    count: productCount,
    active: row.is_active,
    displayOrder: row.display_order,
  };
}

export function mapDbProductToProduct(row: ProductQueryRow): Product {
  const sortedImageRows = [...(row.product_images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });

  const productImages: ProductImageItem[] = sortedImageRows.map((img) => ({
    id: img.id,
    productId: img.product_id,
    imageUrl: img.image_url,
    storagePath: img.storage_path,
    altText: img.alt_text,
    isPrimary: img.is_primary,
    sortOrder: img.sort_order,
  }));

  const sortedVariantRows = [...(row.product_variants ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const productVariants: ProductVariantItem[] = sortedVariantRows.map((v) => ({
    id: v.id,
    productId: v.product_id,
    sku: v.sku,
    sizeLabel: v.size_label,
    colorLabel: v.color_label,
    price: v.price,
    stock: v.stock,
    isActive: v.is_active,
    sortOrder: v.sort_order,
  }));

  const invRow = Array.isArray(row.inventory) ? row.inventory[0] ?? null : row.inventory;
  const activeVariants = productVariants.filter((v) => v.isActive);

  const effectiveStock = row.has_variants
    ? activeVariants.reduce((sum, v) => sum + v.stock, 0)
    : invRow?.stock_quantity ?? 0;

  const sellingPrice = row.sale_price ?? row.price;
  let comparePrice: number | undefined;
  if (row.sale_price !== null && row.sale_price < row.price) {
    comparePrice = row.price;
  } else if (row.original_price !== null && row.original_price > sellingPrice) {
    comparePrice = row.original_price;
  }

  const variantLabels = activeVariants
    .map((v) => formatVariantLabel(v.sizeLabel, v.colorLabel))
    .filter(Boolean);

  const sizeList = Array.from(
    new Set(
      activeVariants
        .map((v) => v.sizeLabel?.trim())
        .filter((s): s is string => Boolean(s))
    )
  );

  const colorList = Array.from(
    new Set(
      activeVariants
        .map((v) => v.colorLabel?.trim())
        .filter((c): c is string => Boolean(c))
    )
  );

  return {
    id: row.id,
    slug: row.slug,
    categoryId: row.category_id,
    name: row.name,
    category: row.categories?.name ?? 'Uncategorized',
    price: sellingPrice,
    basePrice: row.price,
    originalPrice: comparePrice,
    salePrice: row.sale_price,
    sku: row.sku ?? undefined,
    images: productImages.map((img) => img.imageUrl),
    productImages,
    productVariants,
    hasVariants: row.has_variants,
    description: row.description,
    silverPurity: row.silver_purity,
    plating: row.plating ?? undefined,
    stone: row.stone ?? undefined,
    weight: row.weight,
    hallmark: row.hallmark,
    sizes: variantLabels.length > 0 ? variantLabels : undefined,
    inStock: effectiveStock > 0,
    stockCount: effectiveStock,
    lowStockThreshold: invRow?.low_stock_threshold ?? 5,
    status: row.is_active ? 'active' : 'inactive',
    isFeatured: row.is_featured,
    isBestSeller: row.is_best_seller,
    isNewArrival: row.is_new_arrival,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    careNotes: row.care_notes ?? [],
    createdAt: row.created_at,
    variants:
      sizeList.length > 0 || colorList.length > 0
        ? {
            sizes: sizeList.length > 0 ? sizeList : undefined,
            colors: colorList.length > 0 ? colorList : undefined,
          }
        : undefined,
  };
}

export async function fetchStorefrontCatalog(): Promise<{
  categories: CategoryItem[];
  products: Product[];
}> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY) are required to load the catalog.'
    );
  }

  const [catRes, prodRes] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, tagline, image_url, display_order, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('products')
      .select(
        `
        id, category_id, name, slug, sku, price, original_price, sale_price,
        description, silver_purity, plating, stone, weight, hallmark, care_notes,
        has_variants, is_active, is_featured, is_best_seller, is_new_arrival,
        rating, review_count, created_at, updated_at,
        categories!inner(id, name, slug, is_active),
        product_images(id, product_id, image_url, storage_path, alt_text, is_primary, sort_order, created_at),
        product_variants(id, product_id, sku, size_label, color_label, price, stock, is_active, sort_order, created_at, updated_at),
        inventory(id, product_id, stock_quantity, low_stock_threshold, updated_at)
      `
      )
      .eq('is_active', true)
      .eq('categories.is_active', true)
      .order('created_at', { ascending: false }),
  ]);

  if (catRes.error) {
    throw new Error(`Failed to fetch storefront categories: ${catRes.error.message}`);
  }
  if (prodRes.error) {
    throw new Error(`Failed to fetch storefront products: ${prodRes.error.message}`);
  }

  const rawProducts = (prodRes.data ?? []) as unknown as ProductQueryRow[];
  const products = rawProducts.map((row) => {
    const mapped = mapDbProductToProduct(row);
    // Keep only active variants for public storefront browsing
    const activeVariants = (mapped.productVariants ?? []).filter((v) => v.isActive);
    return {
      ...mapped,
      productVariants: activeVariants,
    };
  });

  const countByCatId = new Map<string, number>();
  for (const prod of products) {
    if (prod.categoryId) {
      countByCatId.set(prod.categoryId, (countByCatId.get(prod.categoryId) ?? 0) + 1);
    }
  }

  const categories = (catRes.data ?? []).map((cat) =>
    mapDbCategoryToItem(cat, countByCatId.get(cat.id) ?? 0)
  );

  return { categories, products };
}
