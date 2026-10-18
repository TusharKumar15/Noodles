import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PuzzleProps } from '../../types/puzzle';
import { QueensBoard } from './components/QueensBoard';
import { QueensControls } from './components/QueensControls';
import {
  countPlacedQueens,
  createEmptyQueensGrid,
  deepCloneQueensGrid,
  hasQueenConflict,
  isQueensWin,
} from './logic';
import {
  QueensCell,
  QueensCoordinate,
  QueensGrid,
  QueensPuzzleData,
  QueensToolMode,
} from './types';

export function QueensPuzzle({
  puzzleId,
  puzzle,
  onSolve,
  disabled = false,
}: PuzzleProps<QueensPuzzleData, QueensGrid>) {
  const size = puzzle.size || 8;
  const [userGrid, setUserGrid] = useState<QueensGrid>(() =>
    createEmptyQueensGrid(size),
  );
  const [selected, setSelected] = useState<QueensCoordinate | null>(null);
  const [toolMode, setToolMode] = useState<QueensToolMode>('cycle');

  // Reset state when new puzzle loads
  useEffect(() => {
    const s = puzzle.size || 8;
    setUserGrid(createEmptyQueensGrid(s));
    setSelected(null);
    setToolMode('cycle');
  }, [puzzleId, puzzle]);

  // Check win condition
  const checkWin = useCallback(
    (grid: QueensGrid) => {
      if (isQueensWin(grid, puzzle.regions)) {
        setSelected(null);
        onSolve(grid);
      }
    },
    [puzzle.regions, onSolve],
  );

  // Cell press handler
  const handleCellPress = useCallback(
    (r: number, c: number) => {
      if (disabled) return;
      setSelected([r, c]);

      const currentVal = userGrid[r][c];
      let nextVal: QueensCell = '';

      if (toolMode === 'cycle') {
        // Cycle: Empty ➜ ✕ ➜ 👑 ➜ Empty
        if (currentVal === '') nextVal = 'X';
        else if (currentVal === 'X') nextVal = 'Q';
        else nextVal = '';
      } else if (toolMode === 'queen') {
        // Queen toggle
        nextVal = currentVal === 'Q' ? '' : 'Q';
      } else if (toolMode === 'cross') {
        // Cross toggle
        nextVal = currentVal === 'X' ? '' : 'X';
      }

      const nextGrid = deepCloneQueensGrid(userGrid);
      nextGrid[r][c] = nextVal;
      setUserGrid(nextGrid);

      checkWin(nextGrid);
    },
    [disabled, userGrid, toolMode, checkWin],
  );

  // Reset board
  const handleReset = useCallback(() => {
    const s = puzzle.size || 8;
    setUserGrid(createEmptyQueensGrid(s));
    setSelected(null);
  }, [puzzle.size]);

  const placedQueens = countPlacedQueens(userGrid);

  // Check if any queen on the board has a conflict
  const hasAnyConflict = userGrid.some((row, r) =>
    row.some((val, c) => val === 'Q' && hasQueenConflict(userGrid, puzzle.regions, r, c)),
  );

  return (
    <View style={styles.container}>
      <QueensBoard
        puzzle={puzzle}
        userGrid={userGrid}
        selected={selected}
        onCellPress={handleCellPress}
        disabled={disabled}
      />
      <QueensControls
        placedQueens={placedQueens}
        totalQueens={size}
        hasConflict={hasAnyConflict}
        toolMode={toolMode}
        onToolModeChange={setToolMode}
        onReset={handleReset}
        rules={puzzle.rules}
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
