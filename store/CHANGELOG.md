# TILT — 버전별 변경 사항

---

## v3.1.0 (2026-07-17)

### 변경
- 리더보드를 Supabase 기반 글로벌 리더보드에서 기기 로컬 리더보드로 전환
  - Supabase 무료 요금제가 30일 미사용 시 프로젝트를 일시 정지시키는 문제 해소
  - 점수·닉네임은 기기에만 저장되며 외부 서버로 전송되지 않음
  - 인터넷 연결 없이도 순위 기록 및 열람 가능

### 제거
- Supabase 연동 및 `@supabase/supabase-js` 의존성 제거
- 인터넷 권한 요구사항 제거 (앱 접근 권한: 가속도계만 필요)

### 빌드
- versionCode: 4
- versionName: 3.1.0
- AAB: `~/Documents/workspace/apk_build_files/tilt/v3.1/app-release.aab`

---

## v3.0.0 (2026-05-22)

### 수정
- 플레이어 마커 스타일 변경 (튜토리얼 화면과 동일하게 통일)
- 플레이어 마커 크기 조정 (28×28 → 32×32px)

### 빌드
- versionCode: 3
- versionName: 3.0.0
- AAB: `~/Documents/workspace/apk_build_files/tilt/v3.0/app-release.aab`

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
