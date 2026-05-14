# TILT — 버전별 변경 사항

---

## v2.0.0 (2026-05-13)

### 추가
- 첫 실행 시 3단계 온보딩 튜토리얼
  - 1단계: 기울여서 이동 (플레이어 이동 애니메이션)
  - 2단계: 목표 칸에 도달 (타이머 바 애니메이션)
  - 3단계: 음성 안내 지원
- 기기 언어 자동 감지 (한국어 / 영어)
- 메인 메뉴 우측 상단 `?` 버튼 — 언제든 튜토리얼 재열람 가능

### 빌드
- versionCode: 2
- versionName: 2.0.0
- AAB: `~/Documents/workspace/apk_build_files/tilt/v2.0/app-release.aab`

---

## v1.0.0 (2026-05-09)

### 최초 릴리즈
- 3×3 그리드 퍼즐 게임 (A1–C3 좌표 시스템)
- 가속도계 기울기 조작 (웹: 방향키)
- 타이머 바 + 메트로놈 (60–180 BPM)
- 햅틱 피드백 (이동 / 벽 충돌 / 라운드 완료)
- TTS 음성 안내 (ON/OFF 토글)
- 글로벌 리더보드 (Supabase)
  - 순차 순위 (score DESC → total_play_time ASC → created_at ASC)
  - 상위 5위 + 내 순위 주변 ±3행 표시
  - 점수 제출 시 닉네임 등록
- DB 미연결 시 로딩 스피너 정상 종료
- 개인정보처리방침 (영/한)

### 빌드
- versionCode: 1
- versionName: 1.0.0
- AAB: `~/Documents/workspace/apk_build_files/tilt/v1.0/app-release.aab`
