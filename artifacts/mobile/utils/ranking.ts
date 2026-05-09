import type { RankingEntry } from "@/contexts/GameContext";

/**
 * Assigns DENSE_RANK to a sorted (score DESC, total_play_time ASC) array.
 * Identical (score, total_play_time) pairs share the same rank; the next
 * distinct pair gets rank+1 (no gaps).
 */
export function applyDenseRank(
  entries: { player_name: string; score: number; total_play_time?: number }[]
): RankingEntry[] {
  let rank = 0;
  let prevKey = "";
  return entries.map((e) => {
    const pt = e.total_play_time ?? 0;
    const key = `${e.score}::${pt}`;
    if (key !== prevKey) {
      rank++;
      prevKey = key;
    }
    return { ...e, total_play_time: pt, rank };
  });
}
