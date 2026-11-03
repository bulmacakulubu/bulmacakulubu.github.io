import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { RotateCcw, Paintbrush, X, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface NonogramProps {
  onGameEnd: (won: boolean, timeSec: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
}

type SizeMode = '5x5' | '10x10';

interface PixelPuzzle {
  nameTr: string;
  nameEn: string;
  grid: number[][]; // 1: filled, 0: empty
}

const PUZZLES_5X5: PixelPuzzle[] = [
  {
    nameTr: 'Kalp',
    nameEn: 'Heart',
    grid: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    nameTr: 'Gülen Yüz',
    nameEn: 'Smiley',
    grid: [
      [0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
    ],
  },
  {
    nameTr: 'Ağaç',
    nameEn: 'Tree',
    grid: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    nameTr: 'Yıldız',
    nameEn: 'Star',
    grid: [
      [0, 0, 1, 0, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [1, 0, 0, 0, 1],
    ],
  },
  {
    nameTr: 'Çapa',
    nameEn: 'Anchor',
    grid: [
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1],
      [0, 1, 1, 1, 0],
    ],
  },
];

const PUZZLES_10X10: PixelPuzzle[] = [
  {
    nameTr: 'Kedi',
    nameEn: 'Cat',
    grid: [
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ],
  },
  {
    nameTr: 'Yelkenli Gemi',
    nameEn: 'Sailboat',
    grid: [
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    ],
  },
  {
    nameTr: 'Sevimli Ev',
    nameEn: 'Cozy House',
    grid: [
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
      [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
      [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  {
    nameTr: 'Kılıç',
    nameEn: 'Sword',
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    nameTr: 'Şampiyonluk Kupası',
    nameEn: 'Trophy Cup',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ],
  },
];

export const Nonogram: React.FC<NonogramProps> = ({ onGameEnd, soundEnabled, language = 'tr' }) => {
  const isEn = language === 'en';
  const [sizeMode, setSizeMode] = useState<SizeMode>('5x5');
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzlePool = sizeMode === '5x5' ? PUZZLES_5X5 : PUZZLES_10X10;
  const currentPuzzle = puzzlePool[puzzleIndex] || puzzlePool[0];

  const size = sizeMode === '5x5' ? 5 : 10;
  // 0: empty, 1: filled, 2: cross (marked empty)
  const [gridState, setGridState] = useState<number[][]>(() =>
    Array.from({ length: size }, () => Array(size).fill(0))
  );

  const [paintMode, setPaintMode] = useState<'fill' | 'cross'>('fill');
  const [isPlaying, setIsPlaying] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [errors, setErrors] = useState(0);

  // Compute row clues
  const rowClues = currentPuzzle.grid.map((row) => {
    const clues: number[] = [];
    let count = 0;
    for (const val of row) {
      if (val === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    return clues.length > 0 ? clues : [0];
  });

  // Compute column clues
  const colClues: number[][] = [];
  for (let c = 0; c < size; c++) {
    const clues: number[] = [];
    let count = 0;
    for (let r = 0; r < size; r++) {
      if (currentPuzzle.grid[r][c] === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    colClues.push(clues.length > 0 ? clues : [0]);
  }

  const startNewGame = (mode = sizeMode, nextPuzzle = false) => {
    setSizeMode(mode);
    const pool = mode === '5x5' ? PUZZLES_5X5 : PUZZLES_10X10;
    const nextIdx = nextPuzzle ? (puzzleIndex + 1) % pool.length : Math.floor(Math.random() * pool.length);
    setPuzzleIndex(nextIdx);
    const s = mode === '5x5' ? 5 : 10;
    setGridState(Array.from({ length: s }, () => Array(s).fill(0)));
    setIsPlaying(true);
    setSeconds(0);
    setErrors(0);
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleCellClick = (r: number, c: number, overrideCross = false) => {
    if (!isPlaying) return;

    const nextState = gridState.map((row) => [...row]);
    const current = nextState[r][c];
    const isTargetFilled = currentPuzzle.grid[r][c] === 1;

    const applyingFill = overrideCross ? false : paintMode === 'fill';

    if (applyingFill) {
      if (current === 1) {
        nextState[r][c] = 0;
      } else {
        nextState[r][c] = 1;
        if (!isTargetFilled) {
          if (soundEnabled) playSound('error');
          setErrors((e) => e + 1);
        } else {
          if (soundEnabled) playSound('tile');
        }
      }
    } else {
      if (current === 2) {
        nextState[r][c] = 0;
      } else {
        nextState[r][c] = 2;
        if (soundEnabled) playSound('click');
      }
    }

    setGridState(nextState);
    checkWinCondition(nextState);
  };

  const handleCellContextMenu = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    handleCellClick(r, c, true);
  };

  const checkWinCondition = (state: number[][]) => {
    let won = true;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isTargetFilled = currentPuzzle.grid[r][c] === 1;
        const isUserFilled = state[r][c] === 1;
        if (isTargetFilled !== isUserFilled) {
          won = false;
          break;
        }
      }
      if (!won) break;
    }

    if (won) {
      setIsPlaying(false);
      if (soundEnabled) playSound('win');
      confetti({ particleCount: 110, spread: 80 });
      onGameEnd(true, seconds);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalTargetFilled = currentPuzzle.grid.flat().filter((v) => v === 1).length;
  const currentFilledCount = gridState.flat().filter((v) => v === 1).length;
  const puzzleDisplayName = isEn ? currentPuzzle.nameEn : currentPuzzle.nameTr;
  const is5x5 = sizeMode === '5x5';

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl flex flex-col items-center justify-start select-none space-y-3 pt-1">
      {/* UNIFORM CONTROL BAR */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        {/* LEFT: Grid Size Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold border border-[var(--border-color)]">
          {(['5x5', '10x10'] as SizeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => startNewGame(mode)}
              className={`px-3 py-1.5 rounded-lg transition font-extrabold ${
                sizeMode === mode
                  ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {mode === '5x5' ? (isEn ? '5x5 Mini' : '5x5 Mini') : (isEn ? '10x10 Master' : '10x10 Usta')}
            </button>
          ))}
        </div>

        {/* CENTER: Live Metrics */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            ⏱ {formatTime(seconds)}
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs text-rose-500 font-bold">
            {isEn ? 'ERRORS' : 'HATA'} {errors}
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isEn ? 'REMAINING' : 'KALAN'}{' '}
            <span className="font-extrabold text-[var(--accent-color)]">
              {Math.max(0, totalTargetFilled - currentFilledCount)}
            </span>
          </div>
        </div>

        {/* RIGHT: Restart Button */}
        <button
          onClick={() => startNewGame(sizeMode, true)}
          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs"
        >
          <RotateCcw size={13} />
          <span>{isEn ? 'New Game' : 'Yeni Oyun'}</span>
        </button>
      </div>

      {/* Paint Mode Toggle (Fill vs Cross) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPaintMode('fill')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold border transition shadow-2xs ${
            paintMode === 'fill'
              ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] border-[var(--accent-color)]'
              : 'bg-[var(--bg-card)] text-gray-600 dark:text-gray-400 border-[var(--border-color)]'
          }`}
        >
          <Paintbrush size={13} />
          <span>{isEn ? '■ Fill' : '■ Boya'}</span>
        </button>
        <button
          onClick={() => setPaintMode('cross')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold border transition shadow-2xs ${
            paintMode === 'cross'
              ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] border-[var(--accent-color)]'
              : 'bg-[var(--bg-card)] text-gray-600 dark:text-gray-400 border-[var(--border-color)]'
          }`}
        >
          <X size={13} />
          <span>{isEn ? '✖ Cross' : '✖ Çarpı (Boşluk)'}</span>
        </button>
        <span className="text-[11px] text-gray-400 ml-2 hidden sm:inline">
          {isEn ? '(Right-click places cross on desktop)' : '(Masaüstünde sağ tık doğrudan çarpı koyar)'}
        </span>
      </div>

      {/* NONOGRAM PICROSS BOARD CONTAINER */}
      <div
        className="p-3 sm:p-4 rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg inline-block"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="flex">
          {/* Top-Left Empty Corner */}
          <div className={`${is5x5 ? 'w-18 sm:w-24' : 'w-14 sm:w-18'} shrink-0 flex items-end justify-end p-1 text-[11px] text-gray-400 font-bold border-b-2 border-r-2 border-[var(--border-color)]`}>
            {isEn ? 'clues' : 'ipucu'}
          </div>

          {/* Column Clues */}
          <div className="flex border-b-2 border-[var(--border-color)]">
            {colClues.map((clues, c) => (
              <div
                key={c}
                className={`${is5x5 ? 'w-11 sm:w-13 md:w-15 text-xs sm:text-sm' : 'w-7.5 sm:w-9.5 md:w-10.5 text-[11px] sm:text-xs'} flex flex-col justify-end items-center pb-1 font-extrabold text-gray-600 dark:text-gray-300 leading-tight ${
                  c % 5 === 4 && c !== size - 1 ? 'border-r-2 border-r-gray-900 dark:border-r-gray-100' : 'border-r border-r-gray-200 dark:border-r-gray-800'
                }`}
              >
                {clues.map((num, i) => (
                  <span key={i} className="my-0.5">
                    {num}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Rows with clues and cells */}
        <div>
          {rowClues.map((clues, r) => (
            <div key={r} className="flex">
              {/* Row Clue */}
              <div
                className={`${is5x5 ? 'w-18 sm:w-24 text-xs sm:text-sm' : 'w-14 sm:w-18 text-[11px] sm:text-xs'} shrink-0 flex items-center justify-end pr-2.5 gap-2 font-extrabold text-gray-600 dark:text-gray-300 border-r-2 border-[var(--border-color)] ${
                  r % 5 === 4 && r !== size - 1 ? 'border-b-2 border-b-gray-900 dark:border-b-gray-100' : 'border-b border-b-gray-200 dark:border-b-gray-800'
                }`}
              >
                {clues.map((num, i) => (
                  <span key={i}>{num}</span>
                ))}
              </div>

              {/* Row Cells */}
              <div className="flex">
                {gridState[r].map((state, c) => {
                  const borderRight =
                    c % 5 === 4 && c !== size - 1 ? 'border-r-2 border-r-gray-900 dark:border-r-gray-100' : 'border-r border-r-gray-200 dark:border-r-gray-800';
                  const borderBottom =
                    r % 5 === 4 && r !== size - 1 ? 'border-b-2 border-b-gray-900 dark:border-b-gray-100' : 'border-b border-b-gray-200 dark:border-b-gray-800';

                  return (
                    <button
                      key={c}
                      onClick={() => handleCellClick(r, c)}
                      onContextMenu={(e) => handleCellContextMenu(e, r, c)}
                      className={`${is5x5 ? 'w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15' : 'w-7.5 h-7.5 sm:w-9.5 sm:h-9.5 md:w-10.5 md:h-10.5'} flex items-center justify-center transition-all ${borderRight} ${borderBottom} ${
                        state === 1
                          ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-inner'
                          : state === 2
                          ? 'bg-[var(--bg-secondary)]/60 text-gray-400'
                          : 'bg-[var(--bg-card)] hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      {state === 2 && <X size={is5x5 ? 18 : 14} className="text-gray-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GAME COMPLETED REVEAL CARD */}
      {!isPlaying && (
        <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-center shadow-lg w-full animate-fadeIn mt-2">
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mb-0.5">
            {isEn
              ? `Pixel Artwork Discovered: "${puzzleDisplayName}"! 🎉`
              : `Piksel Resmi Keşfedildi: "${puzzleDisplayName}"! 🎉`}
          </div>
          <div className="text-xs text-gray-500 mb-3">
            {isEn
              ? `Total time: ${formatTime(seconds)} · Errors: ${errors}`
              : `Toplam süre: ${formatTime(seconds)} · Hata: ${errors}`}
          </div>
          <button
            onClick={() => startNewGame(sizeMode, true)}
            className="px-6 py-2.5 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-xl font-bold text-xs transition shadow-sm"
          >
            {isEn ? 'Next Pixel Artwork ➔' : 'Sıradaki Piksel Resmine Geç ➔'}
          </button>
        </div>
      )}
    </div>
  );
};
