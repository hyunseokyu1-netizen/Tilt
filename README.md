# Tilt

A mobile arcade puzzle game built with Expo React Native. Navigate a small box through a 3×3 grid to reach the glowing target cell by tilting your phone. Each successful clear shortens the timer — how long can you keep up?

## Gameplay

- **Move**: Tilt the phone (or tap D-pad arrows on web)
- **Goal**: Reach the neon green target cell before time runs out
- **Scoring**: Each target reached earns +1 point and resets the timer — but slightly shorter than before
- **Game Over**: Timer hits 0

### Difficulty Scaling

| Round | Timer |
|-------|-------|
| 1 | 5000ms |
| 2 | 4800ms |
| … | … |
| 20+ | 1200ms (minimum) |

## Tech Stack

- **Framework**: Expo SDK 54 + Expo Router (file-based routing)
- **Language**: TypeScript (strict)
- **Sensors**: `expo-sensors` — Accelerometer at ~80ms intervals
- **Haptics**: `expo-haptics` — Impact + notification feedback
- **Persistence**: `@react-native-async-storage/async-storage`
- **Animation**: React Native `Animated` API (`useNativeDriver`)
- **Web fallback**: D-pad UI when accelerometer is unavailable
- **Package manager**: pnpm workspace (monorepo)

## Project Structure

```
.
├── artifacts/
│   ├── mobile/              # Expo React Native app
│   │   ├── app/             # Expo Router screens
│   │   │   └── (tabs)/index.tsx   # Main game screen
│   │   ├── components/
│   │   │   ├── Grid.tsx           # 3×3 grid + player + target
│   │   │   ├── TimerBar.tsx       # Countdown bar
│   │   │   └── CircuitLines.tsx   # Decorative background
│   │   ├── contexts/
│   │   │   └── GameContext.tsx    # All game state & logic
│   │   └── constants/colors.ts
│   └── api-server/          # Express 5 backend (WIP)
├── lib/
│   ├── db/                  # Drizzle ORM + PostgreSQL
│   ├── api-spec/            # OpenAPI specification
│   ├── api-zod/             # Auto-generated Zod schemas
│   └── api-client-react/    # Auto-generated React Query client
└── docs/
    └── PROJECT.md           # Full design doc
```

## Running Locally

**Prerequisites**: Node 20+, pnpm 9+, Expo Go app on your device

```bash
# Install dependencies
pnpm install

# Start the Expo dev server
pnpm --filter @workspace/mobile run dev
```

Scan the QR code with Expo Go (iOS/Android) or press `w` to open in browser.

## Features

- [x] Accelerometer tilt controls + web D-pad fallback
- [x] Progressive difficulty (timer shortens each round)
- [x] Haptic feedback — move, wall bump, target reached, game over
- [x] Personal best score (persisted across sessions)
- [x] Game history
- [x] Cell flash effect on target reach
- [ ] Global leaderboard with nicknames
- [ ] Score trend chart
- [ ] Full-screen flash effect

## Visual Design

Dark navy theme (`#0B1622`) with neon green targets, cyan grid borders, and circuit-trace background decorations.

The **TILT** title uses four colors: T (orange `#FF6B35`), I (yellow `#FFD700`), L (cyan `#00C4FF`), T (neon green `#00FFB3`).
