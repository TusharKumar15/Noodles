import { PuzzleDefinition } from '../types/puzzle';
import { Sudoku6x6Definition } from './sudoku';

/**
 * Registry of all supported puzzle types in Noodles.
 * To add a new puzzle (e.g. Queens, Tango, Slitherlink), create its module under
 * src/puzzles/<name> and register it here.
 */
const puzzleRegistry: Record<string, PuzzleDefinition<any, any>> = {
  sudoku_6x6: Sudoku6x6Definition,
  sudoku: Sudoku6x6Definition, // Fallback alias
};

export function getPuzzleDefinition(puzzleType: string): PuzzleDefinition<any, any> | undefined {
  return puzzleRegistry[puzzleType];
}

export function registerPuzzle(definition: PuzzleDefinition<any, any>): void {
  puzzleRegistry[definition.type] = definition;
}
