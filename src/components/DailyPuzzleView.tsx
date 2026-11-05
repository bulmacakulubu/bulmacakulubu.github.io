import React, { useState, useEffect } from 'react';
import { GameId, AllStats } from '../types';
import { getDailyPuzzleInfo } from '../utils/storage';
import { Trophy, Clock, Flame, Play, Award, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface DailyPuzzleViewProps {
  language: 'tr' | 'en';
  soundEnabled: boolean;
  stats: AllStats;
  onPlayGame: (gameId: GameId) => void;
}

const GAME_NAMES_MAP: Record<GameId, { tr: string; en: string }> = {
  'kelime-bulmaca': { tr: 'Kelime Bulmaca', en: 'Word Puzzle' },
  'kare-bulmaca': { tr: 'Kare / Çengel Bulmaca', en: 'Crossword' },
  'anagram': { tr: 'Anagram Çözücü', en: 'Anagram Solver' },
  'kelime-turetme': { tr: 'Kelime Türetme', en: 'Word Builder' },
  'sozcuk-avi': { tr: 'Sözcük Avı', en: 'Word Search' },
  'adam-asmaca': { tr: 'Adam Asmaca', en: 'Hangman' },
  'satranc': { tr: 'Satranç', en: 'Chess' },
  'sudoku': { tr: 'Sudoku', en: 'Sudoku' },
  'kelime-zinciri': { tr: 'Kelime Zinciri', en: 'Word Chain' },
  'hafiza-kartlari': { tr: 'Hafıza Kartları', en: 'Memory Cards' },
  'nokta-avi': { tr: 'Nokta Avı', en: 'Dot Hunt' },
  'baglantilar': { tr: 'Bağlantılar (Connections)', en: 'Connections' },
  'nonogram': { tr: 'Nonogram (Piksel)', en: 'Nonogram' },
  'gunun-bulmacasi': { tr: 'Günün Bulmacası', en: 'Daily Puzzle' },
};

const MOCK_LEADERBOARD_TR = [
  { rank: 1, name: 'ZekaKupu', score: '9,840 Puan', time: '14s', badge: '🏆 Grandmaster' },
  { rank: 2, name: 'KelimeAvcisi', score: '8,920 Puan', time: '19s', badge: '🥈 Master' },
  { rank: 3, name: 'Ayse_99', score: '8,450 Puan', time: '22s', badge: '🥉 Expert' },
  { rank: 4, name: 'BulmacaMaster', score: '7,800 Puan', time: '28s', badge: '🧠 Pro' },
  { rank: 5, name: 'MehmetT', score: '7,120 Puan', time: '35s', badge: '⭐ Player' },
];

const MOCK_LEADERBOARD_EN = [
  { rank: 1, name: 'PuzzleKing', score: '9,840 pts', time: '14s', badge: '🏆 Grandmaster' },
  { rank: 2, name: 'WordSmith', score: '8,920 pts', time: '19s', badge: '🥈 Master' },
  { rank: 3, name: 'Sarah_99', score: '8,450 pts', time: '22s', badge: '🥉 Expert' },
  { rank: 4, name: 'BrainTeaser', score: '7,800 pts', time: '28s', badge: '🧠 Pro' },
  { rank: 5, name: 'Alex_Dev', score: '7,120 pts', time: '35s', badge: '⭐ Player' },
];

export const DailyPuzzleView: React.FC<DailyPuzzleViewProps> = ({
  language,
  stats,
  onPlayGame,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const puzzleInfo = getDailyPuzzleInfo();
  const gameName = GAME_NAMES_MAP[puzzleInfo.gameId][language];

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = puzzleInfo.nextResetTime - now;
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [puzzleInfo.nextResetTime]);

  const gameStats = stats[puzzleInfo.gameId] || { played: 0, won: 0, streak: 0, maxStreak: 0 };
  const hasPlayedToday = gameStats.played > 0;
  const leaderboardData = language === 'tr' ? MOCK_LEADERBOARD_TR : MOCK_LEADERBOARD_EN;

  return (
    <div className="w-full max-w-4xl flex flex-col space-y-4 select-none">
      {/* Compact Hero Banner */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider uppercase">
            <Sparkles size={12} />
            {language === 'tr' ? 'Günün Özel Mücadelesi' : "Today's Special Challenge"}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {gameName}
          </h1>
          <p className="text-xs text-purple-100 max-w-md leading-snug">
            {language === 'tr'
              ? 'Her 24 saatte bir yenilenen bu özel bulmacayı çöz, skorunu kaydet ve sıralamaya gir!'
              : 'Complete today’s 24h challenge, record your score and join the leaderboard!'}
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono">
            <Clock size={14} className="text-yellow-400" />
            <div>
              <div className="text-[9px] opacity-70 uppercase leading-none">
                {language === 'tr' ? 'Yenilenme' : 'Resets In'}
              </div>
              <div className="font-bold text-xs text-yellow-300 mt-0.5">{timeLeft}</div>
            </div>
          </div>

          <button
            onClick={() => onPlayGame(puzzleInfo.gameId)}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-white text-purple-900 hover:bg-purple-50 font-extrabold rounded-xl shadow-md transition transform hover:scale-105 active:scale-95 text-xs cursor-pointer"
          >
            <Play size={14} fill="currentColor" />
            {hasPlayedToday
              ? (language === 'tr' ? 'Tekrar Oyna' : 'Play Again')
              : (language === 'tr' ? 'Bulmacayı Çöz' : 'Solve Puzzle')}
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Column: User Status Cards */}
        <div className="md:col-span-5 flex flex-col gap-3">
          {/* Status Card 1: Today's Status */}
          <div
            className="p-3.5 rounded-2xl border flex items-center justify-between shadow-2xs"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                <Trophy size={18} />
              </div>
              <div>
                <div className="text-[11px] text-gray-400 font-medium">
                  {language === 'tr' ? 'Bugün Durumu' : "Today's Status"}
                </div>
                <div className="text-xs font-bold mt-0.5">
                  {hasPlayedToday ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> {language === 'tr' ? 'Tamamlandı' : 'Completed'}
                    </span>
                  ) : (
                    <span className="text-amber-500">{language === 'tr' ? 'Çözüm Bekliyor' : 'Pending'}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => onPlayGame(puzzleInfo.gameId)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-[var(--accent-color)]"
              title="Başla"
            >
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Status Card 2: Streak */}
          <div
            className="p-3.5 rounded-2xl border flex items-center gap-3 shadow-2xs"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Flame size={18} />
            </div>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">
                {language === 'tr' ? 'Aktif Seri' : 'Active Streak'}
              </div>
              <div className="text-sm font-extrabold mt-0.5">
                {gameStats.streak} {language === 'tr' ? 'Gün' : 'Days'}
              </div>
            </div>
          </div>

          {/* Status Card 3: Best Record */}
          <div
            className="p-3.5 rounded-2xl border flex items-center gap-3 shadow-2xs"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
              <Award size={18} />
            </div>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">
                {language === 'tr' ? 'En İyi Derece' : 'Best Record'}
              </div>
              <div className="text-sm font-extrabold mt-0.5">
                {gameStats.bestScore ?? gameStats.bestTime ? `${gameStats.bestScore || gameStats.bestTime}` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Compact Leaderboard */}
        <div
          className="md:col-span-7 border rounded-2xl overflow-hidden shadow-2xs"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div
            className="px-4 py-2.5 border-b flex items-center justify-between bg-[var(--bg-secondary)]/30"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-2">
              <Trophy size={15} className="text-amber-500" />
              <h2 className="font-bold text-xs">
                {language === 'tr' ? 'Günün Liderlik Tablosu' : "Today's Leaderboard"}
              </h2>
            </div>
            <div className="text-[10px] font-bold px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
              {puzzleInfo.dateKey}
            </div>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            <div className="grid grid-cols-12 px-4 py-1.5 text-[11px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-secondary)]/10">
              <div className="col-span-2">{language === 'tr' ? 'Sıra' : 'Rank'}</div>
              <div className="col-span-5">{language === 'tr' ? 'Oyuncu' : 'Player'}</div>
              <div className="col-span-3 text-right">{language === 'tr' ? 'Skor' : 'Score'}</div>
              <div className="col-span-2 text-right">{language === 'tr' ? 'Unvan' : 'Badge'}</div>
            </div>

            {leaderboardData.map((row) => (
              <div
                key={row.rank}
                className="grid grid-cols-12 px-4 py-2 items-center text-xs hover:bg-[var(--bg-secondary)]/30 transition"
              >
                <div className="col-span-2 flex items-center gap-1.5 font-bold">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      row.rank === 1
                        ? 'bg-amber-500 text-white shadow-xs'
                        : row.rank === 2
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : row.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {row.rank}
                  </span>
                </div>
                <div className="col-span-5 font-semibold flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                    {row.name.charAt(0)}
                  </div>
                  <span className="truncate text-[11px]">{row.name}</span>
                </div>
                <div className="col-span-3 text-right font-mono font-bold text-xs text-[var(--accent-color)]">
                  {row.score}
                </div>
                <div className="col-span-2 text-right text-[10px] font-medium text-gray-400 truncate">
                  {row.badge}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
