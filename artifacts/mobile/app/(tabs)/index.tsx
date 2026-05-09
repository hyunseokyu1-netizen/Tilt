import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { RankingEntry } from "@/contexts/GameContext";
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

function LeaderboardOverlay({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("rankings")
        .select("player_name, score")
        .order("score", { ascending: false })
        .limit(10);
      setEntries((data ?? []).map((e, i) => ({ ...e, rank: i + 1 })));
      setLoading(false);
    })();
  }, []);

  return (
    <View style={overlayStyles.container}>
      <View style={overlayStyles.leaderboardPanel}>
        <View style={overlayStyles.panelHeader}>
          <Text style={overlayStyles.panelTitle}>LEADERBOARD</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Feather name="x" size={22} color="#3A7AB5" />
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3A7AB5" style={{ marginTop: 32 }} />
        ) : entries.length === 0 ? (
          <Text style={overlayStyles.emptyText}>아직 기록이 없습니다</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ width: "100%" }}>
            {entries.map((entry) => (
              <LeaderboardRow
                key={entry.rank}
                rank={entry.rank}
                name={entry.player_name}
                score={entry.score}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function IdleOverlay() {
  const { startGame, highScore, ttsEnabled, setTtsEnabled } = useGame();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (showLeaderboard) {
    return <LeaderboardOverlay onClose={() => setShowLeaderboard(false)} />;
  }
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
        <View style={overlayStyles.coordHintRow}>
          <Text style={overlayStyles.coordHintText}>Grid: A1–C3  ·  Audio guided</Text>
        </View>
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
        <Pressable
          style={overlayStyles.btnSecondary}
          onPress={() => setShowLeaderboard(true)}
        >
          <Feather name="list" size={14} color="#3A7AB5" />
          <Text style={overlayStyles.btnSecondaryText}>LEADERBOARD</Text>
        </Pressable>

        {/* TTS toggle */}
        <View style={overlayStyles.ttsRow}>
          <Feather
            name="volume-2"
            size={14}
            color={ttsEnabled ? "#00FFB3" : "#3A7AB5"}
          />
          <Text style={overlayStyles.ttsLabel}>위치 음성 안내</Text>
          <Switch
            value={ttsEnabled}
            onValueChange={setTtsEnabled}
            trackColor={{ false: "#1A3A5C", true: "rgba(0,255,179,0.35)" }}
            thumbColor={ttsEnabled ? "#00FFB3" : "#3A7AB5"}
          />
        </View>
      </View>
    </View>
  );
}

function LeaderboardRow({
  rank,
  name,
  score,
  highlight,
}: {
  rank: number;
  name: string;
  score: number;
  highlight?: boolean;
}) {
  return (
    <View style={[lbStyles.row, highlight && lbStyles.rowHighlight]}>
      <Text style={[lbStyles.rank, highlight && lbStyles.textHighlight]}>
        #{rank}
      </Text>
      <Text
        style={[lbStyles.name, highlight && lbStyles.textHighlight]}
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text style={[lbStyles.score, highlight && lbStyles.scoreHighlight]}>
        {score}
      </Text>
    </View>
  );
}

function GameOverOverlay() {
  const {
    score,
    restartGame,
    goToMenu,
    isNewBest,
    rankInfo,
    topRankings,
    nearbyRankings,
    isSubmittingRank,
    submitScore,
  } = useGame();
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await submitScore(trimmed);
    setSubmittedName(trimmed);
    setSubmitted(true);
  };

  const userInTop5 =
    submitted &&
    rankInfo &&
    rankInfo.rank <= 5 &&
    topRankings.some(
      (r) => r.player_name === submittedName && r.score === score
    );

  return (
    <View style={overlayStyles.container}>
      <ScrollView
        contentContainerStyle={overlayStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={overlayStyles.gameOverLabel}>TIME UP</Text>
        {isNewBest && <Text style={overlayStyles.newBestLabel}>NEW BEST!</Text>}
        <View style={overlayStyles.scoreRow}>
          <Text style={overlayStyles.finalScore}>{score}</Text>
          <Text style={overlayStyles.finalScoreUnit}>
            {score === 1 ? "cell" : "cells"}
          </Text>
        </View>

        {/* Name input — shown before submission if qualifies */}
        {rankInfo?.qualifies && !submitted && (
          <View style={overlayStyles.inputBox}>
            <Text style={overlayStyles.rankText}>
              GLOBAL RANK #{rankInfo.rank}
            </Text>
            <Text style={overlayStyles.inputLabel}>이름을 입력하세요</Text>
            <TextInput
              style={overlayStyles.nameInput}
              placeholder="Your name"
              placeholderTextColor="#3A7AB5"
              value={name}
              onChangeText={setName}
              maxLength={20}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <Pressable
              style={[
                overlayStyles.submitBtn,
                (!name.trim() || isSubmittingRank) &&
                  overlayStyles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!name.trim() || isSubmittingRank}
            >
              {isSubmittingRank ? (
                <ActivityIndicator size="small" color="#0B1622" />
              ) : (
                <Text style={overlayStyles.submitBtnText}>SAVE SCORE</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Leaderboard */}
        {topRankings.length > 0 && (
          <View style={lbStyles.container}>
            <Text style={lbStyles.title}>LEADERBOARD</Text>

            {/* Top 1-5 */}
            {topRankings.map((entry) => {
              const isMe =
                submitted &&
                entry.player_name === submittedName &&
                entry.score === score;
              return (
                <LeaderboardRow
                  key={entry.rank}
                  rank={entry.rank}
                  name={isMe ? `${entry.player_name} ★` : entry.player_name}
                  score={entry.score}
                  highlight={isMe}
                />
              );
            })}

            {/* Nearby window (rank-3 ~ rank+3), deduped from top 5 */}
            {(() => {
              const filtered = nearbyRankings.filter(
                (e) => e.rank > topRankings.length
              );
              if (filtered.length === 0) return null;

              const firstNearbyRank = filtered[0].rank;
              const showDots = firstNearbyRank > topRankings.length + 1;

              return (
                <>
                  {showDots && (
                    <Text style={lbStyles.ellipsis}>· · ·</Text>
                  )}
                  {filtered.map((entry) => {
                    const isMe =
                      submitted &&
                      entry.player_name === submittedName &&
                      entry.score === score;
                    // Before submission: highlight the row where user's score lands
                    const isMyRank =
                      !submitted && rankInfo && entry.rank === rankInfo.rank;
                    return (
                      <LeaderboardRow
                        key={entry.rank}
                        rank={entry.rank}
                        name={
                          isMe
                            ? `${entry.player_name} ★`
                            : isMyRank
                            ? "— (나)"
                            : entry.player_name
                        }
                        score={entry.score}
                        highlight={isMe || !!isMyRank}
                      />
                    );
                  })}
                </>
              );
            })()}

            {/* If rank > 5 but no nearby data yet (or rank not in window) — fallback row */}
            {rankInfo &&
              rankInfo.rank > 5 &&
              nearbyRankings.length === 0 &&
              !submitted && (
                <>
                  <Text style={lbStyles.ellipsis}>· · ·</Text>
                  <View style={[lbStyles.row, lbStyles.rowHighlight]}>
                    <Text style={[lbStyles.rank, lbStyles.textHighlight]}>
                      #{rankInfo.rank}
                    </Text>
                    <Text style={[lbStyles.name, lbStyles.textHighlight]}>
                      —
                    </Text>
                    <Text style={[lbStyles.score, lbStyles.scoreHighlight]}>
                      {score}
                    </Text>
                  </View>
                </>
              )}
          </View>
        )}

        {/* Loading state */}
        {!topRankings.length && !rankInfo && score > 0 && (
          <ActivityIndicator
            size="small"
            color="#3A7AB5"
            style={{ marginVertical: 16 }}
          />
        )}

        <Pressable style={overlayStyles.btn} onPress={restartGame}>
          <Text style={overlayStyles.btnText}>PLAY AGAIN</Text>
        </Pressable>
        <Pressable style={overlayStyles.btnSecondary} onPress={goToMenu}>
          <Feather name="home" size={14} color="#3A7AB5" />
          <Text style={overlayStyles.btnSecondaryText}>MAIN MENU</Text>
        </Pressable>
      </ScrollView>
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
    currentCoord,
    targetCoord,
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

      {/* Coordinate display + instruction */}
      {phase === "playing" && (
        <View style={styles.coordBar}>
          <View style={styles.coordBarItem}>
            <Text style={styles.coordBarLabel}>NOW</Text>
            <Text style={styles.coordBarValue}>{currentCoord}</Text>
          </View>
          <Feather name="arrow-right" size={14} color="#1A5F8A" />
          <View style={styles.coordBarItem}>
            <Text style={styles.coordBarLabel}>TARGET</Text>
            <Text style={[styles.coordBarValue, { color: "#00FFB3" }]}>{targetCoord}</Text>
          </View>
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
  coordBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  coordBarItem: {
    alignItems: "center",
  },
  coordBarLabel: {
    color: "#1A5F8A",
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  coordBarValue: {
    color: "#5A8AB5",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
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
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 32,
    width: SW,
    maxWidth: 400,
  },
  box: {
    alignItems: "center",
    paddingHorizontal: 32,
    maxWidth: 320,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  finalScoreUnit: {
    color: "#3A7AB5",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 1,
    marginBottom: 14,
  },
  inputBox: {
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    width: "100%",
  },
  inputLabel: {
    color: "#5A8AB5",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 1,
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
  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1A3A5C",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  btnSecondaryText: {
    color: "#3A7AB5",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  leaderboardPanel: {
    backgroundColor: "#0A1929",
    borderWidth: 1,
    borderColor: "#1A3A5C",
    borderRadius: 12,
    padding: 24,
    width: SW - 48,
    maxWidth: 380,
    maxHeight: "80%",
    alignItems: "center",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  panelTitle: {
    color: "#3A7AB5",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 4,
  },
  emptyText: {
    color: "#3A7AB5",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 24,
  },
  ttsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#1A3A5C",
    borderRadius: 8,
  },
  ttsLabel: {
    flex: 1,
    color: "#5A8AB5",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  coordHintRow: {
    marginBottom: 16,
  },
  coordHintText: {
    color: "#2A5A8A",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.5,
  },
  coordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  coordChip: {
    color: "#5A8AB5",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    backgroundColor: "#0A1929",
    borderWidth: 1,
    borderColor: "#1A3A5C",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    letterSpacing: 1,
  },
  coordTarget: {
    color: "#00FFB3",
    borderColor: "#00FFB3",
  },
  coordArrow: {
    color: "#3A7AB5",
    fontSize: 14,
  },
  rankBox: {
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  rankText: {
    color: "#FFD700",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#1A5F8A",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    width: 220,
    textAlign: "center",
    backgroundColor: "#0A1929",
  },
  submitBtn: {
    backgroundColor: "#00C4FF",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 32,
    minWidth: 140,
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    color: "#0B1622",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  savedText: {
    color: "#00FFB3",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
});

const lbStyles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  title: {
    color: "#3A7AB5",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: "#0A1929",
  },
  rowHighlight: {
    backgroundColor: "rgba(0,255,179,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,255,179,0.25)",
  },
  rank: {
    width: 36,
    color: "#3A7AB5",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  name: {
    flex: 1,
    color: "#8AB5D5",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  score: {
    color: "#FFD700",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    minWidth: 30,
    textAlign: "right",
  },
  textHighlight: {
    color: "#00FFB3",
  },
  scoreHighlight: {
    color: "#00FFB3",
  },
  ellipsis: {
    color: "#1A3A5C",
    textAlign: "center",
    fontSize: 14,
    letterSpacing: 4,
    marginVertical: 4,
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
