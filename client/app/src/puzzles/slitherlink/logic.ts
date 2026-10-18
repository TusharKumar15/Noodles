import {
  EdgeState,
  HorizontalEdges,
  SlitherlinkSolution,
  VerticalEdges,
} from './types';

/**
 * Creates empty edge matrices for a grid of size rows × cols.
 */
export function createEmptyEdges(rows: number, cols: number): {
  horizontal: HorizontalEdges;
  vertical: VerticalEdges;
} {
  const horizontal: HorizontalEdges = [];
  for (let r = 0; r <= rows; r++) {
    horizontal.push(new Array(cols).fill(0));
  }

  const vertical: VerticalEdges = [];
  for (let r = 0; r < rows; r++) {
    vertical.push(new Array(cols + 1).fill(0));
  }

  return { horizontal, vertical };
}

/**
 * Deep clones the horizontal and vertical edge matrices.
 */
export function deepCloneEdges(
  horizontal: HorizontalEdges,
  vertical: VerticalEdges,
): { horizontal: HorizontalEdges; vertical: VerticalEdges } {
  return {
    horizontal: horizontal.map(row => [...row]),
    vertical: vertical.map(row => [...row]),
  };
}

/**
 * Counts the total number of drawn lines (state === 1) across the board.
 */
export function countLines(
  horizontal: HorizontalEdges,
  vertical: VerticalEdges,
): number {
  let count = 0;
  for (const row of horizontal) {
    for (const val of row) {
      if (val === 1) count++;
    }
  }
  for (const row of vertical) {
    for (const val of row) {
      if (val === 1) count++;
    }
  }
  return count;
}

/**
 * Returns how many drawn lines (state === 1) border a specific cell (r, c).
 */
export function getCellLineCount(
  horizontal: HorizontalEdges,
  vertical: VerticalEdges,
  r: number,
  c: number,
): number {
  let cnt = 0;
  if (horizontal[r]?.[c] === 1) cnt++;
  if (horizontal[r + 1]?.[c] === 1) cnt++;
  if (vertical[r]?.[c] === 1) cnt++;
  if (vertical[r]?.[c + 1] === 1) cnt++;
  return cnt;
}

/**
 * Returns how many edges bordering a cell (r, c) are marked with an 'X' (-1).
 */
export function getCellCrossCount(
  horizontal: HorizontalEdges,
  vertical: VerticalEdges,
  r: number,
  c: number,
): number {
  let cnt = 0;
  if (horizontal[r]?.[c] === -1) cnt++;
  if (horizontal[r + 1]?.[c] === -1) cnt++;
  if (vertical[r]?.[c] === -1) cnt++;
  if (vertical[r]?.[c + 1] === -1) cnt++;
  return cnt;
}

export type CellClueStatus = 'satisfied' | 'over' | 'under' | 'none';

/**
 * Returns the status of a cell relative to its clue number.
 */
export function getCellStatus(
  horizontal: HorizontalEdges,
  vertical: VerticalEdges,
  clue: number | null | undefined,
  r: number,
  c: number,
): CellClueStatus {
  if (clue === null || clue === undefined || clue < 0) {
    return 'none';
  }
  const lines = getCellLineCount(horizontal, vertical, r, c);
  if (lines === clue) return 'satisfied';
  if (lines > clue) return 'over';
  return 'under';
}

/**
 * Computes degree (number of incident lines === 1) at vertex (vr, vc).
 */
export function getVertexDegree(
  horizontal: HorizontalEdges,
  vertical: VerticalEdges,
  vr: number,
  vc: number,
  rows: number,
  cols: number,
): number {
  let deg = 0;
  if (vr > 0 && vertical[vr - 1]?.[vc] === 1) deg++;
  if (vr < rows && vertical[vr]?.[vc] === 1) deg++;
  if (vc > 0 && horizontal[vr]?.[vc - 1] === 1) deg++;
  if (vc < cols && horizontal[vr]?.[vc] === 1) deg++;
  return deg;
}

/**
 * Checks if there are any immediate rule violations on the board:
 * - A vertex with degree > 2 (branching or crossing)
 * - A cell with line count > clue (over-capacity)
 */
export function hasAnyConflict(
  horizontal: HorizontalEdges,
  vertical: VerticalEdges,
  clues: (number | null)[][],
  rows: number,
  cols: number,
): boolean {
  // Check cell line count > clue
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const clue = clues[r]?.[c];
      if (clue !== null && clue !== undefined && clue >= 0) {
        if (getCellLineCount(horizontal, vertical, r, c) > clue) {
          return true;
        }
      }
    }
  }

  // Check vertex degrees > 2
  for (let vr = 0; vr <= rows; vr++) {
    for (let vc = 0; vc <= cols; vc++) {
      if (getVertexDegree(horizontal, vertical, vr, vc, rows, cols) > 2) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks whether the current edges form a complete and valid Slitherlink win:
 * 1. All cell clues match their surrounding line count exactly.
 * 2. Every vertex touched by the loop has degree exactly 2 (no dead ends, no branches).
 * 3. Total lines > 0.
 * 4. The lines form a SINGLE connected closed loop (no multiple separate loops).
 */
export function isSlitherlinkWin(
  horizontal: HorizontalEdges,
  vertical: VerticalEdges,
  clues: (number | null)[][],
  rows: number,
  cols: number,
): boolean {
  // 1. Clue verification
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const clue = clues[r]?.[c];
      if (clue !== null && clue !== undefined && clue >= 0) {
        if (getCellLineCount(horizontal, vertical, r, c) !== clue) {
          return false;
        }
      }
    }
  }

  // 2. Vertex degrees & identify active vertices
  const activeVertices: string[] = [];
  for (let vr = 0; vr <= rows; vr++) {
    for (let vc = 0; vc <= cols; vc++) {
      const deg = getVertexDegree(horizontal, vertical, vr, vc, rows, cols);
      if (deg !== 0 && deg !== 2) {
        return false;
      }
      if (deg === 2) {
        activeVertices.push(`${vr},${vc}`);
      }
    }
  }

  const totalLines = countLines(horizontal, vertical);
  if (totalLines === 0 || activeVertices.length < 4) {
    return false;
  }

  // In any 2-regular graph (collection of cycles), the number of vertices equals the number of edges
  if (activeVertices.length !== totalLines) {
    return false;
  }

  // 3. Single connected component check via BFS
  const visited = new Set<string>();
  const queue: [number, number][] = [];

  const [startR, startC] = activeVertices[0].split(',').map(Number);
  queue.push([startR, startC]);
  visited.add(activeVertices[0]);

  while (queue.length > 0) {
    const [vr, vc] = queue.shift()!;
    const neighbors: [number, number][] = [];

    if (vr > 0 && vertical[vr - 1]?.[vc] === 1) neighbors.push([vr - 1, vc]);
    if (vr < rows && vertical[vr]?.[vc] === 1) neighbors.push([vr + 1, vc]);
    if (vc > 0 && horizontal[vr]?.[vc - 1] === 1) neighbors.push([vr, vc - 1]);
    if (vc < cols && horizontal[vr]?.[vc] === 1) neighbors.push([vr, vc + 1]);

    for (const [nr, nc] of neighbors) {
      const key = `${nr},${nc}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push([nr, nc]);
      }
    }
  }

  return visited.size === activeVertices.length;
}

/**
 * Formats the current edge state into the submission payload for the server.
 */
export function formatSolutionForSubmit(
  horizontal: HorizontalEdges,
  vertical: VerticalEdges,
): SlitherlinkSolution {
  return {
    horizontal: horizontal.map(row => row.map(v => (v === 1 ? 1 : 0))),
    vertical: vertical.map(row => row.map(v => (v === 1 ? 1 : 0))),
  };
}
