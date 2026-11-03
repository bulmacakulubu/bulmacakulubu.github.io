import React, { useState } from 'react';
import { X, Crown, Check, ShieldCheck, Sparkles, Zap, RefreshCw, CreditCard, ExternalLink } from 'lucide-react';
import { UserProfile } from '../types';
import {
  purchaseRemoveAds,
  restorePurchases,
  setLocalPremiumStatus,
  REVENUECAT_CONFIG,
} from '../utils/revenueCat';
import { openShopierCheckout, SHOPIER_CONFIG } from '../utils/shopier';
import confetti from 'canvas-confetti';

interface RemoveAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  language?: 'tr' | 'en';
}

export const RemoveAdsModal: React.FC<RemoveAdsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  language = 'tr',
}) => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const isTr = language === 'tr';

  if (!isOpen) return null;

  const isAlreadyVip = Boolean(currentUser.isPremium);

  const handlePurchase = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await purchaseRemoveAds(currentUser);
      if (res.success) {
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
        const updated: UserProfile = { ...currentUser, isPremium: true };
        onUpdateUser(updated);
        setStatusMessage(res.message || (isTr ? 'VIP üyeliğiniz aktifleşti!' : 'VIP unlocked!'));
      } else {
        setStatusMessage(res.message || (isTr ? 'İşlem başarısız oldu.' : 'Failed.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await restorePurchases(currentUser);
      if (res.isPremium) {
        const updated: UserProfile = { ...currentUser, isPremium: true };
        onUpdateUser(updated);
        confetti({ particleCount: 80, spread: 70 });
      }
      setStatusMessage(res.message || '');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTestMode = () => {
    const nextState = !isAlreadyVip;
    setLocalPremiumStatus(nextState);
    onUpdateUser({ ...currentUser, isPremium: nextState });
    if (nextState) {
      confetti({ particleCount: 70 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border-2 border-amber-500/30 rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Glow ambient background decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          <X size={18} />
        </button>

        {/* Header with Crown Icon */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3 animate-bounce">
            <Crown size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            {isTr ? 'Reklamları Kaldır & VIP Kulüp' : 'Remove Ads & VIP Club'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
            {isTr
              ? 'Tek seferlik ödeme ile tüm reklamlardan kurtulun ve ayrıcalıkların tadını çıkarın.'
              : 'Enjoy an ad-free experience with exclusive VIP puzzle privileges.'}
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-2.5 my-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check size={12} strokeWidth={3} />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {isTr ? 'Sıfır Reklam (Banner & Geçiş Yok)' : 'Zero Ads (No Banners & Interstitials)'}
              </span>
              <p className="text-[11px] text-gray-500">
                {isTr ? 'Alt banner alanı ve tüm reklamlar anında gizlenir.' : 'Clean screen with zero interruptions.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Zap size={12} strokeWidth={3} />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {isTr ? 'Sınırsız İpucu & Çözüm Geçmişi' : 'Unlimited Hints & Analysis'}
              </span>
              <p className="text-[11px] text-gray-500">
                {isTr ? 'Zorlandığınız bulmacalarda beklemeden ipucu alın.' : 'Instant hint access without cooldowns.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Crown size={12} strokeWidth={3} />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {isTr ? 'Altın VIP Oyuncu Rozeti' : 'Gold VIP Badge'}
              </span>
              <p className="text-[11px] text-gray-500">
                {isTr ? 'Profilinizde ve çok oyunculu düellolarda VIP görünüm.' : 'Stand out with a royal golden crown.'}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-2">
          {statusMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold text-center animate-fade-in">
              {statusMessage}
            </div>
          )}

          {isAlreadyVip ? (
            <div className="w-full py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
              <ShieldCheck size={18} />
              <span>{isTr ? 'VIP Üyeliğiniz Zaten Aktif 👑' : 'VIP Membership Active 👑'}</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Primary: Shopier Secure Payment */}
              <button
                onClick={() => {
                  openShopierCheckout(currentUser);
                  setStatusMessage(
                    isTr
                      ? 'Shopier ödeme sayfası açıldı. Ödemeyi tamamladıktan sonra aşağıdaki "Ödemeyi Onayla" butonuna tıklayabilirsiniz.'
                      : 'Shopier payment page opened.'
                  );
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-amber-500/30 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard size={17} />
                <span>
                  {isTr
                    ? `Shopier ile Güvenli Öde (${SHOPIER_CONFIG.priceText})`
                    : `Pay with Shopier (${SHOPIER_CONFIG.priceText})`}
                </span>
                <ExternalLink size={14} className="opacity-80" />
              </button>

              {/* Supported payment badges */}
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400">
                <span className="px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-gray-50 dark:bg-gray-800">
                  Kredi Kartı
                </span>
                <span className="px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-gray-50 dark:bg-gray-800">
                  Banka Kartı
                </span>
                <span className="px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-gray-50 dark:bg-gray-800">
                  Troy
                </span>
                <span className="px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-gray-50 dark:bg-gray-800">
                  Havale / EFT
                </span>
              </div>

              {/* Manual Confirmation after payment */}
              <button
                onClick={() => {
                  setLocalPremiumStatus(true);
                  onUpdateUser({ ...currentUser, isPremium: true });
                  confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
                  setStatusMessage(isTr ? 'Tebrikler! VIP üyeliğiniz başarıyla onaylandı.' : 'VIP Activated!');
                }}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl border border-[var(--border-color)] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check size={14} className="text-emerald-500" />
                <span>{isTr ? 'Ödemeyi Tamamladım • VIP\'yi Aktifleştir' : 'I Paid • Activate VIP'}</span>
              </button>
            </div>
          )}

          {/* Secondary Actions */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 mt-3 px-1">
            <button
              onClick={handleRestore}
              disabled={loading}
              className="hover:text-gray-700 dark:hover:text-gray-200 transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={11} />
              <span>{isTr ? 'Satın Alımları Geri Yükle' : 'Restore Purchases'}</span>
            </button>

            {/* Developer Test Switch */}
            <button
              onClick={handleToggleTestMode}
              className="text-amber-600/80 dark:text-amber-400/80 hover:underline cursor-pointer"
              title="Test amaçlı anında VIP durumunu değiştirir"
            >
              {isAlreadyVip
                ? (isTr ? '[Test: Reklamı Geri Aç]' : '[Test: Enable Ads]')
                : (isTr ? '[Test: Ücretsiz VIP Ol]' : '[Test: Unlock Free]')}
            </button>
          </div>

          <div className="mt-2 text-center text-[10px] text-gray-400">
            <span>256-Bit SSL Güvenli Ödeme • Shopier Altyapısı</span>
          </div>
        </div>
      </div>
    </div>
  );
};

