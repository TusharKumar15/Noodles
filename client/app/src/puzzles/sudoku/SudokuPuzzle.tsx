import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { PuzzleProps } from '../../types/puzzle';
import { SudokuBoard } from './components/SudokuBoard';
import { SudokuNumpad } from './components/SudokuNumpad';
import { deepCloneGrid, isGridFull, isSudokuWin } from './logic';
import { SudokuCellCoordinate, SudokuGrid } from './types';

export function SudokuPuzzle({
  puzzleId,
  puzzle,
  onSolve,
  disabled = false,
}: PuzzleProps<SudokuGrid, SudokuGrid>) {
  const [userGrid, setUserGrid] = useState<SudokuGrid>(() => deepCloneGrid(puzzle));
  const [selected, setSelected] = useState<SudokuCellCoordinate | null>(null);

  // Reset local state when a new puzzle is loaded
  useEffect(() => {
    setUserGrid(deepCloneGrid(puzzle));
    setSelected(null);
  }, [puzzleId, puzzle]);

  const handleCellPress = useCallback(
    (r: number, c: number) => {
      if (disabled) return;
      if (puzzle[r][c] !== 0) return; // Given cell is non-editable
      setSelected([r, c]);
    },
    [disabled, puzzle],
  );

  const handleDigitPress = useCallback(
    (digit: number) => {
      if (disabled || !selected) return;
      const [r, c] = selected;

      const newGrid = deepCloneGrid(userGrid);
      // Toggle: pressing the same digit clears the cell
      newGrid[r][c] = newGrid[r][c] === digit ? 0 : digit;
      setUserGrid(newGrid);

      // Local win-check on every move
      if (isGridFull(newGrid) && isSudokuWin(newGrid)) {
        setSelected(null);
        onSolve(newGrid);
      }
    },
    [disabled, selected, userGrid, onSolve],
  );

  return (
    <View>
      <SudokuBoard
        puzzle={puzzle}
        userGrid={userGrid}
        selected={selected}
        onCellPress={handleCellPress}
        disabled={disabled}
      />
      {!disabled && (
        <SudokuNumpad onDigitPress={handleDigitPress} disabled={disabled} />
      )}
    </View>
  );
}
