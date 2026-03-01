import { Box, Text } from "ink"
import React from "react"

const LOGO = [
  ` ____        _       _                   `,
  `|  _ \\  __ _(_)_ __ | |_ _   _ _ __   ___`,
  `| | | |/ _\` | | '_ \\| __| | | | '_ \\ / _ \\`,
  `| |_| | (_| | | | | | |_| |_| | | | |  __/`,
  `|____/ \\__,_|_|_| |_|\\__|\\__,_|_| |_|\\___|`,
]

const Header = ({ description, showLogo = false }: { description: string; showLogo?: boolean }) => {
  return (
    <Box flexDirection="column">
      {showLogo
        ? LOGO.map((line, i) => <Text key={i} color="green" bold>{line}</Text>)
        : <Text color="green" bold> Daintune</Text>
      }
      <Text color="gray"> ── {description}</Text>
    </Box>
  )
}

export default Header
