import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { LightsOutGrid } from '../types';

interface LightsOutBoardProps {
  grid: LightsOutGrid;
  onCellPress: (r: number, c: number) => void;
  disabled?: boolean;
}

const CELL_SIZE = 56;
const GAP = 8;

export function LightsOutBoard({
  grid,
  onCellPress,
  disabled = false,
}: LightsOutBoardProps) {
  const size = grid.length || 5;

  return (
    <View style={styles.boardContainer}>
      <View style={[styles.board, { width: size * CELL_SIZE + (size - 1) * GAP + 24 }]}>
        {grid.map((row, r) => (
          <View key={`row-${r}`} style={styles.row}>
            {row.map((val, c) => {
              const isLit = val === 1;

              return (
                <Pressable
                  key={`cell-${r}-${c}`}
                  disabled={disabled}
                  style={({ pressed }) => [
                    styles.cell,
                    isLit ? styles.cellLit : styles.cellUnlit,
                    pressed && !disabled && styles.cellPressed,
                  ]}
                  onPress={() => onCellPress(r, c)}>
                  {isLit ? (
                    <View style={styles.litGlowWrapper}>
                      <View style={styles.litCore} />
                      <Text style={styles.litEmoji}>💡</Text>
                    </View>
                  ) : (
                    <View style={styles.unlitCore} />
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
    marginVertical: 14,
    alignItems: 'center',
  },
  board: {
    backgroundColor: '#141424',
    borderRadius: 20,
    padding: 12,
    borderWidth: 2,
    borderColor: '#2F2F52',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: GAP / 2,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: GAP / 2,
    borderWidth: 1.5,
  },
  cellLit: {
    backgroundColor: '#2D2012',
    borderColor: '#F59E0B',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  cellUnlit: {
    backgroundColor: '#19192C',
    borderColor: '#2D2D4B',
  },
  cellPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
  },
  litGlowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  litCore: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
  },
  litEmoji: {
    fontSize: 22,
  },
  unlitCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#353556',
  },
});
