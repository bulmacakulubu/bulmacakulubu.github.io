import React, { useState } from 'react';
import { X, LogOut, CheckCircle2, Cloud, ShieldCheck, Mail, User, Sparkles } from 'lucide-react';
import { UserProfile, AllStats } from '../types';
import { loginWithGoogleData, signOutUser } from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  stats: AllStats;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserChange,
  stats,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!isOpen) return null;

  const totalWon = Object.values(stats).reduce((acc, s) => acc + (s.won || 0), 0);
  const totalPlayed = Object.values(stats).reduce((acc, s) => acc + (s.played || 0), 0);
  const maxStreak = Math.max(...Object.values(stats).map((s) => s.maxStreak || 0), 0);

  const handleQuickGoogleLogin = (name: string, email: string, avatarSeed: string) => {
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=b6e3f4`;
    const updated = loginWithGoogleData({ name, email, avatar });
    onUserChange(updated);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const name = customName.trim() || customEmail.split('@')[0];
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a73e8`;
    const updated = loginWithGoogleData({ name, email: customEmail, avatar });
    onUserChange(updated);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
    setIsCustomMode(false);
  };

  const handleSignOut = () => {
    const guest = signOutUser();
    onUserChange(guest);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden transition-all bg-[var(--bg-card)] text-[var(--text-primary)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {user.provider === 'google' ? 'Google Oyuncu Profili' : 'Oturum Aç'}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Bulut senkronizasyonu ve liderlik tablosu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-[var(--text-primary)] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {user.provider === 'google' ? (
            /* Logged in state */
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-color)]">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-full border-2 border-blue-500 shadow-sm object-cover bg-white shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm truncate">{user.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
                      Google Doğrulandı
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                    <Mail size={12} />
                    {user.email}
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--accent-color)] mt-1 flex items-center gap-1">
                    <Sparkles size={11} />
                    Derece: {user.rating} ELO (Usta)
                  </div>
                </div>
              </div>

              {/* Sync Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs">
                <div className="flex items-center gap-2">
                  <Cloud size={16} className="text-emerald-500" />
                  <span className="font-medium">Tüm oyun verileri buluta eşitlendi</span>
                </div>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Oynanan</div>
                  <div className="text-base font-extrabold text-[var(--text-primary)]">{totalPlayed}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Galibiyet</div>
                  <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{totalWon}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">En İyi Seri</div>
                  <div className="text-base font-extrabold text-amber-500">{maxStreak} Gün</div>
                </div>
              </div>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 transition"
              >
                <LogOut size={14} />
                Oturumu Kapat
              </button>
            </div>
          ) : (
            /* Logged out state */
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 shadow-xs">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-[var(--text-primary)]">Google ile Giriş Yapın</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                  Skorlarınızı tüm cihazlarınızda koruyun, liderlik tablosunda yerinizi alın ve 1v1 çevrimiçi maçlara katılın.
                </p>
              </div>

              {/* Quick 1-Click Google Sign In Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickGoogleLogin('Ahmet Yılmaz', 'ahmet.yilmaz@gmail.com', 'Ahmet')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 bg-white dark:bg-gray-800 hover:shadow-md transition group text-left"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet&backgroundColor=b6e3f4"
                      className="w-8 h-8 rounded-full border border-gray-200"
                      alt="Google User"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition">
                        Ahmet Yılmaz olarak devam et
                      </div>
                      <div className="text-[10px] text-gray-400">ahmet.yilmaz@gmail.com</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Giriş ➔</span>
                </button>

                <button
                  onClick={() => handleQuickGoogleLogin('Zeynep Kaya', 'zeynep.kaya@gmail.com', 'Zeynep')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 bg-white dark:bg-gray-800 hover:shadow-md transition group text-left"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep&backgroundColor=ffd5dc"
                      className="w-8 h-8 rounded-full border border-gray-200"
                      alt="Google User"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition">
                        Zeynep Kaya olarak devam et
                      </div>
                      <div className="text-[10px] text-gray-400">zeynep.kaya@gmail.com</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Giriş ➔</span>
                </button>
              </div>

              {/* Or custom Gmail address */}
              {!isCustomMode ? (
                <button
                  onClick={() => setIsCustomMode(true)}
                  className="w-full py-2.5 text-xs font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 transition text-center"
                >
                  Farklı bir Gmail adresiyle bağlan ➔
                </button>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-2.5 pt-2 border-t border-[var(--border-color)]">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500">Adınız / Rumuzunuz</label>
                    <input
                      type="text"
                      placeholder="Örn: Caner"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500">Gmail Adresiniz</label>
                    <input
                      type="email"
                      required
                      placeholder="ornek@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(false)}
                      className="w-1/3 py-2 rounded-xl border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md"
                    >
                      Google ile Giriş Yap
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

