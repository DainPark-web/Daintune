import React from 'react'
import { Box, Text } from 'ink'
import { Track } from '../types.js'
import { PlaybackStatus } from '../hooks/usePlayback.js'

interface Props {
  activeTrack: Track | null
  status: PlaybackStatus
}

const MiniPlayer = ({ activeTrack, status }: Props) => {
  if (status === 'idle' || !activeTrack) return null

  const icon =
    status === 'playing' ? '|>' :
    status === 'paused'  ? '||' :
    status === 'loading' ? '..' :
    status === 'ended'   ? '[]' : '!!'

  const color =
    status === 'playing' ? 'green' :
    status === 'paused'  ? 'yellow' :
    status === 'error'   ? 'red' : 'gray'

  const title = activeTrack.title.length > 32
    ? activeTrack.title.slice(0, 29) + '...'
    : activeTrack.title

  return (
    <Box borderStyle="single" borderColor={color} paddingX={1}>
      <Text color={color}>{icon} </Text>
      <Text color="white" bold>{title}</Text>
      <Text color="gray">  {activeTrack.artist}</Text>
      <Text color="gray">  [menu → Now Playing]</Text>
    </Box>
  )
}

export default MiniPlayer
