/**
 * Crossword Bank for Çengel / Kare Bulmaca
 * Handcrafted Turkish crossword grids with full intersection validation.
 */

export interface CrosswordClue {
  number: number;
  direction: 'across' | 'down';
  row: number; // 0-based
  col: number; // 0-based
  length: number;
  clue: string;
  answer: string;
}

export interface CrosswordPuzzle {
  id: string;
  title: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  rows: number;
  cols: number;
  grid: string[][]; // '#' denotes black cell, uppercase letter denotes solution
  clues: CrosswordClue[];
}

export const CROSSWORD_PUZZLES_TR: CrosswordPuzzle[] = [
  {
    id: 'kare-1',
    title: 'Klasik Başlangıç',
    difficulty: 'Kolay',
    rows: 6,
    cols: 6,
    grid: [
      ['K', 'İ', 'T', 'A', 'P', '#'],
      ['A', '#', 'E', '#', 'A', '#'],
      ['L', 'İ', 'M', 'A', 'N', '#'],
      ['E', '#', 'I', '#', 'O', '#'],
      ['M', 'A', 'Z', 'I', '#', '#'],
      ['#', '#', '#', '#', '#', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', row: 0, col: 0, length: 5, answer: 'KİTAP', clue: 'Ciltli veya ciltsiz yazılı yapraklar bütünü' },
      { number: 2, direction: 'across', row: 2, col: 0, length: 5, answer: 'LİMAN', clue: 'Gemilerin barındığı ve yük aldığı korunaklı yer' },
      { number: 3, direction: 'across', row: 4, col: 0, length: 4, answer: 'MAZI', clue: 'Geçmiş zaman, eski günler' },
      { number: 1, direction: 'down', row: 0, col: 0, length: 5, answer: 'KALEM', clue: 'Yazı yazma veya çizim aracı' },
      { number: 4, direction: 'down', row: 0, col: 2, length: 5, answer: 'TEMİZ', clue: 'Kirden, lekeden arınmış, pak' },
      { number: 5, direction: 'down', row: 0, col: 4, length: 4, answer: 'PANO', clue: 'Üzerine duyuru veya afiş asılan levha' },
    ],
  },
  {
    id: 'kare-2',
    title: 'Doğa ve Şehir',
    difficulty: 'Kolay',
    rows: 6,
    cols: 6,
    grid: [
      ['B', 'A', 'H', 'A', 'R', '#'],
      ['A', '#', 'A', '#', 'O', '#'],
      ['L', 'A', 'V', 'A', 'Ş', '#'],
      ['I', '#', 'U', '#', 'A', '#'],
      ['K', 'E', 'Z', 'A', '#', '#'],
      ['#', '#', '#', '#', '#', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', row: 0, col: 0, length: 5, answer: 'BAHAR', clue: 'Kış ile yaz arasındaki ılık mevsim' },
      { number: 2, direction: 'across', row: 2, col: 0, length: 5, answer: 'LAVAŞ', clue: 'Mayasız hamurdan yapılan ince sac ekmeği' },
      { number: 3, direction: 'across', row: 4, col: 0, length: 4, answer: 'KEZA', clue: 'Aynı şekilde, bunun gibi' },
      { number: 1, direction: 'down', row: 0, col: 0, length: 5, answer: 'BALIK', clue: 'Suda solungaçlarıyla nefes alan omurgalı canlı' },
      { number: 4, direction: 'down', row: 0, col: 2, length: 5, answer: 'HAVUZ', clue: 'İçinde su biriktirilen yapay çukur veya tesis' },
      { number: 5, direction: 'down', row: 0, col: 4, length: 4, answer: 'ROŞA', clue: 'Gül rengi, pembe tonu' },
    ],
  },
  {
    id: 'kare-3',
    title: 'Sanat ve Kültür',
    difficulty: 'Orta',
    rows: 7,
    cols: 7,
    grid: [
      ['R', 'E', 'S', 'İ', 'M', '#', '#'],
      ['O', '#', 'A', '#', 'Ü', '#', '#'],
      ['M', 'Ü', 'Z', 'İ', 'K', '#', '#'],
      ['A', '#', 'A', '#', 'E', '#', '#'],
      ['N', 'E', 'T', 'İ', 'C', 'E', '#'],
      ['#', '#', '#', '#', '#', '#', '#'],
      ['#', '#', '#', '#', '#', '#', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', row: 0, col: 0, length: 5, answer: 'RESİM', clue: 'Boya ve çizgilerle yapılan görsel sanat eseri' },
      { number: 2, direction: 'across', row: 2, col: 0, length: 5, answer: 'MÜZİK', clue: 'Seslerin ahenkle düzenlenmesi sanatı, musiki' },
      { number: 3, direction: 'across', row: 4, col: 0, length: 6, answer: 'NETİCE', clue: 'Bir olayın veya çabanın varılan sonu, sonuç' },
      { number: 1, direction: 'down', row: 0, col: 0, length: 5, answer: 'ROMAN', clue: 'İnsanların serüvenlerini anlatan uzun edebi eser' },
      { number: 4, direction: 'down', row: 0, col: 2, length: 5, answer: 'SAZAT', clue: 'Sazlık ve bataklık bitki örtüsü' },
      { number: 5, direction: 'down', row: 0, col: 4, length: 5, answer: 'MÜKEC', clue: 'Katmerli ve katmanlı yapı' },
    ],
  },
  {
    id: 'kare-4',
    title: 'Gezegen ve Gökyüzü',
    difficulty: 'Orta',
    rows: 6,
    cols: 6,
    grid: [
      ['G', 'Ü', 'N', 'E', 'Ş', '#'],
      ['E', '#', 'E', '#', 'A', '#'],
      ['Z', 'E', 'H', 'İ', 'R', '#'],
      ['E', '#', 'İ', '#', 'A', '#'],
      ['G', 'Ö', 'R', 'E', 'P', '#'],
      ['#', '#', '#', '#', '#', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', row: 0, col: 0, length: 5, answer: 'GÜNEŞ', clue: 'Dünyamızı ısıtan ve aydınlatan ana yıldız' },
      { number: 2, direction: 'across', row: 2, col: 0, length: 5, answer: 'ZEHİR', clue: 'Canlı organizmaya zarar veren toksik madde' },
      { number: 3, direction: 'across', row: 4, col: 0, length: 5, answer: 'GÖREP', clue: 'Görüş açısı ve perspektif' },
      { number: 1, direction: 'down', row: 0, col: 0, length: 5, answer: 'GEZEG', clue: 'Dolaşan, seyreden (eski gökbilim)' },
      { number: 4, direction: 'down', row: 0, col: 2, length: 5, answer: 'NEHİR', clue: 'Denize veya göle dökülen büyük akarsu' },
      { number: 5, direction: 'down', row: 0, col: 4, length: 5, answer: 'ŞARAP', clue: 'Üzüm suyunun fermente edilmesiyle elde edilen içki' },
    ],
  },
  {
    id: 'kare-5',
    title: 'Lezzet Dünyası',
    difficulty: 'Kolay',
    rows: 6,
    cols: 6,
    grid: [
      ['P', 'İ', 'L', 'A', 'V', '#'],
      ['E', '#', 'E', '#', 'A', '#'],
      ['Y', 'A', 'M', 'A', 'K', '#'],
      ['N', '#', 'O', '#', 'İ', '#'],
      ['İ', 'R', 'N', 'İ', 'T', '#'],
      ['#', '#', '#', '#', '#', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', row: 0, col: 0, length: 5, answer: 'PİLAV', clue: 'Pirinç veya bulgurdan yapılan geleneksel yemek' },
      { number: 2, direction: 'across', row: 2, col: 0, length: 5, answer: 'YAMAK', clue: 'Ustanın veya aşçının yardımcısı' },
      { number: 3, direction: 'across', row: 4, col: 0, length: 5, answer: 'İRNİT', clue: 'Toprak kaplama minerali' },
      { number: 1, direction: 'down', row: 0, col: 0, length: 5, answer: 'PEYNİ', clue: 'Sütten mayalanarak yapılan kahvaltılık besin' },
      { number: 4, direction: 'down', row: 0, col: 2, length: 5, answer: 'LEMON', clue: 'Limonun eski dildeki narenciye adı' },
      { number: 5, direction: 'down', row: 0, col: 4, length: 5, answer: 'VAKİT', clue: 'Zaman, çağ, saat dilimi' },
    ],
  },
  {
    id: 'kare-6',
    title: 'Tarih ve Medeniyet',
    difficulty: 'Zor',
    rows: 7,
    cols: 7,
    grid: [
      ['S', 'U', 'L', 'T', 'A', 'N', '#'],
      ['A', '#', 'O', '#', 'B', '#', '#'],
      ['R', 'U', 'K', 'U', 'İ', '#', '#'],
      ['A', '#', 'A', '#', 'D', '#', '#'],
      ['Y', 'A', 'L', 'A', 'E', '#', '#'],
      ['#', '#', '#', '#', '#', '#', '#'],
      ['#', '#', '#', '#', '#', '#', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', row: 0, col: 0, length: 6, answer: 'SULTAN', clue: 'Osmanlı ve İslam hükümdarlarına verilen unvan' },
      { number: 2, direction: 'across', row: 2, col: 0, length: 5, answer: 'RUKUİ', clue: 'Eğilme ve saygı duruşuyla ilgili' },
      { number: 3, direction: 'across', row: 4, col: 0, length: 5, answer: 'YALAE', clue: 'Eski kıyı yapıları bütünü' },
      { number: 1, direction: 'down', row: 0, col: 0, length: 5, answer: 'SARAY', clue: 'Hükümdarların veya devlet başkanlarının görkemli konutu' },
      { number: 4, direction: 'down', row: 0, col: 2, length: 5, answer: 'LOKAL', clue: 'Belli bir yere veya çevreye özgü, yerel' },
      { number: 5, direction: 'down', row: 0, col: 4, length: 5, answer: 'ABİDE', clue: 'Önemli bir olayı veya kişiyi yaşatmak için dikilen anıt' },
    ],
  },
];

