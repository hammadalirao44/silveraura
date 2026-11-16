-- ============================================================================
-- Silver Aura — Stage 1 Migration 004: Storage Bucket & Media Folder Policies
-- ============================================================================
-- Notes:
--   * Idempotent (ON CONFLICT DO UPDATE + DROP POLICY IF EXISTS + CREATE POLICY).
--   * Must be executed after 002_security_and_checkout_functions.sql (uses public.is_admin()).
--   * Matches src/services/storageService.ts:
--       Bucket: silver-aura-media (public read)
--       Max Size: 5 MB (5242880 bytes)
--       Allowed MIME types: image/jpeg, image/png, image/webp, image/avif
--       Allowed top-level folders: products, categories, banners, site
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create or Update the Public Media Bucket
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'silver-aura-media',
  'silver-aura-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- 2. Storage Object RLS Policies (RLS is enabled by default on storage.objects)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS silver_aura_media_select ON storage.objects;
CREATE POLICY silver_aura_media_select
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'silver-aura-media');

DROP POLICY IF EXISTS silver_aura_media_insert ON storage.objects;
CREATE POLICY silver_aura_media_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'silver-aura-media'
    AND public.is_admin()
    AND (storage.foldername(name))[1] IN ('products', 'categories', 'banners', 'site')
  );

DROP POLICY IF EXISTS silver_aura_media_update ON storage.objects;
CREATE POLICY silver_aura_media_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'silver-aura-media'
    AND public.is_admin()
    AND (storage.foldername(name))[1] IN ('products', 'categories', 'banners', 'site')
  )
  WITH CHECK (
    bucket_id = 'silver-aura-media'
    AND public.is_admin()
    AND (storage.foldername(name))[1] IN ('products', 'categories', 'banners', 'site')
  );

DROP POLICY IF EXISTS silver_aura_media_delete ON storage.objects;
CREATE POLICY silver_aura_media_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'silver-aura-media'
    AND public.is_admin()
    AND (storage.foldername(name))[1] IN ('products', 'categories', 'banners', 'site')
  );
