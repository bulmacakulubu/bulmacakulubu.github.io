/**
 * Visitor & Community Analytics Telemetry Utility
 * Computes realistic, consistent daily visitor metrics, total pageviews,
 * live online players, and tracks the user's local visit statistics.
 */

export interface VisitorStats {
  todayVisitors: number;
  totalPageviews: number;
  onlinePlayers: number;
  communitySolvedPuzzles: number;
  userVisitCount: number;
  userFirstVisit: string;
  userLastVisit: string;
  lastUpdated: number;
}

const STORAGE_KEY_VISIT_DATA = 'bulmaca_kulubu_visitor_data_v1';

export function getVisitorStats(): VisitorStats {
  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const [year, month, day] = todayDateStr.split('-').map(Number);

  // Deterministic daily seed based on date so it remains stable throughout the day
  // while scaling realistically
  const dayOfYear = Math.floor((now.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Peak puzzle playing hours: 12:00-14:00 and 19:00-23:00
  const timeWeight = (hour >= 19 && hour <= 23) ? 1.4 : (hour >= 11 && hour <= 14) ? 1.2 : (hour >= 1 && hour <= 6) ? 0.4 : 0.9;

  // Base metrics
  const baseDailyVisitors = 1840 + (dayOfYear * 7) % 430;
  // Progress throughout the day
  const dailyProgress = Math.min(1, Math.max(0.08, (hour * 60 + minute) / 1440));
  const currentDailyVisitors = Math.floor(baseDailyVisitors * dailyProgress * (0.95 + ((minute % 7) * 0.01)));

  // Online active players right now (between 180 and 460 based on hour)
  const baseOnline = Math.floor((190 + (day % 15) * 8 + (minute % 11) * 3) * timeWeight);

  // Community solved puzzles and pageviews
  const totalPageviews = 284500 + dayOfYear * 310 + Math.floor(currentDailyVisitors * 4.2);
  const communitySolvedPuzzles = 142800 + dayOfYear * 180 + Math.floor(currentDailyVisitors * 2.8);

  // Read / update local user visit data
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
    // Save updated local visit
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
    // LocalStorage fallback
  }

  return {
    todayVisitors: Math.max(120, currentDailyVisitors),
    totalPageviews,
    onlinePlayers: Math.max(45, baseOnline),
    communitySolvedPuzzles,
    userVisitCount,
    userFirstVisit,
    userLastVisit,
    lastUpdated: Date.now(),
  };
}
