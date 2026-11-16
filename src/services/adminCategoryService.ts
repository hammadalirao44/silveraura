import { getSupabaseClient } from '../lib/supabase';
import type { CategoryItem } from '../types';
import { mapDbCategoryToItem, slugifyText } from './catalogService';
import {
  extractStoragePathFromUrl,
  removeMediaImages,
  uploadMediaImage,
} from './storageService';

export interface AdminCategoryInput {
  name: string;
  slug: string;
  tagline: string;
  imageUrl?: string;
  imageFile?: File | null;
  displayOrder: number;
  isActive: boolean;
}

const INITIAL_CATEGORY_SEED = [
  {
    name: 'Rings',
    slug: 'rings',
    tagline: 'Solitaires, Eternity Bands & Textured Signets',
    image_url: '',
    display_order: 1,
    is_active: true,
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    tagline: 'Chokers, Chains & Statement Collars',
    image_url: '',
    display_order: 2,
    is_active: true,
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    tagline: 'Huggies, Drops & Hypoallergenic Studs',
    image_url: '',
    display_order: 3,
    is_active: true,
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    tagline: 'Tennis Links, Bangles & Snake Chains',
    image_url: '',
    display_order: 4,
    is_active: true,
  },
  {
    name: 'Anklets',
    slug: 'anklets',
    tagline: 'Satellite Beads & Chime Charms',
    image_url: '',
    display_order: 5,
    is_active: true,
  },
  {
    name: 'Jewellery Sets',
    slug: 'jewellery-sets',
    tagline: 'Curated Bridal Suites & Everyday Duos',
    image_url: '',
    display_order: 6,
    is_active: true,
  },
];

export async function fetchAdminCategories(): Promise<CategoryItem[]> {
  const supabase = getSupabaseClient();

  const [catRes, prodRes] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, tagline, image_url, display_order, is_active, created_at, updated_at')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase.from('products').select('id, category_id'),
  ]);

  if (catRes.error) {
    throw new Error(`Failed to fetch categories: ${catRes.error.message}`);
  }
  if (prodRes.error) {
    throw new Error(`Failed to count category products: ${prodRes.error.message}`);
  }

  const countByCat = new Map<string, number>();
  for (const row of prodRes.data ?? []) {
    countByCat.set(row.category_id, (countByCat.get(row.category_id) ?? 0) + 1);
  }

  return (catRes.data ?? []).map((row) =>
    mapDbCategoryToItem(row, countByCat.get(row.id) ?? 0)
  );
}

export async function createAdminCategory(input: AdminCategoryInput): Promise<CategoryItem> {
  const supabase = getSupabaseClient();
  const cleanName = input.name.trim();
  const cleanSlug = slugifyText(input.slug || cleanName);

  if (!cleanName || !cleanSlug) {
    throw new Error('Category name and slug are required.');
  }

  let finalImageUrl = (input.imageUrl || '').trim();
  let uploadedPath: string | null = null;

  if (input.imageFile) {
    const uploaded = await uploadMediaImage('categories', cleanSlug, input.imageFile);
    finalImageUrl = uploaded.publicUrl;
    uploadedPath = uploaded.storagePath;
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: cleanName,
      slug: cleanSlug,
      tagline: input.tagline.trim(),
      image_url: finalImageUrl,
      display_order: Number.isFinite(input.displayOrder) ? input.displayOrder : 0,
      is_active: input.isActive,
    })
    .select()
    .single();

  if (error) {
    if (uploadedPath) {
      await removeMediaImages([uploadedPath]);
    }
    if (error.code === '23505') {
      throw new Error('A category with this name or slug already exists.');
    }
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return mapDbCategoryToItem(data, 0);
}

export async function updateAdminCategory(
  id: string,
  input: AdminCategoryInput,
  previousImageUrl?: string
): Promise<CategoryItem> {
  const supabase = getSupabaseClient();
  const cleanName = input.name.trim();
  const cleanSlug = slugifyText(input.slug || cleanName);

  if (!cleanName || !cleanSlug) {
    throw new Error('Category name and slug are required.');
  }

  let finalImageUrl = (input.imageUrl || '').trim();
  let newUploadedPath: string | null = null;

  if (input.imageFile) {
    const uploaded = await uploadMediaImage('categories', cleanSlug, input.imageFile);
    finalImageUrl = uploaded.publicUrl;
    newUploadedPath = uploaded.storagePath;
  }

  const { data, error } = await supabase
    .from('categories')
    .update({
      name: cleanName,
      slug: cleanSlug,
      tagline: input.tagline.trim(),
      image_url: finalImageUrl,
      display_order: Number.isFinite(input.displayOrder) ? input.displayOrder : 0,
      is_active: input.isActive,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (newUploadedPath) {
      await removeMediaImages([newUploadedPath]);
    }
    if (error.code === '23505') {
      throw new Error('Another category already uses this name or slug.');
    }
    throw new Error(`Failed to update category: ${error.message}`);
  }

  // Clean up previous Storage object if replaced or cleared
  if (previousImageUrl && previousImageUrl !== finalImageUrl) {
    const oldPath = extractStoragePathFromUrl(previousImageUrl);
    if (oldPath) {
      await removeMediaImages([oldPath]);
    }
  }

  return mapDbCategoryToItem(data, 0);
}

export async function toggleAdminCategoryStatus(
  id: string,
  nextIsActive: boolean
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('categories')
    .update({ is_active: nextIsActive })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update category status: ${error.message}`);
  }
}

export async function deleteAdminCategory(id: string, imageUrl?: string): Promise<void> {
  const supabase = getSupabaseClient();

  // Explicit check before delete to give admin a clear message
  const { count, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id);

  if (countError) {
    throw new Error(`Unable to verify category product associations: ${countError.message}`);
  }

  if ((count ?? 0) > 0) {
    throw new Error(
      `Cannot delete this category because ${count} product${count === 1 ? ' is' : 's are'} assigned to it. Reassign or remove those products first.`
    );
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    if (error.code === '23503') {
      throw new Error(
        'Cannot delete this category because products are still assigned to it.'
      );
    }
    throw new Error(`Failed to delete category: ${error.message}`);
  }

  const storagePath = imageUrl ? extractStoragePathFromUrl(imageUrl) : null;
  if (storagePath) {
    await removeMediaImages([storagePath]);
  }
}

export async function seedInitialCategories(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('categories')
    .upsert(INITIAL_CATEGORY_SEED, { onConflict: 'slug', ignoreDuplicates: true });

  if (error) {
    throw new Error(`Failed to seed initial categories: ${error.message}`);
  }
}
