import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { SUDOKU_6X6_CONFIG } from '../logic';

interface SudokuNumpadProps {
  onDigitPress: (digit: number) => void;
  disabled?: boolean;
}

export function SudokuNumpad({ onDigitPress, disabled = false }: SudokuNumpadProps) {
  return (
    <View style={styles.numpad}>
      {SUDOKU_6X6_CONFIG.DIGITS.map(d => (
        <Pressable
          key={d}
          disabled={disabled}
          style={({ pressed }) => [
            styles.numBtn,
            pressed && styles.numBtnPressed,
            disabled && styles.btnDisabled,
          ]}
          onPress={() => onDigitPress(d)}>
          <Text style={styles.numBtnText}>{d}</Text>
        </Pressable>
      ))}

      {/* Erase button */}
      <Pressable
        disabled={disabled}
        style={({ pressed }) => [
          styles.numBtn,
          styles.eraseBtn,
          pressed && styles.numBtnPressed,
          disabled && styles.btnDisabled,
        ]}
        onPress={() => onDigitPress(0)}>
        <Text style={styles.numBtnText}>⌫</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  numBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  numBtnPressed: {
    backgroundColor: COLORS.selected,
  },
  eraseBtn: {
    backgroundColor: COLORS.eraseBg,
    borderColor: COLORS.eraseBorder,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  numBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
});
