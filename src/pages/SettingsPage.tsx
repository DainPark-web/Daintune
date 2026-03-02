import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MiniPlayer from '../components/MiniPlayer.js'
import MiniTimer from '../components/MiniTimer.js'
import { PlaybackStatus } from '../hooks/usePlayback.js'
import { PomodoroStatus } from '../hooks/usePomodoro.js'
import { Track } from '../types.js'

export interface Setting {
  label: string
  value: boolean
}

export const INITIAL_SETTINGS: Setting[] = [
  { label: 'Autoplay next track', value: true },
  { label: 'Shuffle',             value: false },
  { label: 'Repeat',              value: false },
]

interface Props {
  settings: Setting[]
  onToggle: (index: number) => void
  onBack: () => void
  miniPlayer: { activeTrack: Track | null; status: PlaybackStatus }
  miniTimer: { timeLeft: number; status: PomodoroStatus }
}

const SettingsPage = ({ settings, onToggle, onBack, miniPlayer, miniTimer }: Props) => {
  const [selected, setSelected] = useState(0)

  useInput((_, key) => {
    if (key.escape)    onBack()
    if (key.upArrow)   setSelected(prev => (prev - 1 + settings.length) % settings.length)
    if (key.downArrow) setSelected(prev => (prev + 1) % settings.length)
    if (key.return)    onToggle(selected)
  })

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Header description="Settings" />

      <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={1}>
        {settings.map((setting, i) => {
          const isSelected = i === selected
          return (
            <Box key={setting.label} gap={1}>
              <Text
                color={isSelected ? 'black' : 'white'}
                backgroundColor={isSelected ? 'green' : undefined}
              >
                {` ${setting.label.padEnd(22)}`}
              </Text>
              <Text color={setting.value ? 'green' : 'gray'}>
                {setting.value ? '[ON] ' : '[OFF]'}
              </Text>
            </Box>
          )
        })}
      </Box>

      <MiniPlayer activeTrack={miniPlayer.activeTrack} status={miniPlayer.status} />
      <MiniTimer timeLeft={miniTimer.timeLeft} status={miniTimer.status} />
      <Footer description={`up/down navigate\nEnter toggle\n"Esc" back`} />
    </Box>
  )
}

export default SettingsPage
