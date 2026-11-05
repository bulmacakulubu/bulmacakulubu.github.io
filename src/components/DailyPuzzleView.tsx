import React, { useState, useEffect } from 'react';
import { GameId, AllStats, UserProfile } from '../types';
import { getDailyPuzzleInfo } from '../utils/storage';
import { Trophy, Clock, Flame, Play, Award, CheckCircle2, ArrowRight, Share2, ShieldCheck, Zap } from 'lucide-react';
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
  const winRate = gameStats.played > 0 ? Math.round((gameStats.won / gameStats.played) * 100) : 0;

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
              ? 'Her 24 saatte bir güncellenen resmi günlük bulmacayı çöz, kişisel rekorunu kaydet ve serini koru.'
              : 'Solve today’s official 24-hour challenge, record your personal record time and maintain your streak.'}
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

        {/* Right Column: 100% Genuine Personal Record & Solution Status */}
        <div
          className="md:col-span-7 border rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between"
          style={{ backgroundColor: '#121215', borderColor: '#27272a' }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between bg-[#16161a]"
            style={{ borderColor: '#27272a' }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              <h2 className="font-bold text-xs text-zinc-200">
                {isTr ? 'Kişisel Çözüm Kaydı ve Geçmişi' : "Personal Solution Record & History"}
              </h2>
            </div>
            <div className="text-[10px] font-mono font-medium px-2 py-0.5 bg-zinc-800 border border-zinc-700/60 rounded text-zinc-400">
              {puzzleInfo.dateKey}
            </div>
          </div>

          {/* Main Status Panel */}
          <div className="p-5 flex flex-col items-center justify-center text-center space-y-3">
            {hasPlayedToday ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-100">
                    {isTr ? 'Günün Bulmacası Tamamlandı' : 'Daily Puzzle Completed'}
                  </div>
                  <p className="text-xs text-zinc-400 max-w-sm mt-1">
                    {isTr
                      ? 'Tebrikler! Bugünkü bulmacayı başarıyla çözdünüz. Dereceniz cihaz hafızasına kaydedildi.'
                      : 'Congratulations! You solved today’s puzzle. Your result is securely saved on this device.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">{isTr ? 'Derece' : 'Record'}</span>
                    <span className="font-mono font-bold text-emerald-400">{bestRecord}</span>
                  </div>
                  <div className="h-6 w-px bg-zinc-800" />
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">{isTr ? 'Seri' : 'Streak'}</span>
                    <span className="font-mono font-bold text-amber-400">{activeStreak} {isTr ? 'Gün' : 'Days'}</span>
                  </div>
                  <div className="h-6 w-px bg-zinc-800" />
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">{isTr ? 'Kullanıcı' : 'User'}</span>
                    <span className="font-bold text-zinc-200">{currentUser?.name || (isTr ? 'Sen' : 'You')}</span>
                  </div>
                </div>

                <button
                  onClick={handleShareDaily}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs transition cursor-pointer mt-1"
                >
                  <Share2 size={13} />
                  <span>{isTr ? 'Başarını Sosyal Ağlarda Paylaş' : 'Share Your Achievement'}</span>
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-200">
                    {isTr ? 'Günün Çözümü Bekleniyor' : 'Awaiting Today’s Solution'}
                  </div>
                  <p className="text-xs text-zinc-400 max-w-sm mt-1">
                    {isTr
                      ? 'Bugünkü 24 saatlik özel mücadeleyi henüz çözmediniz. Çözümü bitirdiğinizde dereceniz burada belgelenecektir.'
                      : 'You haven’t completed today’s challenge yet. Once solved, your verified time and score will appear here.'}
                  </p>
                </div>

                <button
                  onClick={() => onPlayGame(puzzleInfo.gameId)}
                  className="flex items-center gap-2 px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs transition cursor-pointer mt-1"
                >
                  <Play size={13} fill="currentColor" />
                  <span>{isTr ? 'Bulmacaya Başla' : 'Start Puzzle'}</span>
                </button>
              </>
            )}
          </div>

          {/* Genuine Local Stats Breakdown for This Game */}
          <div className="border-t border-zinc-800/80 bg-[#16161a] p-3 text-xs">
            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
              <span>{isTr ? `Bu Oyundaki Geçmişiniz (${gameName})` : `Your History in (${gameName})`}</span>
              <span className="text-zinc-500">{isTr ? 'Gerçek Cihaz Verisi' : 'Verified Device Data'}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 block">{isTr ? 'Oynanan' : 'Played'}</span>
                <span className="font-mono font-bold text-zinc-200 text-xs">{gameStats.played}</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 block">{isTr ? 'Kazanılan' : 'Won'}</span>
                <span className="font-mono font-bold text-emerald-400 text-xs">{gameStats.won}</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 block">{isTr ? 'Başarı %' : 'Win %'}</span>
                <span className="font-mono font-bold text-zinc-200 text-xs">%{winRate}</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 block">{isTr ? 'En İyi Seri' : 'Best Streak'}</span>
                <span className="font-mono font-bold text-amber-400 text-xs">{gameStats.maxStreak || gameStats.streak || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
