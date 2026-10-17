import type { TangoEdge, TangoGrid, TangoSymbol } from './types';

export const TANGO_6X6_CONFIG = {
  SIZE: 6,
  HALF: 3,
  SUN: 'S' as TangoSymbol,
  MOON: 'M' as TangoSymbol,
  EMPTY: '' as TangoSymbol,
};

/**
 * Creates a deep copy of a 2D Tango grid.
 */
export function deepCloneGrid(g: TangoGrid): TangoGrid {
  return g.map(row => [...row]);
}

/**
 * Returns true if all cells in the grid are non-empty.
 */
export function isGridFull(grid: TangoGrid): boolean {
  return grid.every(row => row.every(v => v === 'S' || v === 'M'));
}

/**
 * Validates that an edge constraint is satisfied.
 * If either cell is empty, it is not yet violated.
 */
export function isEdgeViolated(grid: TangoGrid, edge: TangoEdge): boolean {
  const { r1, c1, r2, c2, type } = edge;
  const v1 = grid[r1]?.[c1];
  const v2 = grid[r2]?.[c2];

  if (!v1 || !v2) return false;

  if (type === '=' && v1 !== v2) return true;
  if (type === 'x' && v1 === v2) return true;

  return false;
}

/**
 * Local win-check for Tango.
 *
 * Rules:
 * 1. Exactly 3 Suns and 3 Moons per row & column.
 * 2. No 3 consecutive identical symbols (horizontally or vertically).
 * 3. All relational edge clues ('=' or 'x') are satisfied.
 * 4. All rows and columns are unique.
 * 5. All initial given cells match.
 */
export function isTangoWin(
  grid: TangoGrid,
  edges: TangoEdge[],
  puzzleGrid: TangoGrid,
): boolean {
  const { SIZE, HALF, SUN, MOON } = TANGO_6X6_CONFIG;

  if (!isGridFull(grid)) return false;

  // 1. Initial givens match
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const given = puzzleGrid[r][c];
      if (given && grid[r][c] !== given) {
        return false;
      }
    }
  }

  // 2. Relational edge constraints
  for (const edge of edges) {
    if (isEdgeViolated(grid, edge)) {
      return false;
    }
  }

  // 3. Row balance & no 3-in-a-row
  for (let r = 0; r < SIZE; r++) {
    const row = grid[r];
    const sunCount = row.filter(v => v === SUN).length;
    const moonCount = row.filter(v => v === MOON).length;
    if (sunCount !== HALF || moonCount !== HALF) return false;

    for (let c = 0; c < SIZE - 2; c++) {
      if (row[c] === row[c + 1] && row[c + 1] === row[c + 2]) {
        return false;
      }
    }
  }

  // 4. Column balance & no 3-in-a-row
  for (let c = 0; c < SIZE; c++) {
    const col = grid.map(row => row[c]);
    const sunCount = col.filter(v => v === SUN).length;
    const moonCount = col.filter(v => v === MOON).length;
    if (sunCount !== HALF || moonCount !== HALF) return false;

    for (let r = 0; r < SIZE - 2; r++) {
      if (col[r] === col[r + 1] && col[r + 1] === col[r + 2]) {
        return false;
      }
    }
  }

  // 5. Unique rows and unique columns
  const rowStrings = grid.map(row => row.join(''));
  if (new Set(rowStrings).size !== SIZE) return false;

  const colStrings = Array.from({ length: SIZE }, (_, c) =>
    grid.map(row => row[c]).join(''),
  );
  if (new Set(colStrings).size !== SIZE) return false;

  return true;
}

/**
 * Checks if a specific cell currently has an active conflict.
 */
export function hasCellConflict(
  grid: TangoGrid,
  edges: TangoEdge[],
  row: number,
  col: number,
): boolean {
  const { SIZE, HALF, SUN, MOON } = TANGO_6X6_CONFIG;
  const val = grid[row][col];
  if (!val) return false;

  // Check row count overflow
  const rowVals = grid[row];
  if (val === SUN && rowVals.filter(v => v === SUN).length > HALF) return true;
  if (val === MOON && rowVals.filter(v => v === MOON).length > HALF) return true;

  // Check col count overflow
  const colVals = grid.map(r => r[col]);
  if (val === SUN && colVals.filter(v => v === SUN).length > HALF) return true;
  if (val === MOON && colVals.filter(v => v === MOON).length > HALF) return true;

  // Check horizontal 3-in-a-row
  for (let c = Math.max(0, col - 2); c <= Math.min(SIZE - 3, col); c++) {
    if (
      rowVals[c] &&
      rowVals[c] === rowVals[c + 1] &&
      rowVals[c + 1] === rowVals[c + 2]
    ) {
      return true;
    }
  }

  // Check vertical 3-in-a-row
  for (let r = Math.max(0, row - 2); r <= Math.min(SIZE - 3, row); r++) {
    if (
      grid[r][col] &&
      grid[r][col] === grid[r + 1][col] &&
      grid[r + 1][col] === grid[r + 2][col]
    ) {
      return true;
    }
  }

  // Check edge constraints involving this cell
  for (const edge of edges) {
    const touches =
      (edge.r1 === row && edge.c1 === col) || (edge.r2 === row && edge.c2 === col);
    if (touches && isEdgeViolated(grid, edge)) {
      return true;
    }
  }

  return false;
}
