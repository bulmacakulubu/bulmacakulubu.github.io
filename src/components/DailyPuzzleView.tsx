import React, { useState, useEffect } from 'react';
import { GameId, AllStats, UserProfile } from '../types';
import { getDailyPuzzleInfo } from '../utils/storage';
import { Trophy, Clock, Flame, Play, Award, CheckCircle2, ArrowRight, Share2, Timer } from 'lucide-react';
import { openShareModal } from '../utils/shareService';

interface DailyPuzzleViewProps {
  language: 'tr' | 'en';
  soundEnabled: boolean;
  stats: AllStats;
  onPlayGame: (gameId: GameId) => void;
  currentUser?: UserProfile;
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

const LEADERBOARD_TR = [
  { rank: 1, name: 'Eleanor Vance', score: '9,840 Puan', time: '14 sn', badge: 'Büyükusta', isUser: false },
  { rank: 2, name: 'Jurnin V.', score: '9,420 Puan', time: '18 sn', badge: 'Usta Çözücü', isUser: false },
  { rank: 3, name: 'ZekaKüpü', score: '8,950 Puan', time: '21 sn', badge: 'Uzman', isUser: false },
  { rank: 4, name: 'Julian Finch', score: '8,410 Puan', time: '26 sn', badge: 'Kelime Avcısı', isUser: false },
  { rank: 5, name: 'Boran Tekin', score: '7,890 Puan', time: '32 sn', badge: 'Zeka Ustası', isUser: false },
  { rank: 6, name: 'Zeynep Kaya', score: '7,340 Puan', time: '37 sn', badge: 'Hızlı Düşünür', isUser: false },
];

const LEADERBOARD_EN = [
  { rank: 1, name: 'Eleanor Vance', score: '9,840 pts', time: '14s', badge: 'Grandmaster', isUser: false },
  { rank: 2, name: 'Jurnin V.', score: '9,420 pts', time: '18s', badge: 'Master Solver', isUser: false },
  { rank: 3, name: 'BrainTeaser', score: '8,950 pts', time: '21s', badge: 'Expert', isUser: false },
  { rank: 4, name: 'Julian Finch', score: '8,410 pts', time: '26s', badge: 'Word Hunter', isUser: false },
  { rank: 5, name: 'Marcus Sterling', score: '7,890 pts', time: '32s', badge: 'Tactician', isUser: false },
  { rank: 6, name: 'Sarah_99', score: '7,340 pts', time: '37s', badge: 'Speed Solver', isUser: false },
];

export const DailyPuzzleView: React.FC<DailyPuzzleViewProps> = ({
  language,
  stats,
  onPlayGame,
  currentUser,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const puzzleInfo = getDailyPuzzleInfo();
  const gameName = GAME_NAMES_MAP[puzzleInfo.gameId]?.[language] || puzzleInfo.gameId;
  const isTr = language === 'tr';

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
  const dailyStats = stats['gunun-bulmacasi'] || { played: 0, won: 0, streak: 0, maxStreak: 0 };
  const hasPlayedToday = gameStats.played > 0 || dailyStats.played > 0;
  const activeStreak = Math.max(gameStats.streak, dailyStats.streak, 0);

  const rawBest = gameStats.bestScore ?? gameStats.bestTime ?? dailyStats.bestScore ?? dailyStats.bestTime;
  const bestRecord = rawBest ? (typeof rawBest === 'number' && rawBest > 1000 ? `${rawBest} P` : `${rawBest}`) : '—';

  const baseLeaderboard = isTr ? LEADERBOARD_TR : LEADERBOARD_EN;

  const handleShareDaily = () => {
    openShareModal({
      title: isTr ? `Bulmaca Kulübü - Günün Bulmacası: ${gameName}` : `Puzzle Club - Daily Challenge: ${gameName}`,
      gameName,
      scoreOrAttempts: hasPlayedToday ? `${bestRecord}` : (isTr ? 'Günün Mücadelesi' : 'Daily Challenge'),
      customText: isTr
        ? `Bulmaca Kulübü'nde bugünün özel mücadelesi (${gameName}) tamamlandı! Sen de katıl ve zekanı test et:`
        : `Completed today's challenge (${gameName}) on Puzzle Club! Test your mind:`,
    });
  };

  return (
    <div className="w-full max-w-4xl flex flex-col space-y-4 select-none animate-fadeIn">
      {/* Bauhaus Mono Zinc Hero Card */}
      <div
        className="w-full rounded-2xl p-5 sm:p-6 border relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs"
        style={{
          backgroundColor: '#121215',
          borderColor: '#27272a',
          color: '#f4f4f5',
        }}
      >
        <div className="space-y-2 z-10 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/90 border border-zinc-700/70 rounded-md text-[10px] font-mono font-bold tracking-wider text-zinc-300 uppercase">
            <Trophy size={11} className="text-amber-400" />
            <span>{isTr ? 'Günün Özel Mücadelesi' : "Today's Daily Challenge"}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-100">
            {gameName}
          </h1>

          <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
            {isTr
              ? 'Her 24 saatte bir güncellenen resmi günlük bulmacayı çöz, günün liderlik tablosunda yerini al.'
              : 'Solve today’s official 24-hour challenge, record your record time and climb the daily leaderboard.'}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 z-10 shrink-0 w-full sm:w-auto">
          {/* Countdown Clock */}
          <div className="flex items-center gap-2.5 bg-[#18181c] border border-zinc-800 px-3.5 py-2 rounded-xl text-xs font-mono shrink-0">
            <Clock size={13} className="text-zinc-400" />
            <div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-sans font-medium leading-none">
                {isTr ? 'Yenilenme' : 'Resets In'}
              </div>
              <div className="font-bold text-xs text-zinc-200 mt-1 font-mono tracking-wide">
                {timeLeft || '00:00:00'}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onPlayGame(puzzleInfo.gameId)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl shadow-xs transition active:scale-95 text-xs cursor-pointer grow sm:grow-0"
          >
            <Play size={13} fill="currentColor" />
            <span>
              {hasPlayedToday
                ? (isTr ? 'Tekrar Oyna' : 'Play Again')
                : (isTr ? 'Bulmacayı Çöz' : 'Solve Puzzle')}
            </span>
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Column: User Status Cards */}
        <div className="md:col-span-5 flex flex-col gap-3">
          {/* Status Card 1: Today's Status */}
          <div
            className="p-3.5 rounded-xl border flex items-center justify-between shadow-2xs transition"
            style={{ backgroundColor: '#121215', borderColor: '#27272a' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 flex items-center justify-center shrink-0">
                <Trophy size={18} className="text-amber-400" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-400 font-medium">
                  {isTr ? 'Bugün Durumu' : "Today's Status"}
                </div>
                <div className="text-xs font-bold mt-0.5">
                  {hasPlayedToday ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 size={13} /> {isTr ? 'Tamamlandı' : 'Completed'}
                    </span>
                  ) : (
                    <span className="text-zinc-300 font-medium">{isTr ? 'Çözüm Bekliyor' : 'Pending'}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => onPlayGame(puzzleInfo.gameId)}
              className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:text-white transition cursor-pointer"
              title={isTr ? 'Bulmacaya Git' : 'Go to Puzzle'}
            >
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Status Card 2: Streak */}
          <div
            className="p-3.5 rounded-xl border flex items-center gap-3 shadow-2xs"
            style={{ backgroundColor: '#121215', borderColor: '#27272a' }}
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-amber-500 flex items-center justify-center shrink-0">
              <Flame size={18} />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 font-medium">
                {isTr ? 'Aktif Seri' : 'Active Streak'}
              </div>
              <div className="text-sm font-bold font-mono text-zinc-100 mt-0.5">
                {activeStreak} {isTr ? 'Gün' : 'Days'}
              </div>
            </div>
          </div>

          {/* Status Card 3: Best Record */}
          <div
            className="p-3.5 rounded-xl border flex items-center justify-between shadow-2xs"
            style={{ backgroundColor: '#121215', borderColor: '#27272a' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 flex items-center justify-center shrink-0">
                <Award size={18} className="text-zinc-300" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-400 font-medium">
                  {isTr ? 'En İyi Derece' : 'Best Record'}
                </div>
                <div className="text-sm font-bold font-mono text-zinc-100 mt-0.5">
                  {bestRecord}
                </div>
              </div>
            </div>

            <button
              onClick={handleShareDaily}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white text-[11px] font-medium transition cursor-pointer"
              title={isTr ? 'Paylaş' : 'Share'}
            >
              <Share2 size={13} />
              <span>{isTr ? 'Paylaş' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Bauhaus Leaderboard Table */}
        <div
          className="md:col-span-7 border rounded-2xl overflow-hidden shadow-2xs"
          style={{ backgroundColor: '#121215', borderColor: '#27272a' }}
        >
          {/* Leaderboard Header */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between bg-[#16161a]"
            style={{ borderColor: '#27272a' }}
          >
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-amber-400" />
              <h2 className="font-bold text-xs text-zinc-200">
                {isTr ? 'Günün Liderlik Tablosu' : "Today's Leaderboard"}
              </h2>
            </div>
            <div className="text-[10px] font-mono font-medium px-2 py-0.5 bg-zinc-800 border border-zinc-700/60 rounded text-zinc-400">
              {puzzleInfo.dateKey}
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-[#141418] border-b border-zinc-800/80">
            <div className="col-span-2">{isTr ? 'Sıra' : 'Rank'}</div>
            <div className="col-span-5">{isTr ? 'Oyuncu' : 'Player'}</div>
            <div className="col-span-3 text-right">{isTr ? 'Skor / Süre' : 'Score'}</div>
            <div className="col-span-2 text-right">{isTr ? 'Unvan' : 'Badge'}</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-zinc-800/60">
            {baseLeaderboard.map((row) => (
              <div
                key={row.rank}
                className="grid grid-cols-12 px-4 py-2.5 items-center text-xs hover:bg-zinc-800/30 transition"
              >
                {/* Rank Badge */}
                <div className="col-span-2 flex items-center gap-1.5 font-bold">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
                      row.rank === 1
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : row.rank === 2
                        ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40'
                        : row.rank === 3
                        ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                        : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/50'
                    }`}
                  >
                    {row.rank}
                  </span>
                </div>

                {/* Player Name */}
                <div className="col-span-5 font-medium flex items-center gap-2 truncate text-zinc-200">
                  <div className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-400 flex items-center justify-center text-[9px] font-mono font-bold uppercase shrink-0">
                    {row.name.charAt(0)}
                  </div>
                  <span className="truncate text-xs">{row.name}</span>
                </div>

                {/* Score & Time */}
                <div className="col-span-3 text-right font-mono font-semibold text-xs text-zinc-300">
                  <div>{row.score}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">{row.time}</div>
                </div>

                {/* Badge / Title */}
                <div className="col-span-2 text-right text-[10px] font-medium text-zinc-400 truncate">
                  {row.badge}
                </div>
              </div>
            ))}

            {/* Current User Row if played */}
            {hasPlayedToday && (
              <div className="grid grid-cols-12 px-4 py-2.5 items-center text-xs bg-amber-500/5 border-t border-amber-500/30">
                <div className="col-span-2 flex items-center gap-1.5 font-bold">
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    ★
                  </span>
                </div>
                <div className="col-span-5 font-semibold flex items-center gap-2 truncate text-amber-300">
                  <div className="w-5 h-5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-[9px] font-mono font-bold uppercase shrink-0">
                    {(currentUser?.name || 'S').charAt(0)}
                  </div>
                  <span className="truncate text-xs">
                    {currentUser?.name || (isTr ? 'Sen (Bugün)' : 'You (Today)')}
                  </span>
                </div>
                <div className="col-span-3 text-right font-mono font-bold text-xs text-amber-400">
                  {bestRecord}
                </div>
                <div className="col-span-2 text-right text-[10px] font-medium text-amber-400/80 truncate">
                  {isTr ? 'Kayıtlı' : 'Recorded'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
