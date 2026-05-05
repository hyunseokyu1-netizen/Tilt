import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface TimerBarProps {
  timeLeft: number;
  maxTime: number;
}

export function TimerBar({ timeLeft, maxTime }: TimerBarProps) {
  const progress = maxTime > 0 ? timeLeft / maxTime : 0;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (pulseRef.current) {
      pulseRef.current.stop();
    }
    const duration = Math.max(150, progress * 600 + 150);
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );
    pulseRef.current.start();
    return () => {
      pulseRef.current?.stop();
    };
  }, [Math.round(progress * 10)]);

  let barColor = "#00C4FF";
  if (progress < 0.5) barColor = "#FFB800";
  if (progress < 0.25) barColor = "#FF3B30";

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: `${progress * 100}%`,
              backgroundColor: barColor,
              opacity: pulseAnim,
            },
          ]}
        />
      </View>
      <View style={styles.glowDots}>
        <View style={[styles.dot, { backgroundColor: barColor }]} />
        <View style={[styles.dot, { backgroundColor: barColor, opacity: 0.3 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  track: {
    width: "100%",
    height: 3,
    backgroundColor: "#0A1929",
    borderRadius: 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1A3A5C",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
  glowDots: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
