/**
 * Slitherlink (Loops) type definitions
 */

export type EdgeState = 0 | 1 | -1; // 0 = empty, 1 = line, -1 = cross (X)

export type HorizontalEdges = EdgeState[][]; // (rows + 1) × cols
export type VerticalEdges = EdgeState[][];   // rows × (cols + 1)

export interface SlitherlinkPuzzleData {
  size?: number;
  rows?: number;
  cols?: number;
  clues: (number | null)[][];
  rules?: string[];
}

export interface SlitherlinkSolution {
  horizontal: number[][];
  vertical: number[][];
}

export type SlitherlinkToolMode = 'cycle' | 'line' | 'cross';

export type EdgeType = 'H' | 'V';

export interface EdgeCoordinate {
  type: EdgeType;
  r: number;
  c: number;
}
