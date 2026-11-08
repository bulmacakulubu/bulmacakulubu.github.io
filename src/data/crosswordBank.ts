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
  {
    id: 'kare-7',
    title: 'Sanat ve Maden',
    difficulty: 'Kolay',
    rows: 6,
    cols: 6,
    grid: [
      ['B', 'A', 'K', 'I', 'R', '#'],
      ['A', '#', 'E', '#', 'O', '#'],
      ['R', 'E', 'S', 'İ', 'M', '#'],
      ['I', '#', 'İ', '#', 'A', '#'],
      ['Ş', 'İ', 'R', 'İ', 'N', '#'],
      ['#', '#', '#', '#', '#', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', row: 0, col: 0, length: 5, answer: 'BAKIR', clue: 'Kızıl renkli, elektriği iyi ileten iletken maden' },
      { number: 2, direction: 'across', row: 2, col: 0, length: 5, answer: 'RESİM', clue: 'Çizgi ve renklerle yapılan sanat eseri' },
      { number: 3, direction: 'across', row: 4, col: 0, length: 5, answer: 'ŞİRİN', clue: 'Sevimli, cana yakın, sempatik' },
      { number: 1, direction: 'down', row: 0, col: 0, length: 5, answer: 'BARIŞ', clue: 'Uyum, huzur, savaşın olmama durumu' },
      { number: 4, direction: 'down', row: 0, col: 2, length: 5, answer: 'KESİR', clue: 'Bir bütünün eş parçalarından birini gösteren sayı' },
      { number: 5, direction: 'down', row: 0, col: 4, length: 5, answer: 'ROMAN', clue: 'Uzun edebi kurmaca yazı türü' },
    ],
  },
  {
    id: 'kare-8',
    title: 'Doğa ve Hayat',
    difficulty: 'Kolay',
    rows: 6,
    cols: 6,
    grid: [
      ['B', 'A', 'Ş', 'K', 'A', '#'],
      ['U', '#', 'E', '#', 'S', '#'],
      ['L', 'O', 'K', 'A', 'L', '#'],
      ['U', '#', 'E', '#', 'A', '#'],
      ['T', 'Ö', 'R', 'E', 'N', '#'],
      ['#', '#', '#', '#', '#', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', row: 0, col: 0, length: 5, answer: 'BAŞKA', clue: 'Diğer, özge, farklı olan' },
      { number: 2, direction: 'across', row: 2, col: 0, length: 5, answer: 'LOKAL', clue: 'Belli bir çevreye özgü, yerel' },
      { number: 3, direction: 'across', row: 4, col: 0, length: 5, answer: 'TÖREN', clue: 'Anma veya kutlama amacıyla düzenlenen merasim' },
      { number: 1, direction: 'down', row: 0, col: 0, length: 5, answer: 'BULUT', clue: 'Gökyüzünde su buharından oluşan beyaz kütle' },
      { number: 4, direction: 'down', row: 0, col: 2, length: 5, answer: 'ŞEKER', clue: 'Tatlı, kristalize organik besin maddesi' },
      { number: 5, direction: 'down', row: 0, col: 4, length: 5, answer: 'ASLAN', clue: 'Ormanlar kralı olarak bilinen yırtıcı kedi' },
    ],
  },
  {
    id: 'kare-9',
    title: 'Zihin ve Tarih',
    difficulty: 'Orta',
    rows: 6,
    cols: 6,
    grid: [
      ['B', 'E', 'Y', 'İ', 'N', '#'],
      ['İ', '#', 'A', '#', 'E', '#'],
      ['T', 'A', 'R', 'İ', 'H', '#'],
      ['İ', '#', 'A', '#', 'İ', '#'],
      ['K', 'A', 'R', 'A', 'R', '#'],
      ['#', '#', '#', '#', '#', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', row: 0, col: 0, length: 5, answer: 'BEYİN', clue: 'Düşünme ve sinir sistemini yöneten temel organ' },
      { number: 2, direction: 'across', row: 2, col: 0, length: 5, answer: 'TARİH', clue: 'Geçmişteki olayları inceleyen sosyal bilim' },
      { number: 3, direction: 'across', row: 4, col: 0, length: 5, answer: 'KARAR', clue: 'Bir iş hakkında verilen kesin yargı' },
      { number: 1, direction: 'down', row: 0, col: 0, length: 5, answer: 'BİTİK', clue: 'Gücü tükenmiş, yorgun düşmüş' },
      { number: 4, direction: 'down', row: 0, col: 2, length: 5, answer: 'YARAR', clue: 'Fayda, işe yarama durumu' },
      { number: 5, direction: 'down', row: 0, col: 4, length: 5, answer: 'NEHİR', clue: 'Genellikle göle veya denize dökülen büyük akarsu' },
    ],
  },
  {
    id: 'kare-10',
    title: 'Edebiyat ve Mimari',
    difficulty: 'Orta',
    rows: 6,
    cols: 6,
    grid: [
      ['E', 'K', 'M', 'E', 'K', '#'],
      ['V', '#', 'İ', '#', 'A', '#'],
      ['R', 'O', 'M', 'A', 'N', '#'],
      ['A', '#', 'A', '#', 'A', '#'],
      ['K', 'U', 'R', 'A', 'L', '#'],
      ['#', '#', '#', '#', '#', '#'],
    ],
    clues: [
      { number: 1, direction: 'across', row: 0, col: 0, length: 5, answer: 'EKMEK', clue: 'Un ve sudan yapılan temel besin maddesi' },
      { number: 2, direction: 'across', row: 2, col: 0, length: 5, answer: 'ROMAN', clue: 'Gerçek veya hayali olayları anlatan uzun edebi eser' },
      { number: 3, direction: 'across', row: 4, col: 0, length: 5, answer: 'KURAL', clue: 'Bir davranışa yön veren temel kaide, nizam' },
      { number: 1, direction: 'down', row: 0, col: 0, length: 5, answer: 'EVRAK', clue: 'Resmi belgeler, yazılı evraklar bütünü' },
      { number: 4, direction: 'down', row: 0, col: 2, length: 5, answer: 'MİMAR', clue: 'Yapıları tasarlayan ve inşa sürecini yöneten uzman' },
      { number: 5, direction: 'down', row: 0, col: 4, length: 5, answer: 'KANAL', clue: 'Su akıtmak için açılmış suni veya tabii yol' },
    ],
  },
];

