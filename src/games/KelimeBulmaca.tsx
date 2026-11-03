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
  BarChart2,
  Flame,
  Award,
  Swords,
  Sparkles,
  History,
  TrendingUp,
  Trophy,
  Crown,
  Zap,
  Shuffle,
  Shield,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { WORDLE_WORDS_TR, WORDLE_WORDS_EN } from '../data/wordBank';
import { pickUnseenWord, getPoolProgress } from '../utils/wordMemory';
import { fetchWordList, getWordMeaning } from '../utils/dictionaryService';
import { shareScore, generateWordleEmojiGrid, openWhatsAppShare } from '../utils/shareService';
import { triggerAdBreak } from '../utils/adSenseService';
import { MultiplayerSession, GameStats } from '../types';
import { MultiplayerMessage } from '../utils/multiplayer';
import { loadUserProfile } from '../utils/auth';

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

  const [showSideDashboards, setShowSideDashboards] = useState(true);
  const isDashboardVisible = showSideDashboards && !hideStats;

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

  const played = stats?.played || 0;
  const won = stats?.won || 0;
  const streak = stats?.streak || 0;
  const maxStreak = stats?.maxStreak || 0;
  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
  const maxGuessCount = Math.max(...Object.values(guessDistribution), 1);

  const userProfile = loadUserProfile();

  // Compute used letters with status for the right panel (Option 1 feature)
  const usedLetters: { char: string; status: 'correct' | 'present' | 'absent' }[] = [];
  const seenChars = new Set<string>();
  guesses.forEach((g) => {
    for (let i = 0; i < g.length; i++) {
      const c = g[i];
      if (!seenChars.has(c)) {
        seenChars.add(c);
        let s: 'correct' | 'present' | 'absent' = 'absent';
        if (solution.includes(c)) {
          s = 'present';
        }
        for (const word of guesses) {
          if (word[i] === c && solution[i] === c) {
            s = 'correct';
            break;
          }
        }
        usedLetters.push({ char: c, status: s });
      }
    }
  });
  usedLetters.sort((a, b) => a.char.localeCompare(b.char, isTr ? 'tr' : 'en'));

  const liveRankings = [
    { rank: 1, name: 'Eleanor V.', score: 14890, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80' },
    { rank: 2, name: 'Jurnin V.', score: 14640, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80' },
    { rank: 3, name: userProfile.name || (isTr ? 'Sen' : 'You'), score: 12000 + (won * 150), avatar: userProfile.avatar, isUser: true },
    { rank: 4, name: 'Julian F.', score: 11270, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80' },
    { rank: 5, name: 'Boran T.', score: 10450, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80' },
  ];

  return (
    <div className="w-full flex items-start justify-center gap-3 lg:gap-4 xl:gap-6 select-none relative max-w-7xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 animate-bounce">
          <AlertCircle size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* LEFT DASHBOARD: PROFILE, COMBO & STATS (Option 1 Panel)  */}
      {/* ======================================================== */}
      {isDashboardVisible && (
        <aside className="hidden lg:flex flex-col w-56 lg:w-64 xl:w-72 shrink-0 space-y-2.5 text-xs select-none animate-fadeIn">
        {/* Oyuncu Profil Kartı (Arthur Pendelton Style) */}
        <div className="p-3.5 rounded-2xl border-2 border-amber-500/30 bg-[var(--bg-card)] shadow-md relative overflow-hidden group">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 p-0.5 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black shadow-xs">
                👑
              </span>
            </div>
            <div className="truncate">
              <h3 className="font-extrabold text-sm text-[var(--text-primary)] truncate">
                {userProfile.name || (isTr ? 'Misafir Oyuncu' : 'Guest Player')}
              </h3>
              <p className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                <Crown size={12} />
                <span>{isTr ? 'Usta Çözücü' : 'Grandmaster'}</span>
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
              <Trophy size={13} />
              <span>{won} {isTr ? 'Galibiyet' : 'Wins'}</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400">
              {winRate}% {isTr ? 'Başarı' : 'Win Rate'}
            </span>
          </div>
        </div>

        {/* Kombo Seri Kartı (Combo Card with glow) */}
        <div className="p-3 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-500/15 shadow-md text-center relative overflow-hidden">
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-0.5 flex items-center justify-center gap-1">
            <Zap size={11} className="animate-bounce" />
            <span>{isTr ? 'KOMBO SERİSİ' : 'COMBO STREAK'}</span>
          </div>
          <div className="text-2xl font-black text-amber-300 drop-shadow-md flex items-center justify-center gap-1">
            <span>x{streak > 0 ? streak : 1}</span>
            <Flame size={20} className="text-amber-500 fill-amber-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-amber-200/80 mt-0.5">
            {streak > 2
              ? (isTr ? '🔥 Alev Alev! Çözmeye Devam!' : '🔥 On Fire! Keep it up!')
              : (isTr ? 'Seriyi Büyütmek İçin Çöz' : 'Solve to boost streak')}
          </p>
        </div>

        {/* Güçlendiriciler ve Yardımcılar */}
        <div className="p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-1.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-400" />
            <span>{isTr ? 'JOKERLER & GÜÇLER' : 'POWERUPS & HINTS'}</span>
          </div>

          <button
            onClick={handleRequestHint}
            disabled={gameStatus !== 'playing'}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold transition cursor-pointer disabled:opacity-40"
          >
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-400" />
              <span>{isTr ? 'Harf Aç (Revealer)' : 'Revealer'}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 font-black">
              {isPremium ? '∞' : '1'}
            </span>
          </button>

          <button
            onClick={() => {
              showToast(isTr ? 'İpucu: Türkçe kelimelerde A, E, İ sıklıkla bulunur!' : 'Hint: Common vowels are E, A, I!');
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-300 text-xs font-bold transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Shuffle size={14} className="text-blue-400" />
              <span>{isTr ? 'Sesli Harf Kontrolü' : 'Vowel Check'}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 font-black">
              {isTr ? 'Aktif' : 'Ready'}
            </span>
          </button>
        </div>

        {/* Guess Distribution Card */}
        <div className="p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
          <h4 className="font-extrabold text-[11px] tracking-wider uppercase text-gray-500 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <TrendingUp size={13} className="text-emerald-500" />
              <span>{isTr ? 'TAHMİN DAĞILIMI' : 'GUESS DISTRIBUTION'}</span>
            </span>
          </h4>
          <div className="space-y-1 text-[11px] font-bold">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const count = guessDistribution[num] || 0;
              const widthPct = Math.max((count / maxGuessCount) * 100, 8);
              const isCurrentWinRow = gameStatus === 'won' && guesses.length === num;

              return (
                <div key={num} className="flex items-center gap-1.5">
                  <span className="w-3 text-right text-gray-400 text-[10px] font-mono">{num}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800/80 rounded-md h-3.5 overflow-hidden flex items-center">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className={`h-full flex items-center justify-end pr-1 text-[10px] font-black text-white transition-all duration-500 ${
                        isCurrentWinRow
                          ? 'bg-emerald-500 animate-pulse'
                          : count > 0
                          ? 'bg-[var(--accent-color)]'
                          : 'bg-gray-400 dark:bg-gray-600'
                      }`}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pool Vocabulary Progress */}
        <div className="p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
          <h4 className="font-extrabold text-[11px] tracking-wider uppercase text-gray-500 mb-2 flex items-center gap-1.5">
            <Award size={13} className="text-amber-500" />
            <span>{isTr ? 'KELİME DAĞARCIĞI' : 'WORD MEMORY'}</span>
          </h4>
          <div className="space-y-1.5">
            {[
              { label: isTr ? '5 Harf' : '5 Letters', poolKey: `wordle_${language}_5`, total: WORDLE_WORDS_TR[5].length },
              { label: isTr ? '7 Harf' : '7 Letters', poolKey: `wordle_${language}_7`, total: WORDLE_WORDS_TR[7].length },
              { label: isTr ? '9 Harf' : '9 Letters', poolKey: `wordle_${language}_9`, total: WORDLE_WORDS_TR[9].length },
            ].map((p) => {
              const prog = getPoolProgress(p.poolKey, p.total);
              const pct = Math.round((prog.seenCount / prog.totalCount) * 100);
              return (
                <div key={p.label}>
                  <div className="flex justify-between text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-0.5">
                    <span>{p.label}</span>
                    <span className="font-bold text-[var(--accent-color)]">{prog.seenCount}/{prog.totalCount} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent-color)] rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
      )}

      {/* ======================================================== */}
      {/* CENTER COLUMN: OPTION 1 GOLD-BEVELED GAME BOARD & TRAY   */}
      {/* ======================================================== */}
      <div className={`flex-1 ${!isDashboardVisible ? 'max-w-2xl xl:max-w-3xl 2xl:max-w-4xl' : 'max-w-xl'} flex flex-col items-center justify-start select-none space-y-2 pt-0 transition-all duration-300`}>
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
        <div className="w-full max-w-xl flex items-center justify-between pb-1.5 border-b border-[var(--border-color)]">
          {/* Length selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800/80 p-0.5 rounded-xl text-xs font-semibold border border-[var(--border-color)]">
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

          {/* Metric + Memory Progress */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-[11px]">
              {isTr ? 'DENEME' : 'ATTEMPT'} <span className="font-extrabold text-[var(--accent-color)]">{guesses.length}/6</span>
            </div>
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs text-[10px] text-gray-500">
              {isTr ? 'HAVUZ' : 'POOL'} <span className="font-bold text-[var(--accent-color)]">{poolStats.seenCount}/{poolStats.totalCount}</span>
            </div>
          </div>

          {/* Side Dashboards Toggle, Hint & Restart */}
          <div className="flex items-center gap-1.5">
            {/* Side Dashboards (Misafir, Kombo, Sıralama) Toggle Button */}
            <button
              onClick={() => setShowSideDashboards((p) => !p)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-[var(--border-color)] shadow-2xs cursor-pointer ${
                !isDashboardVisible
                  ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)]'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
              title={isDashboardVisible ? (isTr ? 'Yan Panelleri Gizle (Misafir, Kombo, Sıralama)' : 'Hide Side Panels (Board Focus)') : (isTr ? 'Yan Panelleri Göster (Misafir, Kombo, Sıralama)' : 'Show Side Panels')}
            >
              {!isDashboardVisible ? <EyeOff size={12} /> : <Eye size={12} />}
              <span>{!isDashboardVisible ? (isTr ? 'Odaklanıldı' : 'Focused') : (isTr ? 'Paneller' : 'Panels')}</span>
            </button>

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

        {/* LÜKS ALTIN ÇERÇEVELİ OYUN ALANI (Option 1 Game Bezel Box) */}
        <div className="p-3 sm:p-4.5 rounded-3xl border-2 border-amber-500/40 bg-zinc-950/80 shadow-2xl backdrop-blur-md ring-1 ring-amber-400/20 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2">
            {Array.from({ length: 6 }).map((_, rowIndex) => {
              const guess = guesses[rowIndex] || (rowIndex === guesses.length ? currentGuess : '');
              const isCompleted = rowIndex < guesses.length;
              const isCurrent = rowIndex === guesses.length;

              const cellSize = !isDashboardVisible
                ? wordLength === 9
                  ? 'w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 lg:w-15 lg:h-15 text-sm sm:text-lg lg:text-xl'
                  : wordLength === 7
                  ? 'w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 lg:w-17 lg:h-17 text-base sm:text-xl lg:text-2xl'
                  : 'w-12 h-12 sm:w-15 sm:h-15 md:w-17 md:h-17 lg:w-20 lg:h-20 xl:w-22 xl:h-22 text-xl sm:text-3xl lg:text-4xl xl:text-5xl'
                : wordLength === 9
                ? 'w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 md:w-9.5 md:h-9.5 text-xs sm:text-sm'
                : wordLength === 7
                ? 'w-8.5 h-8.5 sm:w-10 sm:h-10 md:w-11 md:h-11 text-sm sm:text-base'
                : 'w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 text-base sm:text-2xl';

              return (
                <div
                  key={rowIndex}
                  className={`grid gap-1.5 sm:gap-2 transition-transform ${isCurrent && shakeRow ? 'animate-shake' : ''}`}
                  style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: wordLength }).map((_, colIndex) => {
                    const letter = guess[colIndex] || '';
                    const isHintLetter = isCurrent && !letter && revealedIndices.includes(colIndex);
                    let style = 'bg-zinc-900/90 border-2 border-zinc-700/60 text-white shadow-inner';

                    if (isCompleted) {
                      style = getLetterStatus(letter, colIndex);
                    } else if (letter) {
                      style = 'bg-zinc-800/95 border-2 border-amber-400 text-amber-200 scale-105 shadow-lg shadow-amber-500/20';
                    } else if (isHintLetter) {
                      style = 'bg-amber-500/10 border-2 border-amber-400 text-amber-400 font-normal border-dashed';
                    }

                    return (
                      <div
                        key={colIndex}
                        className={`${cellSize} rounded-xl sm:rounded-2xl flex items-center justify-center font-black transition-all duration-150 select-none ${style}`}
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
          <div className="text-center py-2 px-3.5 rounded-2xl border-2 border-amber-500/40 bg-[var(--bg-card)] shadow-2xl animate-fadeIn max-w-md w-full my-1">
            <div className={`text-xs font-bold mb-1 ${gameStatus === 'won' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {gameStatus === 'won'
                ? (isTr ? 'Muhteşem! Kelimeyi Başarıyla Buldunuz! 🎉' : 'Awesome! You guessed the word correctly! 🎉')
                : (isTr ? `Oyun Bitti! Doğru Kelime: ${solution}` : `Game Over! The word was: ${solution}`)}
            </div>

            {/* Dictionary meaning */}
            {meaning && (
              <div className="my-1.5 p-2 rounded-xl bg-zinc-900/80 border border-zinc-700/60 text-left text-[11px] text-gray-200 flex items-start gap-1.5">
                <BookOpen size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-amber-400 mr-1">{solution}:</span>
                  <span className="italic">{meaning}</span>
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex items-center justify-center gap-1.5 mt-2">
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

        {/* LÜKS KLAVYE TEPSİSİ (Option 1 Tactile Keyboard Tray) */}
        <div className={`w-full ${!isDashboardVisible ? 'max-w-2xl xl:max-w-3xl' : 'max-w-lg'} p-2 sm:p-2.5 rounded-2xl border border-amber-500/30 bg-zinc-950/80 shadow-xl backdrop-blur-xs space-y-1 sm:space-y-1.5 transition-all duration-300`}>
          {keyboardRows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
              {row.map((key) => {
                const customStatus = getKeyStatus(key);
                const isSpecial = key === 'GİR' || key === 'ENTER' || key === '⌫';
                return (
                  <button
                    key={key}
                    onClick={() => handleKey(key === '⌫' ? 'BACKSPACE' : key)}
                    className={`h-8 sm:h-9 md:h-10 ${!isDashboardVisible ? 'lg:h-11 xl:h-12 text-xs sm:text-base' : 'text-xs sm:text-sm'} rounded-xl font-black border transition active:scale-95 shadow-xs cursor-pointer ${
                      customStatus
                        ? customStatus
                        : 'bg-zinc-900/90 border-zinc-700/70 text-zinc-100 hover:border-amber-400 hover:text-amber-200'
                    } ${
                      isSpecial
                        ? 'px-2.5 sm:px-3.5 bg-amber-500/20 text-amber-300 border-amber-500/40 font-extrabold text-[10px] sm:text-xs'
                        : 'min-w-[24px] sm:min-w-[30px] md:min-w-[34px] px-1'
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

      {/* ======================================================== */}
      {/* RIGHT DASHBOARD: LIVE RANKINGS, USED LETTERS & TROPHIES   */}
      {/* ======================================================== */}
      {isDashboardVisible && (
        <aside className="hidden lg:flex flex-col w-56 lg:w-64 xl:w-72 shrink-0 space-y-2.5 text-xs select-none animate-fadeIn">
        {/* Canlı Liderlik Tablosu (Option 1 Live Rankings) */}
        <div className="p-3 rounded-2xl border-2 border-amber-500/30 bg-[var(--bg-card)] shadow-md">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-color)]">
            <h4 className="font-extrabold text-[11px] tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
              <Trophy size={13} className="text-amber-400" />
              <span>{isTr ? 'LİDERLİK SIRALAMASI' : 'LIVE RANKINGS'}</span>
            </h4>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold">
              {isTr ? 'CANLI' : 'LIVE'}
            </span>
          </div>

          <div className="space-y-1.5">
            {liveRankings.map((r) => (
              <div
                key={r.rank}
                className={`flex items-center justify-between p-1.5 rounded-xl border text-xs transition ${
                  r.isUser
                    ? 'border-amber-400 bg-amber-500/15 text-amber-200 font-bold shadow-xs ring-1 ring-amber-400/40'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/60 text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-4 font-mono font-black text-amber-400 text-xs text-center shrink-0">
                    {r.rank}.
                  </span>
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-6 h-6 rounded-full object-cover border border-amber-400/30 shrink-0"
                  />
                  <span className="truncate text-xs font-semibold">{r.name}</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-amber-400 shrink-0 ml-1">
                  {r.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Kullanılan Harfler Havuzu (Option 1 Used Letters) */}
        <div className="p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[var(--border-color)]">
            <h4 className="font-extrabold text-[11px] tracking-wider uppercase text-gray-400 flex items-center gap-1.5">
              <span>{isTr ? 'KULLANILAN HARFLER' : 'USED LETTERS'}</span>
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">
              {usedLetters.length}
            </span>
          </div>

          {usedLetters.length === 0 ? (
            <p className="text-[10px] text-gray-400 italic py-1">
              {isTr ? 'İlk tahminle harfler listelenecek.' : 'Letters will appear with your first guess.'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {usedLetters.map(({ char, status }) => (
                <span
                  key={char}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs border ${
                    status === 'correct'
                      ? 'bg-emerald-700 text-white border-emerald-400 shadow-xs'
                      : status === 'present'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-xs'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Kupalar ve Başarılar (Option 1 Trophies) */}
        <div className="p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-2">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Trophy size={12} className="text-amber-500" />
            <span>{isTr ? 'KUPALAR & BAŞARILAR' : 'TROPHIES'}</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <span className="text-base">🏆</span>
              <div className="truncate">
                <div className="font-bold text-[11px] truncate">{isTr ? 'Kusursuz Çözüm' : 'The Royal Flush'}</div>
                <div className="text-[9px] text-amber-400/80">{isTr ? 'İlk 2 denemede bilme' : 'Solved in <=2 attempts'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
              <span className="text-base">🔥</span>
              <div className="truncate">
                <div className="font-bold text-[11px] truncate">{isTr ? 'Seri Ustası' : 'Streak Master'}</div>
                <div className="text-[9px] text-purple-400/80">{isTr ? '3 ve üzeri ardışık zafer' : '3+ win streak'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <span className="text-base">👑</span>
              <div className="truncate">
                <div className="font-bold text-[11px] truncate">{isTr ? 'Efsanevi Çözücü' : 'Legendary Solver'}</div>
                <div className="text-[9px] text-emerald-400/80">{isTr ? 'Toplam 10+ galibiyet' : '10+ lifetime wins'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 1v1 Hızlı Düello Butonu */}
        <div className="p-3 rounded-2xl border border-purple-500/30 bg-purple-500/10 shadow-xs">
          <div className="flex items-center gap-1.5 text-purple-400 font-extrabold text-[11px] mb-1">
            <Swords size={13} />
            <span>{isTr ? '1v1 ÇEVRİMİÇİ DÜELLO' : '1v1 ONLINE DUEL'}</span>
          </div>
          <button
            onClick={onOpenMultiplayer}
            className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-black transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <Users size={12} />
            <span>{isTr ? 'Düello Başlat' : 'Start Duel'}</span>
          </button>
        </div>
      </aside>
      )}
    </div>
  );
};
