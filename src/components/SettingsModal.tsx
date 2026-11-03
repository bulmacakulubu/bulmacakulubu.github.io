import React from 'react';
import { X, Moon, Sun, Volume2, RotateCcw, Globe, VolumeX } from 'lucide-react';
import { Settings, AllStats } from '../types';
import { defaultAllStats } from '../utils/storage';
import { getAchievements } from '../utils/achievements';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
  stats: AllStats;
  onResetStats: () => void;
}

const GAME_NAMES: Record<string, string> = {
  'kelime-bulmaca': 'Kelime Bulmaca',
  'kelime-turetme': 'Kelime Türetme',
  'sozcuk-avi': 'Sözcük Avı',
  'adam-asmaca': 'Adam Asmaca',
  'satranc': 'Satranç',
  'sudoku': 'Sudoku',
  'kelime-zinciri': 'Kelime Zinciri',
  'hafiza-kartlari': 'Hafıza Kartları',
  'nokta-avi': 'Nokta Avı',
  'baglantilar': 'Bağlantılar (Connections)',
  'nonogram': 'Nonogram (Picross)',
  'gunun-bulmacasi': 'Günün Bulmacası',
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  stats,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const totalRecordedGames = Object.values(stats || {}).reduce((acc, s) => acc + (s?.played || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-lg font-bold">Ayarlar</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tercihler bu cihazda saklanır.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Renk Paleti */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">2026 Tasarım Ödüllü Paletler</div>
                <div className="text-xs text-gray-500">Awwwards & FWA ödüllü 5 çağdaş renk armonisi</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              <button
                onClick={() => onUpdateSettings({ ...settings, palette: 'nordic' })}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                  settings.palette === 'nordic' || settings.palette === 'sage'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#2b6146] shadow-xs"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e5ece5]"></span>
                </div>
                <div className="text-xs font-bold leading-tight">Nordic Sage</div>
                <div className="text-[10px] text-gray-400">İskandinav Adaçayı</div>
              </button>

              <button
                onClick={() => onUpdateSettings({ ...settings, palette: 'kyoto' })}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                  settings.palette === 'kyoto' || settings.palette === 'classic'
                    ? 'border-orange-600 bg-orange-50/50 dark:bg-orange-950/30 ring-2 ring-orange-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#c84b31] shadow-xs"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f2e9dc]"></span>
                </div>
                <div className="text-xs font-bold leading-tight">Neo Kyoto</div>
                <div className="text-[10px] text-gray-400">Sıcak Terrakotta</div>
              </button>

              <button
                onClick={() => onUpdateSettings({ ...settings, palette: 'cyber' })}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                  settings.palette === 'cyber'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#4f46e5] shadow-xs"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e7ebfa]"></span>
                </div>
                <div className="text-xs font-bold leading-tight">Cyber Indigo</div>
                <div className="text-[10px] text-gray-400">Elektrik Gece</div>
              </button>

              <button
                onClick={() => onUpdateSettings({ ...settings, palette: 'aurora' })}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                  settings.palette === 'aurora' || settings.palette === 'pastel'
                    ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0d9488] shadow-xs"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#def6ee]"></span>
                </div>
                <div className="text-xs font-bold leading-tight">Aurora</div>
                <div className="text-[10px] text-gray-400">Kristal Zümrüt</div>
              </button>

              <button
                onClick={() => onUpdateSettings({ ...settings, palette: 'monochrome' })}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                  settings.palette === 'monochrome' || settings.palette === 'oled'
                    ? 'border-zinc-800 bg-zinc-100 dark:bg-zinc-900 ring-2 ring-zinc-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-black dark:bg-white border border-gray-400 shadow-xs"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
                </div>
                <div className="text-xs font-bold leading-tight">Monochrome</div>
                <div className="text-[10px] text-gray-400">Minimal & OLED</div>
              </button>
            </div>
          </div>

          {/* Tema */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Tema</div>
              <div className="text-xs text-gray-500">Koyu ya da açık görünüm</div>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  settings.theme === 'dark'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Moon size={14} />
                Koyu
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  settings.theme === 'light'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Sun size={14} />
                Açık
              </button>
            </div>
          </div>

          {/* Kelime Dili */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Kelime Dili</div>
              <div className="text-xs text-gray-500">Kelime Bulmaca, Türetme ve Sözcük Avı</div>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                onClick={() => onUpdateSettings({ ...settings, language: 'tr' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  settings.language === 'tr'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Türkçe
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, language: 'en' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  settings.language === 'en'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Ses Efektleri */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Ses efektleri</div>
              <div className="text-xs text-gray-500">Oyunlardaki tıklama, kazanma ve hata sesleri</div>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                onClick={() => onUpdateSettings({ ...settings, soundEnabled: true })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  settings.soundEnabled
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Volume2 size={14} />
                Açık
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, soundEnabled: false })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  !settings.soundEnabled
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <VolumeX size={14} />
                Kapalı
              </button>
            </div>
          </div>

          {/* Ses Seviyesi */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Ses seviyesi</span>
              <span className="text-xs text-gray-500">{settings.volume}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => onUpdateSettings({ ...settings, volume: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="text-[11px] text-gray-400">Müzik çalar ve radyo ses düzeyi</div>
          </div>

          {/* İstatistikler */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">İstatistikler</div>
                <div className="text-xs text-gray-500">{totalRecordedGames} oyun kayıtlı · tüm oyunların skorları silinir</div>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Tüm istatistikleri sıfırlamak istediğinize emin misiniz?')) {
                    onResetStats();
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/40 rounded-xl text-xs font-medium transition"
              >
                <RotateCcw size={14} />
                Sıfırla
              </button>
            </div>

            {/* Stats Table */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800/60 p-2.5 font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <div>OYUN</div>
                <div className="text-right">OYNANAN</div>
                <div className="text-right">KAZANILAN</div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-40 overflow-y-auto">
                {Object.entries(GAME_NAMES).map(([id, name]) => {
                  const st = (stats && stats[id as keyof AllStats]) || defaultAllStats[id as keyof AllStats] || { played: 0, won: 0 };
                  return (
                    <div key={id} className="grid grid-cols-3 p-2.5 items-center hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                      <div className="font-medium truncate">{name}</div>
                      <div className="text-right text-gray-600 dark:text-gray-400">{st?.played || 0}</div>
                      <div className="text-right text-gray-600 dark:text-gray-400">{st?.won || 0}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Başarımlar */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div>
              <div className="font-medium text-sm">Başarımlar ve Rozetler</div>
              <div className="text-xs text-gray-500">Oynadıkça ve seri yaptıkça kazanılan rozetler</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {getAchievements(stats).map((ach) => (
                <div key={ach.id} className={`p-2.5 rounded-xl border flex items-center gap-3 transition ${ach.unlocked ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-60'}`}>
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <div className="font-bold text-xs">{ach.title}</div>
                    <div className="text-[10px] text-gray-500">{ach.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
