import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import {
  RotateCcw,
  Users,
  Flag,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Award,
  BookOpen,
  Eye,
  EyeOff,
} from 'lucide-react';
import { MultiplayerSession } from '../types';
import { MultiplayerMessage } from '../utils/multiplayer';
import { showToast } from '../utils/toastService';
import { CHESS_LESSONS, ChessLesson } from '../data/chessLessons';
import { getLegalMoves, Square } from '../utils/chessRules';
import { getBestAIMove, applyMove, AIDifficulty } from '../utils/chessAI';

interface SatrancProps {
  onGameEnd: (won: boolean) => void;
  soundEnabled: boolean;
  multiplayerSession?: MultiplayerSession | null;
  onSendMultiplayerAction?: (msg: MultiplayerMessage) => void;
  incomingMultiplayerMessage?: MultiplayerMessage | null;
  language?: 'tr' | 'en';
  isZenMode?: boolean;
  hideStats?: boolean;
}

const INITIAL_BOARD = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const PIECE_SYMBOLS: Record<string, string> = {
  r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
  R: '♜', N: '♞', B: '♝', Q: '♛', K: '♚', P: '♟',
};

const COLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export const Satranc: React.FC<SatrancProps> = ({
  onGameEnd,
  soundEnabled,
  multiplayerSession,
  onSendMultiplayerAction,
  incomingMultiplayerMessage,
  language = 'tr',
  isZenMode = false,
  hideStats = false,
}) => {
  const isEn = language === 'en';
  const isOnline = !!multiplayerSession && multiplayerSession.connected;
  const myColor: 'white' | 'black' = multiplayerSession?.playerColor || 'white';

  const [mode, setMode] = useState<'ai' | '2p' | 'online' | 'academy'>(isOnline ? 'online' : 'ai');
  const [board, setBoard] = useState<(string | null)[][]>(INITIAL_BOARD);
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [selectedCell, setSelectedCell] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [opponentReaction, setOpponentReaction] = useState<string | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(() => {
    try {
      return (localStorage.getItem('bk_chess_ai_difficulty') as AIDifficulty) || 'medium';
    } catch {
      return 'medium';
    }
  });
  const [isAIThinking, setIsAIThinking] = useState(false);

  const isPanelVisible = showSidePanel && !hideStats;

  // ==========================================
  // ACADEMY STATE (Interactive Lessons)
  // ==========================================
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bk_chess_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [remainingStars, setRemainingStars] = useState<Square[]>([]);
  const [lessonFinished, setLessonFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [academyCategory, setAcademyCategory] = useState<'all' | 'basics' | 'rules' | 'tactics'>('all');

  const currentLesson: ChessLesson = CHESS_LESSONS[activeLessonIndex] || CHESS_LESSONS[0];

  // Load lesson board when switching lesson or academy mode
  const loadLesson = (idx: number) => {
    const lesson = CHESS_LESSONS[idx];
    if (!lesson) return;
    setActiveLessonIndex(idx);
    setBoard(lesson.board.map((row) => [...row]));
    setRemainingStars(lesson.stars ? [...lesson.stars] : []);
    setSelectedCell(null);
    setValidMoves([]);
    setLessonFinished(false);
    setShowHint(false);
    setTurn('white');
  };

  // Sync mode with session
  useEffect(() => {
    if (isOnline) {
      setMode('online');
    }
  }, [isOnline]);

  // When switching to academy mode, load the active lesson
  useEffect(() => {
    if (mode === 'academy') {
      loadLesson(activeLessonIndex);
    } else if (mode !== 'online') {
      setBoard(INITIAL_BOARD);
      setSelectedCell(null);
      setValidMoves([]);
      setTurn('white');
      setRemainingStars([]);
    }
  }, [mode]);

  // Handle incoming remote moves & chats from WebRTC
  useEffect(() => {
    if (!incomingMultiplayerMessage) return;

    if (incomingMultiplayerMessage.type === 'MOVE') {
      const { from, to, nextTurn, newBoard } = incomingMultiplayerMessage.payload;
      setBoard(newBoard);
      setTurn(nextTurn);
      const moveNotation = `${COLS[from[1]]}${8 - from[0]} ➔ ${COLS[to[1]]}${8 - to[0]}`;
      setMoveHistory((prev) => [`Rakip: ${moveNotation}`, ...prev]);
      if (soundEnabled) playSound('tile');
    } else if (incomingMultiplayerMessage.type === 'CHAT') {
      setOpponentReaction(incomingMultiplayerMessage.payload?.text || '👏');
      setTimeout(() => setOpponentReaction(null), 3500);
    } else if (incomingMultiplayerMessage.type === 'SURRENDER') {
      alert(`${multiplayerSession?.opponentName || 'Rakip'} oyundan çekildi. Kazandınız! 🏆`);
      onGameEnd(true);
    }
  }, [incomingMultiplayerMessage, soundEnabled, multiplayerSession, onGameEnd]);

  // Save completed lessons to localStorage
  const markLessonComplete = (lessonId: string) => {
    setLessonFinished(true);
    if (!completedLessonIds.includes(lessonId)) {
      const next = [...completedLessonIds, lessonId];
      setCompletedLessonIds(next);
      try {
        localStorage.setItem('bk_chess_completed_lessons', JSON.stringify(next));
      } catch {}
    }
    if (soundEnabled) playSound('win');
    confetti({ particleCount: 90, spread: 70 });
  };

  // Move handling
  const handleCellClick = (r: number, c: number) => {
    // In AI mode, prevent human clicks while AI is calculating or during black turn
    if (mode === 'ai' && (turn === 'black' || isAIThinking)) {
      return;
    }

    // In online mode, verify it's my turn
    if (isOnline && turn !== myColor) {
      return;
    }

    const piece = board[r][c];

    // If a cell was already selected
    if (selectedCell) {
      const [sr, sc] = selectedCell;

      // 1. Clicked on the same cell -> deselect
      if (sr === r && sc === c) {
        setSelectedCell(null);
        setValidMoves([]);
        return;
      }

      // 2. Clicked on another piece of the active player's color -> switch selection
      const isCurrentPlayerPiece = (p: string | null) => {
        if (!p) return false;
        if (mode === 'academy') return p === p.toUpperCase();
        return (turn === 'white' && p === p.toUpperCase()) || (turn === 'black' && p === p.toLowerCase());
      };

      if (piece && isCurrentPlayerPiece(piece)) {
        if (isOnline) {
          const isWhitePiece = piece === piece.toUpperCase();
          if ((myColor === 'white' && !isWhitePiece) || (myColor === 'black' && isWhitePiece)) {
            return;
          }
        }
        setSelectedCell([r, c]);
        const moves = getLegalMoves(board, r, c, mode === 'academy' ? remainingStars : undefined);
        setValidMoves(moves);
        if (soundEnabled) playSound('click');
        return;
      }

      // 3. Strictly validate if clicked cell is among legal moves (applies to ALL modes)
      const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
      if (!isValid) {
        if (soundEnabled) playSound('error');
        return;
      }

      // 4. Move is valid -> Execute move
      const movingPiece = board[sr][sc];
      const targetPiece = board[r][c];
      const newBoard = board.map((row) => [...row]);
      newBoard[r][c] = movingPiece;
      newBoard[sr][sc] = null;

      // Special Move: White pawn promotion (rank 0)
      if (movingPiece === 'P' && r === 0) {
        newBoard[r][c] = 'Q';
      }
      // Special Move: Black pawn promotion (rank 7)
      if (movingPiece === 'p' && r === 7) {
        newBoard[r][c] = 'q';
      }

      // Special Move: Castling king move from e1 to g1 (short castle)
      if (movingPiece === 'K' && sr === 7 && sc === 4 && r === 7 && c === 6) {
        newBoard[7][5] = 'R';
        newBoard[7][7] = null;
      }

      if (soundEnabled) playSound('tile');
      setBoard(newBoard);
      setSelectedCell(null);
      setValidMoves([]);

      // King capture win condition
      if (targetPiece === 'k') {
        if (soundEnabled) playSound('win');
        confetti({ particleCount: 90, spread: 70 });
        showToast(isEn ? 'Checkmate! White wins! 🏆' : 'Şah alındı! Beyaz kazandı! 🏆', 'success');
        onGameEnd(true);
      } else if (targetPiece === 'K') {
        if (soundEnabled) playSound('gameover');
        showToast(isEn ? 'Black wins!' : 'Şah alındı! Siyah kazandı!', 'error');
        onGameEnd(false);
      }

      // ==========================================
      // ACADEMY GOAL CHECKING
      // ==========================================
      if (mode === 'academy') {
        let starsLeft = remainingStars;

        // Check star collection
        const hitStar = remainingStars.some(([strR, strC]) => strR === r && strC === c);
        if (hitStar) {
          starsLeft = remainingStars.filter(([strR, strC]) => !(strR === r && strC === c));
          setRemainingStars(starsLeft);
          if (soundEnabled) playSound('success');
        }

        // Check if lesson requires target move
        if (currentLesson.targetMove) {
          const matchTarget =
            sr === currentLesson.targetMove.from[0] &&
            sc === currentLesson.targetMove.from[1] &&
            r === currentLesson.targetMove.to[0] &&
            c === currentLesson.targetMove.to[1];

          if (matchTarget) {
            markLessonComplete(currentLesson.id);
            return;
          }
        }

        // Check if all stars are collected
        if (currentLesson.stars && currentLesson.stars.length > 0 && starsLeft.length === 0) {
          markLessonComplete(currentLesson.id);
          return;
        }

        return;
      }

      // ==========================================
      // STANDARD / ONLINE MODE
      // ==========================================
      const nextTurn = turn === 'white' ? 'black' : 'white';
      setTurn(nextTurn);
      const pieceName = PIECE_SYMBOLS[movingPiece || ''] || '';
      const moveStr = `${turn === 'white' ? 'Beyaz' : 'Siyah'}: ${pieceName} ${COLS[sc]}${8 - sr} ➔ ${COLS[c]}${8 - r}`;
      setMoveHistory([moveStr, ...moveHistory]);

      // If online, broadcast move to opponent
      if (isOnline && onSendMultiplayerAction) {
        onSendMultiplayerAction({
          type: 'MOVE',
          payload: {
            from: [sr, sc],
            to: [r, c],
            newBoard,
            nextTurn,
          },
        });
      }

      // If AI mode and it's AI turn (black)
      if (mode === 'ai' && nextTurn === 'black') {
        setTimeout(() => makeAIMove(newBoard), 600);
      }
    } else {
      // Cell selection
      if (piece) {
        const isWhitePiece = piece === piece.toUpperCase();

        if (mode === 'academy') {
          // In academy, user plays white pieces
          if (isWhitePiece) {
            if (soundEnabled) playSound('click');
            setSelectedCell([r, c]);
            const moves = getLegalMoves(board, r, c, remainingStars);
            setValidMoves(moves);
          }
          return;
        }

        // In online mode, you can only pick pieces of your color
        if (isOnline) {
          if ((myColor === 'white' && !isWhitePiece) || (myColor === 'black' && isWhitePiece)) {
            return;
          }
        }

        if ((turn === 'white' && isWhitePiece) || (turn === 'black' && !isWhitePiece)) {
          if (soundEnabled) playSound('click');
          setSelectedCell([r, c]);
          const moves = getLegalMoves(board, r, c);
          setValidMoves(moves);
        }
      }
    }
  };

  const makeAIMove = (currentBoard: (string | null)[][]) => {
    setIsAIThinking(true);
    const thinkDelay = aiDifficulty === 'hard' ? 420 : aiDifficulty === 'medium' ? 320 : 200;

    setTimeout(() => {
      const bestMove = getBestAIMove(currentBoard, aiDifficulty);
      setIsAIThinking(false);

      if (!bestMove) return;

      const newBoard = applyMove(currentBoard, bestMove);
      const [fr, fc] = bestMove.from;
      const [tr, tc] = bestMove.to;
      const moving = bestMove.piece;
      const target = bestMove.captured;

      if (soundEnabled) playSound('tile');
      setBoard(newBoard);
      setTurn('white');

      const diffLabel =
        aiDifficulty === 'hard'
          ? (isEn ? 'Hard' : 'Zor')
          : aiDifficulty === 'medium'
          ? (isEn ? 'Medium' : 'Orta')
          : (isEn ? 'Easy' : 'Kolay');

      const notation = `AI (${diffLabel}): ${PIECE_SYMBOLS[moving || '']} ${COLS[fc]}${8 - fr} ➔ ${COLS[tc]}${8 - tr}`;
      setMoveHistory((prev) => [notation, ...prev]);

      if (target === 'K') {
        if (soundEnabled) playSound('gameover');
        showToast(isEn ? 'AI captured your King! Game over.' : 'Yapay zeka şahınızı aldı! Oyun bitti.', 'error');
        onGameEnd(false);
      }
    }, thinkDelay);
  };

  const resetGame = () => {
    if (mode === 'academy') {
      loadLesson(activeLessonIndex);
    } else {
      setBoard(INITIAL_BOARD);
      setTurn('white');
      setSelectedCell(null);
      setValidMoves([]);
      setMoveHistory([]);
    }
  };

  const sendReaction = (emoji: string) => {
    if (isOnline && onSendMultiplayerAction) {
      onSendMultiplayerAction({
        type: 'CHAT',
        payload: { text: emoji },
      });
    }
  };

  const handleSurrender = () => {
    if (isOnline && onSendMultiplayerAction) {
      if (confirm('Maçı terk etmek istediğinize emin misiniz?')) {
        onSendMultiplayerAction({ type: 'SURRENDER' });
        onGameEnd(false);
      }
    }
  };

  const filteredLessons = CHESS_LESSONS.filter((l) =>
    academyCategory === 'all' ? true : l.category === academyCategory
  );

  return (
    <div className="w-full h-full max-h-[calc(100vh-125px)] flex flex-col items-center justify-between select-none py-1 max-w-5xl">
      {/* UNIFORM CONTROL BAR */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-1.5 pb-1 border-b border-[var(--border-color)] shrink-0">
        {/* LEFT: Game Mode Selector */}
        <div className="flex flex-wrap items-center bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl text-xs font-semibold border border-[var(--border-color)]">
          {!isOnline ? (
            <>
              <button
                onClick={() => setMode('ai')}
                className={`px-2.5 py-1 rounded-lg transition font-extrabold text-[11px] cursor-pointer ${
                  mode === 'ai'
                    ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isEn ? 'Computer' : 'Bilgisayar'}
              </button>
              {/* Difficulty selector when in AI mode */}
              {mode === 'ai' && (
                <div className="flex items-center ml-1 pl-1 border-l border-[var(--border-color)] gap-0.5">
                  {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((level) => {
                    const isSelected = aiDifficulty === level;
                    const labels = {
                      easy: { tr: 'Kolay', en: 'Easy' },
                      medium: { tr: 'Orta', en: 'Medium' },
                      hard: { tr: 'Zor', en: 'Hard' },
                    };
                    return (
                      <button
                        key={level}
                        onClick={() => {
                          setAiDifficulty(level);
                          try {
                            localStorage.setItem('bk_chess_ai_difficulty', level);
                          } catch {}
                          if (soundEnabled) playSound('click');
                        }}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                          isSelected
                            ? level === 'hard'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : level === 'medium'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-emerald-600 text-white shadow-xs'
                            : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                        title={
                          level === 'hard'
                            ? (isEn ? 'Hard: 3-ply Minimax + Alpha-Beta' : 'Zor: 3 Hamle İleriyi Düşünen Büyükusta AI')
                            : level === 'medium'
                            ? (isEn ? 'Medium: 2-ply Minimax + Positional Evaluation' : 'Orta: 2 Hamle İleriyi Düşünen Usta AI')
                            : (isEn ? 'Easy: Casual Beginner AI' : 'Kolay: Acemi AI')
                        }
                      >
                        {labels[level][isEn ? 'en' : 'tr']}
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => setMode('2p')}
                className={`px-2.5 py-1 rounded-lg transition font-extrabold text-[11px] cursor-pointer ${
                  mode === '2p'
                    ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isEn ? '2 Players' : '2 Kişi'}
              </button>
              <button
                onClick={() => setMode('academy')}
                className={`px-3 py-1 rounded-lg transition font-extrabold text-[11px] flex items-center gap-1 cursor-pointer ${
                  mode === 'academy'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <GraduationCap size={13} />
                <span>{isEn ? 'Academy' : 'Akademi'}</span>
                <span className="text-[9px] bg-amber-500/30 px-1 rounded-full font-black">
                  {completedLessonIds.length}/{CHESS_LESSONS.length}
                </span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 text-purple-600 dark:text-purple-400 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{isEn ? '1v1 Live Room:' : '1v1 Canlı Oda:'} {multiplayerSession?.roomCode}</span>
            </div>
          )}
        </div>

        {/* CENTER: Live Turn Status / Academy Metric */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {mode === 'academy' ? (
            <>
              <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs text-[11px] flex items-center gap-1">
                <BookOpen size={12} className="text-amber-500" />
                <span className="text-[var(--text-secondary)]">{isEn ? 'Lesson' : 'Ders'}</span>
                <span className="font-mono tabular-nums font-bold text-[var(--accent-color)]">{activeLessonIndex + 1}/{CHESS_LESSONS.length}</span>
              </div>
              {remainingStars.length > 0 && (
                <div className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30 shadow-2xs text-[11px] flex items-center gap-1 font-bold animate-pulse">
                  <Sparkles size={11} className="text-amber-500" />
                  <span className="font-mono tabular-nums">{remainingStars.length} {isEn ? 'Left' : 'Kaldı'}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs text-[11px] flex items-center gap-1.5">
                {isAIThinking ? (
                  <span className="flex items-center gap-1.5 text-amber-500 font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>{isEn ? 'Computer thinking...' : 'Bilgisayar düşünüyor...'}</span>
                  </span>
                ) : (
                  <>
                    <span className="text-[var(--text-secondary)]">{isEn ? 'Turn' : 'Sıra'}</span>{' '}
                    <span className="font-bold text-[var(--accent-color)] ml-1">
                      {turn === 'white' ? (isEn ? 'White' : 'Beyaz') : (isEn ? 'Black' : 'Siyah')}
                      {isOnline && (turn === myColor ? (isEn ? ' (Your Turn!)' : ' (Senin Sıran!)') : (isEn ? ' (Opponent...)' : ' (Rakip...)'))}
                    </span>
                  </>
                )}
              </div>
              <div className="px-2.5 py-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs text-[11px]">
                <span className="text-[var(--text-secondary)]">{isEn ? 'Moves' : 'Hamle'}</span>{' '}
                <span className="font-mono tabular-nums font-bold text-[var(--accent-color)]">{moveHistory.length}</span>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Restart or Academy Hint Button */}
        <div className="flex items-center gap-1.5">
          {/* Side Panel / History Toggle Button */}
          <button
            onClick={() => setShowSidePanel((p) => !p)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-[var(--border-color)] shadow-2xs cursor-pointer ${
              !isPanelVisible
                ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)]'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
            title={isPanelVisible ? (isEn ? 'Hide Side Panel (Pure Board Focus)' : 'Paneli Gizle (Yalnızca Tahta)') : (isEn ? 'Show Side Panel' : 'Paneli Göster')}
          >
            {!isPanelVisible ? <EyeOff size={12} /> : <Eye size={12} />}
            <span>{!isPanelVisible ? (isEn ? 'Board Focus' : 'Odaklanıldı') : (isEn ? 'Panel' : 'Panel')}</span>
          </button>

          {mode === 'academy' && (
            <button
              onClick={() => {
                setShowHint((h) => !h);
                if (currentLesson) {
                  showToast(`💡 İpucu: ${currentLesson.hint[isEn ? 'en' : 'tr']}`);
                }
              }}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Lightbulb size={12} />
              <span>{isEn ? 'Hint' : 'İpucu'}</span>
            </button>
          )}

          {!isOnline ? (
            <button
              onClick={resetGame}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>{isEn ? 'Reset' : 'Sıfırla'}</span>
            </button>
          ) : (
            <button
              onClick={handleSurrender}
              className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-red-500/20 shadow-2xs cursor-pointer"
            >
              <Flag size={12} />
              <span>{isEn ? 'Resign' : 'Terk Et'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Online Opponent Banner */}
      {isOnline && (
        <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-purple-600 dark:text-purple-400" />
            <span className="font-bold">{isEn ? 'Opponent:' : 'Rakip:'} {multiplayerSession?.opponentName}</span>
            <span className="text-[10px] text-gray-500">
              ({myColor === 'white'
                ? (isEn ? 'You: White | Opponent: Black' : 'Sen: Beyaz | Rakip: Siyah')
                : (isEn ? 'You: Black | Opponent: White' : 'Sen: Siyah | Rakip: Beyaz')})
            </span>
          </div>

          {/* Quick Reaction Emojis */}
          <div className="flex items-center gap-1">
            {['🔥', '👏', '😱', '😎'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="w-6 h-6 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 flex items-center justify-center transition text-xs cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Opponent reaction popup */}
      {opponentReaction && (
        <div className="animate-bounce bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
          <span>{multiplayerSession?.opponentName}:</span>
          <span className="text-base">{opponentReaction}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* ACADEMY INTERACTIVE LESSON CARD HEADER                   */}
      {/* ======================================================== */}
      {mode === 'academy' && (
        <div className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-3 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none">{currentLesson.pieceSymbol}</span>
              <div>
                <h3 className="text-sm font-extrabold flex items-center gap-1.5">
                  <span>{currentLesson.title[isEn ? 'en' : 'tr']}</span>
                  {completedLessonIds.includes(currentLesson.id) && (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  )}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {currentLesson.categoryTitle[isEn ? 'en' : 'tr']}
                </p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 text-[10px] font-bold">
              {[
                { id: 'all', label: isEn ? 'All' : 'Tümü' },
                { id: 'basics', label: isEn ? 'Moves' : '1. Taşlar' },
                { id: 'rules', label: isEn ? 'Rules' : '2. Kurallar' },
                { id: 'tactics', label: isEn ? 'Tactics' : '3. Matlar' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setAcademyCategory(cat.id as any)}
                  className={`px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                    academyCategory === cat.id
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'border-[var(--border-color)] text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-700 dark:text-gray-300 mb-1 leading-relaxed">
            {currentLesson.description[isEn ? 'en' : 'tr']}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500 shrink-0" />
            <span>{currentLesson.instruction[isEn ? 'en' : 'tr']}</span>
          </div>

          {showHint && (
            <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-[11px] text-blue-600 dark:text-blue-300 flex items-start gap-1.5 animate-fadeIn">
              <Lightbulb size={13} className="shrink-0 mt-0.5" />
              <span>{currentLesson.hint[isEn ? 'en' : 'tr']}</span>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MAIN PLAYING AREA & SIDEBAR                              */}
      {/* ======================================================== */}
      <div className="w-full flex flex-col md:flex-row gap-3 items-center md:items-start justify-center">
        {/* CHESSBOARD */}
        <div className="flex flex-col items-center justify-center">
          <div className="border-4 sm:border-5 border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl bg-[var(--bg-secondary)] inline-block relative">
            <div className="grid grid-cols-8">
              {board.map((row, r) =>
                row.map((piece, c) => {
                  const isDark = (r + c) % 2 === 1;
                  const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
                  const isValidTarget = validMoves.some(([vr, vc]) => vr === r && vc === c);
                  const hasStar = remainingStars.some(([sr, sc]) => sr === r && sc === c);
                  const isWhitePiece = piece ? piece === piece.toUpperCase() : false;

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 2xl:w-15 2xl:h-15 max-h-[calc((100vh-210px)/8)] max-w-[calc((100vh-210px)/8)] aspect-square flex items-center justify-center cursor-pointer transition-all duration-200 relative select-none ${
                        isSelected ? 'ring-3 ring-emerald-400 z-10 scale-102 shadow-md' : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: isDark
                          ? 'var(--board-dark, #3f4753)'
                          : 'var(--board-light, #b4bcc8)',
                      }}
                    >
                      {/* Legal Move Glow Dot */}
                      {isValidTarget && (
                        <div
                          className={`absolute z-10 rounded-full transition-all ${
                            piece
                              ? 'w-6 h-6 sm:w-8 sm:h-8 xl:w-10 xl:h-10 border-3 xl:border-4 border-emerald-500 bg-emerald-500/20'
                              : 'w-2.5 h-2.5 sm:w-3 sm:h-3 xl:w-3.5 xl:h-3.5 bg-emerald-600/75 dark:bg-emerald-400/80 shadow-xs'
                          }`}
                        />
                      )}

                      {/* Golden Star for Academy Target */}
                      {hasStar && (
                        <span className="absolute z-10 text-base sm:text-xl md:text-2xl animate-bounce drop-shadow-md">
                          ⭐
                        </span>
                      )}

                      {/* Chess Piece Symbol - Fully solid & outlined for 100% contrast */}
                      {piece && (
                        <span
                          className="text-xl sm:text-2xl md:text-3xl lg:text-3.5xl xl:text-4xl leading-none inline-block transform scale-110 z-5 select-none"
                          style={{
                            color: isWhitePiece ? '#ffffff' : '#111317',
                            WebkitTextStroke: isWhitePiece ? '1.5px #0f172a' : '1px #94a3b8',
                            paintOrder: 'stroke fill',
                            fontFamily: '"Segoe UI Symbol", "Noto Sans Symbols", "DejaVu Sans", "Arial Unicode MS", system-ui, sans-serif',
                            filter: isWhitePiece
                              ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.85)) drop-shadow(0 0 1px #000000)'
                              : 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))',
                          }}
                        >
                          {PIECE_SYMBOLS[piece] || ''}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR: ACADEMY LESSONS LIST OR MOVE HISTORY (Togglable) */}
        {isPanelVisible && (
          <div
            className="w-full md:w-64 lg:w-72 xl:w-80 border rounded-2xl p-2.5 sm:p-3 flex flex-col shadow-xs max-h-[calc(100vh-210px)] overflow-hidden animate-fadeIn"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            {mode === 'academy' ? (
              <>
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[var(--border-color)]">
                  <h4 className="font-bold text-xs tracking-wider uppercase flex items-center gap-1.5" style={{ color: 'var(--accent-color)' }}>
                    <Award size={13} className="text-amber-500" />
                    <span>{isEn ? 'CURRICULUM' : 'DERS LİSTESİ'}</span>
                  </h4>
                  <span className="text-[10px] font-extrabold" style={{ color: 'var(--accent-color)' }}>
                    {completedLessonIds.length}/{CHESS_LESSONS.length} {isEn ? 'Done' : 'Bitti'}
                  </span>
                </div>

                <div className="space-y-1 overflow-y-auto flex-1 pr-1">
                  {filteredLessons.map((l) => {
                    const idx = CHESS_LESSONS.findIndex((item) => item.id === l.id);
                    const isCurrent = idx === activeLessonIndex;
                    const isDone = completedLessonIds.includes(l.id);

                    return (
                      <button
                        key={l.id}
                        onClick={() => loadLesson(idx)}
                        className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer border ${
                          isCurrent
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : isDone
                            ? 'bg-[var(--bg-card)] text-gray-700 dark:text-gray-300 border-emerald-500/30 hover:border-emerald-500'
                            : 'bg-[var(--bg-card)] text-gray-600 dark:text-gray-400 border-[var(--border-color)] hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm shrink-0">{l.pieceSymbol}</span>
                          <span className="truncate">{l.title[isEn ? 'en' : 'tr']}</span>
                        </div>
                        {isDone && (
                          <CheckCircle2
                            size={13}
                            className={isCurrent ? 'text-white' : 'text-emerald-500 shrink-0'}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h4 className="font-bold text-xs mb-2 border-b border-[var(--border-color)] pb-1.5 flex items-center justify-between" style={{ color: 'var(--accent-color)' }}>
                  <span>{isEn ? 'MOVE HISTORY' : 'HAMLE GEÇMİŞİ'}</span>
                  {isOnline && <span className="text-[10px] text-emerald-500 font-mono">{isEn ? 'P2P Live' : 'P2P Canlı'}</span>}
                </h4>
                {moveHistory.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">{isEn ? 'No moves yet.' : 'Henüz hamle yapılmadı.'}</p>
                ) : (
                  <div className="space-y-1 overflow-y-auto flex-1 text-xs font-semibold pr-1">
                    {moveHistory.map((m, i) => (
                      <div key={i} className="p-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
                        {m}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* ACADEMY VICTORY / LESSON COMPLETE MODAL CARD             */}
      {/* ======================================================== */}
      {mode === 'academy' && lessonFinished && (
        <div className="w-full max-w-md p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-center shadow-lg animate-fadeIn mt-1">
          <div className="text-sm font-black text-emerald-700 dark:text-emerald-300 mb-1 flex items-center justify-center gap-1.5">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>{isEn ? 'Lesson Completed! 🎉' : 'Ders Başarıyla Tamamlandı! 🎉'}</span>
          </div>
          <div className="text-xs text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
            {currentLesson.explanation[isEn ? 'en' : 'tr']}
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => resetGame()}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition border border-[var(--border-color)] cursor-pointer"
            >
              {isEn ? 'Try Again' : 'Tekrar Oyna'}
            </button>

            {activeLessonIndex < CHESS_LESSONS.length - 1 && (
              <button
                onClick={() => loadLesson(activeLessonIndex + 1)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <span>{isEn ? 'Next Lesson' : 'Sıradaki Ders'}</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
