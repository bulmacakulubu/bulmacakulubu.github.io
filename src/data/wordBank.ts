// Expanded Curated Word Banks and Clues for Bulmaca Kulübü
// Provides rich vocabulary across Turkish and English for all word games.

export interface HangmanPuzzle {
  word: string;
  category: string;
  hint: string;
}

export interface ConnectionGroup {
  category: string;
  words: [string, string, string, string];
  level: 1 | 2 | 3 | 4; // 1: Yellow (Easy), 2: Green (Medium), 3: Blue (Tricky), 4: Purple (Expert)
}

export interface ConnectionSet {
  id: number;
  name: string;
  groups: [ConnectionGroup, ConnectionGroup, ConnectionGroup, ConnectionGroup];
}

// ==========================================
// 1. KELİME BULMACA (WORDLE) POOLS
// ==========================================
export const WORDLE_WORDS_TR = {
  5: [
    'KİTAP', 'KALEM', 'DENİZ', 'BULUT', 'BİLGİ', 'MASAL', 'GÜNEŞ', 'ÇİÇEK',
    'BAHAR', 'ORMAN', 'NEHİR', 'ŞEHİR', 'HAYAT', 'HUZUR', 'GURUR', 'ŞAFAK',
    'ÇINAR', 'DÜNYA', 'SEVGİ', 'GÖNÜL', 'SABIR', 'MELEK', 'BAŞAK', 'KAVAK',
    'YONCA', 'DORUK', 'MERAK', 'UMRAN', 'ÖZGÜR', 'BARIŞ', 'CESUR', 'KADİR',
    'DERYA', 'İKLİM', 'SERİN', 'FERAH', 'SOLUK', 'PETEK', 'KUTUP', 'YILDI',
    'GÖLGE', 'KORUK', 'TARLA', 'YAYLA', 'ÇAYIR', 'GÜNEŞ', 'KUMRU', 'ŞAHİN',
    'KARTL', 'KIRAL', 'SARAY', 'KUBBE', 'MİRAS', 'YELKE', 'KÜREK', 'LİMAN',
    'FİDAN', 'TOPRA', 'TOHUM', 'ÇINAR', 'SÖĞÜT', 'KAYIN', 'DEFNE', 'BADEM'
  ],
  7: [
    'PENCERE', 'KELEBEK', 'ARKADAŞ', 'ANADOLU', 'MERHABA', 'ÇALIŞMA',
    'TELEFON', 'IHLAMUR', 'GÖKYÜZÜ', 'ENGİNAR', 'FASULYE', 'ISPANAK',
    'DOMATES', 'KESTANE', 'OKYANUS', 'MÜHENDİ', 'SANATÇI', 'FIRTINA',
    'PAPATYA', 'YAĞMURL', 'RÜZGARL', 'PUSULA', 'GÖKKUŞA', 'YILDIZL',
    'ŞELALEL', 'MUCİZEV', 'KAHRAMA', 'KILAVUZ', 'BİLGELİ', 'CESARET',
    'HARİKAY', 'BERRAKL', 'KUSURSU', 'SEVİMLİ', 'DÜZENLİ', 'SEVECEN',
    'PAYLAŞI', 'KARDEŞL', 'ADALETL', 'SAMİMİY', 'GÜVENLİ', 'SAĞLAMC',
    'ÜREKENL', 'BAŞARIL', 'AZİMLİC', 'YETENEK', 'ÇEVİKLİ', 'HAYALPE'
  ],
  9: [
    'KARDEŞLİK', 'DÜRÜSTLÜK', 'CÖMERTLİK', 'SAMİMİYET', 'CESARETLİ',
    'FEDAKARCA', 'KAHRAMANİ', 'BİLİMSELİ', 'ÖZGÜRLÜĞÜ', 'YARATICIL',
    'TOLERANSL', 'KÜTÜPHANE', 'ÜNİVERSİT', 'CUMHURİYE', 'GELİŞMİŞL',
    'HAYALPERE', 'KUSURSUZL', 'MİSAFİRPE', 'DOSTPERVE', 'SAYGIDEĞE',
    'YARDIMSEV', 'SORUMLULU', 'MÜCADELEC', 'KARARLILI', 'YENİLİKÇİ'
  ]
};

export const WORDLE_WORDS_EN = {
  5: [
    'APPLE', 'BREAD', 'CHAIR', 'DREAM', 'EARTH', 'FLAME', 'GRAPE', 'HEART',
    'LIGHT', 'MUSIC', 'OCEAN', 'PLANT', 'RIVER', 'SMILE', 'TRAIN', 'WATER',
    'WORLD', 'YOUTH', 'STORM', 'CLOUD', 'PEACE', 'SHINE', 'SPACE', 'TIGER',
    'BEACH', 'BRAVE', 'CLOCK', 'DANCE', 'EAGLE', 'FAITH', 'GIANT', 'HONEY',
    'HOUSE', 'ISLAND', 'JEWEL', 'LEMON', 'MAGIC', 'NIGHT', 'NOBLE', 'PIANO',
    'QUEEN', 'ROYAL', 'SHARP', 'SILVER', 'STONE', 'SUGAR', 'TOWER', 'UNITY',
    'VOICE', 'WHALE', 'WHEAT', 'ZEBRA', 'BLOOM', 'CHARM', 'CROWN', 'FROST'
  ],
  7: [
    'JOURNEY', 'MORNING', 'FREEDOM', 'WEATHER', 'SUNSHINE', 'HARMONY',
    'VICTORY', 'NATURAL', 'STUDENT', 'PURPOSE', 'STATION', 'COUNTRY',
    'PERFECT', 'PROMISE', 'SCIENCE', 'BALANCE', 'WELCOME', 'THOUGHT',
    'DIAMOND', 'EXPLORE', 'FEATHER', 'GARDNER', 'HORIZON', 'IMAGINE',
    'JUSTICE', 'KINGDOM', 'LANTERN', 'MIRACLE', 'MYSTERY', 'NETWORK',
    'OUTLOOK', 'PASSION', 'RAINBOW', 'SILENCE', 'TRIUMPH', 'VILLAGE'
  ],
  9: [
    'CHALLENGE', 'EDUCATION', 'HAPPINESS', 'KNOWLEDGE', 'ADVENTURE',
    'DISCOVERY', 'LANDSCAPE', 'CELEBRATE', 'BEAUTIFUL', 'CREATIVITY',
    'CONFIDENCE', 'COMMUNITY', 'FANTASTIC', 'WONDERFUL', 'BRILLIANT',
    'COURAGEOU', 'EXPERIENC', 'FRIENDSHI', 'GENERATIO', 'HARMONIOU'
  ]
};

// ==========================================
// 2. ADAM ASMACA (HANGMAN) POOLS
// ==========================================
export const HANGMAN_PUZZLES_TR: HangmanPuzzle[] = [
  { word: 'ANITKABİR', category: 'Tarih', hint: 'Ankara\'daki Anıtmezar' },
  { word: 'ÇANAKKALE', category: 'Tarih', hint: '1915 Tarihi Boğaz Zaferi ve Şehitlik' },
  { word: 'MALAZGİRT', category: 'Tarih', hint: '1071 Anadolu Kapısını Açan Meydan Savaşı' },
  { word: 'OSMANLI', category: 'Tarih', hint: '600 Yıllık Tarihi Türk İmparatorluğu' },
  { word: 'GÖBEKLİTEPE', category: 'Tarih', hint: 'Tarihin Bilinen En Eski Tapınağı' },
  { word: 'SÜLEYMANİYE', category: 'Tarih', hint: 'Mimar Sinan\'ın Kalfalık Şaheseri Cami' },
  { word: 'TOPKAPI', category: 'Tarih', hint: 'Osmanlı Padişahlarının Tarihi Sarayı' },
  { word: 'KAPADOKYA', category: 'Coğrafya', hint: 'Peribacalarıyla Ünlü Turistik Bölge' },
  { word: 'AĞRI', category: 'Coğrafya', hint: 'Türkiye\'nin En Yüksek Dağı' },
  { word: 'VAN', category: 'Coğrafya', hint: 'Türkiye\'nin En Büyük Sodalı Gölü' },
  { word: 'PAMUKKALE', category: 'Coğrafya', hint: 'Denizli\'deki Beyaz Travertenler' },
  { word: 'KARADENİZ', category: 'Coğrafya', hint: 'Türkiye\'nin Kuzeyindeki Deniz' },
  { word: 'TOROSLAR', category: 'Coğrafya', hint: 'Akdeniz Boyunca Uzanan Sıradağlar' },
  { word: 'FIRAT', category: 'Coğrafya', hint: 'Basra\'ya Dökülen Büyük Tarihi Nehir' },
  { word: 'SAKARYA', category: 'Coğrafya', hint: 'Milli Mücadele Meydan Muharebesi ve Nehir' },
  { word: 'GALATASARAY', category: 'Spor', hint: 'Sarı-Kırmızı Renkli Spor Kulübü' },
  { word: 'FENERBAHÇE', category: 'Spor', hint: 'Sarı-Lacivert Renkli Spor Kulübü' },
  { word: 'BEŞİKTAŞ', category: 'Spor', hint: 'Siyah-Beyaz Renkli Spor Kulübü' },
  { word: 'TRABZONSPOR', category: 'Spor', hint: 'Bordo-Mavi Renkli Spor Kulübü' },
  { word: 'OKÇULUK', category: 'Spor', hint: 'Ok ve Yay ile Yapılan Hedef Sporu' },
  { word: 'GÜREŞ', category: 'Spor', hint: 'Minderde Yapılan Geleneksel Ata Sporu' },
  { word: 'CİRİT', category: 'Spor', hint: 'At Sırtında Süngü Atılan Ata Sporu' },
  { word: 'TELESKOP', category: 'Bilim', hint: 'Gök Cisimlerini İnceleyen Optik Alet' },
  { word: 'MİKROSKOP', category: 'Bilim', hint: 'Mikroskobik Hücreleri Büyüten Cihaz' },
  { word: 'FOTOSENTEZ', category: 'Bilim', hint: 'Bitkilerin Işıkla Besin Üretme Süreci' },
  { word: 'GRAVİTASYON', category: 'Bilim', hint: 'Cisimleri Merkeze Çeken Kütleçekim Kuvveti' },
  { word: 'MOLEKÜL', category: 'Bilim', hint: 'Atomların Kimyasal Bağla Birleştiği Yapı' },
  { word: 'EVRİM', category: 'Bilim', hint: 'Canlı Türlerinin Zamanla Değişimi Teorisi' },
  { word: 'GALAKSİ', category: 'Bilim', hint: 'Milyarlarca Yıldız Barındıran Gökada' },
  { word: 'SAFİR', category: 'Maden & Taş', hint: 'Değerli Mavi Mücevher Taşı' },
  { word: 'SAFAHAT', category: 'Edebiyat', hint: 'Mehmet Akif Ersoy\'un Şiir Külliyatı' },
  { word: 'YUNUS EMRE', category: 'Edebiyat', hint: 'Halk Şairi ve Tasavvuf Düşünürü' },
  { word: 'MEVLANA', category: 'Edebiyat', hint: 'Mesnevi\'nin Müellifi Tasavvuf Düşünürü' },
  { word: 'KUTADGU BİLİG', category: 'Edebiyat', hint: 'Yusuf Has Hacib\'in Mutluluk Veren Eseri' },
  { word: 'TİYATRO', category: 'Sanat', hint: 'Sahnede Oyuncularla Sergilenen Gösteri Sanatı' },
  { word: 'HEYKEL', category: 'Sanat', hint: 'Taş veya Mermerden Yontulan Sanat Eseri' },
  { word: 'PİYANO', category: 'Müzik', hint: 'Tuşlu Büyük Müzik Enstrümanı' },
  { word: 'BAĞLAMA', category: 'Müzik', hint: 'Geleneksel Telli Halk Müziği Enstrümanı' },
  { word: 'KANUN', category: 'Müzik', hint: 'Mızrapla Çalınan Telli Türk Müziği Enstrümanı' },
  { word: 'KEMAN', category: 'Müzik', hint: 'Yay ile Çalınan Küçük Telli Enstrüman' }
];

export const HANGMAN_PUZZLES_EN: HangmanPuzzle[] = [
  { word: 'COLOSSEUM', category: 'History', hint: 'Gladiator' },
  { word: 'PYRAMIDS', category: 'History', hint: 'Pharaoh' },
  { word: 'PARTHENON', category: 'History', hint: 'Athens' },
  { word: 'WATERLOO', category: 'History', hint: 'Napoleon' },
  { word: 'STONEHENGE', category: 'History', hint: 'Monolith' },
  { word: 'RENAISSANCE', category: 'History', hint: 'Rebirth' },
  { word: 'EVEREST', category: 'Geography', hint: 'Summit' },
  { word: 'AMAZON', category: 'Geography', hint: 'Rainforest' },
  { word: 'SAHARA', category: 'Geography', hint: 'Desert' },
  { word: 'PACIFIC', category: 'Geography', hint: 'Ocean' },
  { word: 'ALPS', category: 'Geography', hint: 'Mountains' },
  { word: 'NIAGARA', category: 'Geography', hint: 'Waterfall' },
  { word: 'TELESCOPE', category: 'Science', hint: 'Cosmos' },
  { word: 'MICROSCOPE', category: 'Science', hint: 'Cell' },
  { word: 'GRAVITY', category: 'Science', hint: 'Newton' },
  { word: 'QUANTUM', category: 'Science', hint: 'Physics' },
  { word: 'DNA', category: 'Science', hint: 'Helix' },
  { word: 'EVOLUTION', category: 'Science', hint: 'Darwin' },
  { word: 'SHAKESPEARE', category: 'Literature', hint: 'Playwright' },
  { word: 'ODYSSEY', category: 'Literature', hint: 'Homer' },
  { word: 'HAMLET', category: 'Literature', hint: 'Prince' },
  { word: 'MARATHON', category: 'Sports', hint: 'Run' },
  { word: 'WIMBLEDON', category: 'Sports', hint: 'Tennis' },
  { word: 'OLYMPICS', category: 'Sports', hint: 'Rings' },
  { word: 'SYMPHONY', category: 'Music', hint: 'Orchestra' },
  { word: 'CINEMA', category: 'Art', hint: 'Film' }
];

// ==========================================
// 3. BAĞLANTILAR (CONNECTIONS) SETS
// ==========================================
export const CONNECTIONS_SETS_TR: ConnectionSet[] = [
  {
    id: 1,
    name: 'Klasik Başlangıç',
    groups: [
      { category: 'Hava Durumu Olayları', words: ['YAĞMUR', 'DOLU', 'KAR', 'RÜZGAR'], level: 1 },
      { category: 'Narenciye Meyveleri', words: ['LİMON', 'PORTAKAL', 'MANDALİNA', 'GREYFURT'], level: 2 },
      { category: 'Yazı ve Çizim Araçları', words: ['KALEM', 'FIRCASI', 'DOLMAKALEM', 'TEBEŞİR'], level: 3 },
      { category: '"BAŞ" ile Başlayan Kelimeler', words: ['BAŞARI', 'BAŞKENT', 'BAŞKAN', 'BAŞLANGIÇ'], level: 4 }
    ]
  },
  {
    id: 2,
    name: 'Coğrafya & Doğa',
    groups: [
      { category: 'Su Kütleleri', words: ['DENİZ', 'OKYANUS', 'GÖL', 'NEHİR'], level: 1 },
      { category: 'Ağaç Türleri', words: ['MEŞE', 'ÇINAR', 'ZEYTİN', 'GÜRGEN'], level: 2 },
      { category: 'Satranç Taşları', words: ['PİYON', 'KALE', 'AT', 'VEZİR'], level: 3 },
      { category: '"DEMİR" İçeren Kavramlar', words: ['DEMİRYOLU', 'DEMİRBAŞ', 'PARMAKLIK', 'DÖKÜM'], level: 4 }
    ]
  },
  {
    id: 3,
    name: 'Mutfak & Sanat',
    groups: [
      { category: 'Tatlı Çeşitleri', words: ['BAKLAVA', 'KÜNEFE', 'SÜTLAÇ', 'KAZANDİBİ'], level: 1 },
      { category: 'Müzik Aletleri', words: ['GİTAR', 'KEMAN', 'DAVUL', 'PİYANO'], level: 2 },
      { category: 'Geometrik Şekiller', words: ['ÜÇGEN', 'KARE', 'DAİRE', 'ELİPS'], level: 3 },
      { category: '"AYAK" Kelimesinin Kullanıldığı Yerler', words: ['MASA', 'KÖPRÜ', 'MERDİVEN', 'SEHPA'], level: 4 }
    ]
  },
  {
    id: 4,
    name: 'Gökyüzü & Bilim',
    groups: [
      { category: 'Gezegenler', words: ['MARS', 'JÜPİTER', 'VENÜS', 'SATÜRN'], level: 1 },
      { category: 'Maddenin Halleri', words: ['KATI', 'SIVI', 'GAZ', 'PLAZMA'], level: 2 },
      { category: 'Değerli Taşlar', words: ['ELMAS', 'ZÜMRÜT', 'YAKUT', 'SAFİR'], level: 3 },
      { category: '"YILDIZ" Kelimesiyle Tamamlananlar', words: ['KUTUP', 'DENİZ', 'SİNEMA', 'GÖKTAŞI'], level: 4 }
    ]
  },
  {
    id: 5,
    name: 'Ev & Yaşam',
    groups: [
      { category: 'Oturma Odası Eşyaları', words: ['KOLTUK', 'SEHPA', 'HALI', 'KİTAPLIK'], level: 1 },
      { category: 'Kıyafet Türleri', words: ['GÖMLEK', 'PANTOLON', 'CEKET', 'KAZAK'], level: 2 },
      { category: 'Spor Branşları', words: ['FUTBOL', 'BASKETBOL', 'VOLEYBOL', 'TENİS'], level: 3 },
      { category: '"KOL" Sözcüğüyle İlintili Nesneler', words: ['KAPI', 'DİREKSİYON', 'SAAT', 'KOLTUK'], level: 4 }
    ]
  },
  {
    id: 6,
    name: 'Zeka & Strateji',
    groups: [
      { category: 'Duyu Organları', words: ['GÖZ', 'KULAK', 'BURUN', 'DİL'], level: 1 },
      { category: 'Köpek Cinsleri', words: ['KANGAL', 'GOLDEN', 'TERRIER', 'BULLDOG'], level: 2 },
      { category: 'Para Birimleri', words: ['LİRA', 'DOLAR', 'EURO', 'STERLİN'], level: 3 },
      { category: 'Başına "GÖZ" Alan Kelimeler', words: ['LÜK', 'LEME', 'KULAK', 'NURU'], level: 4 }
    ]
  },
  {
    id: 7,
    name: 'Zaman & Ölçüm',
    groups: [
      { category: 'Zaman Birimleri', words: ['SANİYE', 'DAKİKA', 'SAAT', 'GÜN'], level: 1 },
      { category: 'Mevsimler', words: ['İLKBAHAR', 'YAZ', 'SONBAHAR', 'KIŞ'], level: 2 },
      { category: 'Yönler', words: ['KUZEY', 'GÜNEY', 'DOĞU', 'BATI'], level: 3 },
      { category: '"SAAT" İle Eşleşenler', words: ['KOL', 'DUVAR', 'KUM', 'GUGUKLU'], level: 4 }
    ]
  },
  {
    id: 8,
    name: 'Tarih & Medeniyet',
    groups: [
      { category: 'Eski Uygarlıklar', words: ['SÜMER', 'HİTİT', 'ROMA', 'MISIR'], level: 1 },
      { category: 'Mimari Yapılar', words: ['CAMİ', 'KİLİSE', 'SARAY', 'KALE'], level: 2 },
      { category: 'Yazı Malzemeleri', words: ['PAPİRÜS', 'PARŞÖMEN', 'KAĞIT', 'KİL'], level: 3 },
      { category: '"TAŞ" İle Biten Şeyler', words: ['YAPI', 'MİL', 'YOL', 'SABIR'], level: 4 }
    ]
  }
];

export const CONNECTIONS_SETS_EN: ConnectionSet[] = [
  {
    id: 1,
    name: 'Classic Starter',
    groups: [
      { category: 'Weather Phenomena', words: ['RAIN', 'SNOW', 'HAIL', 'WIND'], level: 1 },
      { category: 'Citrus Fruits', words: ['LEMON', 'LIME', 'ORANGE', 'GRAPEFRUIT'], level: 2 },
      { category: 'Chess Pieces', words: ['PAWN', 'ROOK', 'KNIGHT', 'BISHOP'], level: 3 },
      { category: 'Words Before "BOARD"', words: ['DASH', 'KEY', 'SKATE', 'SURF'], level: 4 }
    ]
  },
  {
    id: 2,
    name: 'Nature & Tech',
    groups: [
      { category: 'Bodies of Water', words: ['OCEAN', 'RIVER', 'LAKE', 'STREAM'], level: 1 },
      { category: 'Computer Hardware', words: ['MOUSE', 'SCREEN', 'KEYBOARD', 'DRIVE'], level: 2 },
      { category: 'Precious Gems', words: ['RUBY', 'DIAMOND', 'EMERALD', 'SAPPHIRE'], level: 3 },
      { category: 'Things With Wings', words: ['AIRPLANE', 'BUTTERFLY', 'BIRD', 'ANGEL'], level: 4 }
    ]
  },
  {
    id: 3,
    name: 'Colors & Shapes',
    groups: [
      { category: 'Geometric Shapes', words: ['SQUARE', 'CIRCLE', 'TRIANGLE', 'HEXAGON'], level: 1 },
      { category: 'Card Suits', words: ['HEARTS', 'DIAMONDS', 'SPADES', 'CLUBS'], level: 2 },
      { category: 'Musical Instruments', words: ['PIANO', 'GUITAR', 'VIOLIN', 'FLUTE'], level: 3 },
      { category: 'Words Before "BALL"', words: ['BASE', 'BASKET', 'FOOT', 'SNOW'], level: 4 }
    ]
  },
  {
    id: 4,
    name: 'Kitchen & Table',
    groups: [
      { category: 'Eating Utensils', words: ['FORK', 'SPOON', 'KNIFE', 'CHOPSTICKS'], level: 1 },
      { category: 'Cooking Methods', words: ['BAKE', 'BOIL', 'FRY', 'ROAST'], level: 2 },
      { category: 'Hot Beverages', words: ['COFFEE', 'TEA', 'COCOA', 'CIDER'], level: 3 },
      { category: 'Things That Are Ring-Shaped', words: ['DONUT', 'BAGEL', 'WHEEL', 'RING'], level: 4 }
    ]
  },
  {
    id: 5,
    name: 'Cosmos & Science',
    groups: [
      { category: 'Planets', words: ['MARS', 'VENUS', 'JUPITER', 'SATURN'], level: 1 },
      { category: 'States of Matter', words: ['SOLID', 'LIQUID', 'GAS', 'PLASMA'], level: 2 },
      { category: 'Units of Time', words: ['SECOND', 'MINUTE', 'HOUR', 'CENTURY'], level: 3 },
      { category: 'Words Before "LIGHT"', words: ['SUN', 'MOON', 'FLASH', 'TRAFFIC'], level: 4 }
    ]
  }
];

// ==========================================
// 4. KELİME TÜRETME HARF HAVUZLARI
// ==========================================
export const SCRABBLE_POOLS_TR = [
  [
    { letter: 'A', points: 1 },
    { letter: 'R', points: 1 },
    { letter: 'T', points: 1 },
    { letter: 'Ç', points: 4 },
    { letter: 'İ', points: 1 },
    { letter: 'H', points: 5 },
    { letter: 'E', points: 1 },
  ],
  [
    { letter: 'K', points: 1 },
    { letter: 'A', points: 1 },
    { letter: 'L', points: 1 },
    { letter: 'E', points: 1 },
    { letter: 'M', points: 2 },
    { letter: 'L', points: 1 },
    { letter: 'İ', points: 1 },
  ],
  [
    { letter: 'S', points: 2 },
    { letter: 'A', points: 1 },
    { letter: 'N', points: 1 },
    { letter: 'A', points: 1 },
    { letter: 'T', points: 1 },
    { letter: 'Ç', points: 4 },
    { letter: 'I', points: 2 },
  ],
  [
    { letter: 'D', points: 3 },
    { letter: 'E', points: 1 },
    { letter: 'N', points: 1 },
    { letter: 'İ', points: 1 },
    { letter: 'Z', points: 4 },
    { letter: 'L', points: 1 },
    { letter: 'İ', points: 1 },
  ],
  [
    { letter: 'G', points: 5 },
    { letter: 'Ü', points: 3 },
    { letter: 'N', points: 1 },
    { letter: 'E', points: 1 },
    { letter: 'Ş', points: 4 },
    { letter: 'L', points: 1 },
    { letter: 'İ', points: 1 },
  ],
  [
    { letter: 'T', points: 1 },
    { letter: 'O', points: 2 },
    { letter: 'P', points: 7 },
    { letter: 'R', points: 1 },
    { letter: 'A', points: 1 },
    { letter: 'K', points: 1 },
    { letter: 'L', points: 1 },
  ]
];

export const SCRABBLE_POOLS_EN = [
  [
    { letter: 'C', points: 3 },
    { letter: 'A', points: 1 },
    { letter: 'S', points: 1 },
    { letter: 'T', points: 1 },
    { letter: 'L', points: 1 },
    { letter: 'E', points: 1 },
    { letter: 'S', points: 1 },
  ],
  [
    { letter: 'P', points: 3 },
    { letter: 'L', points: 1 },
    { letter: 'A', points: 1 },
    { letter: 'N', points: 1 },
    { letter: 'E', points: 1 },
    { letter: 'T', points: 1 },
    { letter: 'S', points: 1 },
  ],
  [
    { letter: 'S', points: 1 },
    { letter: 'P', points: 3 },
    { letter: 'R', points: 1 },
    { letter: 'I', points: 1 },
    { letter: 'N', points: 1 },
    { letter: 'G', points: 2 },
    { letter: 'S', points: 1 },
  ],
  [
    { letter: 'M', points: 3 },
    { letter: 'A', points: 1 },
    { letter: 'S', points: 1 },
    { letter: 'T', points: 1 },
    { letter: 'E', points: 1 },
    { letter: 'R', points: 1 },
    { letter: 'S', points: 1 },
  ],
  [
    { letter: 'F', points: 4 },
    { letter: 'L', points: 1 },
    { letter: 'O', points: 1 },
    { letter: 'W', points: 4 },
    { letter: 'E', points: 1 },
    { letter: 'R', points: 1 },
    { letter: 'S', points: 1 },
  ]
];

// ==========================================
// 5. DOĞRULAMA KELİME SÖZLÜKLERİ (VALID WORDS)
// ==========================================
// Contains comprehensive valid words for all tile sets in Scrabble / Word Chain.
export const VALID_WORDS_TR = new Set([
  // Set 1: A R T Ç İ H E
  'TARİH', 'TEHİR', 'RAHİT', 'HARİÇ', 'İHTAR', 'TAHİR', 'AHİR', 'İHRAÇ', 'ÇARE', 'ERİÇ',
  'TİRE', 'TERİ', 'HARE', 'RAHT', 'HART', 'ÇİTA', 'ÇİTE', 'AHİT', 'RAHİ', 'İTAÇ', 'TAHİ',
  'HATE', 'HİTA', 'ÇERİ', 'TERA', 'HETA', 'RAH', 'TAR', 'TİR', 'HER', 'ÇAT', 'ÇİT', 'AÇI',
  'TAÇ', 'AHİ', 'HİT', 'HİR', 'ÇEH', 'HAT', 'RET', 'TER', 'ÇAR', 'HAK', 'HİÇ', 'ATEŞ',
  // Set 2: K A L E M L İ
  'KALEM', 'KELAM', 'AMEL', 'ELMA', 'ALEM', 'LAME', 'KALE', 'LAKE', 'İMAL', 'İMLA',
  'MEAL', 'ALİM', 'İLME', 'İLKE', 'ELLİ', 'LEKE', 'AMİL', 'MALİ', 'LİMA', 'EKLA',
  'ALİL', 'MAİL', 'KLEMA', 'KAME', 'KİLE', 'LAİK', 'MAİL', 'MİLK', 'ELİK', 'ALİM',
  'KEM', 'KEL', 'KAL', 'LAL', 'LAK', 'LAM', 'MAL', 'MEY', 'İLE', 'ELİ', 'KİL', 'MİL',
  // Set 3: S A N A T Ç I
  'SANAT', 'ÇANTA', 'NAAT', 'SAAT', 'TASA', 'ANIT', 'TANI', 'ÇATI', 'SARI', 'ASIR',
  'ARTI', 'ATÇI', 'SATI', 'ANÇI', 'ASAN', 'SANA', 'TANA', 'AÇIT', 'ÇITA', 'ÇITA',
  'TAAS', 'ASTAR', 'SAN', 'NAS', 'TAN', 'TIN', 'ÇAT', 'TAÇ', 'AÇI', 'ANI', 'ATI',
  'ARI', 'SIR', 'ASI', 'AST', 'TAS', 'SAÇ', 'ÇAN', 'TAŞ', 'TAS',
  // Set 4: D E N İ Z L İ
  'DENİZ', 'DİZEL', 'DİNLİ', 'DİZE', 'DİNE', 'EZGİ', 'İZLE', 'DİLE', 'İLEN', 'DİLİ',
  'DİNİ', 'ENLİ', 'İZİN', 'İZNE', 'DİL', 'DİN', 'DİZ', 'İZİ', 'İLE', 'ZEN', 'ZİL',
  // Set 5: G Ü N E Ş L İ
  'GÜNEŞ', 'GELİŞ', 'GÜLE', 'GÜNÜ', 'NEŞE', 'GENÇ', 'ENGİ', 'ŞENG', 'İLGE', 'ENLİ',
  'ŞİLE', 'EŞLİ', 'GÜN', 'GEN', 'GÜL', 'ŞEN', 'EŞİ', 'NİL', 'İLE',
  // Set 6: T O P R A K L
  'TOPRAK', 'ORTAK', 'TOPLA', 'PARK', 'POTA', 'ORAK', 'KOTA', 'ROTA', 'KORT', 'KART',
  'KOLA', 'POLO', 'TRAP', 'PAKT', 'KALIP', 'ORAL', 'ROKA', 'TROL', 'KROP', 'PLAT',
  'PORT', 'KOR', 'TOK', 'KOT', 'POT', 'TOP', 'PAK', 'KAP', 'RAP', 'ROT', 'TOR', 'ALP',
  // Ortak Genel Türkçe Sözcükler
  'KİTAP', 'MASA', 'BİLGİ', 'ORMAN', 'NEHİR', 'ŞEHİR', 'HAYAT', 'HUZUR', 'GURUR',
  'SEVGİ', 'GÖNÜL', 'SABIR', 'MELEK', 'YILDIZ', 'DÜNYA', 'BAŞAK', 'KAVAK', 'DORUK',
  'BARIŞ', 'CESUR', 'KADİR', 'DERYA', 'İKLİM', 'SERİN', 'FERAH', 'SOLUK', 'KUTUP',
  'KORUK', 'TARLA', 'YAYLA', 'ÇAYIR', 'KUMRU', 'ŞAHİN', 'SARAY', 'KUBBE', 'MİRAS',
  'KÜREK', 'LİMAN', 'FİDAN', 'TOHUM', 'ÇINAR', 'SÖĞÜT', 'KAYIN', 'DEFNE',
  'BADEM', 'BALIK', 'KAYA', 'KOVA', 'KORU', 'PANO', 'PARA', 'PAZAR', 'TREN',
  'YOLCU', 'VAGON', 'BİLET', 'İSTASYON', 'GEMİ', 'UÇAK', 'ARABA', 'TAŞIT', 'VASITA'
]);

export const VALID_WORDS_EN = new Set([
  // Set 1: C A S T L E S
  'CASTLE', 'CASTLES', 'TALES', 'TALE', 'STALE', 'TEALS', 'TEAL', 'LATES', 'LATE',
  'SALES', 'SALE', 'SEAL', 'SEALS', 'LAST', 'LASTS', 'SALT', 'SALTS', 'SLAT', 'SLATS',
  'LEAST', 'SLATE', 'SLATES', 'ACTS', 'ACT', 'CAT', 'CATS', 'CASE', 'CASES', 'EAST',
  'EATS', 'EAT', 'SEAT', 'SEATS', 'LETS', 'LET', 'SET', 'SETS', 'LACE', 'LACES',
  'SAC', 'ALE', 'ALES', 'TEA', 'TEAS', 'ATE', 'ACE', 'ACES', 'SAT',
  // Set 2: P L A N E T S
  'PLANET', 'PLANETS', 'PLANT', 'PLANTS', 'PLANS', 'PLAN', 'PANEL', 'PANELS', 'PLATES',
  'PLATE', 'PLEAT', 'PLEATS', 'LEAPT', 'TALES', 'TALE', 'PALE', 'PALES', 'LATE',
  'LEAN', 'LEANS', 'TAPE', 'TAPES', 'PEAL', 'PEALS', 'PAST', 'PASTE', 'PEAS',
  'PLEA', 'PLEAS', 'NEAT', 'NETS', 'NET', 'PET', 'PETS', 'TAP', 'TAPS', 'PAN',
  'PANS', 'PEN', 'PENS', 'TAN', 'TANS', 'ANT', 'ANTS', 'PAT', 'PATS', 'APE', 'APES',
  // Set 3: S P R I N G S
  'SPRING', 'SPRINGS', 'RINGS', 'RING', 'GRINS', 'GRIN', 'SPIN', 'SPINS', 'PINS',
  'PIN', 'PIGS', 'PIG', 'SING', 'SINGS', 'SIGN', 'SIGNS', 'SIPS', 'SIP', 'RIPS',
  'RIP', 'SNIP', 'SNIPS', 'PINT', 'PINTS', 'SPIT', 'PITS', 'PIT', 'TIPS', 'TIP',
  'SIR', 'SINS', 'SIN', 'GRIP', 'GRIPS', 'RIG', 'RIGS', 'NIP', 'NIPS',
  // Set 4: M A S T E R S
  'MASTER', 'MASTERS', 'STARE', 'STARES', 'STREAM', 'STREAMS', 'TEAMS', 'TEAM', 'STEAM',
  'STEAMS', 'TERMS', 'TERM', 'SMART', 'SMARTS', 'TAME', 'TAMES', 'MEAT', 'MEATS',
  'MATE', 'MATES', 'STEM', 'STEMS', 'STAR', 'STARS', 'RATE', 'RATES', 'REST',
  'RESTS', 'ARMS', 'ARM', 'RAMS', 'RAM', 'SEAT', 'SEATS', 'ARTS', 'ART', 'MAT',
  'MATS', 'MET', 'SET', 'SEA', 'SEAS', 'EAR', 'EARS', 'ERA', 'ERAS',
  // Set 5: F L O W E R S
  'FLOWER', 'FLOWERS', 'FLOW', 'FLOWS', 'WOLF', 'WOLVES', 'FOWL', 'FOWLS', 'LORE',
  'LORES', 'ROLE', 'ROLES', 'SLOW', 'BLOW', 'BLOWS', 'SORE', 'ROSE', 'ROSES',
  'ROW', 'ROWS', 'LOW', 'LOWS', 'OWL', 'OWLS', 'FOR', 'REF', 'REFS', 'FOE',
  'FOES', 'RAW', 'WAR', 'WARS', 'FROST', 'LOWER', 'LOWERS', 'FEW', 'SEW',
  // Common general English words
  'APPLE', 'BREAD', 'CHAIR', 'DREAM', 'EARTH', 'FLAME', 'GRAPE', 'HEART', 'LIGHT',
  'MUSIC', 'OCEAN', 'PLANT', 'RIVER', 'SMILE', 'TRAIN', 'WATER', 'WORLD', 'YOUTH',
  'STORM', 'CLOUD', 'PEACE', 'SHINE', 'SPACE', 'TIGER', 'BEACH', 'BRAVE', 'CLOCK'
]);
