import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { hasCellConflict, isEdgeViolated } from '../logic';
import { TangoCellCoordinate, TangoGrid, TangoPuzzleData } from '../types';

interface TangoBoardProps {
  puzzle: TangoPuzzleData;
  userGrid: TangoGrid;
  selected: TangoCellCoordinate | null;
  onCellPress: (r: number, c: number) => void;
  disabled?: boolean;
}

const CELL_SIZE = 50;
const BADGE_SIZE = 22;

export function TangoBoard({
  puzzle,
  userGrid,
  selected,
  onCellPress,
  disabled = false,
}: TangoBoardProps) {
  const { size, grid: initialGrid, edges } = puzzle;
  const sel = selected;

  return (
    <View style={styles.gridWrapper}>
      <View style={styles.board}>
        {/* Render 6x6 Cells */}
        {userGrid.map((row, r) => (
          <View key={`row-${r}`} style={styles.row}>
            {row.map((val, c) => {
              const isGiven = Boolean(initialGrid[r][c]);
              const isSelected = sel?.[0] === r && sel?.[1] === c;
              const inSameRow = sel?.[0] === r;
              const inSameCol = sel?.[1] === c;
              const conflict = hasCellConflict(userGrid, edges, r, c);

              let bg = COLORS.cellBg;
              if (isSelected) {
                bg = COLORS.selected;
              } else if (inSameRow || inSameCol) {
                bg = COLORS.highlight;
              } else if (isGiven) {
                bg = '#18182A';
              }

              return (
                <Pressable
                  key={`cell-${r}-${c}`}
                  disabled={disabled}
                  style={({ pressed }) => [
                    styles.cell,
                    { backgroundColor: bg },
                    isGiven && styles.cellGiven,
                    conflict && styles.cellConflict,
                    isSelected && styles.cellSelected,
                    pressed && !disabled && styles.cellPressed,
                  ]}
                  onPress={() => onCellPress(r, c)}>
                  {val === 'S' && (
                    <View style={styles.symbolContainer}>
                      <Text style={styles.sunSymbol}>☀️</Text>
                      {isGiven && <View style={styles.givenDot} />}
                    </View>
                  )}
                  {val === 'M' && (
                    <View style={styles.symbolContainer}>
                      <Text style={styles.moonSymbol}>🌙</Text>
                      {isGiven && <View style={styles.givenDot} />}
                    </View>
                  )}
                  {val === '' && isGiven && (
                    <View style={styles.givenDotEmpty} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}

        {/* Render Edge Clue Badges (= and ×) */}
        {edges.map((edge, idx) => {
          const { r1, c1, r2, c2, type } = edge;
          const isViolated = isEdgeViolated(userGrid, edge);

          // Calculate center on the border divider
          let left = 0;
          let top = 0;

          if (r1 === r2) {
            // Horizontal border between col c1 and c2
            left = c2 * CELL_SIZE - BADGE_SIZE / 2;
            top = r1 * CELL_SIZE + CELL_SIZE / 2 - BADGE_SIZE / 2;
          } else {
            // Vertical border between row r1 and r2
            left = c1 * CELL_SIZE + CELL_SIZE / 2 - BADGE_SIZE / 2;
            top = r2 * CELL_SIZE - BADGE_SIZE / 2;
          }

          return (
            <View
              key={`edge-${idx}-${r1}-${c1}-${r2}-${c2}`}
              style={[
                styles.edgeBadge,
                { left, top },
                type === '=' ? styles.edgeEqual : styles.edgeCross,
                isViolated && styles.edgeViolated,
              ]}>
              <Text
                style={[
                  styles.edgeText,
                  type === '=' ? styles.edgeEqualText : styles.edgeCrossText,
                  isViolated && styles.edgeViolatedText,
                ]}>
                {type === '=' ? '=' : '×'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridWrapper: {
    alignSelf: 'center',
    marginVertical: 16,
  },
  board: {
    width: CELL_SIZE * 6,
    height: CELL_SIZE * 6,
    borderRadius: 14,
    overflow: 'visible',
    borderWidth: 2,
    borderColor: COLORS.boxBorder,
    backgroundColor: COLORS.card,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  cellGiven: {
    borderWidth: 0.5,
    borderColor: '#373752',
  },
  cellSelected: {
    borderColor: '#818CF8',
    borderWidth: 1.5,
  },
  cellConflict: {
    backgroundColor: '#381A22',
    borderColor: COLORS.conflict,
  },
  cellPressed: {
    opacity: 0.8,
  },
  symbolContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sunSymbol: {
    fontSize: 22,
  },
  moonSymbol: {
    fontSize: 21,
  },
  givenDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
  },
  givenDotEmpty: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
  },
  edgeBadge: {
    position: 'absolute',
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: '#16162A',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 4,
  },
  edgeEqual: {
    borderColor: '#6366F1',
  },
  edgeCross: {
    borderColor: '#EC4899',
  },
  edgeViolated: {
    borderColor: '#EF4444',
    backgroundColor: '#3B1219',
  },
  edgeText: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 14,
  },
  edgeEqualText: {
    color: '#A5B4FC',
  },
  edgeCrossText: {
    color: '#F472B6',
  },
  edgeViolatedText: {
    color: '#FCA5A5',
  },
});
