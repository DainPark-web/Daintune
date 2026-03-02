import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import Header from '../components/Header.js'
import Footer from '../components/Footer.js'
import MiniPlayer from '../components/MiniPlayer.js'
import { PomodoroState, PomodoroActions } from '../hooks/usePomodoro.js'
import { Track } from '../types.js'
import { PlaybackStatus } from '../hooks/usePlayback.js'

const DURATION_OPTIONS = [5, 10, 25, 45, 60]

interface Props {
  pomodoroState: PomodoroState
  pomodoroActions: PomodoroActions
  miniPlayer: { activeTrack: Track | null; status: PlaybackStatus }
  onBack: () => void
}

const fmt = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const ProgressBar = ({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) => {
  const width = 20
  const filled = totalTime > 0 ? Math.round((timeLeft / totalTime) * width) : 0
  const bar = '='.repeat(filled) + '-'.repeat(width - filled)
  return <Text color="cyan">[{bar}]</Text>
}

const PomodoroPage = ({ pomodoroState, pomodoroActions, miniPlayer, onBack }: Props) => {
  const { status, timeLeft, totalTime } = pomodoroState
  const [selected, setSelected] = useState(2) // default: 25min

  // idle screen
  useInput((_input, key) => {
    if (key.escape)    { onBack(); return }
    if (key.upArrow)   setSelected(s => Math.max(0, s - 1))
    if (key.downArrow) setSelected(s => Math.min(DURATION_OPTIONS.length - 1, s + 1))
    if (key.return)    pomodoroActions.start(DURATION_OPTIONS[selected])
  }, { isActive: status === 'idle' })

  // running / paused screen
  useInput((input, key) => {
    if (key.escape)     { onBack(); return }
    if (input === ' ')  { status === 'running' ? pomodoroActions.pause() : pomodoroActions.resume() }
    if (input === 'r')  pomodoroActions.reset()
  }, { isActive: status === 'running' || status === 'paused' })

  // done screen
  useInput((input, key) => {
    if (key.escape)    { onBack(); return }
    if (input === 'r') pomodoroActions.reset()
  }, { isActive: status === 'done' })

  const renderIdle = () => (
    <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={1} paddingY={1} gap={1}>
      <Text color="green">Select duration:</Text>
      {DURATION_OPTIONS.map((min, i) => (
        <Box key={min}>
          <Text
            color={i === selected ? 'black' : 'white'}
            backgroundColor={i === selected ? 'cyan' : undefined}
            bold={i === selected}
          >
            {` ${String(min).padStart(2)} min `}
          </Text>
        </Box>
      ))}
    </Box>
  )

  const renderTimer = () => (
    <Box flexDirection="column" borderStyle="round" borderColor={status === 'paused' ? 'yellow' : 'cyan'} paddingX={2} paddingY={1} gap={1} alignItems="center">
      <Text color={status === 'paused' ? 'yellow' : 'cyan'} bold>{fmt(timeLeft)}</Text>
      <ProgressBar timeLeft={timeLeft} totalTime={totalTime} />
      <Text color="gray">
        {status === 'paused' ? '(paused)' : 'running...'}
      </Text>
    </Box>
  )

  const renderDone = () => (
    <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={2} paddingY={1} gap={1} alignItems="center">
      <Text color="green" bold>00:00</Text>
      <Text color="green" bold>Done!</Text>
    </Box>
  )

  const footerText =
    status === 'idle'    ? `up/down navigate  Enter start  Esc back` :
    status === 'running' ? `Space pause  r reset  Esc back` :
    status === 'paused'  ? `Space resume  r reset  Esc back` :
                           `r restart  Esc back`

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Header description="Pomodoro Timer" />

      {status === 'idle'                   && renderIdle()}
      {(status === 'running' || status === 'paused') && renderTimer()}
      {status === 'done'                   && renderDone()}

      <MiniPlayer activeTrack={miniPlayer.activeTrack} status={miniPlayer.status} />
      <Footer description={footerText} />
    </Box>
  )
}

export default PomodoroPage
