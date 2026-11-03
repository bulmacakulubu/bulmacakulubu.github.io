export type GameId =
  | 'kelime-bulmaca'
  | 'kare-bulmaca'
  | 'anagram'
  | 'kelime-turetme'
  | 'sozcuk-avi'
  | 'adam-asmaca'
  | 'satranc'
  | 'sudoku'
  | 'kelime-zinciri'
  | 'hafiza-kartlari'
  | 'nokta-avi'
  | 'baglantilar'
  | 'nonogram'
  | 'gunun-bulmacasi';

export interface GameStats {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  bestTime?: number; // in seconds
  bestScore?: number;
}

export type AllStats = Record<GameId, GameStats>;

export type PaletteId =
  | 'emerald'
  | 'obsidian'
  | 'nordic'
  | 'kyoto'
  | 'cyber'
  | 'aurora'
  | 'monochrome'
  | 'sage'
  | 'classic'
  | 'pastel'
  | 'oled';

export interface Settings {
  theme: 'light' | 'dark';
  palette: PaletteId;
  language: 'tr' | 'en';
  soundEnabled: boolean;
  volume: number; // 0 - 100
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  playlistName: string;
  audioUrl?: string;
  isBuiltIn?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'guest';
  createdAt: string;
  rating: number;
  isPremium?: boolean;
  premiumExpiresAt?: string;
}

export interface MultiplayerSession {
  roomCode: string;
  isHost: boolean;
  gameId: GameId;
  opponentName?: string;
  connected: boolean;
  playerColor?: 'white' | 'black';
}
