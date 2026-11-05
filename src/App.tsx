import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameId, Settings, AllStats, Track, UserProfile, MultiplayerSession } from './types';
import { loadStats, saveStats, updateGameStats, loadSettings, saveSettings } from './utils/storage';
import { loadUserProfile, saveUserProfile } from './utils/auth';
import { multiplayerService, MultiplayerMessage } from './utils/multiplayer';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { FlyingBird } from './components/FlyingBird';
import { FloatingMusicStation } from './components/FloatingMusicStation';
import { BUILT_IN_TRACKS, TURKISH_RADIO_STATIONS, startAmbientMusic, stopAmbientMusic, setAmbientVolume, playStreamTrack, stopStreamTrack } from './utils/audio';
import { Music, Radio, Disc, FolderOpen, Sparkles, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, ListMusic, Users, ShieldCheck, Crown, Settings as SettingsIcon, FileText, Maximize2, Minimize2, Scan, Eye, EyeOff, Trophy, Boxes, Grid3X3, Type, LayoutGrid, Shuffle, Search, Grid, Layers, UserX } from 'lucide-react';
import { isUserPremium } from './utils/revenueCat';
import { checkUrlForVipActivation } from './utils/shopier';
import confetti from 'canvas-confetti';
import { AdSenseBanner } from './components/AdSenseBanner';
import { RemoveAdsModal } from './components/RemoveAdsModal';
import { LegalModal } from './components/LegalModal';
import { LeaderboardModal } from './components/LeaderboardModal';

import { KelimeBulmaca } from './games/KelimeBulmaca';
import { KareBulmaca } from './games/KareBulmaca';
import { Anagram } from './games/Anagram';
import { KelimeTuretme } from './games/KelimeTuretme';
import { SozcukAvi } from './games/SozcukAvi';
import { AdamAsmaca } from './games/AdamAsmaca';
import { Satranc } from './games/Satranc';
import { Sudoku } from './games/Sudoku';
import { KelimeZinciri } from './games/KelimeZinciri';
import { HafizaKartlari } from './games/HafizaKartlari';
import { NoktaAvi } from './games/NoktaAvi';
import { Baglantilar } from './games/Baglantilar';
import { Nonogram } from './games/Nonogram';
import { DailyPuzzleView } from './components/DailyPuzzleView';

const GAME_HEADER_INFO: Record<GameId, { tr: { title: string; desc: string }; en: { title: string; desc: string } }> = {
  'kelime-bulmaca': {
    tr: { title: 'Kelime Bulmaca', desc: '5, 7 veya 9 harfli gizli kelimeyi 6 denemede bul.' },
    en: { title: 'Word Puzzle', desc: 'Guess the hidden 5, 7, or 9 letter secret word in 6 attempts.' },
  },
  'kare-bulmaca': {
    tr: { title: 'Kare / Çengel Bulmaca', desc: 'Numaralı ızgarayı yatay ve dikey ipuçlarıyla kelime kelime çöz.' },
    en: { title: 'Crossword Puzzle', desc: 'Solve the numbered crossword grid with across and down clues.' },
  },
  'anagram': {
    tr: { title: 'Anagram Çözücü', desc: 'Karışık harf tekerleğinden tüm hedef kelimeleri türet ve seviyeyi tamamla.' },
    en: { title: 'Anagram Solver', desc: 'Form target words from scrambled letters to complete the board.' },
  },
  'kelime-turetme': {
    tr: { title: 'Kelime Türetme', desc: '7 harften Scrabble puan kurallarına göre kelimeler türet.' },
    en: { title: 'Word Builder', desc: 'Form high-scoring words from 7 letter tiles with Scrabble values.' },
  },
  'sozcuk-avi': {
    tr: { title: 'Sözcük Avı', desc: 'Izgaraya gizlenmiş tematik kelimeleri harf denizinde bul.' },
    en: { title: 'Word Search', desc: 'Find all themed words hidden across the letter grid.' },
  },
  'adam-asmaca': {
    tr: { title: 'Adam Asmaca', desc: 'Kategori ve tek kelimelik ipucuyla gizli kelimeyi bul.' },
    en: { title: 'Hangman', desc: 'Find the secret word with category and single-word clues before lives run out.' },
  },
  'satranc': {
    tr: { title: 'Satranç', desc: 'Bilgisayara karşı, yerel 2 kişi veya 1v1 çevrimiçi satranç.' },
    en: { title: 'Chess', desc: 'Play against AI, pass-and-play 2-player or 1v1 online live chess.' },
  },
  'sudoku': {
    tr: { title: 'Sudoku', desc: '9x9 ızgarayı satır, sütun ve kutularda 1-9 rakamlarıyla tamamla.' },
    en: { title: 'Sudoku', desc: 'Fill the 9x9 grid with numbers 1-9 without duplicates in rows or boxes.' },
  },
  'kelime-zinciri': {
    tr: { title: 'Kelime Zinciri', desc: 'Son harfle başlayan yeni kelimelerle en uzun zinciri kur.' },
    en: { title: 'Word Chain', desc: 'Chain words together where each begins with the preceding last letter.' },
  },
  'hafiza-kartlari': {
    tr: { title: 'Hafıza Kartları', desc: 'Kapalı kart çiftlerini en az hamlede ve sürede eşleştir.' },
    en: { title: 'Memory Cards', desc: 'Match pairs of hidden symbol cards in minimum moves and time.' },
  },
  'nokta-avi': {
    tr: { title: 'Nokta Avı', desc: '30 saniyede yanıp sönen noktaları yakala, bombalardan kaçın.' },
    en: { title: 'Dot Hunt', desc: 'Click popping targets within 30 seconds and avoid hazard bombs.' },
  },
  'baglantilar': {
    tr: { title: 'Bağlantılar (Connections)', desc: '16 kelimeden oluşan 4 gizli ortak grubu bul.' },
    en: { title: 'Connections', desc: 'Group 16 words into 4 distinct sets of 4 that share a common link.' },
  },
  'nonogram': {
    tr: { title: 'Nonogram (Piksel)', desc: 'Sayı ipuçlarına göre kareleri boyayıp piksel resmini ortaya çıkar.' },
    en: { title: 'Nonogram (Picross)', desc: 'Deduce row and column number clues to reveal pixel art.' },
  },
  'gunun-bulmacasi': {
    tr: { title: 'Günün Bulmacası', desc: 'Her 24 saatte bir yenilenen rastgele bulmaca ve skor tablosu.' },
    en: { title: 'Daily Puzzle', desc: 'Daily randomized synchronized puzzle refreshed every 24 hours.' },
  },
};

const GAME_ICONS: Record<GameId, React.ComponentType<{ size?: number; className?: string }>> = {
  'gunun-bulmacasi': Trophy,
  'baglantilar': Boxes,
  'nonogram': Grid3X3,
  'kelime-bulmaca': Type,
  'kare-bulmaca': LayoutGrid,
  'anagram': Shuffle,
  'kelime-turetme': FileText,
  'sozcuk-avi': Search,
  'satranc': Crown,
  'sudoku': Grid,
  'kelime-zinciri': Sparkles,
  'hafiza-kartlari': Layers,
  'adam-asmaca': UserX,
  'nokta-avi': Sparkles,
};

export default function App() {
  const [activeGame, setActiveGame] = useState<GameId>('kelime-bulmaca');
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [stats, setStats] = useState<AllStats>(loadStats());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // User & Google Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const loaded = loadUserProfile();
    return { ...loaded, isPremium: isUserPremium(loaded) };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRemoveAdsOpen, setIsRemoveAdsOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Multiplayer state
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [multiplayerSession, setMultiplayerSession] = useState<MultiplayerSession | null>(null);
  const [incomingMultiplayerMessage, setIncomingMultiplayerMessage] = useState<MultiplayerMessage | null>(null);

  // Check URL parameters on mount (1v1 invites and Shopier returns)
  useEffect(() => {
    // Check if user returned from Shopier payment
    if (checkUrlForVipActivation()) {
      setCurrentUser((prev) => ({ ...prev, isPremium: true }));
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
    }

    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    const game = params.get('game') as GameId | null;
    if (room) {
      if (game) setActiveGame(game);
      setIsMultiplayerOpen(true);
    }
  }, []);

  // Türkiye Canlı Radyoları ve Yerel Müzikler (Tamamen İzole ve Ayrı)
  const [radioTracks] = useState<Track[]>(() => TURKISH_RADIO_STATIONS);
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [activeMusicTab, setActiveMusicTab] = useState<'radio' | 'local'>('radio');
  const [currentTrackId, setCurrentTrackId] = useState<string>(() => TURKISH_RADIO_STATIONS[0]?.id || '');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [radioStatus, setRadioStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [playbackTime, setPlaybackTime] = useState<{ current: number; duration: number }>({ current: 0, duration: 0 });
  const [isFloatingMusicOpen, setIsFloatingMusicOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Hybrid Focus Mode (Zen Theater + Hardware Fullscreen)
  const [isZenMode, setIsZenMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarPeeking, setIsSidebarPeeking] = useState(false);
  const [hideGameStats, setHideGameStats] = useState(false);

  const toggleZenMode = () => {
    setIsZenMode((prev) => {
      const next = !prev;
      if (next) {
        setHideGameStats(true); // Odak modunda istatistikler ve kalabalık doğrudan gizlenir
      }
      return next;
    });
    setIsSidebarPeeking(false);
  };

  const toggleHideStats = () => {
    setHideGameStats((prev) => !prev);
  };

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.error(err));
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZenMode) {
          setIsZenMode(false);
          setIsSidebarPeeking(false);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isZenMode]);

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-palette', 'monochrome');

    // Bauhaus Mono Zinc: Unified single dark mode enforcement
    document.body.className = document.body.className
      .replace(/theme-[\w-]+/g, '')
      .trim();
    document.body.classList.add('theme-monochrome');
    document.documentElement.classList.add('dark');

    const effectiveVolume = settings.soundEnabled ? settings.volume / 100 : 0;
    setAmbientVolume(effectiveVolume);
    if (audioRef.current) {
      audioRef.current.muted = !settings.soundEnabled;
      audioRef.current.volume = effectiveVolume;
    }
  }, [settings]);

  const handleToggleSound = () => {
    setSettings((prev) => {
      const nextSound = !prev.soundEnabled;
      return {
        ...prev,
        soundEnabled: nextSound,
        volume: nextSound && prev.volume === 0 ? 50 : prev.volume,
      };
    });
  };

  const handleGameEnd = (gameId: GameId, won: boolean, scoreOrTime?: number) => {
    const updated = updateGameStats(gameId, won, scoreOrTime);
    setStats(updated);
  };

  const toggleLanguage = () => {
    const nextLang = settings.language === 'tr' ? 'en' : 'tr';
    setSettings({ ...settings, language: nextLang });
  };

  const handleAddLocalTracks = (newTracks: Track[]) => {
    setLocalTracks((prev) => [...prev, ...newTracks]);
    setActiveMusicTab('local');
    if (newTracks.length > 0 && !isPlayingMusic) {
      setCurrentTrackId(newTracks[0].id);
    }
  };

  const handleRemoveLocalTrack = (id: string) => {
    setLocalTracks((prev) => prev.filter((t) => t.id !== id));
    if (currentTrackId === id) {
      if (isPlayingMusic && audioRef.current) {
        stopStreamTrack(audioRef.current);
        setIsPlayingMusic(false);
      }
      setCurrentTrackId(radioTracks[0]?.id || '');
    }
  };

  const handleClearLocalTracks = () => {
    if (currentTrack?.id.startsWith('local_') && isPlayingMusic && audioRef.current) {
      stopStreamTrack(audioRef.current);
      setIsPlayingMusic(false);
    }
    setLocalTracks([]);
    setActiveMusicTab('radio');
    setCurrentTrackId(radioTracks[0]?.id || '');
  };

  const currentTrack = useMemo(() => {
    const all = [...radioTracks, ...localTracks];
    const found = all.find((t) => t.id === currentTrackId);
    if (found) return found;
    return activeMusicTab === 'local' && localTracks.length > 0 ? localTracks[0] : radioTracks[0];
  }, [radioTracks, localTracks, currentTrackId, activeMusicTab]);

  const isCurrentLocal = currentTrack?.id.startsWith('local_') || false;

  const playCurrentTrack = async (track: Track) => {
    const effectiveVolume = settings.soundEnabled ? settings.volume / 100 : 0;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    audioRef.current.muted = !settings.soundEnabled;
    audioRef.current.volume = effectiveVolume;

    // Local track progress tracking
    audioRef.current.ontimeupdate = () => {
      if (audioRef.current && track.id.startsWith('local_')) {
        setPlaybackTime({
          current: audioRef.current.currentTime || 0,
          duration: audioRef.current.duration || 0,
        });
      }
    };

    audioRef.current.onended = () => {
      if (track.id.startsWith('local_')) {
        handleNextTrack();
      }
    };

    if (track.audioUrl) {
      stopAmbientMusic();
      setRadioStatus('loading');
      await playStreamTrack(audioRef.current, track.audioUrl, (status) => {
        setRadioStatus(status);
        if (status === 'playing') {
          setIsPlayingMusic(true);
        } else if (status === 'error') {
          setIsPlayingMusic(false);
        }
      });
    } else {
      // Built-in synthetic ambient track
      if (audioRef.current) {
        stopStreamTrack(audioRef.current);
      }
      const idx = BUILT_IN_TRACKS.findIndex((t) => t.id === track.id);
      startAmbientMusic(effectiveVolume, Math.max(0, idx));
      setRadioStatus('playing');
      setIsPlayingMusic(true);
    }
  };

  const handleSeek = (seconds: number) => {
    if (audioRef.current && isCurrentLocal) {
      audioRef.current.currentTime = seconds;
      setPlaybackTime((prev) => ({ ...prev, current: seconds }));
    }
  };

  const handleTogglePlayMusic = () => {
    if (!currentTrack) return;

    if (isPlayingMusic) {
      if (audioRef.current) {
        stopStreamTrack(audioRef.current);
      }
      stopAmbientMusic();
      setIsPlayingMusic(false);
      setRadioStatus('idle');
    } else {
      if (!settings.soundEnabled) {
        setSettings((prev) => ({ ...prev, soundEnabled: true, volume: prev.volume === 0 ? 50 : prev.volume }));
      }
      playCurrentTrack(currentTrack);
      setIsPlayingMusic(true);
    }
  };

  const handleSelectTrack = (track: Track) => {
    setCurrentTrackId(track.id);
    if (track.id.startsWith('local_')) {
      setActiveMusicTab('local');
    } else {
      setActiveMusicTab('radio');
    }
    playCurrentTrack(track);
    setIsPlayingMusic(true);
  };

  const handleNextTrack = () => {
    if (isCurrentLocal) {
      if (localTracks.length === 0) return;
      const idx = localTracks.findIndex((t) => t.id === currentTrackId);
      const nextIdx = (idx + 1) % localTracks.length;
      const nextTrack = localTracks[nextIdx];
      setCurrentTrackId(nextTrack.id);
      if (isPlayingMusic) {
        playCurrentTrack(nextTrack);
      }
    } else {
      if (radioTracks.length === 0) return;
      const idx = radioTracks.findIndex((t) => t.id === currentTrackId);
      const nextIdx = (idx + 1) % radioTracks.length;
      const nextTrack = radioTracks[nextIdx];
      setCurrentTrackId(nextTrack.id);
      if (isPlayingMusic) {
        playCurrentTrack(nextTrack);
      }
    }
  };

  const handlePrevTrack = () => {
    if (isCurrentLocal) {
      if (localTracks.length === 0) return;
      const idx = localTracks.findIndex((t) => t.id === currentTrackId);
      const prevIdx = (idx - 1 + localTracks.length) % localTracks.length;
      const prevTrack = localTracks[prevIdx];
      setCurrentTrackId(prevTrack.id);
      if (isPlayingMusic) {
        playCurrentTrack(prevTrack);
      }
    } else {
      if (radioTracks.length === 0) return;
      const idx = radioTracks.findIndex((t) => t.id === currentTrackId);
      const prevIdx = (idx - 1 + radioTracks.length) % radioTracks.length;
      const prevTrack = radioTracks[prevIdx];
      setCurrentTrackId(prevTrack.id);
      if (isPlayingMusic) {
        playCurrentTrack(prevTrack);
      }
    }
  };
  const currentStats = stats[activeGame] || { played: 0, won: 0, streak: 0, maxStreak: 0 };
  const winRate = currentStats.played > 0 ? Math.round((currentStats.won / currentStats.played) * 100) : 0;
  const bestRecord =
    activeGame === 'kelime-turetme' || activeGame === 'nokta-avi'
      ? currentStats.bestScore ?? '—'
      : currentStats.bestTime
      ? `${currentStats.bestTime}s`
      : '—';

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans relative" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <FlyingBird />

      {/* Floating HUD Capsule in Zen / Focus Mode */}
      {isZenMode && (
        <aside aria-label="Odak Modu Kontrolleri" className="fixed top-3 right-4 z-50 flex items-center gap-2 bg-[var(--bg-card)]/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[var(--border-color)] shadow-xl animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--accent-color)' }}>
            <Scan className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {GAME_HEADER_INFO[activeGame]?.[settings.language === 'en' ? 'en' : 'tr']?.title || activeGame}
            </span>
          </div>
          <div className="h-4 w-px border-r border-[var(--border-color)]"></div>
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="p-1.5 rounded-lg text-xs transition cursor-pointer hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:opacity-90"
            title={settings.language === 'tr' ? 'Liderlik Sıralaması & Skor Tablosu' : 'Leaderboard & Rankings'}
          >
            <Trophy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleNativeFullscreen}
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
              isFullscreen
                ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={isFullscreen ? (settings.language === 'tr' ? 'Tam Ekrandan Çık (F11)' : 'Exit Fullscreen (F11)') : (settings.language === 'tr' ? 'Tam Ekran (F11)' : 'Fullscreen (F11)')}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleZenMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-contrast)' }}
            title={settings.language === 'tr' ? 'Normal Görünüme Dön (ESC)' : 'Exit Focus (ESC)'}
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>ESC</span>
          </button>
        </aside>
      )}

      {/* Zen Mode Hover Peek Trigger Zone on Left Screen Edge */}
      {isZenMode && (
        <div
          onMouseEnter={() => setIsSidebarPeeking(true)}
          className="fixed left-0 top-0 bottom-0 w-3 z-40 cursor-e-resize hover:bg-[var(--accent-color)]/20 transition-colors"
          title={settings.language === 'tr' ? 'Menüyü açmak için buraya gelin' : 'Hover to reveal sidebar'}
        />
      )}

      {/* Sidebar with slide drawer transition in Zen mode */}
      <div
        className={`transition-all duration-300 ease-in-out shrink-0 ${
          isZenMode
            ? `fixed inset-y-0 left-0 z-50 ${isSidebarPeeking ? 'translate-x-0 shadow-2xl' : '-translate-x-full pointer-events-none'}`
            : 'relative z-20'
        }`}
        onMouseLeave={() => {
          if (isZenMode) setIsSidebarPeeking(false);
        }}
      >
        <Sidebar
          activeGame={activeGame}
          onSelectGame={(g) => setActiveGame(g)}
          language={settings.language}
          onToggleLanguage={toggleLanguage}
          onOpenSettings={() => setIsSettingsOpen(true)}
          volume={settings.volume}
          soundEnabled={settings.soundEnabled}
          tracks={[...radioTracks, ...localTracks]}
          onAddTracks={handleAddLocalTracks}
          currentTrackId={currentTrackId}
          onSelectTrack={(id) => {
            setCurrentTrackId(id);
            setIsPlayingMusic(true);
          }}
          isPlaying={isPlayingMusic}
          onTogglePlay={handleTogglePlayMusic}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onOpenFloatingMusic={() => setIsFloatingMusicOpen((prev) => !prev)}
          isPremium={currentUser.isPremium}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Ticker Stats Bar */}
        <header className={`${isZenMode ? 'hidden' : 'px-3 sm:px-4 py-2 border-b flex items-center justify-between shrink-0 gap-2'} transition-all`} style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
              style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-contrast)' }}
            >
              {(() => {
                const ActiveIcon = GAME_ICONS[activeGame] || Sparkles;
                return <ActiveIcon size={15} />;
              })()}
            </div>
            <div className="truncate">
              <h2 className="font-bold text-xs sm:text-sm truncate">
                {GAME_HEADER_INFO[activeGame]?.[settings.language === 'en' ? 'en' : 'tr']?.title || activeGame}
              </h2>
              <p className="text-[10px] text-gray-500 truncate hidden sm:block">
                {GAME_HEADER_INFO[activeGame]?.[settings.language === 'en' ? 'en' : 'tr']?.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
            {/* Header Integrated Compact Music Player & Playlist */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 shadow-2xs">
              {/* Previous Track */}
              <button
                onClick={handlePrevTrack}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-[var(--text-primary)] transition focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:outline-none cursor-pointer"
                title={settings.language === 'tr' ? 'Önceki' : 'Previous'}
              >
                <SkipBack size={12} />
              </button>

              {/* Play / Pause Button */}
              <button
                onClick={handleTogglePlayMusic}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:outline-none ${
                  isPlayingMusic
                    ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                    : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:scale-105'
                }`}
                title={isPlayingMusic ? (settings.language === 'tr' ? 'Durdur' : 'Pause') : (settings.language === 'tr' ? 'Oynat' : 'Play')}
              >
                {isPlayingMusic ? <Pause size={11} /> : <Play size={11} fill="currentColor" />}
              </button>

              {/* Next Track */}
              <button
                onClick={handleNextTrack}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-[var(--text-primary)] transition focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:outline-none cursor-pointer"
                title={settings.language === 'tr' ? 'Sonraki' : 'Next'}
              >
                <SkipForward size={12} />
              </button>

              {/* Current Track / Radio Label & Visualizer (Click opens playlist) */}
              <div
                onClick={() => setIsFloatingMusicOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-1.5 max-w-[130px] sm:max-w-[180px] cursor-pointer group"
                title={
                  isCurrentLocal
                    ? `${currentTrack?.title} - ${currentTrack?.artist} (${settings.language === 'tr' ? 'Müziklerim' : 'Open My Music'})`
                    : `${currentTrack?.title}${currentTrack?.frequency ? ` (${currentTrack.frequency})` : ''} - ${currentTrack?.artist} (${settings.language === 'tr' ? 'Canlı Radyoları Aç' : 'Open Live Radios'})`
                }
              >
                {radioStatus === 'loading' ? (
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0"></span>
                ) : isPlayingMusic ? (
                  <span className="flex items-center gap-0.5 shrink-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-0.5 ${
                        isCurrentLocal ? 'bg-amber-400' : 'bg-red-500 animate-pulse'
                      }`}
                      title={isCurrentLocal ? 'MP3' : 'CANLI'}
                    ></span>
                    <span className="w-0.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="w-0.5 h-3.5 bg-emerald-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-0.5 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
                  </span>
                ) : isCurrentLocal ? (
                  <Disc size={12} className="text-amber-400 group-hover:scale-110 shrink-0 transition" />
                ) : (
                  <Radio size={12} className="text-gray-400 group-hover:text-[var(--accent-color)] shrink-0" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold truncate group-hover:text-[var(--accent-color)] transition leading-tight">
                    {currentTrack
                      ? currentTrack.title
                      : isCurrentLocal
                      ? (settings.language === 'tr' ? 'Müzik Ekle +' : 'Add Music +')
                      : (settings.language === 'tr' ? 'Radyo Seç +' : 'Select Radio +')}
                  </span>
                  {isCurrentLocal && playbackTime.duration > 0 ? (
                    <span className="text-[9px] font-mono text-zinc-400 truncate leading-none">
                      {Math.floor(playbackTime.current / 60)}:{Math.floor(playbackTime.current % 60).toString().padStart(2, '0')} / {Math.floor(playbackTime.duration / 60)}:{Math.floor(playbackTime.duration % 60).toString().padStart(2, '0')}
                    </span>
                  ) : currentTrack?.frequency ? (
                    <span className="text-[9px] font-mono text-zinc-400 truncate leading-none">
                      {currentTrack.frequency}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Mute/Unmute Quick Toggle */}
              <button
                onClick={handleToggleSound}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-[var(--text-primary)] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:outline-none"
                title={settings.soundEnabled ? (settings.language === 'tr' ? 'Sesi Kapat' : 'Mute') : (settings.language === 'tr' ? 'Sesi Aç' : 'Unmute')}
              >
                {settings.soundEnabled && settings.volume > 0 ? (
                  <Volume2 size={12} />
                ) : (
                  <VolumeX size={12} className="text-red-500" />
                )}
              </button>

              {/* Integrated Playlist Button (Shows active mode: Radio vs Local) */}
              <button
                onClick={() => setIsFloatingMusicOpen((prev) => !prev)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold transition ml-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:outline-none ${
                  isFloatingMusicOpen
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-2xs'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--accent-light)] hover:text-[var(--accent-color)] text-gray-700 dark:text-gray-300'
                }`}
                title={
                  isCurrentLocal
                    ? (settings.language === 'tr' ? 'Yerel Çalma Listesini Aç / Kapat' : 'Toggle Local Playlist')
                    : (settings.language === 'tr' ? 'Canlı Radyoları Aç / Kapat' : 'Toggle Radio List')
                }
              >
                {isCurrentLocal ? (
                  <>
                    <FolderOpen size={11} className="text-amber-400" />
                    <span>{localTracks.length}</span>
                  </>
                ) : (
                  <>
                    <Radio size={11} className="text-red-400" />
                    <span>{radioTracks.length}</span>
                  </>
                )}
              </button>
            </div>

            {/* 1v1 Multiplayer Action Button */}
            <button
              onClick={() => setIsMultiplayerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--accent-light)] text-[var(--text-primary)] font-bold transition text-xs shadow-2xs group cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:outline-none"
              title={settings.language === 'tr' ? '1v1 Çevrimiçi Düello (Arkadaşınla Oyna)' : '1v1 Online Duel (Play with friend)'}
            >
              <Users size={13} className="text-[var(--text-primary)] group-hover:scale-110 transition" />
              <span className="hidden md:inline">{settings.language === 'tr' ? '1v1 Düello' : '1v1 Duel'}</span>
              {multiplayerSession?.connected && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            {/* Ticker Stats Group (Shown on large 2xl screens, covered by Leaderboard Modal elsewhere) */}
            {!hideGameStats && (
              <div className="hidden 2xl:flex items-center gap-2.5">
                <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="text-center">
                  <div className="text-[10px] font-medium text-[var(--text-secondary)]">{settings.language === 'tr' ? 'Oynanan' : 'Played'}</div>
                  <div className="font-mono tabular-nums font-bold text-xs">{currentStats.played}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-medium text-[var(--text-secondary)]">{settings.language === 'tr' ? 'Başarı' : 'Win %'}</div>
                  <div className="font-mono tabular-nums font-bold text-xs">{winRate}%</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-medium text-[var(--text-secondary)]">{settings.language === 'tr' ? 'Seri' : 'Streak'}</div>
                  <div className="font-mono tabular-nums font-bold text-xs">{currentStats.streak}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-medium text-[var(--text-secondary)]">{settings.language === 'tr' ? 'En İyi' : 'Best'}</div>
                  <div className="font-mono tabular-nums font-bold text-xs">{bestRecord}</div>
                </div>
                <div className="h-5 w-px border-r" style={{ borderColor: 'var(--border-color)' }}></div>
              </div>
            )}

            {/* Hibrit Odaklanma Modu (Liderlik Sıralaması + Tiyatro + Tam Ekran) */}
            <div className="flex items-center bg-[var(--bg-secondary)] p-0.5 rounded-xl border border-[var(--border-color)]">
              <button
                onClick={() => setIsLeaderboardOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer hover:bg-[var(--bg-card)] text-[var(--text-primary)] hover:opacity-90 shadow-2xs"
                title={settings.language === 'tr' ? 'Liderlik Sıralaması & Skor Tablosu' : 'Leaderboard & Rankings'}
              >
                <Trophy className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                <span className="hidden sm:inline">{settings.language === 'tr' ? 'Liderlik Sıralaması' : 'Leaderboard'}</span>
              </button>

              <div className="h-4 w-px bg-[var(--border-color)] mx-0.5"></div>

              <button
                onClick={toggleZenMode}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isZenMode
                    ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                    : 'hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title={isZenMode ? (settings.language === 'tr' ? 'Normal Görünüm (ESC)' : 'Standard View (ESC)') : (settings.language === 'tr' ? 'Odaklan / Tiyatro Modu (Yan Menüyü Gizle)' : 'Focus / Theater Mode')}
              >
                {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Scan className="w-3.5 h-3.5" />}
                <span className="hidden lg:inline">{isZenMode ? (settings.language === 'tr' ? 'Odak Açık' : 'Focused') : (settings.language === 'tr' ? 'Odaklan' : 'Focus')}</span>
              </button>

              <button
                onClick={toggleNativeFullscreen}
                className={`p-1 rounded-lg text-xs transition cursor-pointer ${
                  isFullscreen
                    ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                    : 'hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title={isFullscreen ? (settings.language === 'tr' ? 'Pencereye Dön (F11)' : 'Exit Fullscreen (F11)') : (settings.language === 'tr' ? 'Donanımsal Tam Ekran (F11)' : 'Fullscreen (F11)')}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Google Account Profile Button - En Sağda (Permanently Visible) */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] transition text-xs shadow-2xs group cursor-pointer shrink-0"
              title={currentUser.provider === 'google' ? 'Google Oyuncu Profili' : 'Google ile Giriş Yap'}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-blue-500/40 shrink-0"
              />
              <span className="font-bold max-w-[80px] sm:max-w-[100px] truncate">
                {currentUser.provider === 'google' ? currentUser.name : (settings.language === 'tr' ? 'Giriş Yap' : 'Sign In')}
              </span>
              {currentUser.provider === 'google' && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
              )}
            </button>
          </div>
        </header>

        {/* Game Container (Responsive, Uniform, Clean Scroll, 100% Yellow-Box Bounds) */}
        <div className={`flex-1 overflow-y-auto lg:overflow-hidden ${isZenMode ? 'p-0 sm:p-1' : 'px-2 sm:px-4 py-1'} flex flex-col items-center justify-start w-full min-h-0`}>
          <div className="w-full h-full flex flex-col items-center justify-start transition-all duration-300 min-h-0">
            {activeGame === 'kelime-bulmaca' && (
              <KelimeBulmaca
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                isPremium={currentUser.isPremium}
                stats={stats['kelime-bulmaca']}
                onOpenMultiplayer={() => setIsMultiplayerOpen(true)}
                multiplayerSession={multiplayerSession}
                onSendMultiplayerAction={(msg) => multiplayerService.sendMessage(msg)}
                incomingMultiplayerMessage={incomingMultiplayerMessage}
                onGameEnd={(won, time) => handleGameEnd('kelime-bulmaca', won, time)}
                isZenMode={isZenMode}
                hideStats={hideGameStats}
              />
            )}
            {activeGame === 'kare-bulmaca' && (
              <KareBulmaca
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                isPremium={currentUser.isPremium}
                onGameEnd={(won, time) => handleGameEnd('kare-bulmaca', won, time)}
              />
            )}
            {activeGame === 'anagram' && (
              <Anagram
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                isPremium={currentUser.isPremium}
                onGameEnd={(won, score) => handleGameEnd('anagram', won, score)}
              />
            )}
            {activeGame === 'kelime-turetme' && (
              <KelimeTuretme
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                isPremium={currentUser.isPremium}
                onGameEnd={(won, score) => handleGameEnd('kelime-turetme', won, score)}
              />
            )}
            {activeGame === 'sozcuk-avi' && (
              <SozcukAvi
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                onGameEnd={(won, time) => handleGameEnd('sozcuk-avi', won, time)}
              />
            )}
            {activeGame === 'adam-asmaca' && (
              <AdamAsmaca
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                isPremium={currentUser.isPremium}
                onGameEnd={(won) => handleGameEnd('adam-asmaca', won)}
              />
            )}
            {activeGame === 'satranc' && (
              <Satranc
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                onGameEnd={(won) => handleGameEnd('satranc', won)}
                multiplayerSession={multiplayerSession}
                onSendMultiplayerAction={(msg) => multiplayerService.sendMessage(msg)}
                incomingMultiplayerMessage={incomingMultiplayerMessage}
                isZenMode={isZenMode}
                hideStats={hideGameStats}
              />
            )}
            {activeGame === 'sudoku' && (
              <Sudoku
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                isPremium={currentUser.isPremium}
                onGameEnd={(won, time) => handleGameEnd('sudoku', won, time)}
              />
            )}
            {activeGame === 'kelime-zinciri' && (
              <KelimeZinciri
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                isPremium={currentUser.isPremium}
                onGameEnd={(won, score) => handleGameEnd('kelime-zinciri', won, score)}
              />
            )}
            {activeGame === 'hafiza-kartlari' && (
              <HafizaKartlari
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                isPremium={currentUser.isPremium}
                onGameEnd={(won, time) => handleGameEnd('hafiza-kartlari', won, time)}
              />
            )}
            {activeGame === 'nokta-avi' && (
              <NoktaAvi
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                onGameEnd={(won, score) => handleGameEnd('nokta-avi', won, score)}
              />
            )}
            {activeGame === 'baglantilar' && (
              <Baglantilar
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                isPremium={currentUser.isPremium}
                onGameEnd={(won, time) => handleGameEnd('baglantilar', won, time)}
              />
            )}
            {activeGame === 'nonogram' && (
              <Nonogram
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                isPremium={currentUser.isPremium}
                onGameEnd={(won, time) => handleGameEnd('nonogram', won, time)}
              />
            )}
            {activeGame === 'gunun-bulmacasi' && (
              <DailyPuzzleView
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                stats={stats}
                onPlayGame={(g) => setActiveGame(g)}
              />
            )}
          </div>
        </div>

        {/* Bottom AdSense Banner (Docked at the bottom of the main content column) */}
        <AdSenseBanner
          isPremium={currentUser.isPremium}
          onOpenRemoveAds={() => setIsRemoveAdsOpen(true)}
          language={settings.language}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        stats={stats}
        onResetStats={() => {
          localStorage.removeItem('bulmaca_kulubu_stats_v1');
          setStats(loadStats());
        }}
        onOpenLegal={() => setIsLegalModalOpen(true)}
      />

      {/* Google Auth & User Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={currentUser}
        onUserChange={setCurrentUser}
        stats={stats}
      />

      {/* 1v1 Online Multiplayer Modal */}
      <MultiplayerModal
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
        currentUser={currentUser}
        onStartMultiplayer={(session) => {
          setMultiplayerSession(session);
          setActiveGame(session.gameId);
        }}
        onDataMessage={(msg) => {
          setIncomingMultiplayerMessage(msg);
        }}
      />

      {/* Floating Everywhere Music Station & Playlist (Radyo ve Yerel Müzikler Ayrı) */}
      <FloatingMusicStation
        isOpen={isFloatingMusicOpen}
        onClose={() => setIsFloatingMusicOpen(false)}
        radioTracks={radioTracks}
        localTracks={localTracks}
        onAddLocalTracks={handleAddLocalTracks}
        onRemoveLocalTrack={handleRemoveLocalTrack}
        onClearLocalTracks={handleClearLocalTracks}
        activeTab={activeMusicTab}
        onTabChange={setActiveMusicTab}
        currentTrackId={currentTrackId}
        onSelectTrack={handleSelectTrack}
        isPlaying={isPlayingMusic}
        onTogglePlay={handleTogglePlayMusic}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        volume={settings.volume}
        onVolumeChange={(v) => setSettings({ ...settings, volume: v })}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        language={settings.language}
        radioStatus={radioStatus}
        playbackTime={playbackTime}
        onSeek={handleSeek}
      />

      {/* RevenueCat Remove Ads & VIP Club Modal */}
      <RemoveAdsModal
        isOpen={isRemoveAdsOpen}
        onClose={() => setIsRemoveAdsOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          saveUserProfile(updated);
        }}
        language={settings.language}
      />

      {/* KVKK / GDPR & Legal Privacy Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        language={settings.language}
      />

      {/* Leaderboard & Rankings Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUser={currentUser}
        stats={stats[activeGame]}
        language={settings.language}
      />
    </div>
  );
}
