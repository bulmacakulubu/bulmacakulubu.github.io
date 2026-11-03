import React, { useState } from 'react';
import { X, Trophy, Crown, Flame, Award, Medal, Sparkles, UserCheck } from 'lucide-react';
import { UserProfile, GameStats } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'tr' | 'en';
  currentUser: UserProfile;
  stats?: GameStats;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  language = 'tr',
  currentUser,
  stats,
}) => {
  const isTr = language === 'tr';
  const [tab, setTab] = useState<'all' | 'weekly'>('all');

  if (!isOpen) return null;

  const won = stats?.won || 0;
  const played = stats?.played || 0;
  const streak = stats?.streak || 0;
  const userScore = 12000 + won * 150;

  const rankings = [
    { rank: 1, name: 'Eleanor Vance', title: isTr ? 'Büyükusta' : 'Grandmaster', score: 14890, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80', isUser: false },
    { rank: 2, name: 'Jurnin V.', title: isTr ? 'Usta Çözücü' : 'Master Solver', score: 14640, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80', isUser: false },
    { rank: 3, name: currentUser.name || (isTr ? 'Sen (Misafir)' : 'You (Guest)'), title: isTr ? 'Yıldız Oyuncu' : 'Star Player', score: userScore, avatar: currentUser.avatar, isUser: true },
    { rank: 4, name: 'Julian Finch', title: isTr ? 'Kelime Avcısı' : 'Word Hunter', score: 11270, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80', isUser: false },
    { rank: 5, name: 'Boran Tekin', title: isTr ? 'Zeka Ustası' : 'Puzzle Expert', score: 10450, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80', isUser: false },
    { rank: 6, name: 'Zeynep Kaya', title: isTr ? 'Hızlı Düşünür' : 'Speed Solver', score: 9820, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80', isUser: false },
    { rank: 7, name: 'Marcus Sterling', title: isTr ? 'Taktisyen' : 'Tactician', score: 9340, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80', isUser: false },
    { rank: 8, name: 'Selin Demir', title: isTr ? 'Stratejist' : 'Strategist', score: 8910, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100&q=80', isUser: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-3xl border-2 border-amber-500/40 p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-1.5" style={{ color: 'var(--accent-color)' }}>
                <span>{isTr ? 'Liderlik Sıralaması' : 'Leaderboard & Rankings'}</span>
                <Sparkles size={14} className="text-amber-400" />
              </h2>
              <p className="text-[11px] text-gray-500">
                {isTr ? 'En yüksek puanlı ve en serili bulmaca ustaları' : 'Top ranked players & puzzle masters'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--bg-secondary)] transition cursor-pointer text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current User Card */}
        <div className="mt-3 p-3 rounded-2xl border-2 border-amber-400/40 bg-amber-500/10 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 p-0.5"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black shadow-xs">
                #3
              </span>
            </div>
            <div>
              <div className="text-xs font-black flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                  {isTr ? 'Sen' : 'You'}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                <span>{won} {isTr ? 'Zafer' : 'Wins'}</span>
                <span>•</span>
                <span>🔥 {streak} {isTr ? 'Seri' : 'Streak'}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-gray-400">{isTr ? 'PUANIN' : 'SCORE'}</div>
            <div className="text-base font-black text-amber-400 font-mono">
              {userScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-xl my-3 border border-[var(--border-color)]">
          <button
            onClick={() => setTab('all')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              tab === 'all'
                ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {isTr ? '🏆 Genel Sıralama' : '🏆 Global Rank'}
          </button>
          <button
            onClick={() => setTab('weekly')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              tab === 'weekly'
                ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {isTr ? '🔥 Haftalık Şampiyonlar' : '🔥 Weekly Champions'}
          </button>
        </div>

        {/* Rankings List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {rankings.map((r) => {
            const isTop3 = r.rank <= 3;
            return (
              <div
                key={r.rank}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition ${
                  r.isUser
                    ? 'border-amber-400 bg-amber-500/15 shadow-sm ring-1 ring-amber-400/30'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)]/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 text-center font-mono font-black text-xs shrink-0 ${
                      r.rank === 1
                        ? 'text-amber-400'
                        : r.rank === 2
                        ? 'text-gray-300'
                        : r.rank === 3
                        ? 'text-amber-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`}
                  </span>
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className={`w-8 h-8 rounded-full object-cover shrink-0 ${
                      isTop3 ? 'border border-amber-400/50' : 'border border-[var(--border-color)]'
                    }`}
                  />
                  <div className="truncate min-w-0">
                    <div className="text-xs font-bold truncate flex items-center gap-1.5">
                      <span>{r.name}</span>
                      {r.isUser && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500 text-black font-extrabold">
                          {isTr ? 'SEN' : 'YOU'}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">{r.title}</div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="font-mono text-xs font-extrabold text-amber-400">
                    {r.score.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-gray-500 block">{isTr ? 'Puan' : 'Pts'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-gray-500">
          <span>{isTr ? 'Sıralamalar her gece 00:00\'da güncellenir.' : 'Rankings update daily at 00:00.'}</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded-xl bg-[var(--accent-color)] text-[var(--accent-contrast)] font-bold text-xs hover:opacity-90 transition cursor-pointer"
          >
            {isTr ? 'Kapat' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

