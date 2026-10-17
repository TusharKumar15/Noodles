export type TangoSymbol = 'S' | 'M' | '';

export type TangoGrid = TangoSymbol[][];

export interface TangoEdge {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  type: '=' | 'x';
}

export interface TangoPuzzleData {
  size: number;
  grid: TangoGrid;
  edges: TangoEdge[];
}

export type TangoCellCoordinate = [number, number];
