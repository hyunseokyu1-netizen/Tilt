---
title: 개인 최고 기록 리더보드 추가
---
# 개인 최고 기록 리더보드

## What & Why
게임 화면에 개인 최고 점수를 저장하고 표시하는 기능 추가. AsyncStorage를 사용하여 기기에 점수를 영구 저장. 유저가 자신의 기록을 추적하고 개선 동기를 얻을 수 있도록 한다.

## Done looks like
- 게임 오버 시 최고 점수가 갱신되면 "NEW BEST!" 표시
- 게임 오버 화면에 현재 점수와 최고 점수를 함께 표시
- 게임 헤더 또는 시작 화면에 최고 점수 표시
- 앱을 종료하고 다시 열어도 최고 점수가 유지됨

## Out of scope
- 글로벌 리더보드 (서버/DB 필요)
- 유저 인증
- 점수 히스토리 (최근 N회 기록)

## Steps
1. **AsyncStorage 점수 저장** — 게임 오버 시 현재 점수가 저장된 최고 점수보다 높으면 AsyncStorage에 업데이트
2. **GameContext 확장** — highScore 상태와 isNewBest 플래그를 GameContext에 추가하고, 앱 시작 시 AsyncStorage에서 최고 점수 로드
3. **게임 오버 UI 업데이트** — 게임 오버 오버레이에 최고 점수 표시, 신기록 달성 시 "NEW BEST!" 강조 표시
4. **시작 화면 UI 업데이트** — 아이들 오버레이에 최고 점수 표시 (기록이 있는 경우)

## Relevant files
- `artifacts/mobile/contexts/GameContext.tsx`
- `artifacts/mobile/app/(tabs)/index.tsx`