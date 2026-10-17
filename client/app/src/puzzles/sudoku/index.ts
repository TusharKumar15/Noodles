import { PuzzleDefinition } from '../../types/puzzle';
import { SudokuPuzzle } from './SudokuPuzzle';
import { SudokuGrid } from './types';

export * from './logic';
export * from './types';
export * from './SudokuPuzzle';

export const Sudoku6x6Definition: PuzzleDefinition<SudokuGrid, SudokuGrid> = {
  type: 'sudoku_6x6',
  displayName: '6×6 Logic Sudoku',
  component: SudokuPuzzle,
};
