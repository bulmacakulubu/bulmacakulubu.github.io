/**
 * Bağlantılar (Connections) Sonsuz Kategori & İlişki Matrisi Motoru
 * 0 TL Maliyet - Tamamen Yerel ve Sonsuz Oynanabilir
 */

export interface Group {
  category: string;
  words: string[];
  level: 1 | 2 | 3 | 4;
  colorClass: string;
}

export interface PuzzleSet {
  id: number;
  name?: string;
  groups: [Group, Group, Group, Group];
}

const LEVEL_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: 'bg-amber-400 text-slate-900 border-amber-500',
  2: 'bg-emerald-500 text-white border-emerald-600',
  3: 'bg-blue-500 text-white border-blue-600',
  4: 'bg-purple-600 text-white border-purple-700',
};

// ==========================================
// TÜRKÇE ZENGİN KATEGORİ HAVUZU (40+ Kategori)
// ==========================================

export const CONNECTIONS_POOL_TR: { level: 1 | 2 | 3 | 4; category: string; words: string[] }[] = [
  // --- LEVEL 1 (SARI - KOLAY & BELİRGİN) ---
  { level: 1, category: 'Kahvaltı Yiyecekleri', words: ['PEYNİR', 'ZEYTİN', 'YUMURTA', 'REÇEL'] },
  { level: 1, category: 'Müzik Aletleri', words: ['GİTAR', 'PİYANO', 'KEMAN', 'FLÜT'] },
  { level: 1, category: 'Sıcak İçecekler', words: ['ÇAY', 'KAHVE', 'IHLAMUR', 'SALEP'] },
  { level: 1, category: 'Yaz Meyveleri', words: ['KARPUZ', 'KAVUN', 'ŞEFTALİ', 'KİRAZ'] },
  { level: 1, category: 'Okul Malzemeleri', words: ['DEFTER', 'KALEM', 'SİLGİ', 'CETVEL'] },
  { level: 1, category: 'Ev Odaları', words: ['SALON', 'MUTFAK', 'BANYO', 'YATAK'] },
  { level: 1, category: 'Kış Giysileri', words: ['ATKI', 'BERE', 'ELDİVEN', 'KABAN'] },
  { level: 1, category: 'Toplu Taşıma', words: ['OTOBÜS', 'METRO', 'TRAMVAY', 'VAPUR'] },
  { level: 1, category: 'Çorba Çeşitleri', words: ['MERCİMEK', 'TARHANA', 'EZOGELİN', 'YAYLA'] },
  { level: 1, category: 'Ağaç Çeşitleri', words: ['MEŞE', 'ÇAM', 'KAVAK', 'ÇINAR'] },

  // --- LEVEL 2 (YEŞİL - ORTA & TEMATİK) ---
  { level: 2, category: 'Deniz Canlıları', words: ['YUNUS', 'AHTAPOT', 'KÖPEKBALIĞI', 'MERCAN'] },
  { level: 2, category: 'Güneş Sistemi Gezegenleri', words: ['MERKÜR', 'VENÜS', 'MARS', 'JÜPİTER'] },
  { level: 2, category: 'Masa Oyunları', words: ['SATRANÇ', 'TAVLA', 'DAMA', 'SCRABBLE'] },
  { level: 2, category: 'Kış Sporları', words: ['KAYAK', 'KIZAK', 'BUZ PATENİ', 'CURLING'] },
  { level: 2, category: 'Hava Durumu Olayları', words: ['ŞİMŞEK', 'HORTUM', 'DOLU', 'SİS'] },
  { level: 2, category: 'Akdeniz Ülkeleri', words: ['İTALYA', 'İSPANYA', 'YUNANİSTAN', 'FRANSA'] },
  { level: 2, category: 'Baharat Çeşitleri', words: ['KİMYON', 'NANE', 'KEKİK', 'SUMAK'] },
  { level: 2, category: 'Doğal Afetler', words: ['DEPREM', 'SEL', 'ÇIĞ', 'TSUNAMİ'] },
  { level: 2, category: 'Geleneksel Türk Tatlıları', words: ['BAKLAVA', 'KÜNEFE', 'KAZANDİBİ', 'SÜTLAÇ'] },
  { level: 2, category: 'İletişim Araçları', words: ['TELEFON', 'MEKTUP', 'RADYO', 'TELGRAF'] },

  // --- LEVEL 3 (MAVİ - İLERİ & KÜLTÜR/BİLGİ) ---
  { level: 3, category: 'Geometrik Şekiller', words: ['KARE', 'ÜÇGEN', 'ÇEMBER', 'TRAPEZ'] },
  { level: 3, category: 'Üç Harfli Türkiye İlleri', words: ['VAN', 'MUŞ', 'VAN', 'KARS'] }, // will sanitize duplicate
  { level: 3, category: 'Yeşilçam Efsaneleri', words: ['ŞENER', 'KEMAL', 'TARIK', 'CÜNEYT'] },
  { level: 3, category: 'Osmanlı Hükümdarları', words: ['FATİH', 'KANUNİ', 'YAVUZ', 'ORHAN'] },
  { level: 3, category: 'Geleneksel Türk Çalgıları', words: ['BAĞLAMA', 'NEY', 'KANUN', 'KEMENÇE'] },
  { level: 3, category: 'Tavla Zarları Deyişleri', words: ['DÜŞEŞ', 'HEPYEK', 'DÜBEŞ', 'CİHARYEK'] },
  { level: 3, category: 'Noktalama İşaretleri', words: ['VİRGÜL', 'NOKTA', 'PARANTEZ', 'ÜNLEM'] },
  { level: 3, category: 'Felsefi Akımlar', words: ['STOACILIK', 'NİHİLİZM', 'İDEALİZM', 'REALİZM'] },
  { level: 3, category: 'İstanbul Tarihi Yarımada Semtleri', words: ['BALAT', 'FATİH', 'EMİNÖNÜ', 'BEYAZIT'] },
  { level: 3, category: 'Nobel Ödülü Alanları', words: ['FİZİK', 'KİMYA', 'EDEBİYAT', 'BARIŞ'] },

  // --- LEVEL 4 (MOR - ZOR & ÇİFT ANLAMLI / KELİME OYUNU) ---
  { level: 4, category: 'Değerli Maden ve Taşlar', words: ['ELMAS', 'ZÜMRÜT', 'YAKUT', 'SAFİR'] },
  { level: 4, category: '"Göz" İle Biten veya İlgili Deyimler', words: ['AÇIK', 'KARA', 'BEBEK', 'NUR'] },
  { level: 4, category: 'Sonuna "Hane" Gelebilen Sözcükler', words: ['POSTA', 'KÜTÜP', 'ECZA', 'DERS'] },
  { level: 4, category: 'Hem Sayı Hem Fiil Olan Kelimeler', words: ['BİN', 'YÜZ', 'ALTI', 'DÖRT'] },
  { level: 4, category: 'Hem Renk Hem Özel İsim Olanlar', words: ['AL', 'KARA', 'SARI', 'BEYAZ'] },
  { level: 4, category: 'Başına "Su" Gelebilenler', words: ['ÇİÇEĞİ', 'BÖREĞİ', 'SAMURU', 'AYGIRI'] },
  { level: 4, category: 'Satranç Taşları ve Anlamları', words: ['KALE', 'VEZİR', 'FİL', 'ŞAH'] },
  { level: 4, category: 'Gözle Görülmeyen Soyut Kavramlar', words: ['HUZUR', 'SEVGİ', 'ADALET', 'UMUT'] },
  { level: 4, category: 'Bilişim ve Kodlama Terimleri', words: ['DİZİ', 'FONKSİYON', 'DÖNGÜ', 'DEĞİŞKEN'] },
  { level: 4, category: 'Ters Yüz Edilince de Kelime Olanlar', words: ['KAZAK', 'KABAK', 'YATAY', 'NEDEN'] },
];

// Sanitize 3-letter city list
CONNECTIONS_POOL_TR[11].words = ['VAN', 'MUŞ', 'BOR', 'KAS']; // Correct distinct words

// ==========================================
// İNGİLİZCE ZENGİN KATEGORİ HAVUZU
// ==========================================

export const CONNECTIONS_POOL_EN: { level: 1 | 2 | 3 | 4; category: string; words: string[] }[] = [
  { level: 1, category: 'Breakfast Foods', words: ['BACON', 'EGG', 'PANCAKE', 'TOAST'] },
  { level: 1, category: 'Musical Instruments', words: ['GUITAR', 'PIANO', 'DRUMS', 'VIOLIN'] },
  { level: 1, category: 'Hot Drinks', words: ['COFFEE', 'TEA', 'COCOA', 'CIDER'] },
  { level: 1, category: 'School Supplies', words: ['PEN', 'PENCIL', 'ERASER', 'RULER'] },

  { level: 2, category: 'Sea Creatures', words: ['DOLPHIN', 'OCTOPUS', 'SHARK', 'CORAL'] },
  { level: 2, category: 'Solar System', words: ['MERCURY', 'VENUS', 'MARS', 'JUPITER'] },
  { level: 2, category: 'Board Games', words: ['CHESS', 'CLUE', 'RISK', 'MONOPOLY'] },
  { level: 2, category: 'Winter Sports', words: ['SKIING', 'SLEDDING', 'HOCKEY', 'CURLING'] },

  { level: 3, category: 'Geometric Shapes', words: ['SQUARE', 'TRIANGLE', 'CIRCLE', 'RHOMBUS'] },
  { level: 3, category: 'Shades of Blue', words: ['NAVY', 'AZURE', 'COBALT', 'CYAN'] },
  { level: 3, category: 'Punctuation Marks', words: ['COMMA', 'PERIOD', 'COLON', 'HYPHEN'] },
  { level: 3, category: 'Card Suits', words: ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'] },

  { level: 4, category: 'Precious Gems', words: ['DIAMOND', 'EMERALD', 'RUBY', 'SAPPHIRE'] },
  { level: 4, category: 'Things That Have Keys', words: ['PIANO', 'DOOR', 'KEYBOARD', 'MAP'] },
  { level: 4, category: 'Words Before "Ball"', words: ['FOOT', 'BASKET', 'BASE', 'SNOW'] },
  { level: 4, category: 'Palindromes', words: ['RADAR', 'KAYAK', 'LEVEL', 'ROTOR'] },
];

/**
 * Sonsuz Rastgele Bağlantılar Bulmacası Üreticisi
 * Seviye 1, 2, 3 ve 4'ten çakışmayan 4 kategori seçerek 16 kelimelik benzersiz tahta kurar.
 */
export function generateRandomConnectionsPuzzle(
  language: 'tr' | 'en',
  puzzleNumber = 1
): PuzzleSet {
  const pool = language === 'tr' ? CONNECTIONS_POOL_TR : CONNECTIONS_POOL_EN;

  const l1 = pool.filter((c) => c.level === 1);
  const l2 = pool.filter((c) => c.level === 2);
  const l3 = pool.filter((c) => c.level === 3);
  const l4 = pool.filter((c) => c.level === 4);

  // Kategori seçimi (kelime çakışması olmamasına dikkat et)
  const pickRandom = (list: typeof pool, usedWords: Set<string>) => {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    for (const item of shuffled) {
      const hasConflict = item.words.some((w) => usedWords.has(w));
      if (!hasConflict) {
        item.words.forEach((w) => usedWords.add(w));
        return item;
      }
    }
    return shuffled[0];
  };

  const used = new Set<string>();
  const g1 = pickRandom(l1, used);
  const g2 = pickRandom(l2, used);
  const g3 = pickRandom(l3, used);
  const g4 = pickRandom(l4, used);

  const groups: [Group, Group, Group, Group] = [
    { ...g1, colorClass: LEVEL_COLORS[1] },
    { ...g2, colorClass: LEVEL_COLORS[2] },
    { ...g3, colorClass: LEVEL_COLORS[3] },
    { ...g4, colorClass: LEVEL_COLORS[4] },
  ];

  return {
    id: puzzleNumber,
    groups,
  };
}
