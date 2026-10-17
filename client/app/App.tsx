/**
 * Noodles – Multi-Puzzle Mobile Client (Expo MVP)
 *
 * Flow:
 *  1. On mount: fetch puzzle from GET /puzzle/new
 *  2. Render puzzle through dynamic PuzzleRenderer based on puzzleType
 *  3. Puzzle component handles its own interactions & local win-check
 *  4. On win: show feedback overlay + auto-submit to POST /puzzle/{id}/submit
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ErrorScreen } from './src/components/ErrorScreen';
import { Header } from './src/components/Header';
import { LoadingScreen } from './src/components/LoadingScreen';
import { PuzzleRenderer } from './src/components/PuzzleRenderer';
import { WinOverlay } from './src/components/WinOverlay';
import { DEFAULT_API_BASE } from './src/config/api';
import { getPuzzleDefinition } from './src/puzzles/registry';
import { fetchNewPuzzle, submitPuzzleSolution } from './src/services/api';
import { COLORS } from './src/theme/colors';
import { PuzzleData } from './src/types/puzzle';

function GameScreen(): React.JSX.Element {
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE);
  const [loading, setLoading] = useState(true);
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [won, setWon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Win animation
  const winAnim = useRef(new Animated.Value(0)).current;

  // ---------------------------------------------------------------------------
  // Network
  // ---------------------------------------------------------------------------

  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    setWon(false);
    setServerMsg(null);
    setErrorMsg(null);
    winAnim.setValue(0);

    try {
      const data = await fetchNewPuzzle(apiBase);
      setPuzzleData(data);
    } catch (e: any) {
      setErrorMsg(
        `Failed to connect to ${apiBase}.\nMake sure the server is running and your phone is on the same Wi-Fi.`,
      );
    } finally {
      setLoading(false);
    }
  }, [apiBase, winAnim]);

  useEffect(() => {
    loadPuzzle();
  }, [loadPuzzle]);

  const handleSolve = useCallback(
    async (solution: any) => {
      if (!puzzleData || won) return;

      setWon(true);

      // Spring win animation
      Animated.spring(winAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 5,
      }).start();

      // Background auto-submit
      setSubmitting(true);
      try {
        const res = await submitPuzzleSolution(apiBase, puzzleData.puzzleId, solution);
        setServerMsg(res.message);
      } catch (e) {
        setServerMsg('Solution solved locally, but could not reach server.');
      } finally {
        setSubmitting(false);
      }
    },
    [puzzleData, won, winAnim, apiBase],
  );

  // ---------------------------------------------------------------------------
  // Render States
  // ---------------------------------------------------------------------------

  if (loading) {
    return <LoadingScreen targetUrl={apiBase} />;
  }

  if (errorMsg || !puzzleData) {
    return (
      <ErrorScreen
        errorMessage={errorMsg || 'Could not load puzzle'}
        apiBase={apiBase}
        onApiBaseChange={setApiBase}
        onRetry={loadPuzzle}
      />
    );
  }

  const activeDefinition = getPuzzleDefinition(puzzleData.puzzleType);
  const subtitle = activeDefinition?.displayName || 'Logic Puzzle';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <Header subtitle={subtitle} />

      <PuzzleRenderer
        puzzleData={puzzleData}
        onSolve={handleSolve}
        disabled={won}
      />

      {won && (
        <WinOverlay
          animValue={winAnim}
          submitting={submitting}
          serverMsg={serverMsg}
          onNext={loadPuzzle}
        />
      )}
    </SafeAreaView>
  );
}

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <GameScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
});
