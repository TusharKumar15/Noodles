export type QueensCell = '' | 'X' | 'Q';
export type QueensGrid = QueensCell[][];

export interface QueensPuzzleData {
  size: number;
  regions: number[][]; // N×N grid of region numbers (0 to size - 1)
  rules?: string[];
}

export type QueensCoordinate = [number, number];

export type QueensToolMode = 'cycle' | 'queen' | 'cross';
