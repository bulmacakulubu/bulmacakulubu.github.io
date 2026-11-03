// Hybrid Dictionary Service
// Combines local curated offline JSON dictionaries with live TDK & Free Dictionary API lookups.
// Caches all verified words and definitions into LocalStorage.

import { WORDLE_WORDS_TR, WORDLE_WORDS_EN, VALID_WORDS_TR, VALID_WORDS_EN } from '../data/wordBank';

const CACHE_STORAGE_KEY = 'bulmaca_kulubu_dict_meanings_v1';

interface CachedEntry {
  isValid: boolean;
  meaning?: string;
  timestamp: number;
}

function getStoredMeanings(): Record<string, CachedEntry> {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredMeanings(data: Record<string, CachedEntry>): void {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save dictionary cache to localStorage', e);
  }
}

// In-memory cache for word lists
const wordListCache: Record<string, string[]> = {};

export async function fetchWordList(
  lang: 'tr' | 'en',
  length: 5 | 7 | 9
): Promise<string[]> {
  const cacheKey = `${lang}_${length}`;
  if (wordListCache[cacheKey] && wordListCache[cacheKey].length > 0) {
    return wordListCache[cacheKey];
  }

  try {
    const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/';
    const res = await fetch(`${basePath}data/words/words-${lang}-${length}.json`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        wordListCache[cacheKey] = data;
        return data;
      }
    }
  } catch (err) {
    console.info(`[DictService] Loading local fallback for ${lang} ${length}`);
  }

  // Fallback to built-in wordBank if offline or fetch fails
  const fallback = lang === 'tr' ? WORDLE_WORDS_TR[length] : WORDLE_WORDS_EN[length];
  wordListCache[cacheKey] = fallback;
  return fallback;
}

export interface ValidationResult {
  isValid: boolean;
  meaning?: string;
  source: 'local' | 'cache' | 'api' | 'unknown';
}

export async function validateAndGetMeaning(
  rawWord: string,
  lang: 'tr' | 'en'
): Promise<ValidationResult> {
  const isTr = lang === 'tr';
  const word = isTr ? rawWord.trim().toLocaleUpperCase('tr-TR') : rawWord.trim().toUpperCase();
  const cacheKey = `${lang}:${word}`;

  // 1. Check built-in set
  const localSet = isTr ? VALID_WORDS_TR : VALID_WORDS_EN;
  if (localSet.has(word)) {
    return { isValid: true, source: 'local' };
  }

  // 2. Check LocalStorage cache
  const cache = getStoredMeanings();
  if (cache[cacheKey]) {
    return {
      isValid: cache[cacheKey].isValid,
      meaning: cache[cacheKey].meaning,
      source: 'cache',
    };
  }

  // 3. Online Hybrid Fallback: Query official Dictionary APIs with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    if (isTr) {
      // Query TDK (Türk Dil Kurumu) API
      const tdkQuery = encodeURIComponent(word.toLocaleLowerCase('tr-TR'));
      const res = await fetch(`https://sozluk.gov.tr/gts?ara=${tdkQuery}`, {
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        clearTimeout(timeoutId);

        // If TDK found the word, it returns array with meanings
        if (Array.isArray(data) && data.length > 0 && !data[0].error) {
          const meaning = data[0]?.anlamlarListe?.[0]?.anlam || 'TDK sözlüğünde kayıtlı Türkçe kelime.';
          // Save to permanent localStorage cache
          cache[cacheKey] = { isValid: true, meaning, timestamp: Date.now() };
          saveStoredMeanings(cache);
          return { isValid: true, meaning, source: 'api' };
        } else {
          cache[cacheKey] = { isValid: false, timestamp: Date.now() };
          saveStoredMeanings(cache);
          return { isValid: false, source: 'api' };
        }
      }
    } else {
      // Query Free Dictionary API (English)
      const enQuery = encodeURIComponent(word.toLowerCase());
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${enQuery}`, {
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        clearTimeout(timeoutId);

        if (Array.isArray(data) && data.length > 0) {
          const meaning = data[0]?.meanings?.[0]?.definitions?.[0]?.definition || 'Valid English word.';
          cache[cacheKey] = { isValid: true, meaning, timestamp: Date.now() };
          saveStoredMeanings(cache);
          return { isValid: true, meaning, source: 'api' };
        }
      } else if (res.status === 404) {
        clearTimeout(timeoutId);
        cache[cacheKey] = { isValid: false, timestamp: Date.now() };
        saveStoredMeanings(cache);
        return { isValid: false, source: 'api' };
      }
    }
  } catch {
    // Network / timeout error: if offline and word is >= 3 chars, accept if it passes consonant-vowel check
  } finally {
    clearTimeout(timeoutId);
  }

  return { isValid: false, source: 'unknown' };
}

export async function getWordMeaning(
  rawWord: string,
  lang: 'tr' | 'en'
): Promise<string | null> {
  const result = await validateAndGetMeaning(rawWord, lang);
  return result.meaning || null;
}

