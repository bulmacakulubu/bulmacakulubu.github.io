/**
 * Nonogram (Picross) Sonsuz Üretim ve Piksel Sanatı Motoru
 * 0 TL Maliyet - Tamamen Yerel ve Sonsuz Oynanabilir
 */

export interface PixelPuzzle {
  id: string;
  nameTr: string;
  nameEn: string;
  size: 5 | 10;
  grid: number[][]; // 1: filled, 0: empty
  category: string;
}

/**
 * 5x5 Genişletilmiş Zengin Piksel Sanatları (Tanınabilir ve Keyifli)
 */
export const NONOGRAM_LIBRARY_5X5: PixelPuzzle[] = [
  {
    id: 'n5-kalp',
    nameTr: 'Kalp',
    nameEn: 'Heart',
    size: 5,
    category: 'Duygular',
    grid: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    id: 'n5-gulen-yuz',
    nameTr: 'Gülen Yüz',
    nameEn: 'Smiley',
    size: 5,
    category: 'Emojiler',
    grid: [
      [0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
    ],
  },
  {
    id: 'n5-agac',
    nameTr: 'Çam Ağacı',
    nameEn: 'Pine Tree',
    size: 5,
    category: 'Doğa',
    grid: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    id: 'n5-yildiz',
    nameTr: 'Kutup Yıldızı',
    nameEn: 'North Star',
    size: 5,
    category: 'Gökyüzü',
    grid: [
      [0, 0, 1, 0, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [1, 0, 0, 0, 1],
    ],
  },
  {
    id: 'n5-capa',
    nameTr: 'Denizci Çapası',
    nameEn: 'Anchor',
    size: 5,
    category: 'Deniz',
    grid: [
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1],
      [0, 1, 1, 1, 0],
    ],
  },
  {
    id: 'n5-kadeh',
    nameTr: 'Zafer Kupası',
    nameEn: 'Trophy Cup',
    size: 5,
    category: 'Ödüller',
    grid: [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
    ],
  },
  {
    id: 'n5-kilic',
    nameTr: 'Savaşçı Kılıcı',
    nameEn: 'Sword',
    size: 5,
    category: 'Silahlar',
    grid: [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    id: 'n5-ev',
    nameTr: 'Köy Evi',
    nameEn: 'Cottage',
    size: 5,
    category: 'Mimari',
    grid: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1],
    ],
  },
  {
    id: 'n5-elma',
    nameTr: 'Kırmızı Elma',
    nameEn: 'Apple',
    size: 5,
    category: 'Meyveler',
    grid: [
      [0, 0, 1, 1, 0],
      [0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
    ],
  },
  {
    id: 'n5-mantar',
    nameTr: 'Sihirli Mantar',
    nameEn: 'Mushroom',
    size: 5,
    category: 'Orman',
    grid: [
      [0, 1, 1, 1, 0],
      [1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    id: 'n5-hayalet',
    nameTr: 'Sevimli Hayalet',
    nameEn: 'Ghost',
    size: 5,
    category: 'Oyunlar',
    grid: [
      [0, 1, 1, 1, 0],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
    ],
  },
  {
    id: 'n5-muzik',
    nameTr: 'Müzik Notası',
    nameEn: 'Music Note',
    size: 5,
    category: 'Müzik',
    grid: [
      [0, 0, 1, 1, 1],
      [0, 0, 1, 0, 1],
      [0, 0, 1, 0, 1],
      [0, 1, 1, 0, 0],
      [0, 1, 1, 0, 0],
    ],
  },
];

/**
 * 10x10 Genişletilmiş Zengin Piksel Sanatları
 */
export const NONOGRAM_LIBRARY_10X10: PixelPuzzle[] = [
  {
    id: 'n10-kedi',
    nameTr: 'Sevimli Kedi',
    nameEn: 'Cute Cat',
    size: 10,
    category: 'Hayvanlar',
    grid: [
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ],
  },
  {
    id: 'n10-yelkenli',
    nameTr: 'Yelkenli Gemi',
    nameEn: 'Sailboat',
    size: 10,
    category: 'Araçlar',
    grid: [
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    ],
  },
  {
    id: 'n10-uzay-gemisi',
    nameTr: 'Uzay Gemisi',
    nameEn: 'Spaceship',
    size: 10,
    category: 'Uzay',
    grid: [
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
      [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    ],
  },
  {
    id: 'n10-tac',
    nameTr: 'Kral Tacı',
    nameEn: 'Royal Crown',
    size: 10,
    category: 'Saray',
    grid: [
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  {
    id: 'n10-robot',
    nameTr: 'Retro Robot',
    nameEn: 'Retro Robot',
    size: 10,
    category: 'Teknoloji',
    grid: [
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
    ],
  },
  {
    id: 'n10-elmas',
    nameTr: 'Parlayan Elmas',
    nameEn: 'Diamond Gem',
    size: 10,
    category: 'Mücevher',
    grid: [
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: 'n10-gamepad',
    nameTr: 'Oyun Kolu',
    nameEn: 'Gamepad',
    size: 10,
    category: 'Oyunlar',
    grid: [
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: 'n10-kupa',
    nameTr: 'Şampiyonluk Kupası',
    nameEn: 'Championship Trophy',
    size: 10,
    category: 'Spor',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ],
  },
];

/**
 * Satır ve Sütun Sayı İpuçlarını Otomatik Hesaplar
 */
export function computeNonogramClues(grid: number[][]): {
  rowClues: number[][];
  colClues: number[][];
} {
  const size = grid.length;
  const rowClues: number[][] = [];
  const colClues: number[][] = [];

  // Row Clues
  for (let r = 0; r < size; r++) {
    const clues: number[] = [];
    let count = 0;
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    rowClues.push(clues.length > 0 ? clues : [0]);
  }

  // Column Clues
  for (let c = 0; c < size; c++) {
    const clues: number[] = [];
    let count = 0;
    for (let r = 0; r < size; r++) {
      if (grid[r][c] === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    colClues.push(clues.length > 0 ? clues : [0]);
  }

  return { rowClues, colClues };
}

/**
 * Prosedürel Sonsuz Piksel Sanatı Üreteci
 * Yatay eksende simetrik, estetik ve çözülebilir rastgele piksel desenleri oluşturur.
 */
export function generateProceduralNonogram(size: 5 | 10, seed?: number): PixelPuzzle {
  const s = seed !== undefined ? seed : Date.now();
  const half = Math.ceil(size / 2);
  const grid: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

  // Simetrik piksel çizimi
  for (let r = 0; r < size; r++) {
    // Üst ve alt kenarlarda daha seyrek, merkezde daha yoğun doluluk
    const fillProb = r === 0 || r === size - 1 ? 0.35 : 0.55;
    for (let c = 0; c < half; c++) {
      const val = Math.random() < fillProb ? 1 : 0;
      grid[r][c] = val;
      grid[r][size - 1 - c] = val; // Yatay ayna simetrisi
    }
  }

  // Boş ızgara oluşmasını engelle (en az 4 hücre dolu olmalı)
  let filledCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 1) filledCount++;
    }
  }

  if (filledCount < 4) {
    grid[Math.floor(size / 2)][Math.floor(size / 2)] = 1;
    grid[Math.floor(size / 2) - 1][Math.floor(size / 2)] = 1;
  }

  const themes = [
    { tr: 'Mistik Desen', en: 'Mystic Sigil' },
    { tr: 'Antik Kalkan', en: 'Ancient Shield' },
    { tr: 'Siber Amblem', en: 'Cyber Emblem' },
    { tr: 'Uzay Keşfi', en: 'Space Probe' },
    { tr: 'Piksel Totem', en: 'Pixel Totem' },
    { tr: 'Kristal Çiçek', en: 'Crystal Flower' },
  ];
  const chosen = themes[Math.floor(Math.random() * themes.length)];

  return {
    id: `procedural-${s}`,
    nameTr: `${chosen.tr} #${(s % 999) + 1}`,
    nameEn: `${chosen.en} #${(s % 999) + 1}`,
    size,
    category: 'Sonsuz Prosedürel',
    grid,
  };
}
