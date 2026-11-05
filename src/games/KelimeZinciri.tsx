import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { RotateCcw, Lightbulb, Share2, MessageSquare, Zap } from 'lucide-react';
import { validateAndGetMeaning } from '../utils/dictionaryService';
import { triggerAdBreak } from '../utils/adSenseService';
import { shareScore, openWhatsAppShare } from '../utils/shareService';
import { WORDLE_WORDS_TR, WORDLE_WORDS_EN } from '../data/wordBank';

interface KelimeZinciriProps {
  onGameEnd: (won: boolean, score?: number) => void;
  soundEnabled: boolean;
  language?: 'tr' | 'en';
  isPremium?: boolean;
}

const INITIAL_WORDS_TR = ['KİTAP', 'MASA', 'KALEM', 'BİLGİ', 'DENİZ', 'GÜNEŞ'];
const INITIAL_WORDS_EN = ['PLANET', 'TIGER', 'RIVER', 'ROBOT', 'TRAIN', 'NATURE'];

export const KelimeZinciri: React.FC<KelimeZinciriProps> = ({
  onGameEnd,
  soundEnabled,
  language = 'tr',
  isPremium = false,
}) => {
  const isTr = language === 'tr';
  const initialPool = isTr ? INITIAL_WORDS_TR : INITIAL_WORDS_EN;

  const [chain, setChain] = useState<string[]>([initialPool[0]]);
  const [inputVal, setInputVal] = useState('');
  const [timeLeft, setTimeLeft] = useState(90);
  const [isPlaying, setIsPlaying] = useState(true);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [combo, setCombo] = useState(1);
  const lastSuccessTimeRef = useRef<number>(Date.now());

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
    setCombo(1);
    lastSuccessTimeRef.current = Date.now();
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

  // Rewarded Hint
  const handleHint = () => {
    if (!isPlaying) return;

    const doHint = () => {
      const wordsPool = isTr
        ? [...WORDLE_WORDS_TR[5], ...WORDLE_WORDS_TR[7]]
        : [...WORDLE_WORDS_EN[5]];

      const candidate = wordsPool.find(
        (w) => w[0] === requiredLetter && !chain.includes(w)
      );

      if (candidate) {
        setInputVal(candidate);
        if (soundEnabled) playSound('success');
      } else {
        setErrorMsg(isTr ? 'İpucu bulunamadı, aklına gelen ilk kelimeyi dene!' : 'No hint found, try your best guess!');
      }
    };

    if (isPremium) {
      doHint();
    } else {
      triggerAdBreak({
        type: 'reward',
        name: 'word_chain_hint',
        adBreakDone: () => {
          doHint();
        },
      });
    }
  };

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

    // Speed Combo calculation
    const now = Date.now();
    const elapsedSec = (now - lastSuccessTimeRef.current) / 1000;
    lastSuccessTimeRef.current = now;

    let nextCombo = 1;
    if (elapsedSec < 7) {
      nextCombo = Math.min(combo + 1, 4);
    }

    setCombo(nextCombo);

    // Valid word added
    if (soundEnabled) playSound('success');
    const nextChain = [...chain, trimmed];
    setChain(nextChain);
    const addedScore = trimmed.length * 10 * nextCombo;
    setScore((s) => s + addedScore);
    setInputVal('');
    setErrorMsg('');

    if (nextChain.length >= 12) {
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
    setCombo(1);
    lastSuccessTimeRef.current = Date.now();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-start select-none pt-1 sm:pt-2 pb-2 max-w-xl sm:max-w-2xl space-y-2 sm:space-y-3">
      {/* UNIFORM CONTROL BAR */}
      <div className="w-full flex items-center justify-between pb-1.5 border-b border-[var(--border-color)]">
        {/* LEFT: Mode */}
        <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs text-xs font-semibold">
          <span className="text-[var(--text-secondary)]">{isTr ? 'Mod' : 'Mode'}</span>{' '}
          <span className="font-bold text-[var(--accent-color)] ml-1">
            {isTr ? 'Kelime Zinciri' : 'Word Chain'}
          </span>
        </div>

        {/* CENTER: Live Metrics */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs font-mono tabular-nums">
            ⏱ {formatTime(timeLeft)}
          </div>
          <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs flex items-center gap-1">
            <span className="text-[var(--text-secondary)]">{isTr ? 'Puan' : 'Score'}</span>
            <span className="font-mono tabular-nums font-bold text-[var(--accent-color)]">{score}</span>
            {combo > 1 && (
              <span className="text-[10px] bg-[var(--accent-light)] text-[var(--accent-color)] font-bold px-1.5 py-0.5 rounded animate-pulse">
                {combo}x
              </span>
            )}
          </div>
          <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            <span className="text-[var(--text-secondary)]">{isTr ? 'Zincir' : 'Chain'}</span>{' '}
            <span className="font-mono tabular-nums font-bold text-[var(--accent-color)]">{chain.length}</span>
          </div>
        </div>

        {/* RIGHT: Hint & Restart Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleHint}
            disabled={!isPlaying}
            className="px-2.5 py-1 bg-[var(--bg-card)] hover:bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-40"
            title={isPremium ? 'VIP İpucu' : 'Ödüllü Reklam ile İpucu'}
          >
            <Lightbulb size={13} />
            <span>{isTr ? 'İpucu' : 'Hint'}</span>
          </button>

          <button
            onClick={resetGame}
            className="px-2.5 py-1 bg-[var(--bg-card)] hover:bg-[var(--accent-light)] rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-[var(--border-color)] text-[var(--text-primary)] shadow-2xs cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>{isTr ? 'Yeni' : 'New'}</span>
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col sm:flex-row gap-3 items-start justify-center">
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 text-center w-full max-w-md mb-3 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] mb-1">
              <span>{isTr ? 'Son Kelime' : 'Last Word'}</span>
              {combo > 1 && (
                <span className="px-1.5 py-0.5 bg-[var(--accent-color)] text-[var(--accent-contrast)] rounded-full text-[10px] font-extrabold flex items-center gap-0.5 animate-bounce">
                  <Zap size={10} fill="currentColor" /> {combo}x Kombo!
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-wide my-1.5">
              {currentWord}
            </div>
            <div className="text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1 mt-1">
              <span>{isTr ? 'Şu harfle başlayan bir kelime yaz:' : 'Type a word starting with:'}</span>
              <span className="font-black px-2 py-0.5 rounded-md bg-[var(--accent-color)] text-[var(--accent-contrast)] text-xs shadow-xs">
                {requiredLetter}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md flex gap-2 mb-2">
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
              className="flex-1 px-3.5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] placeholder:text-[var(--text-secondary)]/50"
              autoFocus
            />
            <button
              type="submit"
              disabled={!isPlaying}
              className="px-5 py-2.5 bg-[var(--accent-color)] hover:opacity-90 text-[var(--accent-contrast)] rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-40"
            >
              {isTr ? 'Ekle' : 'Add'}
            </button>
          </form>

          {errorMsg && <div className="text-xs text-rose-500 font-semibold mb-1">{errorMsg}</div>}

          {/* Game Over / Win Card */}
          {!isPlaying && (
            <div className="w-full max-w-md p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-center shadow-lg animate-fadeIn mt-2">
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {score >= 30
                  ? (isTr ? 'Tebrikler! Zinciri Başarıyla Tamamladınız! 🎉' : 'Awesome! Chain Completed! 🎉')
                  : (isTr ? 'Süre Doldu! ⏳' : 'Time Up! ⏳')}
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {isTr
                  ? `Toplam ${chain.length} kelimelik zincirle ${score} puan topladınız.`
                  : `Earned ${score} points with a ${chain.length}-word chain.`}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={async () => {
                    await shareScore({
                      title: 'Kelime Zinciri',
                      gameName: isTr ? 'Kelime Zinciri' : 'Word Chain',
                      scoreOrAttempts: `${score} ${isTr ? 'Puan' : 'Points'} (${chain.length} ${isTr ? 'Kelime' : 'Words'})`,
                    });
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>{isTr ? 'Paylaş' : 'Share'}</span>
                </button>
                <button
                  onClick={() => {
                    const text = isTr
                      ? `🔗 Kelime Zinciri: ${chain.length} kelimeyle ${score} puan aldım! https://bulmacakulubu.github.io`
                      : `🔗 Word Chain: Scored ${score} with ${chain.length} words! https://bulmacakulubu.github.io`;
                    openWhatsAppShare(text);
                  }}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare size={13} />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={resetGame}
                  className="px-3.5 py-1.5 bg-[var(--accent-color)] text-[var(--accent-contrast)] hover:opacity-90 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  {isTr ? 'Yeniden Oyna' : 'Play Again'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chain history sidebar */}
        <div className="w-full sm:w-60 h-64 sm:h-72 border border-[var(--border-color)] rounded-2xl p-2.5 bg-[var(--bg-secondary)] flex flex-col shadow-sm">
          <h4 className="font-bold text-[11px] text-[var(--text-secondary)] mb-2 border-b border-[var(--border-color)] pb-1 flex justify-between items-center">
            <span>{isTr ? 'Zincir Listesi' : 'Chain List'}</span>
            <span className="font-mono tabular-nums font-bold text-[var(--accent-color)]">{chain.length}</span>
          </h4>
          <div className="space-y-1 overflow-y-auto flex-1">
            {chain.map((w, idx) => (
              <div
                key={idx}
                className="p-1.5 rounded-xl text-xs font-semibold flex justify-between items-center bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-2xs"
              >
                <span>{idx + 1}. {w}</span>
                <span className="text-[10px] text-[var(--accent-color)] font-mono tabular-nums font-bold">+{w.length * 10}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};