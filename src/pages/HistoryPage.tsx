import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { Track, HistoryEntry } from '../types.js'
import Header from '../components/Header.js'
import Footer from '../components/Footer.js'
import MiniPlayer from '../components/MiniPlayer.js'
import MiniTimer from '../components/MiniTimer.js'
import { PlaybackStatus } from '../hooks/usePlayback.js'
import { PomodoroStatus } from '../hooks/usePomodoro.js'

interface Props {
  history: HistoryEntry[]
  onClear: () => void
  onPlay: (track: Track) => void
  onBack: () => void
  miniPlayer: { activeTrack: Track | null; status: PlaybackStatus }
  miniTimer: { timeLeft: number; status: PomodoroStatus }
}

const timeAgo = (ts: number): string => {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60)    return `${diff}초 전`
  if (diff < 3600)  return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

const HistoryPage = ({ history, onClear, onPlay, onBack, miniPlayer, miniTimer }: Props) => {
  const [selected, setSelected] = useState(0)
  const [confirmClear, setConfirmClear] = useState(false)
  const [scrollOffset, setScrollOffset] = useState(0)

  const termRows = process.stdout.rows || 24
  const miniPlayerRows = (miniPlayer.status !== 'idle' && miniPlayer.activeTrack) ? 4 : 0
  const miniTimerRows  = miniTimer.status !== 'idle' ? 4 : 0
  // Each track item: 2 lines (title + artist/time). Overhead: padding(2) + header(2) + border+paddingY(4) + footer(1) + buffer(3) = 12
  const visibleCount = Math.min(8, Math.max(2, Math.floor((termRows - 12 - miniPlayerRows - miniTimerRows) / 2)))

  useEffect(() => {
    if (selected < scrollOffset) {
      setScrollOffset(selected)
    } else if (selected >= scrollOffset + visibleCount) {
      setScrollOffset(selected - visibleCount + 1)
    }
  }, [selected, visibleCount])

  useInput((input, key) => {
    if (confirmClear) {
      if (input === 'y') { onClear(); setConfirmClear(false); setSelected(0); setScrollOffset(0) }
      if (input === 'n' || key.escape) setConfirmClear(false)
      return
    }

    if (history.length > 0) {
      if (key.upArrow)   setSelected(prev => (prev - 1 + history.length) % history.length)
      if (key.downArrow) setSelected(prev => (prev + 1) % history.length)
      if (key.return)    onPlay(history[selected].track)
    }
    if (input === 'c') setConfirmClear(true)
    if (key.escape)    onBack()
  })

  const visible = history.slice(scrollOffset, scrollOffset + visibleCount)

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Header description="History" />

      <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={1} paddingY={1}>
        {history.length === 0 ? (
          <Text color="gray">  No history yet. Play some tracks!</Text>
        ) : (
          <>
            {scrollOffset > 0 && (
              <Text color="gray">  ↑ {scrollOffset} more above</Text>
            )}
            {visible.map((entry, vi) => {
              const i = scrollOffset + vi
              const isSelected = i === selected
              return (
                <Box key={i} flexDirection="column">
                  <Text
                    color={isSelected ? 'black' : 'white'}
                    backgroundColor={isSelected ? 'green' : undefined}
                  >
                    {` ${(i + 1).toString().padStart(2)}. ${entry.track.title}`}
                  </Text>
                  <Text color={isSelected ? 'black' : 'gray'} backgroundColor={isSelected ? 'green' : undefined}>
                    {`     ${entry.track.artist} · ${timeAgo(entry.playedAt)}`}
                  </Text>
                </Box>
              )
            })}
            {scrollOffset + visibleCount < history.length && (
              <Text color="gray">  ↓ {history.length - scrollOffset - visibleCount} more below</Text>
            )}
          </>
        )}

        {confirmClear && (
          <Box gap={2} marginTop={1}>
            <Text color="red">Clear all history?</Text>
            <Text color="yellow">[y] Yes  [n] No</Text>
          </Box>
        )}
      </Box>

      <MiniPlayer activeTrack={miniPlayer.activeTrack} status={miniPlayer.status} />
      <MiniTimer timeLeft={miniTimer.timeLeft} status={miniTimer.status} />
      <Footer description={`up/down navigate  Enter play  c clear  Esc back`} />
    </Box>
  )
}

export default HistoryPage
