import { getSupabaseClient } from '../lib/supabase';
import type { AdminCustomer, CustomerStatus } from '../types';
import type { Database } from '../types/database';

type CustomerRow = Database['public']['Tables']['customers']['Row'];

function mapCustomerRow(row: CustomerRow): AdminCustomer {
  return {
    id: row.id,
    isRegistered: Boolean(row.user_id),
    name: row.name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    address: row.address,
    postalCode: row.postal_code,
    totalOrders: row.total_orders,
    totalSpent: row.total_spent,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CustomerDirectoryResult {
  customers: AdminCustomer[];
  profileOnlyIds: Set<string>;
}

/**
 * Loads customers created via checkout (`public.customers`) as well as registered
 * non-admin user profiles (`public.profiles`) who may not have checked out yet,
 * without exposing auth user IDs, credentials, or admin accounts.
 */
export async function fetchAdminCustomers(): Promise<CustomerDirectoryResult> {
  const supabase = getSupabaseClient();

  const [customersRes, profilesRes, adminsRes] = await Promise.all([
    supabase
      .from('customers')
      .select(
        'id, user_id, name, email, phone, city, address, postal_code, total_orders, total_spent, status, created_at, updated_at'
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, full_name, email, phone, city, address, postal_code, created_at, updated_at')
      .order('created_at', { ascending: false }),
    supabase.from('admin_users').select('user_id'),
  ]);

  if (customersRes.error) {
    throw new Error(`Failed to fetch customers: ${customersRes.error.message}`);
  }

  const customerRows = customersRes.data ?? [];
  const mappedCustomers = customerRows.map(mapCustomerRow);
  const profileOnlyIds = new Set<string>();

  if (!profilesRes.error && profilesRes.data) {
    const adminUserIds = new Set((adminsRes.data ?? []).map((a) => a.user_id));
    const linkedUserIds = new Set(
      customerRows.map((c) => c.user_id).filter((uid): uid is string => Boolean(uid))
    );
    const linkedEmails = new Set(
      customerRows.map((c) => c.email.trim().toLowerCase()).filter(Boolean)
    );

    for (const prof of profilesRes.data) {
      if (adminUserIds.has(prof.id)) continue;
      if (linkedUserIds.has(prof.id)) continue;
      if (prof.email && linkedEmails.has(prof.email.trim().toLowerCase())) continue;

      profileOnlyIds.add(prof.id);
      mappedCustomers.push({
        id: prof.id,
        isRegistered: true,
        name: prof.full_name || prof.email || 'Registered Patron',
        email: prof.email,
        phone: prof.phone,
        city: prof.city,
        address: prof.address,
        postalCode: prof.postal_code,
        totalOrders: 0,
        totalSpent: 0,
        status: 'Active',
        createdAt: prof.created_at,
        updatedAt: prof.updated_at,
      });
    }
  }

  mappedCustomers.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    customers: mappedCustomers,
    profileOnlyIds,
  };
}

export async function updateAdminCustomerStatus(
  customerId: string,
  status: CustomerStatus
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('customers')
    .update({ status })
    .eq('id', customerId);

  if (error) {
    throw new Error(`Failed to update customer tier: ${error.message}`);
  }
}
