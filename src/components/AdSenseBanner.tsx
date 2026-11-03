import React, { useEffect, useState, useRef } from 'react';
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
  const [adLoaded, setAdLoaded] = useState(false);
  const insRef = useRef<HTMLModElement | null>(null);
  const isTr = language === 'tr';

  useEffect(() => {
    if (!isPremium) {
      pushAdSense();

      // Check if Google AdSense injected an iframe or marked the ad as filled
      const interval = setInterval(() => {
        if (insRef.current) {
          const hasIframe = insRef.current.querySelector('iframe');
          const status = insRef.current.getAttribute('data-ad-status');
          if (hasIframe || status === 'filled') {
            setAdLoaded(true);
            clearInterval(interval);
          }
        }
      }, 1000);

      const timeout = setTimeout(() => clearInterval(interval), 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isPremium]);

  // If user is VIP / Paid to remove ads, never render the banner
  if (isPremium) {
    return null;
  }

  const hasSlot = Boolean(ADSENSE_CONFIG.bottomBannerSlot && ADSENSE_CONFIG.bottomBannerSlot !== '1234567890');

  return (
    <aside 
      aria-label={isTr ? "Sponsorlu Reklam Alanı" : "Sponsored Advertisement"}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-color)] shadow-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center text-center"
    >
      <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-1.5 mx-auto">
        {/* Centered Top Row: Ad Label & Remove Ads CTA */}
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-[var(--border-color)]">
            {isTr ? 'Sponsorlu Reklam' : 'Sponsored Ad'}
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <button
            onClick={onOpenRemoveAds}
            className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            <Crown size={12} className="text-amber-500" />
            <span>{isTr ? 'Reklamları Kaldır (VIP)' : 'Remove Ads (VIP)'}</span>
          </button>
        </div>

        {/* Centered Ad Area: Real AdSense Unit + Smart Fallback */}
        <div className="w-full flex flex-col items-center justify-center min-h-[50px] mx-auto overflow-hidden relative">
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{
              display: 'inline-block',
              width: '100%',
              minHeight: adLoaded ? '50px' : '0px',
              textAlign: 'center',
            }}
            data-ad-client={ADSENSE_CONFIG.client}
            {...(hasSlot ? { 'data-ad-slot': ADSENSE_CONFIG.bottomBannerSlot } : {})}
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />

          {!adLoaded && (
            <div className="w-full h-11 rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/60 border border-dashed border-[var(--border-color)] flex items-center justify-center px-4 text-[11px] text-gray-500 dark:text-gray-400 shadow-2xs">
              <div className="flex items-center justify-center gap-2 font-medium">
                <Sparkles size={13} className="text-amber-500 shrink-0" />
                <span className="truncate">
                  {isTr
                    ? 'Google AdSense Reklam Alanı (ca-pub-1086062430851863)'
                    : 'Google AdSense Ad Space (ca-pub-1086062430851863)'}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded shrink-0">
                  {isTr ? 'Hazırlanıyor' : 'Ready'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

