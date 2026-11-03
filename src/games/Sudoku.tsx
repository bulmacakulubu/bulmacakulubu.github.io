import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { RotateCcw } from 'lucide-react';
import { generateSudoku, SudokuDifficulty } from '../utils/sudokuGenerator';

interface SudokuProps {
  onGameEnd: (won: boolean, timeSec: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
}

export const Sudoku: React.FC<SudokuProps> = ({ onGameEnd, soundEnabled, language = 'tr' }) => {
  const isEn = language === 'en';
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');
  const [board, setBoard] = useState<number[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [initialBoard, setInitialBoard] = useState<number[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [solutionBoard, setSolutionBoard] = useState<number[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
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

  const handleNumberInput = (num: number) => {
    if (!selectedCell || !isPlaying) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return;

    const isCorrect = solutionBoard[r][c] === num;

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;

    if (!isCorrect && num !== 0) {
      if (soundEnabled) playSound('error');
      setErrors((prev) => prev + 1);
    } else {
      if (soundEnabled) playSound('tile');
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
      confetti({ particleCount: 110, spread: 75 });
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClear();
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
  }, [selectedCell, isPlaying, board, difficulty, initialBoard, solutionBoard]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const selectedValue = selectedCell ? board[selectedCell[0]][selectedCell[1]] : 0;

  return (
    <div className="w-full max-w-2xl flex flex-col items-center justify-start select-none space-y-3">
      {/* UNIFORM CONTROL BAR */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        {/* LEFT: Difficulty selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold border border-[var(--border-color)]">
          {(['easy', 'medium', 'hard'] as SudokuDifficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => startNewGame(d)}
              className={`px-3 py-1.5 rounded-lg transition font-extrabold ${
                difficulty === d
                  ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {d === 'easy' ? (isEn ? 'Easy' : 'Kolay') : d === 'medium' ? (isEn ? 'Medium' : 'Orta') : (isEn ? 'Hard' : 'Zor')}
            </button>
          ))}
        </div>

        {/* CENTER: Live Metrics */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs">
            ⏱ {formatTime(seconds)}
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-rose-500 font-bold">
            {isEn ? 'ERRORS' : 'HATA'} {errors}
          </div>
        </div>

        {/* RIGHT: Restart Button (Always in the same top-right spot) */}
        <button
          onClick={() => startNewGame(difficulty)}
          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs"
        >
          <RotateCcw size={13} />
          <span>{isEn ? 'New Game' : 'Yeni Oyun'}</span>
        </button>
      </div>

      {/* COMPACT & RESPONSIVE 9x9 SUDOKU BOARD */}
      <div className="p-1 sm:p-1.5 rounded-2xl border-2 border-gray-900 dark:border-gray-100 bg-[var(--bg-card)] shadow-md">
        <div className="grid grid-cols-9 gap-0 border border-gray-300 dark:border-gray-700">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isInitial = initialBoard[r][c] !== 0;
              const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
              const isSameRowOrCol =
                selectedCell && (selectedCell[0] === r || selectedCell[1] === c);
              const isSameValue = selectedValue > 0 && val === selectedValue;
              const isWrong = !isInitial && val !== 0 && val !== solutionBoard[r][c];

              const borderRight = c % 3 === 2 && c !== 8 ? 'border-r-2 border-r-gray-900 dark:border-r-gray-100' : 'border-r border-r-gray-200 dark:border-r-gray-800';
              const borderBottom = r % 3 === 2 && r !== 8 ? 'border-b-2 border-b-gray-900 dark:border-b-gray-100' : 'border-b border-b-gray-200 dark:border-b-gray-800';

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => setSelectedCell([r, c])}
                  className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 md:w-9.5 md:h-9.5 flex items-center justify-center font-extrabold text-sm sm:text-base md:text-lg transition-colors ${borderRight} ${borderBottom} ${
                    isSelected
                      ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] font-black'
                      : isSameValue
                      ? 'bg-[var(--accent-light)] text-[var(--accent-color)] font-black'
                      : isSameRowOrCol
                      ? 'bg-gray-100/70 dark:bg-gray-800/60'
                      : 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/30'
                  } ${
                    isWrong
                      ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30'
                      : isInitial
                      ? 'text-gray-900 dark:text-gray-100 font-black'
                      : 'text-[var(--accent-color)]'
                  }`}
                >
                  {val !== 0 ? val : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* COMPACT NUMBER PAD */}
      <div className="w-full max-w-md flex flex-col items-center gap-2 pt-1">
        <div className="grid grid-cols-9 gap-1.5 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="py-1.5 sm:py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--accent-color)] hover:text-[var(--accent-contrast)] font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100 transition shadow-2xs active:scale-95"
            >
              {num}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 px-1">
          <span>{isEn ? 'Keyboard 1-9 & arrow keys supported' : 'Klavyeden 1-9 & ok tuşları desteklenir'}</span>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition text-xs font-bold text-gray-600 dark:text-gray-300 shadow-2xs"
          >
            {isEn ? 'Erase (⌫)' : 'Sil (⌫)'}
          </button>
        </div>
      </div>
    </div>
  );
};