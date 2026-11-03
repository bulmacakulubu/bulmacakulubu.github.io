// Web Audio API Synthesizer & Sound Effects

let audioCtx: AudioContext | null = null;
let currentOscillator: OscillatorNode | null = null;
let currentGain: GainNode | null = null;
let isPlayingMusic = false;
let musicInterval: any = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type: 'click' | 'win' | 'error' | 'success' | 'tile', volume = 0.5) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const vol = Math.max(0, Math.min(1, volume));
    gain.gain.setValueAtTime(vol * 0.2, ctx.currentTime);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'tile') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'win') {
      osc.type = 'triangle';
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.frequency.setValueAtTime(freq, ctx.currentTime);
            g.gain.setValueAtTime(0.15, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            o.connect(g);
            g.connect(ctx.destination);
            o.start();
            o.stop(ctx.currentTime + 0.3);
          } catch (e) {}
        }, idx * 120);
      });
      return;
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(110, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
  } catch (e) {
    // Audio context not allowed until user interaction
  }
}

import { Track } from '../types';

export const BUILT_IN_TRACKS: Track[] = [
  {
    id: 'builtin_0',
    title: 'Lo-Fi Bulmaca Rüyası',
    artist: 'Bulmaca Kulübü Ambient',
    duration: '∞ Odak',
    playlistName: 'Dahili Odak Radyosu',
    isBuiltIn: true,
  },
  {
    id: 'builtin_1',
    title: 'Gece Kahvesi & Yağmur',
    artist: 'Bulmaca Kulübü Ambient',
    duration: '∞ Odak',
    playlistName: 'Dahili Odak Radyosu',
    isBuiltIn: true,
  },
  {
    id: 'builtin_2',
    title: 'Zen Meditasyonu & Akarsu',
    artist: 'Bulmaca Kulübü Ambient',
    duration: '∞ Odak',
    playlistName: 'Dahili Odak Radyosu',
    isBuiltIn: true,
  },
  {
    id: 'builtin_3',
    title: 'Umut Işığı & Gün Doğumu',
    artist: 'Bulmaca Kulübü Ambient',
    duration: '∞ Odak',
    playlistName: 'Dahili Odak Radyosu',
    isBuiltIn: true,
  },
];

// Ambient chill Lo-Fi background generator
let currentAmbientVolume = 0.3;

export function setAmbientVolume(vol: number) {
  currentAmbientVolume = Math.max(0, Math.min(1, vol));
}

export function startAmbientMusic(volume = 0.3, trackIndex = 0) {
  stopAmbientMusic();
  currentAmbientVolume = Math.max(0, Math.min(1, volume));
  try {
    const ctx = getAudioContext();
    isPlayingMusic = true;

    // Pentatonic chord frequencies (C Major / Am chill ambient)
    const chordSets = [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [220.00, 261.63, 329.63, 440.00], // A minor
      [349.23, 440.00, 523.25, 698.46], // F Major
      [392.00, 493.88, 587.33, 783.99], // G Major
    ];

    const chords = chordSets[trackIndex % chordSets.length];

    function playChord() {
      if (!isPlayingMusic) return;
      try {
        chords.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq * (Math.random() > 0.5 ? 1 : 0.5), ctx.currentTime);

          const vol = currentAmbientVolume * 0.12;
          gain.gain.setValueAtTime(0.001, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.5);
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 4.5);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 4.5);
        });
      } catch (e) {}
    }

    playChord();
    musicInterval = setInterval(playChord, 5000);
  } catch (e) {
    isPlayingMusic = false;
  }
}

export function stopAmbientMusic() {
  isPlayingMusic = false;
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  if (currentOscillator) {
    try {
      currentOscillator.stop();
    } catch (e) {}
    currentOscillator = null;
  }
}

export function isMusicPlaying() {
  return isPlayingMusic;
}
