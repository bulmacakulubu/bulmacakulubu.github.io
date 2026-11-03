import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { RotateCcw } from 'lucide-react';
import { validateAndGetMeaning } from '../utils/dictionaryService';

interface KelimeZinciriProps {
  onGameEnd: (won: boolean, score?: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
}

const INITIAL_WORDS_TR = ['KİTAP', 'MASA', 'KALEM', 'BİLGİ', 'DENİZ', 'GÜNEŞ'];
const INITIAL_WORDS_EN = ['PLANET', 'TIGER', 'RIVER', 'ROBOT', 'TRAIN', 'NATURE'];

export const KelimeZinciri: React.FC<KelimeZinciriProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
}) => {
  const isTr = language === 'tr';
  const initialPool = isTr ? INITIAL_WORDS_TR : INITIAL_WORDS_EN;

  const [chain, setChain] = useState<string[]>([initialPool[0]]);
  const [inputVal, setInputVal] = useState('');
  const [timeLeft, setTimeLeft] = useState(90);
  const [isPlaying, setIsPlaying] = useState(true);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const currentWord = chain[chain.length - 1];
  const requiredLetter = currentWord[currentWord.length - 1];

  // Reset when language changes
  useEffect(() => {
    const pool = isTr ? INITIAL_WORDS_TR : INITIAL_WORDS_EN;
    setChain([pool[0]]);
    setInputVal('');
    setTimeLeft(90);
    setIsPlaying(true);
    setScore(0);
    setErrorMsg('');
  }, [language]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      if (score >= 30) {
        if (soundEnabled) playSound('win');
        confetti({ particleCount: 90, spread: 70 });
        onGameEnd(true, score);
      } else {
        if (soundEnabled) playSound('error');
        onGameEnd(false, score);
      }
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, soundEnabled, onGameEnd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying) return;

    const trimmed = isTr
      ? inputVal.trim().toLocaleUpperCase('tr-TR')
      : inputVal.trim().toUpperCase();

    if (trimmed.length < 3) {
      setErrorMsg(isTr ? 'Kelime en az 3 harfli olmalıdır.' : 'Word must be at least 3 letters.');
      if (soundEnabled) playSound('error');
      return;
    }

    if (trimmed[0] !== requiredLetter) {
      setErrorMsg(
        isTr
          ? `Kelime "${requiredLetter}" harfiyle başlamalıdır!`
          : `Word must start with letter "${requiredLetter}"!`
      );
      if (soundEnabled) playSound('error');
      return;
    }

    if (chain.includes(trimmed)) {
      setErrorMsg(
        isTr
          ? 'Bu kelime daha önce zincirde kullanıldı.'
          : 'This word has already been used in the chain.'
      );
      if (soundEnabled) playSound('error');
      return;
    }

    // Hybrid Dictionary Check
    const validation = await validateAndGetMeaning(trimmed, language);
    if (!validation.isValid) {
      setErrorMsg(
        isTr
          ? `"${trimmed}" sözlükte geçerli bulunamadı!`
          : `"${trimmed}" not recognized in dictionary!`
      );
      if (soundEnabled) playSound('error');
      return;
    }

    // Valid word added
    if (soundEnabled) playSound('success');
    const nextChain = [...chain, trimmed];
    setChain(nextChain);
    const addedScore = trimmed.length * 10;
    setScore((s) => s + addedScore);
    setInputVal('');
    setErrorMsg('');

    if (nextChain.length >= 10) {
      setIsPlaying(false);
      if (soundEnabled) playSound('win');
      confetti({ particleCount: 100, spread: 80 });
      onGameEnd(true, score + addedScore);
    }
  };

  const resetGame = () => {
    const randomStart = initialPool[Math.floor(Math.random() * initialPool.length)];
    setChain([randomStart]);
    setInputVal('');
    setTimeLeft(90);
    setIsPlaying(true);
    setScore(0);
    setErrorMsg('');
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-xl flex flex-col items-center justify-start select-none space-y-3 pt-1">
      {/* UNIFORM CONTROL BAR */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        {/* LEFT: Mode */}
        <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs text-xs font-semibold">
          {isTr ? 'MOD' : 'MODE'}{' '}
          <span className="font-extrabold text-[var(--accent-color)] ml-1">
            {isTr ? 'Kelime Zinciri' : 'Word Chain'}
          </span>
        </div>

        {/* CENTER: Live Metrics */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            ⏱ {formatTime(timeLeft)}
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isTr ? 'PUAN' : 'SCORE'}{' '}
            <span className="font-extrabold text-[var(--accent-color)]">{score}</span>
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isTr ? 'ZİNCİR' : 'CHAIN'}{' '}
            <span className="font-extrabold text-[var(--accent-color)]">{chain.length}</span>
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

      <div className="w-full flex flex-col sm:flex-row gap-4 items-start justify-center">
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center w-full max-w-md mb-6 shadow-xs">
            <div className="text-xs text-amber-800 dark:text-amber-200 font-bold mb-1">
              {isTr ? 'SON KELİME' : 'LAST WORD'}
            </div>
            <div className="text-3xl font-extrabold text-amber-950 dark:text-amber-100 tracking-wider mb-2">
              {currentWord}
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300">
              {isTr ? 'Şu harfle başlayan bir kelime yaz:' : 'Type a word starting with:'}{' '}
              <span className="font-bold uppercase text-sm underline">{requiredLetter}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md flex gap-2 mb-3">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={!isPlaying}
              placeholder={
                isTr
                  ? `"${requiredLetter}" ile başlayan kelime...`
                  : `Word starting with "${requiredLetter}"...`
              }
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!isPlaying}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              {isTr ? 'Ekle' : 'Add'}
            </button>
          </form>

          {errorMsg && <div className="text-xs text-red-500 font-semibold">{errorMsg}</div>}
        </div>

        {/* Chain history sidebar */}
        <div className="w-64 h-80 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 bg-gray-50/50 dark:bg-gray-800/40 flex flex-col">
          <h4 className="font-bold text-xs mb-2 border-b border-gray-200 dark:border-gray-800 pb-1.5">
            {isTr ? 'KELİME ZİNCİRİ' : 'WORD CHAIN'}
          </h4>
          <div className="space-y-1.5 overflow-y-auto flex-1">
            {chain.map((w, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl text-xs font-semibold flex justify-between items-center bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800"
              >
                <span>{idx + 1}. {w}</span>
                <span className="text-[10px] text-amber-600 font-bold">+{w.length * 10}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};