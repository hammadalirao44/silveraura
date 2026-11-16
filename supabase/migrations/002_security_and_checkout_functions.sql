-- ============================================================================
-- Silver Aura — Stage 1 Migration 002: Security Helpers, Admin RPCs & Checkout
-- ============================================================================
-- Lock Hierarchy (preserved consistently across checkout & all variant/inventory paths):
--   1. public.products       (FOR UPDATE, deterministic id ASC)
--   2. public.product_variants (FOR UPDATE, deterministic id ASC)
--   3. public.inventory      (FOR UPDATE, deterministic product_id ASC)
--   4. public.coupons        (FOR UPDATE)
--   5. public.customers      (UPSERT / FOR UPDATE)
--
-- Locking parent products FOR UPDATE prevents PostgreSQL FK FOR KEY SHARE vs
-- FOR SHARE compatibility races (e.g. concurrent first-variant creation during checkout).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Role Helper Functions
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
      AND au.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
      AND au.is_active = true
      AND au.role = 'super_admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. Admin Variant & Inventory RPC Functions (Strict Lock Hierarchy)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_create_product_variant(
  p_product_id uuid,
  p_size_label text DEFAULT NULL,
  p_color_label text DEFAULT NULL,
  p_sku text DEFAULT NULL,
  p_price integer DEFAULT NULL,
  p_stock integer DEFAULT 0,
  p_is_active boolean DEFAULT true,
  p_sort_order integer DEFAULT 0
)
RETURNS public.product_variants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_size text := NULLIF(btrim(COALESCE(p_size_label, '')), '');
  v_color text := NULLIF(btrim(COALESCE(p_color_label, '')), '');
  v_sku text := NULLIF(btrim(COALESCE(p_sku, '')), '');
  v_stock integer := COALESCE(p_stock, 0);
  v_sort integer := COALESCE(p_sort_order, 0);
  v_active boolean := COALESCE(p_is_active, true);
  v_inserted public.product_variants;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied: active admin privileges required.'
      USING ERRCODE = '42501';
  END IF;

  IF p_product_id IS NULL THEN
    RAISE EXCEPTION 'Product ID is required.';
  END IF;

  IF v_size IS NULL AND v_color IS NULL THEN
    RAISE EXCEPTION 'Variant must specify at least a size label or color/finish label.';
  END IF;

  IF p_price IS NOT NULL AND p_price < 0 THEN
    RAISE EXCEPTION 'Variant price cannot be negative.';
  END IF;

  IF v_stock < 0 THEN
    RAISE EXCEPTION 'Variant stock cannot be negative.';
  END IF;

  -- Lock parent product FOR UPDATE before inspecting/creating variants
  PERFORM 1
  FROM public.products p
  WHERE p.id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product % not found.', p_product_id;
  END IF;

  INSERT INTO public.product_variants (
    product_id,
    size_label,
    color_label,
    sku,
    price,
    stock,
    is_active,
    sort_order
  )
  VALUES (
    p_product_id,
    v_size,
    v_color,
    v_sku,
    p_price,
    v_stock,
    v_active,
    v_sort
  )
  RETURNING * INTO v_inserted;

  RETURN v_inserted;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_product_variant(
  p_variant_id uuid,
  p_product_id uuid DEFAULT NULL,
  p_size_label text DEFAULT NULL,
  p_clear_size_label boolean DEFAULT false,
  p_color_label text DEFAULT NULL,
  p_clear_color_label boolean DEFAULT false,
  p_sku text DEFAULT NULL,
  p_clear_sku boolean DEFAULT false,
  p_price integer DEFAULT NULL,
  p_clear_price boolean DEFAULT false,
  p_stock integer DEFAULT NULL,
  p_is_active boolean DEFAULT NULL,
  p_sort_order integer DEFAULT NULL
)
RETURNS public.product_variants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_product_id uuid;
  v_target_product_id uuid;
  v_lock_id uuid;
  v_existing public.product_variants;
  v_next_size text;
  v_next_color text;
  v_next_sku text;
  v_next_price integer;
  v_next_stock integer;
  v_updated public.product_variants;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied: active admin privileges required.'
      USING ERRCODE = '42501';
  END IF;

  IF p_variant_id IS NULL THEN
    RAISE EXCEPTION 'Variant ID is required.';
  END IF;

  SELECT pv.product_id
  INTO v_current_product_id
  FROM public.product_variants pv
  WHERE pv.id = p_variant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product variant % not found.', p_variant_id;
  END IF;

  v_target_product_id := COALESCE(p_product_id, v_current_product_id);

  -- Acquire parent product locks FOR UPDATE in ascending UUID order
  FOR v_lock_id IN
    SELECT DISTINCT pid
    FROM unnest(ARRAY[v_current_product_id, v_target_product_id]) AS pid
    ORDER BY pid ASC
  LOOP
    PERFORM 1
    FROM public.products p
    WHERE p.id = v_lock_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found.', v_lock_id;
    END IF;
  END LOOP;

  -- Lock the variant row after parent product lock(s)
  SELECT *
  INTO v_existing
  FROM public.product_variants pv
  WHERE pv.id = p_variant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product variant % no longer exists.', p_variant_id;
  END IF;

  v_next_size := CASE
    WHEN COALESCE(p_clear_size_label, false) THEN NULL
    WHEN p_size_label IS NOT NULL THEN NULLIF(btrim(p_size_label), '')
    ELSE v_existing.size_label
  END;

  v_next_color := CASE
    WHEN COALESCE(p_clear_color_label, false) THEN NULL
    WHEN p_color_label IS NOT NULL THEN NULLIF(btrim(p_color_label), '')
    ELSE v_existing.color_label
  END;

  v_next_sku := CASE
    WHEN COALESCE(p_clear_sku, false) THEN NULL
    WHEN p_sku IS NOT NULL THEN NULLIF(btrim(p_sku), '')
    ELSE v_existing.sku
  END;

  v_next_price := CASE
    WHEN COALESCE(p_clear_price, false) THEN NULL
    WHEN p_price IS NOT NULL THEN p_price
    ELSE v_existing.price
  END;

  v_next_stock := COALESCE(p_stock, v_existing.stock);

  IF v_next_size IS NULL AND v_next_color IS NULL THEN
    RAISE EXCEPTION 'Variant must keep at least a size label or color/finish label.';
  END IF;

  IF v_next_price IS NOT NULL AND v_next_price < 0 THEN
    RAISE EXCEPTION 'Variant price cannot be negative.';
  END IF;

  IF v_next_stock < 0 THEN
    RAISE EXCEPTION 'Variant stock cannot be negative.';
  END IF;

  UPDATE public.product_variants
  SET
    product_id = v_target_product_id,
    size_label = v_next_size,
    color_label = v_next_color,
    sku = v_next_sku,
    price = v_next_price,
    stock = v_next_stock,
    is_active = COALESCE(p_is_active, v_existing.is_active),
    sort_order = COALESCE(p_sort_order, v_existing.sort_order)
  WHERE id = p_variant_id
  RETURNING * INTO v_updated;

  RETURN v_updated;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_product_variant(
  p_variant_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_product_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied: active admin privileges required.'
      USING ERRCODE = '42501';
  END IF;

  IF p_variant_id IS NULL THEN
    RAISE EXCEPTION 'Variant ID is required.';
  END IF;

  SELECT pv.product_id
  INTO v_product_id
  FROM public.product_variants pv
  WHERE pv.id = p_variant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product variant % not found.', p_variant_id;
  END IF;

  -- Lock parent product FOR UPDATE before deleting child variant
  PERFORM 1
  FROM public.products p
  WHERE p.id = v_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Parent product % not found.', v_product_id;
  END IF;

  PERFORM 1
  FROM public.product_variants pv
  WHERE pv.id = p_variant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product variant % no longer exists.', p_variant_id;
  END IF;

  DELETE FROM public.product_variants
  WHERE id = p_variant_id;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_product_inventory(
  p_product_id uuid,
  p_stock_quantity integer DEFAULT NULL,
  p_low_stock_threshold integer DEFAULT NULL
)
RETURNS public.inventory
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  DECLARE
    v_has_variants boolean;
    v_variant_count integer;
    v_active_variant_stock integer := 0;
    v_prev_sync text;
    v_inv public.inventory;
    v_next_stock integer;
    v_next_threshold integer;
  BEGIN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Permission denied: active admin privileges required.'
        USING ERRCODE = '42501';
    END IF;

    IF p_product_id IS NULL THEN
      RAISE EXCEPTION 'Product ID is required.';
    END IF;

    IF p_stock_quantity IS NOT NULL AND p_stock_quantity < 0 THEN
      RAISE EXCEPTION 'Stock quantity cannot be negative.';
    END IF;

    IF p_low_stock_threshold IS NOT NULL AND p_low_stock_threshold < 0 THEN
      RAISE EXCEPTION 'Low-stock alert threshold cannot be negative.';
    END IF;

    -- Lock parent product FOR UPDATE first
    SELECT p.has_variants
    INTO v_has_variants
    FROM public.products p
    WHERE p.id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found.', p_product_id;
    END IF;

    SELECT
      COUNT(*)::integer,
      COALESCE(SUM(pv.stock) FILTER (WHERE pv.is_active = true), 0)::integer
    INTO v_variant_count, v_active_variant_stock
    FROM public.product_variants pv
    WHERE pv.product_id = p_product_id;

    IF (v_has_variants OR v_variant_count > 0) AND p_stock_quantity IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot manually override master stock_quantity on variant-managed product %; update variant stock instead.', p_product_id;
    END IF;

    -- Lock or initialize inventory row
    SELECT *
    INTO v_inv
    FROM public.inventory inv
    WHERE inv.product_id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      IF v_has_variants OR v_variant_count > 0 THEN
        v_prev_sync := current_setting('app.silver_aura_internal_sync', true);
        PERFORM set_config('app.silver_aura_internal_sync', 'on', true);
        INSERT INTO public.inventory (
          product_id,
          stock_quantity,
          low_stock_threshold
        )
        VALUES (
          p_product_id,
          v_active_variant_stock,
          COALESCE(p_low_stock_threshold, 5)
        )
        RETURNING * INTO v_inv;
        PERFORM set_config('app.silver_aura_internal_sync', COALESCE(v_prev_sync, 'off'), true);
      ELSE
        INSERT INTO public.inventory (
          product_id,
          stock_quantity,
          low_stock_threshold
        )
        VALUES (
          p_product_id,
          COALESCE(p_stock_quantity, 0),
          COALESCE(p_low_stock_threshold, 5)
        )
        RETURNING * INTO v_inv;
      END IF;
      RETURN v_inv;
    END IF;

  v_next_stock := CASE
    WHEN (v_has_variants OR v_variant_count > 0) THEN v_inv.stock_quantity
    WHEN p_stock_quantity IS NOT NULL THEN p_stock_quantity
    ELSE v_inv.stock_quantity
  END;

  v_next_threshold := COALESCE(p_low_stock_threshold, v_inv.low_stock_threshold);

  UPDATE public.inventory
  SET
    stock_quantity = v_next_stock,
    low_stock_threshold = v_next_threshold
  WHERE product_id = p_product_id
  RETURNING * INTO v_inv;

  RETURN v_inv;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Storefront Coupon Validation RPC
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code text,
  p_subtotal integer
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_code text := upper(btrim(COALESCE(p_code, '')));
  v_subtotal integer := GREATEST(0, COALESCE(p_subtotal, 0));
  v_coupon public.coupons;
  v_today_pkt date := (timezone('Asia/Karachi', now()))::date;
  v_discount integer := 0;
BEGIN
  IF v_code = '' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'code', '',
      'discount_type', NULL,
      'discount_value', 0,
      'discount_amount', 0,
      'min_order_amount', 0,
      'message', 'Please enter a coupon code.'
    );
  END IF;

  SELECT *
  INTO v_coupon
  FROM public.coupons c
  WHERE upper(btrim(c.code)) = v_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'code', v_code,
      'discount_type', NULL,
      'discount_value', 0,
      'discount_amount', 0,
      'min_order_amount', 0,
      'message', format('Coupon code "%s" is invalid.', v_code)
    );
  END IF;

  IF v_coupon.status <> 'Active' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'code', upper(btrim(v_coupon.code)),
      'discount_type', v_coupon.discount_type,
      'discount_value', v_coupon.discount_value,
      'discount_amount', 0,
      'min_order_amount', v_coupon.min_order_amount,
      'message', format('Coupon code "%s" is currently inactive.', upper(btrim(v_coupon.code)))
    );
  END IF;

  IF v_coupon.expiry_date < v_today_pkt THEN
    RETURN jsonb_build_object(
      'valid', false,
      'code', upper(btrim(v_coupon.code)),
      'discount_type', v_coupon.discount_type,
      'discount_value', v_coupon.discount_value,
      'discount_amount', 0,
      'min_order_amount', v_coupon.min_order_amount,
      'message', format('Coupon code "%s" expired on %s.', upper(btrim(v_coupon.code)), v_coupon.expiry_date)
    );
  END IF;

  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
    RETURN jsonb_build_object(
      'valid', false,
      'code', upper(btrim(v_coupon.code)),
      'discount_type', v_coupon.discount_type,
      'discount_value', v_coupon.discount_value,
      'discount_amount', 0,
      'min_order_amount', v_coupon.min_order_amount,
      'message', format('Coupon code "%s" has reached its redemption limit.', upper(btrim(v_coupon.code)))
    );
  END IF;

  IF v_subtotal < v_coupon.min_order_amount THEN
    RETURN jsonb_build_object(
      'valid', false,
      'code', upper(btrim(v_coupon.code)),
      'discount_type', v_coupon.discount_type,
      'discount_value', v_coupon.discount_value,
      'discount_amount', 0,
      'min_order_amount', v_coupon.min_order_amount,
      'message', format(
        'Minimum order amount of PKR %s is required to use %s.',
        v_coupon.min_order_amount,
        upper(btrim(v_coupon.code))
      )
    );
  END IF;

  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := LEAST(
      v_subtotal,
      GREATEST(0, ROUND((v_subtotal::numeric * v_coupon.discount_value) / 100.0)::integer)
    );
  ELSE
    v_discount := LEAST(v_subtotal, GREATEST(0, v_coupon.discount_value));
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'code', upper(btrim(v_coupon.code)),
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'discount_amount', v_discount,
    'min_order_amount', v_coupon.min_order_amount,
    'message', CASE
      WHEN v_coupon.discount_type = 'percentage'
        THEN format('%s applied (%s%% privilege discount).', upper(btrim(v_coupon.code)), v_coupon.discount_value)
      ELSE format('%s applied (PKR %s off).', upper(btrim(v_coupon.code)), v_discount)
    END
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. Transactional Storefront Order Placement RPC
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.place_storefront_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address text,
  p_city text,
  p_postal_code text DEFAULT '',
  p_payment_method text DEFAULT 'cod',
  p_coupon_code text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_customer_name text := btrim(COALESCE(p_customer_name, ''));
  v_customer_email text := lower(btrim(COALESCE(p_customer_email, '')));
  v_customer_phone text := btrim(COALESCE(p_customer_phone, ''));
  v_shipping_address text := btrim(COALESCE(p_shipping_address, ''));
  v_city text := btrim(COALESCE(p_city, ''));
  v_postal_code text := btrim(COALESCE(p_postal_code, ''));
  v_payment_method text := lower(btrim(p_payment_method));
  v_coupon_code text := NULLIF(upper(btrim(COALESCE(p_coupon_code, ''))), '');
  v_notes text := NULLIF(btrim(COALESCE(p_notes, '')), '');

  v_req_prod record;
  v_product public.products;
  v_category_active boolean;
  v_lp record;
  v_var_lock record;
  v_variant public.product_variants;
  v_variant_found boolean;
  v_inv_lock record;
  v_inv public.inventory;
  v_inv_found boolean;
  v_unit_price integer;
  v_line_total integer;
  v_variant_snapshot text;

  v_subtotal integer := 0;
  v_discount_amount integer := 0;
  v_shipping_cost integer := 0;
  v_total_amount integer := 0;
  v_standard_shipping integer := 250;
  v_free_threshold integer := 5000;

  v_coupon public.coupons;
  v_coupon_found boolean;
  v_today_pkt date := (timezone('Asia/Karachi', now()))::date;

  v_seq bigint;
  v_order_number text;
  v_customer_id uuid;
  v_order_id uuid;
  v_created_at timestamptz;
BEGIN
  -- Step A: Explicitly reject NULL / invalid payment method and validate customer details
  IF p_payment_method IS NULL OR v_payment_method NOT IN ('cod', 'bank_transfer', 'card') THEN
    RAISE EXCEPTION 'Invalid or missing payment method. Allowed values: cod, bank_transfer, card.';
  END IF;

  IF char_length(v_customer_name) < 2 THEN
    RAISE EXCEPTION 'Customer full name is required.';
  END IF;

  IF v_customer_email = '' OR v_customer_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'A valid customer email address is required.';
  END IF;

  IF char_length(regexp_replace(v_customer_phone, '\D', '', 'g')) < 7 THEN
    RAISE EXCEPTION 'A valid customer phone number is required.';
  END IF;

  IF char_length(v_shipping_address) < 5 THEN
    RAISE EXCEPTION 'Complete shipping street address is required.';
  END IF;

  IF v_city = '' THEN
    RAISE EXCEPTION 'Delivery city is required.';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one cart item.';
  END IF;

  -- Step B: Prepare transaction-scoped temp tables (safe for repeated calls in a session)
  CREATE TEMP TABLE IF NOT EXISTS tmp_requested_items (
    product_id uuid NOT NULL,
    variant_id uuid,
    quantity integer NOT NULL
  ) ON COMMIT DROP;
  TRUNCATE TABLE tmp_requested_items;

  CREATE TEMP TABLE IF NOT EXISTS tmp_locked_products (
    product_id uuid PRIMARY KEY,
    name text NOT NULL,
    sku text,
    price integer NOT NULL,
    sale_price integer,
    has_variants boolean NOT NULL,
    is_active boolean NOT NULL
  ) ON COMMIT DROP;
  TRUNCATE TABLE tmp_locked_products;

  CREATE TEMP TABLE IF NOT EXISTS tmp_resolved_lines (
    product_id uuid NOT NULL,
    variant_id uuid,
    product_name text NOT NULL,
    product_sku text,
    variant_snapshot text,
    quantity integer NOT NULL,
    unit_price integer NOT NULL,
    line_total integer NOT NULL
  ) ON COMMIT DROP;
  TRUNCATE TABLE tmp_resolved_lines;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_items) AS elem
    WHERE jsonb_typeof(elem) <> 'object'
  ) THEN
    RAISE EXCEPTION 'Every order item must be a JSON object containing product_id and quantity.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_items) AS elem
    WHERE NULLIF(btrim(elem ->> 'variant_id'), '') IS NOT NULL
      AND NULLIF(btrim(elem ->> 'variant_id'), '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  ) THEN
    RAISE EXCEPTION 'Every order item with a variant_id must specify a valid UUID.';
  END IF;

  -- Parse & aggregate duplicate (product_id, variant_id) lines cleanly
  WITH raw_items AS (
    SELECT
      NULLIF(btrim(elem ->> 'product_id'), '') AS raw_product_id,
      NULLIF(btrim(elem ->> 'variant_id'), '') AS raw_variant_id,
      btrim(COALESCE(elem ->> 'quantity', '')) AS raw_qty
    FROM jsonb_array_elements(p_items) AS elem
  )
  INSERT INTO tmp_requested_items (product_id, variant_id, quantity)
  SELECT
    CASE
      WHEN r.raw_product_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN r.raw_product_id::uuid
      ELSE NULL
    END,
    CASE
      WHEN r.raw_variant_id IS NULL THEN NULL
      WHEN r.raw_variant_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN r.raw_variant_id::uuid
      ELSE NULL
    END,
    CASE
      WHEN r.raw_qty ~ '^\d{1,6}$' THEN r.raw_qty::integer
      ELSE 0
    END
  FROM raw_items r;

  IF EXISTS (
    SELECT 1
    FROM tmp_requested_items
    WHERE product_id IS NULL OR quantity <= 0
  ) THEN
    RAISE EXCEPTION 'Every order item must specify a valid product_id and positive integer quantity (up to 999999).';
  END IF;

  -- Consolidate duplicate (product_id, variant_id) rows
  CREATE TEMP TABLE IF NOT EXISTS tmp_grouped_items (
    product_id uuid NOT NULL,
    variant_id uuid,
    quantity integer NOT NULL
  ) ON COMMIT DROP;
  TRUNCATE TABLE tmp_grouped_items;

  INSERT INTO tmp_grouped_items (product_id, variant_id, quantity)
  SELECT product_id, variant_id, SUM(quantity)::integer
  FROM tmp_requested_items
  GROUP BY product_id, variant_id;

  -- Step C: Lock parent products FOR UPDATE in deterministic product_id ASC order
  FOR v_req_prod IN
    SELECT DISTINCT gi.product_id
    FROM tmp_grouped_items gi
    ORDER BY gi.product_id ASC
  LOOP
    SELECT p.*
    INTO v_product
    FROM public.products p
    WHERE p.id = v_req_prod.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % was not found.', v_req_prod.product_id;
    END IF;

    SELECT c.is_active
    INTO v_category_active
    FROM public.categories c
    WHERE c.id = v_product.category_id;

    IF NOT FOUND OR NOT v_product.is_active OR NOT COALESCE(v_category_active, false) THEN
      RAISE EXCEPTION 'Product "%" is currently unavailable for purchase.', v_product.name;
    END IF;

    INSERT INTO tmp_locked_products (
      product_id,
      name,
      sku,
      price,
      sale_price,
      has_variants,
      is_active
    )
    VALUES (
      v_product.id,
      v_product.name,
      v_product.sku,
      v_product.price,
      v_product.sale_price,
      v_product.has_variants,
      v_product.is_active
    );
  END LOOP;

  -- Step D: Validate variant requirement mismatches before stock deduction
  IF EXISTS (
    SELECT 1
    FROM tmp_grouped_items gi
    JOIN tmp_locked_products lp ON lp.product_id = gi.product_id
    WHERE lp.has_variants = true AND gi.variant_id IS NULL
  ) THEN
    RAISE EXCEPTION 'A size or finish option must be selected for variant-managed products.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM tmp_grouped_items gi
    JOIN tmp_locked_products lp ON lp.product_id = gi.product_id
    WHERE lp.has_variants = false AND gi.variant_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Variant selection provided for a non-variant product.';
  END IF;

  -- Step E: Lock variant items FOR UPDATE in deterministic variant_id ASC order
  FOR v_var_lock IN
    SELECT gi.product_id, gi.variant_id, gi.quantity
    FROM tmp_grouped_items gi
    WHERE gi.variant_id IS NOT NULL
    ORDER BY gi.variant_id ASC
  LOOP
    SELECT *
    INTO v_variant
    FROM public.product_variants pv
    WHERE pv.id = v_var_lock.variant_id
      AND pv.product_id = v_var_lock.product_id
    FOR UPDATE;

    -- Capture FOUND immediately before any subsequent SQL statement
    v_variant_found := FOUND;

    IF NOT v_variant_found THEN
      RAISE EXCEPTION 'Selected product variant % was not found.', v_var_lock.variant_id;
    END IF;

    IF NOT v_variant.is_active THEN
      RAISE EXCEPTION 'Selected product variant % is currently inactive.', v_var_lock.variant_id;
    END IF;

    SELECT *
    INTO v_lp
    FROM tmp_locked_products lp
    WHERE lp.product_id = v_var_lock.product_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Locked product % missing from checkout context.', v_var_lock.product_id;
    END IF;

    IF v_variant.stock < v_var_lock.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for "%". Available: %, requested: %.',
        v_lp.name, v_variant.stock, v_var_lock.quantity;
    END IF;

    v_unit_price := COALESCE(v_variant.price, v_lp.sale_price, v_lp.price);
    IF v_unit_price IS NULL OR v_unit_price < 0 THEN
      RAISE EXCEPTION 'Unresolved unit pricing for product "%".', v_lp.name;
    END IF;

    v_line_total := v_unit_price * v_var_lock.quantity;
    v_variant_snapshot := NULLIF(
      concat_ws(' / ', NULLIF(btrim(v_variant.size_label), ''), NULLIF(btrim(v_variant.color_label), '')),
      ''
    );

    UPDATE public.product_variants
    SET stock = stock - v_var_lock.quantity
    WHERE id = v_variant.id;

    INSERT INTO tmp_resolved_lines (
      product_id,
      variant_id,
      product_name,
      product_sku,
      variant_snapshot,
      quantity,
      unit_price,
      line_total
    )
    VALUES (
      v_lp.product_id,
      v_variant.id,
      v_lp.name,
      COALESCE(v_variant.sku, v_lp.sku),
      v_variant_snapshot,
      v_var_lock.quantity,
      v_unit_price,
      v_line_total
    );

    v_subtotal := v_subtotal + v_line_total;
  END LOOP;

  -- Step F: Lock non-variant inventory FOR UPDATE in deterministic product_id ASC order
  FOR v_inv_lock IN
    SELECT gi.product_id, gi.quantity
    FROM tmp_grouped_items gi
    WHERE gi.variant_id IS NULL
    ORDER BY gi.product_id ASC
  LOOP
    SELECT *
    INTO v_inv
    FROM public.inventory inv
    WHERE inv.product_id = v_inv_lock.product_id
    FOR UPDATE;

    -- Capture FOUND immediately before any subsequent SQL statement
    v_inv_found := FOUND;

    SELECT *
    INTO v_lp
    FROM tmp_locked_products lp
    WHERE lp.product_id = v_inv_lock.product_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Locked product % missing from checkout context.', v_inv_lock.product_id;
    END IF;

    IF NOT v_inv_found THEN
      RAISE EXCEPTION 'Inventory record not initialized for "%".', v_lp.name;
    END IF;

    IF v_inv.stock_quantity < v_inv_lock.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for "%". Available: %, requested: %.',
        v_lp.name, v_inv.stock_quantity, v_inv_lock.quantity;
    END IF;

    v_unit_price := COALESCE(v_lp.sale_price, v_lp.price);
    IF v_unit_price IS NULL OR v_unit_price < 0 THEN
      RAISE EXCEPTION 'Unresolved unit pricing for product "%".', v_lp.name;
    END IF;

    v_line_total := v_unit_price * v_inv_lock.quantity;

    UPDATE public.inventory
    SET stock_quantity = stock_quantity - v_inv_lock.quantity
    WHERE product_id = v_lp.product_id;

    INSERT INTO tmp_resolved_lines (
      product_id,
      variant_id,
      product_name,
      product_sku,
      variant_snapshot,
      quantity,
      unit_price,
      line_total
    )
    VALUES (
      v_lp.product_id,
      NULL,
      v_lp.name,
      v_lp.sku,
      NULL,
      v_inv_lock.quantity,
      v_unit_price,
      v_line_total
    );

    v_subtotal := v_subtotal + v_line_total;
  END LOOP;

  -- Step G: Coupon validation & atomic usage increment (if coupon supplied)
  IF v_coupon_code IS NOT NULL THEN
    SELECT *
    INTO v_coupon
    FROM public.coupons c
    WHERE upper(btrim(c.code)) = v_coupon_code
    FOR UPDATE;

    v_coupon_found := FOUND;

    IF NOT v_coupon_found THEN
      RAISE EXCEPTION 'Coupon code "%" is invalid.', v_coupon_code;
    END IF;

    IF v_coupon.status <> 'Active' THEN
      RAISE EXCEPTION 'Coupon code "%" is currently inactive.', v_coupon_code;
    END IF;

    IF v_coupon.expiry_date < v_today_pkt THEN
      RAISE EXCEPTION 'Coupon code "%" has expired.', v_coupon_code;
    END IF;

    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
      RAISE EXCEPTION 'Coupon code "%" has reached its usage limit.', v_coupon_code;
    END IF;

    IF v_subtotal < v_coupon.min_order_amount THEN
      RAISE EXCEPTION 'Minimum order of PKR % is required for coupon "%".',
        v_coupon.min_order_amount, v_coupon_code;
    END IF;

    IF v_coupon.discount_type = 'percentage' THEN
      v_discount_amount := LEAST(
        v_subtotal,
        GREATEST(0, ROUND((v_subtotal::numeric * v_coupon.discount_value) / 100.0)::integer)
      );
    ELSE
      v_discount_amount := LEAST(v_subtotal, GREATEST(0, v_coupon.discount_value));
    END IF;

    UPDATE public.coupons
    SET usage_count = usage_count + 1
    WHERE id = v_coupon.id;
  END IF;

  -- Step H: Authoritative shipping calculation from store_settings singleton
  SELECT
    COALESCE(ss.standard_shipping_charge, 250),
    COALESCE(ss.free_shipping_threshold, 5000)
  INTO v_standard_shipping, v_free_threshold
  FROM public.store_settings ss
  WHERE ss.id = true;

  IF NOT FOUND THEN
    v_standard_shipping := 250;
    v_free_threshold := 5000;
  END IF;

  v_shipping_cost := CASE
    WHEN v_subtotal = 0 OR v_subtotal >= v_free_threshold THEN 0
    ELSE v_standard_shipping
  END;

  v_total_amount := GREATEST(0, v_subtotal - v_discount_amount + v_shipping_cost);

  -- Step I: Non-truncated unique order number generation
  v_seq := nextval('public.order_number_seq');
  v_order_number := 'SA-'
    || to_char(timezone('Asia/Karachi', now()), 'YYYYMMDD')
    || '-'
    || CASE
         WHEN v_seq < 1000000 THEN lpad(v_seq::text, 6, '0')
         ELSE v_seq::text
       END;

  -- Step J: Upsert customer profile & create order + order_items
  INSERT INTO public.customers (
    user_id,
    name,
    email,
    phone,
    city,
    address,
    postal_code,
    total_orders,
    total_spent,
    status
  )
  VALUES (
    CASE
      WHEN auth.uid() IS NOT NULL
       AND lower(btrim(COALESCE(auth.jwt() ->> 'email', ''))) = v_customer_email
      THEN auth.uid()
      ELSE NULL
    END,
    v_customer_name,
    v_customer_email,
    v_customer_phone,
    v_city,
    v_shipping_address,
    v_postal_code,
    1,
    v_total_amount,
    'Active'
  )
  ON CONFLICT (lower(btrim(email))) DO UPDATE
  SET
    user_id = COALESCE(public.customers.user_id, EXCLUDED.user_id),
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    postal_code = CASE WHEN EXCLUDED.postal_code <> '' THEN EXCLUDED.postal_code ELSE public.customers.postal_code END,
    total_orders = public.customers.total_orders + 1,
    total_spent = public.customers.total_spent + EXCLUDED.total_spent
  RETURNING id INTO v_customer_id;

  INSERT INTO public.orders (
    order_number,
    customer_id,
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    city,
    postal_code,
    payment_method,
    payment_status,
    order_status,
    coupon_code,
    subtotal,
    shipping_cost,
    discount_amount,
    total_amount,
    notes
  )
  VALUES (
    v_order_number,
    v_customer_id,
    auth.uid(),
    v_customer_name,
    v_customer_email,
    v_customer_phone,
    v_shipping_address,
    v_city,
    v_postal_code,
    v_payment_method,
    'Pending',
    'Pending',
    v_coupon_code,
    v_subtotal,
    v_shipping_cost,
    v_discount_amount,
    v_total_amount,
    v_notes
  )
  RETURNING id, created_at INTO v_order_id, v_created_at;

  INSERT INTO public.order_items (
    order_id,
    product_id,
    variant_id,
    product_name,
    product_sku,
    variant_snapshot,
    quantity,
    unit_price,
    line_total
  )
  SELECT
    v_order_id,
    rl.product_id,
    rl.variant_id,
    rl.product_name,
    rl.product_sku,
    rl.variant_snapshot,
    rl.quantity,
    rl.unit_price,
    rl.line_total
  FROM tmp_resolved_lines rl;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'customer_id', v_customer_id,
    'subtotal', v_subtotal,
    'shipping_cost', v_shipping_cost,
    'discount_amount', v_discount_amount,
    'total_amount', v_total_amount,
    'coupon_code', v_coupon_code,
    'payment_method', v_payment_method,
    'payment_status', 'Pending',
    'order_status', 'Pending',
    'created_at', v_created_at
  );
END;
$$;

-- ============================================================================
-- 5. Complete Idempotent Function Permission Reset
-- ============================================================================
-- Role helpers
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated;

-- Admin-only RPCs
REVOKE ALL ON FUNCTION public.admin_create_product_variant(uuid, text, text, text, integer, integer, boolean, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_product_variant(uuid, text, text, text, integer, integer, boolean, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_update_product_variant(uuid, uuid, text, boolean, text, boolean, text, boolean, integer, boolean, integer, boolean, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_product_variant(uuid, uuid, text, boolean, text, boolean, text, boolean, integer, boolean, integer, boolean, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_delete_product_variant(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_product_variant(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_set_product_inventory(uuid, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_product_inventory(uuid, integer, integer) TO authenticated;

-- Storefront RPCs
REVOKE ALL ON FUNCTION public.validate_coupon(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text, integer) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.place_storefront_order(text, text, text, text, text, text, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_storefront_order(text, text, text, text, text, text, text, text, text, jsonb) TO anon, authenticated;
