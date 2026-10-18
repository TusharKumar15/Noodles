export type LightsOutGrid = number[][]; // 0 = off, 1 = on

export interface LightsOutPuzzleData {
  grid: LightsOutGrid;
  min_moves?: number;
  rules?: string[];
}

export type LightsOutCoordinate = [number, number];
