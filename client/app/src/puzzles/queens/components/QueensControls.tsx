import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import { QueensToolMode } from '../types';

interface QueensControlsProps {
  placedQueens: number;
  totalQueens: number;
  hasConflict: boolean;
  toolMode: QueensToolMode;
  onToolModeChange: (mode: QueensToolMode) => void;
  onReset: () => void;
  rules?: string[];
  disabled?: boolean;
}

export function QueensControls({
  placedQueens,
  totalQueens,
  hasConflict,
  toolMode,
  onToolModeChange,
  onReset,
  rules,
  disabled = false,
}: QueensControlsProps) {
  const [showRules, setShowRules] = useState(false);

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View
          style={[
            styles.statusPill,
            hasConflict && styles.statusPillConflict,
            placedQueens === totalQueens && !hasConflict && styles.statusPillComplete,
          ]}>
          <Text style={styles.statusText}>
            👑 {placedQueens} / {totalQueens} Queens
          </Text>
        </View>

        {hasConflict && (
          <View style={styles.conflictBadge}>
            <Text style={styles.conflictText}>⚠️ Overlap</Text>
          </View>
        )}

        <Pressable
          style={styles.rulesToggle}
          onPress={() => setShowRules(prev => !prev)}>
          <Text style={styles.rulesToggleText}>{showRules ? 'Hide Rules ▲' : 'Rules ℹ️'}</Text>
        </Pressable>
      </View>

      {/* Rules Explainer */}
      {showRules && (
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Queens Rules</Text>
          <Text style={styles.ruleItem}>• Exactly 1 👑 in each row and column.</Text>
          <Text style={styles.ruleItem}>• Exactly 1 👑 in each colored region.</Text>
          <Text style={styles.ruleItem}>• Queens cannot touch each other (not even diagonally).</Text>
          <Text style={styles.ruleTip}>
            💡 Tip: Tap a cell to cycle: ✕ (empty) ➜ 👑 (queen) ➜ clear.
          </Text>
        </View>
      )}

      {/* Mode Selector & Reset */}
      <View style={styles.actionRow}>
        <View style={styles.toolGroup}>
          <Pressable
            disabled={disabled}
            style={[
              styles.toolButton,
              toolMode === 'cycle' && styles.toolButtonActive,
            ]}
            onPress={() => onToolModeChange('cycle')}>
            <Text style={styles.toolEmoji}>🔄</Text>
            <Text
              style={[
                styles.toolLabel,
                toolMode === 'cycle' && styles.toolLabelActive,
              ]}>
              Cycle
            </Text>
          </Pressable>

          <Pressable
            disabled={disabled}
            style={[
              styles.toolButton,
              toolMode === 'queen' && styles.toolButtonActive,
            ]}
            onPress={() => onToolModeChange('queen')}>
            <Text style={styles.toolEmoji}>👑</Text>
            <Text
              style={[
                styles.toolLabel,
                toolMode === 'queen' && styles.toolLabelActive,
              ]}>
              Queen
            </Text>
          </Pressable>

          <Pressable
            disabled={disabled}
            style={[
              styles.toolButton,
              toolMode === 'cross' && styles.toolButtonActive,
            ]}
            onPress={() => onToolModeChange('cross')}>
            <Text style={styles.toolEmoji}>✕</Text>
            <Text
              style={[
                styles.toolLabel,
                toolMode === 'cross' && styles.toolLabelActive,
              ]}>
              Cross
            </Text>
          </Pressable>
        </View>

        <Pressable
          disabled={disabled}
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.resetButtonPressed,
          ]}
          onPress={onReset}>
          <Text style={styles.resetButtonText}>↺ Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1E1E38',
    borderWidth: 1,
    borderColor: '#37375A',
  },
  statusPillConflict: {
    backgroundColor: '#3F121C',
    borderColor: '#EF4444',
  },
  statusPillComplete: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  statusText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
  },
  conflictBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#EF4444',
  },
  conflictText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rulesToggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rulesToggleText: {
    color: '#818CF8',
    fontSize: 13,
    fontWeight: '600',
  },
  rulesCard: {
    backgroundColor: '#1E1E34',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#312E81',
  },
  rulesTitle: {
    color: '#FCD34D',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  ruleItem: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  ruleTip: {
    color: '#94A3B8',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  toolGroup: {
    flexDirection: 'row',
    backgroundColor: '#16162A',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#2D2D4E',
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    gap: 4,
  },
  toolButtonActive: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  toolEmoji: {
    fontSize: 14,
  },
  toolLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  toolLabelActive: {
    color: '#FFFFFF',
  },
  resetButton: {
    backgroundColor: '#27273F',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3E3E64',
  },
  resetButtonPressed: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
});
