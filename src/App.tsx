import React, { useState, useEffect, useRef } from 'react';
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
import { BUILT_IN_TRACKS, startAmbientMusic, stopAmbientMusic, setAmbientVolume } from './utils/audio';
import { Music, Radio, Sparkles, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, ListMusic, Users, ShieldCheck, Crown, Settings as SettingsIcon, FileText } from 'lucide-react';
import { isUserPremium } from './utils/revenueCat';
import { checkUrlForVipActivation } from './utils/shopier';
import confetti from 'canvas-confetti';
import { AdSenseBanner } from './components/AdSenseBanner';
import { RemoveAdsModal } from './components/RemoveAdsModal';
import { LegalModal } from './components/LegalModal';

import { KelimeBulmaca } from './games/KelimeBulmaca';
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

  // Music Player state (Multiple files / Folder support)
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string>('');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isFloatingMusicOpen, setIsFloatingMusicOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-palette', settings.palette || 'nordic');
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setAmbientVolume(settings.volume / 100);
    if (audioRef.current) {
      audioRef.current.volume = settings.volume / 100;
    }
  }, [settings]);

  const handleGameEnd = (gameId: GameId, won: boolean, scoreOrTime?: number) => {
    const updated = updateGameStats(gameId, won, scoreOrTime);
    setStats(updated);
  };

  const toggleLanguage = () => {
    const nextLang = settings.language === 'tr' ? 'en' : 'tr';
    setSettings({ ...settings, language: nextLang });
  };

  const handleAddTracks = (newTracks: Track[]) => {
    setTracks((prev) => {
      const updated = [...prev, ...newTracks];
      if (!currentTrackId && updated.length > 0) {
        setCurrentTrackId(updated[0].id);
      }
      return updated;
    });
  };

  const playCurrentTrack = (track: Track) => {
    if (!settings.soundEnabled) return;

    if (track.audioUrl) {
      stopAmbientMusic();
      if (!audioRef.current) {
        audioRef.current = new Audio(track.audioUrl);
      } else {
        audioRef.current.src = track.audioUrl;
      }
      audioRef.current.volume = settings.volume / 100;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleTogglePlayMusic = () => {
    if (tracks.length === 0) {
      setIsFloatingMusicOpen(true);
      return;
    }
    if (!settings.soundEnabled) return;
    const currentTrack = tracks.find((t) => t.id === currentTrackId) || tracks[0];
    if (!currentTrack) return;

    if (isPlayingMusic) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopAmbientMusic();
      setIsPlayingMusic(false);
    } else {
      playCurrentTrack(currentTrack);
      setIsPlayingMusic(true);
    }
  };

  const handleSelectTrack = (id: string) => {
    setCurrentTrackId(id);
    const selected = tracks.find((t) => t.id === id);
    if (selected) {
      playCurrentTrack(selected);
      setIsPlayingMusic(true);
    }
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === currentTrackId);
    const nextIdx = (idx + 1) % tracks.length;
    const nextTrack = tracks[nextIdx];
    setCurrentTrackId(nextTrack.id);
    if (isPlayingMusic) {
      playCurrentTrack(nextTrack);
    }
  };

  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === currentTrackId);
    const prevIdx = (idx - 1 + tracks.length) % tracks.length;
    const prevTrack = tracks[prevIdx];
    setCurrentTrackId(prevTrack.id);
    if (isPlayingMusic) {
      playCurrentTrack(prevTrack);
    }
  };

  const currentTrack = tracks.find((t) => t.id === currentTrackId) || tracks[0];
  const currentStats = stats[activeGame] || { played: 0, won: 0, streak: 0, maxStreak: 0 };
  const winRate = currentStats.played > 0 ? Math.round((currentStats.won / currentStats.played) * 100) : 0;
  const bestRecord =
    activeGame === 'kelime-turetme' || activeGame === 'nokta-avi'
      ? currentStats.bestScore ?? '—'
      : currentStats.bestTime
      ? `${currentStats.bestTime}s`
      : '—';

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <FlyingBird />
      {/* Sidebar */}
      <Sidebar
        activeGame={activeGame}
        onSelectGame={(g) => setActiveGame(g)}
        language={settings.language}
        onToggleLanguage={toggleLanguage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        volume={settings.volume}
        soundEnabled={settings.soundEnabled}
        tracks={tracks}
        onAddTracks={handleAddTracks}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Ticker Stats Bar */}
        <header className="px-6 py-3 border-b flex items-center justify-between shrink-0" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex items-center justify-center font-bold text-xs shrink-0">
              ⚡
            </div>
            <div className="truncate">
              <h2 className="font-bold text-xs sm:text-sm truncate">
                {GAME_HEADER_INFO[activeGame]?.[settings.language === 'en' ? 'en' : 'tr']?.title || activeGame}
              </h2>
              <p className="text-[10px] text-gray-500 truncate">
                {GAME_HEADER_INFO[activeGame]?.[settings.language === 'en' ? 'en' : 'tr']?.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 text-xs shrink-0">
            {/* Header Integrated Compact Music Player & Playlist */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 shadow-2xs">
              {/* Previous Track */}
              <button
                onClick={handlePrevTrack}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-[var(--text-primary)] transition"
                title={settings.language === 'tr' ? 'Önceki' : 'Previous'}
              >
                <SkipBack size={12} />
              </button>

              {/* Play / Pause Button */}
              <button
                onClick={handleTogglePlayMusic}
                disabled={!settings.soundEnabled}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition font-bold ${
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
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-[var(--text-primary)] transition"
                title={settings.language === 'tr' ? 'Sonraki' : 'Next'}
              >
                <SkipForward size={12} />
              </button>

              {/* Current Track Label & Visualizer (Click opens playlist) */}
              <div
                onClick={() => setIsFloatingMusicOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-1.5 max-w-[110px] sm:max-w-[155px] cursor-pointer group"
                title={`${currentTrack?.title} - ${currentTrack?.artist} (${settings.language === 'tr' ? 'Çalma Listesini Aç' : 'Open Playlist'})`}
              >
                {isPlayingMusic ? (
                  <span className="flex items-center gap-0.5 shrink-0">
                    <span className="w-0.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="w-0.5 h-3.5 bg-emerald-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-0.5 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
                  </span>
                ) : (
                  <Music size={12} className="text-gray-400 group-hover:text-[var(--accent-color)] shrink-0" />
                )}
                <span className="text-[11px] font-bold truncate group-hover:text-[var(--accent-color)] transition">
                  {currentTrack ? currentTrack.title : (settings.language === 'tr' ? 'Müzik Ekle +' : 'Add Music +')}
                </span>
              </div>

              {/* Mute/Unmute Quick Toggle */}
              <button
                onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-[var(--text-primary)] transition"
                title={settings.soundEnabled ? (settings.language === 'tr' ? 'Sesi Kapat' : 'Mute') : (settings.language === 'tr' ? 'Sesi Aç' : 'Unmute')}
              >
                {settings.soundEnabled && settings.volume > 0 ? (
                  <Volume2 size={12} />
                ) : (
                  <VolumeX size={12} className="text-red-500" />
                )}
              </button>

              {/* Integrated Playlist Button */}
              <button
                onClick={() => setIsFloatingMusicOpen((prev) => !prev)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold transition ml-0.5 ${
                  isFloatingMusicOpen
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-2xs'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--accent-light)] hover:text-[var(--accent-color)] text-gray-700 dark:text-gray-300'
                }`}
                title={settings.language === 'tr' ? 'Çalma Listesini Aç / Kapat' : 'Toggle Playlist'}
              >
                <ListMusic size={11} />
                <span>{tracks.length}</span>
              </button>
            </div>

            {/* VIP / Remove Ads Action Button */}
            <button
              onClick={() => setIsRemoveAdsOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-bold transition text-xs shadow-2xs group cursor-pointer ${
                currentUser.isPremium
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
              title={currentUser.isPremium ? (settings.language === 'tr' ? 'VIP Üye (Aktif)' : 'VIP Member (Active)') : (settings.language === 'tr' ? 'Reklamları Kaldır & VIP Ol' : 'Remove Ads & Get VIP')}
            >
              <Crown size={13} className={currentUser.isPremium ? 'text-amber-500 fill-amber-500' : 'text-amber-500 group-hover:scale-110 transition'} />
              <span className="hidden md:inline">
                {currentUser.isPremium ? (settings.language === 'tr' ? '👑 VIP Üye' : '👑 VIP') : (settings.language === 'tr' ? 'VIP / Reklamsız' : 'VIP Pass')}
              </span>
            </button>

            {/* 1v1 Multiplayer Action Button */}
            <button
              onClick={() => setIsMultiplayerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold transition text-xs shadow-2xs group"
              title={settings.language === 'tr' ? '1v1 Çevrimiçi Düello (Arkadaşınla Oyna)' : '1v1 Online Duel (Play with friend)'}
            >
              <Users size={13} className="group-hover:scale-110 transition" />
              <span className="hidden md:inline">{settings.language === 'tr' ? '1v1 Düello' : '1v1 Duel'}</span>
              {multiplayerSession?.connected && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

            <div className="text-center">
              <div className="text-[9px] text-gray-400 uppercase tracking-wider">{settings.language === 'tr' ? 'OYNANAN' : 'PLAYED'}</div>
              <div className="font-bold text-xs">{currentStats.played}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-gray-400 uppercase tracking-wider">{settings.language === 'tr' ? 'BAŞARI' : 'WIN %'}</div>
              <div className="font-bold text-xs">{winRate}%</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-gray-400 uppercase tracking-wider">{settings.language === 'tr' ? 'SERİ' : 'STREAK'}</div>
              <div className="font-bold text-xs">{currentStats.streak}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-gray-400 uppercase tracking-wider">{settings.language === 'tr' ? 'EN İYİ' : 'BEST'}</div>
              <div className="font-bold text-xs">{bestRecord}</div>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

            {/* Google Account Profile Button - En Sağda */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] transition text-xs shadow-2xs group cursor-pointer"
              title={currentUser.provider === 'google' ? 'Google Oyuncu Profili' : 'Google ile Giriş Yap'}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-blue-500/40 shrink-0"
              />
              <span className="font-bold max-w-[90px] truncate hidden sm:inline">
                {currentUser.provider === 'google' ? currentUser.name : (settings.language === 'tr' ? 'Giriş Yap' : 'Sign In')}
              </span>
              {currentUser.provider === 'google' && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
              )}
            </button>
          </div>
        </header>

        {/* Game Container (Responsive, Uniform, Clean Scroll) */}
        <div className={`flex-1 overflow-y-auto px-2 sm:px-4 py-1.5 sm:py-2 flex flex-col items-center justify-start w-full ${currentUser.isPremium ? 'pb-6' : 'pb-32 sm:pb-36'}`}>
          <div className="w-full max-w-5xl xl:max-w-6xl flex flex-col items-center py-0.5">
            {activeGame === 'kelime-bulmaca' && (
              <KelimeBulmaca
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                onGameEnd={(won, time) => handleGameEnd('kelime-bulmaca', won, time)}
              />
            )}
            {activeGame === 'kelime-turetme' && (
              <KelimeTuretme
                language={settings.language}
                soundEnabled={settings.soundEnabled}
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
              />
            )}
            {activeGame === 'sudoku' && (
              <Sudoku
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                onGameEnd={(won, time) => handleGameEnd('sudoku', won, time)}
              />
            )}
            {activeGame === 'kelime-zinciri' && (
              <KelimeZinciri
                language={settings.language}
                soundEnabled={settings.soundEnabled}
                onGameEnd={(won, score) => handleGameEnd('kelime-zinciri', won, score)}
              />
            )}
            {activeGame === 'hafiza-kartlari' && (
              <HafizaKartlari
                language={settings.language}
                soundEnabled={settings.soundEnabled}
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
                onGameEnd={(won, time) => handleGameEnd('baglantilar', won, time)}
              />
            )}
            {activeGame === 'nonogram' && (
              <Nonogram
                language={settings.language}
                soundEnabled={settings.soundEnabled}
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

      {/* Floating Everywhere Music Station & Playlist */}
      <FloatingMusicStation
        isOpen={isFloatingMusicOpen}
        onClose={() => setIsFloatingMusicOpen(false)}
        tracks={tracks}
        onAddTracks={handleAddTracks}
        currentTrackId={currentTrackId}
        onSelectTrack={handleSelectTrack}
        isPlaying={isPlayingMusic}
        onTogglePlay={handleTogglePlayMusic}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        volume={settings.volume}
        onVolumeChange={(v) => setSettings({ ...settings, volume: v })}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
        language={settings.language}
      />

      {/* Sticky Bottom Google AdSense Banner (Auto-hidden for VIPs) */}
      <AdSenseBanner
        isPremium={currentUser.isPremium}
        onOpenRemoveAds={() => setIsRemoveAdsOpen(true)}
        language={settings.language}
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
    </div>
  );
}
