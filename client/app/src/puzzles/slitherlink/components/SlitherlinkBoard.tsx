import React from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import {
  getCellStatus,
  getVertexDegree,
} from '../logic';
import {
  EdgeCoordinate,
  HorizontalEdges,
  SlitherlinkPuzzleData,
  VerticalEdges,
} from '../types';

interface SlitherlinkBoardProps {
  puzzle: SlitherlinkPuzzleData;
  horizontal: HorizontalEdges;
  vertical: VerticalEdges;
  onEdgePress: (edge: EdgeCoordinate) => void;
  disabled?: boolean;
}

export function SlitherlinkBoard({
  puzzle,
  horizontal,
  vertical,
  onEdgePress,
  disabled = false,
}: SlitherlinkBoardProps) {
  const rows = puzzle.rows || puzzle.size || 5;
  const cols = puzzle.cols || puzzle.size || 5;
  const clues = puzzle.clues;

  const screenWidth = Dimensions.get('window').width;
  const maxBoardWidth = Math.min(screenWidth - 32, 380);
  const cellSize = Math.floor((maxBoardWidth - 32) / cols);

  const pad = 16;
  const boardWidth = cols * cellSize + pad * 2;
  const boardHeight = rows * cellSize + pad * 2;

  const hitTargetSize = 34; // Generous tap target size

  return (
    <View style={styles.boardWrapper}>
      <View
        style={[
          styles.board,
          {
            width: boardWidth,
            height: boardHeight,
          },
        ]}>
        {/* Cells and Clue numbers */}
        {clues.map((row, r) =>
          row.map((clue, c) => {
            const status = getCellStatus(horizontal, vertical, clue, r, c);
            const cellLeft = pad + c * cellSize;
            const cellTop = pad + r * cellSize;

            return (
              <View
                key={`cell-${r}-${c}`}
                style={[
                  styles.cell,
                  {
                    left: cellLeft,
                    top: cellTop,
                    width: cellSize,
                    height: cellSize,
                  },
                  status === 'over' && styles.cellOver,
                  status === 'satisfied' && styles.cellSatisfied,
                ]}>
                {clue !== null && clue !== undefined && (
                  <Text
                    style={[
                      styles.clueText,
                      { fontSize: Math.max(18, Math.floor(cellSize * 0.42)) },
                      status === 'over' && styles.clueTextOver,
                      status === 'satisfied' && styles.clueTextSatisfied,
                    ]}>
                    {clue}
                  </Text>
                )}
              </View>
            );
          }),
        )}

        {/* Horizontal Edges */}
        {horizontal.map((row, r) =>
          row.map((val, c) => {
            const left = pad + c * cellSize + 5;
            const top = pad + r * cellSize - hitTargetSize / 2;
            const width = cellSize - 10;

            return (
              <Pressable
                key={`h-edge-${r}-${c}`}
                disabled={disabled}
                onPress={() => onEdgePress({ type: 'H', r, c })}
                style={({ pressed }) => [
                  styles.hHitbox,
                  {
                    left,
                    top,
                    width,
                    height: hitTargetSize,
                  },
                  pressed && styles.edgePressed,
                ]}>
                {val === 1 ? (
                  <View style={[styles.activeHLine, { width }]} />
                ) : val === -1 ? (
                  <Text style={styles.crossText}>✕</Text>
                ) : (
                  <View style={[styles.guideHLine, { width }]} />
                )}
              </Pressable>
            );
          }),
        )}

        {/* Vertical Edges */}
        {vertical.map((row, r) =>
          row.map((val, c) => {
            const left = pad + c * cellSize - hitTargetSize / 2;
            const top = pad + r * cellSize + 5;
            const height = cellSize - 10;

            return (
              <Pressable
                key={`v-edge-${r}-${c}`}
                disabled={disabled}
                onPress={() => onEdgePress({ type: 'V', r, c })}
                style={({ pressed }) => [
                  styles.vHitbox,
                  {
                    left,
                    top,
                    width: hitTargetSize,
                    height,
                  },
                  pressed && styles.edgePressed,
                ]}>
                {val === 1 ? (
                  <View style={[styles.activeVLine, { height }]} />
                ) : val === -1 ? (
                  <Text style={styles.crossText}>✕</Text>
                ) : (
                  <View style={[styles.guideVLine, { height }]} />
                )}
              </Pressable>
            );
          }),
        )}

        {/* Dots (Vertices) */}
        {Array.from({ length: rows + 1 }).map((_, vr) =>
          Array.from({ length: cols + 1 }).map((__, vc) => {
            const deg = getVertexDegree(horizontal, vertical, vr, vc, rows, cols);
            const isConnected = deg === 2;
            const hasError = deg > 2;
            const left = pad + vc * cellSize - 4.5;
            const top = pad + vr * cellSize - 4.5;

            return (
              <View
                key={`dot-${vr}-${vc}`}
                pointerEvents="none"
                style={[
                  styles.dot,
                  { left, top },
                  isConnected && styles.dotConnected,
                  hasError && styles.dotError,
                ]}
              />
            );
          }),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  board: {
    backgroundColor: '#151525',
    borderRadius: 18,
    position: 'relative',
    overflow: 'visible',
    borderWidth: 1.5,
    borderColor: '#2D2D4E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  cell: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 30, 50, 0.45)',
    borderRadius: 8,
  },
  cellOver: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  cellSatisfied: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  clueText: {
    color: '#E2E8F0',
    fontWeight: '800',
    textAlign: 'center',
  },
  clueTextOver: {
    color: '#EF4444',
  },
  clueTextSatisfied: {
    color: '#34D399',
  },
  hHitbox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  vHitbox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  edgePressed: {
    opacity: 0.65,
  },
  activeHLine: {
    height: 4.5,
    backgroundColor: '#818CF8',
    borderRadius: 3,
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 4,
  },
  activeVLine: {
    width: 4.5,
    backgroundColor: '#818CF8',
    borderRadius: 3,
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 4,
  },
  guideHLine: {
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 1,
  },
  guideVLine: {
    width: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 1,
  },
  crossText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  dot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#64748B',
    zIndex: 20,
    borderWidth: 1,
    borderColor: '#1E1E34',
  },
  dotConnected: {
    backgroundColor: '#C7D2FE',
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },
  dotError: {
    backgroundColor: '#EF4444',
  },
});
