// Fast procedural 9x9 Sudoku generator with backtracking solver

export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

export interface GeneratedSudoku {
  initial: number[][];
  solution: number[][];
}

function createEmptyGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[boxRow + r][boxCol + c] === num) return false;
    }
  }
  return true;
}

function solveGrid(grid: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(grid, r, c, num)) {
            grid[r][c] = num;
            if (solveGrid(grid)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function fillDiagonalBoxes(grid: number[][]): void {
  for (let box = 0; box < 9; box += 3) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid[box + r][box + c] = nums[idx++];
      }
    }
  }
}

export function generateSudoku(difficulty: SudokuDifficulty = 'medium'): GeneratedSudoku {
  const fullGrid = createEmptyGrid();

  // Fill the 3 independent diagonal 3x3 blocks
  fillDiagonalBoxes(fullGrid);

  // Solve the remaining cells to produce a complete, valid Sudoku
  solveGrid(fullGrid);

  // Clone solution
  const solution = fullGrid.map((row) => [...row]);
  const initial = fullGrid.map((row) => [...row]);

  // Determine holes to dig based on difficulty
  let holesToDig = 38; // easy: ~43 clues
  if (difficulty === 'medium') holesToDig = 48; // medium: ~33 clues
  if (difficulty === 'hard') holesToDig = 54; // hard: ~27 clues

  const cellPositions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      cellPositions.push([r, c]);
    }
  }

  const shuffledPositions = shuffle(cellPositions);
  for (let i = 0; i < holesToDig && i < shuffledPositions.length; i++) {
    const [r, c] = shuffledPositions[i];
    initial[r][c] = 0;
  }

  return { initial, solution };
}

