import { AllStats, GameId, GameStats, Settings } from '../types';

const STATS_KEY = 'bulmaca_kulubu_stats_v1';
const SETTINGS_KEY = 'bulmaca_kulubu_settings_v1';

export const defaultGameStats: GameStats = {
  played: 0,
  won: 0,
  streak: 0,
  maxStreak: 0,
};

export const defaultAllStats: AllStats = {
  'kelime-bulmaca': { ...defaultGameStats },
  'kare-bulmaca': { ...defaultGameStats, bestTime: 0 },
  'anagram': { ...defaultGameStats, bestScore: 0 },
  'kelime-turetme': { ...defaultGameStats, bestScore: 0 },
  'sozcuk-avi': { ...defaultGameStats, bestTime: 0 },
  'adam-asmaca': { ...defaultGameStats },
  'satranc': { ...defaultGameStats },
  'sudoku': { ...defaultGameStats, bestTime: 0 },
  'kelime-zinciri': { ...defaultGameStats, bestTime: 0 },
  'hafiza-kartlari': { ...defaultGameStats, bestTime: 0 },
  'nokta-avi': { ...defaultGameStats, bestScore: 0 },
  'baglantilar': { ...defaultGameStats, bestTime: 0 },
  'nonogram': { ...defaultGameStats, bestTime: 0 },
  'gunun-bulmacasi': { ...defaultGameStats, bestScore: 0 },
};

export function getDailyPuzzleInfo(): { gameId: GameId; dateKey: string; nextResetTime: number } {
  const games: GameId[] = [
    'kelime-bulmaca',
    'kare-bulmaca',
    'anagram',
    'kelime-turetme',
    'sozcuk-avi',
    'adam-asmaca',
    'satranc',
    'sudoku',
    'kelime-zinciri',
    'hafiza-kartlari',
    'nokta-avi',
    'baglantilar',
    'nonogram',
  ];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const dayIndex = Math.floor(now / dayMs);
  const gameId = games[dayIndex % games.length];
  const dateKey = new Date(dayIndex * dayMs).toISOString().split('T')[0];
  const nextResetTime = (dayIndex + 1) * dayMs;
  return { gameId, dateKey, nextResetTime };
}

export const defaultSettings: Settings = {
  theme: 'light',
  palette: 'nordic',
  language: 'tr',
  soundEnabled: true,
  volume: 30,
};

export function loadStats(): AllStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (!data) return defaultAllStats;
    const parsed = JSON.parse(data);
    return { ...defaultAllStats, ...parsed };
  } catch (e) {
    return defaultAllStats;
  }
}

export function saveStats(stats: AllStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}

export function updateGameStats(gameId: GameId, won: boolean, scoreOrTime?: number) {
  const stats = loadStats();
  const current = stats[gameId] || { ...defaultGameStats };
  
  current.played += 1;
  if (won) {
    current.won += 1;
    current.streak += 1;
    if (current.streak > current.maxStreak) {
      current.maxStreak = current.streak;
    }
  } else {
    current.streak = 0;
  }

  if (scoreOrTime !== undefined) {
    if (gameId === 'kelime-turetme' || gameId === 'nokta-avi') {
      if (!current.bestScore || scoreOrTime > current.bestScore) {
        current.bestScore = scoreOrTime;
      }
    } else {
      if (!current.bestTime || scoreOrTime < current.bestTime) {
        current.bestTime = scoreOrTime;
      }
    }
  }

  stats[gameId] = current;
  saveStats(stats);
  return stats;
}

export function loadSettings(): Settings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return defaultSettings;
    const parsed = JSON.parse(data);
    let palette = parsed.palette || 'nordic';
    if (palette === 'sage') palette = 'nordic';
    if (palette === 'classic') palette = 'kyoto';
    if (palette === 'pastel') palette = 'aurora';
    if (palette === 'oled') palette = 'monochrome';
    return { ...defaultSettings, ...parsed, palette };
  } catch (e) {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
