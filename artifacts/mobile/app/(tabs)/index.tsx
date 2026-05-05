import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CircuitLines } from "@/components/CircuitLines";
import { Grid } from "@/components/Grid";
import { TimerBar } from "@/components/TimerBar";
import { useGame } from "@/contexts/GameContext";

const { width: SW } = Dimensions.get("window");

function DPad() {
  const { movePlayer } = useGame();
  const sz = 52;
  return (
    <View style={dpadStyles.container}>
      <TouchableOpacity
        style={[dpadStyles.btn, { width: sz, height: sz }]}
        onPress={() => movePlayer("up")}
        activeOpacity={0.7}
      >
        <Feather name="chevron-up" size={24} color="#00C4FF" />
      </TouchableOpacity>
      <View style={dpadStyles.row}>
        <TouchableOpacity
          style={[dpadStyles.btn, { width: sz, height: sz }]}
          onPress={() => movePlayer("left")}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={24} color="#00C4FF" />
        </TouchableOpacity>
        <View style={{ width: sz, height: sz }} />
        <TouchableOpacity
          style={[dpadStyles.btn, { width: sz, height: sz }]}
          onPress={() => movePlayer("right")}
          activeOpacity={0.7}
        >
          <Feather name="chevron-right" size={24} color="#00C4FF" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[dpadStyles.btn, { width: sz, height: sz }]}
        onPress={() => movePlayer("down")}
        activeOpacity={0.7}
      >
        <Feather name="chevron-down" size={24} color="#00C4FF" />
      </TouchableOpacity>
    </View>
  );
}

function ColorTitle() {
  return (
    <View style={headerStyles.titleWrap}>
      <View style={headerStyles.titleRow}>
        <Text style={[headerStyles.titleChar, { color: "#FF6B35" }]}>T</Text>
        <Text style={[headerStyles.titleChar, { color: "#FFD700" }]}>I</Text>
        <Text style={[headerStyles.titleChar, { color: "#00C4FF" }]}>L</Text>
        <Text style={[headerStyles.titleChar, { color: "#00FFB3" }]}>T</Text>
      </View>
      <Text style={headerStyles.subtitle}>THE MAZE PUZZLE</Text>
    </View>
  );
}

function IdleOverlay() {
  const { startGame, highScore } = useGame();
  return (
    <View style={overlayStyles.container}>
      <View style={overlayStyles.box}>
        <View style={overlayStyles.titleRow}>
          <Text style={[overlayStyles.titleChar, { color: "#FF6B35" }]}>T</Text>
          <Text style={[overlayStyles.titleChar, { color: "#FFD700" }]}>I</Text>
          <Text style={[overlayStyles.titleChar, { color: "#00C4FF" }]}>L</Text>
          <Text style={[overlayStyles.titleChar, { color: "#00FFB3" }]}>T</Text>
        </View>
        <Text style={overlayStyles.subtitleBig}>THE MAZE PUZZLE</Text>
        <Text style={overlayStyles.desc}>
          Reach the glowing cell before time runs out
        </Text>
        {highScore > 0 && (
          <View style={overlayStyles.highScoreBox}>
            <Text style={overlayStyles.highScoreLabel}>BEST</Text>
            <Text style={overlayStyles.highScoreValue}>{highScore}</Text>
          </View>
        )}
        <View style={overlayStyles.hint}>
          <Text style={overlayStyles.hintText}>
            {Platform.OS === "web"
              ? "Use the arrows to move"
              : "Tilt your device to move"}
          </Text>
        </View>
        <Pressable style={overlayStyles.btn} onPress={startGame}>
          <Text style={overlayStyles.btnText}>START GAME</Text>
        </Pressable>
      </View>
    </View>
  );
}

function GameOverOverlay() {
  const { score, restartGame, highScore, isNewBest } = useGame();
  return (
    <View style={overlayStyles.container}>
      <View style={overlayStyles.box}>
        <Text style={overlayStyles.gameOverLabel}>TIME UP</Text>
        {isNewBest && (
          <Text style={overlayStyles.newBestLabel}>NEW BEST!</Text>
        )}
        <Text style={overlayStyles.finalScore}>{score}</Text>
        <Text style={overlayStyles.finalScoreLabel}>
          {score === 1 ? "cell reached" : "cells reached"}
        </Text>
        {highScore > 0 && (
          <Text style={overlayStyles.bestScoreText}>BEST: {highScore}</Text>
        )}
        <Pressable style={overlayStyles.btn} onPress={restartGame}>
          <Text style={overlayStyles.btnText}>PLAY AGAIN</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const {
    phase,
    playerIndex,
    targetIndex,
    score,
    round,
    timeLeft,
    maxTime,
    flashIndex,
    restartGame,
  } = useGame();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: botPad }]}>
      <CircuitLines />

      {/* Header */}
      <View style={headerStyles.header}>
        <View style={headerStyles.statBox}>
          <Text style={headerStyles.statLabel}>LEVEL</Text>
          <Text style={headerStyles.statValue}>{round + 1}</Text>
        </View>
        <ColorTitle />
        <View style={headerStyles.statBox}>
          <Text style={headerStyles.statLabel}>SCORE</Text>
          <Text style={headerStyles.statValue}>{score}</Text>
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <TimerBar timeLeft={timeLeft} maxTime={maxTime} />
      </View>

      {/* Grid area */}
      <View style={styles.gridArea}>
        <Grid playerIndex={playerIndex} targetIndex={targetIndex} flashIndex={flashIndex} />
      </View>

      {/* Instruction text */}
      {phase === "playing" && (
        <View style={styles.instrRow}>
          <Feather name="smartphone" size={14} color="#1A5F8A" />
          <Text style={styles.instrText}>
            {Platform.OS === "web"
              ? "USE ARROWS TO GUIDE THE DOT"
              : "TILT THE PHONE TO GUIDE THE DOT"}
          </Text>
          <Feather name="smartphone" size={14} color="#1A5F8A" />
        </View>
      )}

      {/* Web D-Pad or Restart row */}
      {phase === "playing" && (
        <View style={styles.bottomRow}>
          {Platform.OS === "web" && <DPad />}
          {Platform.OS !== "web" && (
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={restartGame}
                activeOpacity={0.7}
              >
                <Text style={styles.controlBtnText}>RESTART LEVEL</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Overlays */}
      {phase === "idle" && <IdleOverlay />}
      {phase === "gameover" && <GameOverOverlay />}
    </View>
  );
}

const BG = "#0B1622";
const OVERLAY_BG = "rgba(8,18,28,0.94)";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
  },
  timerContainer: {
    width: "100%",
    marginBottom: 16,
  },
  gridArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  instrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  instrText: {
    color: "#1A5F8A",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  bottomRow: {
    marginBottom: 8,
    alignItems: "center",
  },
  controlsRow: {
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
  },
  controlBtn: {
    borderWidth: 1,
    borderColor: "#1A3A5C",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  controlBtnText: {
    color: "#3A7AB5",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
});

const headerStyles = StyleSheet.create({
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statBox: {
    alignItems: "center",
    minWidth: 72,
  },
  statLabel: {
    color: "#3A7AB5",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  statValue: {
    color: "#FFD700",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
  titleWrap: {
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    gap: 4,
  },
  titleChar: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: 6,
  },
  subtitle: {
    color: "#3A7AB5",
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    letterSpacing: 4,
    marginTop: 2,
  },
});

const overlayStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OVERLAY_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    alignItems: "center",
    paddingHorizontal: 32,
    maxWidth: 320,
  },
  titleRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  titleChar: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    letterSpacing: 8,
  },
  subtitleBig: {
    color: "#3A7AB5",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 5,
    marginBottom: 20,
  },
  desc: {
    color: "#5A8AB5",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  hint: {
    borderWidth: 1,
    borderColor: "#1A3A5C",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  hintText: {
    color: "#3A7AB5",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.5,
  },
  btn: {
    backgroundColor: "#00FFB3",
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 48,
    shadowColor: "#00FFB3",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  btnText: {
    color: "#0B1622",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },
  gameOverLabel: {
    color: "#FF3B30",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: 6,
    marginBottom: 16,
  },
  finalScore: {
    color: "#FFD700",
    fontSize: 72,
    fontFamily: "Inter_700Bold",
    lineHeight: 80,
  },
  finalScoreLabel: {
    color: "#3A7AB5",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  newBestLabel: {
    color: "#00FFB3",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 4,
    marginBottom: 4,
    textShadowColor: "#00FFB3",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  bestScoreText: {
    color: "#5A8AB5",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    marginBottom: 24,
  },
  highScoreBox: {
    alignItems: "center",
    marginBottom: 16,
  },
  highScoreLabel: {
    color: "#3A7AB5",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  highScoreValue: {
    color: "#FFD700",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
});

const dpadStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  btn: {
    backgroundColor: "#0A1929",
    borderWidth: 1,
    borderColor: "#1A3A5C",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
