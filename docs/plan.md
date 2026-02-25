# YouTube Music CLI Player - 개발 계획

## 개요

터미널에서 명령어 하나로 YouTube 음악을 검색하고 재생하는 CLI 프로그램

## 전체 아키텍처

```
명령어 입력 (예: gmusic)
        ↓
Ink TUI 실행
        ↓
┌─────────────────────────┐
│  검색창 → YouTube 검색   │
│  검색결과 목록 표시       │
│  선택 → 오디오 스트림    │
│  재생바 / 볼륨 / 컨트롤  │
└─────────────────────────┘
```

## 기술 스택

| 역할 | 라이브러리 | 이유 |
|---|---|---|
| TUI 화면 | `ink` + `react` | 인터랙티브 UI |
| YouTube 검색 | `ytsr` | YouTube 검색 API 없이 검색 |
| 오디오 스트림 URL 추출 | `yt-dlp` (외부 바이너리) | 가장 안정적 |
| 오디오 재생 | `mpv` (외부 바이너리) | Node.js에서 직접 재생 한계 있음 |
| mpv 제어 | `node-mpv` | Node.js ↔ mpv IPC 통신 |

### 왜 mpv + yt-dlp 조합인가?

- Node.js 자체로 오디오 재생 → 매우 복잡하고 불안정
- mpv가 yt-dlp 내장 지원 → URL만 넘기면 알아서 스트리밍 재생
- Node.js는 IPC로 mpv를 제어하는 역할만 담당

## 폴더 구조

```
gmusic/
├── src/
│   ├── index.js          # 진입점 (shebang)
│   ├── app.jsx           # 메인 Ink 앱
│   ├── components/
│   │   ├── SearchBar.jsx  # 검색창
│   │   ├── TrackList.jsx  # 검색결과 목록
│   │   └── Player.jsx     # 재생바 (제목, 진행률, 볼륨)
│   ├── hooks/
│   │   └── usePlayer.js   # mpv 제어 로직
│   └── utils/
│       └── search.js      # ytsr 검색 래퍼
├── package.json
└── README.md
```

## 화면 흐름

```
┌─────────────────────────────┐
│ 🎵 gmusic                   │
│                              │
│ Search: [lofi hip hop_    ]  │  ← 타이핑
│                              │
│  1. Lofi Hip Hop Radio       │
│  2. ChilledCow - lofi beats  │  ← 방향키로 선택
│▶ 3. Study Music Mix          │
│  4. ...                      │
│                              │
│ ──────────────────────────── │
│ ▶ Study Music Mix  02:34/∞   │  ← 재생바
│ Vol: ████░░  [space]pause    │
└─────────────────────────────┘
```

## 선행 조건

사용자 환경에 아래 바이너리가 설치되어 있어야 함

```bash
brew install mpv yt-dlp   # macOS
apt install mpv yt-dlp    # Linux
```

- 프로그램 시작 시 자동으로 설치 여부 체크
- 없으면 설치 안내 메시지 출력 후 종료

## 개발 순서

1. 프로젝트 세팅 - Ink 기본 뼈대, bin 등록
2. 검색 기능 - ytsr로 키워드 검색 → 목록 표시
3. 재생 기능 - mpv에 URL 넘겨서 오디오 재생
4. 컨트롤 - 일시정지, 스킵, 볼륨 조절
5. npm 배포 - package.json 정리 후 publish

## npm 배포 준비

`package.json` 필수 항목:

```json
{
  "name": "gmusic",
  "version": "1.0.0",
  "description": "YouTube Music CLI Player",
  "bin": {
    "gmusic": "./src/index.js"
  },
  "files": ["src"],
  "engines": {
    "node": ">=18"
  }
}
```

배포 명령어:

```bash
npm login
npm publish
```
