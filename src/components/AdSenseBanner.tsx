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
      className="w-full shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-md shadow-md z-30 transition-all duration-300 py-1.5 px-3 flex flex-col items-center justify-center text-center select-none"
      style={{ minHeight: '68px' }}
    >
      <div className="w-full max-w-3xl flex flex-col items-center justify-center mx-auto">
        {/* Sleek inline top line: Sponsorlu & VIP */}
        <div className="w-full flex items-center justify-between text-[10px] leading-tight text-[var(--text-secondary)] mb-1 max-w-xl px-1">
          <span className="font-medium text-[10px] bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">
            {isTr ? 'Sponsorlu Reklam' : 'Sponsored Ad'}
          </span>
          <button
            onClick={onOpenRemoveAds}
            className="flex items-center gap-1 font-semibold text-[10px] text-[var(--text-primary)] hover:underline cursor-pointer opacity-80 hover:opacity-100 focus-visible:ring-1 focus-visible:ring-[var(--accent-color)] focus-visible:outline-none"
          >
            <Crown size={11} className="text-[var(--text-primary)]" />
            <span>{isTr ? 'Reklamları Kaldır (VIP)' : 'Remove Ads (VIP)'}</span>
          </button>
        </div>

        {/* Ad Container: Responsive display banner */}
        <div className="w-full max-w-xl min-h-[50px] flex items-center justify-center relative mx-auto">
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%',
              minHeight: '50px',
              textAlign: 'center',
            }}
            data-ad-client={ADSENSE_CONFIG.client}
            data-ad-slot={ADSENSE_CONFIG.bottomBannerSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />

          {/* Clean Placeholder while Google AdSense is loading */}
          {!adLoaded && (
            <div className="absolute inset-0 w-full h-full rounded-lg bg-[var(--bg-secondary)]/30 border border-dashed border-[var(--border-color)]/50 flex items-center justify-center px-3 text-[11px] text-[var(--text-secondary)] pointer-events-none">
              <div className="flex items-center justify-center gap-2 font-medium truncate opacity-60">
                <Sparkles size={12} className="shrink-0" />
                <span className="truncate">
                  {isTr ? 'Sponsorlu Reklam Alanı' : 'Sponsored Ad Space'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

