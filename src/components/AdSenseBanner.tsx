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
      className="w-full shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-md shadow-md z-30 transition-all duration-300 py-1 px-3 flex flex-col items-center justify-center text-center select-none"
      style={{ maxHeight: '68px', minHeight: '52px' }}
    >
      <div className="w-full max-w-3xl flex flex-col items-center justify-center mx-auto">
        {/* Sleek inline top line: Sponsorlu & VIP */}
        <div className="w-full flex items-center justify-between text-[10px] leading-tight text-gray-400 dark:text-gray-500 mb-0.5 max-w-xl px-1">
          <span className="font-bold uppercase tracking-wider text-[9px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-[var(--border-color)]">
            {isTr ? 'Sponsorlu Reklam' : 'Sponsored Ad'}
          </span>
          <button
            onClick={onOpenRemoveAds}
            className="flex items-center gap-1 font-bold text-[10px] text-[var(--text-primary)] hover:underline cursor-pointer opacity-80 hover:opacity-100"
          >
            <Crown size={11} className="text-[var(--text-primary)]" />
            <span>{isTr ? 'Reklamları Kaldır (VIP)' : 'Remove Ads (VIP)'}</span>
          </button>
        </div>

        {/* Ad Container: Strictly 46px height, centered, no vertical overflow */}
        <div className="w-full max-w-xl h-[46px] max-h-[46px] flex items-center justify-center overflow-hidden relative mx-auto">
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{
              display: 'inline-block',
              width: '100%',
              height: '46px',
              maxHeight: '46px',
              textAlign: 'center',
            }}
            data-ad-client={ADSENSE_CONFIG.client}
            {...(hasSlot ? { 'data-ad-slot': ADSENSE_CONFIG.bottomBannerSlot } : {})}
            data-ad-format="horizontal"
          />

          {/* Clean Placeholder while Google AdSense review is pending */}
          {!adLoaded && (
            <div className="absolute inset-0 w-full h-full rounded-lg bg-[var(--bg-secondary)]/50 border border-dashed border-[var(--border-color)] flex items-center justify-center px-3 text-[11px] text-[var(--text-primary)]/70 shadow-2xs pointer-events-none">
              <div className="flex items-center justify-center gap-2 font-medium truncate">
                <Sparkles size={12} className="text-[var(--text-primary)] shrink-0 opacity-70" />
                <span className="truncate">
                  {isTr
                    ? 'Google AdSense Reklam Alanı (ca-pub-1086062430851863)'
                    : 'Google AdSense Ad Space (ca-pub-1086062430851863)'}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]/80 px-1.5 py-0.5 rounded shrink-0">
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

