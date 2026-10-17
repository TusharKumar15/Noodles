import { PuzzleDefinition } from '../../types/puzzle';
import { TangoPuzzle } from './TangoPuzzle';
import { TangoPuzzleData } from './types';

export * from './logic';
export * from './types';
export * from './TangoPuzzle';

export const TangoDefinition: PuzzleDefinition<TangoPuzzleData, string[][]> = {
  type: 'tango',
  displayName: 'Tango (6×6)',
  component: TangoPuzzle,
};
