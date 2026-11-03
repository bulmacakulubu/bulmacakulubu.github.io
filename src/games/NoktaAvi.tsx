import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { Sparkles, RotateCcw, Bomb, Flame, Zap } from 'lucide-react';

interface NoktaAviProps {
  onGameEnd: (won: boolean, score: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
}

type DotType = 'normal' | 'bomb' | 'golden';

export const NoktaAvi: React.FC<NoktaAviProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
}) => {
  const isTr = language === 'tr';
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(true);
  const [dot, setDot] = useState<{ x: number; y: number; type: DotType }>({
    x: 50,
    y: 50,
    type: 'normal',
  });

  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      if (soundEnabled) playSound('win');
      confetti({ particleCount: 90, spread: 70 });
      onGameEnd(true, score);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score]);

  const spawnDot = () => {
    const x = Math.floor(Math.random() * 80) + 10;
    const y = Math.floor(Math.random() * 70) + 15;
    const rand = Math.random();
    let type: DotType = 'normal';
    if (rand < 0.22) type = 'bomb';
    else if (rand < 0.38) type = 'golden';

    setDot({ x, y, type });
  };

  const handleDotClick = () => {
    if (!isPlaying) return;

    if (dot.type === 'bomb') {
      if (soundEnabled) playSound('error');
      setCombo(1);
      setScore((s) => Math.max(0, s - 5));
    } else if (dot.type === 'golden') {
      if (soundEnabled) playSound('success');
      setCombo((c) => Math.min(5, c + 1));
      setScore((s) => s + 3 * combo);
    } else {
      if (soundEnabled) playSound('tile');
      setCombo((c) => Math.min(5, c + 1));
      setScore((s) => s + 1 * combo);
    }
    spawnDot();
  };

  const resetGame = () => {
    setScore(0);
    setCombo(1);
    setTimeLeft(30);
    setIsPlaying(true);
    spawnDot();
  };

  return (
    <div className="w-full max-w-xl flex flex-col items-center justify-center select-none space-y-3 pt-1">
      {/* UNIFORM CONTROL BAR */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-[var(--border-color)] text-xs font-semibold">
        {/* LEFT: Target */}
        <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
          {isTr ? 'HEDEF' : 'TARGET'}{' '}
          <span className="font-extrabold text-[var(--accent-color)] ml-1">
            {isTr ? '40 Puan' : '40 Points'}
          </span>
        </div>

        {/* CENTER: Live Metrics */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            ⏱ {timeLeft}.0s
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isTr ? 'SKOR' : 'SCORE'}{' '}
            <span className="font-extrabold text-[var(--accent-color)]">{score}</span>
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs flex items-center gap-1">
            <Flame size={13} className={combo > 1 ? 'text-amber-500 fill-amber-500' : 'text-gray-400'} />
            <span>{combo}x</span>
          </div>
        </div>

        {/* RIGHT: Restart Button (Always in the same top-right spot) */}
        <button
          onClick={resetGame}
          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs"
        >
          <RotateCcw size={13} />
          <span>{isTr ? 'Yeni Oyun' : 'New Game'}</span>
        </button>
      </div>

      {/* Game Arena */}
      <div className="w-full h-72 border-2 border-[var(--border-color)] rounded-3xl relative bg-[var(--bg-card)] overflow-hidden shadow-md">
        {isPlaying && (
          <button
            onClick={handleDotClick}
            style={{ top: `${dot.y}%`, left: `${dot.x}%` }}
            className={`absolute w-14 h-14 -ml-7 -mt-7 rounded-full transition-transform active:scale-90 flex items-center justify-center font-black text-xs cursor-pointer ${
              dot.type === 'bomb'
                ? 'bg-rose-600 text-white shadow-lg ring-4 ring-rose-300 dark:ring-rose-900 animate-bounce'
                : dot.type === 'golden'
                ? 'bg-amber-400 text-amber-950 shadow-lg ring-4 ring-amber-200 animate-spin'
                : 'bg-[var(--accent-color)] text-white shadow-md ring-4 ring-[var(--accent-light)]'
            }`}
          >
            {dot.type === 'bomb' && <Bomb size={20} />}
            {dot.type === 'golden' && <Sparkles size={20} />}
            {dot.type === 'normal' && <Zap size={18} />}
          </button>
        )}

        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs text-white p-6 animate-fadeIn">
            <h3 className="text-xl font-black mb-1">
              {isTr ? 'Süre Bitti! 🎉' : "Time's Up! 🎉"}
            </h3>
            <p className="text-xs text-white/80 mb-4">
              {isTr ? 'Ulaştığınız nihai skor: ' : 'Final score: '}
              <b className="text-amber-300 text-sm">{score}</b>
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold text-xs transition shadow-md"
            >
              {isTr ? 'Tekrar Oyna' : 'Play Again'}
            </button>
          </div>
        )}
      </div>

      <div className="text-[11px] text-gray-400 text-center">
        {isTr
          ? 'Yeşil/Normal: +1 Puan · Altın Yıldız: +3 Puan · Kırmızı Bomba: -5 Puan ve seriyi sıfırlar!'
          : 'Green/Normal: +1 Pt · Golden Star: +3 Pts · Red Bomb: -5 Pts & resets streak!'}
      </div>
    </div>
  );
};