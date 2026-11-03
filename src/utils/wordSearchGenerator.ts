// Procedural Word Search Grid Generator with Balanced 8-Direction Distribution

export interface Point {
  r: number;
  c: number;
}

export interface GeneratedWordSearch {
  grid: string[][];
  placedWords: Record<string, Point[]>;
}

const ALPHABET_TR = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
const ALPHABET_EN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// All 8 directions: horizontal (left/right), vertical (up/down), diagonal (all 4 quadrants)
const ALL_DIRECTIONS = [
  { name: 'horizontal-right', dr: 0, dc: 1 },
  { name: 'horizontal-left', dr: 0, dc: -1 },
  { name: 'vertical-down', dr: 1, dc: 0 },
  { name: 'vertical-up', dr: -1, dc: 0 },
  { name: 'diagonal-down-right', dr: 1, dc: 1 },
  { name: 'diagonal-down-left', dr: 1, dc: -1 },
  { name: 'diagonal-up-right', dr: -1, dc: 1 },
  { name: 'diagonal-up-left', dr: -1, dc: -1 },
];

function shuffle<T>(arr: T[]): T[] {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

export function generateWordSearch(
  words: string[],
  size = 12,
  language: 'tr' | 'en' = 'tr'
): GeneratedWordSearch {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placedWords: Record<string, Point[]> = {};
  const alphabet = language === 'tr' ? ALPHABET_TR : ALPHABET_EN;

  // Sort longest words first to optimize packing
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  // Guarantee high directional variety: prioritize diagonal and vertical directions
  const targetDirections = shuffle([
    { dr: 1, dc: 1 },   // Diagonal down-right
    { dr: 1, dc: 0 },   // Vertical down
    { dr: 0, dc: 1 },   // Horizontal right
    { dr: 1, dc: -1 },  // Diagonal down-left
    { dr: -1, dc: 0 },  // Vertical up
    { dr: 0, dc: -1 },  // Horizontal left
    { dr: -1, dc: 1 },  // Diagonal up-right
    { dr: -1, dc: -1 }, // Diagonal up-left
  ]);

  let dirIndex = 0;

  for (const word of sortedWords) {
    const letters = word.replace(/\s+/g, '');
    let placed = false;
    let attempts = 0;

    // First try preferred distinct direction, then try any random direction
    while (!placed && attempts < 350) {
      attempts++;
      const dir = attempts < 80
        ? targetDirections[dirIndex % targetDirections.length]
        : ALL_DIRECTIONS[Math.floor(Math.random() * ALL_DIRECTIONS.length)];

      const startR = Math.floor(Math.random() * size);
      const startC = Math.floor(Math.random() * size);

      const endR = startR + (letters.length - 1) * dir.dr;
      const endC = startC + (letters.length - 1) * dir.dc;

      if (endR < 0 || endR >= size || endC < 0 || endC >= size) {
        continue;
      }

      // Check letter overlap validity
      let canPlace = true;
      for (let i = 0; i < letters.length; i++) {
        const r = startR + i * dir.dr;
        const c = startC + i * dir.dc;
        const existing = grid[r][c];
        if (existing !== '' && existing !== letters[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        const coords: Point[] = [];
        for (let i = 0; i < letters.length; i++) {
          const r = startR + i * dir.dr;
          const c = startC + i * dir.dc;
          grid[r][c] = letters[i];
          coords.push({ r, c });
        }
        placedWords[word] = coords;
        placed = true;
        dirIndex++;
      }
    }
  }

  // Fill remaining empty cells with random letters
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        const randChar = alphabet[Math.floor(Math.random() * alphabet.length)];
        grid[r][c] = randChar;
      }
    }
  }

  return { grid, placedWords };
}
