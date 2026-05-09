import type { RankingEntry } from "@/contexts/GameContext";

/**
 * Assigns sequential rank (1, 2, 3 …) to entries already sorted by the DB.
 * startOffset = 0-based position of the first entry in the global leaderboard.
 * Every row gets its own unique rank — no ties.
 */
export function applyRank(
  entries: { player_name: string; score: number; total_play_time?: number }[],
  startOffset = 0
): RankingEntry[] {
  return entries.map((e, i) => ({
    ...e,
    total_play_time: e.total_play_time ?? 0,
    rank: startOffset + i + 1,
  }));
}
