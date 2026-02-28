# daintune

A terminal-based YouTube music player. Search and play music directly from your command line — no browser needed.

Built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs) and powered by `mpv`.

---

## Prerequisites

daintune requires two system tools to be installed:

### macOS
```bash
brew install mpv yt-dlp
```

### Ubuntu / Debian
```bash
sudo apt install mpv
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### Windows

Not currently supported (requires Unix socket support).

---

## Installation

```bash
npm install -g daintune
```

All npm dependencies (including YouTube search) are installed automatically.

---

## Usage

```bash
daintune
```

### Navigation

| Key        | Action         |
|------------|----------------|
| `↑` / `↓` | Move selection |
| `Enter`    | Confirm / Play |
| `Esc`      | Go back        |
| `Space`    | Pause / Resume |
| `r`        | Restart track  |
| `q`        | Quit           |

---

## Features

- YouTube music search from the terminal
- Audio-only playback via `mpv` (no video, no browser)
- Keyboard-driven TUI interface
- Minimal and fast

---

## Tech Stack

- [Ink](https://github.com/vadimdemedes/ink) — React-based terminal UI
- [yt-search](https://github.com/talmobi/yt-search) — YouTube search (installed automatically)
- [mpv](https://mpv.io/) — Audio playback
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — YouTube stream extraction (used internally by mpv)

---

## License

MIT © Dain Park
