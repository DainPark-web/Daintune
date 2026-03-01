import React, { useState, useEffect } from 'react'
import { render } from 'ink'
import MenuPage from './pages/MenuPage.js'
import { Page, Track } from './types.js'
import SearchPage from './pages/SearchPage.js'
import LibraryPage, { INITIAL_PLAYLISTS, Playlist } from './pages/LibraryPage.js'
import NowPlayingPage from './pages/NowPlayingPage.js'
import SettingsPage, { INITIAL_SETTINGS } from './pages/SettingsPage.js'
import { loadPlaylists, savePlaylists, loadSettings, saveSettings } from './storage.js'
import { usePlayback } from './hooks/usePlayback.js'
import { stopPlayback } from './player.js'

const App = () => {
  const [page, setPage] = useState<Page>('menu')
  const [settings, setSettings] = useState(loadSettings() ?? INITIAL_SETTINGS)
  const [playlists, setPlaylists] = useState<Playlist[]>(loadPlaylists() ?? INITIAL_PLAYLISTS)

  useEffect(() => { savePlaylists(playlists) }, [playlists])
  useEffect(() => { saveSettings(settings) }, [settings])
  useEffect(() => () => stopPlayback(), [])

  // 라이브러리에서 왔을 때 복귀 정보
  const [fromLibrary, setFromLibrary] = useState(false)
  const [libPlaylistIndex, setLibPlaylistIndex] = useState(0)

  const repeat       = settings.find(s => s.label === 'Repeat')?.value ?? false
  const shuffle      = settings.find(s => s.label === 'Shuffle')?.value ?? false
  const autoplayNext = settings.find(s => s.label === 'Autoplay next track')?.value ?? false

  const playback = usePlayback({ repeat, shuffle, autoplayNext })

  const miniPlayer = {
    activeTrack: playback.state.activeTrack,
    status: playback.state.status,
  }

  // search 결과 전체를 큐로 재생
  const handlePlay = (tracks: Track[], index: number) => {
    playback.actions.start(tracks, index)
    setFromLibrary(false)
    setPage('nowPlaying')
  }

  // 라이브러리 플레이리스트에서 재생
  const handlePlayPlaylist = (tracks: Track[], trackIndex: number, playlistIndex: number) => {
    playback.actions.start(tracks, trackIndex)
    setFromLibrary(true)
    setLibPlaylistIndex(playlistIndex)
    setPage('nowPlaying')
  }

  const handleNowPlayingBack = () => {
    if (fromLibrary) {
      setPage('library')
    } else {
      setPage('menu')
    }
  }

  const handleAddPlaylist = (name: string) =>
    setPlaylists(prev => [...prev, { name, tracks: [] }])

  const handleRemovePlaylist = (index: number) =>
    setPlaylists(prev => prev.filter((_, i) => i !== index))

  const handleRemoveTrack = (playlistIndex: number, trackIndex: number) =>
    setPlaylists(prev => prev.map((pl, i) =>
      i === playlistIndex ? { ...pl, tracks: pl.tracks.filter((_, ti) => ti !== trackIndex) } : pl
    ))

  const handleAddToPlaylist = (track: Track, playlistIndex: number) =>
    setPlaylists(prev => prev.map((pl, i) =>
      i === playlistIndex ? { ...pl, tracks: [...pl.tracks, track] } : pl
    ))

  if (page === 'menu')       return <MenuPage miniPlayer={miniPlayer} onNavigate={(p) => {
    if (p === 'library') { setFromLibrary(false); setLibPlaylistIndex(0) }
    setPage(p)
  }} />
  if (page === 'search')     return <SearchPage miniPlayer={miniPlayer} playlists={playlists} onAddToPlaylist={handleAddToPlaylist} onBack={() => setPage('menu')} onPlay={handlePlay} />
  if (page === 'library')    return <LibraryPage miniPlayer={miniPlayer} playlists={playlists} onAddPlaylist={handleAddPlaylist} onRemovePlaylist={handleRemovePlaylist} onRemoveTrack={handleRemoveTrack} onPlayPlaylist={handlePlayPlaylist} initialPlaylistIndex={libPlaylistIndex} initialMode={fromLibrary ? 'tracks' : 'playlists'} onBack={() => { setFromLibrary(false); setPage('menu') }} />
  if (page === 'nowPlaying') return <NowPlayingPage playbackState={playback.state} playbackActions={playback.actions} repeat={repeat} shuffle={shuffle} autoplayNext={autoplayNext} playlists={playlists} onAddToPlaylist={handleAddToPlaylist} onBack={handleNowPlayingBack} />
  if (page === 'settings')   return <SettingsPage miniPlayer={miniPlayer} settings={settings} onToggle={i => setSettings(prev => prev.map((s, idx) => idx === i ? { ...s, value: !s.value } : s))} onBack={() => setPage('menu')} />

  return <MenuPage miniPlayer={miniPlayer} onNavigate={setPage} />
}

render(<App />)
