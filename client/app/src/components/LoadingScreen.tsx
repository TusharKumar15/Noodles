import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

interface LoadingScreenProps {
  targetUrl: string;
}

export function LoadingScreen({ targetUrl }: LoadingScreenProps) {
  return (
    <SafeAreaView style={styles.center}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ActivityIndicator size="large" color={COLORS.accent} />
      <Text style={styles.loadingText}>Connecting & generating puzzle…</Text>
      <Text style={styles.targetHostText}>Target: {targetUrl}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: COLORS.muted,
    marginTop: 16,
    fontSize: 15,
  },
  targetHostText: {
    color: '#475569',
    marginTop: 8,
    fontSize: 12,
  },
});
