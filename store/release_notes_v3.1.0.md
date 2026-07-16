# Release Notes — v3.1.0

Google Play Console → 프로덕션 → "이 버전의 새로운 기능" 입력란에 언어별로 붙여넣기.
(각 500자 제한 — 아래 문구는 모두 여유 있음)

---

## 한국어 (ko-KR)

리더보드를 기기 로컬 저장 방식으로 전환했습니다.

- 점수와 닉네임이 서버 없이 기기에만 저장됩니다
- 인터넷 연결 없이도 리더보드를 기록하고 확인할 수 있습니다
- 개인정보 처리 방식이 더 단순하고 안전해졌습니다

---

## English (en-US)

The leaderboard now saves entirely on your device.

- Your name and score are stored locally — no server involved
- Works fully offline, no internet connection required
- Simpler and more private by design

---

## 배경 (내부 참고용, 스토어 미게시)

Supabase 무료 요금제는 30일간 사용이 없으면 프로젝트가 일시 정지되어, 실사용자가 거의 없는 이 앱에서는
글로벌 리더보드가 자주 오작동하는 문제가 있었습니다. 이를 근본적으로 해결하기 위해 리더보드를
AsyncStorage 기반 로컬 저장 방식으로 전환했습니다. 자세한 변경 내역은 `CHANGELOG.md`의 v3.1.0 항목을 참고하세요.
