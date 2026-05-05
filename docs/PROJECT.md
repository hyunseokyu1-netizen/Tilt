# Tilt — Gyroscope Maze Puzzle Game

A mobile arcade puzzle game built with Expo React Native. The player navigates a small box through a 3x3 grid to reach a glowing target cell using the phone's tilt (accelerometer). Each successful clear shortens the timer, building tension through escalating difficulty and accelerating haptic feedback.

## Status

Playable end-to-end. Runs on iOS, Android, and web (Expo). Personal high score persists between sessions.

## Tech Stack

- **Framework**: Expo SDK with Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **Sensors**: `expo-sensors` (Accelerometer, ~80ms update interval)
- **Haptics**: `expo-haptics` (impact + notification feedback)
- **Persistence**: `@react-native-async-storage/async-storage`
- **Animation**: React Native `Animated` API (with `useNativeDriver`)
- **Web fallback**: Arrow D-pad UI when accelerometer unavailable
- **Monorepo**: pnpm workspace, lives at `artifacts/mobile`

## Game Design

### Core loop
1. Player (small green square) starts at the center cell (index 4 of a 3x3 grid).
2. A target cell spawns randomly elsewhere with an animated green border + chevron arrows.
3. Player tilts the phone (or taps D-pad arrows on web) to move one cell at a time.
4. On reaching the target: success haptic fires, target cell flashes white, score +1, new target spawns, timer resets to a shorter duration.
5. If the timer hits 0 before reaching the target → Game Over.

### Difficulty scaling
- Initial timer: **5000ms** per target.
- Each clear reduces the timer by **200ms**, floored at **1200ms**.
- Haptic tick interval shortens as time runs out (creating a quickening "heartbeat").

### Movement
- Tilt threshold: **0.35** on the dominant axis (X or Y).
- Move cooldown: **380ms** between moves.
- Hitting a wall triggers a rigid haptic bump.

### Feedback
- Light impact haptic on successful move.
- Rigid impact haptic on blocked move (wall).
- Success notification haptic + 300ms white cell flash on target reach.
- Error notification haptic on game over.

## Project Structure

```
artifacts/mobile/
├── app/
│   ├── _layout.tsx              # Root layout, font loading, GameProvider wrap
│   ├── (tabs)/
│   │   └── index.tsx            # Main game screen + IdleOverlay + GameOverOverlay + DPad
│   └── +not-found.tsx
├── components/
│   ├── Grid.tsx                 # 3x3 grid, Cell, TargetCell, FlashOverlay, player
│   ├── TimerBar.tsx             # Top countdown bar
│   ├── CircuitLines.tsx         # Decorative circuit-trace background
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   └── KeyboardAwareScrollViewCompat.tsx
├── contexts/
│   └── GameContext.tsx          # All game state + accelerometer + timer + persistence
├── constants/
│   └── colors.ts
├── assets/
│   └── images/icon.png
└── app.json                     # Expo config (slug: mobile, orientation: portrait, dark mode)
```

## State Management

All game state lives in a single React context (`GameContext`). No Redux/Zustand. Key state slices:

| State | Type | Purpose |
|---|---|---|
| `phase` | `"idle" \| "playing" \| "gameover"` | Top-level screen state |
| `playerIndex` | `number (0-8)` | Current cell of the player |
| `targetIndex` | `number (0-8)` | Current target cell |
| `score` | `number` | Cells reached this game |
| `round` | `number` | Used for difficulty scaling |
| `timeLeft` / `maxTime` | `number (ms)` | Timer state |
| `highScore` | `number` | Loaded from AsyncStorage on mount |
| `isNewBest` | `boolean` | Triggers "NEW BEST!" UI on game over |
| `flashIndex` | `number \| null` | Cell currently showing the white flash overlay |

Refs (`phaseRef`, `playerRef`, `targetRef`, `roundRef`, `maxTimeRef`, `flashTimerRef`, `lastMoveRef`, `lastHapticRef`) are used inside `setInterval` and accelerometer callbacks to avoid stale closures.

## Visual Design

- **Background**: Dark navy `#0B1622` with subtle circuit-trace decorations
- **Title "TILT"**: Multi-colored — T (orange `#FF6B35`), I (yellow `#FFD700`), L (cyan `#00C4FF`), T (neon green `#00FFB3`)
- **Cells**: Dark `#0A1929` with cyan borders `#1A3A5C`
- **Target**: Neon green `#00FF88` border with corner brackets, animated pulse, chevron arrows pointing at it
- **Player**: Neon green square with inner dot, scale-pop animation on move
- **Score**: Gold `#FFD700`
- **Flash effect**: White overlay, opacity 1→0 over 300ms with glow shadow

## Persistence

Single AsyncStorage key:

- `@tilt_high_score` — stringified integer, validated with `Number.isFinite` and `> 0` on load.

Only the personal best is stored. No backend, no DB, no auth.

## Web vs. Native

- `Platform.OS === "web"` → accelerometer subscription is skipped, D-pad arrow buttons render at the bottom of the play area.
- Native → D-pad hidden, "RESTART LEVEL" button shown instead.
- Accelerometer is dynamically imported (`await import("expo-sensors")`) inside a try/catch so web bundles don't break.

## Running Locally

The app runs via the Replit workflow `artifacts/mobile: expo`:

```bash
pnpm --filter @workspace/mobile run dev
```

The Expo dev server binds to the `PORT` env var. Web preview is served via Replit's path-based proxy at `/`. Mobile access uses `$REPLIT_EXPO_DEV_DOMAIN`.

**Note**: Do not set `ensurePreviewReachable` in `artifact.toml` — Expo binds the web port lazily, which causes false-positive port checks.

## Known Gotchas

- Restarting the Expo workflow can be slow; use `workflow_timeout: 90` when restarting.
- `useNativeDriver` shows a warning on web (no native module). This is harmless — animations fall back to JS.
- The `expo-router` static analysis sometimes flags route generation; the app still runs fine.
- APK builds are not supported on Replit. iOS publishing is available via Expo Launch.

## Completed Features (Task History)

1. **Core game loop** — 3x3 grid, accelerometer controls, timer with difficulty scaling, haptic feedback, score tracking.
2. **Visual redesign** — Dark navy theme, multi-colored TILT title, circuit decorations, neon target indicators.
3. **Custom app icon**.
4. **Personal best high score** — AsyncStorage persistence, "NEW BEST!" indicator, BEST score on idle/gameover overlays.
5. **Game history** — Recent game records (Task #3).
6. **Cell flash effect** — White flash + glow on target reach (Task #6).

## Pending / Proposed Tasks

- Global leaderboard with backend DB + nicknames (Task #2)
- Score trend chart in game history (Task #4)
- Clear game history button (Task #5)
- Full-screen flash effect on target reach (Task #7)

## Files to Read First (for new contributors)

1. `contexts/GameContext.tsx` — All game logic in one place. Start here.
2. `app/(tabs)/index.tsx` — Main screen, overlays, D-pad. Layout and copy.
3. `components/Grid.tsx` — Grid rendering, animations, flash overlay.
4. `app.json` — Expo configuration.
