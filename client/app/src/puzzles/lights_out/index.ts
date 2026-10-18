import { PuzzleDefinition } from '../../types/puzzle';
import { LightsOutPuzzle } from './LightsOutPuzzle';
import { LightsOutPuzzleData } from './types';

export * from './logic';
export * from './types';
export * from './LightsOutPuzzle';

export const LightsOutDefinition: PuzzleDefinition<LightsOutPuzzleData, number[][]> = {
  type: 'lights_out',
  displayName: 'Lights Out (5×5)',
  component: LightsOutPuzzle,
};
