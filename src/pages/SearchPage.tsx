import { Box, Text, useInput } from "ink"
import React, { useState, useEffect } from "react"
import Header from "../components/Header.js"
import Footer from "../components/Footer.js"
import TextInput from "ink-text-input"
import yts from "yt-search"
import { Track } from "../types.js"
import { Playlist } from "./LibraryPage.js"
import MiniPlayer from "../components/MiniPlayer.js"
import MiniTimer from "../components/MiniTimer.js"
import { PlaybackStatus } from "../hooks/usePlayback.js"
import { PomodoroStatus } from "../hooks/usePomodoro.js"

interface Props {
  playlists: Playlist[]
  onAddToPlaylist: (track: Track, playlistIndex: number) => void
  onBack: () => void
  onPlay: (tracks: Track[], index: number) => void
  miniPlayer: { activeTrack: Track | null; status: PlaybackStatus }
  miniTimer: { timeLeft: number; status: PomodoroStatus }
}

type Mode = 'input' | 'results' | 'addToPlaylist'

const SearchPage = ({ playlists, onAddToPlaylist, onBack, onPlay, miniPlayer, miniTimer }: Props) => {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<Mode>('input')
  const [results, setResults] = useState<Track[]>([])
  const [selected, setSelected] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlaylistForAdd, setSelectedPlaylistForAdd] = useState(0)
  const [addResult, setAddResult] = useState<{ type: 'added' | 'duplicate'; name: string } | null>(null)
  const [scrollOffset, setScrollOffset] = useState(0)

  const termRows = process.stdout.rows || 24
  const miniPlayerRows = (miniPlayer.status !== 'idle' && miniPlayer.activeTrack) ? 4 : 0
  const miniTimerRows  = miniTimer.status !== 'idle' ? 4 : 0
  // 기본 오버헤드: outer padding(2) + header(2) + gap(1) + list border(2) + query row+gap(2) + footer(1) + buffer(3) = 13
  const visibleCount = Math.min(results.length, Math.max(3, Math.floor((termRows - 13 - miniPlayerRows - miniTimerRows) / 2)))

  useEffect(() => {
    if (selected < scrollOffset) {
      setScrollOffset(selected)
    } else if (selected >= scrollOffset + visibleCount) {
      setScrollOffset(selected - visibleCount + 1)
    }
  }, [selected, visibleCount])

  const runSearch = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    setAddResult(null)
    try {
      const res = await yts(q)
      const tracks: Track[] = res.videos.slice(0, 10).map((item) => ({
        title: item.title,
        artist: item.author.name ?? 'Unknown',
        duration: item.seconds,
        youtubeId: item.videoId,
        ago: item.ago,
      }))
      setResults(tracks)
      setSelected(0)
      setScrollOffset(0)
      setMode('results')
    } catch (e: any) {
      setError(e.message ?? 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  useInput((_input, key) => {
    if (key.escape) onBack()
  }, { isActive: mode === 'input' })

  useInput((input, key) => {
    if (key.escape)    { setMode('input'); return }
    if (key.upArrow)   setSelected(s => Math.max(0, s - 1))
    if (key.downArrow) setSelected(s => Math.min(results.length - 1, s + 1))
    if (key.return && results.length > 0) onPlay(results, selected)
    if (input === 'a' && results.length > 0) {
      setSelectedPlaylistForAdd(0)
      setAddResult(null)
      setMode('addToPlaylist')
    }
  }, { isActive: mode === 'results' })

  useInput((_input, key) => {
    if (key.escape)    { setMode('results'); return }
    if (key.upArrow)   setSelectedPlaylistForAdd(prev => (prev - 1 + playlists.length) % playlists.length)
    if (key.downArrow) setSelectedPlaylistForAdd(prev => (prev + 1) % playlists.length)
    if (key.return) {
      const pl = playlists[selectedPlaylistForAdd]
      const track = results[selected]
      const isDuplicate = pl.tracks.some(t =>
        t.youtubeId ? t.youtubeId === track.youtubeId : t.title === track.title
      )
      if (isDuplicate) {
        setAddResult({ type: 'duplicate', name: pl.name })
      } else {
        onAddToPlaylist(track, selectedPlaylistForAdd)
        setAddResult({ type: 'added', name: pl.name })
      }
      setMode('results')
    }
  }, { isActive: mode === 'addToPlaylist' })

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const footerText =
    mode === 'addToPlaylist' ? `up/down navigate  Enter add  Esc cancel` :
    mode === 'results'       ? `up/down navigate  Enter play  a add to playlist  Esc back` :
                               `Enter search  Esc back`

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Header description="Search for YouTube music" />

      <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={1} gap={1}>
        {mode === 'input' ? (
          <Box gap={1}>
            <Text color="green">Search:</Text>
            <TextInput
              value={query}
              onChange={setQuery}
              onSubmit={runSearch}
              placeholder="type to search YouTube Music..."
            />
          </Box>
        ) : (
          <Box gap={1}>
            <Text color="gray">Query:</Text>
            <Text>{query}</Text>
          </Box>
        )}

        {loading && <Text color="yellow">Searching...</Text>}
        {error && <Text color="red">{error}</Text>}

        {mode === 'results' && results.length === 0 && !loading && (
          <Text color="gray">No results found.</Text>
        )}

        {(mode === 'results' || mode === 'addToPlaylist') && (
          <>
            {scrollOffset > 0 && (
              <Text color="gray">  ↑ {scrollOffset} more above</Text>
            )}
            {results.slice(scrollOffset, scrollOffset + visibleCount).map((track, vi) => {
              const i = scrollOffset + vi
              return (
                <Box key={track.youtubeId ?? i} gap={1}>
                  <Text color={i === selected ? 'green' : 'gray'}>
                    {i === selected ? '>' : ' '}
                  </Text>
                  <Text color={i === selected && mode === 'results' ? 'white' : 'gray'} bold={i === selected && mode === 'results'}>
                    {track.title.length > 40 ? track.title.slice(0, 37) + '...' : track.title}
                  </Text>
                  <Text color="gray">{track.artist}</Text>
                  <Text color="gray">{formatDuration(track.duration)}</Text>
                  {track.ago && <Text color="gray">{track.ago}</Text>}
                </Box>
              )
            })}
            {scrollOffset + visibleCount < results.length && (
              <Text color="gray">  ↓ {results.length - scrollOffset - visibleCount} more below</Text>
            )}
          </>
        )}

        {addResult && mode === 'results' && (
          <Text color={addResult.type === 'added' ? 'green' : 'yellow'}>
            {addResult.type === 'added'
              ? `Added to "${addResult.name}"!`
              : `Already in "${addResult.name}".`}
          </Text>
        )}

        {mode === 'addToPlaylist' && (
          <Box flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={1} marginTop={1}>
            <Text color="yellow">Add to playlist:</Text>
            {playlists.map((pl, i) => (
              <Text
                key={pl.name}
                color={i === selectedPlaylistForAdd ? 'black' : 'white'}
                backgroundColor={i === selectedPlaylistForAdd ? 'yellow' : undefined}
              >
                {` ${pl.name.padEnd(22)} ${pl.tracks.length} tracks`}
              </Text>
            ))}
          </Box>
        )}
      </Box>

      <MiniPlayer activeTrack={miniPlayer.activeTrack} status={miniPlayer.status} />
      <MiniTimer timeLeft={miniTimer.timeLeft} status={miniTimer.status} />
      <Footer description={footerText} />
    </Box>
  )
}

export default SearchPage
