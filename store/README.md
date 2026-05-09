# Google Play Store Assets — TILT: The Maze Puzzle

## 파일 목록

| 파일 | 용도 | 규격 |
|------|------|------|
| `icon.svg` | 앱 아이콘 | 512×512 px |
| `feature_graphic.svg` | 피처 그래픽 | 1024×500 px |
| `screenshot_1_menu.html` | 스크린샷 1 — 메인 메뉴 | 390×844 px |
| `screenshot_2_gameplay.html` | 스크린샷 2 — 게임플레이 | 390×844 px |
| `screenshot_3_gameover.html` | 스크린샷 3 — 게임오버/리더보드 | 390×844 px |
| `listing_en.md` | 영문 등록 정보 | — |
| `listing_ko.md` | 한국어 등록 정보 | — |
| `../docs/PRIVACY_POLICY.md` | 개인정보처리방침 (영/한) | GitHub 호스팅용 |

---

## 이미지 PNG 변환 방법

### 방법 1 — 브라우저에서 직접 저장 (추천)

**아이콘 / 피처 그래픽 (SVG → PNG):**
1. SVG 파일을 Chrome에서 열기
2. 우클릭 → "다른 이름으로 저장" → PNG 선택
   - 또는: 브라우저 주소창에 `file:///...절대경로.../icon.svg` 입력

**스크린샷 (HTML → PNG):**
1. Chrome에서 HTML 파일 열기
2. DevTools 열기 (F12 또는 Cmd+Opt+I)
3. 상단 Devices 아이콘 클릭 → **390×844** 사이즈 설정
4. Cmd+Shift+P → "Capture full size screenshot" 입력 → 실행
5. 저장된 PNG를 Play Console에 업로드

### 방법 2 — rsvg-convert (Homebrew 필요)

```bash
# librsvg 설치 (처음 한 번만)
brew install librsvg

# SVG → PNG 변환
rsvg-convert -w 512 -h 512 store/icon.svg -o store/icon.png
rsvg-convert -w 1024 -h 500 store/feature_graphic.svg -o store/feature_graphic.png
```

### 방법 3 — convert.sh 스크립트

```bash
chmod +x store/convert.sh
./store/convert.sh
```

---

## Google Play Console 등록 체크리스트

### 앱 정보
- [ ] 앱 이름 (영어): `TILT: The Maze Puzzle`
- [ ] 앱 이름 (한국어): `TILT: 미로 퍼즐`
- [ ] 짧은 설명 업로드 (`listing_en.md`, `listing_ko.md` 참고)
- [ ] 전체 설명 업로드
- [ ] 카테고리: **게임 › 퍼즐**

### 그래픽 자산
- [ ] 앱 아이콘 512×512 PNG 업로드
- [ ] 피처 그래픽 1024×500 PNG 업로드
- [ ] 스크린샷 최소 2장 업로드 (전화 기준)

### 개인정보처리방침
- [ ] GitHub 페이지에 `docs/PRIVACY_POLICY.md` 커밋 완료
- [ ] Play Console에 URL 입력:
  `https://github.com/hyunseokyu1-netizen/Tilt/blob/main/docs/PRIVACY_POLICY.md`

### 콘텐츠 등급
- [ ] 등급 설문 작성 → **전체 이용가 (Everyone)** 예상

### 앱 액세스
- [ ] 가속도계(모션 센서) 권한 고지
- [ ] 인터넷 권한 고지 (리더보드)

### 출시
- [ ] 내부 테스트 → 클로즈드 테스트 → 오픈 테스트 → 프로덕션 순서 권장
