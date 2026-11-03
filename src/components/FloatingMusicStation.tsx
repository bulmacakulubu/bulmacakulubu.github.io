import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
  FolderOpen,
  Files,
  Search,
  Move,
  Minimize2,
  Maximize2,
  X,
  Music,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Track } from '../types';

interface FloatingMusicStationProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  onAddTracks: (tracks: Track[]) => void;
  currentTrackId: string;
  onSelectTrack: (id: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  language: 'tr' | 'en';
}

export const FloatingMusicStation: React.FC<FloatingMusicStationProps> = ({
  isOpen,
  onClose,
  tracks,
  onAddTracks,
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
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Floating position state
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    // Default position: bottom-right
    if (typeof window !== 'undefined') {
      return { x: Math.max(20, window.innerWidth - 380), y: Math.max(20, window.innerHeight - 440) };
    }
    return { x: 50, y: 50 };
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const stationRef = useRef<HTMLDivElement>(null);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking buttons or inputs
    if ((e.target as HTMLElement).closest('button, input, label')) return;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 320, e.clientX - dragOffsetRef.current.x));
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

  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: Track[] = Array.from(files).map((file, idx) => ({
      id: `local_${Date.now()}_${idx}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: language === 'tr' ? 'Yerel Dosya' : 'Local File',
      duration: '3:20',
      playlistName: language === 'tr' ? 'Benim Müziğim' : 'My Music',
      audioUrl: URL.createObjectURL(file),
      isBuiltIn: false,
    }));

    onAddTracks(newTracks);
    if (!currentTrackId && newTracks.length > 0) {
      onSelectTrack(newTracks[0].id);
    }
  };

  const currentTrack = tracks.find((t) => t.id === currentTrackId) || tracks[0];

  const filteredTracks = tracks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.playlistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      ref={stationRef}
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
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-md cursor-grab active:cursor-grabbing text-xs font-semibold shadow-lg"
          style={{ color: 'var(--text-primary)' }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <Music size={14} className="text-[var(--accent-color)]" />
            <span className="truncate max-w-[130px] text-xs">
              {currentTrack ? currentTrack.title : (language === 'tr' ? 'Müzik' : 'Music')}
            </span>
          </div>

          <div className="flex items-center gap-1 pl-1 border-l border-[var(--border-color)]">
            <button
              onClick={onTogglePlay}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              title={isPlaying ? 'Durdur' : 'Çal'}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
            </button>
            <button
              onClick={onNextTrack}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              title="Sonraki"
            >
              <SkipForward size={12} />
            </button>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition text-gray-500"
              title="Genişlet"
            >
              <Maximize2 size={12} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition text-gray-400 hover:text-red-500"
              title="Kapat"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        /* FULL EXPANDED FLOATING STATION */
        <div
          className="w-80 sm:w-88 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-xl flex flex-col overflow-hidden text-xs shadow-2xl"
          style={{ color: 'var(--text-primary)' }}
        >
          {/* Draggable Header */}
          <div
            onMouseDown={handleMouseDown}
            className="px-3.5 py-2.5 border-b border-[var(--border-color)] flex items-center justify-between cursor-grab active:cursor-grabbing bg-[var(--bg-secondary)]/50"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-[var(--accent-color)] text-white shadow-xs">
                <Radio size={13} />
              </div>
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  {language === 'tr' ? 'Müzik & Çalma Listesi' : 'Music & Playlist'}
                  {isPlaying && (
                    <span className="flex items-center gap-0.5 ml-1">
                      <span className="w-1 h-2.5 bg-emerald-500 rounded-full animate-bounce"></span>
                      <span className="w-1 h-3.5 bg-emerald-500 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Move size={9} /> {language === 'tr' ? 'Taşımak için tut ve sürükle' : 'Drag to reposition'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition text-gray-500"
                title={language === 'tr' ? 'Simge Durumuna Küçült' : 'Minimize'}
              >
                <Minimize2 size={13} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition text-gray-400"
                title={language === 'tr' ? 'Kapat' : 'Close'}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Current Playing Track Banner */}
          <div className="p-3.5 border-b border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)]/40">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold text-[var(--accent-color)] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Sparkles size={11} />
                  {currentTrack?.isBuiltIn
                    ? (language === 'tr' ? 'Dahili Odak Radyosu' : 'Focus Radio')
                    : (currentTrack?.playlistName || (language === 'tr' ? 'Çalma Listesi' : 'Playlist'))}
                </div>
                <div className="font-bold text-sm truncate">
                  {currentTrack ? currentTrack.title : (language === 'tr' ? 'Parça seçilmedi' : 'No track selected')}
                </div>
                <div className="text-[11px] text-gray-400 truncate">
                  {currentTrack ? currentTrack.artist : (language === 'tr' ? 'Listeden bir parça başlatın' : 'Start a track')}
                </div>
              </div>
            </div>

            {/* Playback Controls & Volume */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onPrevTrack}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition text-gray-600 dark:text-gray-300"
                  title="Önceki"
                >
                  <SkipBack size={15} />
                </button>
                <button
                  onClick={onTogglePlay}
                  disabled={!soundEnabled || !currentTrack}
                  className={`p-2.5 rounded-xl transition font-medium shadow-sm flex items-center justify-center ${
                    isPlaying
                      ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90'
                      : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:scale-105'
                  }`}
                  title={isPlaying ? 'Durdur' : 'Oynat'}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                </button>
                <button
                  onClick={onNextTrack}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition text-gray-600 dark:text-gray-300"
                  title="Sonraki"
                >
                  <SkipForward size={15} />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 w-28">
                <button
                  onClick={onToggleSound}
                  className="p-1 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
                  title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                >
                  {soundEnabled && volume > 0 ? <Volume2 size={13} /> : <VolumeX size={13} className="text-red-500" />}
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
                  className="w-full h-1.5 accent-[var(--accent-color)] rounded-lg cursor-pointer bg-gray-200 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Playlist Section Controls */}
          <div className="p-2.5 border-b border-[var(--border-color)] flex items-center justify-between gap-2 bg-[var(--bg-card)]">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'tr' ? 'Parça veya sanatçı ara...' : 'Search track...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1 text-[11px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 focus:outline-hidden focus:border-[var(--accent-color)]"
              />
            </div>

            {/* Upload Buttons */}
            <div className="flex items-center gap-1">
              <label
                className="cursor-pointer p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition border border-[var(--border-color)] flex items-center gap-1 text-[10px] font-semibold"
                title={language === 'tr' ? 'Çoklu Dosya Yükle' : 'Add Files'}
              >
                <Files size={12} className="text-[var(--accent-color)]" />
                <span className="hidden sm:inline">{language === 'tr' ? 'Dosya' : 'File'}</span>
                <input type="file" accept="audio/*" multiple onChange={handleFilesUpload} className="hidden" />
              </label>

              <label
                className="cursor-pointer p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition border border-[var(--border-color)] flex items-center gap-1 text-[10px] font-semibold"
                title={language === 'tr' ? 'Klasör Yükle' : 'Add Folder'}
              >
                <FolderOpen size={12} className="text-[var(--accent-color)]" />
                <span className="hidden sm:inline">{language === 'tr' ? 'Klasör' : 'Folder'}</span>
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
          </div>

          {/* Playlist Scrollable List */}
          <div className="p-2 space-y-1 max-h-56 overflow-y-auto">
            {filteredTracks.length === 0 ? (
              <div className="py-7 text-center text-gray-400 space-y-1.5">
                <ListMusic size={28} className="mx-auto opacity-40 text-[var(--accent-color)]" />
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  {language === 'tr' ? 'Çalma listeniz henüz boş' : 'Your playlist is empty'}
                </div>
                <div className="text-[10px] text-gray-400 max-w-[200px] mx-auto leading-normal">
                  {language === 'tr'
                    ? 'Yukarıdaki Dosya veya Klasör butonundan müziklerinizi ekleyin.'
                    : 'Add your music using the File or Folder button above.'}
                </div>
              </div>
            ) : (
              filteredTracks.map((t, idx) => {
                const isSelected = t.id === currentTrackId;
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTrack(t.id)}
                    className={`p-2 rounded-xl cursor-pointer flex items-center justify-between gap-2.5 transition group ${
                      isSelected
                        ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs font-bold'
                        : 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isSelected
                            ? 'bg-black/20 dark:bg-white/20 text-[var(--accent-contrast)]'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'
                        }`}
                      >
                        {isSelected && isPlaying ? (
                          <span className="w-2 h-2 rounded-full bg-[var(--accent-contrast)] animate-ping"></span>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs truncate font-extrabold">{t.title}</div>
                        <div
                          className={`text-[10px] truncate opacity-90`}
                        >
                          {t.artist}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] opacity-80 font-mono">
                        {t.duration}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="px-3 py-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 flex items-center justify-between text-[10px] text-gray-400">
            <span>{tracks.length} {language === 'tr' ? 'parça mevcut' : 'tracks available'}</span>
            <span className="flex items-center gap-1 text-[var(--accent-color)] font-medium">
              ● {language === 'tr' ? 'Her yerde gezilebilir' : 'Floating anywhere'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

