import React, { useState, useEffect } from 'react';
import { playSound } from '../utils/audio';
import { RotateCcw, Users, Wifi, Send, Flag } from 'lucide-react';
import { MultiplayerSession } from '../types';
import { MultiplayerMessage } from '../utils/multiplayer';

interface SatrancProps {
  onGameEnd: (won: boolean) => void;
  soundEnabled: boolean;
  multiplayerSession?: MultiplayerSession | null;
  onSendMultiplayerAction?: (msg: MultiplayerMessage) => void;
  incomingMultiplayerMessage?: MultiplayerMessage | null;
  language?: 'tr' | 'en';
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
  R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙',
};

export const Satranc: React.FC<SatrancProps> = ({
  onGameEnd,
  soundEnabled,
  multiplayerSession,
  onSendMultiplayerAction,
  incomingMultiplayerMessage,
  language = 'tr',
}) => {
  const isEn = language === 'en';
  const isOnline = !!multiplayerSession && multiplayerSession.connected;
  const myColor: 'white' | 'black' = multiplayerSession?.playerColor || 'white';

  const [board, setBoard] = useState<(string | null)[][]>(INITIAL_BOARD);
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState<'ai' | '2p' | 'online'>(isOnline ? 'online' : 'ai');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [opponentReaction, setOpponentReaction] = useState<string | null>(null);

  // Sync mode with session
  useEffect(() => {
    if (isOnline) {
      setMode('online');
    }
  }, [isOnline]);

  // Handle incoming remote moves & chats from WebRTC
  useEffect(() => {
    if (!incomingMultiplayerMessage) return;

    if (incomingMultiplayerMessage.type === 'MOVE') {
      const { from, to, nextTurn, newBoard } = incomingMultiplayerMessage.payload;
      setBoard(newBoard);
      setTurn(nextTurn);
      setMoveHistory((prev) => [`Rakip: ${from[0]},${from[1]} -> ${to[0]},${to[1]}`, ...prev]);
      if (soundEnabled) playSound('tile');
    } else if (incomingMultiplayerMessage.type === 'CHAT') {
      setOpponentReaction(incomingMultiplayerMessage.payload?.text || '👏');
      setTimeout(() => setOpponentReaction(null), 3500);
    } else if (incomingMultiplayerMessage.type === 'SURRENDER') {
      alert(`${multiplayerSession?.opponentName || 'Rakip'} oyundan çekildi. Kazandınız! 🏆`);
      onGameEnd(true);
    }
  }, [incomingMultiplayerMessage, soundEnabled, multiplayerSession, onGameEnd]);

  const handleCellClick = (r: number, c: number) => {
    // If online mode, verify it's my turn
    if (isOnline && turn !== myColor) {
      return;
    }

    const piece = board[r][c];

    if (selectedCell) {
      const [sr, sc] = selectedCell;
      if (sr === r && sc === c) {
        setSelectedCell(null);
        return;
      }

      const newBoard = board.map((row) => [...row]);
      newBoard[r][c] = newBoard[sr][sc];
      newBoard[sr][sc] = null;

      if (soundEnabled) playSound('tile');
      setBoard(newBoard);
      setSelectedCell(null);
      const nextTurn = turn === 'white' ? 'black' : 'white';
      setTurn(nextTurn);
      setMoveHistory([`Sen: ${sr},${sc} -> ${r},${c}`, ...moveHistory]);

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

      if (mode === 'ai' && nextTurn === 'black') {
        setTimeout(() => makeAIMove(newBoard), 600);
      }
    } else {
      if (piece) {
        const isWhitePiece = piece === piece.toUpperCase();
        // In online mode, you can only pick pieces of your color
        if (isOnline) {
          if ((myColor === 'white' && !isWhitePiece) || (myColor === 'black' && isWhitePiece)) {
            return;
          }
        }

        if ((turn === 'white' && isWhitePiece) || (turn === 'black' && !isWhitePiece)) {
          if (soundEnabled) playSound('click');
          setSelectedCell([r, c]);
        }
      }
    }
  };

  const makeAIMove = (currentBoard: (string | null)[][]) => {
    const newBoard = currentBoard.map((row) => [...row]);
    const blackPieces: [number, number][] = [];
    newBoard.forEach((row, r) => {
      row.forEach((p, c) => {
        if (p && p === p.toLowerCase()) blackPieces.push([r, c]);
      });
    });

    if (blackPieces.length > 0) {
      const [fr, fc] = blackPieces[Math.floor(Math.random() * blackPieces.length)];
      const tr = fr + 1 <= 7 ? fr + 1 : fr - 1;
      const tc = fc;
      newBoard[tr][tc] = newBoard[fr][fc];
      newBoard[fr][fc] = null;
      if (soundEnabled) playSound('tile');
      setBoard(newBoard);
      setTurn('white');
      setMoveHistory((prev) => [`AI: ${fr},${fc} -> ${tr},${tc}`, ...prev]);
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setTurn('white');
    setSelectedCell(null);
    setMoveHistory([]);
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

  return (
    <div className="w-full max-w-3xl sm:max-w-4xl flex flex-col items-center justify-start select-none space-y-3 pt-1">
      {/* UNIFORM CONTROL BAR */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        {/* LEFT: Game Mode Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold border border-[var(--border-color)]">
          {!isOnline ? (
            <>
              <button
                onClick={() => { setMode('ai'); resetGame(); }}
                className={`px-3 py-1.5 rounded-lg transition font-extrabold ${
                  mode === 'ai'
                    ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isEn ? 'Computer' : 'Bilgisayar'}
              </button>
              <button
                onClick={() => { setMode('2p'); resetGame(); }}
                className={`px-3 py-1.5 rounded-lg transition font-extrabold ${
                  mode === '2p'
                    ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)] shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isEn ? '2 Players' : '2 Kişi'}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 text-purple-600 dark:text-purple-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{isEn ? '1v1 Live Room:' : '1v1 Canlı Oda:'} {multiplayerSession?.roomCode}</span>
            </div>
          )}
        </div>

        {/* CENTER: Live Turn Status */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isEn ? 'TURN' : 'SIRA'}{' '}
            <span className="font-extrabold text-[var(--accent-color)] ml-1">
              {turn === 'white' ? (isEn ? 'White' : 'Beyaz') : (isEn ? 'Black' : 'Siyah')}
              {isOnline && (turn === myColor ? (isEn ? ' (Your Turn!)' : ' (Senin Sıran!)') : (isEn ? ' (Opponent...)' : ' (Rakip...)'))}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xs">
            {isEn ? 'MOVES' : 'HAMLE'} <span className="font-extrabold text-[var(--accent-color)]">{moveHistory.length}</span>
          </div>
        </div>

        {/* RIGHT: Restart or Surrender Button */}
        {!isOnline ? (
          <button
            onClick={resetGame}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--border-color)] text-gray-800 dark:text-gray-200 shadow-2xs"
          >
            <RotateCcw size={13} />
            <span>{isEn ? 'New Game' : 'Yeni Oyun'}</span>
          </button>
        ) : (
          <button
            onClick={handleSurrender}
            className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-red-500/20 shadow-2xs"
          >
            <Flag size={13} />
            <span>{isEn ? 'Resign' : 'Terk Et'}</span>
          </button>
        )}
      </div>

      {/* Online Opponent Banner */}
      {isOnline && (
        <div className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-purple-600 dark:text-purple-400" />
            <span className="font-bold">{isEn ? 'Opponent:' : 'Rakip:'} {multiplayerSession?.opponentName}</span>
            <span className="text-[10px] text-gray-500">
              ({myColor === 'white'
                ? (isEn ? 'You: White | Opponent: Black' : 'Sen: Beyaz | Rakip: Siyah')
                : (isEn ? 'You: Black | Opponent: White' : 'Sen: Siyah | Rakip: Beyaz')})
            </span>
          </div>

          {/* Quick Reaction Emojis */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400 mr-1">{isEn ? 'Reaction:' : 'Tepki:'}</span>
            {['🔥', '👏', '😱', '😎'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="w-6 h-6 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 flex items-center justify-center transition text-xs"
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

      <div className="w-full flex flex-col sm:flex-row gap-4 items-center sm:items-start justify-center">
        <div className="flex-1 flex justify-center items-center">
          {/* Expanded Chessboard */}
          <div className="border-4 sm:border-6 border-amber-900/40 rounded-3xl overflow-hidden shadow-lg bg-amber-100 inline-block">
            <div className="grid grid-cols-8">
              {board.map((row, r) =>
                row.map((piece, c) => {
                  const isDark = (r + c) % 2 === 1;
                  const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-17 lg:h-17 flex items-center justify-center cursor-pointer transition select-none ${
                        isDark ? 'bg-[#b58863] text-white' : 'bg-[#f0d9b5] text-gray-900'
                      } ${isSelected ? 'ring-4 ring-[var(--accent-color)] z-10 scale-105 shadow-md' : 'hover:opacity-90'}`}
                    >
                      <span className="text-3xl sm:text-4xl md:text-5xl leading-none inline-block transform scale-110">
                        {piece ? PIECE_SYMBOLS[piece] : ''}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Move History sidebar */}
        <div className="w-full sm:w-64 md:w-72 h-80 sm:h-[460px] md:h-[530px] border border-gray-200 dark:border-gray-800 rounded-3xl p-3.5 bg-gray-50/50 dark:bg-gray-800/40 flex flex-col shadow-xs">
          <h4 className="font-bold text-xs mb-2 border-b border-gray-200 dark:border-gray-800 pb-1.5 flex items-center justify-between">
            <span>{isEn ? 'MOVE HISTORY' : 'HAMLE GEÇMİŞİ'}</span>
            {isOnline && <span className="text-[10px] text-emerald-500 font-mono">{isEn ? 'P2P Live' : 'P2P Canlı'}</span>}
          </h4>
          {moveHistory.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">{isEn ? 'No moves yet.' : 'Henüz hamle yapılmadı.'}</p>
          ) : (
            <div className="space-y-1.5 overflow-y-auto flex-1 text-xs font-semibold pr-1">
              {moveHistory.map((m, i) => (
                <div key={i} className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs">
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
