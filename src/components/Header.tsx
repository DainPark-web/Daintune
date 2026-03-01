import { Box, Text } from "ink"
import React from "react"


const Header = ({ description }: { description: string }) => {
  return (
    <Box flexDirection="column" gap={1}>
    <Text color="green" bold>Daintune</Text>
    <Text color="gray">{description}</Text>
  </Box>
  )
}

export default Header