import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import {
  Fish,
  Anchor,
  Compass,
  Shell,
  Waves,
  Ship,
  Gift,
  Star,
  RotateCcw,
  Lightbulb,
  Share2,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { triggerAdBreak } from '../utils/adSenseService';
import { shareScore, openWhatsAppShare } from '../utils/shareService';
import { showToast } from '../utils/toastService';

interface HafizaKartlariProps {
  onGameEnd: (won: boolean, timeSec: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
  isPremium?: boolean;
}

const ALL_ICONS = [Fish, Anchor, Compass, Shell, Waves, Ship, Gift, Star];

export const HafizaKartlari: React.FC<HafizaKartlariProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
  isPremium = false,
}) => {
  const isTr = language === 'tr';
  const [cards, setCards] = useState<{ id: number; iconIdx: number; flipped: boolean; matched: boolean }[]>([]);
  const [firstSelected, setFirstSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [combo, setCombo] = useState(1);
  const [isPeeking, setIsPeeking] = useState(false);

  const initGame = () => {
    const deck = [...ALL_ICONS, ...ALL_ICONS]
      .map((_, idx) => ({
        id: idx,
        iconIdx: idx % ALL_ICONS.length,
        flipped: false,
        matched: false,
      }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
    setFirstSelected(null);
    setMoves(0);
    setMatches(0);
    setSeconds(0);
    setIsPlaying(true);
    setCombo(1);
    setIsPeeking(false);
  };

  useEffect(() => {
    initGame();
  }, [language]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Rewarded Hint: Peek all cards for 1.2s
  const handleHint = () => {
    if (!isPlaying || isPeeking) return;

    const doPeek = () => {
      setIsPeeking(true);
      if (soundEnabled) playSound('success');
      showToast(isTr ? '💡 İpucu: Kartlar kısa süreliğine açıldı!' : '💡 Hint: Cards revealed briefly!');
      setTimeout(() => {
        setIsPeeking(false);
      }, 1400);
    };

    if (isPremium) {
      doPeek();
    } else {
      triggerAdBreak({
        type: 'reward',
        name: 'memory_hint',
        adBreakDone: () => {
          doPeek();
        },
      });
    }
  };

  const handleCardClick = (id: number) => {
    if (!isPlaying || isPeeking) return;
    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.flipped || clickedCard.matched) return;

    if (soundEnabled) playSound('click');
    const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    setCards(newCards);

    if (firstSelected === null) {
      setFirstSelected(id);
    } else {
      setMoves((m) => m + 1);
      const firstCard = newCards.find((c) => c.id === firstSelected);

      if (firstCard && firstCard.iconIdx === clickedCard.iconIdx) {
        if (soundEnabled) playSound('success');
        setCombo((c) => c + 1);
        const updatedCards = newCards.map((c) =>
          c.id === id || c.id === firstSelected ? { ...c, matched: true } : c
        );
        setCards(updatedCards);
        setFirstSelected(null);
        const nextMatches = matches + 1;
        setMatches(nextMatches);

        if (nextMatches === ALL_ICONS.length) {
          setIsPlaying(false);
          if (soundEnabled) playSound('win');
          confetti({ particleCount: 110, spread: 80 });
          onGameEnd(true, seconds);
        }
      } else {
        if (soundEnabled) playSound('error');
        setCombo(1);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === id || c.id === firstSelected ? { ...c, flipped: false } : c))
          );
          setFirstSelected(null);
        }, 750);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full h-full max-h-[calc(100vh-125px)] flex flex-col items-center justify-between select-none py-1 max-w-xl sm:max-w-2xl">
      {/* UNIFORM CONTROL BAR */}
      <div className="w-full max-w-xl flex items-center justify-between pb-1.5 border-b border-[var(--border-color)] text-xs font-semibold">
        {/* LEFT: Grid Mode */}
        <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
          {isTr ? 'KARTLAR' : 'CARDS'}{' '}
          <span className="font-extrabold text-[var(--accent-color)] ml-1">4x4</span>
        </div>

        {/* CENTER: Live Metrics */}
        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            ⏱ {formatTime(seconds)}
          </div>
          <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isTr ? 'HAMLE' : 'MOVES'}{' '}
            <span className="font-extrabold text-[var(--accent-color)]">{moves}</span>
          </div>
          <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs flex items-center gap-1">
            <span>{isTr ? 'EŞLEŞME' : 'MATCH'}</span>
            <span className="font-extrabold text-[var(--accent-color)]">
              {matches}/{ALL_ICONS.length}
            </span>
            {combo > 1 && (
              <span className="text-[10px] bg-amber-500/20 text-amber-500 font-black px-1 rounded animate-pulse">
                {combo}x
              </span>
            )}
          </div>
        </div>

        {/* RIGHT: Hint & Restart Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleHint}
            disabled={!isPlaying || isPeeking}
            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-40"
            title={isPremium ? 'VIP İpucu' : 'Ödüllü Reklam ile İpucu'}
          >
            <Lightbulb size={13} />
            <span>{isTr ? 'İpucu' : 'Hint'}</span>
          </button>

          <button
            onClick={initGame}
            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>{isTr ? 'Yeni' : 'New'}</span>
          </button>
        </div>
      </div>

      {/* 3D Flip Card Grid */}
      <div className="grid grid-cols-4 gap-2.5 py-1.5 justify-center max-w-sm sm:max-w-md w-full [perspective:1000px]">
        {cards.map((card) => {
          const Icon = ALL_ICONS[card.iconIdx];
          const isRevealed = card.flipped || card.matched || isPeeking;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="aspect-square relative cursor-pointer [transform-style:preserve-3d] transition-transform duration-300"
              style={{
                transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front of card (Hidden state) */}
              <div className="absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] shadow-sm [backface-visibility:hidden]">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-gray-400 opacity-50"></div>
              </div>

              {/* Back of card (Revealed state) */}
              <div className="absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center bg-[var(--bg-card)] border-2 border-[var(--accent-color)] shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <Icon
                  size={26}
                  className={card.matched ? 'text-emerald-500 animate-pulse' : 'text-[var(--accent-color)]'}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Game Finished Overlay / Card */}
      {!isPlaying && (
        <div className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-center shadow-lg animate-fadeIn max-w-md w-full my-1">
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            {isTr ? 'Harika! Tüm Çiftleri Eşleştirdiniz! 🎉' : 'Awesome! You matched all pairs! 🎉'}
          </div>
          <div className="text-xs text-gray-500 mb-3">
            {isTr
              ? `Toplam ${moves} hamlede ve ${formatTime(seconds)} sürede tamamladınız.`
              : `Completed in ${moves} moves and ${formatTime(seconds)}.`}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={async () => {
                await shareScore({
                  title: 'Hafıza Kartları',
                  gameName: isTr ? 'Hafıza Kartları' : 'Memory Cards',
                  scoreOrAttempts: `${moves} ${isTr ? 'hamle' : 'moves'} (${formatTime(seconds)})`,
                });
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Share2 size={14} className="text-amber-400" />
              <span>{isTr ? 'Skoru Paylaş' : 'Share Score'}</span>
            </button>
            <button
              onClick={initGame}
              className="px-4 py-2 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-xl font-extrabold text-xs transition shadow-sm cursor-pointer"
            >
              {isTr ? 'Yeniden Oyna' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};