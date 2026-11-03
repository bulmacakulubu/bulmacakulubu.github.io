import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { Shuffle, RotateCcw, AlertCircle, Check } from 'lucide-react';
import {
  SCRABBLE_POOLS_TR,
  SCRABBLE_POOLS_EN,
} from '../data/wordBank';
import { validateAndGetMeaning } from '../utils/dictionaryService';

interface KelimeTuretmeProps {
  onGameEnd: (won: boolean, score?: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
}

export const KelimeTuretme: React.FC<KelimeTuretmeProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
}) => {
  const isTr = language === 'tr';
  const pools = isTr ? SCRABBLE_POOLS_TR : SCRABBLE_POOLS_EN;

  const [poolIndex, setPoolIndex] = useState(0);
  const [letters, setLetters] = useState(pools[0]);
  const [currentWord, setCurrentWord] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isPlaying, setIsPlaying] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Reset when language changes
  useEffect(() => {
    setPoolIndex(0);
    setLetters([...pools[0]].sort(() => Math.random() - 0.5));
    setCurrentWord([]);
    setFoundWords([]);
    setScore(0);
    setTimeLeft(120);
    setIsPlaying(true);
  }, [language]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      if (score > 0) {
        if (soundEnabled) playSound('win');
        confetti({ particleCount: 90, spread: 65 });
        onGameEnd(true, score);
      } else {
        onGameEnd(false, 0);
      }
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score]);

  const handleShuffle = () => {
    if (soundEnabled) playSound('click');
    setLetters([...letters].sort(() => Math.random() - 0.5));
  };

  const handleSelectLetter = (item: { letter: string; points: number }) => {
    if (!isPlaying) return;
    if (soundEnabled) playSound('tile');
    setCurrentWord([...currentWord, item.letter]);
  };

  const handleBackspace = () => {
    if (soundEnabled) playSound('click');
    setCurrentWord(currentWord.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (!isPlaying || currentWord.length === 0) return;
    const wordStr = currentWord.join('');

    if (foundWords.includes(wordStr)) {
      if (soundEnabled) playSound('error');
      showToast(isTr ? 'Bu kelimeyi zaten buldunuz!' : 'You already found this word!');
      setCurrentWord([]);
      return;
    }

    if (wordStr.length < 3) {
      if (soundEnabled) playSound('error');
      showToast(isTr ? 'Kelime en az 3 harfli olmalıdır!' : 'Word must be at least 3 letters!');
      return;
    }

    // Hybrid Dictionary Check (Local bank + Live TDK / Free Dictionary API fallback)
    const validation = await validateAndGetMeaning(wordStr, language);
    if (!validation.isValid) {
      if (soundEnabled) playSound('error');
      showToast(
        isTr
          ? `"${wordStr}" sözlükte geçerli bulunamadı!`
          : `"${wordStr}" not recognized in dictionary!`
      );
      return;
    }

    // Valid word found!
    const wordPoints = currentWord.reduce((acc, l) => {
      const found = letters.find((p) => p.letter === l);
      return acc + (found ? found.points : 1);
    }, 0);

    const bonus = currentWord.length === 7 ? 20 : currentWord.length >= 5 ? 8 : 0;
    const totalPoints = wordPoints + bonus;

    if (soundEnabled) playSound('success');
    setScore((prev) => prev + totalPoints);
    setFoundWords([wordStr, ...foundWords]);
    setCurrentWord([]);

    if (validation.meaning) {
      const shortDef = validation.meaning.length > 40 ? validation.meaning.slice(0, 40) + '...' : validation.meaning;
      showToast(`+${totalPoints} P! "${wordStr}": ${shortDef}`);
    } else {
      showToast(isTr ? `+${totalPoints} Puan! Harika!` : `+${totalPoints} Points! Great!`);
    }
  };

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      const char = isTr ? e.key.toLocaleUpperCase('tr-TR') : e.key.toUpperCase();

      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else {
        const regex = isTr ? /^[A-ZÇĞİÖŞÜ]$/ : /^[A-Z]$/;
        if (regex.test(char)) {
          const matched = letters.find((l) => l.letter === char);
          if (matched) {
            handleSelectLetter(matched);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWord, foundWords, isPlaying, letters, language]);

  const resetGame = () => {
    const nextPoolIdx = (poolIndex + 1) % pools.length;
    setPoolIndex(nextPoolIdx);
    setLetters([...pools[nextPoolIdx]].sort(() => Math.random() - 0.5));
    setCurrentWord([]);
    setFoundWords([]);
    setScore(0);
    setTimeLeft(120);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-start select-none space-y-3 pt-1 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute -top-3 z-30 px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 animate-bounce">
          <AlertCircle size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* UNIFORM CONTROL BAR */}
      <div className="w-full max-w-3xl sm:max-w-4xl flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        {/* LEFT: Game Mode & Set */}
        <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs text-xs font-semibold">
          {isTr ? 'SET' : 'SET'}{' '}
          <span className="font-extrabold text-[var(--accent-color)] ml-1">
            {poolIndex + 1}/{pools.length}
          </span>
        </div>

        {/* CENTER: Live Metrics */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            ⏱ {formatTime(timeLeft)}
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isTr ? 'PUAN' : 'SCORE'}{' '}
            <span className="font-extrabold text-[var(--accent-color)]">{score}</span>
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isTr ? 'BULUNAN' : 'FOUND'}{' '}
            <span className="font-extrabold text-[var(--accent-color)]">{foundWords.length}</span>
          </div>
        </div>

        {/* RIGHT: Restart Button (Always in the same top-right spot) */}
        <button
          onClick={resetGame}
          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs"
        >
          <RotateCcw size={13} />
          <span>{isTr ? 'Yeni Taşlar' : 'New Tiles'}</span>
        </button>
      </div>

      <div className="w-full max-w-3xl sm:max-w-4xl flex flex-col sm:flex-row gap-4 sm:gap-6 items-start justify-center">
        {/* Main interactive area */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          {/* Current Word Preview Box */}
          <div className="w-full h-18 sm:h-20 border-2 border-dashed border-[var(--border-color)] rounded-2xl flex items-center justify-center gap-2 sm:gap-2.5 mb-3.5 bg-[var(--bg-card)] px-4 shadow-xs">
            {currentWord.length === 0 ? (
              <span className="text-gray-400 text-xs sm:text-sm font-medium">
                {isTr ? 'Harflere tıklayın veya klavyeden yazın' : 'Click letters or type on keyboard'}
              </span>
            ) : (
              currentWord.map((l, i) => (
                <span
                  key={i}
                  className="w-12 h-12 sm:w-13 sm:h-13 bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--accent-color)] font-black rounded-xl flex items-center justify-center shadow-xs text-xl sm:text-2xl animate-pop"
                >
                  {l}
                </span>
              ))
            )}
          </div>

          {/* Scrabble Letter Tiles */}
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3.5 mb-4 sm:mb-5">
            {letters.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectLetter(item)}
                disabled={!isPlaying}
                className="w-14 h-17 sm:w-16 sm:h-20 bg-[var(--bg-card)] border-2 border-[var(--border-color)] hover:border-[var(--accent-color)] rounded-2xl flex flex-col items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">{item.letter}</span>
                <span className="text-xs text-[var(--accent-color)] font-bold">{item.points}p</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleShuffle}
              className="px-4.5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] shadow-2xs"
            >
              <Shuffle size={14} />
              <span>{isTr ? 'Karıştır' : 'Shuffle'}</span>
            </button>
            <button
              onClick={handleBackspace}
              disabled={currentWord.length === 0}
              className="px-4.5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-40 rounded-xl text-xs sm:text-sm font-bold transition border border-[var(--border-color)] shadow-2xs"
            >
              {isTr ? 'Sil (⌫)' : 'Delete (⌫)'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={currentWord.length === 0}
              className="px-6 sm:px-7 py-2.5 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 disabled:opacity-40 rounded-xl text-xs sm:text-sm font-extrabold transition shadow-sm flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>{isTr ? 'Gönder (Enter)' : 'Submit (Enter)'}</span>
            </button>
          </div>
        </div>

        {/* Found Words Sidebar */}
        <div className="w-full sm:w-64 md:w-72 p-3 sm:p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>{isTr ? 'Bulunanlar' : 'Found Words'}</span>
            <span className="text-[var(--accent-color)] font-extrabold">{foundWords.length}</span>
          </div>
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {foundWords.length === 0 ? (
              <div className="text-[11px] text-gray-400 py-3 text-center">
                {isTr ? 'Henüz kelime bulunmadı' : 'No words found yet'}
              </div>
            ) : (
              foundWords.map((w, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] text-[11px] sm:text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between"
                >
                  <span>{w}</span>
                  <span className="text-[10px] text-[var(--accent-color)] font-bold">✓</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};