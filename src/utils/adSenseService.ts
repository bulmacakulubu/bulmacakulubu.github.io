/**
 * Google AdSense & H5 Game Ads Integration Service
 */

export const ADSENSE_CONFIG = {
  // Replace with your Google AdSense Publisher Client ID (e.g. 'ca-pub-1234567890123456')
  client: import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX',
  bottomBannerSlot: import.meta.env.VITE_ADSENSE_BANNER_SLOT || '1234567890',
  testMode: import.meta.env.DEV,
};

declare global {
  interface Window {
    adsbygoogle?: any[];
    adBreak?: (options: any) => void;
    adConfig?: (options: any) => void;
  }
}

/**
 * Trigger an H5 Game AdBreak (e.g. between game sessions or for rewards)
 */
export function triggerAdBreak(options: {
  type: 'start' | 'pause' | 'next' | 'browse' | 'reward';
  name?: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  adBreakDone?: (placementInfo: any) => void;
}): void {
  if (typeof window !== 'undefined' && typeof window.adBreak === 'function') {
    window.adBreak(options);
  } else {
    // If adBreak is not defined (AdBlock or not approved yet), run callbacks directly
    options.beforeAd?.();
    options.afterAd?.();
    options.adBreakDone?.({ breakStatus: 'not_ready' });
  }
}

/**
 * Safe initializer for in-page Google AdSense push
 */
export function pushAdSense(): void {
  try {
    if (typeof window !== 'undefined') {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    }
  } catch (e) {
    // AdSense already loaded or ad blocker active
  }
}

