import { AllStats } from '../types';
import { loadStats } from './storage';

/**
 * Device & Usage Statistics Utility
 * Only tracks 100% authentic, local device telemetry stored in the user's browser.
 * Zero simulated, fake, or synthetic numbers.
 */

export interface DeviceStats {
  userVisitCount: number;
  userFirstVisit: string;
  userLastVisit: string;
  totalPlayed: number;
  totalWon: number;
  winRate: number;
}

const STORAGE_KEY_VISIT_DATA = 'bulmaca_kulubu_device_visits_v1';

export function getDeviceStats(statsInput?: AllStats): DeviceStats {
  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  let userVisitCount = 1;
  let userFirstVisit = todayDateStr;
  let userLastVisit = todayDateStr;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_VISIT_DATA);
    if (raw) {
      const parsed = JSON.parse(raw);
      userVisitCount = (parsed.userVisitCount || 0) + 1;
      userFirstVisit = parsed.userFirstVisit || todayDateStr;
      userLastVisit = todayDateStr;
    }
    localStorage.setItem(
      STORAGE_KEY_VISIT_DATA,
      JSON.stringify({
        userVisitCount,
        userFirstVisit,
        userLastVisit,
        lastUpdated: Date.now(),
      })
    );
  } catch {
    // Fallback if localStorage restricted
  }

  const allStats = statsInput || loadStats();
  let totalPlayed = 0;
  let totalWon = 0;

  if (allStats) {
    Object.values(allStats).forEach((game) => {
      if (game) {
        totalPlayed += game.played || 0;
        totalWon += game.won || 0;
      }
    });
  }

  const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

  return {
    userVisitCount,
    userFirstVisit,
    userLastVisit,
    totalPlayed,
    totalWon,
    winRate,
  };
}
