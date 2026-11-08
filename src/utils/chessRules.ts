// Chess Rule Validator & Legal Move Engine
// Computes reachable valid squares for pieces with board bounds checking.

export type Square = [number, number];

export function getLegalMoves(
  board: (string | null)[][],
  r: number,
  c: number,
  stars?: Square[]
): Square[] {
  const piece = board[r]?.[c];
  if (!piece) return [];

  const isWhite = piece === piece.toUpperCase();
  const moves: Square[] = [];

  const isInside = (row: number, col: number) => row >= 0 && row < 8 && col >= 0 && col < 8;

  const canOccupy = (row: number, col: number) => {
    if (!isInside(row, col)) return false;
    const target = board[row][col];
    if (!target) return true; // empty square
    const targetIsWhite = target === target.toUpperCase();
    return isWhite !== targetIsWhite; // enemy piece can be captured
  };

  const addRayMoves = (directions: [number, number][]) => {
    for (const [dr, dc] of directions) {
      let cr = r + dr;
      let cc = c + dc;
      while (isInside(cr, cc)) {
        const target = board[cr][cc];
        if (!target) {
          moves.push([cr, cc]);
        } else {
          const targetIsWhite = target === target.toUpperCase();
          if (isWhite !== targetIsWhite) {
            moves.push([cr, cc]); // capture
          }
          break; // ray is blocked by piece
        }
        cr += dr;
        cc += dc;
      }
    }
  };

  const type = piece.toLowerCase();

  switch (type) {
    case 'r': // Rook
      addRayMoves([[0, 1], [0, -1], [1, 0], [-1, 0]]);
      break;

    case 'b': // Bishop
      addRayMoves([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
      break;

    case 'q': // Queen
      addRayMoves([
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ]);
      break;

    case 'k': // King
      const kingDirs: [number, number][] = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];
      for (const [dr, dc] of kingDirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (canOccupy(nr, nc)) {
          moves.push([nr, nc]);
        }
      }
      // Kingside Castling check (e1 to g1)
      if (isWhite && r === 7 && c === 4 && board[7][7] === 'R' && !board[7][5] && !board[7][6]) {
        moves.push([7, 6]);
      }
      break;

    case 'n': // Knight
      const knightOffsets: [number, number][] = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2],  [1, 2],  [2, -1],  [2, 1]
      ];
      for (const [dr, dc] of knightOffsets) {
        const nr = r + dr;
        const nc = c + dc;
        if (canOccupy(nr, nc)) {
          moves.push([nr, nc]);
        }
      }
      break;

    case 'p': // Pawn
      const forward = isWhite ? -1 : 1;
      const startRow = isWhite ? 6 : 1;

      // 1-step forward
      const f1 = r + forward;
      if (isInside(f1, c) && !board[f1][c]) {
        moves.push([f1, c]);
        // 2-step forward from starting row
        const f2 = r + 2 * forward;
        if (r === startRow && isInside(f2, c) && !board[f2][c]) {
          moves.push([f2, c]);
        }
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const tr = r + forward;
        const tc = c + dc;
        if (isInside(tr, tc)) {
          const target = board[tr][tc];
          const hasStar = stars?.some(([sr, sc]) => sr === tr && sc === tc);
          if (target) {
            const targetIsWhite = target === target.toUpperCase();
            if (isWhite !== targetIsWhite) {
              moves.push([tr, tc]);
            }
          } else if (hasStar) {
            moves.push([tr, tc]);
          }
        }
      }
      break;
  }

  return moves;
}

