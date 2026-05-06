import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer, type AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

const TICK_SOUND = require("../assets/sounds/tick.wav");
const BUMP_SOUND = require("../assets/sounds/bump.wav");
const CLEAR_SOUND = require("../assets/sounds/clear.wav");

function playSound(player: AudioPlayer | null) {
  if (!player) return;
  try {
    player.seekTo(0);
    player.play();
  } catch {
    // ignore playback errors
  }
}

export type Phase = "idle" | "playing" | "gameover";

const HIGH_SCORE_KEY = "@tilt_high_score";

export interface GameContextType {
  phase: Phase;
  playerIndex: number;
  targetIndex: number;
  score: number;
  round: number;
  timeLeft: number;
  maxTime: number;
  lastScore: number;
  highScore: number;
  isNewBest: boolean;
  flashIndex: number | null;
  startGame: () => void;
  restartGame: () => void;
  movePlayer: (dir: "up" | "down" | "left" | "right") => void;
}

const GameContext = createContext<GameContextType | null>(null);

const INITIAL_MAX_TIME = 5000;
const MIN_MAX_TIME = 1200;
const TIME_REDUCTION = 200;
const MOVE_COOLDOWN = 380;

function randomTarget(exclude: number): number {
  let t: number;
  do {
    t = Math.floor(Math.random() * 9);
  } while (t === exclude);
  return t;
}

function canMove(
  from: number,
  dir: "up" | "down" | "left" | "right"
): number | null {
  const row = Math.floor(from / 3);
  const col = from % 3;
  if (dir === "up" && row > 0) return from - 3;
  if (dir === "down" && row < 2) return from + 3;
  if (dir === "left" && col > 0) return from - 1;
  if (dir === "right" && col < 2) return from + 1;
  return null;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [playerIndex, setPlayerIndex] = useState(4);
  const [targetIndex, setTargetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_MAX_TIME);
  const [maxTime, setMaxTime] = useState(INITIAL_MAX_TIME);
  const [lastScore, setLastScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [flashIndex, setFlashIndex] = useState<number | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useKeepAwake();

  const tickPlayer = useAudioPlayer(TICK_SOUND);
  const bumpPlayer = useAudioPlayer(BUMP_SOUND);
  const clearPlayer = useAudioPlayer(CLEAR_SOUND);

  useEffect(() => {
    AsyncStorage.getItem(HIGH_SCORE_KEY).then((val) => {
      if (val !== null) {
        const parsed = parseInt(val, 10);
        if (Number.isFinite(parsed) && parsed > 0) setHighScore(parsed);
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const phaseRef = useRef(phase);
  const playerRef = useRef(playerIndex);
  const targetRef = useRef(targetIndex);
  const roundRef = useRef(round);
  const maxTimeRef = useRef(maxTime);
  const lastMoveRef = useRef(0);
  const lastHapticRef = useRef(0);

  phaseRef.current = phase;
  playerRef.current = playerIndex;
  targetRef.current = targetIndex;
  roundRef.current = round;
  maxTimeRef.current = maxTime;

  const handleReach = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSound(clearPlayer);
    const reachedCell = targetRef.current;
    setFlashIndex(reachedCell);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => {
      setFlashIndex(null);
      flashTimerRef.current = null;
    }, 300);
    const newRound = roundRef.current + 1;
    const newMaxTime = Math.max(
      MIN_MAX_TIME,
      INITIAL_MAX_TIME - newRound * TIME_REDUCTION
    );
    const newTarget = randomTarget(playerRef.current);
    setScore((s) => s + 1);
    setRound(newRound);
    setMaxTime(newMaxTime);
    setTimeLeft(newMaxTime);
    setTargetIndex(newTarget);
    targetRef.current = newTarget;
    roundRef.current = newRound;
    maxTimeRef.current = newMaxTime;
  }, [clearPlayer]);

  const movePlayer = useCallback(
    (dir: "up" | "down" | "left" | "right") => {
      if (phaseRef.current !== "playing") return;
      const now = Date.now();
      if (now - lastMoveRef.current < MOVE_COOLDOWN) return;
      lastMoveRef.current = now;
      const next = canMove(playerRef.current, dir);
      if (next === null) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        playSound(bumpPlayer);
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playSound(tickPlayer);
      setPlayerIndex(next);
      playerRef.current = next;
      if (next === targetRef.current) {
        handleReach();
      }
    },
    [handleReach, tickPlayer, bumpPlayer]
  );

  const startGame = useCallback(() => {
    const target = randomTarget(4);
    setPhase("playing");
    setPlayerIndex(4);
    setTargetIndex(target);
    setScore(0);
    setRound(0);
    setMaxTime(INITIAL_MAX_TIME);
    setTimeLeft(INITIAL_MAX_TIME);
    setIsNewBest(false);
    setFlashIndex(null);
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
    playerRef.current = 4;
    targetRef.current = target;
    roundRef.current = 0;
    maxTimeRef.current = INITIAL_MAX_TIME;
    lastHapticRef.current = 0;
  }, []);

  const restartGame = useCallback(() => {
    setLastScore((prev) => prev);
    startGame();
  }, [startGame]);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          setPhase("gameover");
          setLastScore(score);
          if (score > 0) {
            setHighScore((prevBest) => {
              if (score > prevBest) {
                setIsNewBest(true);
                AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
                return score;
              }
              setIsNewBest(false);
              return prevBest;
            });
          } else {
            setIsNewBest(false);
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return 0;
        }
        const next = prev - 100;
        // Dynamic haptic tick
        const tickInterval = Math.max(
          150,
          (prev / maxTimeRef.current) * 650 + 150
        );
        const now = Date.now();
        if (now - lastHapticRef.current >= tickInterval) {
          lastHapticRef.current = now;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [phase, score]);

  // Accelerometer
  useEffect(() => {
    if (Platform.OS === "web" || phase !== "playing") return;
    let sub: { remove: () => void } | null = null;
    let lastDir: string | null = null;

    const init = async () => {
      try {
        const { Accelerometer } = await import("expo-sensors");
        Accelerometer.setUpdateInterval(80);
        sub = Accelerometer.addListener(({ x, y }: { x: number; y: number }) => {
          const THRESHOLD = 0.35;
          let dir: "up" | "down" | "left" | "right" | null = null;
          if (Math.abs(x) > Math.abs(y)) {
            if (x > THRESHOLD) dir = "left";
            else if (x < -THRESHOLD) dir = "right";
          } else {
            if (y > THRESHOLD) dir = "down";
            else if (y < -THRESHOLD) dir = "up";
          }
          if (dir && dir !== lastDir) {
            lastDir = dir;
            movePlayer(dir);
          }
          if (!dir) lastDir = null;
        });
      } catch {
        // Sensor unavailable
      }
    };
    init();
    return () => {
      sub?.remove();
    };
  }, [phase, movePlayer]);

  return (
    <GameContext.Provider
      value={{
        phase,
        playerIndex,
        targetIndex,
        score,
        round,
        timeLeft,
        maxTime,
        lastScore,
        highScore,
        isNewBest,
        flashIndex,
        startGame,
        restartGame,
        movePlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
