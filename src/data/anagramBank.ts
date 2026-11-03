/**
 * Anagram Bank for Anagram Çözücü
 * Scrambled letter sets with main and sub-words.
 */

export interface AnagramPuzzle {
  id: string;
  letters: string[]; // Scrambled letter set
  masterWord: string;
  targetWords: string[]; // Grouped by length
  bonusWords?: string[];
}

export const ANAGRAM_PUZZLES_TR: AnagramPuzzle[] = [
  {
    id: 'ana-1',
    letters: ['K', 'A', 'L', 'E', 'M'],
    masterWord: 'KALEM',
    targetWords: ['KALEM', 'EMLAK', 'KELAM', 'KALE', 'ELMA', 'LAME', 'KEM', 'LAK', 'ELA'],
    bonusWords: ['MELAL', 'KLE'],
  },
  {
    id: 'ana-2',
    letters: ['S', 'A', 'B', 'U', 'N'],
    masterWord: 'SABUN',
    targetWords: ['SABUN', 'BASIN', 'BUN', 'SAN', 'BAS', 'NAB'],
    bonusWords: ['BAN', 'SAK'],
  },
  {
    id: 'ana-3',
    letters: ['D', 'E', 'N', 'İ', 'Z'],
    masterWord: 'DENİZ',
    targetWords: ['DENİZ', 'DİZE', 'EZGİ', 'DİN', 'DİZ', 'ZİH'],
    bonusWords: ['ZEN', 'İNE'],
  },
  {
    id: 'ana-4',
    letters: ['G', 'Ü', 'N', 'E', 'Ş'],
    masterWord: 'GÜNEŞ',
    targetWords: ['GÜNEŞ', 'GÜN', 'GEN', 'ŞEN'],
    bonusWords: ['ÜN'],
  },
  {
    id: 'ana-5',
    letters: ['K', 'İ', 'T', 'A', 'P'],
    masterWord: 'KİTAP',
    targetWords: ['KİTAP', 'PATİK', 'TAKİP', 'PATİ', 'PAKİ', 'KATİ', 'TİP', 'PAK', 'TAK', 'AİT'],
    bonusWords: ['PİT', 'KAP'],
  },
  {
    id: 'ana-6',
    letters: ['M', 'E', 'Y', 'V', 'E'],
    masterWord: 'MEYVE',
    targetWords: ['MEYVE', 'YEMEK', 'YEME', 'YEM', 'MEY'],
    bonusWords: ['EV', 'YEV'],
  },
  {
    id: 'ana-7',
    letters: ['R', 'A', 'D', 'Y', 'O'],
    masterWord: 'RADYO',
    targetWords: ['RADYO', 'ORDA', 'OYDA', 'ODA', 'DAR', 'RAY', 'OYA', 'YAD'],
    bonusWords: ['ADO', 'ROD'],
  },
  {
    id: 'ana-8',
    letters: ['B', 'A', 'H', 'A', 'R'],
    masterWord: 'BAHAR',
    targetWords: ['BAHAR', 'HARBA', 'ABRA', 'HARA', 'RABA', 'BAR', 'HAR', 'RAB', 'AHA'],
    bonusWords: ['BAA', 'ARA'],
  },
  {
    id: 'ana-9',
    letters: ['T', 'O', 'P', 'R', 'A', 'K'],
    masterWord: 'TOPRAK',
    targetWords: ['TOPRAK', 'PORTA', 'KORAT', 'ORPAK', 'PARK', 'POTA', 'ROTA', 'ORAK', 'KOTA', 'TOP', 'KOR', 'TOK'],
    bonusWords: ['RAP', 'TAR', 'PAK'],
  },
  {
    id: 'ana-10',
    letters: ['Y', 'A', 'P', 'R', 'A', 'K'],
    masterWord: 'YAPRAK',
    targetWords: ['YAPRAK', 'KAPAR', 'PARKA', 'ARAP', 'ARKA', 'KARA', 'PARA', 'PARK', 'YAKA', 'PAY', 'KAP', 'YAR'],
    bonusWords: ['PAK', 'RAY', 'ARP'],
  },
  {
    id: 'ana-11',
    letters: ['Z', 'E', 'N', 'G', 'İ', 'N'],
    masterWord: 'ZENGİN',
    targetWords: ['ZENGİN', 'ENGİN', 'EZGİ', 'GEZİ', 'GEN', 'GİZ', 'İNİ'],
    bonusWords: ['ZEN', 'NİN'],
  },
  {
    id: 'ana-12',
    letters: ['R', 'Ü', 'Z', 'G', 'Â', 'R'],
    masterWord: 'RÜZGAR',
    targetWords: ['RÜZGAR', 'GÜZ', 'GÜR'],
    bonusWords: ['ZAR', 'GAR'],
  },
];

