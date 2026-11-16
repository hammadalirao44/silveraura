import { getSupabaseClient } from '../lib/supabase';
import type { AdminCoupon } from '../types';
import type { Database } from '../types/database';

type CouponRow = Database['public']['Tables']['coupons']['Row'];

export interface AdminCouponInput {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  expiryDate: string;
  status: 'Active' | 'Inactive';
  usageLimit: number | null;
}

function mapCouponRow(row: CouponRow): AdminCoupon {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    minOrderAmount: row.min_order_amount,
    expiryDate: row.expiry_date,
    status: row.status,
    usageCount: row.usage_count,
    usageLimit: row.usage_limit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function validateCouponInput(input: AdminCouponInput): string | null {
  const code = normalizeCouponCode(input.code);
  if (!code) {
    return 'Coupon code is required.';
  }
  if (/\s/.test(code)) {
    return 'Coupon code cannot contain spaces.';
  }
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    return 'Coupon code must be 3–32 characters using letters, numbers, hyphens, or underscores.';
  }
  if (!Number.isFinite(input.discountValue) || input.discountValue <= 0) {
    return 'Discount value must be greater than 0.';
  }
  if (input.discountType === 'percentage' && input.discountValue > 100) {
    return 'Percentage discount cannot exceed 100%.';
  }
  if (!Number.isFinite(input.minOrderAmount) || input.minOrderAmount < 0) {
    return 'Minimum order amount cannot be negative.';
  }
  if (!input.expiryDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.expiryDate)) {
    return 'Please select a valid expiry date.';
  }
  if (input.usageLimit !== null) {
    if (!Number.isInteger(input.usageLimit) || input.usageLimit < 1) {
      return 'Usage limit must be empty (unlimited) or a whole number of at least 1.';
    }
  }
  return null;
}

export async function fetchAdminCoupons(): Promise<AdminCoupon[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('coupons')
    .select(
      'id, code, discount_type, discount_value, min_order_amount, expiry_date, status, usage_count, usage_limit, created_at, updated_at'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch coupons: ${error.message}`);
  }

  return (data ?? []).map(mapCouponRow);
}

export async function createAdminCoupon(input: AdminCouponInput): Promise<AdminCoupon> {
  const validationError = validateCouponInput(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = getSupabaseClient();
  const normalizedCode = normalizeCouponCode(input.code);

  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: normalizedCode,
      discount_type: input.discountType,
      discount_value: Math.round(input.discountValue),
      min_order_amount: Math.round(input.minOrderAmount),
      expiry_date: input.expiryDate,
      status: input.status,
      usage_limit: input.usageLimit,
    })
    .select()
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      throw new Error(`A coupon with code "${normalizedCode}" already exists (codes are case-insensitive).`);
    }
    throw new Error(`Failed to create coupon: ${error?.message || 'Unknown error'}`);
  }

  return mapCouponRow(data);
}

export async function updateAdminCoupon(
  couponId: string,
  input: AdminCouponInput
): Promise<AdminCoupon> {
  const validationError = validateCouponInput(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = getSupabaseClient();
  const normalizedCode = normalizeCouponCode(input.code);

  const { data, error } = await supabase
    .from('coupons')
    .update({
      code: normalizedCode,
      discount_type: input.discountType,
      discount_value: Math.round(input.discountValue),
      min_order_amount: Math.round(input.minOrderAmount),
      expiry_date: input.expiryDate,
      status: input.status,
      usage_limit: input.usageLimit,
    })
    .eq('id', couponId)
    .select()
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      throw new Error(`Another coupon already uses code "${normalizedCode}".`);
    }
    throw new Error(`Failed to update coupon: ${error?.message || 'Unknown error'}`);
  }

  return mapCouponRow(data);
}

export async function toggleAdminCouponStatus(
  couponId: string,
  nextStatus: 'Active' | 'Inactive'
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('coupons')
    .update({ status: nextStatus })
    .eq('id', couponId);

  if (error) {
    throw new Error(`Failed to update coupon status: ${error.message}`);
  }
}

export async function deleteAdminCoupon(couponId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('coupons').delete().eq('id', couponId);

  if (error) {
    throw new Error(`Failed to delete coupon: ${error.message}`);
  }
}
