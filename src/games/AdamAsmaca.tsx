import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { Heart, RotateCcw, Lightbulb } from 'lucide-react';
import { HANGMAN_PUZZLES_TR, HANGMAN_PUZZLES_EN, HangmanPuzzle } from '../data/wordBank';
import { pickUnseenWord, getPoolProgress } from '../utils/wordMemory';

interface AdamAsmacaProps {
  onGameEnd: (won: boolean) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
}

const LOCAL_PUZZLES_TR: HangmanPuzzle[] = [
  { category: 'Tarih', word: 'PİRAMİT', hint: 'Firavun' },
  { category: 'Tarih', word: 'MEDENİYET', hint: 'Uygarlık' },
  { category: 'Tarih', word: 'ARKEOLOJİ', hint: 'Kazı' },
  { category: 'Tarih', word: 'PADİŞAH', hint: 'Osmanlı' },
  { category: 'Tarih', word: 'HİYEROGLİF', hint: 'Papirüs' },
  { category: 'Tarih', word: 'İPEKYOLU', hint: 'Kervan' },
  { category: 'Coğrafya', word: 'İSTANBUL', hint: 'Boğaz' },
  { category: 'Coğrafya', word: 'KAPADOKYA', hint: 'Peribacası' },
  { category: 'Coğrafya', word: 'KARADENİZ', hint: 'Fırtına' },
  { category: 'Coğrafya', word: 'PAMUKKALE', hint: 'Traverten' },
  { category: 'Bilim & Uzay', word: 'TELESKOP', hint: 'Gözlem' },
  { category: 'Bilim & Uzay', word: 'GALAKSİ', hint: 'Samanyolu' },
  { category: 'Bilim & Uzay', word: 'GRAVİTASYON', hint: 'Newton' },
  { category: 'Mutfak', word: 'DEMLİK', hint: 'Çay' },
  { category: 'Mutfak', word: 'TENCERE', hint: 'Kapak' },
  { category: 'Mutfak', word: 'BAHARAT', hint: 'Lezzet' },
  { category: 'Hayvanlar Âlemi', word: 'KAPLUMBAĞA', hint: 'Kabuk' },
  { category: 'Hayvanlar Âlemi', word: 'GÜVERCİN', hint: 'Barış' },
  { category: 'Hayvanlar Âlemi', word: 'YUNUS', hint: 'Memeli' },
  { category: 'Hayvanlar Âlemi', word: 'BUKALEMUN', hint: 'Kamuflaj' },
  { category: 'Teknoloji', word: 'ROBOTİK', hint: 'Otomasyon' },
  { category: 'Teknoloji', word: 'YAZILIM', hint: 'Kod' },
  { category: 'Sanat & Edebiyat', word: 'HEYKELTRAŞ', hint: 'Mermer' },
  { category: 'Sanat & Edebiyat', word: 'ROMAN', hint: 'Kurgu' },
  { category: 'Mitoloji', word: 'MİNOTOR', hint: 'Labirent' },
  { category: 'Mitoloji', word: 'PEGASUS', hint: 'Kanat' },
  { category: 'Spor', word: 'MARATON', hint: 'Koşu' },
];

const LOCAL_PUZZLES_EN: HangmanPuzzle[] = [
  { category: 'History', word: 'PYRAMID', hint: 'Pharaoh' },
  { category: 'History', word: 'CIVILIZATION', hint: 'Culture' },
  { category: 'History', word: 'ARCHAEOLOGY', hint: 'Excavation' },
  { category: 'History', word: 'EMPEROR', hint: 'Throne' },
  { category: 'History', word: 'HIEROGLYPH', hint: 'Papyrus' },
  { category: 'Geography', word: 'ISTANBUL', hint: 'Bosphorus' },
  { category: 'Geography', word: 'AMAZON', hint: 'Rainforest' },
  { category: 'Geography', word: 'EVEREST', hint: 'Summit' },
  { category: 'Geography', word: 'SAHARA', hint: 'Desert' },
  { category: 'Science & Space', word: 'TELESCOPE', hint: 'Observation' },
  { category: 'Science & Space', word: 'GALAXY', hint: 'Milky Way' },
  { category: 'Science & Space', word: 'GRAVITY', hint: 'Newton' },
  { category: 'Kitchen', word: 'TEAPOT', hint: 'Brew' },
  { category: 'Kitchen', word: 'BLENDER', hint: 'Smoothie' },
  { category: 'Kitchen', word: 'SPICES', hint: 'Flavor' },
  { category: 'Animals', word: 'DOLPHIN', hint: 'Mammal' },
  { category: 'Animals', word: 'CHAMELEON', hint: 'Camouflage' },
  { category: 'Animals', word: 'EAGLE', hint: 'Predator' },
  { category: 'Animals', word: 'TORTOISE', hint: 'Shell' },
  { category: 'Technology', word: 'SOFTWARE', hint: 'Code' },
  { category: 'Technology', word: 'ALGORITHM', hint: 'Logic' },
  { category: 'Technology', word: 'INTERNET', hint: 'Network' },
  { category: 'Arts & Literature', word: 'SCULPTOR', hint: 'Marble' },
  { category: 'Arts & Literature', word: 'ORCHESTRA', hint: 'Symphony' },
  { category: 'Mythology', word: 'PEGASUS', hint: 'Wings' },
  { category: 'Sports', word: 'MARATON', hint: 'Endurance' },
];

// Combine local and bank puzzles uniquely by word
const ALL_PUZZLES_TR = [...LOCAL_PUZZLES_TR, ...HANGMAN_PUZZLES_TR].filter(
  (v, i, a) => a.findIndex((t) => t.word === v.word) === i
);
const ALL_PUZZLES_EN = [...LOCAL_PUZZLES_EN, ...HANGMAN_PUZZLES_EN].filter(
  (v, i, a) => a.findIndex((t) => t.word === v.word) === i
);

export const AdamAsmaca: React.FC<AdamAsmacaProps> = ({ onGameEnd, soundEnabled, language = 'tr' }) => {
  const isEn = language === 'en';
  const puzzlePool = isEn ? ALL_PUZZLES_EN : ALL_PUZZLES_TR;

  const [puzzle, setPuzzle] = useState<HangmanPuzzle>(puzzlePool[0]);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);
  const [isHintRevealed, setIsHintRevealed] = useState(false);
  const [poolStats, setPoolStats] = useState({ seenCount: 0, totalCount: 0 });
  const maxErrors = 6;

  const startNewGame = () => {
    const poolKey = `hangman_${language}`;
    const result = pickUnseenWord(poolKey, puzzlePool, (p) => p.word);

    setPuzzle(result.item);
    setGuessedLetters([]);
    setErrors(0);
    setIsHintRevealed(false);

    const progress = getPoolProgress(poolKey, puzzlePool.length);
    setPoolStats({ seenCount: progress.seenCount, totalCount: progress.totalCount });
  };

  useEffect(() => {
    startNewGame();
  }, [language]);

  const wordLetters = puzzle.word.split('');
  const isWon = wordLetters.every((l) => guessedLetters.includes(l));
  const isLost = errors >= maxErrors;

  const handleGuess = (letter: string) => {
    if (isWon || isLost || guessedLetters.includes(letter)) return;

    const nextGuessed = [...guessedLetters, letter];
    setGuessedLetters(nextGuessed);

    if (!wordLetters.includes(letter)) {
      if (soundEnabled) playSound('error');
      const nextErr = errors + 1;
      setErrors(nextErr);
      if (nextErr >= maxErrors) {
        onGameEnd(false);
      }
    } else {
      if (soundEnabled) playSound('tile');
      const wonCheck = wordLetters.every((l) => nextGuessed.includes(l));
      if (wonCheck) {
        if (soundEnabled) playSound('win');
        confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
        onGameEnd(true);
      }
    }
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWon || isLost) return;
      const key = isEn ? e.key.toUpperCase() : e.key.toLocaleUpperCase('tr-TR');
      const valid = isEn ? /^[A-Z]$/.test(key) : /^[A-ZÇĞİÖŞÜ]$/.test(key);
      if (valid) {
        handleGuess(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guessedLetters, errors, isWon, isLost, language, puzzle]);

  const keyboardRows = isEn
    ? [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
      ]
    : [
        ['E', 'R', 'T', 'Y', 'U', 'I', 'İ', 'O', 'P', 'Ğ', 'Ü'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş'],
        ['Z', 'C', 'Ç', 'V', 'B', 'N', 'M', 'Ö'],
      ];

  return (
    <div className="w-full flex flex-col items-center justify-center select-none space-y-4 pt-1">
      {/* UNIFORM CONTROL BAR */}
      <div className="w-full max-w-xl flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        {/* LEFT: Category and Interactive Hint Button / Chip */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs text-xs font-semibold">
            {isEn ? 'CATEGORY' : 'KATEGORİ'}{' '}
            <span className="text-[var(--accent-color)] font-extrabold ml-1">{puzzle.category}</span>
          </div>

          {/* Interactive Hint */}
          {!isHintRevealed ? (
            <button
              onClick={() => {
                setIsHintRevealed(true);
                if (soundEnabled) playSound('click');
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer group ${
                errors >= 3
                  ? 'border-amber-500 bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse'
                  : 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
              title={isEn ? 'Reveal single-word hint' : 'Tek kelimelik çağrışım ipucunu aç'}
            >
              <Lightbulb size={13} className="text-amber-500 group-hover:rotate-12 transition-transform" />
              <span>{isEn ? 'Reveal Hint' : 'İpucunu Aç'}</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center gap-1.5 animate-fadeIn shadow-2xs">
              <Lightbulb size={13} className="text-amber-500 fill-amber-500 shrink-0" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">
                {isEn ? 'HINT:' : 'İPUCU:'}
              </span>
              <span className="font-black tracking-wide uppercase text-amber-700 dark:text-amber-300">
                {puzzle.hint}
              </span>
            </div>
          )}
        </div>

        {/* CENTER: Health Lives & Pool Progress */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs flex items-center gap-1.5">
            <span>{isEn ? 'LIVES' : 'CAN'}</span>
            <div className="flex items-center gap-0.5 ml-0.5">
              {Array.from({ length: maxErrors }).map((_, i) => (
                <Heart
                  key={i}
                  size={14}
                  className={`transition-colors ${
                    i < maxErrors - errors
                      ? 'text-rose-500 fill-rose-500'
                      : 'text-gray-300 dark:text-gray-700 fill-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-[11px] text-gray-500">
            {isEn ? 'POOL' : 'HAVUZ'}{' '}
            <span className="font-bold text-[var(--accent-color)]">{poolStats.seenCount}/{poolStats.totalCount}</span>
          </div>
        </div>

        {/* RIGHT: Restart Button (Always in the same top-right spot) */}
        <button
          onClick={startNewGame}
          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs"
        >
          <RotateCcw size={13} />
          <span>{isEn ? 'New Game' : 'Yeni Oyun'}</span>
        </button>
      </div>

      {/* Hangman Visual (Gallows Canvas SVG) */}
      <div className="w-full flex justify-center py-1">
        <svg width="140" height="110" viewBox="0 0 180 150" className="stroke-current text-gray-700 dark:text-gray-300">
          {/* Base */}
          <line x1="20" y1="140" x2="160" y2="140" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="140" x2="50" y2="20" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="20" x2="120" y2="20" strokeWidth="4" strokeLinecap="round" />
          <line x1="120" y1="20" x2="120" y2="40" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="50" x2="80" y2="20" strokeWidth="3" strokeLinecap="round" />

          {/* Man parts based on errors */}
          {errors >= 1 && <circle cx="120" cy="52" r="12" strokeWidth="3" fill="none" />}
          {errors >= 2 && <line x1="120" y1="64" x2="120" y2="100" strokeWidth="3" strokeLinecap="round" />}
          {errors >= 3 && <line x1="120" y1="74" x2="102" y2="88" strokeWidth="3" strokeLinecap="round" />}
          {errors >= 4 && <line x1="120" y1="74" x2="138" y2="88" strokeWidth="3" strokeLinecap="round" />}
          {errors >= 5 && <line x1="120" y1="100" x2="104" y2="126" strokeWidth="3" strokeLinecap="round" />}
          {errors >= 6 && <line x1="120" y1="100" x2="136" y2="126" strokeWidth="3" strokeLinecap="round" />}
        </svg>
      </div>

      {/* Secret Word Letters Tiles */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-lg my-0.5">
        {wordLetters.map((l, i) => {
          const revealed = guessedLetters.includes(l) || isLost;
          const isSpace = l === ' ';
          if (isSpace) {
            return <div key={i} className="w-4 sm:w-5" />;
          }
          return (
            <div
              key={i}
              className={`w-8 h-10 sm:w-9 sm:h-11 border-b-4 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl transition-all shadow-xs ${
                revealed
                  ? isLost && !guessedLetters.includes(l)
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    : 'border-[var(--accent-color)] bg-[var(--bg-card)] text-[var(--accent-color)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-transparent'
              }`}
            >
              {revealed ? l : ''}
            </div>
          );
        })}
      </div>

      {/* Win / Loss Result Alert */}
      {(isWon || isLost) && (
        <div className="text-center py-2 px-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg animate-fadeIn">
          <div
            className={`text-sm font-bold mb-1.5 ${
              isWon ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isWon
              ? (isEn ? 'Awesome! You solved the secret word! 🎉' : 'Harika! Gizli kelimeyi başarıyla buldunuz! 🎉')
              : (isEn ? `Game Over! The word was: ${puzzle.word}` : `Canlarınız bitti! Doğru kelime: ${puzzle.word}`)}
          </div>
          <button
            onClick={startNewGame}
            className="px-5 py-2 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-xl font-extrabold text-xs transition shadow-sm"
          >
            {isEn ? 'Next Word ➔' : 'Sıradaki Kelimeye Geç ➔'}
          </button>
        </div>
      )}

      {/* Virtual Keyboard */}
      <div className="w-full max-w-xl space-y-1.5 pt-1">
        {keyboardRows.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((char) => {
              const isUsed = guessedLetters.includes(char);
              const isCorrect = isUsed && wordLetters.includes(char);
              const isWrong = isUsed && !wordLetters.includes(char);

              let style = 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800';
              if (isCorrect) style = 'bg-emerald-600 text-white border-emerald-600';
              else if (isWrong) style = 'bg-gray-300 dark:bg-gray-700 text-gray-400 opacity-40 cursor-not-allowed';

              return (
                <button
                  key={char}
                  onClick={() => handleGuess(char)}
                  disabled={isUsed || isWon || isLost}
                  className={`min-w-[28px] sm:min-w-[36px] px-1.5 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm border transition active:scale-95 shadow-2xs ${style}`}
                >
                  {char}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};