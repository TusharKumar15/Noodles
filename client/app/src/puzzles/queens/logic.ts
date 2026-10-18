import { QueensCell, QueensCoordinate, QueensGrid } from './types';

/**
 * Curated harmonious color palette for up to 10 regions on dark backgrounds.
 */
export const REGION_COLORS: string[] = [
  '#312E81', // 0: Deep Indigo
  '#064E3B', // 1: Forest Emerald
  '#78350F', // 2: Warm Amber Bronze
  '#1E3A8A', // 3: Sapphire Blue
  '#831843', // 4: Crimson Berry
  '#134E4A', // 5: Ocean Teal
  '#581C87', // 6: Royal Amethyst
  '#3F3F46', // 7: Steel Zinc
  '#7C2D12', // 8: Terracotta
  '#4C1D95', // 9: Midnight Violet
];

/**
 * Returns the color assigned to a specific region ID.
 */
export function getRegionColor(regionId: number): string {
  const index = Math.abs(regionId) % REGION_COLORS.length;
  return REGION_COLORS[index];
}

/**
 * Creates an empty N×N Queens grid filled with empty strings.
 */
export function createEmptyQueensGrid(size: number): QueensGrid {
  return Array.from({ length: size }, () => Array(size).fill(''));
}

/**
 * Creates a deep copy of the Queens grid.
 */
export function deepCloneQueensGrid(grid: QueensGrid): QueensGrid {
  return grid.map(row => [...row]);
}

/**
 * Counts how many queens ('Q') are currently placed on the board.
 */
export function countPlacedQueens(grid: QueensGrid): number {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 'Q') count++;
    }
  }
  return count;
}

/**
 * Returns all [r, c] coordinates of placed queens.
 */
export function getQueensCoordinates(grid: QueensGrid): QueensCoordinate[] {
  const coords: QueensCoordinate[] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 'Q') {
        coords.push([r, c]);
      }
    }
  }
  return coords;
}

/**
 * Checks if the Queen at (r, c) violates any rule:
 * - Duplicate in same row
 * - Duplicate in same column
 * - Duplicate in same region
 * - Touching any other Queen (orthogonally or diagonally)
 */
export function hasQueenConflict(
  grid: QueensGrid,
  regions: number[][],
  r: number,
  c: number,
): boolean {
  if (grid[r][c] !== 'Q') return false;

  const size = grid.length;
  const currentRegion = regions[r]?.[c];

  for (let otherR = 0; otherR < size; otherR++) {
    for (let otherC = 0; otherC < size; otherC++) {
      if (otherR === r && otherC === c) continue;
      if (grid[otherR][otherC] !== 'Q') continue;

      // Same row or column
      if (otherR === r || otherC === c) return true;

      // Same region
      if (regions[otherR]?.[otherC] === currentRegion) return true;

      // Touching in 8 directions (Chebyshev distance <= 1)
      if (Math.abs(otherR - r) <= 1 && Math.abs(otherC - c) <= 1) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Returns true if the current board is a fully correct, solved state:
 * - Exactly N queens placed
 * - Exactly 1 queen per row
 * - Exactly 1 queen per column
 * - Exactly 1 queen per region
 * - No two queens touch horizontally, vertically, or diagonally
 */
export function isQueensWin(grid: QueensGrid, regions: number[][]): boolean {
  const size = grid.length;
  if (!regions || regions.length !== size) return false;

  const queens = getQueensCoordinates(grid);
  if (queens.length !== size) return false;

  const rows = new Set<number>();
  const cols = new Set<number>();
  const regs = new Set<number>();

  for (const [r, c] of queens) {
    if (rows.has(r) || cols.has(c)) return false;
    const reg = regions[r]?.[c];
    if (reg === undefined || regs.has(reg)) return false;

    rows.add(r);
    cols.add(c);
    regs.add(reg);
  }

  // Check no two touch
  for (let i = 0; i < queens.length; i++) {
    const [r1, c1] = queens[i];
    for (let j = i + 1; j < queens.length; j++) {
      const [r2, c2] = queens[j];
      if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Automatically fills 'X' in all 8 adjacent neighbors of a newly placed Queen.
 */
export function autoMarkAdjacentXs(
  grid: QueensGrid,
  r: number,
  c: number,
): QueensGrid {
  const next = deepCloneQueensGrid(grid);
  const size = grid.length;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        if (next[nr][nc] === '') {
          next[nr][nc] = 'X';
        }
      }
    }
  }

  return next;
}
