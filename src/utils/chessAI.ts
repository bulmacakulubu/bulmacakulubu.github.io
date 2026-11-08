// Intelligent Chess AI Engine with Positional Piece-Square Tables & Alpha-Beta Minimax
// Supports 3 Distinct Difficulty Levels: Kolay (Easy), Orta (Medium), Zor (Hard)

import { getLegalMoves, Square } from './chessRules';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface ChessMove {
  from: Square;
  to: Square;
  piece: string;
  captured: string | null;
  score?: number;
}

// -------------------------------------------------------------
// Piece Material Values (Centipawns)
// -------------------------------------------------------------
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
  P: 100,
  N: 320,
  B: 330,
  R: 500,
  Q: 900,
  K: 20000,
};

// -------------------------------------------------------------
// Piece-Square Tables (From Black's perspective: rows 0 to 7)
// Higher values encourage optimal piece placement.
// -------------------------------------------------------------
const PAWN_TABLE_BLACK: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [0, 0, 0, 25, 25, 0, 0, 0],
  [5, 5, 10, 27, 27, 10, 5, 5],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [0, 0, 0, 0, 0, 0, 0, 0], // Promoted
];

const KNIGHT_TABLE_BLACK: number[][] = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_TABLE_BLACK: number[][] = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 0, 10, 15, 15, 10, 0, -10],
  [-10, 5, 5, 15, 15, 5, 5, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_TABLE_BLACK: number[][] = [
  [0, 0, 0, 5, 5, 0, 0, 0],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const QUEEN_TABLE_BLACK: number[][] = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_TABLE_BLACK: number[][] = [
  [20, 30, 10, 0, 0, 10, 30, 20],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
];

/**
 * Gets positional bonus for a piece at (r, c)
 */
function getPositionalValue(piece: string, r: number, c: number): number {
  const type = piece.toLowerCase();
  const isWhite = piece === piece.toUpperCase();
  // For white pieces, invert row (0 becomes 7, 6 becomes 1, etc.)
  const tableRow = isWhite ? 7 - r : r;
  const tableCol = c;

  let table: number[][] | null = null;
  switch (type) {
    case 'p':
      table = PAWN_TABLE_BLACK;
      break;
    case 'n':
      table = KNIGHT_TABLE_BLACK;
      break;
    case 'b':
      table = BISHOP_TABLE_BLACK;
      break;
    case 'r':
      table = ROOK_TABLE_BLACK;
      break;
    case 'q':
      table = QUEEN_TABLE_BLACK;
      break;
    case 'k':
      table = KING_TABLE_BLACK;
      break;
  }

  return table ? table[tableRow][tableCol] : 0;
}

/**
 * Evaluate the board from Black's (AI's) perspective.
 * Positive score = Black is winning. Negative score = White is winning.
 */
export function evaluateBoard(board: (string | null)[][]): number {
  let score = 0;
  let hasWhiteKing = false;
  let hasBlackKing = false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isWhite = piece === piece.toUpperCase();
      const val = PIECE_VALUES[piece] || 0;
      const pos = getPositionalValue(piece, r, c);

      if (piece === 'K') hasWhiteKing = true;
      if (piece === 'k') hasBlackKing = true;

      if (!isWhite) {
        // Black piece (AI)
        score += val + pos;
      } else {
        // White piece (Player)
        score -= val + pos;
      }
    }
  }

  // Extreme bonus/penalty for King capture / checkmate
  if (!hasWhiteKing) score += 99999;
  if (!hasBlackKing) score -= 99999;

  return score;
}

/**
 * Generate all legal moves for a given side (true = White, false = Black).
 */
export function getAllMoves(board: (string | null)[][], forWhite: boolean): ChessMove[] {
  const moves: ChessMove[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isWhite = piece === piece.toUpperCase();
      if (isWhite !== forWhite) continue;

      const legalSquares = getLegalMoves(board, r, c);
      for (const [tr, tc] of legalSquares) {
        moves.push({
          from: [r, c],
          to: [tr, tc],
          piece,
          captured: board[tr][tc],
        });
      }
    }
  }

  // Order moves: Captures first (MVV-LVA: Most Valuable Victim first)
  moves.sort((a, b) => {
    const valA = a.captured ? (PIECE_VALUES[a.captured] || 0) * 10 - (PIECE_VALUES[a.piece] || 0) : 0;
    const valB = b.captured ? (PIECE_VALUES[b.captured] || 0) * 10 - (PIECE_VALUES[b.piece] || 0) : 0;
    return valB - valA;
  });

  return moves;
}

/**
 * Clone board and apply a move.
 */
export function applyMove(board: (string | null)[][], move: ChessMove): (string | null)[][] {
  const next = board.map((row) => [...row]);
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;

  let moving = move.piece;

  // Pawn promotion
  if (moving === 'p' && tr === 7) moving = 'q';
  if (moving === 'P' && tr === 0) moving = 'Q';

  next[tr][tc] = moving;
  next[fr][fc] = null;

  // Castling
  if (moving === 'K' && fr === 7 && fc === 4 && tr === 7 && tc === 6) {
    next[7][5] = 'R';
    next[7][7] = null;
  }

  return next;
}

/**
 * Alpha-Beta Minimax Search Engine
 * @param depth Remaining plies
 * @param isMaximizing True for Black (AI), False for White (Player)
 * @param alpha Best score for maximizing player
 * @param beta Best score for minimizing player
 */
function minimax(
  board: (string | null)[][],
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): number {
  if (depth === 0) {
    return evaluateBoard(board);
  }

  const moves = getAllMoves(board, !isMaximizing);
  if (moves.length === 0) {
    return evaluateBoard(board);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      // If capturing King, instant win
      if (move.captured === 'K') return 90000 + depth;

      const newBoard = applyMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, false, alpha, beta);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cut-off
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      // If capturing Black King, instant loss for AI
      if (move.captured === 'k') return -90000 - depth;

      const newBoard = applyMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, true, alpha, beta);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cut-off
    }
    return minEval;
  }
}

/**
 * Main AI Move Decision Generator
 * Selects the optimal move based on chosen difficulty.
 */
export function getBestAIMove(
  board: (string | null)[][],
  difficulty: AIDifficulty = 'medium'
): ChessMove | null {
  const allMoves = getAllMoves(board, false); // Black's moves
  if (allMoves.length === 0) return null;

  // 1. Check for immediate win (capture white King)
  const winningMove = allMoves.find((m) => m.captured === 'K');
  if (winningMove) return winningMove;

  // ==========================================
  // LEVEL 1: KOLAY (EASY - ACEMİ)
  // Depth 1: Evaluates immediate moves.
  // 65% chooses the best tactical move/capture.
  // 35% chooses a decent random legal move.
  // ==========================================
  if (difficulty === 'easy') {
    // Score all depth 1 moves
    const scoredMoves = allMoves.map((move) => {
      const nextBoard = applyMove(board, move);
      return { move, score: evaluateBoard(nextBoard) };
    });

    scoredMoves.sort((a, b) => b.score - a.score);

    // If an easy capture exists, prefer it
    if (Math.random() < 0.65 && scoredMoves.length > 0) {
      return scoredMoves[0].move;
    }

    // Otherwise pick from top 3 moves
    const pool = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
    return pool[Math.floor(Math.random() * pool.length)].move;
  }

  // ==========================================
  // LEVEL 2: ORTA (MEDIUM - USTA)
  // Depth 2: Minimax looks ahead to White's reply.
  // Captures hanging pieces, defends own pieces, develops toward center.
  // ==========================================
  if (difficulty === 'medium') {
    let bestMove: ChessMove = allMoves[0];
    let bestValue = -Infinity;

    for (const move of allMoves) {
      const nextBoard = applyMove(board, move);
      // Depth 1 for opponent (total depth 2)
      const moveValue = minimax(nextBoard, 1, false, -Infinity, Infinity);

      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // ==========================================
  // LEVEL 3: ZOR (HARD - BÜYÜKUSTA / GRANDMASTER)
  // Depth 3: Full Alpha-Beta Minimax.
  // Looks 3 plies ahead (AI -> Player -> AI Counter).
  // Calculates piece sacrifices, king safety, center domination.
  // ==========================================
  let bestScore = -Infinity;
  let bestCandidateMoves: ChessMove[] = [];

  for (const move of allMoves) {
    const nextBoard = applyMove(board, move);
    // Depth 2 for deeper search (total 3 plies)
    const score = minimax(nextBoard, 2, false, -Infinity, Infinity);

    if (score > bestScore) {
      bestScore = score;
      bestCandidateMoves = [move];
    } else if (score === bestScore) {
      bestCandidateMoves.push(move);
    }
  }

  // If multiple moves share the best score, pick randomly among best
  return bestCandidateMoves[Math.floor(Math.random() * bestCandidateMoves.length)] || allMoves[0];
}

