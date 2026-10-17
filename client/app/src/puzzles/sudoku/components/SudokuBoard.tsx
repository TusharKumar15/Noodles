import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { SUDOKU_6X6_CONFIG, hasCellConflict } from '../logic';
import { SudokuCellCoordinate, SudokuGrid } from '../types';

interface SudokuBoardProps {
  puzzle: SudokuGrid;
  userGrid: SudokuGrid;
  selected: SudokuCellCoordinate | null;
  onCellPress: (r: number, c: number) => void;
  disabled?: boolean;
}

const CELL_SIZE = 52;

export function SudokuBoard({
  puzzle,
  userGrid,
  selected,
  onCellPress,
  disabled = false,
}: SudokuBoardProps) {
  const { SIZE, BOX_ROWS, BOX_COLS } = SUDOKU_6X6_CONFIG;
  const sel = selected;

  return (
    <View style={styles.gridWrapper}>
      <View style={styles.grid}>
        {userGrid.map((row, r) =>
          row.map((val, c) => {
            const isGiven = puzzle[r][c] !== 0;
            const isSelected = sel?.[0] === r && sel?.[1] === c;
            const inSameRow = sel?.[0] === r;
            const inSameCol = sel?.[1] === c;
            const inSameBox =
              sel !== null &&
              Math.floor(r / BOX_ROWS) === Math.floor(sel[0] / BOX_ROWS) &&
              Math.floor(c / BOX_COLS) === Math.floor(sel[1] / BOX_COLS);
            const conflict = hasCellConflict(userGrid, r, c);

            // Box borders (thick lines between 2x3 boxes)
            const borderRight = (c + 1) % BOX_COLS === 0 && c < SIZE - 1;
            const borderBottom = (r + 1) % BOX_ROWS === 0 && r < SIZE - 1;

            let bg = COLORS.cellBg;
            if (isSelected) {
              bg = COLORS.selected;
            } else if (inSameRow || inSameCol || inSameBox) {
              bg = COLORS.highlight;
            }

            return (
              <Pressable
                key={`${r}-${c}`}
                disabled={disabled}
                style={[
                  styles.cell,
                  borderRight && styles.cellBorderRight,
                  borderBottom && styles.cellBorderBottom,
                  { backgroundColor: bg },
                ]}
                onPress={() => onCellPress(r, c)}>
                {val !== 0 && (
                  <Text
                    style={[
                      styles.cellText,
                      isGiven && styles.givenText,
                      !isGiven && conflict && styles.conflictText,
                      !isGiven && !conflict && styles.userText,
                    ]}>
                    {val}
                  </Text>
                )}
              </Pressable>
            );
          }),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridWrapper: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.boxBorder,
  },
  grid: {
    width: CELL_SIZE * SUDOKU_6X6_CONFIG.SIZE,
    height: CELL_SIZE * SUDOKU_6X6_CONFIG.SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  cellBorderRight: {
    borderRightWidth: 2,
    borderRightColor: COLORS.boxBorder,
  },
  cellBorderBottom: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.boxBorder,
  },
  cellText: {
    fontSize: 20,
    fontWeight: '700',
  },
  givenText: {
    color: COLORS.given,
  },
  userText: {
    color: COLORS.user,
  },
  conflictText: {
    color: COLORS.conflict,
  },
});
