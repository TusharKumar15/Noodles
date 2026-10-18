import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PuzzleProps } from '../../types/puzzle';
import { LightsOutBoard } from './components/LightsOutBoard';
import { LightsOutControls } from './components/LightsOutControls';
import {
  countLitLights,
  createEmptyGrid,
  deepCloneGrid,
  isAllLightsOff,
  toggleCellAndNeighbors,
} from './logic';
import { LightsOutGrid, LightsOutPuzzleData } from './types';

export function LightsOutPuzzle({
  puzzleId,
  puzzle,
  onSolve,
  disabled = false,
}: PuzzleProps<LightsOutPuzzleData, number[][]>) {
  const gridSize = puzzle.grid?.length || 5;

  const [currentGrid, setCurrentGrid] = useState<LightsOutGrid>(() =>
    deepCloneGrid(puzzle.grid || createEmptyGrid(gridSize)),
  );
  const [pressMask, setPressMask] = useState<number[][]>(() =>
    createEmptyGrid(gridSize),
  );
  const [moveCount, setMoveCount] = useState<number>(0);

  // Reset state when new puzzle loads
  useEffect(() => {
    const size = puzzle.grid?.length || 5;
    setCurrentGrid(deepCloneGrid(puzzle.grid || createEmptyGrid(size)));
    setPressMask(createEmptyGrid(size));
    setMoveCount(0);
  }, [puzzleId, puzzle]);

  // Handle cell click
  const handleCellPress = useCallback(
    (r: number, c: number) => {
      if (disabled) return;

      const nextGrid = toggleCellAndNeighbors(currentGrid, r, c);
      const nextPressMask = deepCloneGrid(pressMask);
      nextPressMask[r][c] ^= 1;

      setCurrentGrid(nextGrid);
      setPressMask(nextPressMask);
      setMoveCount(prev => prev + 1);

      // Check win condition: all lights turned off!
      if (isAllLightsOff(nextGrid)) {
        onSolve(nextPressMask);
      }
    },
    [disabled, currentGrid, pressMask, onSolve],
  );

  // Reset current puzzle to initial state
  const handleReset = useCallback(() => {
    const size = puzzle.grid?.length || 5;
    setCurrentGrid(deepCloneGrid(puzzle.grid || createEmptyGrid(size)));
    setPressMask(createEmptyGrid(size));
    setMoveCount(0);
  }, [puzzle]);

  const litCount = countLitLights(currentGrid);
  const totalLights = gridSize * gridSize;

  return (
    <View style={styles.container}>
      <LightsOutBoard
        grid={currentGrid}
        onCellPress={handleCellPress}
        disabled={disabled}
      />
      <LightsOutControls
        litCount={litCount}
        totalLights={totalLights}
        moveCount={moveCount}
        minMoves={puzzle.min_moves}
        rules={puzzle.rules}
        onReset={handleReset}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
});
