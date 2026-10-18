import { PuzzleDefinition } from '../../types/puzzle';
import { QueensPuzzle } from './QueensPuzzle';
import { QueensGrid, QueensPuzzleData } from './types';

export * from './logic';
export * from './types';
export * from './QueensPuzzle';

export const QueensDefinition: PuzzleDefinition<QueensPuzzleData, QueensGrid> = {
  type: 'queens',
  displayName: 'Queens (8×8)',
  component: QueensPuzzle,
};
