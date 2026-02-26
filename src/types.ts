export type Page = 'menu' | 'search' | 'library' | 'nowPlaying' | 'settings'

export interface Track {
  title: string
  artist: string
  duration: number // seconds
}
