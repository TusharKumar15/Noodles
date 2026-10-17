import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/colors';

interface HeaderProps {
  subtitle?: string;
}

export function Header({ subtitle = 'Logic Puzzles' }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>🍜 Noodles</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
