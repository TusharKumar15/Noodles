import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getPuzzleDefinition } from '../puzzles/registry';
import { COLORS } from '../theme/colors';
import { PuzzleData } from '../types/puzzle';

interface PuzzleRendererProps {
  puzzleData: PuzzleData;
  onSolve: (solution: any) => void;
  disabled?: boolean;
}

export function PuzzleRenderer({ puzzleData, onSolve, disabled }: PuzzleRendererProps) {
  const definition = getPuzzleDefinition(puzzleData.puzzleType);

  if (!definition) {
    return (
      <View style={styles.unknownContainer}>
        <Text style={styles.unknownEmoji}>🧩</Text>
        <Text style={styles.unknownTitle}>Unsupported Puzzle</Text>
        <Text style={styles.unknownText}>
          No renderer found for puzzle type: &quot;{puzzleData.puzzleType}&quot;
        </Text>
      </View>
    );
  }

  const Component = definition.component;

  return (
    <Component
      puzzleId={puzzleData.puzzleId}
      puzzle={puzzleData.puzzle}
      onSolve={onSolve}
      disabled={disabled}
    />
  );
}

const styles = StyleSheet.create({
  unknownContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  unknownEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  unknownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  unknownText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
});
