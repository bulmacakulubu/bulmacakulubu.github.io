import React from 'react';
import { X, Trophy, Flame, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserProfile, GameStats, AllStats } from '../types';
import { loadStats } from '../utils/storage';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'tr' | 'en';
  currentUser: UserProfile;
  stats?: GameStats;
  allStats?: AllStats;
}

const GAME_DISPLAY_NAMES: Record<string, { tr: string; en: string }> = {
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

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  language = 'tr',
  currentUser,
  stats,
  allStats: propAllStats,
}) => {
  const isTr = language === 'tr';

  if (!isOpen) return null;

  const currentStats = propAllStats || loadStats();

  let totalPlayed = 0;
  let totalWon = 0;
  let maxStreak = 0;

  Object.values(currentStats).forEach((s) => {
    if (s) {
      totalPlayed += s.played || 0;
      totalWon += s.won || 0;
      if (s.streak > maxStreak) maxStreak = s.streak;
      if (s.maxStreak && s.maxStreak > maxStreak) maxStreak = s.maxStreak;
    }
  });

  const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn select-none">
      <div
        className="w-full max-w-lg rounded-2xl border p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        style={{
          backgroundColor: '#121215',
          borderColor: '#27272a',
          color: '#f4f4f5',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-amber-400 shadow-2xs">
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <span>{isTr ? 'Kişisel Başarı & Derece Tablosu' : 'Personal Records & Achievements'}</span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                {isTr ? 'Bu cihazda kayıtlı gerçek oyun geçmişiniz ve rekorlarınız' : 'Authentic gameplay history saved on this device'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Current User Summary Card */}
        <div className="mt-3 p-3 rounded-xl border border-zinc-800 bg-[#16161a] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-lg object-cover border border-zinc-700 p-0.5 bg-zinc-800"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <span>{currentUser.name || (isTr ? 'Misafir Oyuncu' : 'Guest Player')}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">
                  {isTr ? 'Doğrulanmış Profil' : 'Verified'}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                <span>{totalWon} {isTr ? 'Galibiyet' : 'Wins'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium text-amber-400">
                  <Flame size={12} />
                  <span className="font-mono">{maxStreak}</span> {isTr ? 'Seri' : 'Streak'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-zinc-400 font-mono">{isTr ? 'Başarı Oranı' : 'Win Rate'}</div>
            <div className="text-base font-bold text-emerald-400 font-mono">
              %{winRate}
            </div>
          </div>
        </div>

        {/* Honest Information Note */}
        <div className="my-3 p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 flex items-start gap-2.5 text-[11px] text-zinc-400">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {isTr
              ? 'Sitede merkezi bir sunucu bağlı olmadığı için yapay bot isimleri kaldırılmıştır. Aşağıdaki tüm skorlar ve süreler sizin bu tarayıcıdaki gerçek oyun geçmişinizdir.'
              : 'Simulated bot leaderboards have been removed. The records below reflect your genuine local gameplay on this device.'}
          </p>
        </div>

        {/* Real Game Records Table */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 border border-zinc-800/80 rounded-xl bg-[#141418] divide-y divide-zinc-800/60">
          <div className="grid grid-cols-12 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-900/60 sticky top-0">
            <div className="col-span-5">{isTr ? 'Bulmaca Türü' : 'Game'}</div>
            <div className="col-span-3 text-center">{isTr ? 'Oynama / Zafer' : 'Played / Won'}</div>
            <div className="col-span-4 text-right">{isTr ? 'En İyi Derece' : 'Best Record'}</div>
          </div>

          {Object.entries(GAME_DISPLAY_NAMES).map(([gameId, names]) => {
            const st = currentStats[gameId as keyof AllStats];
            const played = st?.played || 0;
            const won = st?.won || 0;
            const raw = st?.bestScore ?? st?.bestTime;
            const best = raw ? (typeof raw === 'number' && raw > 1000 ? `${raw} P` : `${raw}`) : '—';

            return (
              <div
                key={gameId}
                className="grid grid-cols-12 px-3 py-2 items-center text-xs hover:bg-zinc-800/30 transition"
              >
                <div className="col-span-5 font-medium text-zinc-200 truncate flex items-center gap-1.5">
                  {played > 0 ? (
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
                  )}
                  <span className="truncate">{names[language]}</span>
                </div>

                <div className="col-span-3 text-center font-mono text-[11px] text-zinc-400">
                  {played > 0 ? (
                    <span>
                      <strong className="text-zinc-200">{played}</strong> / <span className="text-emerald-400">{won}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-600">0 / 0</span>
                  )}
                </div>

                <div className="col-span-4 text-right font-mono font-bold text-xs text-amber-400">
                  {best}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span>{isTr ? 'Tüm veriler cihazınızda yerel saklanır.' : 'All data stored securely on this device.'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition cursor-pointer"
          >
            {isTr ? 'Kapat' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
