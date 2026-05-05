---
title: 목표 도달 시 셀 깜박임 효과 추가
---
# 목표 도달 시 셀 깜박임 효과

## What & Why
플레이어가 목표 셀에 도착했을 때 시각적 피드백이 없어서 통과 느낌이 약하다. 도달한 셀이 색이 바뀌면서 짧게 깜박이는 "클리어" 이펙트를 추가하여 성공한 느낌을 강화한다.

## Done looks like
- 플레이어가 목표 셀에 도달하면 해당 셀이 밝은 색(예: 흰색 또는 밝은 노란색)으로 순간 번쩍이고, 빠르게 페이드아웃되면서 다음 라운드로 넘어감
- 깜박임은 약 200~300ms 정도의 짧은 플래시로 게임 흐름을 끊지 않아야 함
- 플래시 동안 셀 배경색이 바뀌고 glow 효과가 퍼지는 느낌

## Out of scope
- 파티클/폭발 이펙트
- 사운드 효과
- 플래시 동안 게임 일시정지

## Steps
1. **GameContext에 플래시 상태 추가** — handleReach에서 플래시가 발생한 셀 인덱스(flashIndex)를 잠깐 설정하고, 짧은 딜레이 후 null로 리셋. 새 타겟 설정은 플래시 직후에 수행
2. **Grid 컴포넌트에 플래시 애니메이션 추가** — flashIndex와 일치하는 셀에 밝은 배경색 + opacity 페이드아웃 애니메이션 적용. Animated API 사용

## Relevant files
- `artifacts/mobile/contexts/GameContext.tsx:96-112`
- `artifacts/mobile/components/Grid.tsx`