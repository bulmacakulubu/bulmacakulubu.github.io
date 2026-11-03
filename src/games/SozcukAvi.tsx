import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { RotateCcw } from 'lucide-react';
import { generateWordSearch } from '../utils/wordSearchGenerator';

interface SozcukAviProps {
  onGameEnd: (won: boolean, timeSec: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
}

const CATEGORIES_TR: Record<string, string[]> = {
  Hayvanlar: ['TİLKİ', 'YUNUS', 'KAPLUMBAĞA', 'TAVŞAN', 'ZÜRAFA', 'BAYKUŞ', 'MAYMUN', 'PAPAĞAN'],
  Şehirler: ['İSTANBUL', 'ANKARA', 'İZMİR', 'ANTALYA', 'BURSA', 'TRABZON', 'SAMSUN', 'KONYA'],
  Meyveler: ['ELMA', 'ARMUT', 'MUZ', 'ÇİLEK', 'KARPUZ', 'KAVUN', 'PORTAKAL', 'MANDALİNA'],
  'Uzay & Bilim': ['GÜNEŞ', 'GALAKSİ', 'GEZEGEN', 'TELESKOP', 'ROKET', 'YILDIZ', 'ATOM', 'GRAVİT'],
  Teknoloji: ['YAZILIM', 'ROBOT', 'KODLAMA', 'EKRAN', 'İNTERNET', 'VERİ', 'İŞLEMCİ', 'BELLEK'],
};

const CATEGORIES_EN: Record<string, string[]> = {
  Animals: ['TIGER', 'DOLPHIN', 'ELEPHANT', 'RABBIT', 'GIRAFFE', 'FALCON', 'MONKEY', 'PARROT'],
  Cities: ['LONDON', 'PARIS', 'TOKYO', 'NEWYORK', 'BERLIN', 'ROME', 'MADRID', 'SYDNEY'],
  Fruits: ['APPLE', 'BANANA', 'ORANGE', 'MANGO', 'CHERRY', 'GRAPE', 'LEMON', 'PEACH'],
  'Space & Science': ['SUN', 'GALAXY', 'PLANET', 'TELESCOPE', 'ROCKET', 'COMET', 'ATOM', 'ORBIT'],
  Technology: ['SOFTWARE', 'ROBOT', 'CODING', 'SCREEN', 'NETWORK', 'DATA', 'CHIP', 'MEMORY'],
};

const WORD_COLORS = [
  'bg-emerald-600 text-white',
  'bg-blue-600 text-white',
  'bg-amber-600 text-white',
  'bg-purple-600 text-white',
  'bg-rose-600 text-white',
  'bg-teal-600 text-white',
  'bg-indigo-600 text-white',
  'bg-orange-600 text-white',
];

interface Point {
  r: number;
  c: number;
}

export const SozcukAvi: React.FC<SozcukAviProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
}) => {
  const isTr = language === 'tr';
  const categories = isTr ? CATEGORIES_TR : CATEGORIES_EN;

  const defaultCat = Object.keys(categories)[0];
  const [activeCategory, setActiveCategory] = useState(defaultCat);
  const words = categories[activeCategory] || categories[defaultCat];

  const [grid, setGrid] = useState<string[][]>([]);
  const [placedWords, setPlacedWords] = useState<Record<string, Point[]>>({});
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundColors, setFoundColors] = useState<Record<string, string>>({});
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Point | null>(null);
  const [selectionCurrent, setSelectionCurrent] = useState<Point | null>(null);

  // Refs for smooth drag event listeners
  const isDraggingRef = useRef(false);
  const selectionStartRef = useRef<Point | null>(null);
  const selectionCurrentRef = useRef<Point | null>(null);

  isDraggingRef.current = isDragging;
  selectionStartRef.current = selectionStart;
  selectionCurrentRef.current = selectionCurrent;

  const initBoard = (cat = activeCategory) => {
    const wordList = categories[cat] || categories[defaultCat];
    const generated = generateWordSearch(wordList, 12, language);
    setGrid(generated.grid);
    setPlacedWords(generated.placedWords);
    setFoundWords([]);
    setFoundColors({});
    setSeconds(0);
    setIsPlaying(true);
    setIsDragging(false);
    setSelectionStart(null);
    setSelectionCurrent(null);
  };

  useEffect(() => {
    const cats = isTr ? CATEGORIES_TR : CATEGORIES_EN;
    const firstCat = Object.keys(cats)[0];
    setActiveCategory(firstCat);
    initBoard(firstCat);
  }, [language]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // 8-directional straight line snapping (Horizontal, Vertical & all 4 Diagonals)
  const getLineCells = (start: Point, current: Point): Point[] => {
    const dr = current.r - start.r;
    const dc = current.c - start.c;

    if (dr === 0 && dc === 0) {
      return [start];
    }

    // Mathematical 8-sector angle snap (every 45 degrees has a 45 degree capture arc)
    const angle = Math.atan2(dr, dc);
    let sector = Math.round(angle / (Math.PI / 4));
    if (sector < 0) sector += 8;
    sector = sector % 8;

    // Unit directions for the 8 sectors:
    // 0: right (0, 1) | 1: down-right (1, 1) | 2: down (1, 0) | 3: down-left (1, -1)
    // 4: left (0, -1) | 5: up-left (-1, -1)   | 6: up (-1, 0)   | 7: up-right (-1, 1)
    const DIR_MAP: [number, number][] = [
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
      [-1, -1],
      [-1, 0],
      [-1, 1],
    ];

    const [stepR, stepC] = DIR_MAP[sector];
    const steps = Math.max(Math.abs(dr), Math.abs(dc));

    const cells: Point[] = [];
    for (let i = 0; i <= steps; i++) {
      const r = start.r + i * stepR;
      const c = start.c + i * stepC;
      if (r >= 0 && r < 12 && c >= 0 && c < 12) {
        cells.push({ r, c });
      }
    }
    return cells;
  };

  const activeSelectedCells =
    selectionStart && selectionCurrent ? getLineCells(selectionStart, selectionCurrent) : [];

  // Pointer Down (Mouse left click or touch start)
  const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
    if (!isPlaying) return;
    e.preventDefault();
    if (soundEnabled) playSound('click');
    setIsDragging(true);
    setSelectionStart({ r, c });
    setSelectionCurrent({ r, c });
  };

  // Pointer Enter (Mouse hover over cell)
  const handlePointerEnter = (r: number, c: number) => {
    if (!isDraggingRef.current || !selectionStartRef.current) return;
    setSelectionCurrent({ r, c });
  };

  // Pointer Up & Move listeners across window for reliable drag release anywhere
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const rStr = target?.getAttribute('data-r');
      const cStr = target?.getAttribute('data-c');
      if (rStr !== null && cStr !== null && rStr !== undefined && cStr !== undefined) {
        const r = parseInt(rStr, 10);
        const c = parseInt(cStr, 10);
        if (!isNaN(r) && !isNaN(c)) {
          setSelectionCurrent({ r, c });
        }
      }
    };

    const handleGlobalPointerUp = () => {
      if (!isDraggingRef.current || !selectionStartRef.current || !selectionCurrentRef.current) {
        setIsDragging(false);
        setSelectionStart(null);
        setSelectionCurrent(null);
        return;
      }

      const line = getLineCells(selectionStartRef.current, selectionCurrentRef.current);
      if (line.length >= 2 && grid.length > 0) {
        const selectedString = line.map((p) => grid[p.r]?.[p.c] || '').join('');
        const reversedString = selectedString.split('').reverse().join('');

        let matched: string | null = null;
        for (const w of words) {
          const cleanW = w.replace(/\s+/g, '');
          if (!foundWords.includes(w) && (cleanW === selectedString || cleanW === reversedString)) {
            matched = w;
            break;
          }
        }

        if (matched) {
          if (soundEnabled) playSound('success');
          const nextFound = [...foundWords, matched];
          setFoundWords(nextFound);

          const color = WORD_COLORS[(nextFound.length - 1) % WORD_COLORS.length];
          setFoundColors((prev) => ({ ...prev, [matched!]: color }));

          if (nextFound.length === words.length) {
            setIsPlaying(false);
            if (soundEnabled) playSound('win');
            confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
            onGameEnd(true, seconds);
          }
        } else {
          if (soundEnabled) playSound('error');
        }
      }

      setIsDragging(false);
      setSelectionStart(null);
      setSelectionCurrent(null);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [grid, words, foundWords, isPlaying, soundEnabled, seconds, onGameEnd]);

  // Click on word in list to auto-reveal
  const handleWordListClick = (word: string) => {
    if (!isPlaying || foundWords.includes(word)) return;
    if (soundEnabled) playSound('success');
    const nextFound = [...foundWords, word];
    setFoundWords(nextFound);

    const color = WORD_COLORS[(nextFound.length - 1) % WORD_COLORS.length];
    setFoundColors((prev) => ({ ...prev, [word]: color }));

    if (nextFound.length === words.length) {
      setIsPlaying(false);
      if (soundEnabled) playSound('win');
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
      onGameEnd(true, seconds);
    }
  };

  const getCellClassName = (r: number, c: number) => {
    // 1. Is this cell in current active drag line?
    const isSelected = activeSelectedCells.some((pt) => pt.r === r && pt.c === c);
    if (isSelected) {
      return 'bg-[var(--accent-color)] text-[var(--accent-contrast)] scale-105 shadow-md ring-2 ring-[var(--accent-color)]/60 font-black z-10';
    }

    // 2. Is this cell part of a found word?
    for (const w of foundWords) {
      const coords = placedWords[w];
      if (coords && coords.some((pt) => pt.r === r && pt.c === c)) {
        const colorClass = foundColors[w] || 'bg-emerald-600 text-white';
        return `${colorClass} font-black shadow-2xs`;
      }
    }

    // 3. Default idle cell
    return 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800/80';
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center justify-start select-none space-y-2 pt-0">
      {/* COMPACT & SPACIOUS CONTROL BAR */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)]">
        {/* WIDE CATEGORY SELECTOR (No scroll, fitted buttons) */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold border border-[var(--border-color)]">
          {Object.keys(categories).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                initBoard(cat);
              }}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg transition font-extrabold whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* METRICS & RESTART BUTTON */}
        <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            ⏱ {formatTime(seconds)}
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isTr ? 'BULUNAN' : 'FOUND'}{' '}
            <span className="font-extrabold text-[var(--accent-color)]">
              {foundWords.length}/{words.length}
            </span>
          </div>
          <button
            onClick={() => initBoard(activeCategory)}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>{isTr ? 'Yeni Tahta' : 'New Board'}</span>
          </button>
        </div>
      </div>

      {/* BALANCED PLAYING AREA (Side-by-side, perfectly fitted, zero-scroll) */}
      <div className="w-full flex flex-col md:flex-row gap-3.5 lg:gap-4.5 items-center md:items-start justify-center pt-0.5">
        {/* Interactive Mouse & Touch Drag 12x12 Grid */}
        <div className="bg-gray-50 dark:bg-gray-800/60 p-2 sm:p-2.5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xs touch-none select-none">
          <div className="grid grid-cols-12 gap-1 sm:gap-1.5 text-center">
            {grid.map((row, rIdx) =>
              row.map((char, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  data-r={rIdx}
                  data-c={cIdx}
                  onPointerDown={(e) => handlePointerDown(rIdx, cIdx, e)}
                  onPointerEnter={() => handlePointerEnter(rIdx, cIdx)}
                  className={`w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7.5 md:h-7.5 lg:w-8 lg:h-8 flex items-center justify-center font-black text-[10px] sm:text-xs md:text-sm rounded-lg transition-all duration-150 cursor-pointer select-none ${getCellClassName(
                    rIdx,
                    cIdx
                  )}`}
                >
                  {char}
                </div>
              ))
            )}
          </div>
        </div>

        {/* WORDS SIDEBAR (2-Column Balanced Grid, zero scroll) */}
        <div className="w-full md:w-64 lg:w-72 border border-gray-200 dark:border-gray-800 rounded-2xl p-2.5 bg-gray-50/50 dark:bg-gray-800/40 flex flex-col select-none">
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-gray-200 dark:border-gray-800">
            <h4 className="font-bold text-[11px] tracking-wider text-gray-500 uppercase">
              {isTr ? 'GİZLİ KELİMELER' : 'HIDDEN WORDS'}
            </h4>
            <span className="text-xs font-extrabold text-[var(--accent-color)]">
              {foundWords.length} / {words.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1">
            {words.map((w) => {
              const isFound = foundWords.includes(w);
              const colorClass = foundColors[w];
              return (
                <div
                  key={w}
                  onClick={() => handleWordListClick(w)}
                  className={`p-1.5 rounded-lg text-[11px] font-semibold flex justify-between items-center cursor-pointer transition select-none ${
                    isFound
                      ? `${colorClass || 'bg-emerald-600 text-white'} line-through opacity-90`
                      : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-gray-100 dark:border-gray-800 hover:border-gray-400'
                  }`}
                  title={isTr ? 'Doğrudan açmak için tıklayın' : 'Click to reveal'}
                >
                  <span className="truncate">{w}</span>
                  <span className="text-[9px] font-bold">
                    {isFound ? '✓' : isTr ? 'Bul' : 'Find'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-gray-200/60 dark:border-gray-800/60 text-[10px] text-gray-400 text-center leading-normal">
            {isTr
              ? '🖱️ Kelimeleri yatay, dikey veya çapraz sürükleyip bırakarak bulun.'
              : '🖱️ Find words by dragging horizontally, vertically, or diagonally.'}
          </div>
        </div>
      </div>
    </div>
  );
};