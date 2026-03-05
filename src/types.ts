export type Page = 'menu' | 'search' | 'library' | 'nowPlaying' | 'settings' | 'pomodoro' | 'history'

export interface HistoryEntry {
  track: Track
  playedAt: number
}

export interface Track {
  title: string
  artist: string
  duration: number // seconds
  youtubeId?: string
  lyrics?: string
  ago?: string
}
