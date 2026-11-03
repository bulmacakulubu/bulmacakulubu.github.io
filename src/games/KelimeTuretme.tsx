import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { Shuffle, RotateCcw, AlertCircle, Check, Share2, Lightbulb, MessageSquare, Sparkles } from 'lucide-react';
import {
  SCRABBLE_POOLS_TR,
  SCRABBLE_POOLS_EN,
} from '../data/wordBank';
import { validateAndGetMeaning } from '../utils/dictionaryService';
import { triggerAdBreak } from '../utils/adSenseService';
import { shareScore, openWhatsAppShare } from '../utils/shareService';

interface KelimeTuretmeProps {
  onGameEnd: (won: boolean, score?: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
  isPremium?: boolean;
}

export const KelimeTuretme: React.FC<KelimeTuretmeProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
  isPremium = false,
}) => {
  const isTr = language === 'tr';
  const pools = isTr ? SCRABBLE_POOLS_TR : SCRABBLE_POOLS_EN;

  const [poolIndex, setPoolIndex] = useState(0);
  const [letters, setLetters] = useState(pools[0]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
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
    setSelectedIndices([]);
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
    setSelectedIndices([]);
    setCurrentWord([]);
  };

  const handleSelectTile = (item: { letter: string; points: number }, index: number) => {
    if (!isPlaying) return;
    if (selectedIndices.includes(index)) {
      // Unselect if already selected
      handleRemoveFromWord(selectedIndices.indexOf(index));
      return;
    }
    if (soundEnabled) playSound('tile');
    setSelectedIndices([...selectedIndices, index]);
    setCurrentWord([...currentWord, item.letter]);
  };

  const handleRemoveFromWord = (wordIdx: number) => {
    if (!isPlaying || wordIdx < 0 || wordIdx >= currentWord.length) return;
    if (soundEnabled) playSound('click');
    const newWord = currentWord.filter((_, i) => i !== wordIdx);
    const newIndices = selectedIndices.filter((_, i) => i !== wordIdx);
    setCurrentWord(newWord);
    setSelectedIndices(newIndices);
  };

  const handleBackspace = () => {
    if (soundEnabled) playSound('click');
    if (currentWord.length > 0) {
      setCurrentWord(currentWord.slice(0, -1));
      setSelectedIndices(selectedIndices.slice(0, -1));
    }
  };

  const handleHint = () => {
    if (!isPlaying) return;

    const doHint = () => {
      // Find letters in rack that form at least a 3-4 letter base
      const availableLetters = letters.map((l) => l.letter);
      showToast(isTr ? `💡 İpucu: "${availableLetters.slice(0, 3).join('')}" ile başlayan bir kelime deneyin!` : `💡 Hint: Try starting with "${availableLetters.slice(0, 3).join('')}"!`);
      if (soundEnabled) playSound('tile');
    };

    if (isPremium) {
      doHint();
    } else {
      triggerAdBreak({
        type: 'reward',
        name: 'word_builder_hint',
        adBreakDone: () => {
          doHint();
        },
      });
    }
  };

  const handleShare = async () => {
    await shareScore({
      title: 'Bulmaca Kulübü - Kelime Türetme',
      gameName: isTr ? 'Kelime Türetme' : 'Word Builder',
      scoreOrAttempts: `${score} Puan (${foundWords.length} Kelime)`,
    });
    showToast(isTr ? 'Sonuç panoya kopyalandı! 📋' : 'Result copied to clipboard! 📋');
  };

  const handleShareWhatsApp = () => {
    const text = `🧩 Bulmaca Kulübü: ${isTr ? 'Kelime Türetme' : 'Word Builder'}\n🏆 Skor: ${score} Puan (${foundWords.length} Kelime Bulundu!)\nSen de oyna: https://bulmacakulubu.github.io`;
    openWhatsAppShare(text);
  };

  const handleSubmit = async () => {
    if (!isPlaying || currentWord.length === 0) return;
    const wordStr = currentWord.join('');

    if (foundWords.includes(wordStr)) {
      if (soundEnabled) playSound('error');
      showToast(isTr ? 'Bu kelimeyi zaten buldunuz!' : 'You already found this word!');
      setCurrentWord([]);
      setSelectedIndices([]);
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
    const wordPoints = selectedIndices.reduce((acc, idx) => {
      const tile = letters[idx];
      return acc + (tile ? tile.points : 1);
    }, 0);

    const bonus = currentWord.length === 7 ? 25 : currentWord.length >= 5 ? 10 : 0;
    const totalPoints = wordPoints + bonus;

    if (soundEnabled) playSound('success');
    setScore((prev) => prev + totalPoints);
    setFoundWords([wordStr, ...foundWords]);
    setCurrentWord([]);
    setSelectedIndices([]);

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
      } else if (e.key === ' ') {
        e.preventDefault();
        handleShuffle();
      } else {
        const regex = isTr ? /^[A-ZÇĞİÖŞÜ]$/ : /^[A-Z]$/;
        if (regex.test(char)) {
          // Find unused tile index with this character
          const availableIdx = letters.findIndex((l, idx) => l.letter === char && !selectedIndices.includes(idx));
          if (availableIdx !== -1) {
            handleSelectTile(letters[availableIdx], availableIdx);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWord, selectedIndices, foundWords, isPlaying, letters, language]);

  const resetGame = () => {
    const nextPoolIdx = (poolIndex + 1) % pools.length;
    setPoolIndex(nextPoolIdx);
    setLetters([...pools[nextPoolIdx]].sort(() => Math.random() - 0.5));
    setCurrentWord([]);
    setSelectedIndices([]);
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
    <div className="w-full flex flex-col items-center justify-start select-none pt-1 sm:pt-2 pb-2 relative max-w-4xl xl:max-w-5xl space-y-2 sm:space-y-3">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute -top-3 z-30 px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 animate-bounce">
          <AlertCircle size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* UNIFORM CONTROL BAR */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        {/* LEFT: Game Mode & Set */}
        <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs text-xs font-semibold">
          {isTr ? 'SET' : 'SET'}{' '}
          <span className="font-extrabold text-[var(--accent-color)] ml-1">
            {poolIndex + 1}/{pools.length}
          </span>
        </div>

        {/* CENTER: Live Metrics */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className={`px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border shadow-2xs font-mono font-bold ${
            timeLeft <= 20 ? 'text-rose-500 border-rose-500 animate-pulse' : 'border-[var(--border-color)]'
          }`}>
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

        {/* RIGHT: Hint & Restart Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleHint}
            disabled={!isPlaying}
            className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-40"
            title={isPremium ? 'VIP İpucu' : 'Ödüllü Reklam ile İpucu'}
          >
            <Lightbulb size={13} />
            <span>{isTr ? 'İpucu' : 'Hint'}</span>
          </button>

          <button
            onClick={resetGame}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>{isTr ? 'Yeni Taşlar' : 'New Tiles'}</span>
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-4 items-start justify-center">
        {/* Main interactive area */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          {/* Current Word Preview Box (Scrabble Display Rack) */}
          <div className="w-full h-18 sm:h-20 border-2 border-dashed border-[var(--border-color)] rounded-2xl flex items-center justify-center gap-2 sm:gap-2.5 mb-3.5 bg-[var(--bg-card)] px-4 shadow-xs">
            {currentWord.length === 0 ? (
              <span className="text-gray-400 text-xs sm:text-sm font-medium">
                {isTr ? 'Taşlara tıklayın veya klavyeden yazın' : 'Click tiles or type on keyboard'}
              </span>
            ) : (
              currentWord.map((l, i) => (
                <button
                  key={i}
                  onClick={() => handleRemoveFromWord(i)}
                  title="Geri bırakmak için dokunun"
                  className="w-11 h-11 sm:w-13 sm:h-13 bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--accent-color)] font-black rounded-xl flex items-center justify-center shadow-xs text-xl sm:text-2xl animate-pop hover:scale-95 transition cursor-pointer"
                >
                  {l}
                </button>
              ))
            )}
          </div>

          {/* Scrabble Wooden Letter Tiles Rack */}
          <div className="p-2 sm:p-3 rounded-2xl bg-amber-900/10 dark:bg-amber-950/30 border border-amber-900/20 flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 w-full max-w-lg shadow-inner">
            {letters.map((item, idx) => {
              const isSelected = selectedIndices.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectTile(item, idx)}
                  disabled={!isPlaying || isSelected}
                  className={`w-12 h-16 sm:w-15 sm:h-18 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-gray-300 dark:border-gray-700 bg-gray-200/50 dark:bg-gray-800/50 text-gray-400 opacity-30 scale-90 shadow-none'
                      : 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 hover:border-[var(--accent-color)] shadow-md hover:scale-105 active:scale-95'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-100">{item.letter}</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-extrabold">{item.points}p</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleShuffle}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] shadow-2xs cursor-pointer"
            >
              <Shuffle size={14} />
              <span>{isTr ? 'Karıştır' : 'Shuffle'}</span>
            </button>
            <button
              onClick={handleBackspace}
              disabled={currentWord.length === 0}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-40 rounded-xl text-xs sm:text-sm font-bold transition border border-[var(--border-color)] shadow-2xs cursor-pointer"
            >
              {isTr ? 'Sil (⌫)' : 'Delete (⌫)'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={currentWord.length === 0}
              className="px-6 py-2 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 disabled:opacity-40 rounded-xl text-xs sm:text-sm font-extrabold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>{isTr ? 'Gönder (Enter)' : 'Submit'}</span>
            </button>
          </div>
        </div>

        {/* Found Words Sidebar */}
        <div className="w-full md:w-64 p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>{isTr ? 'Bulunan Kelimeler' : 'Found Words'}</span>
            <span className="text-[var(--accent-color)] font-extrabold">{foundWords.length}</span>
          </div>
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {foundWords.length === 0 ? (
              <div className="text-[11px] text-gray-400 py-3 text-center">
                {isTr ? 'Henüz kelime türetilmedi' : 'No words found yet'}
              </div>
            ) : (
              foundWords.map((w, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] text-[11px] sm:text-xs font-bold text-[var(--text-primary)] flex items-center justify-between animate-fadeIn"
                >
                  <span>{w}</span>
                  <span className="text-[10px] text-emerald-500 font-bold">✓</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Completion Banner with Viral Score Share */}
      {!isPlaying && (
        <div className="w-full max-w-md p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center animate-fadeIn shadow-xl mt-3">
          <div className="text-sm font-black text-emerald-700 dark:text-emerald-300 mb-1">
            ⏱ {isTr ? 'Süre Doldu! Tur Tamamlandı!' : 'Time is up! Round complete!'}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Toplam Skorunuz: <span className="font-extrabold text-[var(--accent-color)]">{score} Puan</span> ({foundWords.length} kelime).
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
              onClick={handleShareWhatsApp}
              className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <MessageSquare size={13} />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-1.5 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
            >
              Yeni Tur ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
