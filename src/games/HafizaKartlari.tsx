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
} from 'lucide-react';

interface HafizaKartlariProps {
  onGameEnd: (won: boolean, timeSec: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
}

const ALL_ICONS = [Fish, Anchor, Compass, Shell, Waves, Ship, Gift, Star];

export const HafizaKartlari: React.FC<HafizaKartlariProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
}) => {
  const isTr = language === 'tr';
  const [cards, setCards] = useState<{ id: number; iconIdx: number; flipped: boolean; matched: boolean }[]>([]);
  const [firstSelected, setFirstSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

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

  const handleCardClick = (id: number) => {
    if (!isPlaying) return;
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
    <div className="w-full flex flex-col items-center justify-center select-none space-y-4 pt-1">
      {/* UNIFORM CONTROL BAR */}
      <div className="w-full max-w-xl flex items-center justify-between pb-2 border-b border-[var(--border-color)] text-xs font-semibold">
        {/* LEFT: Grid Mode */}
        <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
          {isTr ? 'KARTLAR' : 'CARDS'}{' '}
          <span className="font-extrabold text-[var(--accent-color)] ml-1">4x4 (16)</span>
        </div>

        {/* CENTER: Live Metrics */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            ⏱ {formatTime(seconds)}
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isTr ? 'HAMLE' : 'MOVES'}{' '}
            <span className="font-extrabold text-[var(--accent-color)]">{moves}</span>
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isTr ? 'EŞLEŞME' : 'MATCHES'}{' '}
            <span className="font-extrabold text-[var(--accent-color)]">
              {matches}/{ALL_ICONS.length}
            </span>
          </div>
        </div>

        {/* RIGHT: Restart Button (Always in the same top-right spot) */}
        <button
          onClick={initGame}
          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs"
        >
          <RotateCcw size={13} />
          <span>{isTr ? 'Yeni Oyun' : 'New Game'}</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-3 py-2 justify-center max-w-md w-full">
        {cards.map((card) => {
          const Icon = ALL_ICONS[card.iconIdx];
          const isRevealed = card.flipped || card.matched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 transform shadow-sm ${
                isRevealed
                  ? 'bg-[var(--bg-card)] text-[var(--accent-color)] border-2 border-[var(--accent-color)] rotate-0 scale-100 shadow-md ring-2 ring-[var(--accent-color)]/20'
                  : 'bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-gray-400 border border-[var(--border-color)] hover:scale-102 cursor-pointer'
              }`}
            >
              {isRevealed ? (
                <Icon size={28} className={card.matched ? 'text-emerald-500 animate-pulse' : ''} />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-dashed border-gray-400 opacity-60"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Game Finished Overlay / Card */}
      {!isPlaying && (
        <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-center shadow-lg animate-fadeIn">
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            {isTr ? 'Harika! Tüm Çiftleri Eşleştirdiniz! 🎉' : 'Awesome! You matched all pairs! 🎉'}
          </div>
          <div className="text-xs text-gray-500 mb-3">
            {isTr
              ? `Toplam ${moves} hamlede ve ${formatTime(seconds)} sürede tamamladınız.`
              : `Completed in ${moves} moves and ${formatTime(seconds)}.`}
          </div>
          <button
            onClick={initGame}
            className="px-5 py-2 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-xl font-extrabold text-xs transition shadow-sm"
          >
            {isTr ? 'Yeniden Oyna' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
};