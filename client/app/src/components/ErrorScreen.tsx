import React from 'react';
import { Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

interface ErrorScreenProps {
  errorMessage: string;
  apiBase: string;
  onApiBaseChange: (text: string) => void;
  onRetry: () => void;
}

export function ErrorScreen({
  errorMessage,
  apiBase,
  onApiBaseChange,
  onRetry,
}: ErrorScreenProps) {
  return (
    <SafeAreaView style={styles.center}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <Text style={styles.errorEmoji}>⚠️</Text>
      <Text style={styles.errorTitle}>Connection Error</Text>
      <Text style={styles.errorDesc}>{errorMessage}</Text>

      <View style={styles.ipContainer}>
        <Text style={styles.ipLabel}>Backend URL:</Text>
        <TextInput
          style={styles.ipInput}
          value={apiBase}
          onChangeText={onApiBaseChange}
          placeholder="http://192.168.x.x:8000"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="none"
        />
      </View>

      <Pressable style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryBtnText}>Retry Connection</Text>
      </Pressable>
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
  errorEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  errorDesc: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ipContainer: {
    width: '100%',
    marginBottom: 16,
  },
  ipLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  ipInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  retryBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryBtnText: {
    color: COLORS.bg,
    fontWeight: '700',
  },
});
