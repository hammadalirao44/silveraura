-- ============================================================================
-- Silver Aura — Stage 1 Migration 003: Privileges & Row-Level Security (RLS)
-- ============================================================================
-- Notes:
--   * Idempotent (REVOKE/GRANT + DROP POLICY IF EXISTS + CREATE POLICY).
--   * Must be executed after 001_initial_schema.sql and
--     002_security_and_checkout_functions.sql.
--   * Direct client writes to product_variants, inventory, order_items, and
--     orders (INSERT/DELETE) are intentionally revoked/blocked so mutations pass
--     strictly through SECURITY DEFINER RPCs and sync triggers.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Schema, Sequence & Least-Privilege Table Grants
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- User & RBAC tables
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;

-- Storefront catalog tables
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;

GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;

-- RPC-only mutation tables (SELECT only at table level)
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT ON public.inventory TO anon, authenticated;

-- Customer & Order tables (orders INSERT & order_items writes strictly via RPC)
GRANT SELECT ON public.customers TO authenticated;
GRANT UPDATE (status) ON public.customers TO authenticated;

GRANT SELECT ON public.orders TO authenticated;
GRANT UPDATE (payment_status, order_status, notes) ON public.orders TO authenticated;

GRANT SELECT ON public.order_items TO authenticated;

-- Coupons (admin-only at table level; public validates via validate_coupon RPC)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;

-- Store settings & Website content singletons (pre-seeded, UPDATE only for admins)
GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT, UPDATE ON public.store_settings TO authenticated;

GRANT SELECT ON public.homepage_content TO anon;
GRANT SELECT, UPDATE ON public.homepage_content TO authenticated;

-- Promotional banners
GRANT SELECT ON public.promotional_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotional_banners TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. Enable Row-Level Security on All Public Tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. profiles Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. admin_users Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS admin_users_select ON public.admin_users;
CREATE POLICY admin_users_select
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS admin_users_insert ON public.admin_users;
CREATE POLICY admin_users_insert
  ON public.admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS admin_users_update ON public.admin_users;
CREATE POLICY admin_users_update
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS admin_users_delete ON public.admin_users;
CREATE POLICY admin_users_delete
  ON public.admin_users
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin() AND user_id <> auth.uid());

-- ----------------------------------------------------------------------------
-- 5. categories Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS categories_select ON public.categories;
CREATE POLICY categories_select
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS categories_insert ON public.categories;
CREATE POLICY categories_insert
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS categories_update ON public.categories;
CREATE POLICY categories_update
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS categories_delete ON public.categories;
CREATE POLICY categories_delete
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. products Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS products_select ON public.products;
CREATE POLICY products_select
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (
    public.is_admin()
    OR (
      is_active = true
      AND EXISTS (
        SELECT 1
        FROM public.categories c
        WHERE c.id = products.category_id
          AND c.is_active = true
      )
    )
  );

DROP POLICY IF EXISTS products_insert ON public.products;
CREATE POLICY products_insert
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS products_update ON public.products;
CREATE POLICY products_update
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS products_delete ON public.products;
CREATE POLICY products_delete
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. product_images Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS product_images_select ON public.product_images;
CREATE POLICY product_images_select
  ON public.product_images
  FOR SELECT
  TO anon, authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.products p
      JOIN public.categories c ON c.id = p.category_id
      WHERE p.id = product_images.product_id
        AND p.is_active = true
        AND c.is_active = true
    )
  );

DROP POLICY IF EXISTS product_images_insert ON public.product_images;
CREATE POLICY product_images_insert
  ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS product_images_update ON public.product_images;
CREATE POLICY product_images_update
  ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS product_images_delete ON public.product_images;
CREATE POLICY product_images_delete
  ON public.product_images
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. product_variants Policies (SELECT only; writes strictly via RPCs)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS product_variants_select ON public.product_variants;
CREATE POLICY product_variants_select
  ON public.product_variants
  FOR SELECT
  TO anon, authenticated
  USING (
    public.is_admin()
    OR (
      is_active = true
      AND EXISTS (
        SELECT 1
        FROM public.products p
        JOIN public.categories c ON c.id = p.category_id
        WHERE p.id = product_variants.product_id
          AND p.is_active = true
          AND c.is_active = true
      )
    )
  );

-- ----------------------------------------------------------------------------
-- 9. inventory Policies (SELECT only; writes strictly via RPCs & triggers)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS inventory_select ON public.inventory;
CREATE POLICY inventory_select
  ON public.inventory
  FOR SELECT
  TO anon, authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.products p
      JOIN public.categories c ON c.id = p.category_id
      WHERE p.id = inventory.product_id
        AND p.is_active = true
        AND c.is_active = true
    )
  );

-- ----------------------------------------------------------------------------
-- 10. customers Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS customers_select ON public.customers;
CREATE POLICY customers_select
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS customers_update ON public.customers;
CREATE POLICY customers_update
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 11. orders Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS orders_select ON public.orders;
CREATE POLICY orders_select
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS orders_update ON public.orders;
CREATE POLICY orders_update
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 12. order_items Policies (SELECT only; inserts strictly via checkout RPC)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS order_items_select ON public.order_items;
CREATE POLICY order_items_select
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 13. coupons Policies (strictly admin at table level; public via RPC)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS coupons_select ON public.coupons;
CREATE POLICY coupons_select
  ON public.coupons
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS coupons_insert ON public.coupons;
CREATE POLICY coupons_insert
  ON public.coupons
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS coupons_update ON public.coupons;
CREATE POLICY coupons_update
  ON public.coupons
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS coupons_delete ON public.coupons;
CREATE POLICY coupons_delete
  ON public.coupons
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 14. store_settings Policies (singleton)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS store_settings_select ON public.store_settings;
CREATE POLICY store_settings_select
  ON public.store_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS store_settings_update ON public.store_settings;
CREATE POLICY store_settings_update
  ON public.store_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 15. homepage_content Policies (singleton)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS homepage_content_select ON public.homepage_content;
CREATE POLICY homepage_content_select
  ON public.homepage_content
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS homepage_content_update ON public.homepage_content;
CREATE POLICY homepage_content_update
  ON public.homepage_content
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 16. promotional_banners Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS promotional_banners_select ON public.promotional_banners;
CREATE POLICY promotional_banners_select
  ON public.promotional_banners
  FOR SELECT
  TO anon, authenticated
  USING (
    public.is_admin()
    OR (
      is_active = true
      AND (starts_at IS NULL OR starts_at <= timezone('utc', now()))
      AND (ends_at IS NULL OR ends_at >= timezone('utc', now()))
    )
  );

DROP POLICY IF EXISTS promotional_banners_insert ON public.promotional_banners;
CREATE POLICY promotional_banners_insert
  ON public.promotional_banners
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS promotional_banners_update ON public.promotional_banners;
CREATE POLICY promotional_banners_update
  ON public.promotional_banners
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS promotional_banners_delete ON public.promotional_banners;
CREATE POLICY promotional_banners_delete
  ON public.promotional_banners
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
