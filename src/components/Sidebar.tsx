import React, { useState } from 'react';
import {
  Type,
  FileText,
  Search,
  UserX,
  Crown,
  Grid,
  Layers,
  Bomb,
  Sparkles,
  Settings,
  Trophy,
  Boxes,
  Grid3X3,
  LayoutGrid,
  Shuffle,
  Download,
} from 'lucide-react';
import { GameId, Track } from '../types';

interface SidebarProps {
  activeGame: GameId;
  onSelectGame: (gameId: GameId) => void;
  language: 'tr' | 'en';
  onToggleLanguage: () => void;
  onOpenSettings: () => void;
  volume: number;
  soundEnabled: boolean;
  tracks: Track[];
  onAddTracks: (tracks: Track[]) => void;
  currentTrackId: string;
  onSelectTrack: (id: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onOpenFloatingMusic?: () => void;
  isPremium?: boolean;
}

interface GameGuide {
  tag: string;
  summary: string;
  rules: string[];
  controls: string;
}

const GAME_GUIDES: Record<GameId, { tr: GameGuide; en: GameGuide }> = {
  'gunun-bulmacasi': {
    tr: {
      tag: 'Günlük Özel Meydan Okuma',
      summary: 'Her gün yenilenen ortak bulmaca ile küresel sıralamada yarışın ve kesintisiz galibiyet serisi yakalayın.',
      rules: [
        'Günün seçilen bulmacasını tamamlayıp sürenizi kaydedin.',
        'Her gün girerek aktif serinizi (streak) koruyun.',
        'Liderlik tablosunda en iyi dereceyi elde etmeye çalışın.'
      ],
      controls: 'Bulmaca türüne göre klavye veya fare'
    },
    en: {
      tag: 'Daily Challenge',
      summary: 'Compete on the synchronized leaderboard with a new challenge refreshed every 24 hours.',
      rules: [
        'Complete the selected puzzle to record your official time.',
        'Keep an unbroken streak by playing every day.',
        'Climb the global daily leaderboard ranks.'
      ],
      controls: 'Mouse or keyboard depending on game'
    }
  },
  'baglantilar': {
    tr: {
      tag: 'Kelime İlişkisi & Mantık',
      summary: '16 kelimeden oluşan ızgarada ortak bir temayı paylaşan 4 kişilik 4 gizli grubu bulun.',
      rules: [
        'Aralarında mantıksal veya tematik bağ olan 4 kelime seçip onaylayın.',
        'Renkler zorluğu belirtir: Sarı (Kolay), Yeşil, Mavi ve Mor (Ters Köşe).',
        'Toplam 4 hata hakkınız bulunur; her hata bir hak eksiltir.'
      ],
      controls: 'Kelimelere tıklayarak 4 seçim yapın'
    },
    en: {
      tag: 'Word Connections',
      summary: 'Group 16 words into 4 distinct sets of 4 that share a common underlying connection.',
      rules: [
        'Select 4 words sharing a common theme and submit.',
        'Difficulty colors: Yellow (Easiest), Green, Blue, Purple (Tricky).',
        'You have 4 mistakes before the game ends.'
      ],
      controls: 'Click words to select 4 tiles'
    }
  },
  'nonogram': {
    tr: {
      tag: 'Piksel Mantık Bulmacası',
      summary: 'Satır ve sütunlardaki sayı ipuçlarına göre kareleri boyayarak gizli piksel çizimini ortaya çıkarın.',
      rules: [
        'Sayılar, o satır veya sütundaki ardışık dolu kare bloklarının uzunluğunu belirtir.',
        'Farklı bloklar arasında en az bir adet boş kare bulunmalıdır.',
        'Boş olduğundan kesin emin olduğunuz yerlere sağ tıkla çarpı (X) koyun.'
      ],
      controls: 'Sol Tık: Boya | Sağ Tık: Çarpı (X) Koy'
    },
    en: {
      tag: 'Pixel Cross / Picross',
      summary: 'Use row and column number clues to shade cells and reveal hidden pixel artwork.',
      rules: [
        'Numbers show consecutive runs of shaded cells in that row/column.',
        'Adjacent blocks must have at least one empty square between them.',
        'Mark guaranteed empty cells with an X to narrow possibilities.'
      ],
      controls: 'Left Click: Fill | Right Click: Cross (X)'
    }
  },
  'kelime-bulmaca': {
    tr: {
      tag: 'Kelime Tahmini (Wordle)',
      summary: 'Gizli 5, 7 veya 9 harfli Türkçe kelimeyi 6 deneme hakkı içinde bulun.',
      rules: [
        'Yeşil: Harf kelimede var ve tam doğru basamakta.',
        'Sarı: Harf kelimede bulunuyor ancak basamağı farklı.',
        'Gri: Harf gizli kelimede hiç yer almıyor.'
      ],
      controls: 'Klavye ile kelime yazıp Enter tuşuna basın'
    },
    en: {
      tag: 'Word Guessing',
      summary: 'Guess the hidden 5, 7, or 9 letter secret word within 6 attempts.',
      rules: [
        'Green: Correct letter in the exact position.',
        'Yellow: Letter is in the word but in a different position.',
        'Gray: Letter does not exist in the secret word.'
      ],
      controls: 'Type letters and press Enter'
    }
  },
  'kare-bulmaca': {
    tr: {
      tag: 'Gazete Tipi Çengel Bulmaca',
      summary: 'Numaralandırılmış kare ızgarayı yatay ve dikey ipuçlarıyla kelime kelime doldurun.',
      rules: [
        'Hücreye tıklayarak yatay ve dikey yönü değiştirin.',
        'Ok tuşlarıyla ızgarada serbestçe gezinebilirsiniz.',
        'Tıkandığınızda Harf Aç butonu ile ipucu alabilirsiniz.'
      ],
      controls: 'Tıklama / Ok Tuşları / Klavye Harfleri'
    },
    en: {
      tag: 'Classic Crossword',
      summary: 'Fill the numbered crossword grid using across and down clues.',
      rules: [
        'Click a cell to switch between across and down.',
        'Navigate the grid freely using keyboard arrow keys.',
        'Use the hint button to reveal tough letters.'
      ],
      controls: 'Click / Arrow Keys / Typing'
    }
  },
  'anagram': {
    tr: {
      tag: 'Harf Çözücü & Kelime Avı',
      summary: 'Karışık harf tekerleğinden tüm geçerli hedef kelimeleri türetin ve kutucukları açın.',
      rules: [
        'Harflere sırayla dokunun veya klavyeyle doğrudan yazın.',
        'Bulduğunuz kelimeler ilgili harf sayısına göre listeye yerleşir.',
        'Hedef dışındaki geçerli kelimeler bonus yıldız puanı kazandırır.'
      ],
      controls: 'Harflere Tıklama / Klavye / Boşluk (Karıştır)'
    },
    en: {
      tag: 'Anagram Solver',
      summary: 'Form valid words from the scrambled letters to fill all target slots.',
      rules: [
        'Tap letters in order or type directly on the keyboard.',
        'Found words automatically populate the word boxes.',
        'Extra valid words grant bonus star points.'
      ],
      controls: 'Click / Typing / Space (Shuffle)'
    }
  },
  'kelime-turetme': {
    tr: {
      tag: 'Scrabble & Puan Avı',
      summary: 'Rastgele verilen 7 harfi kullanarak en yüksek puanlı Türkçe kelimeleri türetin.',
      rules: [
        'Nadir harfler (J, F, V, Ğ, P) çok daha yüksek puan çarpanı verir.',
        '7 harfin tamamını tek kelimede kullanırsanız +50 Bingo bonusu kazanırsınız.',
        'Geçerli kelimeler Türk Dil Kurumu sözlüğüyle doğrulanır.'
      ],
      controls: 'Harf taşlarına tıkla veya klavyeden yaz'
    },
    en: {
      tag: 'Anagram Scrabble',
      summary: 'Build high-scoring words from 7 letter tiles using Scrabble point weights.',
      rules: [
        'Rare letters grant higher score multipliers.',
        'Use all 7 tiles in a single turn to score a +50 Bingo bonus.',
        'Words are validated against the official dictionary.'
      ],
      controls: 'Click letter tiles or type'
    }
  },
  'sozcuk-avi': {
    tr: {
      tag: 'Gözlem & Dikkat',
      summary: 'Harf ızgarasında gizlenmiş tematik kelimeleri yatay, dikey veya çapraz bularak işaretleyin.',
      rules: [
        'Sağdaki hedef listede yer alan kelimeleri harf denizinde arayın.',
        'Kelimeler ileri, geri veya çapraz yönlerde gizlenmiş olabilir.',
        'Tüm liste bittiğinde bulmaca başarıyla tamamlanır.'
      ],
      controls: 'Fareyle basılı tutup harflerin üstünden sürükleyin'
    },
    en: {
      tag: 'Word Search',
      summary: 'Find target words hidden in horizontal, vertical, or diagonal directions.',
      rules: [
        'Search the letter grid for words listed in the target box.',
        'Words can read forward, backward, or diagonally.',
        'Highlight all targets to win the puzzle.'
      ],
      controls: 'Click and drag across letter cells'
    }
  },
  'satranc': {
    tr: {
      tag: 'Strateji & Zeka',
      summary: 'Yapay zekaya (3 zorluk) karşı veya aynı cihazda arkadaşınızla 2 kişilik klasik satranç oynayın.',
      rules: [
        'Taşa tıkladığınızda gidebileceği yasal kareler yeşil noktayla işaretlenir.',
        'Şah mat hedefleyin; rok, geçerken alma ve piyon terfisi tam desteklidir.',
        'Geri al ve tahta analizi araçlarını stratejiniz için kullanabilirsiniz.'
      ],
      controls: 'Tıkla-Tıkla veya Sürükle-Bırak'
    },
    en: {
      tag: 'Chess Strategy',
      summary: 'Play against AI (3 difficulties) or local 2-player pass-and-play chess.',
      rules: [
        'Clicking a piece displays all legal move destination squares.',
        'Aim for checkmate; castling, en passant, and promotion are supported.',
        'Use undo and move history to refine tactics.'
      ],
      controls: 'Click-to-move or Drag-and-drop'
    }
  },
  'sudoku': {
    tr: {
      tag: 'Sayısal Mantık',
      summary: '9x9 ızgarayı her satır, sütun ve 3x3 bölgede 1-9 rakamları tam birer kez olacak şekilde doldurun.',
      rules: [
        'Aynı satır, sütun veya 3x3 kutuda hiçbir rakam tekrarlanamaz.',
        'Hatalar anında tespit edilir ve eşleşen rakamlar vurgulanır.',
        'Kolay, Orta ve Zor modlarda kendinizi test edin.'
      ],
      controls: 'Klavye 1-9 / Ok Tuşları / Tıklama'
    },
    en: {
      tag: 'Number Logic',
      summary: 'Fill the 9x9 grid so every row, column, and 3x3 box contains digits 1-9.',
      rules: [
        'No duplicate numbers are allowed in any row, column, or 3x3 box.',
        'Matching digits illuminate automatically for fast scanning.',
        'Choose from Easy, Medium, and Hard difficulties.'
      ],
      controls: 'Keyboard 1-9 / Arrow Keys / Click'
    }
  },
  'kelime-zinciri': {
    tr: {
      tag: 'Söz Dağarcığı & Hız',
      summary: 'Önceki kelimenin son harfiyle başlayan yeni kelimeler bularak en uzun zinciri kurun.',
      rules: [
        'İstenen harfle başlayan geçerli bir Türkçe kelime yazın.',
        'Aynı tur içinde daha önce kullanılmış kelimeler tekrar edilemez.',
        'Süre dolmadan en uzun zinciri oluşturup rekor puanı kırın.'
      ],
      controls: 'Klavye ile yazıp Enter tuşuna basın'
    },
    en: {
      tag: 'Word Chain',
      summary: 'Create an endless word chain where each word begins with the preceding last letter.',
      rules: [
        'Enter valid words matching the designated starting letter.',
        'Words cannot be repeated in the same round.',
        'Build the longest chain before the countdown ends.'
      ],
      controls: 'Type word and press Enter'
    }
  },
  'hafiza-kartlari': {
    tr: {
      tag: 'Görsel Hafıza',
      summary: 'Kapalı kartları ikişer ikişer açarak aynı sembol veya emojileri en az hamlede eşleştirin.',
      rules: [
        'Açtığınız iki kart aynıysa açık kalır, uyuşmazsa geri kapanır.',
        'Kartların yerlerini aklınızda tutarak en az hamlede tahtayı temizleyin.',
        'Hızlı ve hatasız eşleşmeler ekstra kombo puanı kazandırır.'
      ],
      controls: 'Kartlara tıklayarak çevirin'
    },
    en: {
      tag: 'Memory Match',
      summary: 'Flip pairs of covered cards to match identical symbols in the fewest moves.',
      rules: [
        'Matching cards stay face-up; mismatches flip back over.',
        'Memorize tile placements to clear the board with minimal moves.',
        'Fast consecutive matches grant combo multipliers.'
      ],
      controls: 'Click cards to flip'
    }
  },
  'adam-asmaca': {
    tr: {
      tag: 'Klasik Tahmin',
      summary: 'Kategori ipucuna göre gizli kelimeyi 6 can hakkınız bitmeden harf harf tahmin edin.',
      rules: [
        'Doğru harfler kelimedeki boşluklara yerleşir.',
        'Hatalı her harf darağacına bir parça ekler ve 1 canınızı azaltır.',
        'Canlarınız tükenmeden kelimeyi tamamlayın.'
      ],
      controls: 'Fiziksel klavye tuşları veya harf butonları'
    },
    en: {
      tag: 'Hangman',
      summary: 'Deduce the mystery word using category hints before 6 misses run out.',
      rules: [
        'Correct guesses reveal letters in the blanks.',
        'Each wrong letter adds to the gallows and costs 1 life.',
        'Solve the word before lives run out.'
      ],
      controls: 'Physical keyboard or letter buttons'
    }
  },
  'nokta-avi': {
    tr: {
      tag: 'Refleks & Çeviklik',
      summary: '30 saniyede ekranda aniden beliren renkli hedefleri yakalayın, bombalardan kaçının.',
      rules: [
        'Yeşil ve altın hedeflere tıklayarak yüksek puan toplayın.',
        'Kırmızı noktalardan ve kurukafalı bombalardan kaçının (puan düşürür).',
        'Seri tıklamalar yaparak kombo çarpanını katlayın.'
      ],
      controls: 'Hedeflerin üzerine hızlıca tıklayın'
    },
    en: {
      tag: 'Dot Reflex Hunt',
      summary: 'Click fast-spawning targets in a 30-second reflex race while dodging hazards.',
      rules: [
        'Tap green and golden targets for bonus points.',
        'Avoid red hazard dots and bombs that deduct points.',
        'Chain rapid hits together for high combo multipliers.'
      ],
      controls: 'Click rapidly on spawning dots'
    }
  },
};

const GAME_ITEMS_TR: { id: GameId; label: string; icon: any }[] = [
  { id: 'gunun-bulmacasi', label: 'Günün Bulmacası', icon: Trophy },
  { id: 'baglantilar', label: 'Bağlantılar (Connections)', icon: Boxes },
  { id: 'nonogram', label: 'Nonogram (Piksel)', icon: Grid3X3 },
  { id: 'kelime-bulmaca', label: 'Kelime Bulmaca', icon: Type },
  { id: 'kare-bulmaca', label: 'Kare / Çengel Bulmaca', icon: LayoutGrid },
  { id: 'anagram', label: 'Anagram Çözücü', icon: Shuffle },
  { id: 'kelime-turetme', label: 'Kelime Türetme', icon: FileText },
  { id: 'sozcuk-avi', label: 'Sözcük Avı', icon: Search },
  { id: 'satranc', label: 'Satranç', icon: Crown },
  { id: 'sudoku', label: 'Sudoku', icon: Grid },
  { id: 'kelime-zinciri', label: 'Kelime Zinciri', icon: Sparkles },
  { id: 'hafiza-kartlari', label: 'Hafıza Kartları', icon: Layers },
  { id: 'adam-asmaca', label: 'Adam Asmaca', icon: UserX },
  { id: 'nokta-avi', label: 'Nokta Avı', icon: Sparkles },
];

const GAME_ITEMS_EN: { id: GameId; label: string; icon: any }[] = [
  { id: 'gunun-bulmacasi', label: 'Daily Puzzle', icon: Trophy },
  { id: 'baglantilar', label: 'Connections', icon: Boxes },
  { id: 'nonogram', label: 'Nonogram (Picross)', icon: Grid3X3 },
  { id: 'kelime-bulmaca', label: 'Word Puzzle', icon: Type },
  { id: 'kare-bulmaca', label: 'Crossword Puzzle', icon: LayoutGrid },
  { id: 'anagram', label: 'Anagram Solver', icon: Shuffle },
  { id: 'kelime-turetme', label: 'Word Builder', icon: FileText },
  { id: 'sozcuk-avi', label: 'Word Search', icon: Search },
  { id: 'satranc', label: 'Chess', icon: Crown },
  { id: 'sudoku', label: 'Sudoku', icon: Grid },
  { id: 'kelime-zinciri', label: 'Word Chain', icon: Sparkles },
  { id: 'hafiza-kartlari', label: 'Memory Cards', icon: Layers },
  { id: 'adam-asmaca', label: 'Hangman', icon: UserX },
  { id: 'nokta-avi', label: 'Dot Hunt', icon: Sparkles },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeGame,
  onSelectGame,
  language,
  onToggleLanguage,
  onOpenSettings,
  volume,
  soundEnabled,
  tracks,
  onAddTracks,
  currentTrackId,
  onSelectTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onOpenFloatingMusic,
  isPremium,
}) => {
  const [hoveredGame, setHoveredGame] = useState<{ id: GameId; top: number } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const gameItems = language === 'tr' ? GAME_ITEMS_TR : GAME_ITEMS_EN;

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert(
        language === 'tr'
          ? 'Bulmaca Kulübü\'nü telefonunuza veya bilgisayarınıza yüklemek için tarayıcınızın menüsünden (⋮ veya Paylaş) "Ana Ekrana Ekle" ya da "Uygulamayı Yükle" seçeneğine dokunun.'
          : 'To install Puzzle Club on your device, tap "Add to Home Screen" or "Install App" in your browser menu.'
      );
    }
  };

  return (
    <aside className="w-72 border-r flex flex-col h-screen overflow-hidden select-none shrink-0 relative" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      {/* Brand Header */}
      <div className="px-3.5 py-2.5 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 font-bold rounded-lg flex items-center justify-center text-xs shadow-xs"
            style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-contrast)' }}
          >
            BK
          </div>
          <div>
            <h1 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
              {language === 'tr' ? 'Bulmaca Kulübü' : 'Puzzle Club'}
            </h1>
            <p className="text-[10px]" style={{ color: 'var(--accent-color)' }}>
              {language === 'tr' ? '14 oyun · sınırsız mod' : '14 games · infinite mode'}
            </p>
          </div>
        </div>
        <button
          onClick={onToggleLanguage}
          className="px-2 py-1 rounded-lg text-[10px] font-bold border transition shadow-2xs cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
          title="Dili Değiştir / Change Language"
        >
          {language.toUpperCase()}
        </button>
      </div>

      {/* Games Navigation */}
      <div
        onScroll={() => setHoveredGame(null)}
        className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 relative scrollbar-none"
      >
        <div className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider" style={{ color: 'var(--accent-color)' }}>
          {language === 'tr' ? 'OYUNLAR' : 'GAMES'}
        </div>
        {gameItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeGame === item.id;
          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={(e) => {
                if (activeGame === item.id) {
                  setHoveredGame(null);
                  return;
                }
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredGame({ id: item.id, top: rect.top });
              }}
              onMouseLeave={() => setHoveredGame(null)}
            >
              <button
                onClick={() => {
                  onSelectGame(item.id);
                  setHoveredGame(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                  isActive
                    ? 'font-bold shadow-2xs'
                    : 'hover:bg-[var(--accent-light)] hover:text-[var(--accent-color)] font-medium'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: 'var(--accent-color)',
                        color: 'var(--accent-contrast)',
                      }
                    : {
                        color: 'var(--text-primary)',
                        opacity: 0.85,
                      }
                }
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    size={15}
                    style={{ color: isActive ? 'var(--accent-contrast)' : 'var(--accent-color)' }}
                  />
                  <span className="truncate text-xs">{item.label}</span>
                </div>
              </button>
            </div>
          );
        })}

        {/* Settings & PWA buttons placed directly below Nokta Avı and above the ad banner */}
        <div className={`pt-2 pb-2 px-1 space-y-1.5 ${!isPremium ? 'mb-20' : 'mb-4'}`}>
          <div className="border-t border-[var(--border-color)] mb-2 opacity-60"></div>

          {/* PWA Install Button */}
          <button
            onClick={handleInstallApp}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--accent-light)] text-[var(--text-primary)] text-xs font-bold transition shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] group-hover:scale-105 flex items-center justify-center transition border border-[var(--border-color)]">
                <Download size={13} />
              </div>
              <span className="font-bold">
                {language === 'tr' ? 'Uygulamayı İndir' : 'Install App'}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-primary)] opacity-70 font-semibold uppercase tracking-wider">
              PWA ➔
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--accent-light)] hover:text-[var(--accent-color)] text-xs font-bold transition shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-[var(--accent-color)] group-hover:text-white flex items-center justify-center transition">
                <Settings size={14} />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-[var(--accent-color)]">
                {language === 'tr' ? 'Ayarlar' : 'Settings'}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 group-hover:text-[var(--accent-color)] font-medium">
              {language === 'tr' ? 'Tema · Ses' : 'Theme · Sound'} ➔
            </span>
          </button>
        </div>
      </div>

      {/* Floating Hover Game Guide Card */}
      {hoveredGame && activeGame !== hoveredGame.id && (() => {
        const currentLang = language === 'en' ? 'en' : 'tr';
        const guide = GAME_GUIDES[hoveredGame.id]?.[currentLang] || GAME_GUIDES[hoveredGame.id]?.tr;
        const currentItems = currentLang === 'en' ? GAME_ITEMS_EN : GAME_ITEMS_TR;
        const hoveredItem = currentItems.find((g) => g.id === hoveredGame.id);
        const Icon = hoveredItem?.icon || Sparkles;

        return (
          <div
            style={{
              top: Math.max(16, Math.min(window.innerHeight - 320, hoveredGame.top - 8)),
              left: 296,
            }}
            className="fixed z-50 w-80 p-4 rounded-2xl shadow-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/95 text-[var(--text-primary)] backdrop-blur-xl pointer-events-none animate-tooltip select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent-color)] shrink-0">
                  <Icon size={16} />
                </div>
                <span className="font-bold text-sm tracking-tight truncate">
                  {hoveredItem?.label}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-color)] shrink-0 border border-[var(--accent-color)]/20">
                {guide?.tag}
              </span>
            </div>

            {/* Summary */}
            <p className="text-xs text-[var(--text-primary)]/80 mt-2.5 leading-relaxed font-normal">
              {guide?.summary}
            </p>

            {/* How to Play Rules */}
            <div className="mt-3 space-y-1.5 p-3 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-color)]">
              <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                {currentLang === 'en' ? 'How to Play' : 'Nasıl Oynanır?'}
              </div>
              {guide?.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-[var(--text-primary)] leading-snug">
                  <span className="text-[var(--accent-color)] font-bold shrink-0 mt-0.5">•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            {/* Controls & CTA Footer */}
            <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span className="truncate max-w-[180px]" title={guide?.controls}>
                🎮 {guide?.controls}
              </span>
              <span className="font-bold text-[var(--accent-color)] flex items-center gap-1 shrink-0">
                {currentLang === 'en' ? 'Play' : 'Oyna'} ➔
              </span>
            </div>
          </div>
        );
      })()}
    </aside>
  );
};
