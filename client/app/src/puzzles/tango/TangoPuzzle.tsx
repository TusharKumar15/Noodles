import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PuzzleProps } from '../../types/puzzle';
import { TangoBoard } from './components/TangoBoard';
import { TangoControls } from './components/TangoControls';
import { deepCloneGrid, isGridFull, isTangoWin } from './logic';
import { TangoCellCoordinate, TangoGrid, TangoPuzzleData, TangoSymbol } from './types';

export function TangoPuzzle({
  puzzleId,
  puzzle,
  onSolve,
  disabled = false,
}: PuzzleProps<TangoPuzzleData, string[][]>) {
  const [userGrid, setUserGrid] = useState<TangoGrid>(() => deepCloneGrid(puzzle.grid));
  const [selected, setSelected] = useState<TangoCellCoordinate | null>(null);

  // Reset local state when a new puzzle is loaded
  useEffect(() => {
    setUserGrid(deepCloneGrid(puzzle.grid));
    setSelected(null);
  }, [puzzleId, puzzle]);

  // Check and trigger win
  const checkWin = useCallback(
    (grid: TangoGrid) => {
      if (isGridFull(grid) && isTangoWin(grid, puzzle.edges, puzzle.grid)) {
        setSelected(null);
        onSolve(grid);
      }
    },
    [puzzle, onSolve],
  );

  // Cell press: select and cycle through states (Empty -> Sun -> Moon -> Empty)
  const handleCellPress = useCallback(
    (r: number, c: number) => {
      if (disabled) return;
      setSelected([r, c]);

      // If it is a given cell, it cannot be modified
      if (puzzle.grid[r][c] !== '') return;

      const currentVal = userGrid[r][c];
      let nextVal: TangoSymbol = '';
      if (currentVal === '') nextVal = 'S';
      else if (currentVal === 'S') nextVal = 'M';
      else nextVal = '';

      const newGrid = deepCloneGrid(userGrid);
      newGrid[r][c] = nextVal;
      setUserGrid(newGrid);

      checkWin(newGrid);
    },
    [disabled, puzzle.grid, userGrid, checkWin],
  );

  // Control button press: set selected cell to chosen symbol
  const handleSymbolPress = useCallback(
    (symbol: TangoSymbol) => {
      if (disabled || !selected) return;
      const [r, c] = selected;

      // Given cells cannot be altered
      if (puzzle.grid[r][c] !== '') return;

      const newGrid = deepCloneGrid(userGrid);
      // Toggle: pressing the same symbol clears the cell
      newGrid[r][c] = newGrid[r][c] === symbol ? '' : symbol;
      setUserGrid(newGrid);

      checkWin(newGrid);
    },
    [disabled, selected, puzzle.grid, userGrid, checkWin],
  );

  const selectedSymbol = selected ? userGrid[selected[0]][selected[1]] : undefined;

  return (
    <View style={styles.container}>
      <TangoBoard
        puzzle={puzzle}
        userGrid={userGrid}
        selected={selected}
        onCellPress={handleCellPress}
        disabled={disabled}
      />
      {!disabled && (
        <TangoControls
          onSymbolPress={handleSymbolPress}
          selectedSymbol={selectedSymbol}
          disabled={disabled}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
