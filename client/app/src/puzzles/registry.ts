import { PuzzleDefinition } from '../types/puzzle';
import { LightsOutDefinition } from './lights_out';
import { QueensDefinition } from './queens';
import { Sudoku6x6Definition } from './sudoku';
import { TangoDefinition } from './tango';

/**
 * Registry of all supported puzzle types in Noodles.
 * To add a new puzzle (e.g. Queens, Tango, Slitherlink), create its module under
 * src/puzzles/<name> and register it here.
 */
const puzzleRegistry: Record<string, PuzzleDefinition<any, any>> = {
  sudoku: Sudoku6x6Definition,
  tango: TangoDefinition,
  lights_out: LightsOutDefinition,
  queens: QueensDefinition,
};

export function getPuzzleDefinition(puzzleType: string): PuzzleDefinition<any, any> | undefined {
  return puzzleRegistry[puzzleType];
}

export function registerPuzzle(definition: PuzzleDefinition<any, any>): void {
  puzzleRegistry[definition.type] = definition;
}
