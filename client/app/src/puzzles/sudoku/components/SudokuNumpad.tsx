import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { SUDOKU_6X6_CONFIG } from '../logic';

interface SudokuNumpadProps {
  onDigitPress: (digit: number) => void;
  disabled?: boolean;
}

export function SudokuNumpad({ onDigitPress, disabled = false }: SudokuNumpadProps) {
  const row1 = SUDOKU_6X6_CONFIG.DIGITS.slice(0, 3);
  const row2 = SUDOKU_6X6_CONFIG.DIGITS.slice(3, 6);

  return (
    <View style={styles.container}>
      <View style={styles.digitsPanel}>
        <View style={styles.row}>
          {row1.map(d => (
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
        </View>

        <View style={styles.row}>
          {row2.map(d => (
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
        </View>
      </View>

      {/* Clear button on the right */}
      <Pressable
        disabled={disabled}
        style={({ pressed }) => [
          styles.clearBtn,
          pressed && styles.clearBtnPressed,
          disabled && styles.btnDisabled,
        ]}
        onPress={() => onDigitPress(0)}>
        <Text style={styles.clearIcon}>⌫</Text>
        <Text style={styles.clearLabel}>Clear</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  digitsPanel: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  numBtn: {
    width: 54,
    height: 50,
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
  clearBtn: {
    width: 68,
    borderRadius: 12,
    backgroundColor: COLORS.eraseBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.eraseBorder,
  },
  clearBtnPressed: {
    backgroundColor: '#442842',
    borderColor: '#9E6385',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  numBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  clearIcon: {
    fontSize: 22,
    color: COLORS.text,
    marginBottom: 2,
  },
  clearLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
