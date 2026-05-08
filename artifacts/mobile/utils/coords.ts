const COLS = ['A', 'B', 'C'] as const;

/**
 * Maps grid index (0–8) to coordinate label.
 * Row 1: A1 B1 C1  (indices 0–2)
 * Row 2: A2 B2 C2  (indices 3–5)
 * Row 3: A3 B3 C3  (indices 6–8)
 */
export function indexToCoord(index: number): string {
  return `${COLS[index % 3]}${Math.floor(index / 3) + 1}`;
}
