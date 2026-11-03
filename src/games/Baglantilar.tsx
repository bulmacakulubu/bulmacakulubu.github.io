import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { RotateCcw, Shuffle, CheckCircle2, AlertCircle } from 'lucide-react';

interface BaglantilarProps {
  onGameEnd: (won: boolean, timeSec?: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
}

interface Group {
  category: string;
  words: string[];
  level: 1 | 2 | 3 | 4;
  colorClass: string;
}

interface PuzzleSet {
  id: number;
  name: string;
  groups: Group[];
}

const PUZZLE_SETS_TR: PuzzleSet[] = [
  {
    id: 1,
    name: 'Temel Bağlar',
    groups: [
      {
        category: 'Kahvaltı Yiyecekleri',
        words: ['PEYNİR', 'ZEYTİN', 'YUMURTA', 'BAL'],
        level: 1,
        colorClass: 'bg-amber-400 text-amber-950 border-amber-500',
      },
      {
        category: 'Deniz Canlıları',
        words: ['YUNUS', 'AHTAPOT', 'BALİNA', 'MERCAN'],
        level: 2,
        colorClass: 'bg-emerald-500 text-white border-emerald-600',
      },
      {
        category: 'Geometrik Şekiller',
        words: ['ÜÇGEN', 'KARE', 'ÇEMBER', 'ELİPS'],
        level: 3,
        colorClass: 'bg-blue-500 text-white border-blue-600',
      },
      {
        category: 'Değerli Maden ve Taşlar',
        words: ['ALTIN', 'GÜMÜŞ', 'ZÜMRÜT', 'ELMAS'],
        level: 4,
        colorClass: 'bg-purple-600 text-white border-purple-700',
      },
    ],
  },
  {
    id: 2,
    name: 'Kelimeler Dünyası',
    groups: [
      {
        category: 'Müzik Aletleri',
        words: ['GİTAR', 'PİYANO', 'DAVUL', 'FLÜT'],
        level: 1,
        colorClass: 'bg-amber-400 text-amber-950 border-amber-500',
      },
      {
        category: 'Güneş Sistemi Gezegenleri',
        words: ['DÜNYA', 'MARS', 'JÜPİTER', 'SATÜRN'],
        level: 2,
        colorClass: 'bg-emerald-500 text-white border-emerald-600',
      },
      {
        category: 'İskambil Sembolleri',
        words: ['KUPA', 'MAÇA', 'KARO', 'SİNEK'],
        level: 3,
        colorClass: 'bg-blue-500 text-white border-blue-600',
      },
      {
        category: 'Uçan Böcekler',
        words: ['ARI', 'KELEBEK', 'SİVRİSİNEK', 'YUSUFÇUK'],
        level: 4,
        colorClass: 'bg-purple-600 text-white border-purple-700',
      },
    ],
  },
  {
    id: 3,
    name: 'Günlük Yaşam',
    groups: [
      {
        category: 'Sıcak İçecekler',
        words: ['KAHVE', 'ÇAY', 'SAHLEP', 'IHLAMUR'],
        level: 1,
        colorClass: 'bg-amber-400 text-amber-950 border-amber-500',
      },
      {
        category: 'Ayakkabı Çeşitleri',
        words: ['BOT', 'ÇİZME', 'TERLİK', 'SANDALET'],
        level: 2,
        colorClass: 'bg-emerald-500 text-white border-emerald-600',
      },
      {
        category: 'Satranç Taşları',
        words: ['ŞAH', 'VEZİR', 'KALE', 'FİL'],
        level: 3,
        colorClass: 'bg-blue-500 text-white border-blue-600',
      },
      {
        category: 'Mevsimler',
        words: ['İLKBAHAR', 'YAZ', 'SONBAHAR', 'KIŞ'],
        level: 4,
        colorClass: 'bg-purple-600 text-white border-purple-700',
      },
    ],
  },
  {
    id: 4,
    name: 'Kültür & Doğa',
    groups: [
      {
        category: 'Yazı Gereçleri',
        words: ['KALEM', 'SİLGİ', 'DEFTER', 'TEBEŞİR'],
        level: 1,
        colorClass: 'bg-amber-400 text-amber-950 border-amber-500',
      },
      {
        category: 'Metaller',
        words: ['DEMİR', 'BAKIR', 'ÇİNKO', 'KURŞUN'],
        level: 2,
        colorClass: 'bg-emerald-500 text-white border-emerald-600',
      },
      {
        category: 'Okyanuslar',
        words: ['PASİFİK', 'ATLANTİK', 'HİNT', 'ARKTİK'],
        level: 3,
        colorClass: 'bg-blue-500 text-white border-blue-600',
      },
      {
        category: 'Ağaç Türleri',
        words: ['MEŞE', 'ÇAM', 'GÜRGEN', 'KAVAK'],
        level: 4,
        colorClass: 'bg-purple-600 text-white border-purple-700',
      },
    ],
  },
  {
    id: 5,
    name: 'Zeka & Kavramlar',
    groups: [
      {
        category: 'Bilgisayar Donanımları',
        words: ['MONİTÖR', 'KLAVYE', 'FARE', 'HOPARLÖR'],
        level: 1,
        colorClass: 'bg-amber-400 text-amber-950 border-amber-500',
      },
      {
        category: 'Narenciye Meyveleri',
        words: ['PORTAKAL', 'LİMON', 'MANDALİNA', 'GREYFURT'],
        level: 2,
        colorClass: 'bg-emerald-500 text-white border-emerald-600',
      },
      {
        category: 'Renk Tonları',
        words: ['TURKUAZ', 'BORDO', 'EFLATUN', 'HAKİ'],
        level: 3,
        colorClass: 'bg-blue-500 text-white border-blue-600',
      },
      {
        category: 'Telli Çalgılar',
        words: ['KEMAN', 'VİYOLA', 'ÇELLO', 'KONTRBAS'],
        level: 4,
        colorClass: 'bg-purple-600 text-white border-purple-700',
      },
    ],
  },
];

const PUZZLE_SETS_EN: PuzzleSet[] = [
  {
    id: 1,
    name: 'Essential Connections',
    groups: [
      {
        category: 'Breakfast Foods',
        words: ['CHEESE', 'OLIVE', 'EGG', 'HONEY'],
        level: 1,
        colorClass: 'bg-amber-400 text-amber-950 border-amber-500',
      },
      {
        category: 'Marine Life',
        words: ['DOLPHIN', 'OCTOPUS', 'WHALE', 'CORAL'],
        level: 2,
        colorClass: 'bg-emerald-500 text-white border-emerald-600',
      },
      {
        category: 'Geometric Shapes',
        words: ['TRIANGLE', 'SQUARE', 'CIRCLE', 'ELLIPSE'],
        level: 3,
        colorClass: 'bg-blue-500 text-white border-blue-600',
      },
      {
        category: 'Precious Minerals',
        words: ['GOLD', 'SILVER', 'EMERALD', 'DIAMOND'],
        level: 4,
        colorClass: 'bg-purple-600 text-white border-purple-700',
      },
    ],
  },
  {
    id: 2,
    name: 'Wonders & Sounds',
    groups: [
      {
        category: 'Musical Instruments',
        words: ['GUITAR', 'PIANO', 'DRUM', 'FLUTE'],
        level: 1,
        colorClass: 'bg-amber-400 text-amber-950 border-amber-500',
      },
      {
        category: 'Solar Planets',
        words: ['EARTH', 'MARS', 'JUPITER', 'SATURN'],
        level: 2,
        colorClass: 'bg-emerald-500 text-white border-emerald-600',
      },
      {
        category: 'Playing Card Suits',
        words: ['HEARTS', 'SPADES', 'DIAMONDS', 'CLUBS'],
        level: 3,
        colorClass: 'bg-blue-500 text-white border-blue-600',
      },
      {
        category: 'Winged Insects',
        words: ['BEE', 'BUTTERFLY', 'WASP', 'DRAGONFLY'],
        level: 4,
        colorClass: 'bg-purple-600 text-white border-purple-700',
      },
    ],
  },
  {
    id: 3,
    name: 'Daily Essentials',
    groups: [
      {
        category: 'Warm Beverages',
        words: ['COFFEE', 'TEA', 'COCOA', 'CIDER'],
        level: 1,
        colorClass: 'bg-amber-400 text-amber-950 border-amber-500',
      },
      {
        category: 'Types of Footwear',
        words: ['BOOTS', 'SNEAKERS', 'SANDALS', 'LOAFERS'],
        level: 2,
        colorClass: 'bg-emerald-500 text-white border-emerald-600',
      },
      {
        category: 'Chess Pieces',
        words: ['KING', 'QUEEN', 'KNIGHT', 'BISHOP'],
        level: 3,
        colorClass: 'bg-blue-500 text-white border-blue-600',
      },
      {
        category: 'The Four Seasons',
        words: ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'],
        level: 4,
        colorClass: 'bg-purple-600 text-white border-purple-700',
      },
    ],
  },
  {
    id: 4,
    name: 'Nature & Elements',
    groups: [
      {
        category: 'Stationery Items',
        words: ['PENCIL', 'ERASER', 'NOTEBOOK', 'CHALK'],
        level: 1,
        colorClass: 'bg-amber-400 text-amber-950 border-amber-500',
      },
      {
        category: 'Metals',
        words: ['IRON', 'COPPER', 'ZINC', 'LEAD'],
        level: 2,
        colorClass: 'bg-emerald-500 text-white border-emerald-600',
      },
      {
        category: 'Major Oceans',
        words: ['PACIFIC', 'ATLANTIC', 'INDIAN', 'ARCTIC'],
        level: 3,
        colorClass: 'bg-blue-500 text-white border-blue-600',
      },
      {
        category: 'Types of Trees',
        words: ['OAK', 'PINE', 'BIRCH', 'CEDAR'],
        level: 4,
        colorClass: 'bg-purple-600 text-white border-purple-700',
      },
    ],
  },
  {
    id: 5,
    name: 'Concepts & Tones',
    groups: [
      {
        category: 'Computer Peripherals',
        words: ['MONITOR', 'KEYBOARD', 'MOUSE', 'SPEAKER'],
        level: 1,
        colorClass: 'bg-amber-400 text-amber-950 border-amber-500',
      },
      {
        category: 'Citrus Fruits',
        words: ['ORANGE', 'LEMON', 'LIME', 'GRAPEFRUIT'],
        level: 2,
        colorClass: 'bg-emerald-500 text-white border-emerald-600',
      },
      {
        category: 'Shades of Color',
        words: ['VIOLET', 'INDIGO', 'CRIMSON', 'AMBER'],
        level: 3,
        colorClass: 'bg-blue-500 text-white border-blue-600',
      },
      {
        category: 'Bowed Strings',
        words: ['VIOLIN', 'VIOLA', 'CELLO', 'BASS'],
        level: 4,
        colorClass: 'bg-purple-600 text-white border-purple-700',
      },
    ],
  },
];

export const Baglantilar: React.FC<BaglantilarProps> = ({ onGameEnd, soundEnabled, language = 'tr' }) => {
  const isEn = language === 'en';
  const puzzleSets = isEn ? PUZZLE_SETS_EN : PUZZLE_SETS_TR;

  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const puzzle = puzzleSets[currentSetIndex] || puzzleSets[0];

  const distributeAcrossDifferentRows = (groups: Group[]): string[] => {
    const g0 = [...groups[0].words];
    const g1 = [...groups[1].words];
    const g2 = [...groups[2].words];
    const g3 = [...groups[3].words];

    const rows: string[][] = [];
    for (let r = 0; r < 4; r++) {
      const rowWords = [g0[r], g1[r], g2[r], g3[r]];
      for (let i = rowWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rowWords[i], rowWords[j]] = [rowWords[j], rowWords[i]];
      }
      rows.push(rowWords);
    }
    return rows.flat();
  };

  const [unsolvedWords, setUnsolvedWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<Group[]>([]);
  const [mistakesRemaining, setMistakesRemaining] = useState(4);
  const [isPlaying, setIsPlaying] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    initRound(currentSetIndex);
  }, [currentSetIndex, language]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const initRound = (setIdx: number) => {
    const p = puzzleSets[setIdx] || puzzleSets[0];
    const distributed = distributeAcrossDifferentRows(p.groups);
    setUnsolvedWords(distributed);
    setSelectedWords([]);
    setSolvedGroups([]);
    setMistakesRemaining(4);
    setIsPlaying(true);
    setSeconds(0);
    setToastMessage(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleWordClick = (word: string) => {
    if (!isPlaying) return;
    if (selectedWords.includes(word)) {
      if (soundEnabled) playSound('click');
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      if (selectedWords.length >= 4) return;
      if (soundEnabled) playSound('click');
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleShuffle = () => {
    if (!isPlaying || unsolvedWords.length === 0) return;
    if (soundEnabled) playSound('click');
    const shuffled = [...unsolvedWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setUnsolvedWords(shuffled);
  };

  const handleDeselectAll = () => {
    if (soundEnabled) playSound('click');
    setSelectedWords([]);
  };

  const handleCheckGroup = () => {
    if (selectedWords.length !== 4 || !isPlaying) return;

    let matchedGroup: Group | null = null;
    for (const group of puzzle.groups) {
      const isMatch = group.words.every((w) => selectedWords.includes(w));
      if (isMatch) {
        matchedGroup = group;
        break;
      }
    }

    if (matchedGroup) {
      if (soundEnabled) playSound('success');
      const nextSolved = [...solvedGroups, matchedGroup];
      setSolvedGroups(nextSolved);
      setUnsolvedWords(unsolvedWords.filter((w) => !selectedWords.includes(w)));
      setSelectedWords([]);

      if (nextSolved.length === 4) {
        setIsPlaying(false);
        if (soundEnabled) playSound('win');
        confetti({ particleCount: 110, spread: 80 });
        onGameEnd(true, seconds);
      }
    } else {
      let isOneAway = false;
      puzzle.groups.forEach((group) => {
        if (solvedGroups.some((sg) => sg.category === group.category)) return;
        const intersection = group.words.filter((w) => selectedWords.includes(w));
        if (intersection.length === 3) {
          isOneAway = true;
        }
      });

      if (soundEnabled) playSound('error');
      setShake(true);
      setTimeout(() => setShake(false), 500);

      const nextMistakes = mistakesRemaining - 1;
      setMistakesRemaining(nextMistakes);

      if (isOneAway) {
        showToast(isEn ? 'One away!' : '1 kelime uzaktasınız!');
      } else {
        showToast(isEn ? 'No match found' : 'Eşleşme bulunamadı');
      }

      if (nextMistakes <= 0) {
        setIsPlaying(false);
        showToast(isEn ? 'Out of mistakes!' : 'Haklarınız bitti!');
        setSolvedGroups(puzzle.groups);
        setUnsolvedWords([]);
        setSelectedWords([]);
        onGameEnd(false, seconds);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNextSet = () => {
    const nextIdx = (currentSetIndex + 1) % puzzleSets.length;
    setCurrentSetIndex(nextIdx);
  };

  return (
    <div className="w-full max-w-xl flex flex-col items-center justify-start select-none space-y-3 pt-1 relative">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="absolute -top-3 z-30 px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 animate-bounce">
          <AlertCircle size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* UNIFORM CONTROL BAR */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        {/* LEFT: Set Indicator */}
        <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs text-xs font-semibold">
          {isEn ? 'SET' : 'SET'}{' '}
          <span className="text-[var(--accent-color)] font-extrabold ml-1">
            {currentSetIndex + 1} / {puzzleSets.length}
          </span>
        </div>

        {/* CENTER: Mistakes Remaining & Timer */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            ⏱ {formatTime(seconds)}
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs flex items-center gap-1">
            <span>{isEn ? 'MISTAKES' : 'HATA'}</span>
            <div className="flex gap-1 ml-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition ${
                    i < mistakesRemaining ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Restart Button */}
        <button
          onClick={handleNextSet}
          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs"
        >
          <RotateCcw size={13} />
          <span>{isEn ? 'New Game' : 'Yeni Oyun'}</span>
        </button>
      </div>

      <div className="w-full text-center text-xs text-gray-500 font-medium">
        {isEn
          ? 'Find 4 groups of 4 words that share a common connection.'
          : 'Ortak temaya sahip 4 kelimelik grupları bulun.'}
      </div>

      {/* SOLVED GROUPS BANNERS */}
      <div className="w-full space-y-2">
        {solvedGroups.map((group, idx) => (
          <div
            key={idx}
            className={`w-full p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center shadow-xs animate-pop ${group.colorClass}`}
          >
            <div className="text-xs font-black uppercase tracking-wider">{group.category}</div>
            <div className="text-xs font-semibold mt-0.5 opacity-90">{group.words.join(', ')}</div>
          </div>
        ))}
      </div>

      {/* UNSOLVED WORDS GRID */}
      {unsolvedWords.length > 0 && (
        <div className={`grid grid-cols-4 gap-2.5 w-full ${shake ? 'animate-shake' : ''}`}>
          {unsolvedWords.map((word) => {
            const isSelected = selectedWords.includes(word);
            return (
              <button
                key={word}
                onClick={() => handleWordClick(word)}
                className={`h-11 sm:h-12 p-1.5 rounded-xl border-2 font-black text-[11px] sm:text-xs tracking-wide transition-all duration-150 flex items-center justify-center text-center cursor-pointer shadow-xs active:scale-95 ${
                  isSelected
                    ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] border-[var(--accent-color)] scale-102 shadow-md'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-gray-400 dark:hover:border-gray-600'
                }`}
              >
                <span className="truncate">{word}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ACTION BUTTONS */}
      {unsolvedWords.length > 0 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleShuffle}
            className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Shuffle size={14} />
            <span>{isEn ? 'Shuffle' : 'Karıştır'}</span>
          </button>

          <button
            onClick={handleDeselectAll}
            disabled={selectedWords.length === 0}
            className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 text-xs font-bold transition shadow-2xs"
          >
            {isEn ? 'Deselect All' : 'Seçimi Bırak'}
          </button>

          <button
            onClick={handleCheckGroup}
            disabled={selectedWords.length !== 4}
            className={`px-5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm ${
              selectedWords.length === 4
                ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 opacity-50 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>{isEn ? 'Submit Group' : 'Grubu Kontrol Et'}</span>
          </button>
        </div>
      )}

      {/* Completion message */}
      {!isPlaying && solvedGroups.length === 4 && (
        <div className="w-full p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-center font-bold text-xs animate-fadeIn">
          {isEn
            ? '🎉 Bravo! You found all connections in ' + formatTime(seconds) + '!'
            : '🎉 Tebrikler! Tüm bağlantıları ' + formatTime(seconds) + ' içinde çözdünüz!'}
        </div>
      )}
    </div>
  );
};
