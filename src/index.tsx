import React from 'react'
import { render, Text, Box } from 'ink'

const App = () => (
  <Box flexDirection="column" padding={1}>
    <Text color="green" bold>🎵 gmusic</Text>
    <Text color="gray">YouTube Music CLI Player</Text>
  </Box>
)

render(<App />)
