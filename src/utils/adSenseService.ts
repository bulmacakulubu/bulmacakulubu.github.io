/**
 * Google AdSense & H5 Game Ads Integration Service
 */

export const ADSENSE_CONFIG = {
  client: import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-1086062430851863',
  bottomBannerSlot: import.meta.env.VITE_ADSENSE_BANNER_SLOT || '7980516963',
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
 * Uses safety timeout fallback so hint/rewards NEVER get stuck if adBreak is blocked or pending.
 */
export function triggerAdBreak(options: {
  type: 'start' | 'pause' | 'next' | 'browse' | 'reward';
  name?: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  adBreakDone?: (placementInfo: any) => void;
}): void {
  let done = false;
  const safeDone = (info: any) => {
    if (done) return;
    done = true;
    options.afterAd?.();
    options.adBreakDone?.(info);
  };

  options.beforeAd?.();

  if (typeof window !== 'undefined' && typeof window.adBreak === 'function') {
    try {
      window.adBreak({
        ...options,
        adBreakDone: (placementInfo: any) => safeDone(placementInfo || { breakStatus: 'dismissed' }),
      });
      // Safety timeout fallback: If adBreak hangs or adblock suppresses callback, release after 1.8s
      setTimeout(() => safeDone({ breakStatus: 'timeout_fallback' }), 1800);
    } catch {
      safeDone({ breakStatus: 'error_fallback' });
    }
  } else {
    // If adBreak is not defined (AdBlock, dev mode, or not loaded), trigger immediately
    safeDone({ breakStatus: 'not_ready' });
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
