import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

interface GridProps {
  playerIndex: number;
  targetIndex: number;
  flashIndex: number | null;
}

const { width: SCREEN_W } = Dimensions.get("window");
const GRID_SIZE = Math.min(SCREEN_W * 0.82, 320);
const GAP = 6;
const CELL_SIZE = (GRID_SIZE - GAP * 2) / 3;
const TARGET_COLOR = "#00FF88";
const PLAYER_COLOR = "#00FF88";
const CELL_BG = "#0A1929";
const CELL_BORDER = "#1A3A5C";

function TargetCell({ pulse }: { pulse: Animated.Value }) {
  return (
    <Animated.View
      style={[
        styles.targetBorder,
        {
          opacity: pulse,
          shadowColor: TARGET_COLOR,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 14,
          elevation: 8,
        },
      ]}
    >
      <View style={styles.targetCornerTL_H} />
      <View style={styles.targetCornerTL_V} />
      <View style={styles.targetCornerTR_H} />
      <View style={styles.targetCornerTR_V} />
      <View style={styles.targetCornerBL_H} />
      <View style={styles.targetCornerBL_V} />
      <View style={styles.targetCornerBR_H} />
      <View style={styles.targetCornerBR_V} />
    </Animated.View>
  );
}

function Chevrons({ pulse }: { pulse: Animated.Value }) {
  return (
    <Animated.View style={[styles.chevronsWrap, { opacity: pulse }]}>
      <View style={styles.chevron} />
      <View style={styles.chevron} />
    </Animated.View>
  );
}

const FLASH_COLOR = "#FFFFFF";

function FlashOverlay({ active }: { active: boolean }) {
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      flashAnim.setValue(1);
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [active]);

  if (!active) return null;

  return (
    <Animated.View
      style={[
        styles.flashOverlay,
        {
          opacity: flashAnim,
          shadowColor: FLASH_COLOR,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 20,
          elevation: 10,
        },
      ]}
    />
  );
}

function Cell({
  index,
  isPlayer,
  isTarget,
  isFlash,
}: {
  index: number;
  isPlayer: boolean;
  isTarget: boolean;
  isFlash: boolean;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isTarget) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.35,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTarget]);

  useEffect(() => {
    if (isPlayer) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.25,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isPlayer, index]);

  return (
    <View style={styles.cell}>
      <FlashOverlay active={isFlash} />
      {isTarget && <TargetCell pulse={pulseAnim} />}
      {isTarget && <Chevrons pulse={pulseAnim} />}
      {isPlayer && (
        <Animated.View
          style={[
            styles.player,
            {
              transform: [{ scale: scaleAnim }],
              shadowColor: PLAYER_COLOR,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 10,
              elevation: 6,
            },
          ]}
        >
          <View style={styles.playerInner} />
        </Animated.View>
      )}
    </View>
  );
}

export function Grid({ playerIndex, targetIndex, flashIndex }: GridProps) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 9 }).map((_, i) => (
        <Cell
          key={i}
          index={i}
          isPlayer={i === playerIndex}
          isTarget={i === targetIndex}
          isFlash={i === flashIndex}
        />
      ))}
    </View>
  );
}

const CORNER_LEN = 20;
const CORNER_W = 3;

const styles = StyleSheet.create({
  grid: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: CELL_BG,
    borderWidth: 1,
    borderColor: CELL_BORDER,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },
  player: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: PLAYER_COLOR,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,136,0.15)",
  },
  playerInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: PLAYER_COLOR,
  },
  targetBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: TARGET_COLOR,
    borderRadius: 4,
  },
  targetCornerTL_H: {
    position: "absolute",
    top: -1,
    left: -1,
    width: CORNER_LEN,
    height: CORNER_W,
    backgroundColor: TARGET_COLOR,
  },
  targetCornerTL_V: {
    position: "absolute",
    top: -1,
    left: -1,
    width: CORNER_W,
    height: CORNER_LEN,
    backgroundColor: TARGET_COLOR,
  },
  targetCornerTR_H: {
    position: "absolute",
    top: -1,
    right: -1,
    width: CORNER_LEN,
    height: CORNER_W,
    backgroundColor: TARGET_COLOR,
  },
  targetCornerTR_V: {
    position: "absolute",
    top: -1,
    right: -1,
    width: CORNER_W,
    height: CORNER_LEN,
    backgroundColor: TARGET_COLOR,
  },
  targetCornerBL_H: {
    position: "absolute",
    bottom: -1,
    left: -1,
    width: CORNER_LEN,
    height: CORNER_W,
    backgroundColor: TARGET_COLOR,
  },
  targetCornerBL_V: {
    position: "absolute",
    bottom: -1,
    left: -1,
    width: CORNER_W,
    height: CORNER_LEN,
    backgroundColor: TARGET_COLOR,
  },
  targetCornerBR_H: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: CORNER_LEN,
    height: CORNER_W,
    backgroundColor: TARGET_COLOR,
  },
  targetCornerBR_V: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: CORNER_W,
    height: CORNER_LEN,
    backgroundColor: TARGET_COLOR,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    zIndex: 10,
  },
  chevronsWrap: {
    position: "absolute",
    right: -20,
    flexDirection: "row",
    gap: 3,
  },
  chevron: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: TARGET_COLOR,
  },
});
