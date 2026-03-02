import React from 'react'
import { Box, Text } from 'ink'
import { PomodoroStatus } from '../hooks/usePomodoro.js'

interface Props {
  timeLeft: number
  status: PomodoroStatus
}

const fmt = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const MiniTimer = ({ timeLeft, status }: Props) => {
  if (status === 'idle') return null

  const icon =
    status === 'running' ? '[T]' :
    status === 'paused'  ? '[P]' : '[!]'

  const color =
    status === 'running' ? 'cyan' :
    status === 'paused'  ? 'yellow' : 'green'

  const label =
    status === 'running' ? `${fmt(timeLeft)} left` :
    status === 'paused'  ? `${fmt(timeLeft)} (paused)` : 'Done!'

  return (
    <Box borderStyle="single" borderColor={color} paddingX={1}>
      <Text color={color}>{icon} </Text>
      <Text color="white" bold>{label}</Text>
      <Text color="gray">  [menu → Pomodoro]</Text>
    </Box>
  )
}

export default MiniTimer
