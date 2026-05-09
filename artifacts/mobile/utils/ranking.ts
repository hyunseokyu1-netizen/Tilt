import type { RankingEntry } from "@/contexts/GameContext";

/**
 * Assigns DENSE_RANK to a sorted-by-score-desc array.
 * Tied scores share the same rank; the next distinct score gets rank+1 (no gaps).
 */
export function applyDenseRank(
  entries: { player_name: string; score: number }[]
): RankingEntry[] {
  let rank = 0;
  let prevScore = NaN;
  return entries.map((e) => {
    if (e.score !== prevScore) {
      rank++;
      prevScore = e.score;
    }
    return { ...e, rank };
  });
}
