import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import { Track } from '../types.js'
import Header from '../components/Header.js'
import MiniTimer from '../components/MiniTimer.js'
import { Playlist } from './LibraryPage.js'
import { PlaybackState, PlaybackActions } from '../hooks/usePlayback.js'
import { PomodoroStatus } from '../hooks/usePomodoro.js'

interface Props {
  playbackState: PlaybackState
  playbackActions: PlaybackActions
  repeat: boolean
  shuffle: boolean
  autoplayNext: boolean
  playlists: Playlist[]
  onAddToPlaylist: (track: Track, playlistIndex: number) => void
  onBack: () => void
  miniTimer: { timeLeft: number; status: PomodoroStatus }
}

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

const progressBar = (current: number, total: number, width = 32) => {
  if (total === 0) return '-'.repeat(width)
  const filled = Math.min(Math.floor((current / total) * width), width - 1)
  return '='.repeat(filled) + 'O' + '-'.repeat(Math.max(0, width - filled - 1))
}

const NowPlayingPage = ({
  playbackState,
  playbackActions,
  repeat,
  shuffle,
  autoplayNext,
  playlists,
  onAddToPlaylist,
  onBack,
  miniTimer,
}: Props) => {
  const { activeTrack, nextTrack, status, progress, error, queue } = playbackState
  const [showPicker, setShowPicker] = useState(false)
  const [selectedPlaylistForAdd, setSelectedPlaylistForAdd] = useState(0)
  const [addResult, setAddResult] = useState<{ type: 'added' | 'duplicate'; name: string } | null>(null)

  useInput((input, key) => {
    if (key.escape) { onBack(); return }
    if (input === ' ') {
      if (status === 'playing') playbackActions.pause()
      else if (status === 'paused') playbackActions.resume()
    }
    if (input === 'r' && (status === 'ended' || status === 'paused' || status === 'playing')) {
      playbackActions.restart()
    }
    if (input === 'n' && queue.length > 1) {
      playbackActions.next()
    }
    if (input === 'a' && activeTrack) {
      setSelectedPlaylistForAdd(0)
      setAddResult(null)
      setShowPicker(true)
    }
    if (key.leftArrow)  playbackActions.seek(-10)
    if (key.rightArrow) playbackActions.seek(10)
  }, { isActive: !showPicker })

  useInput((_input, key) => {
    if (key.escape)    { setShowPicker(false); return }
    if (key.upArrow)   setSelectedPlaylistForAdd(prev => (prev - 1 + playlists.length) % playlists.length)
    if (key.downArrow) setSelectedPlaylistForAdd(prev => (prev + 1) % playlists.length)
    if (key.return && activeTrack) {
      const pl = playlists[selectedPlaylistForAdd]
      const isDuplicate = pl.tracks.some(t =>
        t.youtubeId ? t.youtubeId === activeTrack.youtubeId : t.title === activeTrack.title
      )
      if (isDuplicate) {
        setAddResult({ type: 'duplicate', name: pl.name })
      } else {
        onAddToPlaylist(activeTrack, selectedPlaylistForAdd)
        setAddResult({ type: 'added', name: pl.name })
      }
      setShowPicker(false)
    }
  }, { isActive: showPicker })

  const statusLabel =
    status === 'loading' ? '  >> LOADING...' :
    status === 'playing' ? '  >> PLAYING' :
    status === 'paused'  ? '  || PAUSED ' :
    status === 'ended'   ? '  [] ENDED  ' :
    status === 'idle'    ? '  -- IDLE   ' :
                           '  !! ERROR  '

  const statusColor =
    status === 'playing' ? 'green' :
    status === 'paused'  ? 'yellow' :
    status === 'error'   ? 'red' : 'gray'

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Header description="Now playing" />

      <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={2} paddingY={1} gap={1}>
        {!activeTrack ? (
          <Text color="gray">No track selected. Go to Search or Library.</Text>
        ) : (
          <>
            <Box flexDirection="column">
              <Text color="green" bold>{activeTrack.title}</Text>
              <Text color="gray">{activeTrack.artist}</Text>
            </Box>

            {status === 'loading' && <Text color="yellow">Connecting to YouTube...</Text>}

            {(status === 'playing' || status === 'paused') && (
              <Box flexDirection="column">
                <Text color="green">[{progressBar(progress, activeTrack.duration)}]</Text>
                <Box>
                  <Text color="gray">{fmt(progress)}</Text>
                  <Text color="gray">{'                                '.slice(0, 28)}</Text>
                  <Text color="gray">{fmt(activeTrack.duration)}</Text>
                </Box>
              </Box>
            )}

            {status === 'ended' && <Text color="gray">Playback ended. Press r to replay.</Text>}
            {status === 'error' && <Text color="red">Error: {error}</Text>}

            <Text color={statusColor} bold>{statusLabel}</Text>

            {nextTrack && (
              <Text color="gray">Next: {nextTrack.title}</Text>
            )}

            {addResult && (
              <Text color={addResult.type === 'added' ? 'green' : 'yellow'}>
                {addResult.type === 'added'
                  ? `Added to "${addResult.name}"!`
                  : `Already in "${addResult.name}".`}
              </Text>
            )}

            {showPicker && (
              <Box flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={1}>
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
          </>
        )}

        <Box flexDirection="column">
          <Text color="gray">Repeat: {repeat ? 'ON' : 'OFF'}</Text>
          <Text color="gray">Shuffle: {shuffle ? 'ON' : 'OFF'}</Text>
          <Text color="gray">Autoplay next: {autoplayNext ? 'ON' : 'OFF'}</Text>
        </Box>
      </Box>

      <MiniTimer timeLeft={miniTimer.timeLeft} status={miniTimer.status} />
      <Text color="gray">
        {showPicker
          ? `[↑][↓] navigate  [Enter] add  [Esc] cancel`
          : `[Space] pause/play  [r] restart  [←][→] seek ±10s  ${queue.length > 1 ? '[n] next  ' : ''}[a] add  [Esc] back`}
      </Text>
    </Box>
  )
}

export default NowPlayingPage
