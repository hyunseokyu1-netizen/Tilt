---
title: TILT — The Maze Puzzle
date: '2026-05-15'
description: 스마트폰을 기울여 3×3 그리드를 탐색하는 접근성 중심 퍼즐 게임. 시각장애인도 음성 안내만으로 완전히 플레이 가능.
tags:
  - React Native
  - Expo
  - Supabase
  - Android
  - Accessibility
category: portfolio
github: https://github.com/hyunseokyu1-netizen/Tilt
platform: Android (Google Play Store)
tech:
  - Expo / React Native
  - TypeScript
  - Supabase (PostgreSQL)
  - expo-speech / expo-sensors / expo-audio
status: released
version: 2.0.0
---

![TILT Feature Graphic](https://raw.githubusercontent.com/hyunseokyu1-netizen/Tilt/main/store/feature_graphic.png)

# TILT — The Maze Puzzle

> 스마트폰을 기울여 3×3 그리드를 탐색하는 반응 속도 퍼즐 게임.  
> 시각장애인도 음성 안내만으로 완전히 플레이할 수 있도록 설계했습니다.

---

## 개요

TILT는 가속도계(기울기 센서)를 활용한 모바일 퍼즐 게임입니다. A1–C3로 표기되는 3×3 좌표 그리드에서 마커를 목표 칸으로 이동시키는 단순한 규칙이지만, 라운드가 거듭될수록 타이머가 짧아져 반응 속도를 끊임없이 압박합니다.

시작부터 **시각장애인을 포함한 모든 사용자**가 동등하게 플레이할 수 있도록 설계하는 것이 핵심 목표였습니다.

---

## 스크린샷

<div style="display: flex; gap: 12px; flex-wrap: wrap;">

![메인 메뉴](https://raw.githubusercontent.com/hyunseokyu1-netizen/Tilt/main/store/screenshot_1_menu.png)
![게임플레이](https://raw.githubusercontent.com/hyunseokyu1-netizen/Tilt/main/store/screenshot_2_gameplay.png)
![게임오버 / 리더보드](https://raw.githubusercontent.com/hyunseokyu1-netizen/Tilt/main/store/screenshot_3_gameover.png)

</div>

---

## 주요 기능

### 🎮 게임플레이
- 스마트폰 기울기로 마커 이동 (가속도계)
- 웹에서는 방향키로 조작 가능
- 라운드마다 타이머 단축 (5000ms → 최소 1200ms)
- 이동 쿨다운으로 오입력 방지 (380ms)

### 🔊 접근성
- 매 라운드 현재 위치와 목표를 TTS로 안내 (`"B2 to C1"`)
- 동적 메트로놈: 남은 시간에 따라 60–180 BPM으로 박자 변화
- 이동 / 벽 충돌 / 라운드 완료 시 햅틱 피드백
- 음성 안내 ON/OFF 토글

### 🏆 글로벌 리더보드
- Supabase 실시간 리더보드
- 순차 순위 (score DESC → 플레이 시간 ASC → 등록 순)
- 상위 5위 + 내 순위 주변 ±3행 동시 표시
- 제출 전 ghost "— (me)" 행으로 내 예상 순위 미리 표시

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

---

## 아키텍처

```
app/
├── (tabs)/index.tsx       # 전체 UI (메뉴, 게임, 게임오버, 리더보드)
├── contexts/
│   └── GameContext.tsx    # 게임 상태 전체 관리 (phase, score, timer, ranking)
├── components/
│   ├── Grid.tsx           # 3×3 그리드 렌더링
│   ├── TimerBar.tsx       # 타이머 프로그레스 바
│   ├── TutorialOverlay.tsx# 온보딩 튜토리얼 (3단계 애니메이션)
│   └── CircuitLines.tsx   # 배경 회로 패턴
├── utils/
│   ├── ranking.ts         # 순차 순위 계산 (applyRank)
│   └── coords.ts          # 인덱스 ↔ 좌표 변환 (0→A1, 4→B2 ...)
└── lib/
    └── supabase.ts        # Supabase 클라이언트 + 환경변수 guard
```

---

## 개발 포인트

**1. 비동기 로딩 상태 관리**  
DB 미연결 시 스피너가 무한히 도는 버그를 `isLoadingRankings` 상태 플래그로 해결. fetch 라이프사이클을 데이터 유무가 아닌 명시적 플래그로 관리.

**2. 순위 시스템 설계**  
동점자 처리를 DENSE_RANK에서 완전 순차 순위(ROW_NUMBER)로 전환. 정렬 기준: 점수 DESC → 플레이 시간 ASC → 등록 시각 ASC. 제출 전 사용자의 예상 순위를 ghost row로 미리 보여줌.

**3. 접근성 우선 설계**  
그리드 좌표(A1–C3)를 TTS로 읽어주는 구조로, 화면을 보지 않고도 완전한 플레이가 가능. 메트로놈 BPM을 남은 시간에 비례해 실시간으로 조절해 시각 정보 없이도 긴박감 전달.

---

## 릴리즈

| 버전 | 날짜 | 주요 변경 |
|------|------|-----------|
| v1.0.0 | 2026-05-09 | 최초 릴리즈 |
| v2.0.0 | 2026-05-13 | 온보딩 튜토리얼, 영/한 다국어 지원 |

- **패키지명:** `com.backdev.tilt`
- **플랫폼:** Android (Google Play Store)
- **GitHub:** [hyunseokyu1-netizen/Tilt](https://github.com/hyunseokyu1-netizen/Tilt)

---

## 앱 아이콘

![TILT 아이콘](https://raw.githubusercontent.com/hyunseokyu1-netizen/Tilt/main/store/icon.png)
