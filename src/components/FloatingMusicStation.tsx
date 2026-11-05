import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  FolderOpen,
  Files,
  Search,
  Move,
  Minimize2,
  Maximize2,
  X,
  Radio,
  Signal,
  CheckCircle2,
  Trash2,
  Plus,
  UploadCloud,
  Disc,
} from 'lucide-react';
import { Track } from '../types';

interface FloatingMusicStationProps {
  isOpen: boolean;
  onClose: () => void;
  // Dedicated Radio and Local Track Lists
  radioTracks: Track[];
  localTracks: Track[];
  onAddLocalTracks: (tracks: Track[]) => void;
  onRemoveLocalTrack: (id: string) => void;
  onClearLocalTracks: () => void;
  // Tab and Track State
  activeTab: 'radio' | 'local';
  onTabChange: (tab: 'radio' | 'local') => void;
  currentTrackId: string;
  onSelectTrack: (track: Track) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  // Audio Controls
  volume: number;
  onVolumeChange: (volume: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  language: 'tr' | 'en';
  radioStatus?: 'idle' | 'loading' | 'playing' | 'error';
  // Progress & Seek for Local Music
  playbackTime?: { current: number; duration: number };
  onSeek?: (seconds: number) => void;
}

type RadioCategory = 'all' | 'odak' | 'pop' | 'akustik' | 'haber' | 'nostalji';

function formatSeconds(sec: number): string {
  if (isNaN(sec) || sec <= 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const FloatingMusicStation: React.FC<FloatingMusicStationProps> = ({
  isOpen,
  onClose,
  radioTracks,
  localTracks,
  onAddLocalTracks,
  onRemoveLocalTrack,
  onClearLocalTracks,
  activeTab,
  onTabChange,
  currentTrackId,
  onSelectTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  volume,
  onVolumeChange,
  soundEnabled,
  onToggleSound,
  language,
  radioStatus = 'idle',
  playbackTime = { current: 0, duration: 0 },
  onSeek,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadioCategory, setSelectedRadioCategory] = useState<RadioCategory>('all');
  const [isDragOver, setIsDragOver] = useState(false);

  // Floating position state
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      return { x: Math.max(16, window.innerWidth - 390), y: Math.max(16, window.innerHeight - 520) };
    }
    return { x: 50, y: 50 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const stationRef = useRef<HTMLDivElement>(null);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, label, .no-drag')) return;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 350, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 100, e.clientY - dragOffsetRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleFilesList = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newTracks: Track[] = Array.from(files)
      .filter((file) => file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i))
      .map((file, idx) => ({
        id: `local_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: language === 'tr' ? 'Yerel Dosya' : 'Local Audio',
        duration: '--:--',
        playlistName: language === 'tr' ? 'Müziklerim' : 'My Music',
        audioUrl: URL.createObjectURL(file),
        isBuiltIn: false,
        category: 'diger',
      }));

    if (newTracks.length > 0) {
      onAddLocalTracks(newTracks);
      onTabChange('local');
      if (!currentTrackId) {
        onSelectTrack(newTracks[0]);
      }
    }
  };

  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesList(e.target.files);
    e.target.value = '';
  };

  // Drag and drop audio files over the station
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFilesList(e.dataTransfer.files);
    }
  };

  const currentTrack = useMemo(() => {
    const all = [...radioTracks, ...localTracks];
    return all.find((t) => t.id === currentTrackId) || (activeTab === 'local' && localTracks[0] ? localTracks[0] : radioTracks[0]);
  }, [radioTracks, localTracks, currentTrackId, activeTab]);

  const isCurrentTrackLocal = currentTrack?.id.startsWith('local_') || false;

  const radioCategories: { id: RadioCategory; label: string }[] = useMemo(
    () => [
      { id: 'all', label: language === 'tr' ? 'Tümü' : 'All' },
      { id: 'odak', label: language === 'tr' ? 'Odak & Klasik' : 'Focus' },
      { id: 'pop', label: language === 'tr' ? 'Pop & Hit' : 'Pop & Hits' },
      { id: 'akustik', label: language === 'tr' ? 'Akustik & Slow' : 'Acoustic' },
      { id: 'haber', label: language === 'tr' ? 'Haber & Kültür' : 'News & Culture' },
      { id: 'nostalji', label: language === 'tr' ? 'Nostalji & Sanat' : 'Classics' },
    ],
    [language]
  );

  const filteredRadioTracks = useMemo(() => {
    return radioTracks.filter((t) => {
      if (selectedRadioCategory !== 'all') {
        if (selectedRadioCategory === 'odak' && (t.category === 'odak' || t.category === 'klasik')) {
          // match
        } else if (t.category !== selectedRadioCategory) {
          return false;
        }
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.frequency && t.frequency.toLowerCase().includes(q))
      );
    });
  }, [radioTracks, selectedRadioCategory, searchQuery]);

  const filteredLocalTracks = useMemo(() => {
    if (!searchQuery.trim()) return localTracks;
    const q = searchQuery.toLowerCase();
    return localTracks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
  }, [localTracks, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      ref={stationRef}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 9999,
      }}
      className={`transition-shadow select-none ${isDragging ? 'opacity-90 shadow-2xl scale-[1.01]' : 'shadow-xl'}`}
    >
      {isMinimized ? (
        /* MINIMIZED PILL MODE */
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-md cursor-grab active:cursor-grabbing text-xs font-semibold shadow-lg text-[var(--text-primary)]"
        >
          <div className="flex items-center gap-2">
            {isCurrentTrackLocal ? (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            )}
            {isCurrentTrackLocal ? (
              <Disc size={13} className="text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            ) : (
              <Radio size={13} className="text-red-400" />
            )}
            <span className="truncate max-w-[130px] text-xs font-bold">
              {currentTrack ? currentTrack.title : (language === 'tr' ? 'Müzikçalar' : 'Player')}
            </span>
            {currentTrack?.frequency ? (
              <span className="text-[10px] font-mono text-zinc-400">
                {currentTrack.frequency}
              </span>
            ) : playbackTime.duration > 0 ? (
              <span className="text-[10px] font-mono text-zinc-400">
                {formatSeconds(playbackTime.current)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1 pl-1.5 border-l border-[var(--border-color)]">
            <button
              onClick={onTogglePlay}
              className="p-1 rounded-full hover:bg-white/10 transition text-[var(--text-primary)] cursor-pointer"
              title={isPlaying ? 'Durdur' : 'Çal'}
            >
              {radioStatus === 'loading' ? (
                <span className="w-3 h-3 rounded-full border border-amber-400 border-t-transparent animate-spin inline-block"></span>
              ) : isPlaying ? (
                <Pause size={12} />
              ) : (
                <Play size={12} fill="currentColor" />
              )}
            </button>
            <button
              onClick={onNextTrack}
              className="p-1 rounded-full hover:bg-white/10 transition text-[var(--text-primary)] cursor-pointer"
              title="Sonraki"
            >
              <SkipForward size={12} />
            </button>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded-full hover:bg-white/10 transition text-zinc-400 cursor-pointer"
              title="Genişlet"
            >
              <Maximize2 size={12} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition text-zinc-400 hover:text-red-400 cursor-pointer"
              title="Kapat"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        /* FULL EXPANDED FLOATING STATION */
        <div className="w-84 sm:w-92 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/98 backdrop-blur-xl flex flex-col overflow-hidden text-xs shadow-2xl text-[var(--text-primary)]">
          {/* Draggable Window Top Bar */}
          <div
            onMouseDown={handleMouseDown}
            className="px-3.5 py-2.5 border-b border-[var(--border-color)] flex items-center justify-between cursor-grab active:cursor-grabbing bg-[var(--bg-secondary)]/60"
          >
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg border shadow-xs ${
                  isCurrentTrackLocal
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-red-500/15 border-red-500/30 text-red-400'
                }`}
              >
                {isCurrentTrackLocal ? <Disc size={14} /> : <Radio size={14} className="animate-pulse" />}
              </div>
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>
                    {isCurrentTrackLocal
                      ? (language === 'tr' ? 'Müziklerim' : 'Local Music Player')
                      : (language === 'tr' ? 'Türkiye Ulusal Canlı Radyoları' : 'Turkey National Live Radios')}
                  </span>
                  {!isCurrentTrackLocal && (
                    <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 text-[9px] font-mono font-bold tracking-wider">
                      ● CANLI
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <Move size={9} /> {language === 'tr' ? 'Taşımak için tut ve sürükle' : 'Drag to reposition'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition text-zinc-400 hover:text-zinc-200 cursor-pointer"
                title={language === 'tr' ? 'Küçült' : 'Minimize'}
              >
                <Minimize2 size={13} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition text-zinc-400 cursor-pointer"
                title={language === 'tr' ? 'Kapat' : 'Close'}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* MAIN SEGMENTED SWITCHER: CANLI RADYOLAR vs MÜZİKLERİM */}
          <div className="p-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/70 flex items-center gap-1.5">
            <button
              onClick={() => onTabChange('radio')}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'radio'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Radio size={13} className={activeTab === 'radio' ? 'text-red-500' : ''} />
              <span>{language === 'tr' ? 'Canlı Radyolar' : 'Live Radios'}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'radio' ? 'bg-zinc-900 text-zinc-100' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {radioTracks.length}
              </span>
            </button>

            <button
              onClick={() => onTabChange('local')}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'local'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <FolderOpen size={13} className={activeTab === 'local' ? 'text-amber-500' : ''} />
              <span>{language === 'tr' ? 'Müziklerim' : 'My Music'}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'local' ? 'bg-zinc-900 text-zinc-100' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {localTracks.length}
              </span>
            </button>
          </div>

          {/* Current Playing Station / Track Banner */}
          <div className="p-3.5 border-b border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)]/50">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  {isCurrentTrackLocal ? (
                    <>
                      <Disc size={11} className="text-amber-400" />
                      <span className="text-amber-400/90 font-mono">
                        {language === 'tr' ? 'YEREL MP3 ÇALAR' : 'LOCAL AUDIO'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Signal size={11} className="text-red-400" />
                      <span className="text-zinc-300 font-mono">
                        {currentTrack?.frequency || 'CANLI AKIŞ'}
                      </span>
                      {currentTrack?.city && <span className="text-zinc-500">• {currentTrack.city}</span>}
                    </>
                  )}
                  {radioStatus === 'loading' && (
                    <span className="text-amber-400 font-bold animate-pulse text-[10px] ml-auto">
                      {language === 'tr' ? 'Bağlanıyor...' : 'Connecting...'}
                    </span>
                  )}
                </div>

                <div className="font-extrabold text-sm truncate text-[var(--text-primary)] flex items-center gap-1.5">
                  <span className="truncate">{currentTrack?.title}</span>
                  {isPlaying && (
                    <span className="flex items-center gap-0.5 shrink-0 ml-1">
                      <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce"></span>
                      <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {currentTrack?.artist}
                </div>
              </div>
            </div>

            {/* Local Track Progress / Seek Bar */}
            {isCurrentTrackLocal && playbackTime.duration > 0 && (
              <div className="mt-3 no-drag">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span>{formatSeconds(playbackTime.current)}</span>
                  <span>{formatSeconds(playbackTime.duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(1, playbackTime.duration)}
                  value={playbackTime.current}
                  onChange={(e) => {
                    if (onSeek) onSeek(Number(e.target.value));
                  }}
                  className="w-full h-1.5 accent-amber-400 rounded-lg cursor-pointer bg-zinc-800"
                />
              </div>
            )}

            {/* Playback Controls & Volume */}
            <div className="mt-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onPrevTrack}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition text-zinc-300 hover:text-white cursor-pointer"
                  title={isCurrentTrackLocal ? 'Önceki Şarkı' : 'Önceki İstasyon'}
                >
                  <SkipBack size={15} />
                </button>

                <button
                  onClick={onTogglePlay}
                  disabled={!currentTrack}
                  className={`p-2.5 rounded-xl transition font-medium shadow-md flex items-center justify-center cursor-pointer ${
                    isPlaying
                      ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
                      : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                  }`}
                  title={isPlaying ? 'Durdur' : 'Dinle'}
                >
                  {radioStatus === 'loading' ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin inline-block"></span>
                  ) : isPlaying ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} fill="currentColor" />
                  )}
                </button>

                <button
                  onClick={onNextTrack}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition text-zinc-300 hover:text-white cursor-pointer"
                  title={isCurrentTrackLocal ? 'Sonraki Şarkı' : 'Sonraki İstasyon'}
                >
                  <SkipForward size={15} />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 w-32">
                <button
                  onClick={onToggleSound}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                  title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                >
                  {soundEnabled && volume > 0 ? (
                    <Volume2 size={13} />
                  ) : (
                    <VolumeX size={13} className="text-red-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundEnabled ? volume : 0}
                  onChange={(e) => {
                    const newVol = Number(e.target.value);
                    onVolumeChange(newVol);
                    if (!soundEnabled && newVol > 0) {
                      onToggleSound();
                    }
                  }}
                  className="w-full h-1.5 accent-zinc-200 rounded-lg cursor-pointer bg-zinc-800"
                />
              </div>
            </div>
          </div>

          {/* TAB 1: CANLI RADYOLAR CONTENT */}
          {activeTab === 'radio' && (
            <>
              {/* Category Chips Bar */}
              <div className="px-2.5 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30 flex items-center gap-1 overflow-x-auto no-drag scrollbar-none">
                {radioCategories.map((cat) => {
                  const isActive = selectedRadioCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedRadioCategory(cat.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition cursor-pointer ${
                        isActive
                          ? 'bg-zinc-200 text-zinc-950 font-bold shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="p-2 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder={language === 'tr' ? 'Radyo, tür veya frekans ara...' : 'Search station...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1 text-[11px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 focus:outline-hidden focus:border-zinc-500 text-zinc-200 placeholder:text-zinc-500"
                  />
                </div>
              </div>

              {/* Radio Stations List */}
              <div className="p-2 space-y-1 max-h-60 overflow-y-auto no-drag">
                {filteredRadioTracks.length === 0 ? (
                  <div className="py-7 text-center text-zinc-500 space-y-1.5">
                    <Radio size={26} className="mx-auto opacity-30 text-zinc-400" />
                    <div className="text-xs font-bold text-zinc-300">
                      {language === 'tr' ? 'Radyo istasyonu bulunamadı' : 'No station found'}
                    </div>
                  </div>
                ) : (
                  filteredRadioTracks.map((t, idx) => {
                    const isSelected = t.id === currentTrackId;
                    return (
                      <div
                        key={t.id}
                        onClick={() => onSelectTrack(t)}
                        className={`p-2 rounded-xl cursor-pointer flex items-center justify-between gap-2.5 transition group ${
                          isSelected
                            ? 'bg-zinc-800 text-zinc-100 font-bold border border-zinc-700/80 shadow-xs'
                            : 'hover:bg-zinc-900/80 text-zinc-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                              isSelected
                                ? 'bg-zinc-100 text-zinc-900'
                                : 'bg-zinc-900 text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-800'
                            }`}
                          >
                            {isSelected && isPlaying ? (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                            ) : (
                              idx + 1
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs truncate font-extrabold flex items-center gap-1.5">
                              <span className="truncate">{t.title}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                            </div>
                            <div className="text-[10px] truncate opacity-75 font-normal">
                              {t.artist}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {t.frequency && (
                            <span className="px-1.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400">
                              {t.frequency}
                            </span>
                          )}
                          {isSelected && <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Radio Footer */}
              <div className="px-3 py-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 flex items-center justify-between text-[10px] text-zinc-400">
                <span>
                  {filteredRadioTracks.length} / {radioTracks.length} {language === 'tr' ? 'ulusal canlı yayın' : 'stations'}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
                  ● {language === 'tr' ? '100% Güvenli HTTPS' : 'HTTPS Live'}
                </span>
              </div>
            </>
          )}

          {/* TAB 2: MÜZİKLERİM (LOCAL MP3) CONTENT */}
          {activeTab === 'local' && (
            <>
              {/* Local Actions Bar */}
              <div className="p-2 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <label
                    className="cursor-pointer px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition border border-zinc-700 flex items-center gap-1.5 text-[11px] font-semibold"
                    title={language === 'tr' ? 'MP3 veya Ses Dosyaları Ekle' : 'Add Audio Files'}
                  >
                    <Plus size={13} className="text-amber-400" />
                    <span>{language === 'tr' ? 'Dosya Ekle' : 'Add Files'}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      multiple
                      onChange={handleFilesUpload}
                      className="hidden"
                    />
                  </label>

                  <label
                    className="cursor-pointer px-2.5 py-1 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition border border-zinc-800 flex items-center gap-1.5 text-[11px]"
                    title={language === 'tr' ? 'Tüm Klasörü Ekle' : 'Add Folder'}
                  >
                    <FolderOpen size={13} />
                    <span>{language === 'tr' ? 'Klasör' : 'Folder'}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      multiple
                      {...({ webkitdirectory: '', directory: '' } as any)}
                      onChange={handleFilesUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {localTracks.length > 0 && (
                  <button
                    onClick={onClearLocalTracks}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-zinc-500 transition cursor-pointer"
                    title={language === 'tr' ? 'Listeyi Temizle' : 'Clear Playlist'}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Local Tracks List */}
              <div className="p-2 space-y-1 max-h-60 overflow-y-auto no-drag">
                {localTracks.length === 0 ? (
                  <div
                    className={`py-8 px-4 text-center rounded-xl border border-dashed transition space-y-2 ${
                      isDragOver
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-zinc-800 bg-zinc-900/30'
                    }`}
                  >
                    <UploadCloud size={30} className="mx-auto text-amber-400/80" />
                    <div className="text-xs font-bold text-zinc-200">
                      {language === 'tr' ? 'Müziklerinizi Ekleyin' : 'Add Your Music'}
                    </div>
                    <div className="text-[10px] text-zinc-400 max-w-[220px] mx-auto leading-normal">
                      {language === 'tr'
                        ? 'Bilgisayarınızdan MP3 veya ses dosyalarınızı buraya sürükleyip bırakın ya da Dosya Ekle butonunu kullanın.'
                        : 'Drag & drop MP3 files here or use the Add Files button.'}
                    </div>
                  </div>
                ) : (
                  filteredLocalTracks.map((t, idx) => {
                    const isSelected = t.id === currentTrackId;
                    return (
                      <div
                        key={t.id}
                        className={`p-2 rounded-xl flex items-center justify-between gap-2.5 transition group ${
                          isSelected
                            ? 'bg-zinc-800 text-zinc-100 font-bold border border-zinc-700/80 shadow-xs'
                            : 'hover:bg-zinc-900/80 text-zinc-300 border border-transparent'
                        }`}
                      >
                        <div
                          onClick={() => onSelectTrack(t)}
                          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                              isSelected
                                ? 'bg-amber-400 text-zinc-950'
                                : 'bg-zinc-900 text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-800'
                            }`}
                          >
                            {isSelected && isPlaying ? (
                              <span className="w-2 h-2 rounded-full bg-zinc-950 animate-ping"></span>
                            ) : (
                              idx + 1
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs truncate font-extrabold">{t.title}</div>
                            <div className="text-[10px] truncate opacity-75 font-normal">
                              {t.artist}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && <CheckCircle2 size={12} className="text-amber-400 shrink-0" />}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveLocalTrack(t.id);
                            }}
                            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 text-zinc-500 transition cursor-pointer"
                            title="Listeden Çıkar"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Local Footer */}
              <div className="px-3 py-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 flex items-center justify-between text-[10px] text-zinc-400">
                <span>
                  {localTracks.length} {language === 'tr' ? 'şarkı yüklendi' : 'tracks uploaded'}
                </span>
                <span className="text-amber-400/90 font-medium">
                  {language === 'tr' ? 'Tarayıcınızda yerel oynatılır' : 'Local playback'}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
