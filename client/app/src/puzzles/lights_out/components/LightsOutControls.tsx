import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../theme/colors';

interface LightsOutControlsProps {
  litCount: number;
  totalLights: number;
  moveCount: number;
  minMoves?: number;
  rules?: string[];
  onReset: () => void;
  disabled?: boolean;
}

export function LightsOutControls({
  litCount,
  totalLights,
  moveCount,
  minMoves,
  rules,
  onReset,
  disabled = false,
}: LightsOutControlsProps) {
  const [showRules, setShowRules] = useState(false);

  return (
    <View style={styles.container}>
      {/* HUD Stats */}
      <View style={styles.hudRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeEmoji}>💡</Text>
          <Text style={styles.badgeText}>
            <Text style={styles.badgeHighlight}>{litCount}</Text>
            <Text style={styles.badgeSub}>/{totalLights} on</Text>
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeEmoji}>⚡</Text>
          <Text style={styles.badgeText}>
            <Text style={styles.badgeHighlight}>{moveCount}</Text>
            <Text style={styles.badgeSub}> moves</Text>
          </Text>
        </View>

        {minMoves !== undefined && minMoves > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🎯</Text>
            <Text style={styles.badgeText}>
              <Text style={styles.badgeSub}>Par </Text>
              <Text style={styles.badgeHighlight}>{minMoves}</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Pressable
          disabled={disabled || moveCount === 0}
          style={({ pressed }) => [
            styles.actionButton,
            (disabled || moveCount === 0) && styles.actionButtonDisabled,
            pressed && !disabled && moveCount > 0 && styles.actionButtonPressed,
          ]}
          onPress={onReset}>
          <Text style={styles.actionIcon}>↺</Text>
          <Text style={styles.actionText}>Restart</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.rulesButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={() => setShowRules(prev => !prev)}>
          <Text style={styles.actionIcon}>ℹ️</Text>
          <Text style={styles.actionText}>{showRules ? 'Hide Rules' : 'How to Play'}</Text>
        </Pressable>
      </View>

      {/* Rules Explainer Card */}
      {showRules && (
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Rules of Lights Out</Text>
          {rules && rules.length > 0 ? (
            rules.map((rule, idx) => (
              <View key={`rule-${idx}`} style={styles.ruleItem}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))
          ) : (
            <>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  Tap any light to toggle it and its 4 orthogonal neighbors (up, down, left, right).
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  Turn off all lights on the grid to solve the puzzle!
                </Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  hudRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2F2F4E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeText: {
    fontSize: 13,
    color: COLORS.text,
  },
  badgeHighlight: {
    fontWeight: '700',
    color: '#FBBF24',
  },
  badgeSub: {
    color: COLORS.muted,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E34',
    borderWidth: 1,
    borderColor: '#38385E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  rulesButton: {
    backgroundColor: '#192036',
    borderColor: '#34456E',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  actionIcon: {
    fontSize: 14,
    color: COLORS.text,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  rulesCard: {
    backgroundColor: '#151528',
    borderWidth: 1,
    borderColor: '#313155',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    marginTop: 4,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A5B4FC',
    marginBottom: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ruleBullet: {
    color: '#818CF8',
    marginRight: 6,
    fontSize: 13,
  },
  ruleText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.text,
  },
});
