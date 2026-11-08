import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { RotateCcw, Paintbrush, X, CheckCircle2, Sparkles, AlertCircle, Lightbulb, Share2, MessageSquare } from 'lucide-react';
import { triggerAdBreak } from '../utils/adSenseService';
import { shareScore, openWhatsAppShare } from '../utils/shareService';
import { showToast } from '../utils/toastService';

interface NonogramProps {
  onGameEnd: (won: boolean, timeSec: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
  isPremium?: boolean;
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

export const Nonogram: React.FC<NonogramProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
  isPremium = false,
}) => {
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

  const isRowSolved = (r: number) => {
    for (let c = 0; c < size; c++) {
      const target = currentPuzzle.grid[r][c] === 1;
      const user = gridState[r][c] === 1;
      if (target !== user) return false;
    }
    return true;
  };

  const isColSolved = (c: number) => {
    for (let r = 0; r < size; r++) {
      const target = currentPuzzle.grid[r][c] === 1;
      const user = gridState[r][c] === 1;
      if (target !== user) return false;
    }
    return true;
  };

  // Rewarded Hint
  const handleHint = () => {
    if (!isPlaying) return;

    // Find first incorrect or unfilled cell and reveal it
    let targetR = -1;
    let targetC = -1;
    outer: for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isTarget = currentPuzzle.grid[r][c] === 1;
        const isUser = gridState[r][c] === 1;
        if (isTarget && !isUser) {
          targetR = r;
          targetC = c;
          break outer;
        }
      }
    }

    if (targetR === -1) {
      showToast(isEn ? 'All cells are already correctly filled!' : 'Tüm kareler zaten dolduruldu!');
      return;
    }

    const doHint = () => {
      const nextState = gridState.map((row) => [...row]);
      nextState[targetR][targetC] = 1;
      setGridState(nextState);
      if (soundEnabled) playSound('tile');
      showToast(isEn ? `💡 Hint: Cell [${targetR + 1},${targetC + 1}] revealed!` : `💡 İpucu: [${targetR + 1},${targetC + 1}] karesi açıldı!`);
      checkWinCondition(nextState);
    };

    if (isPremium) {
      doHint();
    } else {
      triggerAdBreak({
        type: 'reward',
        name: 'nonogram_hint',
        adBreakDone: () => {
          doHint();
        },
      });
    }
  };

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
          showToast(isEn ? `❌ Incorrect tile! (${errors + 1} errors)` : `❌ Hatalı kare! (${errors + 1} hata)`);
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
    <div className="w-full flex flex-col items-center justify-start select-none pt-1 sm:pt-2 pb-2 max-w-3xl sm:max-w-4xl space-y-2 sm:space-y-3">
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

        {/* RIGHT: Hint & Restart Button */}
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
            onClick={() => startNewGame(sizeMode, true)}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>{isEn ? 'New' : 'Yeni'}</span>
          </button>
        </div>
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
            {colClues.map((clues, c) => {
              const colDone = isColSolved(c);
              return (
                <div
                  key={c}
                  className={`${is5x5 ? 'w-9 sm:w-11 md:w-12 text-xs sm:text-sm' : 'w-6 sm:w-7.5 md:w-8.5 text-[10px] sm:text-[11px]'} flex flex-col justify-end items-center pb-1 font-extrabold leading-tight ${
                    colDone ? 'text-emerald-500 opacity-40 line-through' : 'text-gray-600 dark:text-gray-300'
                  } ${
                    c % 5 === 4 && c !== size - 1 ? 'border-r-2 border-r-gray-900 dark:border-r-gray-100' : 'border-r border-r-gray-200 dark:border-r-gray-800'
                  }`}
                >
                  {clues.map((num, i) => (
                    <span key={i} className="my-0.5">
                      {num}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows with clues and cells */}
        <div>
          {rowClues.map((clues, r) => {
            const rowDone = isRowSolved(r);
            return (
              <div key={r} className="flex">
                {/* Row Clue */}
                <div
                  className={`${is5x5 ? 'w-14 sm:w-18 text-xs sm:text-sm' : 'w-11 sm:w-14 text-[10px] sm:text-[11px]'} shrink-0 flex items-center justify-end pr-2 gap-1.5 font-extrabold border-r-2 border-[var(--border-color)] ${
                    rowDone ? 'text-emerald-500 opacity-40 line-through' : 'text-gray-600 dark:text-gray-300'
                  } ${
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
                      className={`${is5x5 ? 'w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12' : 'w-6 h-6 sm:w-7.5 sm:h-7.5 md:w-8.5 md:h-8.5'} flex items-center justify-center transition-all ${borderRight} ${borderBottom} ${
                        state === 1
                          ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-inner'
                          : state === 2
                          ? 'bg-[var(--bg-secondary)]/60 text-gray-400'
                          : 'bg-[var(--bg-card)] hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      {state === 2 && <X size={is5x5 ? 16 : 12} className="text-gray-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* GAME COMPLETED REVEAL CARD */}
      {!isPlaying && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center shadow-lg w-full animate-fadeIn mt-2 max-w-md">
          <div className="text-sm font-black text-emerald-700 dark:text-emerald-300 mb-0.5">
            {isEn
              ? `🎨 Pixel Artwork Discovered: "${puzzleDisplayName}"! 🎉`
              : `🎨 Piksel Resmi Keşfedildi: "${puzzleDisplayName}"! 🎉`}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            {isEn
              ? `Total time: ${formatTime(seconds)} · Errors: ${errors}`
              : `Toplam süre: ${formatTime(seconds)} · Hata: ${errors}`}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={async () => {
                await shareScore({
                  title: isEn ? 'Puzzle Club - Nonogram' : 'Bulmaca Kulübü - Nonogram',
                  gameName: isEn ? 'Nonogram (Pixel Puzzle)' : 'Nonogram (Piksel)',
                  scoreOrAttempts: isEn
                    ? `Solved "${puzzleDisplayName}" in ${formatTime(seconds)}!`
                    : `"${puzzleDisplayName}" resmini ${formatTime(seconds)} içinde çözdüm!`,
                });
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Share2 size={14} className="text-amber-400" />
              <span>{isEn ? 'Share Score' : 'Skoru Paylaş'}</span>
            </button>
            <button
              onClick={() => startNewGame(sizeMode, true)}
              className="px-4 py-2 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
            >
              {isEn ? 'Next Artwork ➔' : 'Sıradaki Resim ➔'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
