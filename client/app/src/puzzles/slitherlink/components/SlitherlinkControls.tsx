import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import { SlitherlinkToolMode } from '../types';

interface SlitherlinkControlsProps {
  linesCount: number;
  hasConflict: boolean;
  toolMode: SlitherlinkToolMode;
  onToolModeChange: (mode: SlitherlinkToolMode) => void;
  onReset: () => void;
  disabled?: boolean;
}

export function SlitherlinkControls({
  linesCount,
  hasConflict,
  toolMode,
  onToolModeChange,
  onReset,
  disabled = false,
}: SlitherlinkControlsProps) {
  const [showRules, setShowRules] = useState(false);

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View
          style={[
            styles.statusPill,
            hasConflict && styles.statusPillConflict,
            linesCount >= 4 && !hasConflict && styles.statusPillActive,
          ]}>
          <Text style={styles.statusText}>
            ➰ {linesCount} {linesCount === 1 ? 'Segment' : 'Segments'}
          </Text>
        </View>

        {hasConflict && (
          <View style={styles.conflictBadge}>
            <Text style={styles.conflictText}>⚠️ Rule Conflict</Text>
          </View>
        )}

        <Pressable
          style={styles.rulesToggle}
          onPress={() => setShowRules(prev => !prev)}>
          <Text style={styles.rulesToggleText}>
            {showRules ? 'Hide Rules ▲' : 'Rules ℹ️'}
          </Text>
        </Pressable>
      </View>

      {/* Rules Explainer */}
      {showRules && (
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Loops (Slitherlink) Rules</Text>
          <Text style={styles.ruleItem}>
            • Connect adjacent dots to form <Text style={styles.boldText}>one single continuous closed loop</Text>.
          </Text>
          <Text style={styles.ruleItem}>
            • <Text style={styles.boldText}>No branches, crossings, or loose ends</Text> (each dot touches 0 or 2 lines).
          </Text>
          <Text style={styles.ruleItem}>
            • Numbers show <Text style={styles.boldText}>exactly how many edges</Text> border that cell (0, 1, 2, or 3).
          </Text>
          <Text style={styles.ruleItem}>
            • Blank cells can have any number of edges.
          </Text>
          <Text style={styles.ruleTip}>
            💡 Tip: Tap an edge to cycle: Line ➜ ✕ (not a line) ➜ Clear. Or pick a mode below.
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
              toolMode === 'line' && styles.toolButtonActive,
            ]}
            onPress={() => onToolModeChange('line')}>
            <Text style={styles.toolEmoji}>➖</Text>
            <Text
              style={[
                styles.toolLabel,
                toolMode === 'line' && styles.toolLabelActive,
              ]}>
              Line
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
            disabled && styles.btnDisabled,
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
    marginTop: 6,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#1E1E38',
    borderWidth: 1,
    borderColor: '#37375A',
  },
  statusPillConflict: {
    backgroundColor: '#3F121C',
    borderColor: '#EF4444',
  },
  statusPillActive: {
    backgroundColor: '#1E234A',
    borderColor: '#4F46E5',
  },
  statusText: {
    color: '#E2E8F0',
    fontSize: 13,
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
    paddingVertical: 5,
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
    marginBottom: 10,
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
  boldText: {
    fontWeight: '700',
    color: '#FFFFFF',
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
    marginTop: 2,
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
    paddingVertical: 7,
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
    fontSize: 13,
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
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3E3E64',
  },
  resetButtonPressed: {
    opacity: 0.7,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
});
