export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export const ACHIEVEMENTS_LIST: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_win',
    title: 'İlk Zafer',
    description: 'İlk bulmaca oyununu başarıyla tamamla.',
    icon: '🏆',
  },
  {
    id: 'streak_3',
    title: 'Seri Ustası',
    description: 'Üst üste 3 galibiyet serisi yakala.',
    icon: '🔥',
  },
  {
    id: 'word_master',
    title: 'Kelime Avcısı',
    description: 'Kelime oyunlarında toplam 5 kez zafer kazan.',
    icon: '📚',
  },
  {
    id: 'speed_demon',
    title: 'Hızlı Çözüm',
    description: 'Herhangi bir bulmacayı 30 saniyeden kısa sürede bitir.',
    icon: '⚡',
  },
  {
    id: 'puzzle_fan',
    title: 'Bulmaca Sever',
    description: 'Toplamda 10 oyun oyna.',
    icon: '🎯',
  },
];

const STORAGE_KEY = 'bulmaca_kulubu_achievements_v1';

export function getAchievements(allStats: Record<string, { played: number; won: number; streak: number; maxStreak: number; bestTime?: number }>): Achievement[] {
  let savedUnlocked: Record<string, number> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) savedUnlocked = JSON.parse(raw);
  } catch (e) {}

  // Check and auto-unlock based on stats
  let totalPlayed = 0;
  let totalWon = 0;
  let maxStreakAcrossAll = 0;
  let bestTimeAny = 999999;

  Object.values(allStats).forEach((st) => {
    totalPlayed += st.played || 0;
    totalWon += st.won || 0;
    if ((st.maxStreak || 0) > maxStreakAcrossAll) maxStreakAcrossAll = st.maxStreak;
    if (st.bestTime !== undefined && st.bestTime > 0 && st.bestTime < bestTimeAny) {
      bestTimeAny = st.bestTime;
    }
  });

  const newlyUnlocked: Record<string, number> = { ...savedUnlocked };
  const now = Date.now();

  if (totalWon >= 1 && !newlyUnlocked['first_win']) newlyUnlocked['first_win'] = now;
  if (maxStreakAcrossAll >= 3 && !newlyUnlocked['streak_3']) newlyUnlocked['streak_3'] = now;
  if (totalWon >= 5 && !newlyUnlocked['word_master']) newlyUnlocked['word_master'] = now;
  if (bestTimeAny <= 30 && !newlyUnlocked['speed_demon']) newlyUnlocked['speed_demon'] = now;
  if (totalPlayed >= 10 && !newlyUnlocked['puzzle_fan']) newlyUnlocked['puzzle_fan'] = now;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newlyUnlocked));
  } catch (e) {}

  return ACHIEVEMENTS_LIST.map((ach) => ({
    ...ach,
    unlocked: !!newlyUnlocked[ach.id],
    unlockedAt: newlyUnlocked[ach.id],
  }));
}
