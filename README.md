# Daintune


A terminal-based YouTube music player. Search, organize, and play music directly from your command line — no browser needed.

Built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs) and powered by `mpv`.

---

## Prerequisites

Daintune requires two system tools:

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

All npm dependencies are installed automatically.

---

## Usage

```bash
daintune
```

---

## Features

- **Search** — Search YouTube and play audio instantly
- **Library** — Organize tracks into playlists; create, delete, and manage them
- **Queue** — Search results and playlists play as a continuous queue
- **Settings** — Toggle Repeat, Shuffle, and Autoplay Next per session

---

## Keybindings

### General

| Key        | Action              |
|------------|---------------------|
| `↑` / `↓` | Move selection      |
| `Enter`    | Confirm / Play      |
| `Esc`      | Go back             |

### Now Playing

| Key     | Action                        |
|---------|-------------------------------|
| `Space` | Pause / Resume                |
| `r`     | Restart current track         |
| `n`     | Skip to next track in queue   |
| `a`     | Add current track to playlist |
| `Esc`   | Back to previous screen       |

### Library

| Key     | Action                  |
|---------|-------------------------|
| `Enter` | Open playlist / Play    |
| `c`     | Create new playlist     |
| `r`     | Remove selected item    |
| `Esc`   | Go back                 |

### Search

| Key     | Action                        |
|---------|-------------------------------|
| `Enter` | Play from selected result     |
| `a`     | Add to playlist               |
| `Esc`   | Back to search input / Menu   |

---

## Tech Stack

- [Ink](https://github.com/vadimdemedes/ink) — React-based terminal UI
- [yt-search](https://github.com/talmobi/yt-search) — YouTube search
- [mpv](https://mpv.io/) — Audio playback
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — YouTube stream extraction

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

---

## License

MIT + Commons Clause © Dain Park — see [LICENSE](LICENSE) for details.

Free for personal and educational use. Commercial use, resale, or monetization is not permitted.
