import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'

interface Setting {
  label: string
  value: boolean
}

const INITIAL_SETTINGS: Setting[] = [
  { label: 'Autoplay next track', value: true  },
  { label: 'Shuffle',             value: false },
  { label: 'Repeat',              value: false },
  { label: 'Show lyrics',         value: true  },
]

interface Props {
  onBack: () => void
}

const SettingsPage = ({ onBack }: Props) => {
  const [selected, setSelected] = useState(0)
  const [settings, setSettings] = useState(INITIAL_SETTINGS)

  useInput((_, key) => {
    if (key.escape)    onBack()
    if (key.upArrow)   setSelected(prev => (prev - 1 + settings.length) % settings.length)
    if (key.downArrow) setSelected(prev => (prev + 1) % settings.length)
    if (key.return) {
      setSettings(prev =>
        prev.map((s, i) => i === selected ? { ...s, value: !s.value } : s)
      )
    }
  })

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Box gap={1}>
        <Text color="green" bold>gmusic</Text>
        <Text color="gray">/ Settings</Text>
      </Box>

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

      <Text color="gray">up/down navigate  Enter toggle  Esc back</Text>
    </Box>
  )
}

export default SettingsPage
