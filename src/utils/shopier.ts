/**
 * Shopier Ödeme ve VIP Entegrasyon Servisi
 */

import { UserProfile } from '../types';
import { setLocalPremiumStatus } from './revenueCat';

export const SHOPIER_CONFIG = {
  // Shopier panelinizden aldığınız ürün linkini buraya veya .env dosyasına yazabilirsiniz
  // Örn: https://www.shopier.com/ShowProductNew/products.php?id=12345678 veya https://shopier.com/12345678
  productUrl: import.meta.env.VITE_SHOPIER_PRODUCT_URL || 'https://www.shopier.com/',
  priceText: '₺39.99',
};

/**
 * Kullanıcıyı Shopier ödeme sayfasına yönlendirir.
 * Opsiyonel olarak kullanıcının ID'sini veya e-postasını parametre olarak iletir.
 */
export function openShopierCheckout(user: UserProfile): void {
  const url = SHOPIER_CONFIG.productUrl;
  
  if (url && url !== 'https://www.shopier.com/') {
    // Yeni sekmede Shopier ödeme sayfasını aç
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    // Henüz özel link girilmemişse kullanıcıyı genel Shopier sayfasına yönlendir
    window.open('https://www.shopier.com', '_blank');
  }
}

/**
 * Sayfa yüklendiğinde URL'de Shopier başarılı ödeme parametresi var mı kontrol eder
 * Örn: ?vip_success=true veya ?status=success
 */
export function checkUrlForVipActivation(): boolean {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const isSuccess =
    params.get('vip_success') === 'true' ||
    params.get('odeme') === 'basarili' ||
    params.get('status') === 'success';

  if (isSuccess) {
    setLocalPremiumStatus(true);
    // URL'deki parametreyi temizle (sayfa yenilendiğinde tekrar tetiklenmesin)
    const newUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
    return true;
  }

  return false;
}

