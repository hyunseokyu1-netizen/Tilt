import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer, type AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import * as Speech from "expo-speech";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { indexToCoord } from "../utils/coords";
import { applyRank } from "../utils/ranking";

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

export interface RankInfo {
  rank: number;
  qualifies: boolean; // true if rank <= 1000
}

export interface RankingEntry {
  player_name: string;
  score: number;
  total_play_time: number;
  rank: number;
}

const HIGH_SCORE_KEY = "@tilt_high_score";
const TTS_ENABLED_KEY = "@tilt_tts_enabled";

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
  currentCoord: string;
  targetCoord: string;
  rankInfo: RankInfo | null;
  topRankings: RankingEntry[];
  nearbyRankings: RankingEntry[];
  nearbyOffset: number;
  isLoadingRankings: boolean;
  isSubmittingRank: boolean;
  ttsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => void;
  startGame: () => void;
  restartGame: () => void;
  goToMenu: () => void;
  movePlayer: (dir: "up" | "down" | "left" | "right") => void;
  submitScore: (name: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

const INITIAL_MAX_TIME = 5000;
const MIN_MAX_TIME = 1200;
const TIME_REDUCTION = 200;
const MOVE_COOLDOWN = 380;

// Metronome: 60 BPM at full time → 180 BPM at 0 time
const METRO_BPM_MIN = 60;
const METRO_BPM_MAX = 180;

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

function speakPosition(playerIdx: number, targetIdx: number) {
  Speech.stop();
  Speech.speak(`${indexToCoord(playerIdx)} to ${indexToCoord(targetIdx)}`, {
    language: "en-US",
    rate: 1.1,
  });
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
  const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);
  const [topRankings, setTopRankings] = useState<RankingEntry[]>([]);
  const [nearbyRankings, setNearbyRankings] = useState<RankingEntry[]>([]);
  const [nearbyOffset, setNearbyOffset] = useState(0);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);
  const [isSubmittingRank, setIsSubmittingRank] = useState(false);
  const [ttsEnabled, setTtsEnabledState] = useState(true);

  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useKeepAwake();

  const tickPlayer = useAudioPlayer(TICK_SOUND);
  const bumpPlayer = useAudioPlayer(BUMP_SOUND);
  const clearPlayer = useAudioPlayer(CLEAR_SOUND);
  const metronomePlayer = useAudioPlayer(TICK_SOUND);

  useEffect(() => {
    AsyncStorage.getItem(HIGH_SCORE_KEY).then((val) => {
      if (val !== null) {
        const parsed = parseInt(val, 10);
        if (Number.isFinite(parsed) && parsed > 0) setHighScore(parsed);
      }
    });
    AsyncStorage.getItem(TTS_ENABLED_KEY).then((val) => {
      if (val === "false") setTtsEnabledState(false);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const ttsEnabledRef = useRef(ttsEnabled);
  ttsEnabledRef.current = ttsEnabled;

  const setTtsEnabled = useCallback((enabled: boolean) => {
    setTtsEnabledState(enabled);
    AsyncStorage.setItem(TTS_ENABLED_KEY, String(enabled));
    if (!enabled) Speech.stop();
  }, []);

  const phaseRef = useRef(phase);
  const playerRef = useRef(playerIndex);
  const targetRef = useRef(targetIndex);
  const roundRef = useRef(round);
  const maxTimeRef = useRef(maxTime);
  const lastMoveRef = useRef(0);
  const nextMetronomeTickRef = useRef(0);
  const scoreRef = useRef(score);
  // Track accumulated play time (ms) across successful rounds only
  const totalPlayTimeRef = useRef(0);
  // Timestamp of current round start (Date.now())
  const roundStartTimeRef = useRef(0);

  phaseRef.current = phase;
  playerRef.current = playerIndex;
  targetRef.current = targetIndex;
  roundRef.current = round;
  maxTimeRef.current = maxTime;
  scoreRef.current = score;

  const fetchRankings = useCallback(async (finalScore: number, finalPlayTime: number) => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoadingRankings(false);
      return;
    }
    setIsLoadingRankings(true);
    try {
      // Rows strictly above user: better score, OR same score with less-or-equal time
      // (same score + same time = registered earlier → all count as "above" pre-submission)
      const aboveFilter =
        `score.gt.${finalScore},and(score.eq.${finalScore},total_play_time.lte.${finalPlayTime})`;

      const [top5Result, higherResult] = await Promise.all([
        supabase
          .from("rankings")
          .select("player_name, score, total_play_time")
          .order("score", { ascending: false })
          .order("total_play_time", { ascending: true })
          .order("created_at", { ascending: true })
          .limit(5),
        // Use head:true to get count only — avoids fetching all rows
        supabase
          .from("rankings")
          .select("*", { count: "exact", head: true })
          .or(aboveFilter),
      ]);

      // Sequential rank: every row has its own rank number
      const totalAbove = higherResult.count ?? 0;
      const userRank = totalAbove + 1;
      setRankInfo({ rank: userRank, qualifies: totalAbove < 1000 });

      setTopRankings(applyRank(top5Result.data ?? [], 0));

      if (totalAbove >= 5) {
        const offset = Math.max(0, totalAbove - 3);
        const { data } = await supabase
          .from("rankings")
          .select("player_name, score, total_play_time")
          .order("score", { ascending: false })
          .order("total_play_time", { ascending: true })
          .order("created_at", { ascending: true })
          .range(offset, offset + 6);

        setNearbyOffset(offset);
        // Each entry's global rank = offset + index + 1
        setNearbyRankings(applyRank(data ?? [], offset));
      } else {
        setNearbyOffset(0);
        setNearbyRankings([]);
      }
    } catch {
      // ranking fetch is non-critical
    } finally {
      setIsLoadingRankings(false);
    }
  }, []);

  // Fetch global rank + top 5 when game over
  useEffect(() => {
    if (phase !== "gameover") return;
    setRankInfo(null);
    setTopRankings([]);

    const finalScore = scoreRef.current;
    if (finalScore === 0) {
      setIsLoadingRankings(false);
      return;
    }
    setIsLoadingRankings(true);
    fetchRankings(finalScore, totalPlayTimeRef.current);
  }, [phase, fetchRankings]);

  const submitScore = useCallback(async (name: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    setIsSubmittingRank(true);
    try {
      await supabase.from("rankings").insert({
        player_name: name.trim(),
        score: scoreRef.current,
        total_play_time: totalPlayTimeRef.current,
      });
      await fetchRankings(scoreRef.current, totalPlayTimeRef.current);
    } finally {
      setIsSubmittingRank(false);
    }
  }, [fetchRankings]);

  const handleReach = useCallback(() => {
    // Accumulate time spent on this round (only successful rounds count)
    totalPlayTimeRef.current += Date.now() - roundStartTimeRef.current;
    roundStartTimeRef.current = Date.now();

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
    nextMetronomeTickRef.current = 0;
    if (ttsEnabledRef.current) speakPosition(playerRef.current, newTarget);
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
    setRankInfo(null);
    setTopRankings([]);
    setNearbyRankings([]);
    setNearbyOffset(0);
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
    playerRef.current = 4;
    targetRef.current = target;
    roundRef.current = 0;
    maxTimeRef.current = INITIAL_MAX_TIME;
    nextMetronomeTickRef.current = 0;
    totalPlayTimeRef.current = 0;
    roundStartTimeRef.current = Date.now();
    if (ttsEnabledRef.current) speakPosition(4, target);
  }, []);

  const restartGame = useCallback(() => {
    setLastScore((prev) => prev);
    startGame();
  }, [startGame]);

  const goToMenu = useCallback(() => {
    Speech.stop();
    setPhase("idle");
    setScore(0);
    setRound(0);
    setTimeLeft(INITIAL_MAX_TIME);
    setMaxTime(INITIAL_MAX_TIME);
    setIsNewBest(false);
    setRankInfo(null);
    setTopRankings([]);
    setNearbyRankings([]);
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
  }, []);

  // Timer + metronome
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

        // Metronome: BPM scales from 60 (full time) to 180 (near 0)
        const progress = 1 - next / maxTimeRef.current;
        const bpm = METRO_BPM_MIN + progress * (METRO_BPM_MAX - METRO_BPM_MIN);
        const metroInterval = Math.floor(60000 / bpm);
        const now = Date.now();
        if (now >= nextMetronomeTickRef.current) {
          nextMetronomeTickRef.current = now + metroInterval;
          playSound(metronomePlayer);
        }

        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [phase, score, metronomePlayer]);

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

  const currentCoord = indexToCoord(playerIndex);
  const targetCoord = indexToCoord(targetIndex);

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
        currentCoord,
        targetCoord,
        rankInfo,
        topRankings,
        nearbyRankings,
        nearbyOffset,
        isLoadingRankings,
        isSubmittingRank,
        ttsEnabled,
        setTtsEnabled,
        startGame,
        restartGame,
        goToMenu,
        movePlayer,
        submitScore,
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
