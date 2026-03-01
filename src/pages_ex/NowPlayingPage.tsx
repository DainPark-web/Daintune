import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { Track } from '../types.js'
import { startPlayback, stopPlayback, pausePlayback, resumePlayback } from '../player.js'
import Header from '../components/Header.js'
interface Props {
  track: Track | null
  onBack: () => void
}

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

const progressBar = (current: number, total: number, width = 32) => {
  if (total === 0) return '-'.repeat(width)
  const filled = Math.min(Math.floor((current / total) * width), width - 1)
  return '='.repeat(filled) + 'O' + '-'.repeat(Math.max(0, width - filled - 1))
}

type Status = 'loading' | 'playing' | 'paused' | 'ended' | 'error'

const NowPlayingPage = ({ track, onBack }: Props) => {
  const [status, setStatus] = useState<Status>('loading')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!track?.youtubeId) return

    setStatus('loading')
    setProgress(0)
    setError(null)

    startPlayback(track.youtubeId, {
      onPosition: (pos) => {
        setProgress(pos)
        setStatus((s) => (s === 'loading' ? 'playing' : s))
      },
      onEnd: () => setStatus('ended'),
      onError: (msg) => {
        setError(msg)
        setStatus('error')
      },
    }).catch((e: Error) => {
      setError(e.message)
      setStatus('error')
    })

    return () => stopPlayback()
  }, [track?.youtubeId])

  useInput((input, key) => {
    if (key.escape) {
      stopPlayback()
      onBack()
    }
    if (input === ' ') {
      if (status === 'playing') {
        pausePlayback()
        setStatus('paused')
      } else if (status === 'paused') {
        resumePlayback()
        setStatus('playing')
      }
    }
    if (input === 'r' && (status === 'ended' || status === 'paused' || status === 'playing')) {
      setProgress(0)
      setStatus('loading')
      if (track?.youtubeId) {
        startPlayback(track.youtubeId, {
          onPosition: (pos) => {
            setProgress(pos)
            setStatus((s) => (s === 'loading' ? 'playing' : s))
          },
          onEnd: () => setStatus('ended'),
          onError: (msg) => { setError(msg); setStatus('error') },
        }).catch((e: Error) => { setError(e.message); setStatus('error') })
      }
    }
  })

  const statusLabel =
    status === 'loading' ? '  >> LOADING...' :
    status === 'playing' ? '  >> PLAYING' :
    status === 'paused'  ? '  || PAUSED ' :
    status === 'ended'   ? '  [] ENDED  ' :
                           '  !! ERROR  '

  const statusColor =
    status === 'playing' ? 'green' :
    status === 'paused'  ? 'yellow' :
    status === 'error'   ? 'red' : 'gray'

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Header description="Now playing" />
     

      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="green"
        paddingX={2}
        paddingY={1}
        gap={1}
      >
        {!track ? (
          <Text color="gray">No track selected. Go to Search or Library.</Text>
        ) : (
          <>
            <Box flexDirection="column">
              <Text color="green" bold>{track.title}</Text>
              <Text color="gray">{track.artist}</Text>
            </Box>

            {status === 'loading' && (
              <Text color="yellow">Connecting to YouTube...</Text>
            )}

            {(status === 'playing' || status === 'paused') && (
              <Box flexDirection="column">
                <Text color="green">[{progressBar(progress, track.duration)}]</Text>
                <Box>
                  <Text color="gray">{fmt(progress)}</Text>
                  <Text color="gray">{'                                '.slice(0, 28)}</Text>
                  <Text color="gray">{fmt(track.duration)}</Text>
                </Box>
              </Box>
            )}

            {status === 'ended' && <Text color="gray">Playback ended. Press r to replay.</Text>}
            {status === 'error' && <Text color="red">Error: {error}</Text>}

            <Text color={statusColor} bold>{statusLabel}</Text>
          </>
        )}
      </Box>

      <Text color="gray">Space pause/play  r restart  Esc back</Text>
    </Box>
  )
}

export default NowPlayingPage
