import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic, FolderOpen, Files, ExternalLink } from 'lucide-react';
import { Track } from '../types';

interface MusicPlayerProps {
  volume: number;
  soundEnabled: boolean;
  tracks: Track[];
  onAddTracks: (tracks: Track[]) => void;
  currentTrackId: string;
  onSelectTrack: (id: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  language: 'tr' | 'en';
  onOpenFloatingStation?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  volume,
  soundEnabled,
  tracks,
  onAddTracks,
  currentTrackId,
  onSelectTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  language,
  onOpenFloatingStation,
}) => {
  const [showPlaylist, setShowPlaylist] = useState(false);

  const currentTrack = tracks.find((t) => t.id === currentTrackId) || tracks[0];

  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: Track[] = Array.from(files).map((file, idx) => ({
      id: `local_${Date.now()}_${idx}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: language === 'tr' ? 'Yerel Dosya' : 'Local File',
      duration: '3:00',
      playlistName: 'Liste 1',
      audioUrl: URL.createObjectURL(file),
    })) as any;

    onAddTracks(newTracks);
    if (newTracks.length > 0 && !currentTrackId) {
      onSelectTrack(newTracks[0].id);
    }
  };

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
          <span>{language === 'tr' ? 'MÜZİK' : 'MUSIC'}</span>
          {isPlaying && (
            <span className="flex gap-0.5">
              <span className="w-1 h-2 bg-gray-900 dark:bg-white animate-pulse rounded-full"></span>
              <span className="w-1 h-3 bg-gray-900 dark:bg-white animate-pulse delay-75 rounded-full"></span>
              <span className="w-1 h-1.5 bg-gray-900 dark:bg-white animate-pulse delay-150 rounded-full"></span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenFloatingStation && (
            <button
              onClick={onOpenFloatingStation}
              className="p-1 hover:text-[var(--accent-color)] text-gray-500 transition flex items-center gap-1"
              title={language === 'tr' ? 'Yüzen Taşınabilir Listeyi Aç' : 'Open Floating Playlist'}
            >
              <ExternalLink size={13} />
            </button>
          )}
          {/* Multiple Files Upload */}
          <label className="cursor-pointer p-1 hover:text-gray-900 dark:hover:text-white transition" title={language === 'tr' ? 'Çoklu Müzik Seç' : 'Select Multiple Audio'}>
            <Files size={13} />
            <input type="file" accept="audio/*" multiple onChange={handleFilesUpload} className="hidden" />
          </label>
          {/* Folder Upload */}
          <label className="cursor-pointer p-1 hover:text-gray-900 dark:hover:text-white transition" title={language === 'tr' ? 'Müzik Klasörü Ekle' : 'Add Music Folder'}>
            <FolderOpen size={13} />
            <input
              type="file"
              accept="audio/*"
              multiple
              {...({ webkitdirectory: '', directory: '' } as any)}
              onChange={handleFilesUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => {
              if (onOpenFloatingStation) {
                onOpenFloatingStation();
              } else {
                setShowPlaylist(!showPlaylist);
              }
            }}
            className="flex items-center gap-0.5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
            title={language === 'tr' ? 'Çalma Listesi' : 'Playlist'}
          >
            <ListMusic size={13} />
            <span className="text-[10px]">{tracks.length}</span>
          </button>
        </div>
      </div>

      {showPlaylist && (
        <div className="mb-2.5 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-1 max-h-32 overflow-y-auto">
          {tracks.length === 0 ? (
            <div className="text-[11px] text-gray-400 text-center py-1">
              {language === 'tr' ? 'Müzik yok. Çoklu dosya veya klasör ekleyin.' : 'No music. Add files or folder.'}
            </div>
          ) : (
            tracks.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  onSelectTrack(t.id);
                  setShowPlaylist(false);
                }}
                className={`p-1.5 rounded cursor-pointer truncate text-[11px] ${
                  t.id === currentTrackId
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {t.title}
              </div>
            ))
          )}
        </div>
      )}

      <div className="text-gray-900 dark:text-gray-100 font-medium truncate">
        {currentTrack ? currentTrack.title : (language === 'tr' ? 'Çalan bir şey yok' : 'No track playing')}
      </div>
      <div className="text-gray-500 dark:text-gray-400 text-[10px] truncate mb-2">
        {currentTrack ? currentTrack.artist : (language === 'tr' ? 'Listeden dosya seçin' : 'Select file from list')}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrevTrack}
            className="p-1 hover:text-gray-900 dark:hover:text-white transition text-gray-600 dark:text-gray-300"
          >
            <SkipBack size={15} />
          </button>
          <button
            onClick={onTogglePlay}
            disabled={!soundEnabled || !currentTrack}
            className={`p-2 rounded-full ${
              soundEnabled && currentTrack
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-105 shadow-2xs'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            } transition`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
          </button>
          <button
            onClick={onNextTrack}
            className="p-1 hover:text-gray-900 dark:hover:text-white transition text-gray-600 dark:text-gray-300"
          >
            <SkipForward size={15} />
          </button>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Volume2 size={13} />
          <span>{volume}%</span>
        </div>
      </div>
    </div>
  );
};
