-- ============================================================================
-- Silver Aura — Stage 1 Migration 001: Initial Schema, Constraints & Triggers
-- ============================================================================
-- Notes:
--   * Idempotent where practical (IF NOT EXISTS / CREATE OR REPLACE / DO blocks).
--   * Must be executed before 002_security_and_checkout_functions.sql.
--   * Exact columns, nullability, and checks match src/types/database.ts and
--     frontend services in src/services/*.ts.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Sequence for non-truncated, monotonically unique storefront order numbers
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq
  AS BIGINT
  INCREMENT BY 1
  START WITH 1001
  MINVALUE 1
  NO MAXVALUE
  CACHE 1;

-- ----------------------------------------------------------------------------
-- Generic updated_at trigger function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1. profiles (1:1 extension of auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. admin_users (RBAC registry linked to auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_email_ci_unique
  ON public.admin_users (lower(btrim(email)));

DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tagline text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_ci_unique
  ON public.categories (lower(btrim(name)));

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug_ci_unique
  ON public.categories (lower(btrim(slug)));

CREATE INDEX IF NOT EXISTS idx_categories_active_order
  ON public.categories (is_active, display_order, name);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. products
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sku text,
  price integer NOT NULL CHECK (price >= 0),
  original_price integer CHECK (original_price IS NULL OR original_price >= 0),
  sale_price integer CHECK (sale_price IS NULL OR sale_price >= 0),
  description text NOT NULL DEFAULT '',
  silver_purity text NOT NULL DEFAULT 'Solid 925 Sterling Silver',
  plating text,
  stone text,
  weight text NOT NULL DEFAULT '',
  hallmark text NOT NULL DEFAULT '925 Laser Inscription',
  care_notes text[] NOT NULL DEFAULT '{}'::text[],
  has_variants boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_best_seller boolean NOT NULL DEFAULT false,
  is_new_arrival boolean NOT NULL DEFAULT false,
  rating numeric(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
  review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_ci_unique
  ON public.products (lower(btrim(slug)));

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_ci_unique
  ON public.products (lower(btrim(sku)))
  WHERE sku IS NOT NULL AND btrim(sku) <> '';

CREATE INDEX IF NOT EXISTS idx_products_category_active
  ON public.products (category_id, is_active, created_at DESC);

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. product_images
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  storage_path text,
  alt_text text NOT NULL DEFAULT '',
  is_primary boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Enforce at most one primary image per product (used by syncProductImages)
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_single_primary
  ON public.product_images (product_id)
  WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_product_images_product_sort
  ON public.product_images (product_id, is_primary DESC, sort_order ASC);

-- ----------------------------------------------------------------------------
-- 6. product_variants (mutated strictly through Stage 1 locked RPCs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku text,
  size_label text,
  color_label text,
  price integer CHECK (price IS NULL OR price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT chk_product_variants_option_present CHECK (
    NULLIF(btrim(COALESCE(size_label, '')), '') IS NOT NULL
    OR NULLIF(btrim(COALESCE(color_label, '')), '') IS NOT NULL
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_sku_ci_unique
  ON public.product_variants (lower(btrim(sku)))
  WHERE sku IS NOT NULL AND btrim(sku) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_option_combo_unique
  ON public.product_variants (
    product_id,
    COALESCE(lower(btrim(size_label)), ''),
    COALESCE(lower(btrim(color_label)), '')
  );

CREATE INDEX IF NOT EXISTS idx_product_variants_product_sort
  ON public.product_variants (product_id, sort_order ASC, created_at ASC);

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 7. inventory (1:1 per product; synced for variant products)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

DROP TRIGGER IF EXISTS trg_inventory_updated_at ON public.inventory;
CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 8. customers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  total_orders integer NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
  total_spent integer NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'VIP', 'Inactive')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_ci_unique
  ON public.customers (lower(btrim(email)));

CREATE INDEX IF NOT EXISTS idx_customers_user_id
  ON public.customers (user_id)
  WHERE user_id IS NOT NULL;

DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 9. orders (created strictly via place_storefront_order RPC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL DEFAULT '',
  payment_method text NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'bank_transfer', 'card')),
  payment_status text NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
  order_status text NOT NULL DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  coupon_code text,
  subtotal integer NOT NULL CHECK (subtotal >= 0),
  shipping_cost integer NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  discount_amount integer NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (order_status, payment_status);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 10. order_items (created strictly via place_storefront_order RPC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text,
  variant_snapshot text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price integer NOT NULL CHECK (unit_price >= 0),
  line_total integer NOT NULL CHECK (line_total >= 0),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

-- ----------------------------------------------------------------------------
-- 11. coupons (case-insensitive unique code constraint)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value integer NOT NULL CHECK (discount_value > 0),
  min_order_amount integer NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  expiry_date date NOT NULL,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  usage_count integer NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  usage_limit integer CHECK (usage_limit IS NULL OR usage_limit >= 1),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT chk_coupons_percentage_cap CHECK (
    discount_type <> 'percentage' OR discount_value <= 100
  )
);

-- Safe deduplication + database-enforced case-insensitive unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code_ci_unique
  ON public.coupons (upper(btrim(code)));

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON public.coupons;
CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 12. store_settings (singleton table: id = true)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  store_name text NOT NULL DEFAULT 'Silver Aura',
  store_email text NOT NULL DEFAULT 'concierge@silveraura.pk',
  contact_phone text NOT NULL DEFAULT '+92 300 8291925',
  store_address text NOT NULL DEFAULT 'Suite 402, Executive Tower, Marine Drive, Clifton Block 4, Karachi, Pakistan.',
  currency text NOT NULL DEFAULT 'PKR',
  currency_symbol text NOT NULL DEFAULT 'PKR',
  standard_shipping_charge integer NOT NULL DEFAULT 250 CHECK (standard_shipping_charge >= 0),
  free_shipping_threshold integer NOT NULL DEFAULT 5000 CHECK (free_shipping_threshold >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 1),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

DROP TRIGGER IF EXISTS trg_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER trg_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.store_settings (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 13. homepage_content (singleton table: id = true)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.homepage_content (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  hero_subtitle text NOT NULL DEFAULT '925 Sterling Silver Atelier',
  hero_title text NOT NULL DEFAULT 'Pure Silver, Timeless Allure.',
  hero_title_italic text NOT NULL DEFAULT '',
  hero_description text NOT NULL DEFAULT 'Sculpted from certified 925 sterling silver and finished with mirror rhodium plating. Designed for effortless modern living, from Karachi evenings to everyday rituals.',
  hero_image_url text NOT NULL DEFAULT '',
  hero_cta_text text NOT NULL DEFAULT 'Shop Collection',
  hero_secondary_cta_text text NOT NULL DEFAULT 'Bridal & Gift Sets',
  announcement_text text NOT NULL DEFAULT 'Complimentary Insured Courier Delivery Across Pakistan on Orders Over PKR 5,000',
  announcement_delivery_threshold integer NOT NULL DEFAULT 5000 CHECK (announcement_delivery_threshold >= 0),
  society_discount_code text NOT NULL DEFAULT 'AURA10',
  about_text text NOT NULL DEFAULT 'Silver Aura was conceived to revive true artisanal fine silver. In a market flooded with brass, low-grade alloys, and fleeting costume jewelry, we craft exclusively in solid 925 sterling silver — 92.5% pure elemental silver paired with 7.5% strengthened copper for timeless heirloom durability.',
  contact_address text NOT NULL DEFAULT 'Suite 402, Executive Tower, Marine Drive, Clifton Block 4, Karachi, Pakistan.',
  contact_whatsapp text NOT NULL DEFAULT '+92 300 8291925',
  contact_email text NOT NULL DEFAULT 'concierge@silveraura.pk',
  visiting_hours text NOT NULL DEFAULT 'Monday – Saturday: 10:00 AM – 8:00 PM (PKT)',
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

DROP TRIGGER IF EXISTS trg_homepage_content_updated_at ON public.homepage_content;
CREATE TRIGGER trg_homepage_content_updated_at
  BEFORE UPDATE ON public.homepage_content
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.homepage_content (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 14. promotional_banners
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotional_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  cta_text text NOT NULL DEFAULT '',
  cta_link text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  placement text NOT NULL DEFAULT 'home_banner' CHECK (placement IN ('top_bar', 'home_banner', 'collection_spotlight', 'popup')),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT chk_promotional_banners_schedule CHECK (
    starts_at IS NULL OR ends_at IS NULL OR ends_at >= starts_at
  )
);

CREATE INDEX IF NOT EXISTS idx_promotional_banners_active_placement
  ON public.promotional_banners (is_active, placement, sort_order ASC);

DROP TRIGGER IF EXISTS trg_promotional_banners_updated_at ON public.promotional_banners;
CREATE TRIGGER trg_promotional_banners_updated_at
  BEFORE UPDATE ON public.promotional_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- Inventory, Variant Synchronization & Guard Triggers
-- ============================================================================

-- Ensure every newly created product automatically gets an inventory row
CREATE OR REPLACE FUNCTION public.ensure_product_inventory_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.inventory (product_id, stock_quantity, low_stock_threshold)
  VALUES (NEW.id, 0, 5)
  ON CONFLICT (product_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_ensure_inventory ON public.products;
CREATE TRIGGER trg_products_ensure_inventory
  AFTER INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_product_inventory_row();

-- Prevent direct tampering with products.has_variants outside variant sync triggers
CREATE OR REPLACE FUNCTION public.guard_products_has_variants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.has_variants IS DISTINCT FROM OLD.has_variants THEN
    IF current_setting('app.silver_aura_internal_sync', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION 'products.has_variants is managed automatically by product_variants triggers and cannot be modified directly.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_guard_has_variants ON public.products;
CREATE TRIGGER trg_products_guard_has_variants
  BEFORE UPDATE OF has_variants ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_products_has_variants();

-- Guard master inventory.stock_quantity from being directly overwritten while product has variants
CREATE OR REPLACE FUNCTION public.guard_variant_inventory_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_has_variants boolean;
  v_variant_count integer;
BEGIN
  IF current_setting('app.silver_aura_internal_sync', true) = 'on' THEN
    RETURN NEW;
  END IF;

  SELECT p.has_variants
  INTO v_has_variants
  FROM public.products p
  WHERE p.id = NEW.product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Parent product % not found for inventory update.', NEW.product_id;
  END IF;

  SELECT COUNT(*)::integer
  INTO v_variant_count
  FROM public.product_variants pv
  WHERE pv.product_id = NEW.product_id;

  IF v_has_variants OR v_variant_count > 0 THEN
    IF TG_OP = 'INSERT' AND NEW.stock_quantity <> 0 THEN
      RAISE EXCEPTION 'Cannot insert non-zero master inventory for variant-managed product %.', NEW.product_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.stock_quantity IS DISTINCT FROM OLD.stock_quantity THEN
      RAISE EXCEPTION 'Master inventory stock_quantity is locked for variant-managed product %; update individual variants instead.', NEW.product_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inventory_guard_variant_updates ON public.inventory;
CREATE TRIGGER trg_inventory_guard_variant_updates
  BEFORE INSERT OR UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_variant_inventory_updates();

-- Keep products.has_variants & inventory.stock_quantity synchronized whenever product_variants changes.
-- Preserves deterministic lock hierarchy: lock parent product(s) FOR UPDATE before syncing inventory.
CREATE OR REPLACE FUNCTION public.sync_product_variant_state()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_target_ids uuid[];
  v_pid uuid;
  v_variant_count integer;
  v_active_stock integer;
  v_prev_sync text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_target_ids := ARRAY[NEW.product_id];
  ELSIF TG_OP = 'DELETE' THEN
    v_target_ids := ARRAY[OLD.product_id];
  ELSIF NEW.product_id = OLD.product_id THEN
    v_target_ids := ARRAY[NEW.product_id];
  ELSE
    -- Lock in ascending product UUID order if variant reassigned across products
    SELECT ARRAY(
      SELECT DISTINCT pid
      FROM unnest(ARRAY[OLD.product_id, NEW.product_id]) AS pid
      ORDER BY pid ASC
    )
    INTO v_target_ids;
  END IF;

  v_prev_sync := current_setting('app.silver_aura_internal_sync', true);
  PERFORM set_config('app.silver_aura_internal_sync', 'on', true);

  FOREACH v_pid IN ARRAY v_target_ids LOOP
    -- Lock parent product row first (consistent lock hierarchy)
    PERFORM 1
    FROM public.products p
    WHERE p.id = v_pid
    FOR UPDATE;

    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    SELECT
      COUNT(*)::integer,
      COALESCE(SUM(pv.stock) FILTER (WHERE pv.is_active = true), 0)::integer
    INTO v_variant_count, v_active_stock
    FROM public.product_variants pv
    WHERE pv.product_id = v_pid;

    UPDATE public.products
    SET has_variants = (v_variant_count > 0)
    WHERE id = v_pid
      AND has_variants IS DISTINCT FROM (v_variant_count > 0);

    INSERT INTO public.inventory (product_id, stock_quantity, low_stock_threshold)
    VALUES (v_pid, v_active_stock, 5)
    ON CONFLICT (product_id) DO UPDATE
    SET stock_quantity = EXCLUDED.stock_quantity
    WHERE public.inventory.stock_quantity IS DISTINCT FROM EXCLUDED.stock_quantity;
  END LOOP;

  PERFORM set_config('app.silver_aura_internal_sync', COALESCE(v_prev_sync, 'off'), true);
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    PERFORM set_config('app.silver_aura_internal_sync', COALESCE(v_prev_sync, 'off'), true);
    RAISE;
END;
$$;

DROP TRIGGER IF EXISTS trg_product_variants_sync_state ON public.product_variants;
CREATE TRIGGER trg_product_variants_sync_state
  AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_product_variant_state();

-- Automatically provision public.profiles row when a new auth.users account is created
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = COALESCE(NULLIF(EXCLUDED.email, ''), public.profiles.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================================
-- Restrict direct execution on internal trigger functions
-- ============================================================================
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_product_inventory_row() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_products_has_variants() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_variant_inventory_updates() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_product_variant_state() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;
