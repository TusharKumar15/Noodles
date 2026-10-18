import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PuzzleProps } from '../../types/puzzle';
import { SlitherlinkBoard } from './components/SlitherlinkBoard';
import { SlitherlinkControls } from './components/SlitherlinkControls';
import {
  countLines,
  createEmptyEdges,
  deepCloneEdges,
  formatSolutionForSubmit,
  hasAnyConflict,
  isSlitherlinkWin,
} from './logic';
import {
  EdgeCoordinate,
  EdgeState,
  HorizontalEdges,
  SlitherlinkPuzzleData,
  SlitherlinkSolution,
  SlitherlinkToolMode,
  VerticalEdges,
} from './types';

export function SlitherlinkPuzzle({
  puzzleId,
  puzzle,
  onSolve,
  disabled = false,
}: PuzzleProps<SlitherlinkPuzzleData, SlitherlinkSolution>) {
  const rows = puzzle.rows || puzzle.size || 5;
  const cols = puzzle.cols || puzzle.size || 5;

  const [edges, setEdges] = useState<{
    horizontal: HorizontalEdges;
    vertical: VerticalEdges;
  }>(() => createEmptyEdges(rows, cols));

  const [toolMode, setToolMode] = useState<SlitherlinkToolMode>('cycle');

  // Reset board on new puzzle load
  useEffect(() => {
    const r = puzzle.rows || puzzle.size || 5;
    const c = puzzle.cols || puzzle.size || 5;
    setEdges(createEmptyEdges(r, c));
    setToolMode('cycle');
  }, [puzzleId, puzzle]);

  // Handle local win check
  const checkWin = useCallback(
    (h: HorizontalEdges, v: VerticalEdges) => {
      if (isSlitherlinkWin(h, v, puzzle.clues, rows, cols)) {
        onSolve(formatSolutionForSubmit(h, v));
      }
    },
    [puzzle.clues, rows, cols, onSolve],
  );

  // Handle edge tap
  const handleEdgePress = useCallback(
    (edge: EdgeCoordinate) => {
      if (disabled) return;

      const { horizontal, vertical } = deepCloneEdges(
        edges.horizontal,
        edges.vertical,
      );

      const currentVal =
        edge.type === 'H'
          ? horizontal[edge.r][edge.c]
          : vertical[edge.r][edge.c];

      let nextVal: EdgeState = 0;

      if (toolMode === 'cycle') {
        // Cycle: Empty (0) ➜ Line (1) ➜ Cross (-1) ➜ Empty (0)
        if (currentVal === 0) nextVal = 1;
        else if (currentVal === 1) nextVal = -1;
        else nextVal = 0;
      } else if (toolMode === 'line') {
        nextVal = currentVal === 1 ? 0 : 1;
      } else if (toolMode === 'cross') {
        nextVal = currentVal === -1 ? 0 : -1;
      }

      if (edge.type === 'H') {
        horizontal[edge.r][edge.c] = nextVal;
      } else {
        vertical[edge.r][edge.c] = nextVal;
      }

      setEdges({ horizontal, vertical });
      checkWin(horizontal, vertical);
    },
    [disabled, edges, toolMode, checkWin],
  );

  // Reset all user markings
  const handleReset = useCallback(() => {
    setEdges(createEmptyEdges(rows, cols));
  }, [rows, cols]);

  const lines = countLines(edges.horizontal, edges.vertical);
  const conflict = hasAnyConflict(
    edges.horizontal,
    edges.vertical,
    puzzle.clues,
    rows,
    cols,
  );

  return (
    <View style={styles.container}>
      <SlitherlinkBoard
        puzzle={puzzle}
        horizontal={edges.horizontal}
        vertical={edges.vertical}
        onEdgePress={handleEdgePress}
        disabled={disabled}
      />

      <SlitherlinkControls
        linesCount={lines}
        hasConflict={conflict}
        toolMode={toolMode}
        onToolModeChange={setToolMode}
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
