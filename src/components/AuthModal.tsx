import React, { useState, useEffect } from 'react';
import { X, LogOut, CheckCircle2, Cloud, ShieldCheck, Mail, User, Sparkles, KeyRound } from 'lucide-react';
import { UserProfile, AllStats } from '../types';
import { loginWithGoogleData, loginWithGoogleCredential, signOutUser, GOOGLE_AUTH_CONFIG } from '../utils/auth';

declare global {
  interface Window {
    google?: any;
  }
}

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
  const [syncSuccess, setSyncSuccess] = useState(false);

  const [googleClientId, setGoogleClientId] = useState(() => {
    return localStorage.getItem('bulmaca_google_client_id') || GOOGLE_AUTH_CONFIG.clientId || '';
  });
  const [tempClientId, setTempClientId] = useState(googleClientId);
  const [showConfigId, setShowConfigId] = useState(false);

  useEffect(() => {
    if (!isOpen || user.provider === 'google') return;

    const renderButton = () => {
      if (window.google?.accounts?.id && googleClientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response: any) => {
              if (response.credential) {
                const profile = loginWithGoogleCredential(response.credential);
                if (profile) {
                  onUserChange(profile);
                  setSyncSuccess(true);
                  setTimeout(() => {
                    setSyncSuccess(false);
                    onClose();
                  }, 1200);
                }
              }
            },
          });

          const btnContainer = document.getElementById('google-btn-container');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              width: 320,
              text: 'signin_with',
              shape: 'pill',
            });
          }
          return true;
        } catch (e) {
          console.warn('Google Sign In init failed', e);
        }
      }
      return false;
    };

    if (!renderButton()) {
      const interval = setInterval(() => {
        if (renderButton()) {
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isOpen, googleClientId, user.provider, onClose, onUserChange]);

  if (!isOpen) return null;

  const totalWon = Object.values(stats).reduce((acc, s) => acc + (s.won || 0), 0);
  const totalPlayed = Object.values(stats).reduce((acc, s) => acc + (s.played || 0), 0);
  const maxStreak = Math.max(...Object.values(stats).map((s) => s.maxStreak || 0), 0);

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const name = customName.trim() || customEmail.split('@')[0];
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a73e8`;
    const updated = loginWithGoogleData({ name, email: customEmail, avatar });
    onUserChange(updated);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  const handleSignOut = () => {
    const guest = signOutUser(user.email);
    onUserChange(guest);
    setCustomEmail('');
    setCustomName('');
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
              <div className="text-center py-1">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 shadow-xs">
                  <User size={24} />
                </div>
                <h3 className="font-bold text-base text-[var(--text-primary)]">Giriş Yapın veya Profil Oluşturun</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                  Skorlarınızı korumak, liderlik tablosunda yer almak ve 1v1 maçlara katılmak için profilinizi belirleyin.
                </p>
              </div>

              {/* Official Google Sign-In Container */}
              <div className="flex flex-col items-center justify-center pt-1 space-y-2">
                <div id="google-btn-container" className="flex justify-center w-full min-h-[44px]"></div>

                {!googleClientId && (
                  <div className="w-full text-center">
                    <button
                      type="button"
                      onClick={() => setShowConfigId(!showConfigId)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <KeyRound size={12} />
                      <span>{showConfigId ? 'İptal' : 'Google Client ID Tanımla'}</span>
                    </button>
                  </div>
                )}

                {showConfigId && (
                  <div className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-[var(--border-color)] text-xs space-y-2 text-left">
                    <div className="font-bold text-gray-700 dark:text-gray-300">
                      Google Cloud Web Client ID:
                    </div>
                    <input
                      type="text"
                      placeholder="123456789-xxx.apps.googleusercontent.com"
                      value={tempClientId}
                      onChange={(e) => setTempClientId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem('bulmaca_google_client_id', tempClientId.trim());
                        setGoogleClientId(tempClientId.trim());
                        setShowConfigId(false);
                      }}
                      className="w-full py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs cursor-pointer"
                    >
                      Kaydet ve Butonu Göster
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center my-2">
                <div className="flex-1 border-t border-[var(--border-color)]"></div>
                <span className="px-2 text-[10px] font-bold text-gray-400 uppercase">veya Oyuncu Adı Belirle</span>
                <div className="flex-1 border-t border-[var(--border-color)]"></div>
              </div>

              <form onSubmit={handleCustomGoogleSubmit} className="space-y-3 pt-0">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Oyuncu Adı / Rumuz</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: BulmacaUstasi"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">E-posta Adresi (İsteğe Bağlı)</label>
                  <input
                    type="email"
                    placeholder="ornek@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[var(--accent-color)] hover:opacity-90 text-[var(--accent-contrast)] font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <CheckCircle2 size={15} />
                  <span>Profili Kaydet ve Oyna</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

