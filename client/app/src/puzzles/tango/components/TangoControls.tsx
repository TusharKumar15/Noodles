import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { TangoSymbol } from '../types';

interface TangoControlsProps {
  onSymbolPress: (symbol: TangoSymbol) => void;
  selectedSymbol?: TangoSymbol;
  disabled?: boolean;
}

export function TangoControls({
  onSymbolPress,
  selectedSymbol,
  disabled = false,
}: TangoControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonsRow}>
        {/* Sun Button */}
        <Pressable
          disabled={disabled}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.sunBtn,
            selectedSymbol === 'S' && styles.actionBtnActiveSun,
            pressed && styles.btnPressed,
            disabled && styles.btnDisabled,
          ]}
          onPress={() => onSymbolPress('S')}>
          <Text style={styles.btnIcon}>☀️</Text>
          <Text style={styles.sunLabel}>Sun</Text>
        </Pressable>

        {/* Moon Button */}
        <Pressable
          disabled={disabled}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.moonBtn,
            selectedSymbol === 'M' && styles.actionBtnActiveMoon,
            pressed && styles.btnPressed,
            disabled && styles.btnDisabled,
          ]}
          onPress={() => onSymbolPress('M')}>
          <Text style={styles.btnIcon}>🌙</Text>
          <Text style={styles.moonLabel}>Moon</Text>
        </Pressable>

        {/* Clear Button */}
        <Pressable
          disabled={disabled}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.clearBtn,
            pressed && styles.clearBtnPressed,
            disabled && styles.btnDisabled,
          ]}
          onPress={() => onSymbolPress('')}>
          <Text style={styles.clearIcon}>⌫</Text>
          <Text style={styles.clearLabel}>Clear</Text>
        </Pressable>
      </View>

      <Text style={styles.hintText}>
        Tap cell to cycle (☀️ → 🌙 → clear) or use buttons
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    width: 84,
    height: 58,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  sunBtn: {
    borderColor: '#4A3B18',
  },
  moonBtn: {
    borderColor: '#1E2D4A',
  },
  actionBtnActiveSun: {
    borderColor: '#F59E0B',
    backgroundColor: '#2E2413',
  },
  actionBtnActiveMoon: {
    borderColor: '#60A5FA',
    backgroundColor: '#152438',
  },
  clearBtn: {
    backgroundColor: COLORS.eraseBg,
    borderColor: COLORS.eraseBorder,
  },
  clearBtnPressed: {
    backgroundColor: '#442842',
    borderColor: '#9E6385',
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  sunLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FCD34D',
    letterSpacing: 0.5,
  },
  moonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  clearIcon: {
    fontSize: 20,
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
  hintText: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
