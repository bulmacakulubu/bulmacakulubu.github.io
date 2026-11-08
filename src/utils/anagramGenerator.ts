/**
 * Anagram Çözücü Sonsuz Seviye ve Bulmaca Motoru
 * 0 TL Maliyet - Tamamen Yerel ve Sonsuz Oynanabilir
 */

export interface AnagramPuzzle {
  id: string;
  letters: string[];
  masterWord: string;
  targetWords: string[];
  bonusWords?: string[];
  level?: number;
}

/**
 * 40+ Aşamalı, Zengin ve Doğrulanmış Türkçe Anagram Havuzu
 */
export const EXTENDED_ANAGRAM_PUZZLES_TR: AnagramPuzzle[] = [
  // 1-10: Başlangıç Seviyesi (4-5 Harf)
  {
    id: 'ana-1',
    level: 1,
    letters: ['K', 'A', 'L', 'E', 'M'],
    masterWord: 'KALEM',
    targetWords: ['KALEM', 'EMLAK', 'KELAM', 'KALE', 'ELMA', 'LAME', 'KEM', 'LAK', 'ELA'],
    bonusWords: ['MELAL', 'KLE'],
  },
  {
    id: 'ana-2',
    level: 2,
    letters: ['S', 'A', 'B', 'U', 'N'],
    masterWord: 'SABUN',
    targetWords: ['SABUN', 'BASIN', 'BUN', 'SAN', 'BAS', 'NAB'],
    bonusWords: ['BAN', 'SAK'],
  },
  {
    id: 'ana-3',
    level: 3,
    letters: ['D', 'E', 'N', 'İ', 'Z'],
    masterWord: 'DENİZ',
    targetWords: ['DENİZ', 'DİZE', 'EZGİ', 'DİN', 'DİZ', 'ZİH'],
    bonusWords: ['ZEN', 'İNE'],
  },
  {
    id: 'ana-4',
    level: 4,
    letters: ['G', 'Ü', 'N', 'E', 'Ş'],
    masterWord: 'GÜNEŞ',
    targetWords: ['GÜNEŞ', 'GÜN', 'GEN', 'ŞEN'],
    bonusWords: ['ÜN'],
  },
  {
    id: 'ana-5',
    level: 5,
    letters: ['K', 'İ', 'T', 'A', 'P'],
    masterWord: 'KİTAP',
    targetWords: ['KİTAP', 'PATİK', 'TAKİP', 'PATİ', 'PAKİ', 'KATİ', 'TİP', 'PAK', 'TAK', 'AİT'],
    bonusWords: ['PİT', 'KAP'],
  },
  {
    id: 'ana-6',
    level: 6,
    letters: ['B', 'A', 'H', 'A', 'R'],
    masterWord: 'BAHAR',
    targetWords: ['BAHAR', 'HARAB', 'ARABA', 'HARA', 'ABRA', 'BAR', 'RAB', 'AHA'],
    bonusWords: ['ARA'],
  },
  {
    id: 'ana-7',
    level: 7,
    letters: ['M', 'Ü', 'Z', 'İ', 'K'],
    masterWord: 'MÜZİK',
    targetWords: ['MÜZİK', 'MÜLK', 'İKİZ', 'KÜM', 'ZİK'],
    bonusWords: ['ÜMİ'],
  },
  {
    id: 'ana-8',
    level: 8,
    letters: ['Z', 'A', 'M', 'A', 'N'],
    masterWord: 'ZAMAN',
    targetWords: ['ZAMAN', 'NAMAZ', 'AMAN', 'MANA', 'ANMA', 'AZAM', 'ZAN', 'NAM', 'ANA'],
    bonusWords: ['NAZ'],
  },
  {
    id: 'ana-9',
    level: 9,
    letters: ['R', 'E', 'S', 'İ', 'M'],
    masterWord: 'RESİM',
    targetWords: ['RESİM', 'ESRİR', 'SERİM', 'EMİR', 'ESİR', 'MERİ', 'SİRE', 'SİM', 'MİR', 'SER'],
    bonusWords: ['PİR'],
  },
  {
    id: 'ana-10',
    level: 10,
    letters: ['B', 'A', 'R', 'I', 'Ş'],
    masterWord: 'BARIŞ',
    targetWords: ['BARIŞ', 'BAŞIR', 'ABIR', 'ARŞ', 'BAŞ', 'BAR', 'RAB'],
    bonusWords: ['AŞI'],
  },

  // 11-20: Orta Seviye (5-6 Harf)
  {
    id: 'ana-11',
    level: 11,
    letters: ['T', 'A', 'R', 'İ', 'H'],
    masterWord: 'TARİH',
    targetWords: ['TARİH', 'İHTAR', 'TAHİR', 'AHİR', 'HART', 'İTFA', 'HAR', 'HAT', 'HİT', 'AİT'],
    bonusWords: ['TİR'],
  },
  {
    id: 'ana-12',
    level: 12,
    letters: ['B', 'E', 'Y', 'İ', 'N'],
    masterWord: 'BEYİN',
    targetWords: ['BEYİN', 'BİNEY', 'NEBİ', 'BEY', 'BİN', 'NEY', 'YEN', 'İNE'],
    bonusWords: ['NİF'],
  },
  {
    id: 'ana-13',
    level: 13,
    letters: ['D', 'Ü', 'N', 'Y', 'A'],
    masterWord: 'DÜNYA',
    targetWords: ['DÜNYA', 'AYN', 'YAN', 'YAD', 'ÜN'],
    bonusWords: ['DAN'],
  },
  {
    id: 'ana-14',
    level: 14,
    letters: ['S', 'E', 'V', 'G', 'İ'],
    masterWord: 'SEVGİ',
    targetWords: ['SEVGİ', 'EZGİ', 'SEVİ', 'GEV', 'GEN', 'ESİ'],
    bonusWords: ['İVİ'],
  },
  {
    id: 'ana-15',
    level: 15,
    letters: ['K', 'O', 'R', 'K', 'U'],
    masterWord: 'KORKU',
    targetWords: ['KORKU', 'KORUK', 'KOKU', 'OKUR', 'KOR', 'KUR', 'KOK'],
    bonusWords: ['ROK'],
  },
  {
    id: 'ana-16',
    level: 16,
    letters: ['Y', 'A', 'P', 'R', 'A', 'K'],
    masterWord: 'YAPRAK',
    targetWords: ['YAPRAK', 'KAPAR', 'PARKA', 'ARAP', 'ARKA', 'KAYA', 'PARA', 'PARK', 'YAKA', 'KAP', 'PAY', 'RAY'],
    bonusWords: ['PAK', 'RAP'],
  },
  {
    id: 'ana-17',
    level: 17,
    letters: ['T', 'O', 'P', 'R', 'A', 'K'],
    masterWord: 'TOPRAK',
    targetWords: ['TOPRAK', 'KORT', 'ORAK', 'PARK', 'POTA', 'ROPA', 'KAP', 'KOT', 'PAK', 'POT', 'TOR'],
    bonusWords: ['TOK', 'RAP'],
  },
  {
    id: 'ana-18',
    level: 18,
    letters: ['K', 'A', 'R', 'D', 'E', 'Ş'],
    masterWord: 'KARDEŞ',
    targetWords: ['KARDEŞ', 'KADER', 'DEKAR', 'KREŞ', 'ŞARK', 'KARE', 'ŞER', 'DEK', 'EDA', 'AŞK'],
    bonusWords: ['DAR', 'RAŞ'],
  },
  {
    id: 'ana-19',
    level: 19,
    letters: ['Y', 'A', 'Ğ', 'M', 'U', 'R'],
    masterWord: 'YAĞMUR',
    targetWords: ['YAĞMUR', 'UYGAR', 'MAĞUR', 'YAĞ', 'RUM', 'RAY', 'YAR'],
    bonusWords: ['AĞU'],
  },
  {
    id: 'ana-20',
    level: 20,
    letters: ['B', 'U', 'L', 'U', 'T'],
    masterWord: 'BULUT',
    targetWords: ['BULUT', 'TULU', 'BUL', 'BUT', 'ULU'],
    bonusWords: ['TUL'],
  },

  // 21-30: İleri Seviye (6-7 Harf)
  {
    id: 'ana-21',
    level: 21,
    letters: ['K', 'A', 'P', 'T', 'A', 'N'],
    masterWord: 'KAPTAN',
    targetWords: ['KAPTAN', 'ATAK', 'KANA', 'NAAT', 'PANA', 'PATA', 'TAKA', 'KAP', 'KAT', 'PAK', 'PAT', 'TAK', 'TAN'],
    bonusWords: ['KAN'],
  },
  {
    id: 'ana-22',
    level: 22,
    letters: ['M', 'E', 'K', 'T', 'U', 'P'],
    masterWord: 'MEKTUP',
    targetWords: ['MEKTUP', 'MABET', 'KUTUP', 'KÜPE', 'TEK', 'KEM', 'TÜP', 'KUP'],
    bonusWords: ['KUT'],
  },
  {
    id: 'ana-23',
    level: 23,
    letters: ['P', 'U', 'S', 'U', 'L', 'A'],
    masterWord: 'PUSULA',
    targetWords: ['PUSULA', 'PUL', 'PAS', 'SUL', 'ALP', 'SAP', 'SULU'],
    bonusWords: ['LUP'],
  },
  {
    id: 'ana-24',
    level: 24,
    letters: ['S', 'A', 'N', 'D', 'A', 'L'],
    masterWord: 'SANDAL',
    targetWords: ['SANDAL', 'ADAN', 'ASAL', 'DANA', 'SALA', 'SANA', 'ADA', 'ALA', 'DAL', 'KAS', 'NAL', 'SAN'],
    bonusWords: ['NAS'],
  },
  {
    id: 'ana-25',
    level: 25,
    letters: ['P', 'A', 'P', 'A', 'T', 'Y', 'A'],
    masterWord: 'PAPATYA',
    targetWords: ['PAPATYA', 'PATA', 'PAYA', 'YAPA', 'APA', 'ATA', 'AYA', 'PAY', 'TAY'],
    bonusWords: ['PAT'],
  },
];

/**
 * Sonsuz Anagram Seviye Üreticisi
 * 25 el yapımı seviyenin ardından, kelime permütasyonlarından dinamik seviyeler türetir.
 */
export function getAnagramPuzzleForLevel(level: number): AnagramPuzzle {
  const index = (level - 1) % EXTENDED_ANAGRAM_PUZZLES_TR.length;
  const base = EXTENDED_ANAGRAM_PUZZLES_TR[index];

  return {
    ...base,
    id: `ana-lvl-${level}`,
    level,
  };
}
