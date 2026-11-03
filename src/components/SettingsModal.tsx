import React, { useState } from 'react';
import { X, Moon, Sun, Volume2, RotateCcw, Globe, VolumeX, FileText, Mail, Palette, ChevronDown, Check, Sparkles } from 'lucide-react';
import { Settings, AllStats, PaletteId } from '../types';
import { defaultAllStats } from '../utils/storage';
import { getAchievements } from '../utils/achievements';

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

  const [isPaletteDropdownOpen, setIsPaletteDropdownOpen] = useState(false);
  const totalRecordedGames = Object.values(stats || {}).reduce((acc, s) => acc + (s?.played || 0), 0);

  const currentPalette = PALETTES.find((p) => p.id === settings.palette) ||
    PALETTES.find((p) => (
      (settings.palette === 'sage' && p.id === 'nordic') ||
      (settings.palette === 'classic' && p.id === 'kyoto') ||
      (settings.palette === 'pastel' && p.id === 'aurora') ||
      (settings.palette === 'oled' && p.id === 'monochrome')
    )) || PALETTES[0];

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
          {/* Renk Paleti Açılır Menü */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  <Palette size={16} className="text-amber-400" />
                  <span>Renk Teması & Palet</span>
                </div>
                <div className="text-xs text-gray-500">Açılır menüden 11 özel tasarım renk temasını seçin</div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-color)]">
                {currentPalette.name}
              </span>
            </div>

            {/* Açılır Menü Tetikleyici (Dropdown Trigger with Palette Icon) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPaletteDropdownOpen(!isPaletteDropdownOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-color)] transition shadow-xs group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--accent-light)] text-[var(--accent-color)] shadow-xs transition-transform group-hover:scale-105 border border-[var(--accent-color)]/20">
                    <Palette size={19} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold flex items-center gap-2">
                      <span>{currentPalette.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-gray-400 font-normal">
                        {currentPalette.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400">{currentPalette.tag}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center -space-x-1 p-1 rounded-lg bg-black/30 border border-white/5">
                    <span className="w-4 h-4 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: currentPalette.bg }} />
                    <span className="w-4 h-4 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: currentPalette.accent }} />
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${isPaletteDropdownOpen ? 'rotate-180 text-[var(--accent-color)]' : ''}`}
                  />
                </div>
              </button>

              {/* Açılır Menü Listesi */}
              {isPaletteDropdownOpen && (
                <div className="mt-2 p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl space-y-3 animate-fadeIn max-h-72 overflow-y-auto">
                  {(['Lüks & Metalik', 'Doğal & Kristal', 'Modern & Dijital'] as const).map((category) => (
                    <div key={category} className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 pt-1 flex items-center gap-1.5">
                        <Sparkles size={11} className="text-amber-400" />
                        <span>{category}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {PALETTES.filter((p) => p.category === category).map((p) => {
                          const isSelected = currentPalette.id === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                onUpdateSettings({
                                  ...settings,
                                  palette: p.id,
                                  theme: p.darkOnly ? 'dark' : settings.theme,
                                });
                                setIsPaletteDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between p-2 rounded-lg border text-left transition cursor-pointer ${
                                isSelected
                                  ? 'border-[var(--accent-color)] bg-[var(--accent-light)] ring-1 ring-[var(--accent-color)]/30'
                                  : 'border-transparent hover:bg-[var(--bg-secondary)]'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="flex items-center -space-x-1 shrink-0">
                                  <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: p.bg }} />
                                  <span className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-xs" style={{ backgroundColor: p.accent }} />
                                </div>
                                <div className="truncate">
                                  <div className="text-xs font-semibold truncate">{p.name}</div>
                                  <div className="text-[10px] text-gray-400 truncate">{p.tag}</div>
                                </div>
                              </div>
                              {isSelected && <Check size={14} className="text-[var(--accent-color)] shrink-0 ml-1.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hızlı Seçim Rozetleri (Quick Select Pills) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              {PALETTES.map((p) => {
                const isSelected = currentPalette.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    title={`${p.name} (${p.tag})`}
                    onClick={() => {
                      onUpdateSettings({
                        ...settings,
                        palette: p.id,
                        theme: p.darkOnly ? 'dark' : settings.theme,
                      });
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs shrink-0 border transition cursor-pointer ${
                      isSelected
                        ? 'border-[var(--accent-color)] bg-[var(--accent-light)] text-[var(--accent-color)] font-bold shadow-2xs'
                        : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: p.accent }} />
                    <span className="truncate max-w-[100px]">{p.name}</span>
                  </button>
                );
              })}
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
