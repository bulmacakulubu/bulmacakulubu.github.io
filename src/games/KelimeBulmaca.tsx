import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import {
  AlertCircle,
  RotateCcw,
  BookOpen,
  Share2,
  Lightbulb,
  Users,
  MessageSquare,
  Trophy,
} from 'lucide-react';
import { WORDLE_WORDS_TR, WORDLE_WORDS_EN } from '../data/wordBank';
import { pickUnseenWord, getPoolProgress } from '../utils/wordMemory';
import { fetchWordList, getWordMeaning } from '../utils/dictionaryService';
import { shareScore, generateWordleEmojiGrid, openWhatsAppShare } from '../utils/shareService';
import { triggerAdBreak } from '../utils/adSenseService';
import { showToast } from '../utils/toastService';
import { MultiplayerSession, GameStats } from '../types';
import { MultiplayerMessage } from '../utils/multiplayer';

interface KelimeBulmacaProps {
  onGameEnd: (won: boolean, timeOrScore?: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
  isPremium?: boolean;
  stats?: GameStats;
  onOpenMultiplayer?: () => void;
  multiplayerSession?: MultiplayerSession | null;
  onSendMultiplayerAction?: (msg: MultiplayerMessage) => void;
  incomingMultiplayerMessage?: MultiplayerMessage | null;
  isZenMode?: boolean;
  hideStats?: boolean;
}

export const KelimeBulmaca: React.FC<KelimeBulmacaProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
  isPremium = false,
  stats,
  onOpenMultiplayer,
  multiplayerSession,
  onSendMultiplayerAction,
  incomingMultiplayerMessage,
  isZenMode = false,
  hideStats = false,
}) => {
  const isTr = language === 'tr';
  const isMultiplayer = !!multiplayerSession && multiplayerSession.connected;

  const [wordLength, setWordLength] = useState<5 | 7 | 9>(5);
  const [solution, setSolution] = useState(isTr ? 'KİTAP' : 'APPLE');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [startTime, setStartTime] = useState(Date.now());
  const [shakeRow, setShakeRow] = useState(false);
  const [poolStats, setPoolStats] = useState({ seenCount: 0, totalCount: 0 });
  const [meaning, setMeaning] = useState<string | null>(null);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [selectedSolvedWord, setSelectedSolvedWord] = useState<{ word: string; meaning?: string } | null>(null);

  // Guess distribution state
  const [guessDistribution, setGuessDistribution] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('bk_wordle_guess_distribution_v1');
      return saved ? JSON.parse(saved) : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    } catch {
      return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    }
  });

  // Recent solved words list
  const [recentSolved, setRecentSolved] = useState<{ word: string; length: number; meaning?: string }[]>(() => {
    try {
      const saved = localStorage.getItem('bk_wordle_recent_solved_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Opponent state for 1v1 multiplayer
  const [opponentProgress, setOpponentProgress] = useState<{
    attempt: number;
    won: boolean;
    emojis?: string;
  } | null>(null);

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
    await shareScore({
      title: 'Bulmaca Kulübü - Kelime Bulmaca',
      gameName: isTr ? 'Kelime Bulmaca' : 'Word Puzzle',
      scoreOrAttempts: scoreStr,
      emojiGrid: grid,
    });
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

        // Record guess distribution
        const attempt = newGuesses.length;
        setGuessDistribution((prev) => {
          const next = { ...prev, [attempt]: (prev[attempt] || 0) + 1 };
          try {
            localStorage.setItem('bk_wordle_guess_distribution_v1', JSON.stringify(next));
          } catch {}
          return next;
        });

        // Add to recent solved words
        getWordMeaning(solution, language).then((m) => {
          setRecentSolved((prev) => {
            const next = [
              { word: solution, length: wordLength, meaning: m || undefined },
              ...prev.filter((item) => item.word !== solution),
            ].slice(0, 10);
            try {
              localStorage.setItem('bk_wordle_recent_solved_v1', JSON.stringify(next));
            } catch {}
            return next;
          });
        });
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
    if (solution[i] === letter) return 'bg-emerald-700 text-white border-2 border-emerald-400 shadow-md shadow-emerald-950/40';
    if (solution.includes(letter)) return 'bg-amber-600 text-white border-2 border-amber-300 shadow-md shadow-amber-950/40';
    return 'bg-zinc-800/90 text-zinc-400 border-2 border-zinc-700/50';
  };

  const getKeyStatus = (char: string): string => {
    let status = '';
    for (const g of guesses) {
      for (let i = 0; i < g.length; i++) {
        if (g[i] === char) {
          if (solution[i] === char) {
            return 'bg-emerald-700 text-white border-emerald-400 shadow-xs';
          }
          if (solution.includes(char)) {
            status = 'bg-amber-600 text-white border-amber-400 shadow-xs';
          } else if (!status) {
            status = 'bg-zinc-800/70 text-zinc-500 border-zinc-700/50 opacity-60';
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
    <div className="w-full h-full max-h-[calc(100vh-125px)] flex flex-col items-center justify-between px-2 sm:px-4 py-1 select-none relative max-w-2xl sm:max-w-3xl xl:max-w-4xl mx-auto overflow-hidden">
      {/* 1v1 Multiplayer Opponent Live Bar */}
      {isMultiplayer && (
        <div className="w-full max-w-xl sm:max-w-2xl p-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[var(--text-primary)] animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <Users size={15} />
            <span>1v1 Düello: {multiplayerSession?.opponentName || 'Rakip'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[var(--accent-light)] border border-[var(--border-color)]">
              {opponentProgress ? `${opponentProgress.attempt}/6 Deneme` : 'Başlamadı'}
            </span>
            {opponentProgress?.won && (
              <span className="flex items-center gap-1 text-emerald-400 font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Trophy size={12} />
                <span>{isTr ? 'Kazandı' : 'Won'}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* UNIFORM CONTROL BAR */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl flex items-center justify-between pb-1 border-b border-[var(--border-color)] shrink-0">
        {/* Length selector */}
        <div className="flex bg-[var(--bg-card)] p-0.5 rounded-xl text-xs font-semibold border border-[var(--border-color)]">
          {[5, 7, 9].map((len) => (
            <button
              key={len}
              onClick={() => {
                if (isMultiplayer) return;
                setWordLength(len as any);
                startNewRound(len as any);
              }}
              disabled={isMultiplayer}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition font-extrabold text-[11px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:outline-none ${
                wordLength === len
                  ? 'bg-[var(--accent-color)] !text-[var(--accent-contrast)] shadow-xs font-black'
                  : 'text-[var(--text-primary)] opacity-60 hover:opacity-100'
              }`}
            >
              {isTr ? `${len} Harf` : `${len} Letters`}
            </button>
          ))}
        </div>

        {/* Metric + Memory Progress */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-[11px]">
            {isTr ? 'Deneme' : 'Attempt'} <span className="font-mono tabular-nums font-bold text-[var(--accent-color)]">{guesses.length}/6</span>
          </div>
          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-[10px] text-[var(--text-secondary)]">
            {isTr ? 'Havuz' : 'Pool'} <span className="font-mono tabular-nums font-bold text-[var(--accent-color)]">{poolStats.seenCount}/{poolStats.totalCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRequestHint}
            disabled={gameStatus !== 'playing'}
            className="px-2.5 py-1 bg-[var(--bg-card)] hover:bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:outline-none"
            title={isPremium ? 'VIP İpucu' : 'Ödüllü Reklam ile İpucu'}
          >
            <Lightbulb size={13} />
            <span>{isTr ? 'İpucu' : 'Hint'}</span>
          </button>

          <button
            onClick={() => startNewRound()}
            className="px-2.5 py-1 bg-[var(--bg-card)] hover:bg-[var(--accent-light)] rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-[var(--border-color)] text-[var(--text-primary)] shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:outline-none"
          >
            <RotateCcw size={12} />
            <span>{isTr ? 'Yeni Oyun' : 'New'}</span>
          </button>
        </div>
      </div>

      {/* NORDIC MONOCHROME OYUN ALANI */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 shadow-xl backdrop-blur-md flex flex-col items-center justify-center shrink-0">
        <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 w-full">
          {Array.from({ length: 6 }).map((_, rowIndex) => {
            const guess = guesses[rowIndex] || (rowIndex === guesses.length ? currentGuess : '');
            const isCompleted = rowIndex < guesses.length;
            const isCurrent = rowIndex === guesses.length;

            const cellSize =
              wordLength === 9
                ? 'w-9 sm:w-11 md:w-12 h-7 sm:h-8 md:h-8.5 max-h-[calc((100vh-270px)/6)] text-xs sm:text-sm font-black'
                : wordLength === 7
                ? 'w-11 sm:w-13 md:w-15 h-7.5 sm:h-8.5 md:h-9 max-h-[calc((100vh-260px)/6)] text-sm sm:text-base font-black'
                : 'w-13 sm:w-16 md:w-18 h-8 sm:h-9 md:h-9.5 max-h-[calc((100vh-250px)/6)] text-base sm:text-xl font-black';

            return (
              <div
                key={rowIndex}
                className={`grid gap-1 sm:gap-2 justify-center transition-transform ${isCurrent && shakeRow ? 'animate-shake' : ''}`}
                style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: wordLength }).map((_, colIndex) => {
                  const letter = guess[colIndex] || '';
                  const isHintLetter = isCurrent && !letter && revealedIndices.includes(colIndex);
                  let style = 'bg-zinc-900/90 border border-zinc-700/60 text-white shadow-inner';

                  if (isCompleted) {
                    style = getLetterStatus(letter, colIndex);
                  } else if (letter) {
                    style = 'bg-zinc-800/95 border border-amber-400 text-amber-200 scale-105 shadow-md shadow-amber-500/20';
                  } else if (isHintLetter) {
                    style = 'bg-amber-500/10 border border-amber-400 text-amber-400 font-normal border-dashed';
                  }

                  return (
                    <div
                      key={colIndex}
                      className={`${cellSize} rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-150 select-none ${style}`}
                    >
                      {letter || (isHintLetter ? solution[colIndex] : '')}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Game End Banner with Dictionary Definition & Viral Share */}
      {gameStatus !== 'playing' && (
        <div className="text-center py-1.5 px-3 rounded-2xl border border-amber-500/40 bg-[var(--bg-card)] shadow-2xl animate-fadeIn max-w-md w-full my-0.5 shrink-0">
          <div className={`text-xs font-bold mb-0.5 ${gameStatus === 'won' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {gameStatus === 'won'
              ? (isTr ? 'Muhteşem! Kelimeyi Başarıyla Buldunuz! 🎉' : 'Awesome! You guessed the word correctly! 🎉')
              : (isTr ? `Oyun Bitti! Doğru Kelime: ${solution}` : `Game Over! The word was: ${solution}`)}
          </div>

          {/* Dictionary meaning */}
          {meaning && (
            <div className="my-1 p-1.5 rounded-xl bg-zinc-900/80 border border-zinc-700/60 text-left text-[11px] text-gray-200 flex items-start gap-1.5">
              <BookOpen size={13} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-amber-400 mr-1">{solution}:</span>
                <span className="italic">{meaning}</span>
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center justify-center gap-2 mt-1">
            <button
              onClick={handleShare}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded-lg font-bold text-[11px] transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 size={13} className="text-amber-400" />
              <span>{isTr ? 'Skoru Paylaş' : 'Share Score'}</span>
            </button>

            <button
              onClick={() => startNewRound()}
              className="px-3 py-1 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-lg font-bold text-[11px] transition shadow-sm cursor-pointer"
            >
              {isTr ? 'Sıradaki ➔' : 'Next ➔'}
            </button>
          </div>
        </div>
      )}

      {/* LÜKS KLAVYE TEPSİSİ (Tactile Keyboard - Zero Hang, Perfect Fit) */}
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl p-1 sm:p-1.5 rounded-2xl border border-amber-500/30 bg-zinc-950/80 shadow-xl backdrop-blur-xs space-y-1 shrink-0">
        {keyboardRows.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-0.5 sm:gap-1 w-full">
            {row.map((key) => {
              const customStatus = getKeyStatus(key);
              const isSpecial = key === 'GİR' || key === 'ENTER' || key === '⌫';
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key === '⌫' ? 'BACKSPACE' : key)}
                  className={`h-7 sm:h-8 md:h-8.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm border transition active:scale-95 shadow-xs cursor-pointer flex items-center justify-center ${
                    customStatus
                      ? customStatus
                      : 'bg-zinc-900/90 border-zinc-700/70 text-zinc-100 hover:border-amber-400 hover:text-amber-200'
                  } ${
                    isSpecial
                      ? 'flex-[1.4] max-w-[62px] px-1 sm:px-2 bg-amber-500/20 text-amber-300 border-amber-500/40 font-extrabold text-[10px] sm:text-xs'
                      : 'flex-1 max-w-[42px]'
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
  );
};
