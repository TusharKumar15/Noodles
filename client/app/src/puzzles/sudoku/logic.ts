import type { SudokuGrid } from './types';

export const SUDOKU_6X6_CONFIG = {
  SIZE: 6,
  BOX_ROWS: 2,
  BOX_COLS: 3,
  DIGITS: [1, 2, 3, 4, 5, 6],
};

/**
 * Creates a deep copy of a 2D Sudoku grid.
 */
export function deepCloneGrid(g: SudokuGrid): SudokuGrid {
  return g.map(row => [...row]);
}

/**
 * Returns true if all cells in the grid are non-zero.
 */
export function isGridFull(grid: SudokuGrid): boolean {
  return grid.every(row => row.every(v => v !== 0));
}

/**
 * Local win-check (pure UX — server validates independently).
 * Returns true if every row, col, and 2×3 box contains digits 1-6 exactly once.
 */
export function isSudokuWin(grid: SudokuGrid): boolean {
  const { SIZE, BOX_ROWS, BOX_COLS } = SUDOKU_6X6_CONFIG;
  const valid = (arr: number[]) =>
    arr.length === SIZE &&
    new Set(arr).size === SIZE &&
    arr.every(v => v >= 1 && v <= SIZE);

  // Rows
  for (let r = 0; r < SIZE; r++) {
    if (!valid(grid[r])) return false;
  }

  // Columns
  for (let c = 0; c < SIZE; c++) {
    if (!valid(grid.map(row => row[c]))) return false;
  }

  // 2×3 boxes
  for (let br = 0; br < SIZE / BOX_ROWS; br++) {
    for (let bc = 0; bc < SIZE / BOX_COLS; bc++) {
      const cells: number[] = [];
      for (let dr = 0; dr < BOX_ROWS; dr++) {
        for (let dc = 0; dc < BOX_COLS; dc++) {
          cells.push(grid[br * BOX_ROWS + dr][bc * BOX_COLS + dc]);
        }
      }
      if (!valid(cells)) return false;
    }
  }

  return true;
}

/**
 * Detects any constraint conflict for a given cell (same row, col, or box).
 */
export function hasCellConflict(grid: SudokuGrid, row: number, col: number): boolean {
  const { SIZE, BOX_ROWS, BOX_COLS } = SUDOKU_6X6_CONFIG;
  const val = grid[row][col];
  if (!val) return false;

  // Row
  for (let c = 0; c < SIZE; c++) {
    if (c !== col && grid[row][c] === val) return true;
  }

  // Col
  for (let r = 0; r < SIZE; r++) {
    if (r !== row && grid[r][col] === val) return true;
  }

  // Box
  const br = Math.floor(row / BOX_ROWS) * BOX_ROWS;
  const bc = Math.floor(col / BOX_COLS) * BOX_COLS;
  for (let dr = 0; dr < BOX_ROWS; dr++) {
    for (let dc = 0; dc < BOX_COLS; dc++) {
      const rr = br + dr;
      const cc = bc + dc;
      if ((rr !== row || cc !== col) && grid[rr][cc] === val) return true;
    }
  }

  return false;
}
