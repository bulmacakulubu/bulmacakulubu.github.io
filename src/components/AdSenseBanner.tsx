import React, { useEffect } from 'react';
import { Sparkles, Crown } from 'lucide-react';
import { ADSENSE_CONFIG, pushAdSense } from '../utils/adSenseService';

interface AdSenseBannerProps {
  isPremium?: boolean;
  onOpenRemoveAds: () => void;
  language?: 'tr' | 'en';
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  isPremium,
  onOpenRemoveAds,
  language = 'tr',
}) => {
  const isTr = language === 'tr';

  useEffect(() => {
    if (!isPremium) {
      pushAdSense();
    }
  }, [isPremium]);

  // If user is VIP / Paid to remove ads, never render the banner
  if (isPremium) {
    return null;
  }

  const isRealClient = ADSENSE_CONFIG.client && !ADSENSE_CONFIG.client.includes('XXXX');

  return (
    <aside 
      aria-label={isTr ? "Sponsorlu Reklam Alanı" : "Sponsored Advertisement"}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-color)] shadow-xl transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-3 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-1.5">
        {/* Left: Ad Label & Remove Ads CTA */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-[var(--border-color)]">
            {isTr ? 'Sponsorlu' : 'Sponsored'}
          </span>
          <button
            onClick={onOpenRemoveAds}
            className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            <Crown size={12} className="text-amber-500" />
            <span>{isTr ? 'Reklamları Kaldır (VIP)' : 'Remove Ads (VIP)'}</span>
          </button>
        </div>

        {/* Center: Real AdSense Unit or Visual Placeholder */}
        <div className="w-full sm:w-auto flex-1 max-w-2xl flex items-center justify-center min-h-[50px] overflow-hidden">
          {isRealClient ? (
            <ins
              className="adsbygoogle"
              style={{ display: 'inline-block', width: '100%', height: '50px' }}
              data-ad-client={ADSENSE_CONFIG.client}
              data-ad-slot={ADSENSE_CONFIG.bottomBannerSlot}
              data-ad-format="horizontal"
              data-full-width-responsive="true"
            />
          ) : (
            <div className="w-full h-10 rounded-xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800/60 dark:via-gray-800 dark:to-gray-800/60 border border-dashed border-[var(--border-color)] flex items-center justify-between px-3 text-[11px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5 font-medium truncate">
                <Sparkles size={13} className="text-amber-500 shrink-0" />
                <span className="truncate">
                  {isTr
                    ? 'Google AdSense Alt Banner Alanı (ca-pub-XXXXXXXXXX ayarlanmaya hazır)'
                    : 'Google AdSense Bottom Banner Area (Ready for ca-pub-XXXXXXXXXX)'}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded shrink-0">
                AdSense
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

