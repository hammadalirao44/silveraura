import { getSupabaseClient } from '../lib/supabase';

export const MEDIA_BUCKET = 'silver-aura-media';
export const MAX_MEDIA_BYTES = 5 * 1024 * 1024; // 5 MB (matches Stage 1 bucket limit)
export const ALLOWED_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export type MediaFolder = 'products' | 'categories' | 'banners' | 'site';

export function validateMediaFile(file: File): string | null {
  if (!ALLOWED_MEDIA_MIME_TYPES.includes(file.type as (typeof ALLOWED_MEDIA_MIME_TYPES)[number])) {
    return `Unsupported file type "${file.type || 'unknown'}". Allowed formats: JPEG, PNG, WebP, AVIF.`;
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(2)} MB, exceeding the 5 MB limit.`;
  }
  if (file.size === 0) {
    return `"${file.name}" is empty.`;
  }
  return null;
}

export function extractStoragePathFromUrl(publicUrl: string): string | null {
  if (!publicUrl) return null;
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marker.length).split('?')[0]);
}

function sanitizeSegment(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'asset';
}

export async function uploadMediaImage(
  folder: MediaFolder,
  entityKey: string,
  file: File
): Promise<{ publicUrl: string; storagePath: string }> {
  const validationError = validateMediaFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = getSupabaseClient();
  const safeEntity = sanitizeSegment(entityKey);
  const dotIdx = file.name.lastIndexOf('.');
  const rawBase = dotIdx > 0 ? file.name.slice(0, dotIdx) : file.name;
  const rawExt = dotIdx > 0 ? file.name.slice(dotIdx + 1).toLowerCase() : 'jpg';
  const safeBase = sanitizeSegment(rawBase).slice(0, 48);
  const ext = ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(rawExt) ? rawExt : 'jpg';
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Must start with 'products' | 'categories' | 'banners' | 'site' to satisfy Storage RLS
  const storagePath = `${folder}/${safeEntity}/${uniqueSuffix}-${safeBase}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
  if (!data?.publicUrl) {
    throw new Error('Uploaded image public URL could not be resolved.');
  }

  return {
    publicUrl: data.publicUrl,
    storagePath,
  };
}

export async function removeMediaImages(paths: Array<string | null | undefined>): Promise<void> {
  const cleanPaths = Array.from(
    new Set(paths.map((p) => (p || '').trim()).filter((p) => p.length > 0))
  );
  if (cleanPaths.length === 0) return;

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(cleanPaths);
  if (error) {
    console.warn('Could not remove old storage media object(s):', error.message);
  }
}
