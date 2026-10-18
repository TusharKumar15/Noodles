import React from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import { getRegionColor, hasQueenConflict } from '../logic';
import { QueensCoordinate, QueensGrid, QueensPuzzleData } from '../types';

interface QueensBoardProps {
  puzzle: QueensPuzzleData;
  userGrid: QueensGrid;
  selected: QueensCoordinate | null;
  onCellPress: (r: number, c: number) => void;
  disabled?: boolean;
}

export function QueensBoard({
  puzzle,
  userGrid,
  selected,
  onCellPress,
  disabled = false,
}: QueensBoardProps) {
  const { size, regions } = puzzle;
  const screenWidth = Dimensions.get('window').width;
  const maxBoardWidth = Math.min(screenWidth - 32, 380);
  const cellSize = Math.floor(maxBoardWidth / size);
  const boardSize = cellSize * size;

  return (
    <View style={styles.boardContainer}>
      <View
        style={[
          styles.board,
          {
            width: boardSize,
            height: boardSize,
          },
        ]}>
        {userGrid.map((row, r) => (
          <View key={`q-row-${r}`} style={styles.row}>
            {row.map((val, c) => {
              const regId = regions[r]?.[c] ?? 0;
              const regionColor = getRegionColor(regId);
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const inSelectedRow = selected?.[0] === r;
              const inSelectedCol = selected?.[1] === c;
              const isConflict = hasQueenConflict(userGrid, regions, r, c);

              // Thick border for region boundaries, faint border within same region
              const borderTopThick = r === 0 || regions[r - 1]?.[c] !== regId;
              const borderBottomThick =
                r === size - 1 || regions[r + 1]?.[c] !== regId;
              const borderLeftThick = c === 0 || regions[r]?.[c - 1] !== regId;
              const borderRightThick =
                c === size - 1 || regions[r]?.[c + 1] !== regId;

              const borderTopColor = borderTopThick
                ? '#E2E8F0'
                : 'rgba(255, 255, 255, 0.1)';
              const borderBottomColor = borderBottomThick
                ? '#E2E8F0'
                : 'rgba(255, 255, 255, 0.1)';
              const borderLeftColor = borderLeftThick
                ? '#E2E8F0'
                : 'rgba(255, 255, 255, 0.1)';
              const borderRightColor = borderRightThick
                ? '#E2E8F0'
                : 'rgba(255, 255, 255, 0.1)';

              const borderTopWidth = borderTopThick ? 2 : 0.5;
              const borderBottomWidth = borderBottomThick ? 2 : 0.5;
              const borderLeftWidth = borderLeftThick ? 2 : 0.5;
              const borderRightWidth = borderRightThick ? 2 : 0.5;

              return (
                <Pressable
                  key={`q-cell-${r}-${c}`}
                  disabled={disabled}
                  style={({ pressed }) => [
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: regionColor,
                      borderTopColor,
                      borderBottomColor,
                      borderLeftColor,
                      borderRightColor,
                      borderTopWidth,
                      borderBottomWidth,
                      borderLeftWidth,
                      borderRightWidth,
                    },
                    (inSelectedRow || inSelectedCol) && styles.highlightAxis,
                    isSelected && styles.cellSelected,
                    isConflict && styles.cellConflict,
                    pressed && !disabled && styles.cellPressed,
                  ]}
                  onPress={() => onCellPress(r, c)}>
                  {/* Queen Crown */}
                  {val === 'Q' && (
                    <View
                      style={[
                        styles.queenBadge,
                        isConflict && styles.queenBadgeConflict,
                      ]}>
                      <Text
                        style={[
                          styles.crownEmoji,
                          { fontSize: Math.floor(cellSize * 0.54) },
                        ]}>
                        👑
                      </Text>
                      {isConflict && <View style={styles.conflictDot} />}
                    </View>
                  )}

                  {/* Crossed Cell */}
                  {val === 'X' && (
                    <Text
                      style={[
                        styles.crossText,
                        { fontSize: Math.floor(cellSize * 0.42) },
                      ]}>
                      ✕
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    alignSelf: 'center',
    marginVertical: 12,
  },
  board: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#0F0F1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  highlightAxis: {
    backgroundColor: undefined,
    opacity: 0.92,
  },
  cellSelected: {
    borderColor: '#F59E0B',
    borderWidth: 2,
    zIndex: 10,
  },
  cellConflict: {
    backgroundColor: '#4C0519',
    borderColor: '#EF4444',
  },
  cellPressed: {
    opacity: 0.75,
  },
  queenBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  queenBadgeConflict: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
  },
  crownEmoji: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  conflictDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  crossText: {
    color: '#94A3B8',
    fontWeight: '700',
    opacity: 0.75,
  },
});
