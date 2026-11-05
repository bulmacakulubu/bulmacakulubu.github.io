import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { RotateCcw, Shuffle, CheckCircle2, AlertCircle, Share2, Lightbulb, MessageSquare } from 'lucide-react';
import { pickUnseenWord, getPoolProgress } from '../utils/wordMemory';
import { triggerAdBreak } from '../utils/adSenseService';
import { shareScore, openWhatsAppShare } from '../utils/shareService';

interface BaglantilarProps {
  onGameEnd: (won: boolean, timeSec?: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
  isPremium?: boolean;
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

export const Baglantilar: React.FC<BaglantilarProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
  isPremium = false,
}) => {
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
  const [poolStats, setPoolStats] = useState({ seenCount: 0, totalCount: 0 });
  const [guessHistory, setGuessHistory] = useState<number[][]>([]);

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
    const poolKey = `connections_${language}`;
    const result = pickUnseenWord(poolKey, puzzleSets, (p) => p.name);
    const chosenIdx = puzzleSets.findIndex((p) => p.name === result.item.name);
    const effectiveIdx = chosenIdx !== -1 ? chosenIdx : setIdx;

    const p = puzzleSets[effectiveIdx] || puzzleSets[0];
    const distributed = distributeAcrossDifferentRows(p.groups);
    setUnsolvedWords(distributed);
    setSelectedWords([]);
    setSolvedGroups([]);
    setMistakesRemaining(4);
    setIsPlaying(true);
    setSeconds(0);
    setToastMessage(null);
    setGuessHistory([]);

    const progress = getPoolProgress(poolKey, puzzleSets.length);
    setPoolStats({ seenCount: progress.seenCount, totalCount: progress.totalCount });

    if (result.isCycleReset) {
      showToast(isEn ? 'All sets completed! Resetting 🏆' : 'Tüm setler tamamlandı! Baştan başlıyor 🏆');
    }
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

  // Rewarded Hint
  const handleHint = () => {
    if (!isPlaying) return;
    const unsolved = puzzle.groups.filter((g) => !solvedGroups.some((sg) => sg.category === g.category));
    if (unsolved.length === 0) return;

    const targetGroup = unsolved[0];
    const wordsToPick = targetGroup.words.slice(0, 2);

    const doHint = () => {
      setSelectedWords(wordsToPick);
      if (soundEnabled) playSound('tile');
      showToast(
        isEn
          ? `💡 Hint: "${wordsToPick.join(' & ')}" are linked!`
          : `💡 İpucu: "${wordsToPick.join(' & ')}" birbiriyle bağlantılı!`
      );
    };

    if (isPremium) {
      doHint();
    } else {
      triggerAdBreak({
        type: 'reward',
        name: 'connections_hint',
        adBreakDone: () => {
          doHint();
        },
      });
    }
  };

  const LEVEL_EMOJIS: Record<number, string> = {
    1: '🟨',
    2: '🟩',
    3: '🟦',
    4: '🟪',
  };

  const generateEmojiGrid = () => {
    return guessHistory
      .map((row) => row.map((lvl) => LEVEL_EMOJIS[lvl] || '⬜').join(''))
      .join('\n');
  };

  const handleShare = async () => {
    const grid = generateEmojiGrid();
    const isWon = solvedGroups.length === 4;
    await shareScore({
      title: 'Bulmaca Kulübü - Bağlantılar',
      gameName: isEn ? 'Connections' : 'Bağlantılar',
      scoreOrAttempts: isWon ? `${formatTime(seconds)} içinde çözüldü` : 'Tamamlanamadı',
      emojiGrid: grid,
    });
  };

  const handleCheckGroup = () => {
    if (selectedWords.length !== 4 || !isPlaying) return;

    // Track level of each chosen word for emoji grid
    const wordLevels = selectedWords.map((w) => {
      const g = puzzle.groups.find((grp) => grp.words.includes(w));
      return g ? g.level : 1;
    });
    setGuessHistory((prev) => [...prev, wordLevels]);

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
        showToast(isEn ? 'One away! (3/4 correct)' : '1 kelime uzaktasınız! (3 tanesi doğru)');
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
    <div className="w-full flex flex-col items-center justify-start select-none pt-1 sm:pt-2 pb-2 relative max-w-2xl sm:max-w-3xl space-y-2.5 sm:space-y-3.5">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-700 dark:border-zinc-300 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 max-w-[92vw] animate-bounce pointer-events-none">
          <AlertCircle size={15} className="text-amber-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* UNIFORM CONTROL BAR */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        {/* LEFT: Mistakes Remaining */}
        <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs flex items-center gap-1.5 text-xs font-semibold">
          <span>{isEn ? 'MISTAKES' : 'HATA'}</span>
          <div className="flex gap-1.5 ml-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i < mistakesRemaining ? 'bg-amber-500 scale-100' : 'bg-gray-300 dark:bg-gray-700 scale-75 opacity-40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CENTER: Pool Progress & Timer */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="px-2.5 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs text-[11px] text-gray-500">
            {isEn ? 'POOL' : 'HAVUZ'}{' '}
            <span className="font-bold text-[var(--accent-color)]">{poolStats.seenCount}/{poolStats.totalCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs font-mono">
            ⏱ {formatTime(seconds)}
          </div>
        </div>

        {/* RIGHT: Hint (Rewarded Ad) & Next Round */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleHint}
            disabled={!isPlaying}
            className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-40"
            title={isPremium ? 'VIP İpucu' : 'Ödüllü Reklam ile İpucu'}
          >
            <Lightbulb size={13} />
            <span>{isEn ? 'Hint' : 'İpucu'}</span>
          </button>

          <button
            onClick={handleNextSet}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>{isEn ? 'New' : 'Yeni'}</span>
          </button>
        </div>
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

      {/* Completion & Share message */}
      {!isPlaying && (
        <div className={`w-full p-4 rounded-2xl border text-center font-bold text-xs animate-fadeIn shadow-lg mt-2 ${
          solvedGroups.length === 4
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
        }`}>
          <div className="text-sm font-black mb-1">
            {solvedGroups.length === 4
              ? (isEn ? `🎉 Bravo! Solved in ${formatTime(seconds)}!` : `🎉 Tebrikler! ${formatTime(seconds)} içinde çözdünüz!`)
              : (isEn ? 'Game Over! Better luck next time!' : 'Oyun Bitti! Bir dahaki sefere!')}
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Share2 size={14} className="text-amber-400" />
              <span>{isEn ? 'Share Grid' : 'Skoru Paylaş'}</span>
            </button>

            <button
              onClick={handleNextSet}
              className="px-4 py-2 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
            >
              {isEn ? 'Next Puzzle ➔' : 'Sıradaki Set ➔'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
