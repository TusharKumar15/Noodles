import { PuzzleData, SubmitResponse } from '../types/puzzle';

/**
 * Fetch a new puzzle from the backend server
 */
export async function fetchNewPuzzle(apiBase: string): Promise<PuzzleData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${apiBase}/puzzle/new`, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      puzzleId: data.puzzle_id,
      puzzleType: data.puzzle_type || 'sudoku',
      puzzle: data.puzzle,
      servedAt: data.served_at,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Submit user solution to the backend server
 */
export async function submitPuzzleSolution(
  apiBase: string,
  puzzleId: string,
  solution: any,
): Promise<SubmitResponse> {
  const res = await fetch(`${apiBase}/puzzle/${puzzleId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ solution }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  return {
    correct: data.correct,
    elapsedSeconds: data.elapsed_seconds,
    message: data.message,
  };
}
