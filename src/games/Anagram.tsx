import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import {
  RotateCcw,
  Lightbulb,
  Shuffle,
  Share2,
  AlertCircle,
  Trophy,
  Check,
  Star,
  Sparkles,
} from 'lucide-react';
import { ANAGRAM_PUZZLES_TR, AnagramPuzzle } from '../data/anagramBank';
import { pickUnseenWord, getPoolProgress } from '../utils/wordMemory';
import { triggerAdBreak } from '../utils/adSenseService';
import { shareScore } from '../utils/shareService';

interface AnagramProps {
  onGameEnd: (won: boolean, timeOrScore?: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
  isPremium?: boolean;
}

export const Anagram: React.FC<AnagramProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
  isPremium = false,
}) => {
  const isTr = language === 'tr';

  const [puzzle, setPuzzle] = useState<AnagramPuzzle>(ANAGRAM_PUZZLES_TR[0]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [bonusCount, setBonusCount] = useState(0);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [poolStats, setPoolStats] = useState({ seenCount: 0, totalCount: 0 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shakeInput, setShakeInput] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState<{ [word: string]: number }>({}); // word -> number of revealed starting chars

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const shuffleArray = (arr: string[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const startNewPuzzle = () => {
    const poolKey = 'anagram_tr';
    const result = pickUnseenWord(poolKey, ANAGRAM_PUZZLES_TR, (p) => p.id);
    const p = result.item;

    setPuzzle(p);
    setShuffledLetters(shuffleArray(p.letters));
    setCurrentWord('');
    setSelectedIndices([]);
    setFoundWords([]);
    setBonusCount(0);
    setScore(0);
    setIsCompleted(false);
    setRevealedLetters({});

    const progress = getPoolProgress(poolKey, ANAGRAM_PUZZLES_TR.length);
    setPoolStats({ seenCount: progress.seenCount, totalCount: progress.totalCount });

    if (result.isCycleReset) {
      showToast(isTr ? 'Tebrikler! Tüm anagram seviyelerini tamamladınız. Baştan başlıyor 🏆' : 'All anagram levels completed! Resetting loop 🏆');
    }
  };

  useEffect(() => {
    startNewPuzzle();
  }, [language]);

  const handleShuffle = () => {
    setShuffledLetters(shuffleArray(shuffledLetters));
    setCurrentWord('');
    setSelectedIndices([]);
    if (soundEnabled) playSound('click');
  };

  const handleSelectLetter = (char: string, index: number) => {
    if (isCompleted) return;

    if (selectedIndices.includes(index)) {
      // Unselect from this index
      const pos = selectedIndices.indexOf(index);
      if (pos === selectedIndices.length - 1) {
        setSelectedIndices((prev) => prev.slice(0, -1));
        setCurrentWord((prev) => prev.slice(0, -1));
        if (soundEnabled) playSound('click');
      }
      return;
    }

    if (soundEnabled) playSound('tile');
    setSelectedIndices((prev) => [...prev, index]);
    setCurrentWord((prev) => prev + char);
  };

  const handleSubmitWord = () => {
    if (!currentWord || isCompleted) return;

    const word = currentWord.toUpperCase();

    if (foundWords.includes(word)) {
      if (soundEnabled) playSound('error');
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      showToast(isTr ? 'Bu kelimeyi zaten buldunuz!' : 'Already found!');
      setCurrentWord('');
      setSelectedIndices([]);
      return;
    }

    if (puzzle.targetWords.includes(word)) {
      // Target word found!
      if (soundEnabled) playSound('win');
      const wordScore = word.length * 20;
      setScore((prev) => prev + wordScore);
      const nextFound = [...foundWords, word];
      setFoundWords(nextFound);
      setCurrentWord('');
      setSelectedIndices([]);

      showToast(`+${wordScore} Puan: ${word}! 🎯`);

      // Check if all target words are found
      if (nextFound.length === puzzle.targetWords.length) {
        setIsCompleted(true);
        confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });
        onGameEnd(true, score + wordScore);
      }
    } else if (puzzle.bonusWords && puzzle.bonusWords.includes(word)) {
      // Bonus word
      if (soundEnabled) playSound('tile');
      setBonusCount((prev) => prev + 1);
      setScore((prev) => prev + 35);
      showToast(`⭐ Bonus Kelime: +35 Puan!`);
      setCurrentWord('');
      setSelectedIndices([]);
    } else {
      // Invalid
      if (soundEnabled) playSound('error');
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      showToast(isTr ? 'Geçersiz kelime' : 'Invalid word');
      setCurrentWord('');
      setSelectedIndices([]);
    }
  };

  const handleBackspace = () => {
    if (selectedIndices.length > 0) {
      setSelectedIndices((prev) => prev.slice(0, -1));
      setCurrentWord((prev) => prev.slice(0, -1));
      if (soundEnabled) playSound('click');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitWord();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleShuffle();
      } else {
        const char = e.key.toLocaleUpperCase('tr-TR');
        // Find an unused index for this char
        const availableIdx = shuffledLetters.findIndex(
          (l, i) => l === char && !selectedIndices.includes(i)
        );
        if (availableIdx !== -1) {
          handleSelectLetter(char, availableIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shuffledLetters, selectedIndices, currentWord, isCompleted, foundWords]);

  // Rewarded Hint
  const handleRequestHint = () => {
    if (isCompleted) return;

    // Find first unsolved target word
    const unsolved = puzzle.targetWords.filter((w) => !foundWords.includes(w));
    if (unsolved.length === 0) return;

    const chosenWord = unsolved[0];
    const currentRev = revealedLetters[chosenWord] || 0;

    const doReveal = () => {
      setRevealedLetters((prev) => ({
        ...prev,
        [chosenWord]: currentRev + 1,
      }));
      if (soundEnabled) playSound('tile');
      showToast(
        isTr
          ? `İpucu: "${chosenWord.slice(0, currentRev + 1)}" harfleri açıldı! 💡`
          : `Hint: "${chosenWord.slice(0, currentRev + 1)}" revealed! 💡`
      );
    };

    if (isPremium) {
      doReveal();
    } else {
      triggerAdBreak({
        type: 'reward',
        name: 'anagram_hint',
        adBreakDone: () => {
          doReveal();
        },
      });
    }
  };

  const handleShare = async () => {
    await shareScore({
      title: 'Bulmaca Kulübü - Anagram Çözücü',
      gameName: 'Anagram Çözücü',
      scoreOrAttempts: `${score} Puan (${foundWords.length}/${puzzle.targetWords.length} Kelime)`,
    });
    showToast(isTr ? 'Sonuç panoya kopyalandı! 📋' : 'Result copied to clipboard! 📋');
  };

  // Group target words by length
  const wordsByLength: Record<number, string[]> = {};
  puzzle.targetWords.forEach((w) => {
    const len = w.length;
    if (!wordsByLength[len]) wordsByLength[len] = [];
    wordsByLength[len].push(w);
  });
  const sortedLengths = Object.keys(wordsByLength)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="w-full flex flex-col items-center select-none space-y-2 pt-0.5 relative max-w-2xl">
      {/* Toast */}
      {toastMessage && (
        <div className="absolute -top-3 z-30 px-3.5 py-1.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 animate-bounce">
          <AlertCircle size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="w-full flex items-center justify-between pb-1.5 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs sm:text-sm">
            {isTr ? 'Hedef:' : 'Target:'} {foundWords.length}/{puzzle.targetWords.length}
          </span>
          {bonusCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
              <Star size={11} className="fill-amber-500" />
              <span>+{bonusCount} Bonus</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <div className="px-2.5 py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-[11px]">
            PUAN <span className="font-extrabold text-[var(--accent-color)]">{score}</span>
          </div>
          <div className="px-2.5 py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-[10px] text-gray-500">
            {isTr ? 'HAVUZ' : 'POOL'}{' '}
            <span className="font-bold text-[var(--accent-color)]">
              {poolStats.seenCount}/{poolStats.totalCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRequestHint}
            disabled={isCompleted}
            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-40"
            title={isPremium ? 'VIP İpucu' : 'Ödüllü Reklam ile İpucu'}
          >
            <Lightbulb size={13} />
            <span>{isTr ? 'İpucu' : 'Hint'}</span>
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

      {/* Target Word Boxes (Wordscapes style) */}
      <div className="w-full p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs min-h-[140px] flex flex-col justify-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {sortedLengths.map((len) => (
            <div key={len} className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-bold text-gray-400 tracking-wider">
                {len} {isTr ? 'HARFLİ' : 'LETTERS'}
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {wordsByLength[len].map((w) => {
                  const isFound = foundWords.includes(w);
                  const revCount = revealedLetters[w] || 0;

                  return (
                    <div
                      key={w}
                      className={`flex gap-0.5 p-1 rounded-xl border transition-all ${
                        isFound
                          ? 'border-emerald-500/50 bg-emerald-500/10 shadow-xs scale-102'
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                      }`}
                    >
                      {w.split('').map((char, cIdx) => {
                        const showLetter = isFound || cIdx < revCount;

                        return (
                          <div
                            key={cIdx}
                            className={`w-6 h-7 sm:w-7 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm border ${
                              isFound
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : showLetter
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-400 border-dashed'
                                : 'bg-gray-200/50 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                            }`}
                          >
                            {showLetter ? char : ''}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Guess Display Bar */}
      <div
        className={`w-full max-w-sm h-11 px-4 rounded-xl border flex items-center justify-between transition-all ${
          shakeInput ? 'animate-shake border-rose-500' : 'border-[var(--border-color)] bg-[var(--bg-card)]'
        }`}
      >
        <span className="font-black text-base tracking-widest text-[var(--accent-color)]">
          {currentWord || <span className="text-gray-400 font-normal text-xs">{isTr ? 'Harflere dokunun veya klavyeyle yazın...' : 'Tap letters or type...'}</span>}
        </span>

        {currentWord && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBackspace}
              className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              ⌫
            </button>
            <button
              onClick={handleSubmitWord}
              className="px-3 py-1 bg-[var(--accent-color)] text-[var(--accent-contrast)] rounded-lg font-bold text-xs shadow-xs hover:opacity-90 transition cursor-pointer"
            >
              <Check size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Letters Carousel / Wheel Tiles */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
        {shuffledLetters.map((char, index) => {
          const isSelected = selectedIndices.includes(index);
          return (
            <button
              key={`${char}-${index}`}
              onClick={() => handleSelectLetter(char, index)}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl font-black text-lg sm:text-xl border-2 transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer ${
                isSelected
                  ? 'border-gray-400/40 bg-gray-200 dark:bg-gray-800 text-gray-400 opacity-40 scale-90'
                  : 'border-[var(--accent-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:scale-105 hover:bg-[var(--accent-color)] hover:text-[var(--accent-contrast)]'
              }`}
            >
              {char}
            </button>
          );
        })}

        {/* Shuffle Button */}
        <button
          onClick={handleShuffle}
          className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl border-2 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center transition active:rotate-180 cursor-pointer shadow-sm"
          title="Harfleri Karıştır (Boşluk Tuşu)"
        >
          <Shuffle size={18} />
        </button>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="w-full max-w-md p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-center animate-fadeIn shadow-xl mt-2">
          <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-base mb-1">
            <Trophy size={20} />
            <span>Mükemmel! Tüm Kelimeleri Buldunuz! 🎉</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Toplam Skor: <span className="font-extrabold text-[var(--accent-color)]">{score} Puan</span>. Sıradaki anagrama geçebilirsiniz!
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
              Sıradaki Anagram ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

