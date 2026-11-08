import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { Sparkles, RotateCcw, Bomb, Flame, Zap, Share2, MessageSquare, ShieldCheck } from 'lucide-react';
import { shareScore, openWhatsAppShare } from '../utils/shareService';

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
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isBombTicking, setIsBombTicking] = useState(false);

  const [dot, setDot] = useState<{ id: number; x: number; y: number; type: DotType }>({
    id: 1,
    x: 50,
    y: 50,
    type: 'normal',
  });

  const dotTimerRef = useRef<any>(null);

  // Clear timer helper
  const clearDotTimer = () => {
    if (dotTimerRef.current) {
      clearTimeout(dotTimerRef.current);
      dotTimerRef.current = null;
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 1000);
  };

  // Main 30-second game countdown
  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      clearDotTimer();
      if (soundEnabled) playSound('win');
      confetti({ particleCount: 90, spread: 70 });
      onGameEnd(true, score);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score]);

  // Clean timer on unmount
  useEffect(() => {
    return () => clearDotTimer();
  }, []);

  const spawnDot = () => {
    clearDotTimer();
    const x = Math.floor(Math.random() * 80) + 10;
    const y = Math.floor(Math.random() * 70) + 15;
    const rand = Math.random();
    let type: DotType = 'normal';
    if (rand < 0.22) type = 'bomb';
    else if (rand < 0.38) type = 'golden';

    const newDot = { id: Date.now(), x, y, type };
    setDot(newDot);

    // BOMB LIFECYCLE: Automatically defuses and disappears after 1.3 seconds!
    if (type === 'bomb') {
      setIsBombTicking(true);
      dotTimerRef.current = setTimeout(() => {
        setIsBombTicking(false);
        // Player successfully dodged the bomb!
        showFeedback(isTr ? 'Bombadan Kaçtın! 🛡️' : 'Bomb Dodged! 🛡️');
        if (soundEnabled) playSound('click');
        spawnDot();
      }, 1300);
    } else {
      setIsBombTicking(false);
      // Normal or golden dots auto-relocate after 2.4s if not clicked
      dotTimerRef.current = setTimeout(() => {
        spawnDot();
      }, 2400);
    }
  };

  // Initialize on mount
  useEffect(() => {
    spawnDot();
  }, []);

  const handleDotClick = () => {
    if (!isPlaying) return;
    clearDotTimer();

    if (dot.type === 'bomb') {
      // Punish for clicking bomb
      if (soundEnabled) playSound('error');
      setCombo(1);
      setScore((s) => Math.max(0, s - 5));
      showFeedback(isTr ? '💥 BOMBA PATLADI! -5' : '💥 BOOM! -5');
    } else if (dot.type === 'golden') {
      // Golden star bonus
      if (soundEnabled) playSound('success');
      const nextCombo = Math.min(5, combo + 1);
      setCombo(nextCombo);
      const added = 3 * nextCombo;
      setScore((s) => s + added);
      showFeedback(`⭐ +${added}`);
    } else {
      // Normal click
      if (soundEnabled) playSound('tile');
      const nextCombo = Math.min(5, combo + 1);
      setCombo(nextCombo);
      const added = 1 * nextCombo;
      setScore((s) => s + added);
    }

    spawnDot();
  };

  const resetGame = () => {
    clearDotTimer();
    setScore(0);
    setCombo(1);
    setTimeLeft(30);
    setIsPlaying(true);
    setFeedbackMsg(null);
    spawnDot();
  };

  return (
    <div className="w-full h-full max-h-[calc(100vh-125px)] flex flex-col items-center justify-between select-none py-1 max-w-xl sm:max-w-2xl">
      {/* UNIFORM CONTROL BAR */}
      <div className="w-full flex items-center justify-between pb-1.5 border-b border-[var(--border-color)] text-xs font-semibold">
        {/* LEFT: Target */}
        <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
          {isTr ? 'HEDEF' : 'TARGET'}{' '}
          <span className="font-extrabold text-[var(--accent-color)] ml-1">
            {isTr ? '40 Puan' : '40 Points'}
          </span>
        </div>

        {/* CENTER: Live Metrics */}
        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            ⏱ {timeLeft}.0s
          </div>
          <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isTr ? 'SKOR' : 'SCORE'}{' '}
            <span className="font-extrabold text-[var(--accent-color)]">{score}</span>
          </div>
          <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs flex items-center gap-1">
            <Flame size={13} className={combo > 1 ? 'text-amber-500 fill-amber-500' : 'text-gray-400'} />
            <span className="font-black text-amber-500">{combo}x</span>
          </div>
        </div>

        {/* RIGHT: Restart Button */}
        <button
          onClick={resetGame}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>{isTr ? 'Yeni Oyun' : 'New'}</span>
        </button>
      </div>

      {/* Game Arena */}
      <div className="w-full h-72 border-2 border-[var(--border-color)] rounded-3xl relative bg-[var(--bg-card)] overflow-hidden shadow-md">
        {/* Floating feedback message */}
        {feedbackMsg && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-xl bg-gray-900/90 text-white font-extrabold text-xs shadow-lg animate-bounce pointer-events-none">
            {feedbackMsg}
          </div>
        )}

        {isPlaying && (
          <button
            key={dot.id}
            onClick={handleDotClick}
            style={{ top: `${dot.y}%`, left: `${dot.x}%` }}
            className={`absolute w-14 h-14 -ml-7 -mt-7 rounded-full transition-transform active:scale-90 flex items-center justify-center font-black text-xs cursor-pointer select-none ${
              dot.type === 'bomb'
                ? 'bg-rose-600 text-white shadow-xl ring-4 ring-rose-300 dark:ring-rose-900 animate-pulse'
                : dot.type === 'golden'
                ? 'bg-amber-400 text-amber-950 shadow-lg ring-4 ring-amber-200 animate-bounce'
                : 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-md ring-4 ring-[var(--accent-light)]'
            }`}
          >
            {dot.type === 'bomb' && (
              <div className="relative flex items-center justify-center">
                <Bomb size={22} className="text-white" />
                {/* SVG Countdown Fuse Ring (1.3s) */}
                <svg className="absolute -inset-1.5 w-17 h-17 -rotate-90 pointer-events-none">
                  <circle
                    cx="34"
                    cy="34"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-amber-300 transition-all duration-[1300ms] ease-linear"
                    style={{
                      strokeDasharray: '175',
                      strokeDashoffset: isBombTicking ? '175' : '0',
                    }}
                  />
                </svg>
              </div>
            )}
            {dot.type === 'golden' && <Sparkles size={22} />}
            {dot.type === 'normal' && <Zap size={20} />}
          </button>
        )}

        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xs text-white p-6 animate-fadeIn">
            <h3 className="text-xl font-black mb-1">
              {isTr ? 'Süre Bitti! 🎉' : "Time's Up! 🎉"}
            </h3>
            <p className="text-xs text-white/80 mb-3">
              {isTr ? 'Ulaştığınız nihai skor: ' : 'Final score: '}
              <b className="text-amber-300 text-base">{score}</b>
            </p>

            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                onClick={async () => {
                  await shareScore({
                    title: isTr ? 'Bulmaca Kulübü - Nokta Avı' : 'Puzzle Club - Dot Hunt',
                    gameName: isTr ? 'Nokta Avı' : 'Dot Hunt',
                    scoreOrAttempts: `${score} ${isTr ? 'Puan' : 'Points'}`,
                  });
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Share2 size={14} className="text-amber-400" />
                <span>{isTr ? 'Skoru Paylaş' : 'Share Score'}</span>
              </button>
            </div>

            <button
              onClick={resetGame}
              className="px-6 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-extrabold text-xs transition shadow-md cursor-pointer"
            >
              {isTr ? 'Tekrar Oyna' : 'Play Again'}
            </button>
          </div>
        )}
      </div>

      <div className="text-[11px] text-gray-400 text-center leading-normal">
        {isTr
          ? '⚡ Normal: +1 · ⭐ Altın Yıldız: +3 · 💣 Bomba: Dokunma! 1.3 saniye içinde patlamadan kendiliğinden yok olur.'
          : '⚡ Normal: +1 · ⭐ Golden: +3 · 💣 Bomb: Avoid! Disappears on its own within 1.3s.'}
      </div>
    </div>
  );
};