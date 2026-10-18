import { LightsOutGrid } from './types';

/**
 * Creates a deep copy of a 2D number grid.
 */
export function deepCloneGrid(grid: LightsOutGrid): LightsOutGrid {
  return grid.map(row => [...row]);
}

/**
 * Creates a zero-filled grid of size n × n.
 */
export function createEmptyGrid(size: number): LightsOutGrid {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

/**
 * Toggles a cell and its 4 orthogonal adjacent neighbors (up, down, left, right).
 * Returns a new cloned grid with the toggled states.
 */
export function toggleCellAndNeighbors(
  grid: LightsOutGrid,
  r: number,
  c: number,
): LightsOutGrid {
  const next = deepCloneGrid(grid);
  const size = grid.length;
  const deltas = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dr, dc] of deltas) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      next[nr][nc] = next[nr][nc] === 1 ? 0 : 1;
    }
  }

  return next;
}

/**
 * Returns true if all lights in the grid are turned OFF (0).
 */
export function isAllLightsOff(grid: LightsOutGrid): boolean {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== 0) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Count how many lights are currently turned ON (1).
 */
export function countLitLights(grid: LightsOutGrid): number {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 1) count++;
    }
  }
  return count;
}
