export type Page = 'menu' | 'search' | 'library' | 'nowPlaying' | 'settings' | 'pomodoro'

export interface Track {
  title: string
  artist: string
  duration: number // seconds
  youtubeId?: string
  lyrics?: string
}
