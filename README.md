![TILT Feature Graphic](https://raw.githubusercontent.com/hyunseokyu1-netizen/Tilt/main/store/feature_graphic.png)

<div align="center">

# TILT — The Maze Puzzle

**A fast-paced sensor puzzle game designed for everyone, including visually impaired players.**

[![Android](https://img.shields.io/badge/Platform-Android-3DDC84?logo=android&logoColor=white)](https://github.com/hyunseokyu1-netizen/Tilt)
[![Expo](https://img.shields.io/badge/Built%20with-Expo-000020?logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

[한국어](#한국어) | English

</div>

---

## Overview

Tilt your phone to guide a marker across a **3×3 coordinate grid (A1–C3)**. Reach the glowing target cell before the timer expires. Every successful move speeds up the clock — pushing your reaction time to its limit.

Built with accessibility as a first-class concern. TILT is **fully playable without looking at the screen**.

---

## Screenshots

<div align="center">

| Main Menu | Gameplay | Game Over / Leaderboard |
|:---------:|:--------:|:-----------------------:|
| ![Menu](https://raw.githubusercontent.com/hyunseokyu1-netizen/Tilt/main/store/screenshot_1_menu.png) | ![Gameplay](https://raw.githubusercontent.com/hyunseokyu1-netizen/Tilt/main/store/screenshot_2_gameplay.png) | ![Gameover](https://raw.githubusercontent.com/hyunseokyu1-netizen/Tilt/main/store/screenshot_3_gameover.png) |

</div>

---

## Features

### 🎮 Gameplay
- Tilt your phone to move the marker (accelerometer)
- Arrow D-pad fallback on web
- Timer shortens every round — from 5000ms down to 1200ms minimum
- 380ms move cooldown to prevent misreads

### 🔊 Accessibility
- TTS coordinate announcements every round (`"B2 to C1"`)
- Dynamic metronome: 60–180 BPM scaling with remaining time
- Haptic feedback for moves, wall collisions, and completions
- Audio guidance toggle (ON/OFF)

### 🏆 Global Leaderboard
- Live leaderboard powered by Supabase
- Sequential ranking: score DESC → play time ASC → registration order
- Shows top 5 + ±3 rows around your rank simultaneously
- Ghost "— (me)" row previews your rank before submission

### 📖 Onboarding Tutorial
- 3-step interactive tutorial on first launch
- Auto-detects device language (Korean / English)
- Replay anytime via `?` button on the main menu

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Expo (React Native) |
| Language | TypeScript |
| Backend | Supabase (PostgreSQL) |
| Sensors | expo-sensors (Accelerometer) |
| Audio | expo-audio, expo-speech |
| Haptics | expo-haptics |
| Local Storage | AsyncStorage |
| i18n | expo-localization |
| Build | Gradle (Android AAB) |
| Package Manager | pnpm (monorepo) |

---

## Project Structure

```
artifacts/mobile/
├── app/
│   ├── _layout.tsx              # Root layout, font loading, GameProvider
│   └── (tabs)/index.tsx         # All screens (menu, game, gameover, leaderboard)
├── components/
│   ├── Grid.tsx                 # 3×3 grid rendering
│   ├── TimerBar.tsx             # Countdown progress bar
│   ├── TutorialOverlay.tsx      # 3-step onboarding (animated)
│   └── CircuitLines.tsx         # Decorative circuit background
├── contexts/
│   └── GameContext.tsx          # All game state, timer, sensors, ranking
├── utils/
│   ├── ranking.ts               # Sequential rank calculation
│   └── coords.ts                # Index ↔ coordinate (0→A1, 4→B2...)
└── lib/
    └── supabase.ts              # Supabase client with env guard

store/
├── icon.png                     # App icon (512×512)
├── feature_graphic.png          # Feature graphic (1024×500)
├── screenshot_*.png             # Store screenshots
├── listing_en.md                # English store listing
├── listing_ko.md                # Korean store listing
├── CHANGELOG.md                 # Version history
└── portfolio.md                 # Portfolio description
```

---

## Running Locally

**Prerequisites:** Node 20+, pnpm 9+, Expo Go app

```bash
# Install dependencies
pnpm install

# Start Expo dev server
pnpm --filter @workspace/mobile run dev
```

Scan the QR code with Expo Go or press `w` for browser.

---

## Release History

| Version | Date | Changes |
|---------|------|---------|
| v2.0.0 | 2026-05-13 | Onboarding tutorial, Korean/English i18n, help button |
| v1.0.0 | 2026-05-09 | Initial release |

**Package:** `com.backdev.tilt`

---

---

<div align="center">

# 한국어

</div>

---

## 개요

스마트폰을 기울여 **3×3 좌표 그리드(A1–C3)**에서 마커를 목표 칸으로 이동시키는 퍼즐 게임입니다. 타이머가 만료되기 전에 빛나는 칸에 도달하세요. 성공할수록 타이머가 짧아져 반응 속도를 끊임없이 압박합니다.

**시각장애인을 포함한 모든 사용자**가 화면 없이도 완전히 플레이할 수 있도록 접근성을 최우선으로 설계했습니다.

---

## 주요 기능

### 🎮 게임플레이
- 스마트폰 기울기로 마커 이동 (가속도계)
- 웹에서는 방향키 D-패드로 조작
- 라운드마다 타이머 단축 (5000ms → 최소 1200ms)
- 오입력 방지 이동 쿨다운 (380ms)

### 🔊 접근성
- 매 라운드 TTS 좌표 안내 (`"B2에서 C1로"`)
- 동적 메트로놈: 남은 시간에 따라 60–180 BPM으로 박자 변화
- 이동 / 벽 충돌 / 라운드 완료 시 햅틱 피드백
- 음성 안내 ON/OFF 토글

### 🏆 글로벌 리더보드
- Supabase 기반 실시간 리더보드
- 순차 순위 (점수 DESC → 플레이 시간 ASC → 등록 순)
- 상위 5위 + 내 순위 주변 ±3행 동시 표시
- 제출 전 ghost "— (me)" 행으로 예상 순위 미리 확인

### 📖 온보딩 튜토리얼
- 첫 실행 시 3단계 인터랙티브 튜토리얼
- 기기 언어 자동 감지 (한국어 / 영어)
- 메인 메뉴 `?` 버튼으로 언제든 재열람

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Expo (React Native) |
| 언어 | TypeScript |
| 백엔드 | Supabase (PostgreSQL) |
| 센서 | expo-sensors (Accelerometer) |
| 오디오 | expo-audio, expo-speech |
| 햅틱 | expo-haptics |
| 로컬 저장소 | AsyncStorage |
| 국제화 | expo-localization |
| 빌드 | Gradle (Android AAB) |
| 패키지 매니저 | pnpm (모노레포) |

---

## 로컬 실행

**사전 준비:** Node 20+, pnpm 9+, Expo Go 앱

```bash
# 의존성 설치
pnpm install

# Expo 개발 서버 실행
pnpm --filter @workspace/mobile run dev
```

Expo Go로 QR코드 스캔 또는 `w` 키로 브라우저에서 확인.

---

## 릴리즈 이력

| 버전 | 날짜 | 주요 변경 |
|------|------|-----------|
| v2.0.0 | 2026-05-13 | 온보딩 튜토리얼, 영/한 다국어 지원, 도움말 버튼 |
| v1.0.0 | 2026-05-09 | 최초 릴리즈 |

**패키지명:** `com.backdev.tilt`  
**GitHub:** [hyunseokyu1-netizen/Tilt](https://github.com/hyunseokyu1-netizen/Tilt)
