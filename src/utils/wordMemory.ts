// Utility for smart tracking of seen words/puzzles in LocalStorage
// Ensures users never see the same word twice until the entire pool is exhausted.

const SEEN_WORDS_STORAGE_KEY = 'bulmaca_kulubu_seen_words_v1';

function getStorageMap(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(SEEN_WORDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStorageMap(data: Record<string, string[]>): void {
  try {
    localStorage.setItem(SEEN_WORDS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save seen words to localStorage', e);
  }
}

export interface PickResult<T> {
  item: T;
  isCycleReset: boolean;
  remainingCount: number;
  totalCount: number;
}

export function pickUnseenWord<T>(
  poolKey: string,
  pool: T[],
  wordExtractor: (item: T) => string = (x) => String(x)
): PickResult<T> {
  if (!pool || pool.length === 0) {
    throw new Error(`Pool for key "${poolKey}" is empty.`);
  }

  const map = getStorageMap();
  const seenList = map[poolKey] || [];
  const seenSet = new Set(seenList);

  const unseen = pool.filter((item) => !seenSet.has(wordExtractor(item)));

  let chosen: T;
  let isCycleReset = false;

  if (unseen.length === 0) {
    // Entire pool has been solved! Reset history for this pool and start fresh
    isCycleReset = true;
    chosen = pool[Math.floor(Math.random() * pool.length)];
    map[poolKey] = [wordExtractor(chosen)];
    saveStorageMap(map);
    return {
      item: chosen,
      isCycleReset,
      remainingCount: pool.length - 1,
      totalCount: pool.length,
    };
  }

  // Pick random from unseen
  chosen = unseen[Math.floor(Math.random() * unseen.length)];
  const updatedSeen = [...seenList, wordExtractor(chosen)];
  map[poolKey] = updatedSeen;
  saveStorageMap(map);

  return {
    item: chosen,
    isCycleReset,
    remainingCount: unseen.length - 1,
    totalCount: pool.length,
  };
}

export function getPoolProgress(
  poolKey: string,
  totalCount: number
): { seenCount: number; totalCount: number; remainingCount: number } {
  const map = getStorageMap();
  const seen = (map[poolKey] || []).length;
  const clampedSeen = Math.min(seen, totalCount);
  return {
    seenCount: clampedSeen,
    totalCount,
    remainingCount: Math.max(0, totalCount - clampedSeen),
  };
}

export function resetPoolMemory(poolKey: string): void {
  const map = getStorageMap();
  delete map[poolKey];
  saveStorageMap(map);
}

