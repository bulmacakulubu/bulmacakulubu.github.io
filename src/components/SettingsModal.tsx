import React, { useState } from 'react';
import { X, Moon, Sun, Volume2, RotateCcw, Globe, VolumeX, FileText, Mail, Palette, ChevronDown, Check, Users, Eye, Activity, TrendingUp, Smartphone, Award, HardDrive, Calendar } from 'lucide-react';
import { Settings, AllStats, PaletteId } from '../types';
import { defaultAllStats } from '../utils/storage';
import { getAchievements } from '../utils/achievements';
import { getDeviceStats, DeviceStats } from '../utils/visitorStats';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
  stats: AllStats;
  onResetStats: () => void;
  onOpenLegal?: () => void;
}

export interface PaletteItem {
  id: PaletteId;
  name: string;
  tag: string;
  category: 'Lüks & Metalik' | 'Doğal & Kristal' | 'Modern & Dijital';
  bg: string;
  accent: string;
  darkOnly?: boolean;
}

export const PALETTES: PaletteItem[] = [
  // Lüks & Metalik
  {
    id: 'rose-bronze',
    name: 'Gül Bronzu & Bakır',
    tag: 'Füme, Bakır & Gül Altın',
    category: 'Lüks & Metalik',
    bg: '#1e1e26',
    accent: '#c28e6c',
    darkOnly: true,
  },
  {
    id: 'champagne-carbon',
    name: 'Şampanya & Karbon',
    tag: 'Karbon & Şampanya Altını',
    category: 'Lüks & Metalik',
    bg: '#23262d',
    accent: '#c9bbae',
    darkOnly: true,
  },
  {
    id: 'royal-amber',
    name: 'Kraliyet Kehribarı',
    tag: 'Gece Mavisi & Kehribar',
    category: 'Lüks & Metalik',
    bg: '#121620',
    accent: '#df9858',
    darkOnly: true,
  },
  {
    id: 'slate-rose',
    name: 'Grafit & Gül Altın',
    tag: 'Füme & Rose Gold',
    category: 'Lüks & Metalik',
    bg: '#181b1f',
    accent: '#e0a96d',
    darkOnly: true,
  },
  {
    id: 'obsidian',
    name: 'Obsidiyen & Altın',
    tag: 'Siyah & 24K Altın',
    category: 'Lüks & Metalik',
    bg: '#0a0a0c',
    accent: '#d4af37',
    darkOnly: true,
  },
  // Doğal & Kristal
  {
    id: 'emerald',
    name: 'Zümrüt & Titan',
    tag: 'Koyu Zümrüt & Titan Altın',
    category: 'Doğal & Kristal',
    bg: '#081a12',
    accent: '#c5a059',
    darkOnly: true,
  },
  {
    id: 'nordic',
    name: 'Nordic Sage',
    tag: 'İskandinav Adaçayı & Huş',
    category: 'Doğal & Kristal',
    bg: '#2b6146',
    accent: '#e5ece5',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    tag: 'Kristal Zümrüt & Turkuaz',
    category: 'Doğal & Kristal',
    bg: '#0d9488',
    accent: '#2dd4bf',
  },
  // Modern & Dijital
  {
    id: 'kyoto',
    name: 'Neo Kyoto',
    tag: 'Sıcak Terrakotta & Gece',
    category: 'Modern & Dijital',
    bg: '#c84b31',
    accent: '#f2e9dc',
  },
  {
    id: 'cyber',
    name: 'Cyber Indigo',
    tag: 'Elektrik Çivit Mavisi',
    category: 'Modern & Dijital',
    bg: '#4f46e5',
    accent: '#e7ebfa',
  },
  {
    id: 'monochrome',
    name: 'Monochrome OLED',
    tag: 'Minimal & Saf Karartma',
    category: 'Modern & Dijital',
    bg: '#000000',
    accent: '#fafafa',
  },
];

const GAME_NAMES: Record<string, string> = {
  'kelime-bulmaca': 'Kelime Bulmaca',
  'kare-bulmaca': 'Çengel / Kare Bulmaca',
  'anagram': 'Anagram Çözücü',
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
  onOpenLegal,
}) => {
  if (!isOpen) return null;

  const [deviceStats] = useState<DeviceStats>(() => getDeviceStats(stats));
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
          {/* Dinlendirici Renk Temaları Seçici */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette size={16} className="text-[var(--accent-color)]" />
                <span className="font-bold text-sm text-[var(--text-primary)]">
                  {settings.language === 'tr' ? 'Dinlendirici Renk Teması' : 'Relaxing Color Theme'}
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                {settings.language === 'tr' ? 'Göz Ergonomisi' : 'Eye Comfort'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'warm-paper' as PaletteId,
                  nameTr: 'Sıcak Kağıt & Parşömen',
                  nameEn: 'Warm Paper & Sepia',
                  badgeTr: 'Varsayılan',
                  badgeEn: 'Default',
                  descTr: 'Fildişi zemin, kitap kağıdı ve yumuşak mürekkep kömürü.',
                  descEn: 'Relaxing ivory parchment and soft charcoal ink.',
                  colors: ['#F5F2EB', '#FFFFFF', '#8B5E3C', '#24211E'],
                },
                {
                  id: 'sage' as PaletteId,
                  nameTr: 'Huzurlu Adaçayı & Nane',
                  nameEn: 'Sage & Zen Earth',
                  badgeTr: 'Doğal',
                  badgeEn: 'Zen',
                  descTr: 'Ferah adaçayı yeşili, okaliptüs ve buğulu orman tonları.',
                  descEn: 'Soothing misty sage green and calming botanical hues.',
                  colors: ['#EFF4EF', '#FFFFFF', '#386B4F', '#1B2E24'],
                },
                {
                  id: 'latte' as PaletteId,
                  nameTr: 'Sütlü Kahve & Ahşap',
                  nameEn: 'Warm Latte & Wood',
                  badgeTr: 'Nostaljik',
                  badgeEn: 'Cozy',
                  descTr: 'Sıcak badem, karamel ve ahşap dokulu nostaljik kafe havası.',
                  descEn: 'Warm almond milk, roasted caramel, and wooden board comfort.',
                  colors: ['#F6F0E7', '#FFFFFF', '#AF6B31', '#2B2017'],
                },
                {
                  id: 'nordic-slate' as PaletteId,
                  nameTr: 'İskandinav Arduvazı',
                  nameEn: 'Nordic Slate',
                  badgeTr: 'Koyu Mod',
                  badgeEn: 'Dark',
                  descTr: 'Zifiri siyah yerine göz kamaştırmayan yumuşak dağ taşı ve kehribar.',
                  descEn: 'Eye-friendly soft slate gray and warm golden amber.',
                  colors: ['#181B20', '#272D37', '#EBCB8B', '#EDF1F7'],
                },
              ].map((themeItem) => {
                const isSelected = (settings.palette || 'warm-paper') === themeItem.id;

                return (
                  <button
                    key={themeItem.id}
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        palette: themeItem.id,
                        theme: themeItem.id === 'nordic-slate' ? 'dark' : 'light',
                      })
                    }
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 relative group ${
                      isSelected
                        ? 'border-[var(--accent-color)] bg-[var(--accent-light)] shadow-sm ring-1 ring-[var(--accent-color)]/50'
                        : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-color)]/50 hover:bg-[var(--bg-card)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-[var(--text-primary)]">
                          {settings.language === 'tr' ? themeItem.nameTr : themeItem.nameEn}
                        </span>
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-[var(--accent-color)] text-[var(--accent-contrast)] flex items-center justify-center shrink-0">
                            <Check size={11} strokeWidth={3} />
                          </div>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] font-medium">
                            {settings.language === 'tr' ? themeItem.badgeTr : themeItem.badgeEn}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] leading-snug text-[var(--text-secondary)]">
                        {settings.language === 'tr' ? themeItem.descTr : themeItem.descEn}
                      </p>
                    </div>

                    {/* Canlı Renk Noktaları */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-[var(--border-color)]/40">
                      {themeItem.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/15 dark:border-white/20 shadow-2xs"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
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

          {/* Cihaz ve Kullanım İstatistikleri */}
          <div className="pt-2 border-t border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone size={15} className="text-zinc-400" />
                <div className="font-medium text-sm">
                  {settings.language === 'tr' ? 'Cihaz & Kullanım Bilgileri' : 'Device & Usage Statistics'}
                </div>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-2xs">
                <HardDrive size={11} className="text-zinc-400" />
                <span>{settings.language === 'tr' ? 'Yerel Hafıza' : 'Local Storage'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Bu Cihazdaki Oturum Sayısı */}
              <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>{settings.language === 'tr' ? 'Cihaz Ziyaretiniz' : 'Device Visits'}</span>
                  <Calendar size={14} className="text-zinc-400" />
                </div>
                <div className="text-base font-bold font-mono text-amber-400 mt-1">
                  {deviceStats.userVisitCount}. {settings.language === 'tr' ? 'ziyaret' : 'visit'}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                  {settings.language === 'tr' ? `İlk: ${deviceStats.userFirstVisit}` : `First: ${deviceStats.userFirstVisit}`}
                </div>
              </div>

              {/* Çözülen Toplam Bulmaca */}
              <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>{settings.language === 'tr' ? 'Oynanan Bulmaca' : 'Puzzles Played'}</span>
                  <Award size={14} className="text-zinc-400" />
                </div>
                <div className="text-base font-bold font-mono text-[var(--text-primary)] mt-1">
                  {deviceStats.totalPlayed} {settings.language === 'tr' ? 'oyun' : 'games'}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  {settings.language === 'tr' ? 'Bu cihazda kayıtlı' : 'Recorded locally'}
                </div>
              </div>

              {/* Kazanılan Bulmaca */}
              <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>{settings.language === 'tr' ? 'Kazanılan Bulmaca' : 'Puzzles Won'}</span>
                  <TrendingUp size={14} className="text-emerald-400" />
                </div>
                <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                  {deviceStats.totalWon} {settings.language === 'tr' ? 'zafer' : 'wins'}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  {settings.language === 'tr' ? `%${deviceStats.winRate} kazanma oranı` : `${deviceStats.winRate}% win rate`}
                </div>
              </div>

              {/* Veri Saklama ve Güvenlik */}
              <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>{settings.language === 'tr' ? 'Veri Deposu' : 'Data Storage'}</span>
                  <HardDrive size={14} className="text-zinc-400" />
                </div>
                <div className="text-xs font-bold text-zinc-200 mt-1">
                  {settings.language === 'tr' ? 'Tarayıcı Yerel' : 'Local Browser'}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                  {settings.language === 'tr' ? 'Sunucuya gönderilmez' : 'Stored on device'}
                </div>
              </div>
            </div>
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

          {/* Yasal Bilgilendirme ve KVKK */}
          {onOpenLegal && (
            <div className="pt-3 border-t border-[var(--border-color)]">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Yasal Uyum ve Şeffaflık
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenLegal();
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-[var(--border-color)] bg-gray-50/60 dark:bg-gray-800/40 hover:bg-[var(--accent-light)] hover:text-[var(--accent-color)] text-xs font-bold text-gray-700 dark:text-gray-300 transition flex items-center justify-between cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-blue-500 group-hover:text-[var(--accent-color)]" />
                  <span>Kullanıcı Sözleşmesi, KVKK & Gizlilik Politikası</span>
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-[var(--accent-color)] font-medium">Oku ➔</span>
              </button>
            </div>
          )}

          {/* Geliştirici ve İletişim Bilgisi */}
          <div className="pt-3 border-t border-[var(--border-color)] text-center text-xs space-y-1">
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              Bu site <span className="font-bold text-[var(--accent-color)]">Hakan Ulu</span> tarafından geliştirilmiştir.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <Mail size={13} className="text-blue-500" />
              <span>İletişim için:</span>
              <a
                href="mailto:hknlaauu1@gmail.com"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                hknlaauu1@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
