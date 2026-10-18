import { PuzzleDefinition } from '../../types/puzzle';
import { SlitherlinkPuzzle } from './SlitherlinkPuzzle';
import { SlitherlinkPuzzleData, SlitherlinkSolution } from './types';

export * from './logic';
export * from './types';
export * from './SlitherlinkPuzzle';

export const SlitherlinkDefinition: PuzzleDefinition<SlitherlinkPuzzleData, SlitherlinkSolution> = {
  type: 'slitherlink',
  displayName: 'Loops (5×5)',
  component: SlitherlinkPuzzle,
};
