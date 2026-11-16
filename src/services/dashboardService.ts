import { getSupabaseClient } from '../lib/supabase';
import type {
  BestSellingProductSummary,
  DashboardOverviewData,
  OrderStatus,
  RecentOrderSummary,
} from '../types';

interface OrderItemJoinRow {
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  line_total: number;
  orders: { order_status: OrderStatus } | { order_status: OrderStatus }[] | null;
}

export async function fetchDashboardOverview(): Promise<DashboardOverviewData> {
  const supabase = getSupabaseClient();

  const [productsRes, inventoryRes, categoriesRes, ordersRes, orderItemsRes] = await Promise.all([
    supabase.from('products').select('id, is_active'),
    supabase.from('inventory').select('product_id, stock_quantity, low_stock_threshold'),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select(
        'id, order_number, customer_name, city, total_amount, order_status, payment_status, created_at'
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('order_items')
      .select(
        'order_id, product_id, product_name, product_sku, quantity, line_total, orders!inner(order_status)'
      ),
  ]);

  if (productsRes.error) {
    throw new Error(`Failed to load products overview: ${productsRes.error.message}`);
  }
  if (inventoryRes.error) {
    throw new Error(`Failed to load inventory overview: ${inventoryRes.error.message}`);
  }
  if (categoriesRes.error) {
    throw new Error(`Failed to load categories overview: ${categoriesRes.error.message}`);
  }
  if (ordersRes.error) {
    throw new Error(`Failed to load orders overview: ${ordersRes.error.message}`);
  }
  if (orderItemsRes.error) {
    throw new Error(`Failed to load order items overview: ${orderItemsRes.error.message}`);
  }

  const productRows = productsRes.data ?? [];
  const inventoryRows = inventoryRes.data ?? [];
  const orderRows = ordersRes.data ?? [];
  const itemRows = (orderItemsRes.data ?? []) as unknown as OrderItemJoinRow[];

  const totalProducts = productRows.length;
  const activeProducts = productRows.filter((p) => p.is_active).length;

  const inventoryByProductId = new Map(
    inventoryRows.map((inv) => [inv.product_id, inv])
  );

  let outOfStockProducts = 0;
  let lowStockProducts = 0;

  for (const product of productRows) {
    const inv = inventoryByProductId.get(product.id);
    const qty = inv?.stock_quantity ?? 0;
    const threshold = inv?.low_stock_threshold ?? 5;

    if (qty <= 0) {
      outOfStockProducts += 1;
    } else if (qty <= threshold) {
      lowStockProducts += 1;
    }
  }

  const totalCategories = categoriesRes.count ?? 0;
  const totalOrders = orderRows.length;
  const pendingOrders = orderRows.filter((o) => o.order_status === 'Pending').length;
  const totalRevenue = orderRows
    .filter((o) => o.order_status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total_amount ?? 0), 0);

  const statusBreakdown: Record<OrderStatus, number> = {
    Pending: 0,
    Confirmed: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };

  for (const ord of orderRows) {
    const st = ord.order_status as OrderStatus;
    if (st in statusBreakdown) {
      statusBreakdown[st] += 1;
    }
  }

  const recentOrders: RecentOrderSummary[] = orderRows.slice(0, 8).map((ord) => ({
    id: ord.id,
    orderNumber: ord.order_number,
    customerName: ord.customer_name,
    city: ord.city,
    totalAmount: ord.total_amount,
    orderStatus: ord.order_status,
    paymentStatus: ord.payment_status,
    createdAt: ord.created_at,
  }));

  // Aggregate best-selling products from non-cancelled order_items
  const salesMap = new Map<
    string,
    {
      productId: string;
      productName: string;
      productSku: string | null;
      unitsSold: number;
      revenue: number;
      orderIds: Set<string>;
    }
  >();

  for (const item of itemRows) {
    const joinedOrder = Array.isArray(item.orders) ? item.orders[0] : item.orders;
    if (joinedOrder?.order_status === 'Cancelled') continue;

    const existing = salesMap.get(item.product_id);
    if (existing) {
      existing.unitsSold += item.quantity;
      existing.revenue += item.line_total;
      existing.orderIds.add(item.order_id);
    } else {
      salesMap.set(item.product_id, {
        productId: item.product_id,
        productName: item.product_name,
        productSku: item.product_sku,
        unitsSold: item.quantity,
        revenue: item.line_total,
        orderIds: new Set([item.order_id]),
      });
    }
  }

  const bestSellingProducts: BestSellingProductSummary[] = Array.from(salesMap.values())
    .sort((a, b) => {
      if (b.unitsSold !== a.unitsSold) return b.unitsSold - a.unitsSold;
      return b.revenue - a.revenue;
    })
    .slice(0, 5)
    .map((entry) => ({
      productId: entry.productId,
      productName: entry.productName,
      productSku: entry.productSku,
      unitsSold: entry.unitsSold,
      revenue: entry.revenue,
      orderCount: entry.orderIds.size,
    }));

  return {
    totalProducts,
    activeProducts,
    outOfStockProducts,
    lowStockProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    totalRevenue,
    statusBreakdown,
    recentOrders,
    bestSellingProducts,
    fetchedAt: new Date().toISOString(),
  };
}
