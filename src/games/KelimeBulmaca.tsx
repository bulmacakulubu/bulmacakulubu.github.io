import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { AlertCircle, RotateCcw, BookOpen, Share2, Lightbulb, Users, MessageSquare } from 'lucide-react';
import { WORDLE_WORDS_TR, WORDLE_WORDS_EN } from '../data/wordBank';
import { pickUnseenWord, getPoolProgress } from '../utils/wordMemory';
import { fetchWordList, getWordMeaning } from '../utils/dictionaryService';
import { shareScore, generateWordleEmojiGrid, openWhatsAppShare } from '../utils/shareService';
import { triggerAdBreak } from '../utils/adSenseService';
import { MultiplayerSession } from '../types';
import { MultiplayerMessage } from '../utils/multiplayer';

interface KelimeBulmacaProps {
  onGameEnd: (won: boolean, timeOrScore?: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
  isPremium?: boolean;
  multiplayerSession?: MultiplayerSession | null;
  onSendMultiplayerAction?: (msg: MultiplayerMessage) => void;
  incomingMultiplayerMessage?: MultiplayerMessage | null;
}

export const KelimeBulmaca: React.FC<KelimeBulmacaProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
  isPremium = false,
  multiplayerSession,
  onSendMultiplayerAction,
  incomingMultiplayerMessage,
}) => {
  const isTr = language === 'tr';
  const isMultiplayer = !!multiplayerSession && multiplayerSession.connected;

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
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);

  // Opponent state for 1v1 multiplayer
  const [opponentProgress, setOpponentProgress] = useState<{
    attempt: number;
    won: boolean;
    emojis?: string;
  } | null>(null);

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
    setRevealedIndices([]);
    setOpponentProgress(null);

    // In multiplayer, host dictates the word to the guest
    if (isMultiplayer && multiplayerSession.isHost) {
      onSendMultiplayerAction?.({
        type: 'HANDSHAKE',
        payload: { solution: result.item, length },
      });
    }

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

  // Handle incoming multiplayer messages
  useEffect(() => {
    if (!incomingMultiplayerMessage) return;

    if (incomingMultiplayerMessage.type === 'HANDSHAKE' && incomingMultiplayerMessage.payload?.solution) {
      const incomingSol = incomingMultiplayerMessage.payload.solution;
      const incomingLen = incomingMultiplayerMessage.payload.length || incomingSol.length;
      setWordLength(incomingLen);
      setSolution(incomingSol);
      setGuesses([]);
      setCurrentGuess('');
      setGameStatus('playing');
      setRevealedIndices([]);
      setOpponentProgress(null);
      showToast(isTr ? 'Rakiple aynı kelime yüklendi! Başarılar ⚔️' : 'Synced same word with opponent! Good luck ⚔️');
    } else if (incomingMultiplayerMessage.type === 'WORD' && incomingMultiplayerMessage.payload) {
      const { attempt, won, emojis } = incomingMultiplayerMessage.payload;
      setOpponentProgress({ attempt, won, emojis });
      if (won) {
        showToast(
          isTr
            ? `🏁 ${multiplayerSession?.opponentName || 'Rakip'} kelimeyi ${attempt}. denemede bildi!`
            : `🏁 ${multiplayerSession?.opponentName || 'Opponent'} solved it in attempt ${attempt}!`
        );
      }
    }
  }, [incomingMultiplayerMessage]);

  // Load definition when game concludes
  useEffect(() => {
    if (gameStatus !== 'playing') {
      getWordMeaning(solution, language).then((m) => {
        if (m) setMeaning(m);
      });
    }
  }, [gameStatus, solution, language]);

  // Rewarded Hint
  const handleRequestHint = () => {
    if (gameStatus !== 'playing') return;

    const unrevealedIndices: number[] = [];
    for (let i = 0; i < solution.length; i++) {
      const alreadyGuessedGreen = guesses.some((g) => g[i] === solution[i]);
      if (!revealedIndices.includes(i) && !alreadyGuessedGreen) {
        unrevealedIndices.push(i);
      }
    }

    if (unrevealedIndices.length === 0) {
      showToast(isTr ? 'Bütün harfler zaten açıldı veya biliniyor!' : 'All letters are already revealed or known!');
      return;
    }

    const grantHint = () => {
      const randomIdx = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
      setRevealedIndices((prev) => [...prev, randomIdx]);
      if (soundEnabled) playSound('click');
      showToast(
        isTr
          ? `💡 İpucu: ${randomIdx + 1}. harf "${solution[randomIdx]}"`
          : `💡 Hint: Letter #${randomIdx + 1} is "${solution[randomIdx]}"`
      );
    };

    if (isPremium) {
      grantHint();
    } else {
      showToast(isTr ? 'Ödüllü reklam hazırlanıyor...' : 'Loading rewarded ad...');
      triggerAdBreak({
        type: 'reward',
        name: 'wordle_hint',
        adBreakDone: () => {
          grantHint();
        },
      });
    }
  };

  // Social Share
  const handleShare = async () => {
    const grid = generateWordleEmojiGrid(guesses, solution);
    const scoreStr = gameStatus === 'won' ? `${guesses.length}/6` : 'X/6';
    const res = await shareScore({
      title: 'Bulmaca Kulübü - Kelime Bulmaca',
      gameName: isTr ? 'Kelime Bulmaca' : 'Word Puzzle',
      scoreOrAttempts: scoreStr,
      emojiGrid: grid,
    });

    if (res === 'copied') {
      showToast(isTr ? 'Sonuç panoya kopyalandı! 📋' : 'Result copied to clipboard! 📋');
    }
  };

  const handleShareWhatsApp = () => {
    const grid = generateWordleEmojiGrid(guesses, solution);
    const scoreStr = gameStatus === 'won' ? `${guesses.length}/6` : 'X/6';
    const text = `🧩 Bulmaca Kulübü: ${isTr ? 'Kelime Bulmaca' : 'Word Puzzle'}\n🏆 Sonuç: ${scoreStr}\n\n${grid}`;
    openWhatsAppShare(text);
  };

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

      const didWin = currentGuess === solution;

      // Send guess to multiplayer opponent
      if (isMultiplayer) {
        onSendMultiplayerAction?.({
          type: 'WORD',
          payload: {
            guess: currentGuess,
            attempt: newGuesses.length,
            won: didWin,
            emojis: generateWordleEmojiGrid(newGuesses, solution),
          },
        });
      }

      if (didWin) {
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
    <div className="w-full flex flex-col items-center justify-start select-none space-y-1 sm:space-y-1.5 pt-0 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute -top-3 z-30 px-3.5 py-1.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 animate-bounce">
          <AlertCircle size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1v1 Multiplayer Opponent Live Bar */}
      {isMultiplayer && (
        <div className="w-full max-w-xl p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Users size={15} />
            <span>1v1 Düello: {multiplayerSession?.opponentName || 'Rakip'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-600/20">
              {opponentProgress ? `${opponentProgress.attempt}/6 Deneme` : 'Başlamadı'}
            </span>
            {opponentProgress?.won && (
              <span className="text-emerald-500 font-black animate-pulse">KAZANDI! 🏆</span>
            )}
          </div>
        </div>
      )}

      {/* UNIFORM CONTROL BAR */}
      <div className="w-full max-w-xl flex items-center justify-between pb-1 border-b border-[var(--border-color)]">
        {/* LEFT: Length selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl text-xs font-semibold border border-[var(--border-color)]">
          {[5, 7, 9].map((len) => (
            <button
              key={len}
              onClick={() => {
                if (isMultiplayer) return;
                setWordLength(len as any);
                startNewRound(len as any);
              }}
              disabled={isMultiplayer}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition font-extrabold text-[11px] cursor-pointer ${
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
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-[11px]">
            {isTr ? 'DENEME' : 'ATTEMPT'} <span className="font-extrabold text-[var(--accent-color)]">{guesses.length}/6</span>
          </div>
          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-[10px] text-gray-500">
            {isTr ? 'HAVUZ' : 'POOL'} <span className="font-bold text-[var(--accent-color)]">{poolStats.seenCount}/{poolStats.totalCount}</span>
          </div>
        </div>

        {/* RIGHT: Hint (Rewarded Ad) & Restart Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRequestHint}
            disabled={gameStatus !== 'playing'}
            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-40"
            title={isPremium ? 'VIP İpucu' : 'Ödüllü Reklam ile İpucu'}
          >
            <Lightbulb size={13} />
            <span>{isTr ? 'İpucu' : 'Hint'}</span>
          </button>

          <button
            onClick={() => startNewRound()}
            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>{isTr ? 'Yeni Oyun' : 'New'}</span>
          </button>
        </div>
      </div>

      {/* Grid (Compact & Perfectly Scaled to Fit Viewport without Scroll) */}
      <div className="flex flex-col items-center justify-center gap-1 py-0.5">
        {Array.from({ length: 6 }).map((_, rowIndex) => {
          const guess = guesses[rowIndex] || (rowIndex === guesses.length ? currentGuess : '');
          const isCompleted = rowIndex < guesses.length;
          const isCurrent = rowIndex === guesses.length;

          const cellSize =
            wordLength === 9
              ? 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-xs sm:text-sm'
              : wordLength === 7
              ? 'w-7 h-7 sm:w-8 sm:h-8 md:w-8.5 md:h-8.5 text-xs sm:text-sm'
              : 'w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9 text-sm sm:text-base';

          return (
            <div
              key={rowIndex}
              className={`grid gap-1 transition-transform ${isCurrent && shakeRow ? 'animate-shake' : ''}`}
              style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: wordLength }).map((_, colIndex) => {
                const letter = guess[colIndex] || '';
                const isHintLetter = isCurrent && !letter && revealedIndices.includes(colIndex);
                let style = 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)]';

                if (isCompleted) {
                  style = getLetterStatus(letter, colIndex);
                } else if (letter) {
                  style = 'bg-[var(--bg-card)] border-[var(--accent-color)] text-[var(--text-primary)] scale-105 shadow-sm';
                } else if (isHintLetter) {
                  style = 'bg-amber-500/10 border-amber-400 text-amber-500 font-normal border-dashed';
                }

                return (
                  <div
                    key={colIndex}
                    className={`${cellSize} border-2 rounded-xl flex items-center justify-center font-black transition-all duration-150 ${style}`}
                  >
                    {letter || (isHintLetter ? solution[colIndex] : '')}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Game End Banner with Dictionary Definition & Viral Share */}
      {gameStatus !== 'playing' && (
        <div className="text-center py-1.5 px-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg animate-fadeIn max-w-md w-full my-0.5">
          <div className={`text-xs font-bold mb-1 ${gameStatus === 'won' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {gameStatus === 'won'
              ? (isTr ? 'Muhteşem! Kelimeyi Başarıyla Buldunuz! 🎉' : 'Awesome! You guessed the word correctly! 🎉')
              : (isTr ? `Oyun Bitti! Doğru Kelime: ${solution}` : `Game Over! The word was: ${solution}`)}
          </div>

          {/* Dictionary meaning */}
          {meaning && (
            <div className="my-1 p-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-left text-[11px] text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
              <BookOpen size={13} className="text-[var(--accent-color)] shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-[var(--accent-color)] mr-1">{solution}:</span>
                <span className="italic">{meaning}</span>
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <button
              onClick={handleShare}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] transition shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Share2 size={12} />
              <span>{isTr ? 'Paylaş' : 'Share'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-[11px] transition shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <MessageSquare size={12} />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => startNewRound()}
              className="px-3.5 py-1 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-xl font-bold text-[11px] transition shadow-sm cursor-pointer"
            >
              {isTr ? 'Sıradaki ➔' : 'Next ➔'}
            </button>
          </div>
        </div>
      )}

      {/* Virtual Keyboard (Ultra-Fitted, Never Cut Off) */}
      <div className="w-full max-w-lg space-y-1 pt-0.5">
        {keyboardRows.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((key) => {
              const customStatus = getKeyStatus(key);
              const isSpecial = key === 'GİR' || key === 'ENTER' || key === '⌫';
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key === '⌫' ? 'BACKSPACE' : key)}
                  className={`h-7 sm:h-8 md:h-8.5 rounded-lg font-bold text-xs border transition active:scale-95 shadow-2xs cursor-pointer ${
                    customStatus
                      ? customStatus
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${isSpecial ? 'px-2 sm:px-3 font-extrabold text-[10px] sm:text-[11px]' : 'min-w-[22px] sm:min-w-[28px] md:min-w-[32px] px-1'}`}
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
