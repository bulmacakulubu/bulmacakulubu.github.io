import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { RotateCcw, Edit3, Lightbulb, Share2, MessageSquare, Check, Sparkles } from 'lucide-react';
import { generateSudoku, SudokuDifficulty } from '../utils/sudokuGenerator';
import { triggerAdBreak } from '../utils/adSenseService';
import { shareScore, openWhatsAppShare } from '../utils/shareService';
import { showToast } from '../utils/toastService';

interface SudokuProps {
  onGameEnd: (won: boolean, timeSec: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
  isPremium?: boolean;
}

export const Sudoku: React.FC<SudokuProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
  isPremium = false,
}) => {
  const isEn = language === 'en';
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');
  const [board, setBoard] = useState<number[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [initialBoard, setInitialBoard] = useState<number[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [solutionBoard, setSolutionBoard] = useState<number[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [notes, setNotes] = useState<number[][][]>(() =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []))
  );
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const startNewGame = (diff = difficulty) => {
    const generated = generateSudoku(diff);
    setDifficulty(diff);
    setBoard(generated.initial.map((r) => [...r]));
    setInitialBoard(generated.initial.map((r) => [...r]));
    setSolutionBoard(generated.solution.map((r) => [...r]));
    setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])));
    setSelectedCell(null);
    setErrors(0);
    setSeconds(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    startNewGame(difficulty);
  }, []);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Count placed instances of each digit 1-9
  const digitCounts: Record<number, number> = {};
  for (let d = 1; d <= 9; d++) digitCounts[d] = 0;
  board.forEach((row) => {
    row.forEach((num) => {
      if (num >= 1 && num <= 9) digitCounts[num]++;
    });
  });

  const handleNumberInput = (num: number) => {
    if (!selectedCell || !isPlaying) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return;

    if (isNotesMode) {
      // Toggle note in this cell
      if (soundEnabled) playSound('click');
      const newNotes = notes.map((rowArr, rIdx) =>
        rowArr.map((cellNotes, cIdx) => {
          if (rIdx === r && cIdx === c) {
            return cellNotes.includes(num)
              ? cellNotes.filter((n) => n !== num)
              : [...cellNotes, num].sort((a, b) => a - b);
          }
          return cellNotes;
        })
      );
      setNotes(newNotes);
      return;
    }

    const isCorrect = solutionBoard[r][c] === num;

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;

    if (!isCorrect && num !== 0) {
      if (soundEnabled) playSound('error');
      setErrors((prev) => prev + 1);
      showToast(language === 'tr' ? `❌ Hatalı sayı! (${errors + 1} Hata)` : `❌ Wrong number! (${errors + 1} Errors)`);
    } else {
      if (soundEnabled) playSound('tile');
      // Clear notes in this cell
      const newNotes = notes.map((rowArr, rIdx) =>
        rowArr.map((cellNotes, cIdx) => (rIdx === r && cIdx === c ? [] : cellNotes))
      );
      setNotes(newNotes);
    }

    setBoard(newBoard);

    let isComplete = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (newBoard[i][j] !== solutionBoard[i][j]) {
          isComplete = false;
          break;
        }
      }
      if (!isComplete) break;
    }

    if (isComplete) {
      setIsPlaying(false);
      if (soundEnabled) playSound('win');
      confetti({ particleCount: 120, spread: 80 });
      onGameEnd(true, seconds);
    }
  };

  const handleClear = () => {
    if (!selectedCell || !isPlaying) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return;
    if (soundEnabled) playSound('click');
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
  };

  // Rewarded Hint
  const handleHint = () => {
    if (!isPlaying) return;

    // Pick selected cell if empty, or first empty cell
    let targetR = selectedCell ? selectedCell[0] : -1;
    let targetC = selectedCell ? selectedCell[1] : -1;

    if (targetR === -1 || board[targetR][targetC] !== 0) {
      outer: for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === 0) {
            targetR = r;
            targetC = c;
            break outer;
          }
        }
      }
    }

    if (targetR === -1) {
      showToast(language === 'tr' ? 'Tüm hücreler zaten dolu!' : 'All cells are already filled!');
      return;
    }

    const doHint = () => {
      const correctNum = solutionBoard[targetR][targetC];
      const newBoard = board.map((row, r) =>
        row.map((val, c) => (r === targetR && c === targetC ? correctNum : val))
      );
      setBoard(newBoard);
      setSelectedCell([targetR, targetC]);
      if (soundEnabled) playSound('tile');
      showToast(language === 'tr' ? `💡 İpucu: [${targetR + 1}, ${targetC + 1}] hücresine ${correctNum} yerleştirildi!` : `💡 Hint: Cell [${targetR + 1}, ${targetC + 1}] filled with ${correctNum}!`);
    };

    if (isPremium) {
      doHint();
    } else {
      triggerAdBreak({
        type: 'reward',
        name: 'sudoku_hint',
        adBreakDone: () => {
          doHint();
        },
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClear();
      } else if (e.key.toLowerCase() === 'n') {
        setIsNotesMode((prev) => !prev);
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        setSelectedCell((curr) => {
          if (!curr) return [0, 0];
          let [r, c] = curr;
          if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
          if (e.key === 'ArrowDown') r = Math.min(8, r + 1);
          if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
          if (e.key === 'ArrowRight') c = Math.min(8, c + 1);
          return [r, c];
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, isPlaying, board, difficulty, initialBoard, solutionBoard, isNotesMode, notes]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const selectedValue = selectedCell ? board[selectedCell[0]][selectedCell[1]] : 0;

  const handleShare = async () => {
    await shareScore({
      title: 'Bulmaca Kulübü - Sudoku',
      gameName: 'Sudoku',
      scoreOrAttempts: `${difficulty.toUpperCase()} | ${formatTime(seconds)} | ${errors} Hata`,
    });
  };

  const handleShareWhatsApp = () => {
    const text = `🧩 Bulmaca Kulübü: Sudoku (${difficulty.toUpperCase()})\n⏱️ Süre: ${formatTime(seconds)}\n❌ Hata: ${errors}\nSen de oyna: https://bulmacakulubu.github.io`;
    openWhatsAppShare(text);
  };

  return (
    <div className="w-full h-full max-h-[calc(100vh-125px)] flex flex-col items-center justify-between select-none py-1 max-w-xl">
      {/* UNIFORM CONTROL BAR */}
      <div className="w-full flex items-center justify-between pb-1.5 border-b border-[var(--border-color)]">
        {/* LEFT: Difficulty selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl text-xs font-semibold border border-[var(--border-color)]">
          {(['easy', 'medium', 'hard'] as SudokuDifficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => startNewGame(d)}
              className={`px-2.5 py-1 rounded-lg transition font-extrabold text-[11px] ${
                difficulty === d
                  ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {d === 'easy' ? (isEn ? 'Easy' : 'Kolay') : d === 'medium' ? (isEn ? 'Medium' : 'Orta') : (isEn ? 'Hard' : 'Zor')}
            </button>
          ))}
        </div>

        {/* CENTER: Timer & Errors */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs font-mono text-[11px]">
            ⏱ {formatTime(seconds)}
          </div>
          <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs text-[11px]">
            {isEn ? 'ERRORS' : 'HATA'}:{' '}
            <span className={`font-extrabold ${errors > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {errors}
            </span>
          </div>
        </div>

        {/* RIGHT: Hint & New Game */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleHint}
            disabled={!isPlaying}
            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-40"
            title={isPremium ? 'VIP İpucu' : 'Ödüllü Reklam ile İpucu'}
          >
            <Lightbulb size={13} />
            <span>{isEn ? 'Hint' : 'İpucu'}</span>
          </button>

          <button
            onClick={() => startNewGame(difficulty)}
            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>{isEn ? 'New' : 'Yeni'}</span>
          </button>
        </div>
      </div>

      {/* SUDOKU BOARD (NYT Style Smart Lighting) */}
      <div className="p-2 sm:p-3 rounded-2xl border-2 border-gray-400 dark:border-gray-600 bg-[var(--bg-card)] shadow-md">
        <div className="grid grid-cols-9 border-2 border-gray-800 dark:border-gray-200">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isInitial = initialBoard[r][c] !== 0;
              const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
              const isSameRegion =
                selectedCell &&
                (selectedCell[0] === r ||
                  selectedCell[1] === c ||
                  (Math.floor(selectedCell[0] / 3) === Math.floor(r / 3) &&
                    Math.floor(selectedCell[1] / 3) === Math.floor(c / 3)));
              const isSameNumber = selectedValue > 0 && val === selectedValue;
              const isWrong = val !== 0 && val !== solutionBoard[r][c];

              // Block border styling
              const borderR = c % 3 === 2 && c !== 8 ? 'border-r-2 border-r-gray-800 dark:border-r-gray-200' : 'border-r border-r-gray-200 dark:border-r-gray-700';
              const borderB = r % 3 === 2 && r !== 8 ? 'border-b-2 border-b-gray-800 dark:border-b-gray-200' : 'border-b border-b-gray-200 dark:border-b-gray-700';

              const cellNotes = notes[r]?.[c] || [];

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => setSelectedCell([r, c])}
                  className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 max-h-[calc((100vh-230px)/9)] max-w-[calc((100vh-230px)/9)] aspect-square flex items-center justify-center font-bold text-xs sm:text-base relative transition-all cursor-pointer ${borderR} ${borderB} ${
                    isSelected
                      ? 'bg-blue-600 text-white z-10 scale-105 shadow-sm'
                      : isSameNumber
                      ? 'bg-blue-200/80 dark:bg-blue-900/60 font-black'
                      : isSameRegion
                      ? 'bg-blue-50/70 dark:bg-gray-800/60'
                      : 'bg-transparent'
                  } ${isWrong ? 'text-rose-600 dark:text-rose-400 font-black' : isInitial ? 'text-gray-900 dark:text-white font-extrabold' : 'text-blue-600 dark:text-blue-400'}`}
                >
                  {val !== 0 ? (
                    val
                  ) : cellNotes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5 text-[8px] sm:text-[9px] font-normal leading-none text-gray-500 dark:text-gray-400">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <span key={n} className="flex items-center justify-center">
                          {cellNotes.includes(n) ? n : ''}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Number Pad & Note Toggle (NYT Style) */}
      <div className="w-full max-w-md flex flex-col items-center gap-1.5 pt-1">
        {/* Digits 1-9 */}
        <div className="grid grid-cols-9 gap-1 sm:gap-1.5 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const placedCount = digitCounts[num] || 0;
            const isCompleted = placedCount >= 9;

            return (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                disabled={!isPlaying || isCompleted}
                className={`h-10 sm:h-11 rounded-xl border flex flex-col items-center justify-center transition active:scale-95 shadow-2xs cursor-pointer ${
                  isCompleted
                    ? 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-300 dark:text-gray-700 opacity-40'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-blue-500'
                }`}
              >
                <span className="font-extrabold text-sm sm:text-base leading-none">{num}</span>
                <span className="text-[9px] text-gray-400 font-semibold">{9 - placedCount}</span>
              </button>
            );
          })}
        </div>

        {/* Action Bar (Notes Toggle & Erase) */}
        <div className="flex items-center justify-center gap-2 pt-1 w-full">
          <button
            onClick={() => setIsNotesMode((prev) => !prev)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
              isNotesMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-102'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Edit3 size={14} />
            <span>{isNotesMode ? (isEn ? 'Notes: ON' : 'Not Modu: AÇIK') : (isEn ? 'Notes: OFF' : 'Not Modu (N)')}</span>
          </button>

          <button
            onClick={handleClear}
            className="px-4 py-2 bg-[var(--bg-card)] hover:bg-gray-100 dark:hover:bg-gray-800 border border-[var(--border-color)] rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            {isEn ? 'Erase (⌫)' : 'Sil (⌫)'}
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {!isPlaying && (
        <div className="w-full max-w-md p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center animate-fadeIn shadow-xl mt-1">
          <div className="text-sm font-black text-emerald-700 dark:text-emerald-300 mb-1">
            🎉 {isEn ? 'Sudoku Solved!' : 'Tebrikler! Sudoku Çözüldü!'}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Süre: <b>{formatTime(seconds)}</b> | Hatalar: <b>{errors}</b>
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Share2 size={14} className="text-amber-400" />
              <span>{language === 'tr' ? 'Skoru Paylaş' : 'Share Score'}</span>
            </button>
            <button
              onClick={() => startNewGame(difficulty)}
              className="px-4 py-2 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
            >
              Yeni Oyun ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
