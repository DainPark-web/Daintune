import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { Track } from '../types.js'

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

const NowPlayingPage = ({ track, onBack }: Props) => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)

  // 곡이 바뀌면 초기화
  useEffect(() => {
    setProgress(0)
    setIsPlaying(true)
  }, [track?.title])

  // 1초마다 진행
  useEffect(() => {
    if (!isPlaying || !track) return
    const id = setInterval(() => {
      setProgress(prev => {
        if (prev >= track.duration) { clearInterval(id); return prev }
        return prev + 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isPlaying, track])

  useInput((input, key) => {
    if (key.escape)    onBack()
    if (input === ' ') setIsPlaying(prev => !prev)
    if (input === 'r') { setProgress(0); setIsPlaying(true) }
  })

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Box gap={1}>
        <Text color="green" bold>gmusic</Text>
        <Text color="gray">/ Now Playing</Text>
      </Box>

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
            {/* 곡 정보 */}
            <Box flexDirection="column">
              <Text color="green" bold>{track.title}</Text>
              <Text color="gray">{track.artist}</Text>
            </Box>

            {/* 프로그레스 바 */}
            <Box flexDirection="column">
              <Text color="green">[{progressBar(progress, track.duration)}]</Text>
              <Box>
                <Text color="gray">{fmt(progress)}</Text>
                <Text color="gray">
                  {'                                '.slice(0, 28)}
                </Text>
                <Text color="gray">{fmt(track.duration)}</Text>
              </Box>
            </Box>

            {/* 재생 상태 */}
            <Box>
              <Text color={isPlaying ? 'green' : 'yellow'} bold>
                {isPlaying ? '  >> PLAYING' : '  || PAUSED '}
              </Text>
            </Box>
          </>
        )}
      </Box>

      <Text color="gray">Space pause/play  r restart  Esc back</Text>
    </Box>
  )
}

export default NowPlayingPage
