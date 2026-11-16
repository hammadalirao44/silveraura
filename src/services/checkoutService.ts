import { supabase, isSupabaseConfigured, supabaseConfigError } from '../lib/supabase';
import type { CartItem, OrderDetails, OrderStatus, Product } from '../types';
import type { DbPaymentMethod, Json } from '../types/database';

export interface ValidatedCouponResult {
  valid: boolean;
  code: string;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number;
  discountAmount: number;
  minOrderAmount: number;
  message: string;
}

export interface PlaceStorefrontOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: DbPaymentMethod;
  couponCode?: string | null;
  notes?: string | null;
  items: CartItem[];
  fallbackSubtotal: number;
  fallbackShipping: number;
  fallbackDiscount: number;
  fallbackTotal: number;
}

export interface CartItemStockStatus {
  liveProduct: Product;
  availableStock: number;
  unitPrice: number;
  isAvailable: boolean;
  issueMessage: string | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNumber(obj: Record<string, unknown>, keys: string[], fallback: number): number {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'number' && Number.isFinite(val)) {
      return val;
    }
    if (typeof val === 'string' && val.trim() !== '' && Number.isFinite(Number(val))) {
      return Number(val);
    }
  }
  return fallback;
}

function readString(obj: Record<string, unknown>, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'string' && val.trim() !== '') {
      return val.trim();
    }
  }
  return fallback;
}

function normalizeRpcErrorMessage(rawMessage: string | undefined, fallback: string): string {
  if (!rawMessage || !rawMessage.trim()) return fallback;
  const cleaned = rawMessage
    .replace(/^ERROR:\s*/i, '')
    .replace(/^P0001:\s*/i, '')
    .trim();
  return cleaned || fallback;
}

export function getCartItemStockStatus(
  item: CartItem,
  liveProducts: Product[],
  catalogLoaded: boolean
): CartItemStockStatus {
  const matchedProduct = liveProducts.find((p) => p.id === item.product.id);

  if (catalogLoaded && !matchedProduct) {
    return {
      liveProduct: item.product,
      availableStock: 0,
      unitPrice: item.selectedPrice ?? item.product.price,
      isAvailable: false,
      issueMessage: 'This creation is no longer available in our catalog.',
    };
  }

  const product = matchedProduct ?? item.product;
  const activeVariants = (product.productVariants ?? []).filter((v) => v.isActive);

  if (product.hasVariants || activeVariants.length > 0) {
    if (!item.variantId) {
      return {
        liveProduct: product,
        availableStock: 0,
        unitPrice: item.selectedPrice ?? product.price,
        isAvailable: false,
        issueMessage: 'Please remove this item and select a size/option.',
      };
    }

    const matchedVariant = activeVariants.find((v) => v.id === item.variantId);
    if (!matchedVariant) {
      return {
        liveProduct: product,
        availableStock: 0,
        unitPrice: item.selectedPrice ?? product.price,
        isAvailable: false,
        issueMessage: 'Selected option is no longer available.',
      };
    }

    const variantStock = Math.max(0, matchedVariant.stock);
    const unitPrice = matchedVariant.price ?? product.price;

    if (variantStock <= 0) {
      return {
        liveProduct: product,
        availableStock: 0,
        unitPrice,
        isAvailable: false,
        issueMessage: 'Selected option is currently out of stock.',
      };
    }

    if (item.quantity > variantStock) {
      return {
        liveProduct: product,
        availableStock: variantStock,
        unitPrice,
        isAvailable: false,
        issueMessage: `Only ${variantStock} left in stock for this option.`,
      };
    }

    return {
      liveProduct: product,
      availableStock: variantStock,
      unitPrice,
      isAvailable: true,
      issueMessage: null,
    };
  }

  const masterStock = Math.max(0, product.stockCount);
  const unitPrice = product.price;

  if (!product.inStock || masterStock <= 0) {
    return {
      liveProduct: product,
      availableStock: 0,
      unitPrice,
      isAvailable: false,
      issueMessage: 'Currently out of stock.',
    };
  }

  if (item.quantity > masterStock) {
    return {
      liveProduct: product,
      availableStock: masterStock,
      unitPrice,
      isAvailable: false,
      issueMessage: `Only ${masterStock} piece${masterStock === 1 ? '' : 's'} currently available.`,
    };
  }

  return {
    liveProduct: product,
    availableStock: masterStock,
    unitPrice,
    isAvailable: true,
    issueMessage: null,
  };
}

export async function validateCouponRpc(
  code: string,
  subtotal: number
): Promise<ValidatedCouponResult> {
  const normalizedCode = code.trim().toUpperCase();
  const safeSubtotal = Math.max(0, Math.round(subtotal));

  if (!normalizedCode) {
    return {
      valid: false,
      code: '',
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
      minOrderAmount: 0,
      message: 'Please enter a coupon code.',
    };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      valid: false,
      code: normalizedCode,
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
      minOrderAmount: 0,
      message:
        supabaseConfigError ||
        'Coupon verification requires a live Supabase connection.',
    };
  }

  const { data, error } = await supabase.rpc('validate_coupon', {
    p_code: normalizedCode,
    p_subtotal: safeSubtotal,
  });

  if (error) {
    return {
      valid: false,
      code: normalizedCode,
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
      minOrderAmount: 0,
      message: normalizeRpcErrorMessage(
        error.message,
        'Unable to validate coupon code at this time.'
      ),
    };
  }

  if (!isJsonRecord(data)) {
    return {
      valid: false,
      code: normalizedCode,
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
      minOrderAmount: 0,
      message: 'Unexpected response while validating coupon.',
    };
  }

  const isExplicitlyInvalid = data.valid === false;
  const resolvedCode = readString(data, ['code', 'coupon_code'], normalizedCode).toUpperCase();
  const rawType = readString(data, ['discount_type', 'type'], '');
  const discountType: 'percentage' | 'fixed' | null =
    rawType === 'percentage' || rawType === 'fixed' ? rawType : null;
  const discountValue = readNumber(data, ['discount_value', 'value'], 0);
  const minOrderAmount = readNumber(data, ['min_order_amount', 'minOrderAmount'], 0);

  let discountAmount = readNumber(
    data,
    ['discount_amount', 'discountAmount', 'discount'],
    -1
  );
  if (discountAmount < 0 && !isExplicitlyInvalid && discountType) {
    discountAmount =
      discountType === 'percentage'
        ? Math.round((safeSubtotal * discountValue) / 100)
        : Math.round(discountValue);
  }
  discountAmount = Math.max(0, Math.min(safeSubtotal, Math.round(discountAmount < 0 ? 0 : discountAmount)));

  if (isExplicitlyInvalid || (discountAmount <= 0 && data.valid !== true)) {
    const serverMsg = readString(
      data,
      ['message', 'error', 'reason'],
      'This coupon code is invalid, inactive, expired, or has reached its usage limit.'
    );
    return {
      valid: false,
      code: resolvedCode,
      discountType,
      discountValue,
      discountAmount: 0,
      minOrderAmount,
      message: serverMsg,
    };
  }

  const defaultSuccessMsg =
    discountType === 'percentage'
      ? `${resolvedCode} applied (${discountValue}% privilege discount).`
      : `${resolvedCode} applied (PKR ${discountAmount.toLocaleString()} off).`;

  const successMessage = readString(data, ['message'], defaultSuccessMsg);

  return {
    valid: true,
    code: resolvedCode,
    discountType,
    discountValue,
    discountAmount,
    minOrderAmount,
    message: successMessage,
  };
}

export async function placeStorefrontOrderRpc(
  input: PlaceStorefrontOrderInput
): Promise<OrderDetails> {
  const customerName = input.customerName.trim();
  const customerEmail = input.customerEmail.trim().toLowerCase();
  const customerPhone = input.customerPhone.trim();
  const shippingAddress = input.shippingAddress.trim();
  const city = input.city.trim();
  const postalCode = input.postalCode.trim();
  const notes = input.notes?.trim() ? input.notes.trim() : null;
  const couponCode = input.couponCode?.trim()
    ? input.couponCode.trim().toUpperCase()
    : null;

  if (customerName.length < 2) {
    throw new Error('Please enter your full name.');
  }
  if (!EMAIL_REGEX.test(customerEmail)) {
    throw new Error('Please enter a valid email address for your order confirmation.');
  }
  const phoneDigits = customerPhone.replace(/\D/g, '');
  if (phoneDigits.length < 7) {
    throw new Error('Please enter a valid mobile or WhatsApp number.');
  }
  if (shippingAddress.length < 5) {
    throw new Error('Please enter a complete street delivery address.');
  }
  if (!city) {
    throw new Error('Please select or enter your delivery city.');
  }
  if (!['cod', 'bank_transfer', 'card'].includes(input.paymentMethod)) {
    throw new Error('Please choose a valid payment method.');
  }
  if (!input.items || input.items.length === 0) {
    throw new Error('Your jewellery bag is empty.');
  }

  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`Invalid quantity selected for ${item.product.name}.`);
    }
  }

  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      supabaseConfigError ||
        'Order placement requires a configured Supabase connection.'
    );
  }

  const rpcItems = input.items.map((item) => ({
    product_id: item.product.id,
    variant_id: item.variantId ?? null,
    quantity: item.quantity,
  }));

  const { data, error } = await supabase.rpc('place_storefront_order', {
    p_customer_name: customerName,
    p_customer_email: customerEmail,
    p_customer_phone: customerPhone,
    p_shipping_address: shippingAddress,
    p_city: city,
    p_postal_code: postalCode,
    p_payment_method: input.paymentMethod,
    p_coupon_code: couponCode,
    p_notes: notes,
    p_items: rpcItems as unknown as Json,
  });

  if (error) {
    throw new Error(
      normalizeRpcErrorMessage(
        error.message,
        'We could not complete your order. Please review your details and try again.'
      )
    );
  }

  const payload = isJsonRecord(data) ? data : {};
  const orderNumber = readString(
    payload,
    ['order_number', 'orderNumber', 'reference', 'order_id', 'id'],
    ''
  );

  if (!orderNumber) {
    throw new Error(
      'Order response from server was incomplete. Please contact our concierge if charges appear.'
    );
  }

  const subtotal = readNumber(payload, ['subtotal'], input.fallbackSubtotal);
  const shipping = readNumber(payload, ['shipping_cost', 'shipping'], input.fallbackShipping);
  const discount = readNumber(payload, ['discount_amount', 'discount'], input.fallbackDiscount);
  const total = readNumber(
    payload,
    ['total_amount', 'total'],
    Math.max(0, subtotal - discount + shipping)
  );

  const rawStatus = readString(payload, ['order_status', 'status'], 'Pending');
  const validStatuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];
  const orderStatus: OrderStatus = validStatuses.includes(rawStatus as OrderStatus)
    ? (rawStatus as OrderStatus)
    : 'Pending';

  const createdIso = readString(payload, ['created_at'], new Date().toISOString());
  const formattedDate = new Date(createdIso).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    orderId: orderNumber,
    customerName,
    email: customerEmail,
    phone: customerPhone,
    address: shippingAddress,
    city,
    postalCode,
    paymentMethod: input.paymentMethod,
    notes: notes ?? undefined,
    items: [...input.items],
    subtotal,
    shipping,
    discount,
    total,
    date: formattedDate,
    status: orderStatus,
  };
}
