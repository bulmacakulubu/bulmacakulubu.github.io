import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import {
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  Share2,
  AlertCircle,
  Trophy,
  ArrowRight,
  ArrowDown,
  Repeat,
  Check,
  Sparkles,
} from 'lucide-react';
import { CROSSWORD_PUZZLES_TR, CrosswordPuzzle, CrosswordClue } from '../data/crosswordBank';
import { pickUnseenWord, getPoolProgress } from '../utils/wordMemory';
import { triggerAdBreak } from '../utils/adSenseService';
import { shareScore } from '../utils/shareService';

interface KareBulmacaProps {
  onGameEnd: (won: boolean, timeOrScore?: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
  isPremium?: boolean;
}

const KEYBOARD_ROWS = [
  ['E', 'R', 'T', 'Y', 'U', 'I', 'İ', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş'],
  ['⇄ YÖN', 'Z', 'C', 'Ç', 'V', 'B', 'N', 'M', 'Ö', '⌫'],
];

export const KareBulmaca: React.FC<KareBulmacaProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
  isPremium = false,
}) => {
  const isTr = language === 'tr';

  const [puzzle, setPuzzle] = useState<CrosswordPuzzle>(CROSSWORD_PUZZLES_TR[0]);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [poolStats, setPoolStats] = useState({ seenCount: 0, totalCount: 0 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorCells, setErrorCells] = useState<string[]>([]); // "row-col"
  const [solvedWordKeys, setSolvedWordKeys] = useState<string[]>([]); // "direction-number"
  const [pulseWordKey, setPulseWordKey] = useState<string | null>(null);
  const [shakeWordKey, setShakeWordKey] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const startNewPuzzle = () => {
    const poolKey = 'crossword_tr';
    const result = pickUnseenWord(poolKey, CROSSWORD_PUZZLES_TR, (p) => p.id);
    const p = result.item;

    setPuzzle(p);
    const initialGrid = Array.from({ length: p.rows }, (_, r) =>
      Array.from({ length: p.cols }, (_, c) => (p.grid[r][c] === '#' ? '#' : ''))
    );
    setUserGrid(initialGrid);

    // Find first non-black cell
    let firstR = 0;
    let firstC = 0;
    outer: for (let r = 0; r < p.rows; r++) {
      for (let c = 0; c < p.cols; c++) {
        if (p.grid[r][c] !== '#') {
          firstR = r;
          firstC = c;
          break outer;
        }
      }
    }
    setSelectedCell({ row: firstR, col: firstC });
    setDirection('across');
    setIsCompleted(false);
    setErrorCells([]);
    setSolvedWordKeys([]);
    setPulseWordKey(null);
    setShakeWordKey(null);
    setStartTime(Date.now());

    const progress = getPoolProgress(poolKey, CROSSWORD_PUZZLES_TR.length);
    setPoolStats({ seenCount: progress.seenCount, totalCount: progress.totalCount });

    if (result.isCycleReset) {
      showToast(isTr ? 'Tebrikler! Tüm kare bulmacaları çözdünüz. Baştan başlıyor 🏆' : 'All crosswords completed! Resetting loop 🏆');
    }
  };

  useEffect(() => {
    startNewPuzzle();
  }, [language]);

  // Map cell numbers (1, 2, 3...) based on clue starting coordinates
  const cellNumberMap: Record<string, number> = {};
  puzzle.clues.forEach((clue) => {
    const key = `${clue.row}-${clue.col}`;
    if (!cellNumberMap[key]) {
      cellNumberMap[key] = clue.number;
    }
  });

  // Active clue according to selected cell and direction
  const activeClue = puzzle.clues.find((c) => {
    if (c.direction !== direction) return false;
    if (direction === 'across') {
      return c.row === selectedCell.row && selectedCell.col >= c.col && selectedCell.col < c.col + c.length;
    } else {
      return c.col === selectedCell.col && selectedCell.row >= c.row && selectedCell.row < c.row + c.length;
    }
  }) || puzzle.clues.find((c) => {
    // Fallback in other direction
    if (direction === 'across') {
      return c.col === selectedCell.col && selectedCell.row >= c.row && selectedCell.row < c.row + c.length;
    } else {
      return c.row === selectedCell.row && selectedCell.col >= c.col && selectedCell.col < c.col + c.length;
    }
  });

  const activeClueKey = activeClue ? `${activeClue.direction}-${activeClue.number}` : '';

  // Get word preview string for the active clue e.g. "K I T _ P"
  const getActiveWordPreview = () => {
    if (!activeClue) return '';
    const letters: string[] = [];
    for (let i = 0; i < activeClue.length; i++) {
      const r = activeClue.direction === 'across' ? activeClue.row : activeClue.row + i;
      const c = activeClue.direction === 'across' ? activeClue.col + i : activeClue.col;
      letters.push(userGrid[r]?.[c] || '_');
    }
    return letters.join(' ');
  };

  const isCellInActiveWord = (r: number, c: number) => {
    if (!activeClue) return false;
    if (activeClue.direction === 'across') {
      return r === activeClue.row && c >= activeClue.col && c < activeClue.col + activeClue.length;
    } else {
      return c === activeClue.col && r >= activeClue.row && r < activeClue.row + activeClue.length;
    }
  };

  const toggleDirection = () => {
    setDirection((prev) => (prev === 'across' ? 'down' : 'across'));
    if (soundEnabled) playSound('click');
  };

  const handleCellClick = (r: number, c: number) => {
    if (puzzle.grid[r][c] === '#') return;

    if (selectedCell.row === r && selectedCell.col === c) {
      toggleDirection();
    } else {
      setSelectedCell({ row: r, col: c });
    }
  };

  const handleClueClick = (clue: CrosswordClue) => {
    setSelectedCell({ row: clue.row, col: clue.col });
    setDirection(clue.direction);
    if (soundEnabled) playSound('click');
  };

  const moveNext = (r: number, c: number) => {
    if (direction === 'across') {
      let nextC = c + 1;
      while (nextC < puzzle.cols && puzzle.grid[r][nextC] === '#') {
        nextC++;
      }
      if (nextC < puzzle.cols) {
        setSelectedCell({ row: r, col: nextC });
      }
    } else {
      let nextR = r + 1;
      while (nextR < puzzle.rows && puzzle.grid[nextR][c] === '#') {
        nextR++;
      }
      if (nextR < puzzle.rows) {
        setSelectedCell({ row: nextR, col: c });
      }
    }
  };

  const movePrev = (r: number, c: number) => {
    if (direction === 'across') {
      let prevC = c - 1;
      while (prevC >= 0 && puzzle.grid[r][prevC] === '#') {
        prevC--;
      }
      if (prevC >= 0) {
        setSelectedCell({ row: r, col: prevC });
      }
    } else {
      let prevR = r - 1;
      while (prevR >= 0 && puzzle.grid[prevR][c] === '#') {
        prevR--;
      }
      if (prevR >= 0) {
        setSelectedCell({ row: prevR, col: c });
      }
    }
  };

  // Check if an individual clue is solved
  const checkClueSolved = (clue: CrosswordClue, currentGrid: string[][]) => {
    for (let i = 0; i < clue.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      if (currentGrid[r]?.[c] !== clue.answer[i]) {
        return false;
      }
    }
    return true;
  };

  // Full puzzle verification
  const checkSolution = (currentGrid = userGrid) => {
    let allFilled = true;
    let allCorrect = true;
    const errors: string[] = [];

    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        if (puzzle.grid[r][c] !== '#') {
          const val = currentGrid[r]?.[c] || '';
          if (!val) {
            allFilled = false;
          } else if (val !== puzzle.grid[r][c]) {
            allCorrect = false;
            errors.push(`${r}-${c}`);
          }
        }
      }
    }

    setErrorCells(errors);

    // Update solved clue keys
    const solved = puzzle.clues
      .filter((c) => checkClueSolved(c, currentGrid))
      .map((c) => `${c.direction}-${c.number}`);
    setSolvedWordKeys(solved);

    if (allFilled && allCorrect) {
      setIsCompleted(true);
      if (soundEnabled) playSound('win');
      confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      onGameEnd(true, elapsed);
    } else if (errors.length > 0) {
      if (soundEnabled) playSound('error');
      showToast(isTr ? `${errors.length} harf hatalı!` : `${errors.length} letters incorrect!`);
    }
  };

  // Smart jump to next unfinished clue
  const jumpToNextUnfinishedClue = (currentGrid: string[][]) => {
    const unfinishedClue = puzzle.clues.find((c) => !checkClueSolved(c, currentGrid));
    if (unfinishedClue) {
      // Find first empty or unverified cell in this clue
      for (let i = 0; i < unfinishedClue.length; i++) {
        const r = unfinishedClue.direction === 'across' ? unfinishedClue.row : unfinishedClue.row + i;
        const c = unfinishedClue.direction === 'across' ? unfinishedClue.col + i : unfinishedClue.col;
        if (!currentGrid[r]?.[c] || currentGrid[r][c] !== unfinishedClue.answer[i]) {
          setSelectedCell({ row: r, col: c });
          setDirection(unfinishedClue.direction);
          return;
        }
      }
      setSelectedCell({ row: unfinishedClue.row, col: unfinishedClue.col });
      setDirection(unfinishedClue.direction);
    }
  };

  const handleInputChar = (char: string) => {
    if (isCompleted) return;
    const { row, col } = selectedCell;
    if (puzzle.grid[row][col] === '#') return;

    if (soundEnabled) playSound('tile');

    const newGrid = userGrid.map((rArr, rIdx) =>
      rIdx === row ? rArr.map((cellVal, cIdx) => (cIdx === col ? char : cellVal)) : rArr
    );
    setUserGrid(newGrid);

    // Clear error for this cell
    setErrorCells((prev) => prev.filter((k) => k !== `${row}-${col}`));

    // Wordle-Style Instant Word Validation:
    if (activeClue) {
      // Build word formed in active clue
      let isFull = true;
      let matches = true;
      for (let i = 0; i < activeClue.length; i++) {
        const r = activeClue.direction === 'across' ? activeClue.row : activeClue.row + i;
        const c = activeClue.direction === 'across' ? activeClue.col + i : activeClue.col;
        const letter = newGrid[r]?.[c] || '';
        if (!letter) isFull = false;
        if (letter !== activeClue.answer[i]) matches = false;
      }

      if (isFull && matches) {
        // Correct word! Trigger Wordle green pulse & auto-jump
        const key = `${activeClue.direction}-${activeClue.number}`;
        setPulseWordKey(key);
        setTimeout(() => setPulseWordKey(null), 1200);

        if (!solvedWordKeys.includes(key)) {
          setSolvedWordKeys((prev) => [...prev, key]);
        }
        if (soundEnabled) playSound('win');
        showToast(`✨ "${activeClue.answer}" Doğru!`);

        // Check if full puzzle is now complete
        const allDone = puzzle.clues.every((c) => checkClueSolved(c, newGrid));
        if (allDone) {
          checkSolution(newGrid);
          return;
        }

        // Smart Jump to next clue
        setTimeout(() => jumpToNextUnfinishedClue(newGrid), 300);
        return;
      } else if (isFull && !matches) {
        // Full but wrong: Shake effect
        const key = `${activeClue.direction}-${activeClue.number}`;
        setShakeWordKey(key);
        setTimeout(() => setShakeWordKey(null), 600);
        if (soundEnabled) playSound('error');
      }
    }

    // Default: advance to next cell in current word
    moveNext(row, col);

    // Check if whole puzzle is filled
    const stillEmpty = newGrid.some((rArr, r) =>
      rArr.some((val, c) => puzzle.grid[r][c] !== '#' && !val)
    );
    if (!stillEmpty) {
      checkSolution(newGrid);
    }
  };

  const handleBackspace = () => {
    if (isCompleted) return;
    const { row, col } = selectedCell;

    if (userGrid[row][col]) {
      const newGrid = userGrid.map((rArr, rIdx) =>
        rIdx === row ? rArr.map((cellVal, cIdx) => (cIdx === col ? '' : cellVal)) : rArr
      );
      setUserGrid(newGrid);
      setErrorCells((prev) => prev.filter((k) => k !== `${row}-${col}`));
    } else {
      movePrev(row, col);
    }
    if (soundEnabled) playSound('click');
  };

  // Keyboard navigation and typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setDirection('across');
        moveNext(selectedCell.row, selectedCell.col);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setDirection('across');
        movePrev(selectedCell.row, selectedCell.col);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setDirection('down');
        moveNext(selectedCell.row, selectedCell.col);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setDirection('down');
        movePrev(selectedCell.row, selectedCell.col);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
        toggleDirection();
      } else {
        const trChar = e.key.toLocaleUpperCase('tr-TR');
        if (/^[A-ZÇĞİÖŞÜ]$/.test(trChar)) {
          e.preventDefault();
          handleInputChar(trChar);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, direction, userGrid, isCompleted, activeClue, solvedWordKeys]);

  // Rewarded Hint
  const handleRevealCellHint = () => {
    if (isCompleted) return;

    let targetR = selectedCell.row;
    let targetC = selectedCell.col;

    if (puzzle.grid[targetR][targetC] === '#' || userGrid[targetR][targetC] === puzzle.grid[targetR][targetC]) {
      outer: for (let r = 0; r < puzzle.rows; r++) {
        for (let c = 0; c < puzzle.cols; c++) {
          if (puzzle.grid[r][c] !== '#' && userGrid[r][c] !== puzzle.grid[r][c]) {
            targetR = r;
            targetC = c;
            break outer;
          }
        }
      }
    }

    const doReveal = () => {
      const correctChar = puzzle.grid[targetR][targetC];
      const newGrid = userGrid.map((rArr, rIdx) =>
        rIdx === targetR ? rArr.map((v, cIdx) => (cIdx === targetC ? correctChar : v)) : rArr
      );
      setUserGrid(newGrid);
      setSelectedCell({ row: targetR, col: targetC });
      setErrorCells((prev) => prev.filter((k) => k !== `${targetR}-${targetC}`));
      if (soundEnabled) playSound('tile');
      showToast(isTr ? `İpucu: "${correctChar}" harfi açıldı! 💡` : `Hint: Letter "${correctChar}" revealed! 💡`);

      // Check if clue completed with this hint
      const allDone = puzzle.clues.every((c) => checkClueSolved(c, newGrid));
      if (allDone) {
        checkSolution(newGrid);
      }
    };

    if (isPremium) {
      doReveal();
    } else {
      triggerAdBreak({
        type: 'reward',
        name: 'crossword_hint',
        adBreakDone: () => {
          doReveal();
        },
      });
    }
  };

  const handleShare = async () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    const timeStr = `${m}:${s < 10 ? '0' : ''}${s}`;

    await shareScore({
      title: 'Bulmaca Kulübü - Kare Bulmaca',
      gameName: 'Çengel / Kare Bulmaca',
      scoreOrAttempts: `${timeStr} sürede tamamlandı!`,
    });
    showToast(isTr ? 'Sonuç panoya kopyalandı! 📋' : 'Result copied to clipboard! 📋');
  };

  const acrossClues = puzzle.clues.filter((c) => c.direction === 'across');
  const downClues = puzzle.clues.filter((c) => c.direction === 'down');
  const solvedCount = solvedWordKeys.length;
  const totalClues = puzzle.clues.length;

  return (
    <div className="w-full h-full max-h-[calc(100vh-125px)] flex flex-col items-center justify-between select-none py-1 relative max-w-5xl xl:max-w-6xl">
      {/* Toast */}
      {toastMessage && (
        <div className="absolute -top-3 z-30 px-3.5 py-1.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 animate-bounce">
          <AlertCircle size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Control Bar */}
      <div className="w-full flex items-center justify-between pb-1 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs sm:text-sm">{puzzle.title}</span>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            {puzzle.difficulty}
          </span>
        </div>

        {/* Live Progress Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <div className="px-2.5 py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-[11px]">
            {isTr ? 'İPUÇLARI' : 'CLUES'}{' '}
            <span className="font-extrabold text-emerald-500">
              {solvedCount}/{totalClues}
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-[10px] text-gray-500">
            {isTr ? 'HAVUZ' : 'POOL'}{' '}
            <span className="font-bold text-[var(--accent-color)]">
              {poolStats.seenCount}/{poolStats.totalCount}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRevealCellHint}
            disabled={isCompleted}
            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-40"
            title={isPremium ? 'VIP Harf Aç' : 'Ödüllü Reklam ile Harf Aç'}
          >
            <Lightbulb size={13} />
            <span>{isTr ? 'Harf Aç' : 'Hint'}</span>
          </button>

          <button
            onClick={() => checkSolution()}
            className="px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-600/30 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <CheckCircle2 size={13} />
            <span>{isTr ? 'Kontrol Et' : 'Check'}</span>
          </button>

          <button
            onClick={startNewPuzzle}
            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>{isTr ? 'Yeni' : 'New'}</span>
          </button>
        </div>
      </div>

      {/* Prominent Wordle-Style Active Clue Ribbon (Directly Above Grid) */}
      <div
        onClick={toggleDirection}
        className="w-full p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 transition flex items-center justify-between text-xs text-blue-900 dark:text-blue-100 shadow-xs cursor-pointer group"
        title="Yönü değiştirmek için tıklayın"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-black text-[11px] flex items-center gap-1 shrink-0 group-hover:scale-105 transition-transform">
            <span>{activeClue?.number}</span>
            {direction === 'across' ? <ArrowRight size={12} /> : <ArrowDown size={12} />}
            <span className="uppercase text-[9px]">{direction === 'across' ? 'Yatay' : 'Dikey'}</span>
          </div>
          <span className="font-bold text-xs sm:text-sm truncate">
            {activeClue?.clue || 'Izgaradan bir kare seçin'}
          </span>
        </div>

        {/* Word preview progress letters e.g. K I T _ P */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="font-mono tracking-widest text-xs font-black text-blue-600 dark:text-blue-300 bg-white/70 dark:bg-gray-800/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
            {getActiveWordPreview()}
          </span>
          <span className="text-[10px] text-gray-500 font-semibold hidden sm:inline">
            ({activeClue?.length} Harf)
          </span>
          <Repeat size={13} className="text-blue-500 opacity-60 group-hover:rotate-180 transition-transform" />
        </div>
      </div>

      {/* Main Playing Area: Grid + Clue Panels */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-3 items-start pt-0.5">
        {/* Left Column: Grid + Integrated Virtual Keyboard */}
        <div className="md:col-span-7 flex flex-col items-center">
          {/* Crossword Grid */}
          <div
            className={`p-2.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs flex justify-center items-center transition-all ${
              shakeWordKey === activeClueKey ? 'animate-shake border-rose-500' : ''
            }`}
          >
            <div
              className="grid gap-1 select-none"
              style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))` }}
            >
              {userGrid.map((rowArr, rIdx) =>
                rowArr.map((cellVal, cIdx) => {
                  const isBlack = puzzle.grid[rIdx][cIdx] === '#';
                  const isSelected = selectedCell.row === rIdx && selectedCell.col === cIdx;
                  const inActiveWord = isCellInActiveWord(rIdx, cIdx);
                  const hasError = errorCells.includes(`${rIdx}-${cIdx}`);
                  const cellNum = cellNumberMap[`${rIdx}-${cIdx}`];
                  const isPulsing = pulseWordKey === activeClueKey && inActiveWord;

                  if (isBlack) {
                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 dark:bg-black rounded-lg shadow-inner"
                      />
                    );
                  }

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 border-2 rounded-lg relative flex items-center justify-center font-black text-sm sm:text-base cursor-pointer transition-all ${
                        isPulsing
                          ? 'border-emerald-500 bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 scale-105 ring-2 ring-emerald-400'
                          : isSelected
                          ? 'border-blue-500 bg-blue-500/20 text-blue-900 dark:text-blue-100 shadow-md scale-105 z-10 ring-2 ring-blue-400'
                          : inActiveWord
                          ? 'border-blue-400/50 bg-blue-500/10 text-gray-900 dark:text-white'
                          : hasError
                          ? 'border-rose-500 bg-rose-500/20 text-rose-600'
                          : 'border-[var(--border-color)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {/* Cell starting number */}
                      {cellNum && (
                        <span className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-extrabold text-gray-400 leading-none">
                          {cellNum}
                        </span>
                      )}

                      {/* Direction Arrow Indicator on active cell */}
                      {isSelected && !cellVal && (
                        <span className="absolute bottom-0.5 right-1 text-[9px] text-blue-500 font-bold opacity-80 animate-pulse">
                          {direction === 'across' ? '➔' : '⬇'}
                        </span>
                      )}

                      <span>{cellVal}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Integrated On-Screen Keyboard (Wordle Style) */}
          <div className="w-full max-w-md space-y-1 pt-1.5 shrink-0">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-0.5 sm:gap-1 w-full">
                {row.map((key) => {
                  const isSpecial = key === '⇄ YÖN' || key === '⌫';
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (key === '⇄ YÖN') toggleDirection();
                        else if (key === '⌫') handleBackspace();
                        else handleInputChar(key);
                      }}
                      className={`h-7 sm:h-8 rounded-lg font-bold text-xs border transition active:scale-95 shadow-2xs cursor-pointer flex items-center justify-center ${
                        key === '⇄ YÖN'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 px-1.5 font-extrabold flex-[1.4] max-w-[56px]'
                          : key === '⌫'
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 px-2 flex-[1.2] max-w-[48px]'
                          : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 flex-1 max-w-[36px]'
                      }`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Clues List with Live Checkmarks */}
        <div className="md:col-span-5 flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
          {/* Soldan Sağa Clues */}
          <div className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
            <h4 className="text-[11px] font-black uppercase text-gray-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ArrowRight size={13} className="text-blue-500" />
                <span>Soldan Sağa</span>
              </span>
              <span className="text-[10px] text-blue-500 font-semibold">{acrossClues.length} İpucu</span>
            </h4>
            <div className="space-y-1">
              {acrossClues.map((c) => {
                const isSelected = activeClue === c;
                const isSolved = solvedWordKeys.includes(`across-${c.number}`);

                return (
                  <div
                    key={`a-${c.number}`}
                    onClick={() => handleClueClick(c)}
                    className={`p-1.5 rounded-lg text-xs cursor-pointer transition flex items-start justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-800 dark:text-blue-200 font-bold'
                        : isSolved
                        ? 'bg-emerald-500/10 text-gray-500 dark:text-gray-400 line-through opacity-80'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-1.5 truncate">
                      <span className="font-black text-blue-500 shrink-0">{c.number}.</span>
                      <span className="text-[11px] leading-tight truncate">{c.clue}</span>
                    </div>
                    {isSolved && <Check size={14} className="text-emerald-500 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Yukarıdan Aşağıya Clues */}
          <div className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
            <h4 className="text-[11px] font-black uppercase text-gray-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ArrowDown size={13} className="text-purple-500" />
                <span>Yukarıdan Aşağıya</span>
              </span>
              <span className="text-[10px] text-purple-500 font-semibold">{downClues.length} İpucu</span>
            </h4>
            <div className="space-y-1">
              {downClues.map((c) => {
                const isSelected = activeClue === c;
                const isSolved = solvedWordKeys.includes(`down-${c.number}`);

                return (
                  <div
                    key={`d-${c.number}`}
                    onClick={() => handleClueClick(c)}
                    className={`p-1.5 rounded-lg text-xs cursor-pointer transition flex items-start justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-purple-500/20 border border-purple-500/40 text-purple-800 dark:text-purple-200 font-bold'
                        : isSolved
                        ? 'bg-emerald-500/10 text-gray-500 dark:text-gray-400 line-through opacity-80'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-1.5 truncate">
                      <span className="font-black text-purple-500 shrink-0">{c.number}.</span>
                      <span className="text-[11px] leading-tight truncate">{c.clue}</span>
                    </div>
                    {isSolved && <Check size={14} className="text-emerald-500 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal / Banner */}
      {isCompleted && (
        <div className="w-full max-w-md p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-center animate-fadeIn shadow-xl mt-2">
          <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-base mb-1">
            <Trophy size={20} />
            <span>Tebrikler! Bulmacayı Çözdünüz! 🎉</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Tüm kareler başarıyla dolduruldu. Sıradaki kare bulmacaya geçebilirsiniz!
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Share2 size={13} />
              <span>Skoru Paylaş</span>
            </button>
            <button
              onClick={startNewPuzzle}
              className="px-4 py-1.5 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
            >
              Sıradaki Bulmaca ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
