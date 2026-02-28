# Search → Now Playing 흐름

## 전체 구조

```
index.tsx (App)
├── MenuPage
├── SearchPage      ← 검색
├── NowPlayingPage  ← 재생
├── LibraryPage
└── SettingsPage
```

`App`이 `page` state와 `currentTrack` state를 들고 있고,
페이지 전환은 모두 여기서 일어남.

---

## 1단계 — 검색 (SearchPage)

### 흐름

```
유저가 검색어 입력 후 Enter
    ↓
yts(query)  [yt-search npm 패키지]
    ↓
YouTube에 HTTP 요청 → 검색 결과 파싱
    ↓
결과 최대 10개를 Track[] 로 변환
    { title, artist, duration, youtubeId }
    ↓
목록 렌더링
```

### 코드 위치
`src/pages_ex/SearchPage.tsx` — `runSearch()`

```ts
const res = await yts(q)
const tracks: Track[] = res.videos.slice(0, 10).map((item) => ({
  title: item.title,
  artist: item.author.name,
  duration: item.seconds,
  youtubeId: item.videoId,   // ← 이게 핵심, 나중에 mpv에 넘겨짐
}))
```

### yt-search 역할
- YouTube 검색 결과 페이지를 파싱해서 videoId, 제목, 채널명, 길이를 반환
- 별도 API 키 불필요
- npm dependency → 유저가 직접 설치할 필요 없음

---

## 2단계 — 페이지 전환 (index.tsx)

유저가 결과 목록에서 Enter를 누르면:

```ts
// SearchPage.tsx
onPlay(results[selected])   // Track 객체를 App으로 전달

// index.tsx
const handlePlay = (track: Track) => {
  setCurrentTrack(track)    // track 저장
  setPage('nowPlaying')     // 페이지 전환
}
```

`App`이 `NowPlayingPage`에 `track` prop으로 내려줌.

---

## 3단계 — 재생 (NowPlayingPage + player.ts)

### 흐름

```
NowPlayingPage 마운트
    ↓
useEffect → startPlayback(track.youtubeId, callbacks)
    ↓
player.ts: mpv 프로세스 spawn
  mpv --no-video https://youtube.com/watch?v={youtubeId}
    ↓
mpv 내부에서 yt-dlp 자동 호출
  yt-dlp가 YouTube URL → 실제 스트림 URL 추출
    ↓
mpv가 스트림 URL로 오디오 재생 시작
    ↓
IPC 소켓 연결 (/tmp/gmusic-mpv.sock)
  time-pos 이벤트 구독 → onPosition(초) 콜백
  end-file 이벤트 → onEnd() 콜백
    ↓
NowPlayingPage: progress bar 업데이트, status 관리
```

### 코드 위치
`src/player.ts` — `startPlayback()`
`src/pages_ex/NowPlayingPage.tsx` — `useEffect`

```ts
// NowPlayingPage.tsx
startPlayback(track.youtubeId, {
  onPosition: (pos) => {
    setProgress(pos)                              // 프로그레스 바 갱신
    setStatus((s) => s === 'loading' ? 'playing' : s)  // 첫 수신 시 playing으로
  },
  onEnd: () => setStatus('ended'),
  onError: (msg) => { setError(msg); setStatus('error') },
})
```

### 각 도구 역할 요약

| 도구 | 위치 | 역할 |
|------|------|------|
| **yt-search** | npm dep | 검색어 → videoId 변환 |
| **mpv** | 시스템 바이너리 | 오디오 재생, IPC 제어 |
| **yt-dlp** | 시스템 바이너리 | YouTube URL → 스트림 URL (mpv가 내부 호출) |

---

## 전체 데이터 흐름 요약

```
"검색어"
    ↓  yt-search
videoId  (e.g. dQw4w9WgXcQ)
    ↓  mpv spawn
mpv → yt-dlp → 실제 스트림 URL
    ↓
🎵 오디오 재생
    ↓  IPC 소켓
time-pos → progress bar 업데이트
end-file → status = 'ended'
```

---

## 컨트롤

| 키 | 동작 | 구현 |
|----|------|------|
| `Space` | 일시정지 / 재개 | `pausePlayback()` / `resumePlayback()` — IPC로 mpv에 명령 전송 |
| `r` | 처음부터 다시 재생 | `startPlayback()` 재호출 |
| `Esc` | 재생 중지 후 메뉴로 | `stopPlayback()` — mpv 프로세스 kill |
