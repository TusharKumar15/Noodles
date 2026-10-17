import React from 'react';

/**
 * Common puzzle response payload from GET /puzzle/new
 */
export interface PuzzleData<T = any> {
  puzzleId: string;
  puzzleType: string;
  puzzle: T;
  servedAt: string;
}

/**
 * Submission response payload from POST /puzzle/{id}/submit
 */
export interface SubmitResponse {
  correct: boolean;
  elapsedSeconds: number;
  message: string;
}

/**
 * Props that any puzzle implementation component must satisfy
 */
export interface PuzzleProps<TPuzzle = any, TSolution = any> {
  puzzleId: string;
  puzzle: TPuzzle;
  onSolve: (solution: TSolution) => void;
  disabled?: boolean;
}

/**
 * Metadata & component binding for a registered puzzle type
 */
export interface PuzzleDefinition<TPuzzle = any, TSolution = any> {
  type: string;
  displayName: string;
  component: React.ComponentType<PuzzleProps<TPuzzle, TSolution>>;
}
