import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { getLocales } from "expo-localization";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
export const TUTORIAL_KEY = "@tilt_tutorial_done";
const TOTAL_STEPS = 3;
const COORDS = ["A1", "B1", "C1", "A2", "B2", "C2", "A3", "B3", "C3"];

// Step 1: 그리드 + 플레이어 이동 애니메이션 (B2→C2→C1)
// PATH: 각 틱마다 플레이어 위치, 마지막이 target(2=C1)
const MOVE_PATH = [4, 4, 5, 5, 2];

function Step1Grid() {
  const [playerIdx, setPlayerIdx] = useState(4);
  const [flash, setFlash] = useState(false);
  const tickRef = useRef(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current = (tickRef.current + 1) % (MOVE_PATH.length + 2);
      if (tickRef.current < MOVE_PATH.length) {
        const next = MOVE_PATH[tickRef.current];
        setPlayerIdx(next);
        if (next === 2) {
          setFlash(true);
          flashTimer.current = setTimeout(() => setFlash(false), 500);
        }
      } else {
        // 잠시 대기 후 리셋
        if (tickRef.current === MOVE_PATH.length + 1) {
          setPlayerIdx(4);
          tickRef.current = 0;
        }
      }
    }, 600);
    return () => {
      clearInterval(interval);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  return (
    <View style={g.grid}>
      {Array.from({ length: 9 }, (_, i) => {
        const isPlayer = i === playerIdx;
        const isTarget = i === 2;
        const reached = isTarget && flash;
        return (
          <View
            key={i}
            style={[g.cell, isTarget && g.cellTarget, reached && g.cellReached]}
          >
            <Text style={[g.coord, isTarget && g.coordTarget]}>{COORDS[i]}</Text>
            {isPlayer && (
              <View style={[g.player, reached && g.playerReached]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

// Step 2: 타이머 바 + 그리드
function Step2Timer({ isKo }: { isKo: boolean }) {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.delay(300),
        Animated.timing(anim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const barWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  const barColor = anim.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: ["#FF3B30", "#FFD700", "#00FFB3"],
  });

  return (
    <View style={t.container}>
      <View style={g.grid}>
        {Array.from({ length: 9 }, (_, i) => (
          <View key={i} style={[g.cell, i === 2 && g.cellTarget]}>
            <Text style={[g.coord, i === 2 && g.coordTarget]}>{COORDS[i]}</Text>
            {i === 4 && <View style={g.player} />}
          </View>
        ))}
      </View>
      <View style={t.track}>
        <Animated.View
          style={[t.fill, { width: barWidth, backgroundColor: barColor }]}
        />
      </View>
      <Text style={t.hint}>{isKo ? "시간이 줄어듭니다" : "Timer gets shorter"}</Text>
    </View>
  );
}

// Step 3: 음성 안내
function Step3Audio({ isKo }: { isKo: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(wave1, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(wave1, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wave2, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(wave2, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }, 400);
  }, [pulse, wave1, wave2]);

  return (
    <View style={a.container}>
      <View style={a.iconRow}>
        <Animated.View style={[a.iconWrap, { transform: [{ scale: pulse }] }]}>
          <Feather name="volume-2" size={52} color="#00FFB3" />
        </Animated.View>
        <View style={a.waves}>
          <Animated.View style={[a.wave, { opacity: wave1 }]} />
          <Animated.View style={[a.wave, a.wave2, { opacity: wave2 }]} />
        </View>
      </View>
      <View style={a.callout}>
        <Text style={a.calloutText}>
          {isKo ? '"B2에서 C1로"' : '"B2 to C1"'}
        </Text>
      </View>
      <Text style={a.coordRow}>
        <Text style={a.coordChip}>B2</Text>
        {"  →  "}
        <Text style={[a.coordChip, a.coordTarget]}>C1</Text>
      </Text>
    </View>
  );
}

const STEPS_KO = [
  {
    title: "기울여서 이동",
    desc: "스마트폰을 기울이면 마커가 이동합니다\n웹에서는 방향키로 조작할 수 있어요",
    content: () => <Step1Grid />,
  },
  {
    title: "목표 칸에 도달",
    desc: "빛나는 칸에 시간 안에 도달하세요\n성공할수록 타이머가 점점 빨라집니다",
    content: () => <Step2Timer isKo />,
  },
  {
    title: "음성 안내 지원",
    desc: "화면을 보지 않고도 플레이 가능합니다\n매 라운드 현재 위치와 목표를 안내해요",
    content: () => <Step3Audio isKo />,
  },
];

const STEPS_EN = [
  {
    title: "Tilt to Move",
    desc: "Tilt your phone to move the marker\nUse arrow keys on web",
    content: () => <Step1Grid />,
  },
  {
    title: "Reach the Target",
    desc: "Get to the glowing cell before time runs out\nEach success makes the timer shorter",
    content: () => <Step2Timer isKo={false} />,
  },
  {
    title: "Audio Guided",
    desc: "Play without looking at the screen\nEach round announces your position and target",
    content: () => <Step3Audio isKo={false} />,
  },
];

function isKorean(): boolean {
  try {
    const locale = getLocales()[0]?.languageCode ?? "";
    return locale === "ko";
  } catch {
    return false;
  }
}

export function TutorialOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const ko = isKorean();
  const STEPS = ko ? STEPS_KO : STEPS_EN;

  const transition = useCallback(
    (next: number) => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 130,
        useNativeDriver: true,
      }).start(() => {
        setStep(next);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }).start();
      });
    },
    [opacity]
  );

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      transition(step + 1);
    } else {
      AsyncStorage.setItem(TUTORIAL_KEY, "true");
      onDone();
    }
  };

  const handleSkip = () => {
    AsyncStorage.setItem(TUTORIAL_KEY, "true");
    onDone();
  };

  const current = STEPS[step];
  const ContentComponent = current.content;

  return (
    <View style={styles.container}>
      {/* 건너뛰기 / Skip */}
      {step < TOTAL_STEPS - 1 && (
        <Pressable style={styles.skipBtn} onPress={handleSkip} hitSlop={12}>
          <Text style={styles.skipText}>{ko ? "건너뛰기" : "Skip"}</Text>
        </Pressable>
      )}

      <Animated.View style={[styles.body, { opacity }]}>
        <View style={styles.contentArea}>
          <ContentComponent />
        </View>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.desc}>{current.desc}</Text>
      </Animated.View>

      {/* 점 인디케이터 */}
      <View style={styles.dots}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      {/* 버튼 */}
      <Pressable style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>
          {step < TOTAL_STEPS - 1
            ? ko ? "다음" : "Next"
            : ko ? "시작하기" : "Let's Go"}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── 공통 그리드 스타일 ────────────────────────────────
const CELL = 72;
const g = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: CELL * 3 + 8,
    gap: 4,
  },
  cell: {
    width: CELL,
    height: CELL,
    backgroundColor: "#0A1929",
    borderWidth: 1,
    borderColor: "#1A3A5C",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  cellTarget: {
    backgroundColor: "rgba(0,255,136,0.06)",
    borderColor: "#00FF88",
    borderWidth: 1.5,
  },
  cellReached: {
    backgroundColor: "rgba(0,255,136,0.18)",
  },
  coord: {
    position: "absolute",
    top: 5,
    left: 6,
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "rgba(58,122,181,0.5)",
  },
  coordTarget: {
    color: "rgba(0,255,136,0.8)",
  },
  player: {
    width: 28,
    height: 28,
    borderRadius: 5,
    backgroundColor: "#00FF88",
  },
  playerReached: {
    backgroundColor: "#00FFB3",
    shadowColor: "#00FFB3",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
});

// ─── Step2 타이머 스타일 ─────────────────────────────
const t = StyleSheet.create({
  container: { alignItems: "center", gap: 12 },
  track: {
    width: CELL * 3 + 8,
    height: 6,
    backgroundColor: "#0A1929",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 3 },
  hint: {
    color: "#3A7AB5",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
  },
});

// ─── Step3 오디오 스타일 ─────────────────────────────
const a = StyleSheet.create({
  container: { alignItems: "center", gap: 16 },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,255,179,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  waves: { gap: 6 },
  wave: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00FFB3",
  },
  wave2: { width: 20 },
  callout: {
    borderWidth: 1,
    borderColor: "#1A3A5C",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0A1929",
  },
  calloutText: {
    color: "#00FFB3",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  coordRow: {
    color: "#5A8AB5",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  coordChip: {
    color: "#5A8AB5",
    fontFamily: "Inter_700Bold",
  },
  coordTarget: {
    color: "#00FFB3",
  },
});

// ─── 전체 오버레이 스타일 ────────────────────────────
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,18,28,0.97)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  skipBtn: {
    position: "absolute",
    top: 56,
    right: 24,
  },
  skipText: {
    color: "#3A7AB5",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  body: {
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
  },
  contentArea: {
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: "center",
  },
  desc: {
    color: "#5A8AB5",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlign: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 32,
    marginBottom: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1A3A5C",
  },
  dotActive: {
    backgroundColor: "#00FFB3",
    width: 18,
  },
  btn: {
    backgroundColor: "#00FFB3",
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 56,
    shadowColor: "#00FFB3",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  btnText: {
    color: "#0B1622",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },
});
