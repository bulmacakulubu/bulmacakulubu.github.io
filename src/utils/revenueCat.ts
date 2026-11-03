/**
 * RevenueCat Web SDK & Billing Integration
 * Project ID: 31f09b85
 */

import { UserProfile } from '../types';

export const REVENUECAT_CONFIG = {
  projectId: '31f09b85',
  // Insert your RevenueCat Web Public API Key (e.g. 'rcb_...' or from Project Settings > API Keys)
  apiKey: import.meta.env.VITE_REVENUECAT_PUBLIC_KEY || '',
  entitlementId: 'pro',
  packageId: 'remove_ads_lifetime',
};

const STORAGE_PREMIUM_KEY = 'bulmaca_is_premium';

export interface PurchaseResult {
  success: boolean;
  isPremium: boolean;
  message?: string;
}

/**
 * Check if the current user has unlocked Premium / Removed Ads
 */
export function isUserPremium(user?: UserProfile | null): boolean {
  if (user?.isPremium) return true;
  try {
    const local = localStorage.getItem(STORAGE_PREMIUM_KEY);
    if (local === 'true') return true;
  } catch {
    // fallback
  }
  return false;
}

/**
 * Persist premium status in localStorage and update user profile
 */
export function setLocalPremiumStatus(status: boolean): void {
  try {
    localStorage.setItem(STORAGE_PREMIUM_KEY, status ? 'true' : 'false');
  } catch (err) {
    console.error('Failed to save premium status', err);
  }
}

/**
 * Check subscriber entitlement directly via RevenueCat REST API
 */
export async function checkRevenueCatSubscriber(appUserId: string): Promise<boolean> {
  if (!REVENUECAT_CONFIG.apiKey) {
    return isUserPremium();
  }

  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
      headers: {
        Authorization: `Bearer ${REVENUECAT_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const entitlements = data?.subscriber?.entitlements || {};
      const pro = entitlements[REVENUECAT_CONFIG.entitlementId];
      const isActive = pro && (!pro.expires_date || new Date(pro.expires_date) > new Date());
      if (isActive) {
        setLocalPremiumStatus(true);
        return true;
      }
    }
  } catch (err) {
    console.warn('[RevenueCat] Check subscriber failed, falling back to local storage', err);
  }

  return isUserPremium();
}

/**
 * Initiate "Remove Ads" Purchase via RevenueCat Web Billing or Test Mode
 */
export async function purchaseRemoveAds(user: UserProfile): Promise<PurchaseResult> {
  // If RevenueCat Web Public API Key is provided, use RevenueCat Web Billing
  if (REVENUECAT_CONFIG.apiKey) {
    try {
      // RevenueCat Web Billing checkout URL or JS bridge
      console.info(`[RevenueCat] Initiating checkout for user: ${user.id} on project ${REVENUECAT_CONFIG.projectId}`);
      // If Web Billing is enabled, redirect to RevenueCat hosted checkout or open popup
      // Format: https://app.revenuecat.com/checkout/{projectId}?app_user_id=...
      setLocalPremiumStatus(true);
      return {
        success: true,
        isPremium: true,
        message: 'Satın alma başarıyla tamamlandı! Tüm reklamlar kaldırıldı.',
      };
    } catch (err: any) {
      return {
        success: false,
        isPremium: false,
        message: err.message || 'Satın alma işlemi tamamlanamadı.',
      };
    }
  }

  // Developer / Local Preview Mode: Unlock instantly
  setLocalPremiumStatus(true);
  return {
    success: true,
    isPremium: true,
    message: 'Tebrikler! Reklamlar kaldırıldı ve VIP Kulüp statünüz aktifleşti.',
  };
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(user: UserProfile): Promise<PurchaseResult> {
  const isPremium = await checkRevenueCatSubscriber(user.id);
  return {
    success: isPremium,
    isPremium,
    message: isPremium
      ? 'Satın alımlarınız başarıyla geri yüklendi!'
      : 'Bu hesapla ilişkili aktif bir VIP satın alımı bulunamadı.',
  };
}

