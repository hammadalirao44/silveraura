import { getSupabaseClient } from '../lib/supabase';
import type { AdminOrder, AdminOrderItem, OrderStatus, PaymentStatus } from '../types';
import type { Database } from '../types/database';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

interface OrderQueryRow extends OrderRow {
  order_items: OrderItemRow[] | null;
}

function mapOrderItem(row: OrderItemRow): AdminOrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    variantId: row.variant_id,
    productName: row.product_name,
    productSku: row.product_sku,
    variantSnapshot: row.variant_snapshot,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    lineTotal: row.line_total,
    createdAt: row.created_at,
  };
}

function mapOrder(row: OrderQueryRow): AdminOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address,
    city: row.city,
    postalCode: row.postal_code,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    couponCode: row.coupon_code,
    subtotal: row.subtotal,
    shippingCost: row.shipping_cost,
    discountAmount: row.discount_amount,
    totalAmount: row.total_amount,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: [...(row.order_items ?? [])]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map(mapOrderItem),
  };
}

const ORDER_SELECT = `
  id, order_number, customer_id, user_id, customer_name, customer_email, customer_phone,
  shipping_address, city, postal_code, payment_method, payment_status, order_status,
  coupon_code, subtotal, shipping_cost, discount_amount, total_amount, notes,
  created_at, updated_at,
  order_items(
    id, order_id, product_id, variant_id, product_name, product_sku,
    variant_snapshot, quantity, unit_price, line_total, created_at
  )
`;

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load orders: ${error.message}`);
  }

  return ((data ?? []) as unknown as OrderQueryRow[]).map(mapOrder);
}

export async function updateAdminOrder(
  orderId: string,
  updates: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    notes?: string | null;
  }
): Promise<AdminOrder> {
  const supabase = getSupabaseClient();

  const payload: Database['public']['Tables']['orders']['Update'] = {};
  if (updates.orderStatus !== undefined) {
    payload.order_status = updates.orderStatus;
  }
  if (updates.paymentStatus !== undefined) {
    payload.payment_status = updates.paymentStatus;
  }
  if (updates.notes !== undefined) {
    payload.notes = updates.notes;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', orderId)
    .select(ORDER_SELECT)
    .single();

  if (error || !data) {
    throw new Error(`Failed to update order: ${error?.message || 'Permission denied or order not found'}`);
  }

  return mapOrder(data as unknown as OrderQueryRow);
}

export async function fetchOrdersByCustomer(
  customerId: string,
  customerEmail: string
): Promise<AdminOrder[]> {
  const supabase = getSupabaseClient();

  const normalizedEmail = customerEmail.trim();
  const filterExpr = normalizedEmail
    ? `customer_id.eq.${customerId},customer_email.ilike.${normalizedEmail}`
    : `customer_id.eq.${customerId}`;

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .or(filterExpr)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load customer order history: ${error.message}`);
  }

  return ((data ?? []) as unknown as OrderQueryRow[]).map(mapOrder);
}
