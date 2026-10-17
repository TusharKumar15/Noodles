import React from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../theme/colors';

interface WinOverlayProps {
  animValue: Animated.Value;
  submitting: boolean;
  serverMsg: string | null;
  onNext: () => void;
}

export function WinOverlay({ animValue, submitting, serverMsg, onNext }: WinOverlayProps) {
  return (
    <Animated.View
      style={[
        styles.winOverlay,
        {
          opacity: animValue,
          transform: [
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
          ],
        },
      ]}>
      <Text style={styles.winEmoji}>🎉</Text>
      <Text style={styles.winTitle}>Puzzle Solved!</Text>
      {submitting && (
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: 8 }} />
      )}
      {serverMsg && <Text style={styles.winMsg}>{serverMsg}</Text>}
      <Pressable style={styles.newPuzzleBtn} onPress={onNext}>
        <Text style={styles.newPuzzleBtnText}>Next Puzzle →</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  winOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.boxBorder,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  winEmoji: {
    fontSize: 44,
  },
  winTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 6,
  },
  winMsg: {
    fontSize: 14,
    color: COLORS.accent,
    marginTop: 8,
    textAlign: 'center',
  },
  newPuzzleBtn: {
    marginTop: 16,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  newPuzzleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.bg,
  },
});
