import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LocalRankingRecord {
  player_name: string;
  score: number;
  total_play_time: number;
  created_at: number;
}

const RANKINGS_KEY = "@tilt_local_rankings";
const MAX_RANKINGS = 50;

function sortRecords(records: LocalRankingRecord[]): LocalRankingRecord[] {
  return [...records].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.total_play_time !== b.total_play_time)
      return a.total_play_time - b.total_play_time;
    return a.created_at - b.created_at;
  });
}

export async function getLocalRankings(): Promise<LocalRankingRecord[]> {
  const raw = await AsyncStorage.getItem(RANKINGS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addLocalRanking(
  entry: Omit<LocalRankingRecord, "created_at">
): Promise<LocalRankingRecord[]> {
  const existing = await getLocalRankings();
  const next = sortRecords([
    ...existing,
    { ...entry, created_at: Date.now() },
  ]).slice(0, MAX_RANKINGS);
  await AsyncStorage.setItem(RANKINGS_KEY, JSON.stringify(next));
  return next;
}

/**
 * Rank a candidate score would occupy among existing records (1-based),
 * without inserting it. Same tie-break order as sortRecords.
 */
export function computeRank(
  records: LocalRankingRecord[],
  score: number,
  totalPlayTime: number
): number {
  const above = records.filter(
    (r) =>
      r.score > score ||
      (r.score === score && r.total_play_time <= totalPlayTime)
  ).length;
  return above + 1;
}
