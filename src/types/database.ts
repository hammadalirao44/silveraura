export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DbAdminRole = 'super_admin' | 'admin' | 'editor';
export type DbPaymentMethod = 'cod' | 'bank_transfer' | 'card';
export type DbPaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type DbOrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';
export type DbCustomerStatus = 'Active' | 'VIP' | 'Inactive';
export type DbCouponDiscountType = 'percentage' | 'fixed';
export type DbCouponStatus = 'Active' | 'Inactive';
export type DbBannerPlacement = 'top_bar' | 'home_banner' | 'collection_spotlight' | 'popup';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          city: string;
          address: string;
          postal_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          email?: string;
          phone?: string;
          city?: string;
          address?: string;
          postal_code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string;
          phone?: string;
          city?: string;
          address?: string;
          postal_code?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string;
          role: DbAdminRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string;
          role?: DbAdminRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string;
          full_name?: string;
          role?: DbAdminRole;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          tagline: string;
          image_url: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          tagline?: string;
          image_url?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          tagline?: string;
          image_url?: string;
          display_order?: number;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          sku: string | null;
          price: number;
          original_price: number | null;
          sale_price: number | null;
          description: string;
          silver_purity: string;
          plating: string | null;
          stone: string | null;
          weight: string;
          hallmark: string;
          care_notes: string[];
          has_variants: boolean;
          is_active: boolean;
          is_featured: boolean;
          is_best_seller: boolean;
          is_new_arrival: boolean;
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          sku?: string | null;
          price: number;
          original_price?: number | null;
          sale_price?: number | null;
          description?: string;
          silver_purity?: string;
          plating?: string | null;
          stone?: string | null;
          weight?: string;
          hallmark?: string;
          care_notes?: string[];
          has_variants?: boolean;
          is_active?: boolean;
          is_featured?: boolean;
          is_best_seller?: boolean;
          is_new_arrival?: boolean;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          name?: string;
          slug?: string;
          sku?: string | null;
          price?: number;
          original_price?: number | null;
          sale_price?: number | null;
          description?: string;
          silver_purity?: string;
          plating?: string | null;
          stone?: string | null;
          weight?: string;
          hallmark?: string;
          care_notes?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          is_best_seller?: boolean;
          is_new_arrival?: boolean;
          rating?: number;
          review_count?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          }
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          storage_path: string | null;
          alt_text: string;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          storage_path?: string | null;
          alt_text?: string;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          image_url?: string;
          storage_path?: string | null;
          alt_text?: string;
          is_primary?: boolean;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string | null;
          size_label: string | null;
          color_label: string | null;
          price: number | null;
          stock: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          stock_quantity: number;
          low_stock_threshold: number;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'inventory_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: true;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      customers: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string;
          city: string;
          address: string;
          postal_code: string;
          total_orders: number;
          total_spent: number;
          status: DbCustomerStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          phone?: string;
          city?: string;
          address?: string;
          postal_code?: string;
          total_orders?: number;
          total_spent?: number;
          status?: DbCustomerStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          name?: string;
          email?: string;
          phone?: string;
          city?: string;
          address?: string;
          postal_code?: string;
          total_orders?: number;
          total_spent?: number;
          status?: DbCustomerStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          user_id: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address: string;
          city: string;
          postal_code: string;
          payment_method: DbPaymentMethod;
          payment_status: DbPaymentStatus;
          order_status: DbOrderStatus;
          coupon_code: string | null;
          subtotal: number;
          shipping_cost: number;
          discount_amount: number;
          total_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: {
          payment_status?: DbPaymentStatus;
          order_status?: DbOrderStatus;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string | null;
          product_name: string;
          product_sku: string | null;
          variant_snapshot: string | null;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          }
        ];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: DbCouponDiscountType;
          discount_value: number;
          min_order_amount: number;
          expiry_date: string;
          status: DbCouponStatus;
          usage_count: number;
          usage_limit: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: DbCouponDiscountType;
          discount_value: number;
          min_order_amount?: number;
          expiry_date: string;
          status?: DbCouponStatus;
          usage_count?: number;
          usage_limit?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          discount_type?: DbCouponDiscountType;
          discount_value?: number;
          min_order_amount?: number;
          expiry_date?: string;
          status?: DbCouponStatus;
          usage_limit?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      store_settings: {
        Row: {
          id: boolean;
          store_name: string;
          store_email: string;
          contact_phone: string;
          store_address: string;
          currency: string;
          currency_symbol: string;
          standard_shipping_charge: number;
          free_shipping_threshold: number;
          low_stock_threshold: number;
          updated_at: string;
        };
        Insert: never;
        Update: {
          store_name?: string;
          store_email?: string;
          contact_phone?: string;
          store_address?: string;
          currency?: string;
          currency_symbol?: string;
          standard_shipping_charge?: number;
          free_shipping_threshold?: number;
          low_stock_threshold?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      homepage_content: {
        Row: {
          id: boolean;
          hero_subtitle: string;
          hero_title: string;
          hero_title_italic: string;
          hero_description: string;
          hero_image_url: string;
          hero_cta_text: string;
          hero_secondary_cta_text: string;
          announcement_text: string;
          announcement_delivery_threshold: number;
          society_discount_code: string;
          about_text: string;
          contact_address: string;
          contact_whatsapp: string;
          contact_email: string;
          visiting_hours: string;
          updated_at: string;
        };
        Insert: never;
        Update: {
          hero_subtitle?: string;
          hero_title?: string;
          hero_title_italic?: string;
          hero_description?: string;
          hero_image_url?: string;
          hero_cta_text?: string;
          hero_secondary_cta_text?: string;
          announcement_text?: string;
          announcement_delivery_threshold?: number;
          society_discount_code?: string;
          about_text?: string;
          contact_address?: string;
          contact_whatsapp?: string;
          contact_email?: string;
          visiting_hours?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      promotional_banners: {
        Row: {
          id: string;
          title: string;
          subtitle: string;
          cta_text: string;
          cta_link: string;
          image_url: string;
          placement: DbBannerPlacement;
          is_active: boolean;
          sort_order: number;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string;
          cta_text?: string;
          cta_link?: string;
          image_url?: string;
          placement?: DbBannerPlacement;
          is_active?: boolean;
          sort_order?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          subtitle?: string;
          cta_text?: string;
          cta_link?: string;
          image_url?: string;
          placement?: DbBannerPlacement;
          is_active?: boolean;
          sort_order?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      admin_create_product_variant: {
        Args: {
          p_product_id: string;
          p_size_label?: string | null;
          p_color_label?: string | null;
          p_sku?: string | null;
          p_price?: number | null;
          p_stock?: number;
          p_is_active?: boolean;
          p_sort_order?: number;
        };
        Returns: Database['public']['Tables']['product_variants']['Row'];
      };
      admin_update_product_variant: {
        Args: {
          p_variant_id: string;
          p_product_id?: string | null;
          p_size_label?: string | null;
          p_clear_size_label?: boolean;
          p_color_label?: string | null;
          p_clear_color_label?: boolean;
          p_sku?: string | null;
          p_clear_sku?: boolean;
          p_price?: number | null;
          p_clear_price?: boolean;
          p_stock?: number | null;
          p_is_active?: boolean | null;
          p_sort_order?: number | null;
        };
        Returns: Database['public']['Tables']['product_variants']['Row'];
      };
      admin_delete_product_variant: {
        Args: {
          p_variant_id: string;
        };
        Returns: boolean;
      };
      admin_set_product_inventory: {
        Args: {
          p_product_id: string;
          p_stock_quantity?: number | null;
          p_low_stock_threshold?: number | null;
        };
        Returns: Database['public']['Tables']['inventory']['Row'];
      };
      validate_coupon: {
        Args: {
          p_code: string;
          p_subtotal: number;
        };
        Returns: Json;
      };
      place_storefront_order: {
        Args: {
          p_customer_name: string;
          p_customer_email: string;
          p_customer_phone: string;
          p_shipping_address: string;
          p_city: string;
          p_postal_code?: string;
          p_payment_method?: string;
          p_coupon_code?: string | null;
          p_notes?: string | null;
          p_items?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
