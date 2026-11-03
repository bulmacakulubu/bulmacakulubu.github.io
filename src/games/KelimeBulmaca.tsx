import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { AlertCircle, RotateCcw, BookOpen } from 'lucide-react';
import { WORDLE_WORDS_TR, WORDLE_WORDS_EN } from '../data/wordBank';
import { pickUnseenWord, getPoolProgress } from '../utils/wordMemory';
import { fetchWordList, getWordMeaning } from '../utils/dictionaryService';

interface KelimeBulmacaProps {
  onGameEnd: (won: boolean, timeOrScore?: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
}

export const KelimeBulmaca: React.FC<KelimeBulmacaProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
}) => {
  const isTr = language === 'tr';
  const [wordLength, setWordLength] = useState<5 | 7 | 9>(5);
  const [solution, setSolution] = useState(isTr ? 'KİTAP' : 'APPLE');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [startTime, setStartTime] = useState(Date.now());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState(false);
  const [poolStats, setPoolStats] = useState({ seenCount: 0, totalCount: 0 });
  const [meaning, setMeaning] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const startNewRound = async (length = wordLength) => {
    const pool = await fetchWordList(language, length);
    const poolKey = `wordle_${language}_${length}`;
    const result = pickUnseenWord(poolKey, pool);

    setSolution(result.item);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setStartTime(Date.now());
    setMeaning(null);

    const progress = getPoolProgress(poolKey, pool.length);
    setPoolStats({ seenCount: progress.seenCount, totalCount: progress.totalCount });

    if (result.isCycleReset) {
      showToast(
        isTr
          ? 'Tebrikler! Havuzdaki tüm kelimeleri çözdünüz. Baştan başlıyor 🏆'
          : 'Great job! You solved all words in this pool. Resetting 🏆'
      );
    }
  };

  useEffect(() => {
    startNewRound(wordLength);
  }, [wordLength, language]);

  // Load definition when game concludes
  useEffect(() => {
    if (gameStatus !== 'playing') {
      getWordMeaning(solution, language).then((m) => {
        if (m) setMeaning(m);
      });
    }
  }, [gameStatus, solution, language]);

  const handleKey = (key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER' || key === 'GİR') {
      if (currentGuess.length !== wordLength) {
        if (soundEnabled) playSound('error');
        setShakeRow(true);
        setTimeout(() => setShakeRow(false), 500);
        showToast(
          isTr
            ? `Kelime ${wordLength} harfli olmalıdır!`
            : `Word must be ${wordLength} letters!`
        );
        return;
      }

      if (soundEnabled) playSound('tile');
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === solution) {
        setGameStatus('won');
        if (soundEnabled) playSound('win');
        confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
        const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
        onGameEnd(true, timeElapsed);
      } else if (newGuesses.length >= 6) {
        setGameStatus('lost');
        if (soundEnabled) playSound('error');
        onGameEnd(false);
      }
    } else if (key === 'BACKSPACE' || key === 'SİL' || key === '⌫') {
      if (soundEnabled) playSound('click');
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else {
      const regex = isTr ? /^[A-ZÇĞİÖŞÜ]$/ : /^[A-Z]$/;
      if (currentGuess.length < wordLength && regex.test(key)) {
        if (soundEnabled) playSound('click');
        setCurrentGuess((prev) => prev + key);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let k = isTr ? e.key.toLocaleUpperCase('tr-TR') : e.key.toUpperCase();
      if (e.key === 'Enter') k = 'ENTER';
      if (e.key === 'Backspace') k = 'BACKSPACE';
      handleKey(k);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, guesses, gameStatus, wordLength, solution, language]);

  const getLetterStatus = (letter: string, i: number) => {
    if (solution[i] === letter) return 'bg-emerald-600 text-white border-emerald-600 shadow-sm';
    if (solution.includes(letter)) return 'bg-amber-500 text-white border-amber-500 shadow-sm';
    return 'bg-gray-400 dark:bg-gray-600 text-white border-gray-400 dark:border-gray-600';
  };

  const getKeyStatus = (char: string): string => {
    let status = '';
    for (const g of guesses) {
      for (let i = 0; i < g.length; i++) {
        if (g[i] === char) {
          if (solution[i] === char) {
            return 'bg-emerald-600 text-white border-emerald-600';
          }
          if (solution.includes(char)) {
            status = 'bg-amber-500 text-white border-amber-500';
          } else if (!status) {
            status = 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 opacity-60';
          }
        }
      }
    }
    return status;
  };

  const keyboardRowsTR = [
    ['E', 'R', 'T', 'Y', 'U', 'I', 'İ', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş'],
    ['GİR', 'Z', 'C', 'Ç', 'V', 'B', 'N', 'M', 'Ö', '⌫']
  ];

  const keyboardRowsEN = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
  ];

  const keyboardRows = isTr ? keyboardRowsTR : keyboardRowsEN;

  return (
    <div className="w-full flex flex-col items-center justify-center select-none space-y-3 pt-1 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute -top-3 z-30 px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 animate-bounce">
          <AlertCircle size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* UNIFORM CONTROL BAR */}
      <div className="w-full max-w-xl flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        {/* LEFT: Length selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold border border-[var(--border-color)]">
          {[5, 7, 9].map((len) => (
            <button
              key={len}
              onClick={() => {
                setWordLength(len as any);
                startNewRound(len as any);
              }}
              className={`px-3 py-1.5 rounded-lg transition font-extrabold ${
                wordLength === len
                  ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {isTr ? `${len} Harf` : `${len} Letters`}
            </button>
          ))}
        </div>

        {/* CENTER: Live Metric + Memory Progress */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs">
            {isTr ? 'DENEME' : 'ATTEMPT'} <span className="font-extrabold text-[var(--accent-color)]">{guesses.length}/6</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-[11px] text-gray-500">
            {isTr ? 'HAVUZ' : 'POOL'} <span className="font-bold text-[var(--accent-color)]">{poolStats.seenCount}/{poolStats.totalCount}</span>
          </div>
        </div>

        {/* RIGHT: Restart Button (Always in the same top-right spot) */}
        <button
          onClick={() => startNewRound()}
          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs"
        >
          <RotateCcw size={13} />
          <span>{isTr ? 'Yeni Oyun' : 'New Game'}</span>
        </button>
      </div>

      {/* Grid */}
      <div className="flex flex-col items-center justify-center gap-1.5 my-1">
        {Array.from({ length: 6 }).map((_, rowIndex) => {
          const guess = guesses[rowIndex] || (rowIndex === guesses.length ? currentGuess : '');
          const isCompleted = rowIndex < guesses.length;
          const isCurrent = rowIndex === guesses.length;

          return (
            <div
              key={rowIndex}
              className={`grid gap-1.5 transition-transform ${isCurrent && shakeRow ? 'animate-shake' : ''}`}
              style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: wordLength }).map((_, colIndex) => {
                const letter = guess[colIndex] || '';
                let style = 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)]';

                if (isCompleted) {
                  style = getLetterStatus(letter, colIndex);
                } else if (letter) {
                  style = 'bg-[var(--bg-card)] border-[var(--accent-color)] text-[var(--text-primary)] scale-105 shadow-sm';
                }

                return (
                  <div
                    key={colIndex}
                    className={`w-9 h-9 sm:w-10.5 sm:h-10.5 md:w-11.5 md:h-11.5 border-2 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl transition-all duration-200 ${style}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Game End Banner with Dictionary Definition */}
      {gameStatus !== 'playing' && (
        <div className="text-center py-2.5 px-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg animate-fadeIn max-w-md w-full">
          <div className={`text-sm font-bold mb-1 ${gameStatus === 'won' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {gameStatus === 'won'
              ? (isTr ? 'Muhteşem! Kelimeyi Başarıyla Buldunuz! 🎉' : 'Awesome! You guessed the word correctly! 🎉')
              : (isTr ? `Oyun Bitti! Doğru Kelime: ${solution}` : `Game Over! The word was: ${solution}`)}
          </div>

          {/* Dictionary meaning */}
          {meaning && (
            <div className="my-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-left text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
              <BookOpen size={14} className="text-[var(--accent-color)] shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-[var(--accent-color)] mr-1">{solution}:</span>
                <span className="italic">{meaning}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => startNewRound()}
            className="mt-1 px-5 py-2 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-xl font-extrabold text-xs transition shadow-sm"
          >
            {isTr ? 'Sıradaki Kelimeye Geç ➔' : 'Next Word ➔'}
          </button>
        </div>
      )}

      {/* Virtual Keyboard */}
      <div className="w-full max-w-xl space-y-1.5 pt-1">
        {keyboardRows.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((key) => {
              const customStatus = getKeyStatus(key);
              const isSpecial = key === 'GİR' || key === 'ENTER' || key === '⌫';
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key === '⌫' ? 'BACKSPACE' : key)}
                  className={`py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm border transition active:scale-95 shadow-2xs ${
                    customStatus
                      ? customStatus
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${isSpecial ? 'px-3 sm:px-5 font-extrabold text-[10px] sm:text-xs' : 'min-w-[26px] sm:min-w-[34px] px-1.5'}`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};