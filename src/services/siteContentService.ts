import { getSupabaseClient, supabase } from '../lib/supabase';
import { HERO_IMAGE } from '../data/products';
import type {
  BannerPlacement,
  PromotionalBanner,
  StoreSettings,
  WebsiteContent,
} from '../types';
import type { Database } from '../types/database';
import {
  extractStoragePathFromUrl,
  removeMediaImages,
  uploadMediaImage,
} from './storageService';

type HomepageContentRow = Database['public']['Tables']['homepage_content']['Row'];
type PromotionalBannerRow = Database['public']['Tables']['promotional_banners']['Row'];
type StoreSettingsRow = Database['public']['Tables']['store_settings']['Row'];

export const DEFAULT_WEBSITE_CONTENT: WebsiteContent = {
  heroSubtitle: '925 Sterling Silver Atelier',
  heroTitle: 'Pure Silver, Timeless Allure.',
  heroTitleItalic: '',
  heroDescription:
    'Sculpted from certified 925 sterling silver and finished with mirror rhodium plating. Designed for effortless modern living, from Karachi evenings to everyday rituals.',
  heroImage: HERO_IMAGE,
  heroCtaText: 'Shop Collection',
  heroSecondaryCtaText: 'Bridal & Gift Sets',
  announcementText:
    'Complimentary Insured Courier Delivery Across Pakistan on Orders Over PKR 5,000',
  announcementDeliveryThreshold: 5000,
  societyDiscountCode: 'AURA10',
  aboutText:
    'Silver Aura was conceived to revive true artisanal fine silver. In a market flooded with brass, low-grade alloys, and fleeting costume jewelry, we craft exclusively in solid 925 sterling silver — 92.5% pure elemental silver paired with 7.5% strengthened copper for timeless heirloom durability.',
  brandStorySnippet:
    'Silver Aura was conceived to revive true artisanal fine silver. In a market flooded with brass, low-grade alloys, and fleeting costume jewelry, we craft exclusively in solid 925 sterling silver — 92.5% pure elemental silver paired with 7.5% strengthened copper for timeless heirloom durability.',
  contactAddress:
    'Suite 402, Executive Tower, Marine Drive, Clifton Block 4, Karachi, Pakistan.',
  atelierAddress:
    'Suite 402, Executive Tower, Marine Drive, Clifton Block 4, Karachi, Pakistan.',
  contactWhatsApp: '+92 300 8291925',
  conciergePhone: '+92 300 8291925',
  contactEmail: 'concierge@silveraura.pk',
  conciergeEmail: 'concierge@silveraura.pk',
  visitingHours: 'Monday – Saturday: 10:00 AM – 8:00 PM (PKT)',
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Silver Aura',
  storeEmail: 'concierge@silveraura.pk',
  contactEmail: 'concierge@silveraura.pk',
  contactPhone: '+92 300 8291925',
  storeAddress:
    'Suite 402, Executive Tower, Marine Drive, Clifton Block 4, Karachi, Pakistan.',
  currency: 'PKR',
  currencySymbol: 'PKR',
  standardShippingCharge: 250,
  freeShippingThreshold: 5000,
  lowStockThreshold: 5,
  lowStockAlertThreshold: 5,
};

function mapHomepageContentRow(row: HomepageContentRow): WebsiteContent {
  const about = row.about_text || DEFAULT_WEBSITE_CONTENT.aboutText || '';
  const addr = row.contact_address || DEFAULT_WEBSITE_CONTENT.contactAddress || '';
  const phone = row.contact_whatsapp || DEFAULT_WEBSITE_CONTENT.contactWhatsApp || '';
  const email = row.contact_email || DEFAULT_WEBSITE_CONTENT.contactEmail || '';

  return {
    heroSubtitle: row.hero_subtitle || DEFAULT_WEBSITE_CONTENT.heroSubtitle,
    heroTitle: row.hero_title || DEFAULT_WEBSITE_CONTENT.heroTitle,
    heroTitleItalic: row.hero_title_italic ?? '',
    heroDescription: row.hero_description || DEFAULT_WEBSITE_CONTENT.heroDescription,
    heroImage: row.hero_image_url || HERO_IMAGE,
    heroCtaText: row.hero_cta_text || DEFAULT_WEBSITE_CONTENT.heroCtaText,
    heroSecondaryCtaText:
      row.hero_secondary_cta_text ?? DEFAULT_WEBSITE_CONTENT.heroSecondaryCtaText,
    announcementText: row.announcement_text || DEFAULT_WEBSITE_CONTENT.announcementText,
    announcementDeliveryThreshold: row.announcement_delivery_threshold ?? 5000,
    societyDiscountCode: row.society_discount_code ?? 'AURA10',
    aboutText: about,
    brandStorySnippet: about,
    contactAddress: addr,
    atelierAddress: addr,
    contactWhatsApp: phone,
    conciergePhone: phone,
    contactEmail: email,
    conciergeEmail: email,
    visitingHours: row.visiting_hours || DEFAULT_WEBSITE_CONTENT.visitingHours,
    updatedAt: row.updated_at,
  };
}

function mapBannerRow(row: PromotionalBannerRow): PromotionalBanner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    ctaText: row.cta_text,
    ctaLink: row.cta_link,
    imageUrl: row.image_url,
    placement: row.placement,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapStoreSettingsRow(row: StoreSettingsRow): StoreSettings {
  return {
    storeName: row.store_name || DEFAULT_STORE_SETTINGS.storeName,
    storeEmail: row.store_email || DEFAULT_STORE_SETTINGS.storeEmail,
    contactEmail: row.store_email || DEFAULT_STORE_SETTINGS.storeEmail,
    contactPhone: row.contact_phone || DEFAULT_STORE_SETTINGS.contactPhone,
    storeAddress: row.store_address || DEFAULT_STORE_SETTINGS.storeAddress,
    currency: row.currency || 'PKR',
    currencySymbol: row.currency_symbol || row.currency || 'PKR',
    standardShippingCharge: row.standard_shipping_charge ?? 250,
    freeShippingThreshold: row.free_shipping_threshold ?? 5000,
    lowStockThreshold: row.low_stock_threshold ?? 5,
    lowStockAlertThreshold: row.low_stock_threshold ?? 5,
    updatedAt: row.updated_at,
  };
}

export function isBannerCurrentlyScheduled(
  banner: PromotionalBanner,
  nowMs = Date.now()
): boolean {
  if (!banner.isActive) return false;
  if (banner.startsAt) {
    const start = Date.parse(banner.startsAt);
    if (!Number.isNaN(start) && start > nowMs) return false;
  }
  if (banner.endsAt) {
    const end = Date.parse(banner.endsAt);
    if (!Number.isNaN(end) && end < nowMs) return false;
  }
  return true;
}

export interface StorefrontSiteData {
  homepageContent: WebsiteContent;
  promotionalBanners: PromotionalBanner[];
  storeSettings: StoreSettings;
}

/**
 * Fetches public storefront website content, active scheduled promotional banners,
 * and store settings from Supabase. Falls back gracefully only when DB values
 * or environment configuration are absent.
 */
export async function fetchStorefrontSiteData(): Promise<StorefrontSiteData> {
  if (!supabase) {
    return {
      homepageContent: DEFAULT_WEBSITE_CONTENT,
      promotionalBanners: [],
      storeSettings: DEFAULT_STORE_SETTINGS,
    };
  }

  const [homeRes, bannersRes, settingsRes] = await Promise.all([
    supabase
      .from('homepage_content')
      .select(
        'id, hero_subtitle, hero_title, hero_title_italic, hero_description, hero_image_url, hero_cta_text, hero_secondary_cta_text, announcement_text, announcement_delivery_threshold, society_discount_code, about_text, contact_address, contact_whatsapp, contact_email, visiting_hours, updated_at'
      )
      .eq('id', true)
      .maybeSingle(),
    supabase
      .from('promotional_banners')
      .select(
        'id, title, subtitle, cta_text, cta_link, image_url, placement, is_active, sort_order, starts_at, ends_at, created_at, updated_at'
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('store_settings')
      .select(
        'id, store_name, store_email, contact_phone, store_address, currency, currency_symbol, standard_shipping_charge, free_shipping_threshold, low_stock_threshold, updated_at'
      )
      .eq('id', true)
      .maybeSingle(),
  ]);

  if (homeRes.error) {
    throw new Error(`Failed to fetch website content: ${homeRes.error.message}`);
  }
  if (bannersRes.error) {
    throw new Error(`Failed to fetch promotional banners: ${bannersRes.error.message}`);
  }
  if (settingsRes.error) {
    throw new Error(`Failed to fetch store settings: ${settingsRes.error.message}`);
  }

  const nowMs = Date.now();
  const mappedBanners = (bannersRes.data ?? [])
    .map(mapBannerRow)
    .filter((b) => isBannerCurrentlyScheduled(b, nowMs));

  return {
    homepageContent: homeRes.data
      ? mapHomepageContentRow(homeRes.data)
      : DEFAULT_WEBSITE_CONTENT,
    promotionalBanners: mappedBanners,
    storeSettings: settingsRes.data
      ? mapStoreSettingsRow(settingsRes.data)
      : DEFAULT_STORE_SETTINGS,
  };
}

// ----------------------------------------------------------------------------
// Admin Website Content, Promotional Banners & Store Settings Mutations
// ----------------------------------------------------------------------------

export interface AdminHomepageContentInput {
  heroSubtitle: string;
  heroTitle: string;
  heroTitleItalic: string;
  heroDescription: string;
  heroImageUrl: string;
  heroImageFile?: File | null;
  previousHeroImageUrl?: string;
  heroCtaText: string;
  heroSecondaryCtaText: string;
  announcementText: string;
  announcementDeliveryThreshold: number;
  societyDiscountCode: string;
  aboutText: string;
  contactAddress: string;
  contactWhatsApp: string;
  contactEmail: string;
  visitingHours: string;
}

export async function fetchAdminWebsiteContentData(): Promise<{
  homepageContent: WebsiteContent;
  banners: PromotionalBanner[];
}> {
  const client = getSupabaseClient();

  const [homeRes, bannersRes] = await Promise.all([
    client
      .from('homepage_content')
      .select(
        'id, hero_subtitle, hero_title, hero_title_italic, hero_description, hero_image_url, hero_cta_text, hero_secondary_cta_text, announcement_text, announcement_delivery_threshold, society_discount_code, about_text, contact_address, contact_whatsapp, contact_email, visiting_hours, updated_at'
      )
      .eq('id', true)
      .maybeSingle(),
    client
      .from('promotional_banners')
      .select(
        'id, title, subtitle, cta_text, cta_link, image_url, placement, is_active, sort_order, starts_at, ends_at, created_at, updated_at'
      )
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
  ]);

  if (homeRes.error) {
    throw new Error(`Failed to load homepage content: ${homeRes.error.message}`);
  }
  if (bannersRes.error) {
    throw new Error(`Failed to load promotional banners: ${bannersRes.error.message}`);
  }

  return {
    homepageContent: homeRes.data
      ? {
          heroSubtitle: homeRes.data.hero_subtitle,
          heroTitle: homeRes.data.hero_title,
          heroTitleItalic: homeRes.data.hero_title_italic,
          heroDescription: homeRes.data.hero_description,
          heroImage: homeRes.data.hero_image_url,
          heroCtaText: homeRes.data.hero_cta_text,
          heroSecondaryCtaText: homeRes.data.hero_secondary_cta_text,
          announcementText: homeRes.data.announcement_text,
          announcementDeliveryThreshold: homeRes.data.announcement_delivery_threshold,
          societyDiscountCode: homeRes.data.society_discount_code,
          aboutText: homeRes.data.about_text,
          brandStorySnippet: homeRes.data.about_text,
          contactAddress: homeRes.data.contact_address,
          atelierAddress: homeRes.data.contact_address,
          contactWhatsApp: homeRes.data.contact_whatsapp,
          conciergePhone: homeRes.data.contact_whatsapp,
          contactEmail: homeRes.data.contact_email,
          conciergeEmail: homeRes.data.contact_email,
          visitingHours: homeRes.data.visiting_hours,
          updatedAt: homeRes.data.updated_at,
        }
      : DEFAULT_WEBSITE_CONTENT,
    banners: (bannersRes.data ?? []).map(mapBannerRow),
  };
}

export async function updateAdminHomepageContent(
  input: AdminHomepageContentInput
): Promise<WebsiteContent> {
  const client = getSupabaseClient();

  if (!input.heroTitle.trim()) {
    throw new Error('Hero headline title is required.');
  }
  if (!input.announcementText.trim()) {
    throw new Error('Announcement bar message is required.');
  }

  let finalHeroImageUrl = input.heroImageUrl.trim();
  let uploadedStoragePath: string | null = null;

  if (input.heroImageFile) {
    const uploaded = await uploadMediaImage('site', 'hero', input.heroImageFile);
    finalHeroImageUrl = uploaded.publicUrl;
    uploadedStoragePath = uploaded.storagePath;
  }

  const { data, error } = await client
    .from('homepage_content')
    .update({
      hero_subtitle: input.heroSubtitle.trim(),
      hero_title: input.heroTitle.trim(),
      hero_title_italic: input.heroTitleItalic.trim(),
      hero_description: input.heroDescription.trim(),
      hero_image_url: finalHeroImageUrl,
      hero_cta_text: input.heroCtaText.trim() || 'Shop Collection',
      hero_secondary_cta_text: input.heroSecondaryCtaText.trim(),
      announcement_text: input.announcementText.trim(),
      announcement_delivery_threshold: Math.max(
        0,
        Math.round(input.announcementDeliveryThreshold)
      ),
      society_discount_code: input.societyDiscountCode.trim().toUpperCase(),
      about_text: input.aboutText.trim(),
      contact_address: input.contactAddress.trim(),
      contact_whatsapp: input.contactWhatsApp.trim(),
      contact_email: input.contactEmail.trim(),
      visiting_hours: input.visitingHours.trim(),
    })
    .eq('id', true)
    .select()
    .single();

  if (error || !data) {
    if (uploadedStoragePath) {
      await removeMediaImages([uploadedStoragePath]);
    }
    throw new Error(
      `Failed to save website content: ${error?.message || 'Homepage content row not found.'}`
    );
  }

  // Clean up previous hero image in Storage if replaced or removed
  if (
    input.previousHeroImageUrl &&
    input.previousHeroImageUrl !== finalHeroImageUrl
  ) {
    const oldPath = extractStoragePathFromUrl(input.previousHeroImageUrl);
    if (oldPath) {
      await removeMediaImages([oldPath]);
    }
  }

  return mapHomepageContentRow(data);
}

export async function updateAnnouncementTextOnly(
  announcementText: string
): Promise<void> {
  const clean = announcementText.trim();
  if (!clean) {
    throw new Error('Announcement bar text cannot be empty.');
  }
  const client = getSupabaseClient();
  const { error } = await client
    .from('homepage_content')
    .update({ announcement_text: clean })
    .eq('id', true);

  if (error) {
    throw new Error(`Failed to update announcement bar: ${error.message}`);
  }
}

export interface AdminBannerInput {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  imageFile?: File | null;
  placement: BannerPlacement;
  isActive: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
}

export async function createAdminPromotionalBanner(
  input: AdminBannerInput
): Promise<PromotionalBanner> {
  const client = getSupabaseClient();
  const cleanTitle = input.title.trim();
  if (!cleanTitle) {
    throw new Error('Banner title is required.');
  }
  if (input.startsAt && input.endsAt && Date.parse(input.endsAt) < Date.parse(input.startsAt)) {
    throw new Error('Banner end date/time cannot be earlier than start date/time.');
  }

  let finalImageUrl = input.imageUrl.trim();
  let uploadedPath: string | null = null;

  if (input.imageFile) {
    const uploaded = await uploadMediaImage('banners', input.placement, input.imageFile);
    finalImageUrl = uploaded.publicUrl;
    uploadedPath = uploaded.storagePath;
  }

  const { data, error } = await client
    .from('promotional_banners')
    .insert({
      title: cleanTitle,
      subtitle: input.subtitle.trim(),
      cta_text: input.ctaText.trim(),
      cta_link: input.ctaLink.trim(),
      image_url: finalImageUrl,
      placement: input.placement,
      is_active: input.isActive,
      sort_order: Number.isFinite(input.sortOrder) ? Math.round(input.sortOrder) : 0,
      starts_at: input.startsAt || null,
      ends_at: input.endsAt || null,
    })
    .select()
    .single();

  if (error || !data) {
    if (uploadedPath) {
      await removeMediaImages([uploadedPath]);
    }
    throw new Error(
      `Failed to create promotional banner: ${error?.message || 'Unknown error'}`
    );
  }

  return mapBannerRow(data);
}

export async function updateAdminPromotionalBanner(
  bannerId: string,
  input: AdminBannerInput,
  previousImageUrl?: string
): Promise<PromotionalBanner> {
  const client = getSupabaseClient();
  const cleanTitle = input.title.trim();
  if (!cleanTitle) {
    throw new Error('Banner title is required.');
  }
  if (input.startsAt && input.endsAt && Date.parse(input.endsAt) < Date.parse(input.startsAt)) {
    throw new Error('Banner end date/time cannot be earlier than start date/time.');
  }

  let finalImageUrl = input.imageUrl.trim();
  let uploadedPath: string | null = null;

  if (input.imageFile) {
    const uploaded = await uploadMediaImage('banners', input.placement, input.imageFile);
    finalImageUrl = uploaded.publicUrl;
    uploadedPath = uploaded.storagePath;
  }

  const { data, error } = await client
    .from('promotional_banners')
    .update({
      title: cleanTitle,
      subtitle: input.subtitle.trim(),
      cta_text: input.ctaText.trim(),
      cta_link: input.ctaLink.trim(),
      image_url: finalImageUrl,
      placement: input.placement,
      is_active: input.isActive,
      sort_order: Number.isFinite(input.sortOrder) ? Math.round(input.sortOrder) : 0,
      starts_at: input.startsAt || null,
      ends_at: input.endsAt || null,
    })
    .eq('id', bannerId)
    .select()
    .single();

  if (error || !data) {
    if (uploadedPath) {
      await removeMediaImages([uploadedPath]);
    }
    throw new Error(
      `Failed to update promotional banner: ${error?.message || 'Unknown error'}`
    );
  }

  if (previousImageUrl && previousImageUrl !== finalImageUrl) {
    const oldPath = extractStoragePathFromUrl(previousImageUrl);
    if (oldPath) {
      await removeMediaImages([oldPath]);
    }
  }

  return mapBannerRow(data);
}

export async function toggleAdminPromotionalBannerStatus(
  bannerId: string,
  isActive: boolean
): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from('promotional_banners')
    .update({ is_active: isActive })
    .eq('id', bannerId);

  if (error) {
    throw new Error(`Failed to update banner status: ${error.message}`);
  }
}

export async function deleteAdminPromotionalBanner(
  bannerId: string,
  imageUrl?: string
): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from('promotional_banners')
    .delete()
    .eq('id', bannerId);

  if (error) {
    throw new Error(`Failed to delete promotional banner: ${error.message}`);
  }

  if (imageUrl) {
    const path = extractStoragePathFromUrl(imageUrl);
    if (path) {
      await removeMediaImages([path]);
    }
  }
}

export interface AdminStoreSettingsInput {
  storeName: string;
  storeEmail: string;
  contactPhone: string;
  storeAddress: string;
  currency: string;
  currencySymbol: string;
  standardShippingCharge: number;
  freeShippingThreshold: number;
  lowStockThreshold: number;
}

export async function fetchAdminStoreSettingsData(): Promise<{
  settings: StoreSettings;
  announcementText: string;
}> {
  const client = getSupabaseClient();

  const [settingsRes, homeRes] = await Promise.all([
    client
      .from('store_settings')
      .select(
        'id, store_name, store_email, contact_phone, store_address, currency, currency_symbol, standard_shipping_charge, free_shipping_threshold, low_stock_threshold, updated_at'
      )
      .eq('id', true)
      .maybeSingle(),
    client
      .from('homepage_content')
      .select('announcement_text')
      .eq('id', true)
      .maybeSingle(),
  ]);

  if (settingsRes.error) {
    throw new Error(`Failed to fetch store settings: ${settingsRes.error.message}`);
  }
  if (homeRes.error) {
    throw new Error(`Failed to fetch announcement bar setting: ${homeRes.error.message}`);
  }

  return {
    settings: settingsRes.data
      ? mapStoreSettingsRow(settingsRes.data)
      : DEFAULT_STORE_SETTINGS,
    announcementText:
      homeRes.data?.announcement_text ?? DEFAULT_WEBSITE_CONTENT.announcementText,
  };
}

export async function updateAdminStoreSettings(
  input: AdminStoreSettingsInput
): Promise<StoreSettings> {
  if (!input.storeName.trim()) {
    throw new Error('Store name is required.');
  }
  if (!input.storeEmail.trim() || !input.storeEmail.includes('@')) {
    throw new Error('Please provide a valid store support email.');
  }
  if (!input.contactPhone.trim()) {
    throw new Error('Contact phone number is required.');
  }
  if (!input.currency.trim()) {
    throw new Error('Currency code is required.');
  }
  if (!Number.isFinite(input.standardShippingCharge) || input.standardShippingCharge < 0) {
    throw new Error('Standard shipping charge cannot be negative.');
  }
  if (!Number.isFinite(input.freeShippingThreshold) || input.freeShippingThreshold < 0) {
    throw new Error('Free shipping threshold cannot be negative.');
  }
  if (!Number.isInteger(input.lowStockThreshold) || input.lowStockThreshold < 1) {
    throw new Error('Low-stock alert threshold must be a whole number of at least 1.');
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from('store_settings')
    .update({
      store_name: input.storeName.trim(),
      store_email: input.storeEmail.trim(),
      contact_phone: input.contactPhone.trim(),
      store_address: input.storeAddress.trim(),
      currency: input.currency.trim().toUpperCase(),
      currency_symbol: (input.currencySymbol || input.currency).trim().toUpperCase(),
      standard_shipping_charge: Math.round(input.standardShippingCharge),
      free_shipping_threshold: Math.round(input.freeShippingThreshold),
      low_stock_threshold: input.lowStockThreshold,
    })
    .eq('id', true)
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to save store settings: ${error?.message || 'Store settings row not found.'}`
    );
  }

  return mapStoreSettingsRow(data);
}
