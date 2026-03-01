import React, { useState } from 'react'
import { Box, Text, useInput, useApp } from 'ink'
import { Page } from '../types.js'
import Footer from '../components/Footer.js'
import defaultInput from '../hooks/defaultInput.ts'
import Header from '../components/Header.tsx'

interface Props {
  onNavigate: (page: Page) => void
}
const MENU_ITEMS: { label: string; icon: string; page: Page | null }[] = [
  { label: 'Search',      icon: '/', page: 'search' },
  { label: 'Library',     icon: '#', page: 'library' },
  { label: 'Now Playing', icon: '>', page: 'nowPlaying' },
  { label: 'Settings',    icon: '*', page: 'settings' },
  { label: 'Quit',        icon: 'x', page: null },
]

const MenuPage = ({ onNavigate }: Props) => {
  const { exit } = useApp()
  const [selected, setSelected] = useState(0)

  defaultInput({ selected, setSelected, items: MENU_ITEMS, onNavigate, exit })



  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Header description="Choose an option" />

      <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={1}>
        <MenuItems selected={selected} />
      </Box>

      <Footer />
    </Box>
  )
}


const MenuItems = ({ selected }: { selected: number }) => {
  return MENU_ITEMS.map((item, i) => {
    const isSelected = i === selected
    return <MenuItem key={item.label} item={item} isSelected={isSelected} />
  })
}

const MenuItem = ({ item, isSelected }: { item: { label: string; icon: string; page: Page | null }, isSelected: boolean }) => {
  return (
    <Box key={item.label}>
      <Text color={isSelected ? 'black' : 'white'} backgroundColor={isSelected ? 'green' : undefined} bold={isSelected}>{` [${item.icon}] ${item.label.padEnd(14)}`}</Text>
    </Box>
  )
}

export default MenuPage








// import React, { useState } from 'react'
// import { Box, Text, useInput, useApp } from 'ink'
// import { Page } from '../types.js'

// const MENU_ITEMS: { label: string; icon: string; page: Page | null }[] = [
//   { label: 'Search',      icon: '/', page: 'search' },
//   { label: 'Library',     icon: '#', page: 'library' },
//   { label: 'Now Playing', icon: '>', page: 'nowPlaying' },
//   { label: 'Settings',    icon: '*', page: 'settings' },
//   { label: 'Quit',        icon: 'x', page: null },
// ]

// interface Props {
//   onNavigate: (page: Page) => void
// }

// const MenuPage = ({ onNavigate }: Props) => {
//   const { exit } = useApp()
//   const [selected, setSelected] = useState(0)

//   useInput((input, key) => {
//     if (key.upArrow)   setSelected(prev => (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length)
//     if (key.downArrow) setSelected(prev => (prev + 1) % MENU_ITEMS.length)
//     if (key.return) {
//       const item = MENU_ITEMS[selected]
//       if (item.page) onNavigate(item.page)
//       else exit()
//     }
//     if (input.toLowerCase() === 'q') exit()
//   })

//   return (
//     <Box flexDirection="column" padding={1} gap={1}>
//       <Box flexDirection="column">
//         <Text color="green" bold>gmusic</Text>
//         <Text color="gray">YouTube Music CLI Player</Text>
//       </Box>

//       <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={1}>
//         {MENU_ITEMS.map((item, i) => {
//           const isSelected = i === selected
//           return (
//             <Box key={item.label}>
//               <Text
//                 color={isSelected ? 'black' : 'white'}
//                 backgroundColor={isSelected ? 'green' : undefined}
//                 bold={isSelected}
//               >
//                 {` [${item.icon}] ${item.label.padEnd(14)}`}
//               </Text>
//             </Box>
//           )
//         })}
//       </Box>

//       <Text color="gray">up/down navigate  Enter select  q quit</Text>
//     </Box>
//   )
// }

// export default MenuPage
